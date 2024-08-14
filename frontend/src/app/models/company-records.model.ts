export interface Record {
  id: number;
  name: string;
  exchange: string;
  ticker: string;
  isin: string;
  website?: string;
  isEditing?: boolean;
}
