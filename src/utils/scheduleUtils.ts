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