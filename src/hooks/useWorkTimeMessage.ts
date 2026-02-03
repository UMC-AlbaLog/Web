import { useMemo } from "react";
import type { Work } from "../types/work";

export const useWorkTimeMessage = (workList: Work[]) => {
  return useMemo(() => {
    const now = new Date();
    
    // 미래의 근무만 필터링하여 정렬
    const futureShifts = workList
      .filter((w) => {
        if (w.status !== "upcoming") return false;
        const [startH, startM] = w.time.split(" ~ ")[0].split(":").map(Number);
        const target = new Date();
        target.setHours(startH, startM, 0, 0);
        return target.getTime() > now.getTime();
      })
      .sort((a, b) => a.time.split(" ~ ")[0].localeCompare(b.time.split(" ~ ")[0]));

    if (futureShifts.length === 0) return null;

    const [startH, startM] = futureShifts[0].time.split(" ~ ")[0].split(":").map(Number);
    const target = new Date();
    target.setHours(startH, startM, 0, 0);

    const diffMs = target.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return diffHours > 0 
      ? `다음 근무까지 ${diffHours}시간 남았어요` 
      : `다음 근무까지 ${diffMinutes}분 남았어요`;
  }, [workList]);
};