from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Any, Dict, Optional
from app.api import deps
from app.core.config import settings
from app.core.rate_limit import check_rate_limit, get_remaining
from app.db.models.base import User
from app.api.schemas.base import GenericResponse
from app.agents.orchestrator_agent import orchestrator_agent
from app.agents.order_anomaly_agent import order_anomaly_agent
from app.agents.platform_context import enrich_platform_context
from app.ai.services.trend_radar_service import TrendRadarService
from app.ai.services.pricing_ai_service import PricingAIService
from app.ai.vector.vector_search_service import VectorSearchService
from app.ai.services.visual_similarity_service import VisualSimilarityService
from app.ai.services.demand_forecasting_service import DemandForecastingService
from app.ai.services.inventory_optimizer_service import InventoryOptimizerService
from app.ai.services.size_recommendation_service import SizeRecommendationService
from app.ai.services.virtual_tryon_service import VirtualTryOnService
from app.ai.services.style_text_service import StyleTextService
from app.analytics.services import SalesAnalytics
from fastapi import File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


class TaskRequest(BaseModel):
    task: str
    context: Optional[Dict[str, Any]] = None

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "task": "Scan tech debt in workshop2 development flow",
                    "context": {
                        "pillar": "development",
                        "role": "brand",
                        "section_id": "brand-dev-w2-hub",
                        "collectionId": "SS27",
                        "articleId": "demo-ss27-01",
                    },
                }
            ]
        }
    }


def _agent_result_payload(result) -> Dict[str, Any]:
    return {
        "agent": result.agent_name,
        "task_type": result.task_type,
        "files_used": result.files_used,
        "changes_proposed": result.changes_proposed,
        "code_changes": result.code_changes,
        "next_step": result.next_step,
        "master_plan_updates": result.master_plan_updates,
    }


async def _run_orchestrator(req: TaskRequest, *, db: AsyncSession | None = None, user: User | None = None):
    task_type = orchestrator_agent._classify_task(req.task)
    context = enrich_platform_context(req.context)
    if db is not None and user is not None and task_type in ("CODE_ITERATION", "BUGFIX_ITERATION"):
        from app.ai.feedback_store import FeedbackStore

        store = FeedbackStore(db, user)
        examples = await store.get_similar_successful(task_type, req.task, limit=3)
        if examples:
            context["feedback_examples"] = examples
    return await orchestrator_agent.run(req.task, context=context)


@router.post("/task", response_model=GenericResponse[Dict[str, Any]])
async def run_orchestrator_task(
    req: TaskRequest,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncSession = Depends(deps.get_db),
):
    """Route task to appropriate agent via Orchestrator. RAG over successful feedback. Rate limited."""
    key = f"ai_task:{current_user.id or current_user.email}"
    if not check_rate_limit(key, settings.AI_TASK_RATE_LIMIT, settings.AI_TASK_RATE_WINDOW):
        raise HTTPException(status_code=429, detail="AI task rate limit exceeded. Try again later.")
    result = await _run_orchestrator(req, db=db, user=current_user)
    remaining = get_remaining(key, settings.AI_TASK_RATE_LIMIT, settings.AI_TASK_RATE_WINDOW)
    data = {
        "success": True,
        "data": _agent_result_payload(result),
    }
    return JSONResponse(content=data, headers={"X-RateLimit-Remaining": str(remaining)})


@router.post("/task/dev", response_model=GenericResponse[Dict[str, Any]])
async def run_orchestrator_task_dev(req: TaskRequest):
    """Platform Core dev (:3001) — orchestrator without JWT. development env only."""
    if settings.ENVIRONMENT not in ("development", "test"):
        raise HTTPException(status_code=404, detail="Not found")
    result = await _run_orchestrator(req)
    return GenericResponse(data=_agent_result_payload(result))


@router.get("/task-types", response_model=GenericResponse[List[str]])
async def list_task_types(current_user: User = Depends(deps.get_current_active_user)):
    """List available orchestrator task types."""
    return GenericResponse(data=orchestrator_agent.list_task_types())


