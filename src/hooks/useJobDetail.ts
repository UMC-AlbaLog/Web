import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { albaService } from "../api/albaService";
import { getAlbaStatus } from "../api/albaStatus";

const calculateTimeTag = (startTime: string): string => {
  const startHour = parseInt(String(startTime || "").split(":")[0], 10);
  return (startHour >= 18 || startHour < 6) ? "야간" : "주간";
};

/** 지원현황에서 넘긴 state로 상세와 같은 형태의 job 객체 만들기 */
function buildJobFromStatusItem(item: any): any {
  const startTime = item.startTime ?? item.start_time ?? "09:00";
  const endTime = item.endTime ?? item.end_time ?? "18:00";
  const displayTime = `${startTime} ~ ${endTime}`;
  const storeName = item.storeName ?? item.store_name ?? item.name ?? "알바 매장";
  const hourlyRate = item.hourlyRate ?? item.hourlyWage ?? item.pay ?? 0;
  const duration = item.workTime ?? item.duration ?? 0;
  const [sh, sm] = String(startTime).split(":").map(Number);
  const [eh, em] = String(endTime).split(":").map(Number);
  const workHours = duration > 0 ? duration : (eh * 60 + (em || 0) - (sh * 60 + (sm || 0))) / 60;
  const totalWage = item.totalWage ?? item.expectedPay ?? (hourlyRate * (workHours || 1));
  return {
    storeName,
    storeAddress: item.storeAddress ?? item.address ?? "등록된 주소 정보가 없습니다.",
    startTime,
    endTime,
    displayTime,
    dayOfWeek: item.dayOfWeek ?? item.day_of_week ?? "",
    workDate: item.workDate ?? item.work_date ?? item.date ?? "",
    hourlyRate,
    workTime: workHours,
    totalWage: Math.round(totalWage),
    status: "채용중",
    category: item.category ?? item.storeCategory ?? "기타",
    timeTag: calculateTimeTag(startTime),
    isApplied: true,
    applicationStatus: item.processStatus ?? item.applicationStatus ?? null,
    trustScore: item.trustScore ?? 0,
    storeId: item.storeId ?? item.id,
    notification: item.notification ?? "대타 모집합니다",
    mainTask: item.mainTask ?? "상세 정보는 지원 현황에서 확인한 내용과 동일합니다.",
    requirement: item.requirement ?? "공고 상세 내용을 확인해 주세요.",
  };
}

export const useJobDetail = (id: string | undefined) => {
  const location = useLocation();
  const stateItem = (location.state as any)?.fromStatusItem;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        if (stateItem) setJob(buildJobFromStatusItem(stateItem));
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [detailRes, statusRes]: [any, any] = await Promise.all([
          albaService.getAlbaDetail(id),
          getAlbaStatus("all"),
        ]);

        const statusList = (Array.isArray(statusRes) ? statusRes : statusRes?.success) || [];
        const myApp = statusList.find((item: any) => {
          const itemDate = item.workDate?.substring(0, 10);
          const detailDate = detailRes?.workDate?.substring(0, 10);
          return item.storeName === detailRes?.storeName && itemDate === detailDate;
        });

        if (detailRes) {
          setJob({
            ...detailRes,
            status: "채용중",
            category: detailRes.storeCategory || "기타",
            timeTag: calculateTimeTag(detailRes.startTime),
            isApplied: !!myApp,
            applicationStatus: myApp ? myApp.processStatus : null,
            displayTime: `${detailRes.startTime} ~ ${detailRes.endTime}`,
            trustScore: detailRes.totalScore ?? 0.0,
          });
        } else if (stateItem) {
          setJob(buildJobFromStatusItem(stateItem));
        }
      } catch (e) {
        console.error("데이터 로드 실패:", e);
        if (stateItem) setJob(buildJobFromStatusItem(stateItem));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return { job, loading };
};