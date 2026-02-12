import { useState, useEffect } from "react";
import { albaService } from "../api/albaService";
import { getAlbaStatus } from "../api/albaStatus"; //

export const useJobDetail = (id: string | undefined) => {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 상세 정보와 지원 현황을 동시에 가져옴
        const [detailRes, statusRes]: [any, any] = await Promise.all([
          albaService.getAlbaDetail(id),
          getAlbaStatus("all")
        ]);

        const statusList = (Array.isArray(statusRes) ? statusRes : statusRes?.success) || [];

        const myApp = statusList.find((item: any) => {
          const itemDate = item.workDate?.substring(0, 10);
          const detailDate = detailRes.workDate?.substring(0, 10);
          return item.storeName === detailRes.storeName && itemDate === detailDate;
        });

        if (detailRes) {
          setJob({
            ...detailRes,
            status: "채용중", 
            category: detailRes.storeCategory || "기타", 
            timeTag: parseInt(detailRes.startTime?.split(':')[0]) >= 18 || parseInt(detailRes.startTime?.split(':')[0]) < 6 ? "야간" : "주간",
            isApplied: !!myApp,
            applicationStatus: myApp ? myApp.processStatus : null,
            displayTime: `${detailRes.startTime} ~ ${detailRes.endTime}`,
            trustScore: detailRes.totalScore || 0.0,
          });
        }
      } catch (e) {
        console.error("데이터 로드 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return { job, loading };
};