import { useState, useEffect, useCallback, useMemo } from "react";
import { useJobs } from "./useJobs";
import { useSchedules } from "../contexts/SchedulesContext";
import type { SettlementStatus } from "../types/work";
import { getEstimatedPayForSchedule, calculateDuration } from "../utils/scheduleUtils";

const SETTLEMENTS_STORAGE_KEY = "settlements";

interface Settlement {
  status: SettlementStatus;
  actualPay?: number;
}

/** 수입/정산 테이블에서 쓰는 공통 형태 (일자리 + 근무 일정) */
export interface IncomeWorkItem {
  id: string;
  name: string;
  date: string;
  duration: number;
  expectedPay: number;
  actualPay?: number;
  settlementStatus?: SettlementStatus;
}

export const useIncome = () => {
  const { jobs } = useJobs();
  const { schedules, workplaces } = useSchedules();
  const [settlements, setSettlements] = useState<Record<string, Settlement>>({});

  // 정산 데이터 로드
  useEffect(() => {
    const savedSettlements = localStorage.getItem(SETTLEMENTS_STORAGE_KEY);
    if (savedSettlements) {
      setSettlements(JSON.parse(savedSettlements));
    }
  }, []);

  // 정산 데이터 저장
  useEffect(() => {
    if (Object.keys(settlements).length > 0) {
      localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify(settlements));
    }
  }, [settlements]);

  // 완료된 작업: 일자리(승인+완료) + 근무 일정(퇴근 완료)
  const completedWorks = useMemo((): IncomeWorkItem[] => {
    const fromJobs: IncomeWorkItem[] = jobs
      .filter((job) => job.status === "done" && job.applicationStatus === "approved")
      .map((job) => {
        const settlement = settlements[job.id];
        return {
          id: job.id,
          name: job.name,
          date: job.date,
          duration: job.duration,
          expectedPay: job.expectedPay,
          actualPay: settlement?.actualPay ?? job.actualPay ?? job.expectedPay,
          settlementStatus: settlement?.status ?? job.settlementStatus ?? "pending",
        };
      });

    const fromSchedules: IncomeWorkItem[] = schedules
      .filter((s) => s.status === "done")
      .map((s) => {
        const wp = workplaces.find((w) => w.id === s.workplaceId);
        const scheduleKey = `schedule-${s.id}`;
        const settlement = settlements[scheduleKey];
        const expectedPay = getEstimatedPayForSchedule(s);
        const duration = calculateDuration(s.startTime, s.endTime);
        return {
          id: scheduleKey,
          name: wp?.name ?? "알바",
          date: s.date,
          duration,
          expectedPay,
          actualPay: settlement?.actualPay ?? expectedPay,
          settlementStatus: settlement?.status ?? "pending",
        };
      });

    return [...fromJobs, ...fromSchedules];
  }, [jobs, schedules, workplaces, settlements]);

  // 정산 상태 업데이트
  const updateSettlementStatus = useCallback(
    (workId: string, status: SettlementStatus, actualPay?: number) => {
      setSettlements((prev) => {
        const updated = {
          ...prev,
          [workId]: {
            status,
            actualPay: actualPay || prev[workId]?.actualPay,
          },
        };
        localStorage.setItem(SETTLEMENTS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  // 특정 월의 수입 계산
  const getMonthlyIncome = useCallback(
    (year: number, month: number) => {
      const monthStr = month.toString().padStart(2, "0");
      const yearMonth = `${year}-${monthStr}`;

      return completedWorks
        .filter((work) => work.date.startsWith(yearMonth))
        .reduce((sum, work) => {
          const settlement = settlements[work.id];
          const pay = settlement?.actualPay || work.actualPay || work.expectedPay;
          return sum + pay;
        }, 0);
    },
    [completedWorks, settlements]
  );

  // 현재 월 수입
  const currentMonthIncome = useMemo(() => {
    const now = new Date();
    return getMonthlyIncome(now.getFullYear(), now.getMonth() + 1);
  }, [getMonthlyIncome]);

  // 이전 월 수입 (비교용)
  const previousMonthIncome = useMemo(() => {
    const now = new Date();
    const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return getMonthlyIncome(prevYear, prevMonth);
  }, [getMonthlyIncome]);

  // 예상 수입 (정산 완료 + 정산 대기)
  const expectedIncome = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStr = month.toString().padStart(2, "0");
    const yearMonth = `${year}-${monthStr}`;

    return completedWorks
      .filter((work) => work.date.startsWith(yearMonth))
      .reduce((sum, work) => sum + work.expectedPay, 0);
  }, [completedWorks]);

  // 매장별 수입 계산
  const incomeByStore = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStr = month.toString().padStart(2, "0");
    const yearMonth = `${year}-${monthStr}`;

    const storeMap: Record<string, number> = {};

    completedWorks
      .filter((work) => work.date.startsWith(yearMonth))
      .forEach((work) => {
        const storeName = work.name;
        const settlement = settlements[work.id];
        const pay = settlement?.actualPay || work.actualPay || work.expectedPay;

        if (storeMap[storeName]) {
          storeMap[storeName] += pay;
        } else {
          storeMap[storeName] = pay;
        }
      });

    return Object.entries(storeMap).map(([name, value]) => ({
      name,
      value,
    }));
  }, [completedWorks, settlements]);

  // 월별 증가율 계산
  const monthOverMonthGrowth = useMemo(() => {
    if (previousMonthIncome === 0) return 0;
    return ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100;
  }, [currentMonthIncome, previousMonthIncome]);

  // 특정 월의 예상 수입 (expectedPay 합계)
  const getExpectedIncomeForMonth = useCallback(
    (year: number, month: number) => {
      const monthStr = month.toString().padStart(2, "0");
      const yearMonth = `${year}-${monthStr}`;
      return completedWorks
        .filter((work) => work.date.startsWith(yearMonth))
        .reduce((sum, work) => sum + work.expectedPay, 0);
    },
    [completedWorks]
  );

  // 특정 월의 매장별 수입
  const getIncomeByStoreForMonth = useCallback(
    (year: number, month: number) => {
      const monthStr = month.toString().padStart(2, "0");
      const yearMonth = `${year}-${monthStr}`;
      const storeMap: Record<string, number> = {};
      completedWorks
        .filter((work) => work.date.startsWith(yearMonth))
        .forEach((work) => {
          const storeName = work.name;
          const settlement = settlements[work.id];
          const pay = settlement?.actualPay || work.actualPay || work.expectedPay;
          if (storeMap[storeName]) storeMap[storeName] += pay;
          else storeMap[storeName] = pay;
        });
      return Object.entries(storeMap).map(([name, value]) => ({ name, value }));
    },
    [completedWorks, settlements]
  );

  // 특정 월의 완료된 작업만 (정산 테이블용)
  const getCompletedWorksForMonth = useCallback(
    (year: number, month: number) => {
      const monthStr = month.toString().padStart(2, "0");
      const yearMonth = `${year}-${monthStr}`;
      return completedWorks.filter((work) => work.date.startsWith(yearMonth));
    },
    [completedWorks]
  );

  // 이전 달 year/month
  const getPreviousMonth = useCallback((year: number, month: number) => {
    if (month === 1) return { year: year - 1, month: 12 };
    return { year, month: month - 1 };
  }, []);

  return {
    completedWorks,
    settlements,
    updateSettlementStatus,
    getMonthlyIncome,
    getExpectedIncomeForMonth,
    getIncomeByStoreForMonth,
    getCompletedWorksForMonth,
    getPreviousMonth,
    currentMonthIncome,
    expectedIncome,
    previousMonthIncome,
    monthOverMonthGrowth,
    incomeByStore,
  };
};