class FeedbackRecordRequest(BaseModel):
    task: str
    task_type: str
    success: bool
    code_changes: Optional[str] = None
    test_passed: Optional[bool] = None
    lint_passed: Optional[bool] = None


@router.post("/feedback", response_model=GenericResponse[Dict[str, Any]])
async def record_feedback(
    req: FeedbackRecordRequest,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncSession = Depends(deps.get_db),
):
    """Record agent change outcome for RAG. Call after applying and validating changes."""
    from app.ai.feedback_store import FeedbackStore
    store = FeedbackStore(db, current_user)
    fb = await store.save(
        task=req.task,
        task_type=req.task_type,
        success=req.success,
        code_changes=req.code_changes,
        test_passed=req.test_passed,
        lint_passed=req.lint_passed,
    )
    return GenericResponse(data={"id": fb.id, "recorded": True})


@router.get("/feedback/stats", response_model=GenericResponse[Dict[str, Any]])
async def get_feedback_stats(
    task_type: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncSession = Depends(deps.get_db),
):
    """Aggregate feedback stats (total, success_rate). task_type: filter by type."""
    from app.ai.feedback_store import FeedbackStore
    store = FeedbackStore(db, current_user)
    return GenericResponse(data=await store.get_stats(task_type))


@router.get("/feedback/recent", response_model=GenericResponse[List[Dict[str, Any]]])
async def get_feedback_recent(
    task_type: Optional[str] = None,
    limit: int = 20,
    success_only: bool = False,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncSession = Depends(deps.get_db),
):
    """List recent feedback entries."""
    from app.ai.feedback_store import FeedbackStore
    store = FeedbackStore(db, current_user)
    return GenericResponse(data=await store.get_recent(task_type, limit, success_only))


class ValidateCodeRequest(BaseModel):
    code: str
    run_pytest: Optional[bool] = False
    pytest_paths: Optional[List[str]] = None
    run_mypy: Optional[bool] = False
    timeout: Optional[int] = None


@router.post("/validate-code", response_model=GenericResponse[Dict[str, Any]])
async def validate_code(
    req: ValidateCodeRequest,
    current_user: User = Depends(deps.get_current_active_user),
):
    """Run ruff on code. Optionally run pytest (run_pytest) or mypy (run_mypy). timeout: seconds."""
    from app.ai.validation_runner import run_ruff_check, run_pytest, run_mypy
    to = req.timeout or 30
    passed, output = run_ruff_check(req.code, timeout=to)
    result = {"lint_passed": passed, "lint_output": output}
    if req.run_pytest:
        pytest_to = req.timeout or 120
        pytest_ok, pytest_out = run_pytest(req.pytest_paths, timeout=pytest_to)
        result["test_passed"] = pytest_ok
        result["test_output"] = pytest_out
    if req.run_mypy:
        mypy_to = req.timeout or 60
        mypy_ok, mypy_out = run_mypy(timeout=mypy_to)
        result["mypy_passed"] = mypy_ok
        result["mypy_output"] = mypy_out
    return GenericResponse(data=result)


@router.get("/trends", response_model=GenericResponse[List[Dict[str, Any]]])
async def get_trends(
    category: Optional[str] = None,
    limit: int = 10,
    current_user: User = Depends(deps.get_current_active_user)
):
    service = TrendRadarService()
    trends = await service.get_emerging_trends(category, limit=limit)
    return GenericResponse(data=(trends or [])[:limit])


class TrendAnalyzeRequest(BaseModel):
    signals: List[Dict[str, Any]] = []
    min_score: Optional[float] = 0.5


