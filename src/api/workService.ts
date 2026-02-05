import type { AddWorkRequest } from '../components/home/AddWorkModal';
import api from './client';

export const workService = {
  // 오늘의 근무 요약
  getTodaySummary: async () => {
    const res = await api.get('/works/today/summary');
    return res.data.success || res.data;
  },

  // 오늘의 근무 리스트
  getTodayWorkLogs: async () => {
    const res = await api.get('/api/work-logs/today');
    return res.data.success?.schedules || [];
  },

  // 일정 추가
  addSchedule: async (data: AddWorkRequest) => {
    const res = await api.post('/api/schedules', data);
    return res.data;
  },

  // 일정 삭제
  deleteSchedule: async (id: string) => {
    return await api.delete(`/api/schedules/${id}`);
  }
};