import { useState, useEffect, useCallback, useMemo } from "react";
import { useJobs } from "./useJobs";
import type { Work, SettlementStatus } from "../types/work";

const SETTLEMENTS_STORAGE_KEY = "settlements";

interface Settlement {
  status: SettlementStatus;
  actualPay?: number;
}

export const useIncome = () => {
  const { jobs } = useJobs();
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

  // 완료된 작업 목록 (승인된 작업만)
  const completedWorks = useMemo(() => {
    return jobs
      .filter((job) => job.status === "done" && job.applicationStatus === "approved")
      .map((job) => {
        const settlement = settlements[job.id];
        return {
          ...job,
          settlementStatus: settlement?.status || job.settlementStatus || "pending",
          actualPay: settlement?.actualPay || job.actualPay || job.expectedPay,
        };
      });
  }, [jobs, settlements]);

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

  return {
    completedWorks,
    settlements,
    updateSettlementStatus,
    getMonthlyIncome,
    currentMonthIncome,
    expectedIncome,
    previousMonthIncome,
    monthOverMonthGrowth,
    incomeByStore,
  };
};