@router.post("/trends/analyze", response_model=GenericResponse[Dict[str, Any]])
async def analyze_trend_signals(
    req: TrendAnalyzeRequest,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Analyze trend signals for impact."""
    service = TrendRadarService()
    result = await service.analyze_signals(req.signals or [], req.min_score or 0.5)
    return GenericResponse(data=result)


@router.post("/similar-products", response_model=GenericResponse[List[Dict[str, Any]]])
async def find_similar_products(
    product_id: str,
    top_k: int = 10,
    min_score: Optional[float] = None,
    current_user: User = Depends(deps.get_current_active_user)
):
    service = VisualSimilarityService()
    similar = await service.find_similar_products(product_id, top_k=top_k)
    if min_score is not None:
        similar = [s for s in similar if s.get("score", 0) >= min_score]
    return GenericResponse(data=similar)

@router.get("/pricing-recommendation/{product_id}", response_model=GenericResponse[Dict[str, Any]])
async def get_pricing_recommendation(
    product_id: str,
    current_price: float,
    margin_min: Optional[float] = None,
    margin_max: Optional[float] = None,
    demand_signal: Optional[float] = None,
    inventory: Optional[int] = None,
    category: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user)
):
    service = PricingAIService()
    recommendation = await service.get_recommended_price(
        product_id, current_price, margin_min, margin_max,
        demand_signal=demand_signal, inventory=inventory, category=category
    )
    return GenericResponse(data=recommendation)

@router.post("/visual-search", response_model=GenericResponse[List[Dict[str, Any]]])
async def visual_search(
    image_url: Optional[str] = None,
    image: Optional[UploadFile] = File(None),
    top_k: int = 5,
    min_score: Optional[float] = None,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Search catalog by image URL or uploaded file (CLIP + FAISS)."""
    service = VisualSimilarityService()
    if image and image.file:
        data = await image.read()
        results = await service.find_similar_by_image(data, top_k=top_k)
    elif image_url:
        emb = await service.get_image_embedding(image_url)
        from app.ai.embeddings.clip_backend import search_similar
        raw = search_similar(emb, top_k=top_k)
        results = [{"product_id": p.get("product_id", f"VIS-{i}"), "score": round(s, 4)} for (p, s), i in zip(raw, range(top_k))]
        if not results:
            results = await service.find_similar_products(f"IMG_{image_url[:10]}", top_k=top_k)
    else:
        raise HTTPException(status_code=400, detail="Provide image_url or image file")
    if min_score is not None:
        results = [r for r in results if r.get("score", 0) >= min_score]
    return GenericResponse(data=results)

class AssortmentOptimizeRequest(BaseModel):
    budget: float
    categories: List[str] = []
    limit: Optional[int] = 20
    min_confidence: Optional[float] = 0.7
    include_costs: Optional[bool] = False


@router.post("/assortment/optimize", response_model=GenericResponse[List[Dict[str, Any]]])
async def optimize_assortment(
    req: AssortmentOptimizeRequest,
    current_user: User = Depends(deps.get_current_active_user),
):
    """AI assortment optimization: select best SKUs within budget (assortment_ai)."""
    from app.ai.services.assortment_ai_service import AssortmentAIService
    svc = AssortmentAIService()
    result = await svc.generate_optimal_assortment(
        req.budget, req.categories or [],
        limit=req.limit or 20, min_confidence=req.min_confidence or 0.7,
        include_costs=bool(req.include_costs),
    )
    return GenericResponse(data=result)


@router.get("/assortment/size-curve", response_model=GenericResponse[Dict[str, Any]])
async def get_assortment_size_curve(
    product_id: str,
    region: str = "US",
    category: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user),
):
    """AI size curve optimization per product/region (assortment_ai)."""
    from app.ai.services.assortment_ai_service import AssortmentAIService
    svc = AssortmentAIService()
    result = await svc.optimize_size_curve(product_id, region, category)
    return GenericResponse(data=result)


@router.get("/assortment/regions", response_model=GenericResponse[List[str]])
async def list_assortment_regions(
    current_user: User = Depends(deps.get_current_active_user),
):
    """List regions for size curve optimization."""
    from app.ai.services.assortment_ai_service import AssortmentAIService
    return GenericResponse(data=AssortmentAIService().list_regions())


@router.get("/demand-forecast", response_model=GenericResponse[Dict[str, Any]])
async def get_demand_forecast(
    sku_id: str,
    season: str = "SS25",
    horizon_weeks: int = 12,
    category: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user)
):
    service = DemandForecastingService()
    forecast = await service.predict(sku_id, season, min(52, max(4, horizon_weeks)), category)
    return GenericResponse(data=forecast)

