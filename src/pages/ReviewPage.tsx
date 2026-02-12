import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { albaService } from "../api/albaService";
import RatingRow from "../components/jobs/review/RatingRow";
import ReviewAccordion from "../components/jobs/review/ReviewAccordion";

interface ApiResponse<T> {
  resultType: string;
  error: any;
  success: T;
}

interface ReviewPageProps {
  mode: "view" | "write";
}

const ReviewPage: React.FC<ReviewPageProps> = ({ mode }) => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [jobInfo, setJobInfo] = useState<any>(null);

  const [totalScore, setTotalScore] = useState(0); 
  const [reviewText, setReviewText] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) return;
      setLoading(true);
      try {
        const info = await albaService.getAlbaDetail(storeId);
        setJobInfo(info);

        if (mode === "view") {
          const res = await apiRequest<ApiResponse<any>>(`/api/store/review/${storeId}`);
          if (res.resultType === "SUCCESS") {
            setStoreData(res.success);
          }
        }
      } catch (e) {
        console.error("데이터 로드 실패:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mode, storeId]);

  const handleSaveReview = async () => {
    if (reviewText.length < 10) return alert("리뷰를 10자 이상 작성해 주세요! 😊");
    try {
      const body = {
        userId: sessionStorage.getItem("userId") || "temp_user",
        storeId: storeId,
        kindness: totalScore,
        communication: totalScore,
        settlement: totalScore,
        rest: totalScore,
        review: reviewText
      };
      await apiRequest("/api/store/review", { method: "POST", body });
      alert("평가가 등록되었습니다! ⭐");
      navigate("/");
    } catch (e) { alert("등록 실패"); }
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-300">데이터를 불러오는 중...</div>;

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-12 font-['Pretendard'] text-left">
      <div className={`max-w-${mode === 'write' ? '6xl' : '3xl'} mx-auto grid ${mode === 'write' ? 'grid-cols-[1fr_300px]' : 'grid-cols-1'} gap-10`}>
        
        <div className="space-y-8">
          <header className="space-y-2">
            <h1 className="text-[32px] font-black text-gray-900">
              {mode === 'view' ? `근무지 평가 > ${jobInfo?.storeName || "매장"}` : "리뷰 쓰기"}
            </h1>
            <p className="text-gray-400 font-bold">
              {mode === 'view' ? "이 근무지의 신뢰 지표를 확인해 보세요." : "완료한 근무에 대해 솔직한 후기를 남겨주세요."}
            </p>
          </header>

          {mode === 'write' && (
            <div className="bg-white rounded-xl p-8 border border-gray-100 flex items-center gap-5 shadow-sm">
              <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">🏠</div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-gray-800">{jobInfo?.storeName || "매장 정보 없음"}</h3>
                <p className="text-sm text-gray-400 font-bold">
                  {jobInfo?.workDate || "날짜 정보 없음"} ({jobInfo?.dayOfWeek || "-"}) • {jobInfo?.startTime}~{jobInfo?.endTime} 근무 완료
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <ReviewAccordion 
              title="사장님 평가" 
              avgRating={mode === 'view' ? (storeData?.bossScore?.toFixed(1) || "0.0") : totalScore.toFixed(1)}
              isOpen={true}
              onToggle={() => {}}
              keywords={mode === 'view' ? storeData?.bossKeywords : []}
              reviewText={mode === 'view' ? storeData?.bossReview : ""}
            >
              {mode === 'write' && (
                <div className="space-y-6 pt-10">
                  <p className="font-black text-gray-800 text-center mb-4">근무는 어떠셨나요?</p>
                  <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setTotalScore(s)} className={`text-5xl ${s <= totalScore ? 'text-yellow-400' : 'text-gray-100'}`}>★</button>
                    ))}
                  </div>
                </div>
              )}
            </ReviewAccordion>

            {mode === 'write' && (
              <section className="bg-white rounded-xl p-10 border border-gray-100 shadow-sm space-y-6">
                <p className="font-black text-gray-800">생생한 후기를 남겨주세요</p>
                <textarea 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="다른 근무자들에게 도움이 될 수 있도록 솔직한 후기를 남겨주세요. (최소 10자 이상)"
                  className="w-full h-44 bg-gray-50 rounded-xl p-6 text-sm font-medium border-none outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
                />
              </section>
            )}
          </div>

          <div className="flex gap-4">
            <button onClick={() => navigate(-1)} className="px-12 py-4 bg-white border border-gray-200 text-gray-400 font-bold rounded-xl text-lg hover:bg-gray-50">취소</button>
            {mode === 'write' && (
              <button onClick={handleSaveReview} className="flex-1 py-4 bg-[#5D5FEF] text-white font-bold rounded-xl text-lg shadow-lg shadow-indigo-100 hover:bg-[#4A4BCF]">
                평가 완료하기
              </button>
            )}
          </div>
        </div>

        {mode === 'write' && (
          <aside className="space-y-6 sticky top-12 h-fit text-left">
            <div className="bg-indigo-50 rounded-xl p-8 space-y-4 border border-indigo-100">
              <p className="text-[#5D5FEF] font-black text-sm">리뷰 안내</p>
              <p className="text-[11px] text-gray-500 font-bold leading-relaxed">리뷰는 익명으로 공개되며 다른 알바생들에게 중요한 정보가 됩니다.</p>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
};

export default ReviewPage;