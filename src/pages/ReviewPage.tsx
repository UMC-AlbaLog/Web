import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { albaService } from "../api/albaService";
import RatingRow from "../components/jobs/review/RatingRow";
import ReviewAccordion from "../components/jobs/review/ReviewAccordion";

interface ReviewPageProps { mode: "view" | "write"; }

const ReviewPage: React.FC<ReviewPageProps> = ({ mode }) => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [storeReviews, setStoreReviews] = useState<any>(null);

  const [rating, setRating] = useState(0);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");

  const keywordOptions = [
    { key: "settlement", label: "급여 칼지급", icon: "💰" },
    { key: "kindness", label: "사장님이 친절해요", icon: "😊" },
    { key: "clean", label: "매장이 청결해요", icon: "🧹" },
    { key: "rest", label: "휴게시간 준수", icon: "☕" },
    { key: "colleague", label: "동료가 좋아요", icon: "🙌" },
    { key: "info", label: "업무를 잘 알려줘요", icon: "🎓" },
    { key: "subway", label: "역세권이에요", icon: "🚇" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) return;
      setLoading(true);
      try {
        const info = await albaService.getAlbaDetail(storeId);
        setJobInfo(info);

        if (mode === "view") {
          const res = await apiRequest<any>(`/api/store/review/${storeId}`);
          setStoreReviews(res.success);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, [mode, storeId]);

  const toggleKeyword = (key: string) => {
    setSelectedKeywords(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleRegisterReview = async () => {
    if (rating === 0) return alert("별점을 선택해주세요.");
    if (reviewText.length < 10) return alert("리뷰를 10자 이상 작성해주세요.");

    try {
      const body = {
        userId: sessionStorage.getItem("userId") || "temp_user",
        storeId: storeId,
        kindness: rating,
        communication: rating,
        settlement: rating,
        rest: rating,
        review: reviewText,
        keywords: selectedKeywords
      };
      await apiRequest("/api/store/review", { method: "POST", body });
      alert("리뷰가 등록되었습니다!");
      navigate(-1);
    } catch (e) { alert("등록 실패"); }
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-300">데이터 로딩 중...</div>;

  return (
    <main className="min-h-screen bg-[#F1F3F9] p-12 font-['Pretendard'] text-left">
      <div className={`max-w-${mode === 'write' ? '6xl' : '4xl'} mx-auto`}>
        <header className="mb-10">
          <h1 className="text-[32px] font-black text-gray-900 mb-2">
            {mode === 'view' ? `근무지 평가 > ${jobInfo?.storeName}` : "리뷰 쓰기"}
          </h1>
          {mode === 'write' && <p className="text-gray-400 font-bold">완료한 근무에 대해 솔직한 후기를 남겨주세요.</p>}
        </header>

        <div className={`grid ${mode === 'write' ? 'grid-cols-[1fr_320px]' : 'grid-cols-1'} gap-10 items-start`}>
          
          <div className="space-y-8">
            {mode === 'write' ? (
              <>
                <section className="bg-white rounded-2xl p-8 border border-gray-100 flex items-center gap-6 shadow-sm">
                  <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center text-3xl shadow-inner">🏠</div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-gray-800">{jobInfo?.storeName}</h3>
                    <p className="text-sm text-gray-400 font-bold">{jobInfo?.workDate} • 마감조</p>
                  </div>
                </section>

                <section className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm text-center">
                  <h4 className="text-lg font-black text-gray-800 mb-2">근무는 어떠셨나요?</h4>
                  <p className="text-sm text-gray-400 font-bold mb-6">별점을 선택해 전체 만족도를 평가해주세요.</p>
                  <RatingRow value={rating} onChange={setRating} />
                </section>

                <section className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm">
                  <h4 className="text-lg font-black text-gray-800 mb-2">어떤 점이 좋았나요? (선택)</h4>
                  <p className="text-sm text-gray-400 font-bold mb-8">해당 근무지를 잘 표현하는 키워드를 골라주세요.</p>
                  <div className="flex flex-wrap gap-3">
                    {keywordOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => toggleKeyword(opt.key)}
                        className={`px-5 py-3 rounded-full border-2 text-[13px] font-bold transition-all flex items-center gap-2 ${
                          selectedKeywords.includes(opt.key)
                            ? 'bg-white border-[#5D5FEF] text-[#5D5FEF]'
                            : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        <span>{opt.icon}</span> {opt.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm">
                  <h4 className="text-lg font-black text-gray-800 mb-2">생생한 후기를 남겨주세요</h4>
                  <p className="text-sm text-gray-400 font-bold mb-6">다른 근무자들에게 도움이 될 수 있도록 솔직한 후기를 남겨주세요. (최소 10자 이상)</p>
                  <div className="relative">
                    <textarea 
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                      placeholder="내용을 입력해주세요"
                      className="w-full h-56 bg-white border border-gray-200 rounded-2xl p-6 text-sm font-medium outline-none focus:border-[#5D5FEF] transition-all resize-none"
                    />
                    <span className="absolute bottom-6 right-6 text-xs text-gray-300 font-bold">
                      {reviewText.length} / 500
                    </span>
                  </div>
                </section>

                <div className="flex gap-4">
                  <button onClick={() => navigate(-1)} className="px-12 py-5 bg-white border border-gray-200 text-gray-400 font-bold rounded-2xl text-lg hover:bg-gray-50">취소</button>
                  <button onClick={handleRegisterReview} className="flex-1 py-5 bg-[#5D5FEF] text-white font-bold rounded-2xl text-lg shadow-lg shadow-indigo-100 hover:bg-[#4A4BCF]">
                    리뷰 등록하기
                  </button>
                </div>
              </>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                <ReviewAccordion 
                  title="사장님 평가" 
                  rating={storeReviews?.bossRating || 4.5} 
                  keywords={["settlement", "kindness", "rest"]} 
                  reviewText="친절하고 대타 쿨하게 구해주십니다!" 
                />
                <ReviewAccordion 
                  title="근무지 평가" 
                  rating={storeReviews?.storeRating || 4.5} 
                  keywords={["clean"]} 
                  reviewText="화장실 밖에 있어서 청소 안해도 돼요." 
                />
              </div>
            )}
          </div>

          {mode === 'write' && (
            <aside className="space-y-6 sticky top-12">
              <div className="bg-[#E9EFFF] rounded-2xl p-8 space-y-4">
                <p className="text-[#5D5FEF] font-black text-[15px]">리뷰 안내</p>
                <p className="text-[12px] text-gray-500 font-bold leading-relaxed">
                  리뷰는 익명으로 공개되며, 같은 곳에서 근무할 다른 알바생들에게 중요한 정보가 됩니다.
                </p>
              </div>
              <div className="bg-[#F8F9FA] rounded-2xl p-8 space-y-4">
                <p className="text-[#5D5FEF] font-black text-[15px]">작성 TIP</p>
                <p className="text-[12px] text-gray-400 font-bold space-y-3 leading-relaxed">
                  <p>업무 난이도, 교육 방식, 근무 강도 등을 구체적으로 적어주세요.</p>
                  <p>휴게시간, 급여 정산, 스케줄 조율 등 실제 경험을 기반으로 작성해주세요.</p>
                  <p>실명이 드러나지 않도록 주의해주세요.</p>
                </p>
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
};

export default ReviewPage;