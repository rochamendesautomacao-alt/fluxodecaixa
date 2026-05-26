export type UUID = string;

export type Timestamp = string;

export interface BaseEntity {
  id: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CompanyScoped {
  company_id: UUID;
}

export interface StoreScoped {
  store_id: UUID;
}
