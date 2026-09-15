import { apiClient } from '@/lib/apiClient';

export interface SearchResults {
  employees: Array<{
    _id: string;
    name: string;
    employeeId: string;
    designation: string;
    branchId: string;
    floorId: string;
    areaId: string;
    seatId?: string;
    profileImageUrl?: string;
  }>;
  areas: Array<{ _id: string; name: string; areaCode: string; branchId: string; floorId: string; type: string }>;
  branches: Array<{ _id: string; name: string; code: string; location: string }>;
}

export async function globalSearch(q: string): Promise<SearchResults> {
  const { data } = await apiClient.get<SearchResults>('/admin/search', { params: { q } });
  return data;
}
