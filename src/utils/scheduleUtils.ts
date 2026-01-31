import type { ScheduleItem } from "../types/schedule";

export const findDynamicFreeSlot = (schedules: ScheduleItem[]) => {
  if (!schedules || schedules.length === 0) return "이번 주 전체가 비어있어요!";

  const now = new Date();
  const dayStart = 10 * 60;
  const dayEnd = 22 * 60;

  // 당일부터 일주일 간의 데이터를 탐색
  for (let i = 0; i < 7; i++) {
    const target = new Date(now);
    target.setDate(now.getDate() + i);
    const dateStr = target.toISOString().split("T")[0];
    const dayName = ["일", "월", "화", "수", "목", "금", "토"][target.getDay()];

    const daySchedules = schedules
      .filter(s => s.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    let lastEnd = dayStart;
    let maxGap = 0;
    let bestSlot = "";

    // 일정 사이의 간격 계산
    daySchedules.forEach(s => {
      const startTotal = parseInt(s.startTime.split(":")[0]) * 60 + parseInt(s.startTime.split(":")[1]);
      if (startTotal - lastEnd > maxGap) {
        maxGap = startTotal - lastEnd;
        bestSlot = `${dayName}요일 ${Math.floor(lastEnd / 60)}:00 - ${s.startTime}`;
      }
      lastEnd = parseInt(s.endTime.split(":")[0]) * 60 + parseInt(s.endTime.split(":")[1]);
    });

    // 마지막 일정 이후 체크
    if (dayEnd - lastEnd > maxGap) {
      maxGap = dayEnd - lastEnd;
      bestSlot = `${dayName}요일 ${Math.floor(lastEnd / 60)}:00 - 22:00`;
    }

    if (maxGap >= 120) return bestSlot;
  }

  return "이번 주는 일정이 꽉 찼네요!";
};

// 시간을 넣으면 소수점 단위의 시간(duration)을 뱉어주는 함수
export const calculateDuration = (start: string, end: string): number => {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  return totalMinutes > 0 ? totalMinutes / 60 : 0;
};

/** 해당 월 스케줄의 총 근무 시간(시간) */
export const getTotalHoursForMonth = (
  schedules: ScheduleItem[],
  year: number,
  month: number
): number => {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return schedules
    .filter((s) => s.date.startsWith(prefix) && s.scheduleType !== 'holiday')
    .reduce((sum, s) => sum + calculateDuration(s.startTime, s.endTime), 0);
};

/** 해당 월 근무 일수 (스케줄이 있는 날짜 수) */
export const getWorkDaysForMonth = (
  schedules: ScheduleItem[],
  year: number,
  month: number
): number => {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const dates = new Set(
    schedules
      .filter((s) => s.date.startsWith(prefix) && s.scheduleType !== 'holiday')
      .map((s) => s.date)
  );
  return dates.size;
};

/** 일정 1건 예상 급여 */
export const getEstimatedPayForSchedule = (s: ScheduleItem): number => {
  if (s.scheduleType === 'holiday') return 0;
  const hours = calculateDuration(s.startTime, s.endTime);
  if (s.salaryType === 'daily' && s.dailyWage != null) return s.dailyWage;
  return Math.round((s.hourlyWage ?? 0) * hours);
};

/** 해당 월 스케줄의 예상 급여 합계 */
export const getEstimatedSalaryForMonth = (
  schedules: ScheduleItem[],
  year: number,
  month: number
): number => {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return schedules
    .filter((s) => s.date.startsWith(prefix))
    .reduce((sum, s) => {
      if (s.scheduleType === 'holiday') return sum;
      const hours = calculateDuration(s.startTime, s.endTime);
      if (s.salaryType === 'daily' && s.dailyWage != null) return sum + s.dailyWage;
      const hourly = s.hourlyWage ?? 0;
      return sum + hours * hourly;
    }, 0);
};