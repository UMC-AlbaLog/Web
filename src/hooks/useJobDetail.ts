import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { albaService } from "../api/albaService";
import { getAlbaStatus } from "../api/albaStatus";
import { storeReviewService } from "../api/storeReviewService";

const calculateTimeTag = (startTime: string): string => {
  const startHour = parseInt(String(startTime || "").split(":")[0], 10);
  return (startHour >= 18 || startHour < 6) ? "야간" : "주간";
};

// 카카오 API 업종 추적 함수
const fetchCategoryFromKakao = (address: string, storeName: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      resolve("기타");
      return;
    }
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(`${address} ${storeName}`, (data: any[], status: any) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const parts = data[0].category_name.split(" > ");
        resolve(parts[1] || parts[0] || "기타");
      } else {
        resolve("기타");
      }
    });
  });
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
  const totalWage = item.totalWage ?? item.expectedPay ?? (hourlyRate * workHours);
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
    trustScore: item.trustScore ?? 0.0,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let baseJob = null;

      try {
        const [detailRes, statusRes]: [any, any] = await Promise.all([
          id ? albaService.getAlbaDetail(id).catch(() => null) : null,
          getAlbaStatus("all").catch(() => [])
        ]);

        if (detailRes && detailRes.albaId && !detailRes.errorCode) {
          const statusList = Array.isArray(statusRes) ? statusRes : ((statusRes as any)?.success || []);
          const myApp = statusList.find((item: any) => {
            const itemDate = item.workDate?.substring(0, 10);
            const detailDate = detailRes?.workDate?.substring(0, 10);
            return item.storeName === detailRes?.storeName && itemDate === detailDate;
          });

          baseJob = {
            ...detailRes,
            status: "채용중",
            category: detailRes.storeCategory || "기타",
            timeTag: calculateTimeTag(detailRes.startTime),
            isApplied: !!myApp,
            applicationStatus: myApp ? myApp.processStatus : null,
            displayTime: `${detailRes.startTime} ~ ${detailRes.endTime}`,
            trustScore: detailRes.totalScore ?? 0.0,
          };
        } 
        else if (stateItem) {
          baseJob = buildJobFromStatusItem(stateItem);
        }

        if (baseJob) {
          const storeId = baseJob.storeId || baseJob.id;
          if (storeId) {
            try {
              const reviews = await storeReviewService.getStoreReviews(storeId);
              if (reviews && reviews.length > 0) {
                const avg = reviews.reduce((acc: number, r: any) => acc + (r.totalScore || 0), 0) / reviews.length;
                baseJob.trustScore = Number(avg.toFixed(1));
              }
            } catch (err) { console.warn("리뷰 연동 실패"); }
          }

          if (baseJob.category === "기타" || !baseJob.category) {
            const kakaoCat = await fetchCategoryFromKakao(baseJob.storeAddress, baseJob.storeName);
            baseJob.category = kakaoCat;
          }
        }

        setJob(baseJob);
      } catch (e) {
        console.error("최종 로드 실패:", e);
        if (stateItem) setJob(buildJobFromStatusItem(stateItem));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { job, loading };
};