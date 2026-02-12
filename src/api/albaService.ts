import api from './client';
import type { TsoaResponse } from './types';

export interface AlbaSearchParams {
  workDate?: string;
  storeCategory?: string;
  storeName?: string;
  workTime?: string;
  hourlyRate?: number;
}

export const albaService = {
  getAlbaList: async (params: AlbaSearchParams) => {
    const res = await api.get<TsoaResponse<any[]> | any[]>('/api/alba/search', { params });
    
    const data = res.data;

    if (data && 'resultType' in data && data.resultType === "SUCCESS") {
      return data.success || [];
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  }
};