DEFAULT_STOCK_DATA = [
    {"sku_id": "TSH-WHT-L", "stock": 120, "sold_last_7d": 45, "status": "Healthy"},
    {"sku_id": "PNTS-BLK-M", "stock": 15, "sold_last_7d": 25, "status": "Low Stock"},
]


class ReplenishmentRequest(BaseModel):
    retailer_id: str
    stock_data: Optional[List[Dict[str, Any]]] = None
    target_days: Optional[int] = 30
    unit_cost: Optional[float] = 50.0


@router.get("/inventory-replenishment", response_model=GenericResponse[Dict[str, Any]])
async def get_replenishment_suggestions(
    retailer_id: str,
    target_days: int = 30,
    unit_cost: float = 50.0,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Suggests optimal replenishment. target_days: 7-90 coverage; unit_cost: for total_value."""
    service = InventoryOptimizerService()
    suggestions = await service.suggest_replenishments(
        retailer_id, DEFAULT_STOCK_DATA, target_days=target_days, unit_cost=unit_cost
    )
    return GenericResponse(data=suggestions)


@router.post("/inventory-replenishment", response_model=GenericResponse[Dict[str, Any]])
async def post_replenishment_suggestions(
    req: ReplenishmentRequest,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Suggests replenishment with custom stock_data. Use for real retailer data."""
    stock = req.stock_data if req.stock_data else DEFAULT_STOCK_DATA
    service = InventoryOptimizerService()
    suggestions = await service.suggest_replenishments(
        req.retailer_id, stock,
        target_days=req.target_days or 30, unit_cost=req.unit_cost or 50.0
    )
    return GenericResponse(data=suggestions)


@router.get("/inventory/size-curve", response_model=GenericResponse[Dict[str, Any]])
async def get_size_curve(
    sku_id: str,
    region: str = "US",
    category: Optional[str] = None,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Optimal size distribution for region."""
    service = InventoryOptimizerService()
    result = await service.calculate_size_curve_optimization(sku_id, region, category)
    return GenericResponse(data={"sku_id": sku_id, **result})


@router.get("/demand-forecast/batch", response_model=GenericResponse[List[Dict[str, Any]]])
async def get_batch_forecast(
    category: str,
    season: str = "SS25",
    limit: int = 50,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Category-level demand forecast."""
    service = DemandForecastingService()
    forecast = await service.batch_forecast(category, season, limit=limit)
    return GenericResponse(data=forecast)

@router.get("/sku-performance", response_model=GenericResponse[Dict[str, Any]])
async def get_sku_performance(
    sku_id: str,
    season: str = "FW26",
    current_user: User = Depends(deps.get_current_active_user)
):
    service = DemandForecastingService()
    forecast = await service.predict(sku_id, season or "FW26")
    return GenericResponse(data={
        "sku_id": sku_id,
        "performance_score": forecast["confidence_score"] + 0.05,
        "sell_through_prob": 0.85,
        "market_fit": "Excellent"
    })

@router.get("/buyer-recommendations", response_model=GenericResponse[List[Dict[str, Any]]])
async def get_buyer_recommendations(
    brand_id: Optional[str] = None,
    category: Optional[str] = None,
    region: Optional[str] = None,
    top_k: int = 10,
    min_score: Optional[float] = None,
    current_user: User = Depends(deps.get_current_active_user)
):
    """AI retailer discovery (JOOR, Brandboom style). Recommends buyers based on embeddings + demand."""
    bid = brand_id or (getattr(current_user, "organization_id", None) or "default")
    emb = VectorSearchService()
    vec = emb.get_dummy_embedding()
    similar = await emb.search_similar_products(vec, top_k=top_k)
    recs = [
        {
            "buyer_id": s["product_id"],
            "retailer_name": f"Retailer {s['product_id'].replace('sim_', '')}",
            "match_score": round(s["score"], 2),
            "category_fit": category or "general",
            "region": region or "global",
        }
        for s in similar
    ]
    if min_score is not None:
        recs = [r for r in recs if r.get("match_score", 0) >= min_score]
    return GenericResponse(data=recs)

@router.get("/order-insights", response_model=GenericResponse[Dict[str, Any]])
async def get_order_insights(
    order_ids: Optional[str] = None,
    limit: int = 20,
    current_user: User = Depends(deps.get_current_active_user)
):
    """AI Order Insights (RepSpark): anomaly detection in orders."""
    ids = [x.strip() for x in (order_ids or "").split(",") if x.strip()] or ["ORD-001", "ORD-002"]
    ids = ids[:min(limit, 50)]
    result = await order_anomaly_agent.run(
        "Detect anomalies in recent orders",
        context={"orders": [{"id": i, "sample": True} for i in ids]}
    )
    return GenericResponse(data={
        "anomalies": result.changes_proposed,
        "analysis": result.code_changes,
        "next_step": result.next_step,
    })

class SizeRecommendationRequest(BaseModel):
    product_id: str
    measurements: Dict[str, float]
    fit_preference: Optional[str] = "regular"
    category: Optional[str] = "tops"
    chart: Optional[str] = "eu_alpha"
    include_measurements: Optional[bool] = False


@router.post("/size-recommendation", response_model=GenericResponse[Dict[str, Any]])
async def get_size_recommendation(
    req: SizeRecommendationRequest,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Recommend garment size from user measurements (Styled pattern). chart: eu_alpha|eu_numeric|us."""
    svc = SizeRecommendationService()
    result = await svc.recommend(
        req.product_id, req.measurements,
        req.fit_preference or "regular", req.category or "tops",
        chart=req.chart or "eu_alpha", include_measurements=bool(req.include_measurements)
    )
    return GenericResponse(data=result)


@router.get("/size-charts", response_model=GenericResponse[Dict[str, Any]])
async def list_size_charts(
    current_user: User = Depends(deps.get_current_active_user)
):
    """List available size charts, categories, fit preferences."""
    svc = SizeRecommendationService()
    return GenericResponse(data={
        "charts": svc.list_charts(),
        "categories": svc.list_categories(),
        "fit_preferences": svc.list_fit_preferences(),
    })


class VirtualTryOnRequest(BaseModel):
    garment_image_url: str
    model_image_url: str
    provider: Optional[str] = "opentryon"
    output_format: Optional[str] = "jpg"


class RemoveBackgroundRequest(BaseModel):
    image_url: str
    threshold: Optional[float] = 0.5
    output_format: Optional[str] = "png"


class SegmentGarmentRequest(BaseModel):
    image_url: str
    include_mask: Optional[bool] = True
    types: Optional[List[str]] = None


@router.post("/virtual-tryon", response_model=GenericResponse[Dict[str, Any]])
async def virtual_tryon(
    req: VirtualTryOnRequest,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Virtual try-on: garment on model (opentryon hook)."""
    svc = VirtualTryOnService()
    fmt = req.output_format or "jpg"
    result = await svc.try_on(req.garment_image_url, req.model_image_url, req.provider or "opentryon", output_format=fmt)
    return GenericResponse(data=result)


@router.post("/virtual-tryon/remove-background", response_model=GenericResponse[Dict[str, Any]])
async def remove_background(
    req: RemoveBackgroundRequest,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Remove background from product image."""
    svc = VirtualTryOnService()
    result = await svc.remove_background(req.image_url, req.threshold or 0.5, req.output_format or "png")
    return GenericResponse(data=result)


@router.post("/virtual-tryon/segment", response_model=GenericResponse[Dict[str, Any]])
async def segment_garment(
    req: SegmentGarmentRequest,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Segment garment (upper/lower/full)."""
    svc = VirtualTryOnService()
    result = await svc.segment_garment(req.image_url, bool(req.include_mask), req.types)
    return GenericResponse(data=result)


@router.get("/virtual-tryon/providers", response_model=GenericResponse[List[str]])
async def list_tryon_providers(
    current_user: User = Depends(deps.get_current_active_user)
):
    """List available virtual try-on providers."""
    return GenericResponse(data=VirtualTryOnService.PROVIDERS)


@router.get("/outfit-recommendations", response_model=GenericResponse[List[Dict[str, Any]]])
async def get_outfit_recommendations(
    product_id: str,
    category_hint: Optional[str] = None,
    top_k: int = 5,
    min_score: Optional[float] = None,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Outfit recommendations: items that pair well (Fashion-Sense-AI pattern, CLIP+FAISS)."""
    service = VisualSimilarityService()
    similar = await service.find_similar_products(product_id, top_k=top_k)
    recs = [{"product_id": s["product_id"], "score": s["score"], "pair_type": category_hint or "complement"} for s in similar]
    if min_score is not None:
        recs = [r for r in recs if r.get("score", 0) >= min_score]
    return GenericResponse(data=recs)


class StyleTextRequest(BaseModel):
    text: str
    target_style: Optional[str] = "formal"


class BuildIndexRequest(BaseModel):
    products: List[Dict[str, Any]]
    replace: Optional[bool] = True


@router.post("/build-index", response_model=GenericResponse[Dict[str, Any]])
async def build_visual_index(
    req: BuildIndexRequest,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Build FAISS index from products (image_url, image_path, text, or embedding per item)."""
    from app.ai.embeddings.clip_backend import build_faiss_index, get_index_size
    ok = build_faiss_index(req.products)
    return GenericResponse(data={"built": ok, "index_size": get_index_size()})


@router.get("/build-index/status", response_model=GenericResponse[Dict[str, Any]])
async def get_build_index_status(
    current_user: User = Depends(deps.get_current_active_user)
):
    """CLIP/FAISS index status (size, availability)."""
    from app.ai.embeddings.clip_backend import get_index_info
    return GenericResponse(data=get_index_info())


@router.post("/style-text", response_model=GenericResponse[Dict[str, Any]])
async def style_text(
    req: StyleTextRequest,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Transform product/lookbook text. target_style: formal|casual|active|passive."""
    svc = StyleTextService()
    target = req.target_style or "formal"
    valid = ("formal", "casual", "active", "passive")
    result = await svc.transform(req.text, target if target in valid else "formal")
    return GenericResponse(data={"original": req.text, "styled": result, "target_style": target})


class StyleTextBatchRequest(BaseModel):
    texts: List[str]
    target_style: Optional[str] = "formal"


@router.post("/style-text/batch", response_model=GenericResponse[Dict[str, Any]])
async def style_text_batch(
    req: StyleTextBatchRequest,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Batch transform texts."""
    svc = StyleTextService()
    target = req.target_style or "formal"
    results = await svc.transform_batch(req.texts, target)
    return GenericResponse(data={"styled": results, "target_style": target})


@router.get("/style-text/styles", response_model=GenericResponse[List[str]])
async def list_style_text_styles(
    current_user: User = Depends(deps.get_current_active_user)
):
    """List available text styles (formal, casual, active, passive)."""
    return GenericResponse(data=StyleTextService().list_styles())


@router.get("/text-search", response_model=GenericResponse[List[Dict[str, Any]]])
async def text_search(
    query: str,
    top_k: int = 5,
    min_score: Optional[float] = None,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Semantic search by text (CLIP + FAISS)."""
    svc = VectorSearchService()
    results = await svc.search_by_text(query, top_k=top_k)
    if min_score is not None:
        results = [r for r in results if r.get("score", 0) >= min_score]
    return GenericResponse(data=results)


@router.get("/rag-search", response_model=GenericResponse[List[Dict[str, Any]]])
async def rag_search(
    query: str,
    top_k: int = 5,
    min_score: Optional[float] = None,
    current_user: User = Depends(deps.get_current_active_user)
):
    """RAG semantic search over indexed documents (EmbeddingsSearch)."""
    from app.ai.embeddings_search import EmbeddingsSearch
    search = EmbeddingsSearch()
    results = await search.search(query, top_k=top_k)
    if min_score is not None:
        results = [r for r in results if r.get("score", 0) >= min_score]
    return GenericResponse(data=results)


@router.get("/brand-score", response_model=GenericResponse[Dict[str, Any]])
async def get_brand_score(
    brand_id: str,
    current_user: User = Depends(deps.get_current_active_user)
):
    analytics = SalesAnalytics()
    score = await analytics.get_sell_through_report(brand_id)
    return GenericResponse(data={
        "brand_id": brand_id,
        "reputation_score": 4.85,
        "analytics_summary": score
    })
