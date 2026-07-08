import { ApiResponse } from './api.interface';
import { LocationResource } from './location.interface';
import { StaffResource } from './staff.interface';

export interface BrowseData {
  location: LocationResource[];
  staff: StaffResource[];
}

export type BrowseResponse = ApiResponse<BrowseData>;