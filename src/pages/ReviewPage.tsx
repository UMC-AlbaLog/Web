import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { albaService } from "../api/albaService";
import { storeReviewService } from "../api/storeReviewService";
import RatingRow from "../components/jobs/review/RatingRow";
import ReviewAccordion from "../components/jobs/review/ReviewAccordion";

interface ReviewPageProps { mode: "view" | "write"; }

const ReviewPage: React.FC<ReviewPageProps> = ({ mode }) => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [storeReviews, setStoreReviews] = useState<any[]>([]);

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [selectedKeywords, setSelectedKeywords] = useState<{ [key: string]: boolean }>({
    kindness: false,
    communication: false,
    settlement: false,
    rest: false
  });

  const keywordOptions = [
    { key: "kindness", label: "사장님이 친절해요", icon: "😊" },
    { key: "communication", label: "동료가 좋아요", icon: "🙌" },
    { key: "settlement", label: "급여 칼지급", icon: "💰" },
    { key: "rest", label: "휴게시간 준수", icon: "☕" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) return;
      setLoading(true);
      try {
        const info = await albaService.getAlbaDetail(storeId);
        setJobInfo(info);

        if (mode === "view") {
          const reviews = await storeReviewService.getStoreReviews(storeId);
          setStoreReviews(reviews);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, [mode, storeId]);

  const aggregatedData = useMemo(() => {
    if (storeReviews.length === 0) return null;
  
    const getAverage = (fields: string[]) => {
      let sum = 0;
      let validCount = 0;

      storeReviews.forEach(rev => {
        fields.forEach(field => {
          if (rev[field] > 0) {
            sum += rev[field];
            validCount++;
          }
        });
      });

      return validCount > 0 ? sum / validCount : 0;
    };

    return {
      boss: {
      // kindness와 communication 중 선택된 것들의 평균값 계산
        rating: getAverage(["kindness", "communication"]),
        keywords: [
          storeReviews.some(r => r.kindness > 0) && "kindness",
          storeReviews.some(r => r.communication > 0) && "communication"
        ].filter(Boolean) as string[],
        latestReview: storeReviews[0]?.review || "평가가 없습니다."
      },
      workplace: {
      // settlement와 rest 중 선택된 것들의 평균값 계산
        rating: getAverage(["settlement", "rest"]),
        keywords: [
          storeReviews.some(r => r.settlement > 0) && "settlement",
          storeReviews.some(r => r.rest > 0) && "rest"
        ].filter(Boolean) as string[],
        latestReview: storeReviews[storeReviews.length - 1]?.review || "상세 후기가 없습니다."
      }
    };
  }, [storeReviews]);

  const toggleKeyword = (key: string) => {
    setSelectedKeywords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRegisterReview = async () => {
    if (rating === 0) return alert("별점을 선택해주세요.");
    if (reviewText.length < 10) return alert("리뷰를 10자 이상 작성해주세요.");

    try {
      const body = {
        storeId: jobInfo?.storeId || storeId!,
        kindness: selectedKeywords.kindness ? rating : 0,
        communication: selectedKeywords.communication ? rating : 0,
        settlement: selectedKeywords.settlement ? rating : 0,
        rest: selectedKeywords.rest ? rating : 0,
        review: reviewText,
      };
      await storeReviewService.createReview(body);
      alert("리뷰가 등록되었습니다!");
      navigate(-1);
    } catch (e) { alert("등록 실패"); }
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-300">데이터 로딩 중...</div>;

  return (
    <main className="min-h-screen bg-[#F1F3F9] p-12 font-['Pretendard'] text-left">
      <div className={`max-w-${mode === 'write' ? '6xl' : '4xl'} mx-auto`}>
        <header className="mb-10 flex items-center gap-4">
          {mode === 'view' && (
            <button 
              onClick={() => navigate(-1)} 
              className="group p-2 -ml-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
              aria-label="뒤로 가기"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          
          <div>
            <h1 className="text-[32px] font-black text-gray-900">
              {mode === 'view' ? `근무지 평가 > ${jobInfo?.storeName || "매장"}` : "리뷰 쓰기"}
            </h1>
            {mode === 'write' && (
              <p className="text-gray-400 font-bold mt-2">완료한 근무에 대해 솔직한 후기를 남겨주세요.</p>
            )}
          </div>
        </header>

        <div className={`grid ${mode === 'write' ? 'grid-cols-[1fr_320px]' : 'grid-cols-1'} gap-10 items-start`}>
          
          <div className="space-y-8">
            {mode === 'write' ? (
              <>
                <section className="bg-white rounded-2xl p-8 border border-gray-100 flex items-center gap-6 shadow-sm">
                  <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center text-3xl shadow-inner">🏠</div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-gray-800">{jobInfo?.storeName}</h3>
                    <p className="text-sm text-gray-400 font-bold">{jobInfo?.workDate}</p>
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
                          selectedKeywords[opt.key]
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
                {aggregatedData ? (
                  <>
                    <ReviewAccordion 
                      title="사장님 평가" 
                      rating={aggregatedData.boss.rating} 
                      keywords={aggregatedData.boss.keywords} 
                      reviewText={aggregatedData.boss.latestReview} 
                    />
                    <ReviewAccordion 
                      title="근무지 평가" 
                      rating={aggregatedData.workplace.rating} 
                      keywords={aggregatedData.workplace.keywords} 
                      reviewText={aggregatedData.workplace.latestReview} 
                    />
                  </>
                ) : (
                  <div className="bg-white rounded-2xl p-20 text-center border border-gray-100 shadow-sm">
                    <p className="text-gray-400 font-bold">아직 등록된 리뷰가 없습니다.</p>
                  </div>
                )}
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