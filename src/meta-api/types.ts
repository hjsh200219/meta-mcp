export interface MetaApiClient {
  get<T>(path: string, params?: Record<string, string>): Promise<T>;
  post<T>(path: string, data: unknown): Promise<T>;
  delete(path: string): Promise<void>;
}

export interface MetaApiConfig {
  accessToken: string;
  appSecret?: string;
  apiVersion: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    next_cursor: string | null;
    has_next: boolean;
  };
}

export interface MetaErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

// Campaign types
export interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time?: string;
  updated_time?: string;
}

export interface CreateCampaignParams {
  name: string;
  objective: string;
  status: string;
  special_ad_categories?: string[];
  daily_budget?: string;
  lifetime_budget?: string;
}

export interface UpdateCampaignParams {
  name?: string;
  status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
}

// AdSet types
export interface AdSet {
  id: string;
  name: string;
  campaign_id: string;
  optimization_goal: string;
  billing_event: string;
  bid_amount?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  targeting?: Record<string, unknown>;
  status: string;
  start_time?: string;
  end_time?: string;
}

export interface CreateAdSetParams {
  name: string;
  campaign_id: string;
  optimization_goal: string;
  billing_event: string;
  bid_amount?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  targeting: Record<string, unknown>;
  instagram_positions?: string[];
  start_time?: string;
  end_time?: string;
  status?: string;
}

export interface UpdateAdSetParams {
  name?: string;
  status?: string;
  daily_budget?: string;
  bid_amount?: string;
  targeting?: Record<string, unknown>;
}

// Ad types
export interface Ad {
  id: string;
  name: string;
  adset_id: string;
  creative: { id: string };
  status: string;
}

export interface CreateAdParams {
  name: string;
  adset_id: string;
  creative: { creative_id: string };
  status: string;
}

export interface UpdateAdParams {
  name?: string;
  status?: string;
  creative?: { creative_id: string };
}

// Creative types
export interface AdCreative {
  id: string;
  name: string;
  object_story_spec?: Record<string, unknown>;
}

export interface CreateAdCreativeParams {
  name: string;
  object_story_spec: {
    page_id: string;
    instagram_actor_id: string;
    link_data?: {
      image_url?: string;
      link?: string;
      message?: string;
      call_to_action?: { type: string; value?: Record<string, unknown> };
    };
    video_data?: {
      video_id: string;
      message?: string;
      call_to_action?: { type: string; value?: Record<string, unknown> };
    };
  };
}

// Insights types
export interface InsightData {
  impressions?: string;
  clicks?: string;
  spend?: string;
  reach?: string;
  cpc?: string;
  cpm?: string;
  ctr?: string;
  date_start: string;
  date_stop: string;
  [key: string]: unknown;
}

export interface InsightParams {
  date_preset?: string;
  time_range?: { since: string; until: string };
  fields?: string[];
}

export interface ListParams {
  status_filter?: string;
  limit?: number;
  after?: string;
}

// Account types
export interface AdAccount {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
}

export interface InstagramAccount {
  id: string;
  username: string;
  name?: string;
  profile_pic?: string;
}
