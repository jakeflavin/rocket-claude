export type RuleField = 'merchant' | 'description';
export type RuleOperator = 'contains' | 'equals' | 'starts_with';

export type Rule = {
  id: string;
  priority: number;
  field: RuleField;
  operator: RuleOperator;
  value: string;
  category_id: string;
  apply_tag: string | null;
  enabled: boolean;
  created_at: string;
};

export type RulePatch = Partial<{
  field: RuleField;
  operator: RuleOperator;
  value: string;
  category_id: string;
  apply_tag: string | null;
  enabled: boolean;
}>;
