import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { listWorkshop2B2bTerritories } from '@/lib/server/workshop2-b2b-territory-repository';
import { listWorkshop2B2bOrdersAll } from '@/lib/server/workshop2-b2b-orders-repository';
import { evaluateWorkshop2B2bCreditHold } from '@/lib/production/workshop2-b2b-credit-hold';
import { buildWorkshop2B2bCreditScoreRows } from '@/lib/production/workshop2-b2b-credit-scoring';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'B2B — credit hold и скоринг',
};

/** Wave 24–26: dashboard credit/territory + эвристический score 0–100. */
export default async function BrandB2bCreditPage() {
  const territories = await listWorkshop2B2bTerritories();
  const orders = await listWorkshop2B2bOrdersAll();
  const creditEnv = { WORKSHOP2_B2B_CREDIT_HOLD: 'true' };
  const scoreRows = buildWorkshop2B2bCreditScoreRows({ territories, orders, env: creditEnv });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">B2B — credit hold и скоринг</h1>
        <p className="mt-2 text-sm text-slate-600">
          Территории, hold и эвристический score 0–100 по open orders. Checkout блокируется при
          превышении лимита.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Advanced credit scoring</CardTitle>
          <CardDescription>
            Эвристика по orders repo + hold history — suggested limit ₽ (не внешний bureau).
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="b2b-credit-scoring-table">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="p-2">Байер</th>
                <th className="p-2">Территория</th>
                <th className="p-2">Score</th>
                <th className="p-2">Hold</th>
                <th className="p-2">Suggested limit ₽</th>
              </tr>
            </thead>
            <tbody>
              {scoreRows.map((row) => (
                <tr key={row.territoryId} className="border-t">
                  <td className="p-2 font-medium">{row.buyerName}</td>
                  <td className="p-2">
                    <div>{row.territoryLabelRu}</div>
                    <div className="text-[10px] text-slate-500">{row.territoryId}</div>
                  </td>
                  <td className="p-2">
                    <Badge
                      variant={
                        row.score >= 70 ? 'default' : row.score >= 40 ? 'secondary' : 'destructive'
                      }
                      className="text-[10px]"
                    >
                      {row.score}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant={row.onHold ? 'destructive' : 'default'} className="text-[10px]">
                      {row.onHold ? 'да' : 'нет'}
                    </Badge>
                  </td>
                  <td className="p-2">{row.suggestedLimitRub.toLocaleString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Территории</CardTitle>
          <CardDescription>
            CRUD:{' '}
            <Link href="/brand/b2b/territories" className="text-indigo-600 underline">
              /brand/b2b/territories
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="p-2">Территория</th>
                <th className="p-2">Лимит ₽</th>
                <th className="p-2">Открытые заказы ₽</th>
                <th className="p-2">Доступно ₽</th>
                <th className="p-2">Hold</th>
              </tr>
            </thead>
            <tbody>
              {territories.map((t) => {
                const probe = evaluateWorkshop2B2bCreditHold({
                  territoryId: t.territoryId,
                  orderTotalRub: t.openOrdersRub + 1,
                  accounts: territories,
                  env: creditEnv,
                });
                const available = t.creditLimitRub - t.openOrdersRub;
                const onHold = !probe.allowed && probe.exceeded;
                return (
                  <tr key={t.territoryId} className="border-t">
                    <td className="p-2">
                      <div className="font-medium">{t.labelRu}</div>
                      <div className="text-[10px] text-slate-500">{t.territoryId}</div>
                    </td>
                    <td className="p-2">{t.creditLimitRub.toLocaleString('ru-RU')}</td>
                    <td className="p-2">{t.openOrdersRub.toLocaleString('ru-RU')}</td>
                    <td className="p-2">{available.toLocaleString('ru-RU')}</td>
                    <td className="p-2">
                      <Badge variant={onHold ? 'destructive' : 'default'} className="text-[10px]">
                        {onHold ? 'hold' : 'ok'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
