export type AdminSeasonRateOverride = {
  stayTypeId: string;
  baseRate: number;
  weekendRate: number;
};

export type AdminSeason = {
  id: string;
  name: string;
  startsOn: string;
  endsOn: string;
  rateOverrides: AdminSeasonRateOverride[];
  active: boolean;
  updatedAt: string;
};

export type SeasonMutationRequest = {
  name: string;
  startsOn: string;
  endsOn: string;
  active: boolean;
  rateOverrides: AdminSeasonRateOverride[];
};

export type SeasonMutationResponse = {
  id?: string;
  message?: string;
};
