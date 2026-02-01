import type { ScheduleItem, Workplace } from "../types/schedule";

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const today = `${year}-${month}-${String(now.getDate()).padStart(2, "0")}`;

export const SEED_WORKPLACES: Workplace[] = [
  { id: "wp1", name: "스타벅스 강남점", color: "#22C55E" },
  { id: "wp2", name: "CU 홍대점", color: "#EF4444" },
  { id: "wp3", name: "메가커피 상수점", color: "#F59E0B" },
  { id: "wp4", name: "GS25 역삼점", color: "#3B82F6" },
  { id: "wp5", name: "개인카페 연남", color: "#8B5CF6" },
  { id: "wp6", name: "배민커넥트 배달", color: "#06B6D4" },
  { id: "wp7", name: "시립도서관", color: "#6B7280" },
  { id: "wp8", name: "맥도날드 여의도점", color: "#F97316" },
];

function dayOffset(d: number): string {
  const d2 = new Date(year, now.getMonth(), now.getDate() + d);
  const m = String(d2.getMonth() + 1).padStart(2, "0");
  const day = String(d2.getDate()).padStart(2, "0");
  return `${d2.getFullYear()}-${m}-${day}`;
}

export const SEED_SCHEDULES: ScheduleItem[] = [
  { id: "s1", workplaceId: "wp1", date: today, startTime: "09:00", endTime: "13:00", hourlyWage: 12000, scheduleType: "work", salaryType: "hourly" },
  { id: "s2", workplaceId: "wp6", date: today, startTime: "18:00", endTime: "21:00", hourlyWage: 15000, scheduleType: "work", salaryType: "hourly" },
  { id: "s3", workplaceId: "wp2", date: dayOffset(1), startTime: "14:00", endTime: "18:00", hourlyWage: 9620, scheduleType: "work", salaryType: "hourly" },
  { id: "s4", workplaceId: "wp3", date: dayOffset(1), startTime: "09:00", endTime: "14:00", hourlyWage: 9500, scheduleType: "work", salaryType: "hourly" },
  { id: "s5", workplaceId: "wp4", date: dayOffset(2), startTime: "18:00", endTime: "23:00", hourlyWage: 10000, scheduleType: "work", salaryType: "hourly" },
  { id: "s6", workplaceId: "wp5", date: dayOffset(2), startTime: "10:00", endTime: "15:00", hourlyWage: 11000, scheduleType: "work", salaryType: "hourly" },
  { id: "s7", workplaceId: "wp1", date: dayOffset(3), startTime: "13:00", endTime: "18:00", hourlyWage: 12000, scheduleType: "work", salaryType: "hourly" },
  { id: "s8", workplaceId: "wp2", date: dayOffset(3), startTime: "19:00", endTime: "23:00", hourlyWage: 9620, scheduleType: "work", salaryType: "hourly" },
  { id: "s9", workplaceId: "wp7", date: dayOffset(4), startTime: "13:00", endTime: "17:00", hourlyWage: 10000, scheduleType: "work", salaryType: "hourly" },
  { id: "s10", workplaceId: "wp8", date: dayOffset(4), startTime: "14:00", endTime: "18:00", hourlyWage: 12000, scheduleType: "work", salaryType: "hourly" },
  { id: "s11", workplaceId: "wp3", date: dayOffset(5), startTime: "14:00", endTime: "19:00", hourlyWage: 9500, scheduleType: "work", salaryType: "hourly" },
  { id: "s12", workplaceId: "wp5", date: dayOffset(5), startTime: "15:00", endTime: "20:00", hourlyWage: 11000, scheduleType: "work", salaryType: "hourly" },
  { id: "s13", workplaceId: "wp1", date: dayOffset(6), startTime: "08:00", endTime: "12:00", hourlyWage: 12000, scheduleType: "work", salaryType: "hourly" },
  { id: "s14", workplaceId: "wp4", date: dayOffset(6), startTime: "12:00", endTime: "16:00", hourlyWage: 10000, scheduleType: "work", salaryType: "hourly" },
  { id: "s15", workplaceId: "wp6", date: dayOffset(7), startTime: "11:00", endTime: "15:00", hourlyWage: 15000, scheduleType: "work", salaryType: "hourly" },
  { id: "s16", workplaceId: "wp2", date: dayOffset(7), startTime: "10:00", endTime: "14:00", hourlyWage: 9620, scheduleType: "work", salaryType: "hourly" },
  { id: "s17", workplaceId: "wp3", date: dayOffset(-1), startTime: "09:00", endTime: "13:00", hourlyWage: 9500, scheduleType: "work", salaryType: "hourly" },
  { id: "s18", workplaceId: "wp5", date: dayOffset(-2), startTime: "11:00", endTime: "16:00", hourlyWage: 11000, scheduleType: "work", salaryType: "hourly" },
  { id: "s19", workplaceId: "wp1", date: dayOffset(-3), startTime: "09:00", endTime: "13:00", hourlyWage: 12000, scheduleType: "work", salaryType: "hourly" },
  { id: "s20", workplaceId: "wp6", date: dayOffset(-3), startTime: "18:00", endTime: "21:00", hourlyWage: 15000, scheduleType: "work", salaryType: "hourly" },
];
