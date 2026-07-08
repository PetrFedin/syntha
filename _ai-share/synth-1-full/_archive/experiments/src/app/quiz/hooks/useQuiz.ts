'use client';

import { useState } from 'react';
import { ParamKey, NormVec, QuizResult } from '../_lib/types';
import {
  buildUpgradeTips,
  calcBPI,
  getUpgradeTargetSegment,
  inferStyleArchetype,
  segmentFromBpi,
} from '../_lib/quiz-engine';

export function useQuiz() {
  const [step, setStep] = useState(0);
  const [norm, setNorm] = useState<NormVec>({
    price_index: 0,
    production_volume: 0,
    assortment_width: 0,
    materials_quality: 0,
    craftsmanship_level: 0,
    tech_fabrics: 0,
    category_focus: 0,
    discount_intensity: 0,
    d2c_share: 0,
    retail_presence: 0,
    boutique_presence: 0,
    heritage_age: 0,
    innovation_design: 0,
    visual_identity: 0,
    export_share: 0,
    sustainability: 0,
    collab_frequency: 0,
    audience_income: 0,
    digital_maturity: 0,
    price_stability: 0,
  });
  const [result, setResult] = useState<QuizResult | null>(null);

  const updateParam = (key: ParamKey, val: number) => {
    setNorm((prev) => ({ ...prev, [key]: val }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  const calculateResult = () => {
    const bpi = calcBPI(norm);
    const segment = segmentFromBpi(bpi);
    const target = getUpgradeTargetSegment(segment);
    const style = inferStyleArchetype(norm);
    const upgradeTips = buildUpgradeTips(norm, target);

    setResult({
      bpi,
      segment,
      style,
      upgradeTarget: target,
      upgradeTips,
      debug: { norm },
    });
  };

  const resetQuiz = () => {
    setStep(0);
    setNorm({
      price_index: 0,
      production_volume: 0,
      assortment_width: 0,
      materials_quality: 0,
      craftsmanship_level: 0,
      tech_fabrics: 0,
      category_focus: 0,
      discount_intensity: 0,
      d2c_share: 0,
      retail_presence: 0,
      boutique_presence: 0,
      heritage_age: 0,
      innovation_design: 0,
      visual_identity: 0,
      export_share: 0,
      sustainability: 0,
      collab_frequency: 0,
      audience_income: 0,
      digital_maturity: 0,
      price_stability: 0,
    });
    setResult(null);
  };

  return {
    step,
    setStep,
    norm,
    updateParam,
    nextStep,
    prevStep,
    calculateResult,
    resetQuiz,
    result,
    setResult,
  };
}
