export type ParamKey =
  | 'price_index'
  | 'production_volume'
  | 'assortment_width'
  | 'materials_quality'
  | 'craftsmanship_level'
  | 'tech_fabrics'
  | 'category_focus'
  | 'discount_intensity'
  | 'd2c_share'
  | 'retail_presence'
  | 'boutique_presence'
  | 'heritage_age'
  | 'innovation_design'
  | 'visual_identity'
  | 'export_share'
  | 'sustainability'
  | 'collab_frequency'
  | 'audience_income'
  | 'digital_maturity'
  | 'price_stability';

export type NormVec = Record<ParamKey, number>;

export type SegmentId = number;

export interface SegmentInfo {
  id: SegmentId;
  code: string;
  name: string;
  description: string;
}

export type StyleArchetype =
  | 'street'
  | 'sport'
  | 'techwear'
  | 'contemporary'
  | 'heritage'
  | 'luxury'
  | 'none';

export interface QuizResult {
  bpi: number;
  segment: SegmentInfo;
  style: StyleArchetype;
  upgradeTarget: SegmentInfo | null;
  upgradeTips: string[];
  debug?: {
    norm: NormVec;
  };
}
