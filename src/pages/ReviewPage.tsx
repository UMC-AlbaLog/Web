import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { storeReviewService } from "../api/storeReviewService";
import RatingRow from "../components/jobs/review/RatingRow";
import ReviewAccordion from "../components/jobs/review/ReviewAccordion";

interface ReviewPageProps { mode: "view" | "write"; }

const ReviewPage: React.FC<ReviewPageProps> = ({ mode }) => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedData = location.state as { 
    storeName: string; 
    workDate: string;
    realStoreId: string;
   } | null;

  const [loading, setLoading] = useState(true);
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
      if (!storeId || mode === "write") {
        setLoading(false);
        return;
      }
        
      try {
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
  
    let totalBossAvgSum = 0;
    let totalWorkplaceAvgSum = 0;
    const bossReviews: any[] = [];
    const workplaceReviews: any[] = [];

    storeReviews.forEach(rev => {
      // 각 리뷰어 개별의 사장님/근무지 평균 계산
      const individualBossAvg = ((rev.kindness || 0) + (rev.communication || 0)) / 2;
      const individualWorkplaceAvg = ((rev.settlement || 0) + (rev.rest || 0)) / 2;

      // 전체 평균(평균의 평균)을 내기 위한 합산
      totalBossAvgSum += individualBossAvg;
      totalWorkplaceAvgSum += individualWorkplaceAvg;

      const reviewItem = {
        ...rev,
        keywords: [
          rev.kindness > 0 && "kindness",
          rev.communication > 0 && "communication",
          rev.settlement > 0 && "settlement",
          rev.rest > 0 && "rest"
        ].filter(Boolean) as string[]
      };

      // 점수가 더 높은 섹션으로 배치
      if (individualBossAvg >= individualWorkplaceAvg) bossReviews.push(reviewItem);
      else workplaceReviews.push(reviewItem);
    });

    return {
      bossRating: totalBossAvgSum / (storeReviews.length || 1),
      workplaceRating: totalWorkplaceAvgSum / (storeReviews.length || 1),
      bossReviews,
      workplaceReviews
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
        storeId: passedData?.realStoreId || storeId!, 
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
              {mode === 'view' ? `근무지 평가 > ${passedData?.storeName || "매장"}` : "리뷰 쓰기"}
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
                <section className="bg-[#F1F3F9] rounded-2xl p-8 border border-gray-100 flex items-center gap-6 shadow-sm transition-all">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 21H21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 7L12 3L21 7V21H3V7Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 21V12H15V21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>                

                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-gray-800">
                      {passedData?.storeName || passedData?.storeName || "매장 정보"}
                    </h3>
                    <p className="text-sm text-gray-400 font-bold">
                      {passedData?.workDate || passedData?.workDate || "날짜 정보"}
                    </p>
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
                    <section className="space-y-6">
                      <div className="flex justify-between items-end px-2">
                        <h2 className="text-2xl font-black text-gray-800">사장님 평가</h2>
                        <div className="text-right">
                          <span className="text-3xl font-black text-[#5D5FEF]">{aggregatedData.bossRating.toFixed(1)}</span>
                          <span className="text-gray-300 font-bold ml-1">/ 5.0</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {aggregatedData.bossReviews.map(rev => (
                          <ReviewAccordion 
                            key={rev.reviewId}
                            title="" 
                            rating={rev.totalScore}
                            keywords={rev.keywords}
                            reviewText={rev.review}
                          />
                        ))}
                      </div>
                    </section>

                    <section className="space-y-6">
                      <div className="flex justify-between items-end px-2">
                        <h2 className="text-2xl font-black text-gray-800">근무지 평가</h2>
                        <div className="text-right">
                          <span className="text-3xl font-black text-[#5D5FEF]">{aggregatedData.workplaceRating.toFixed(1)}</span>
                          <span className="text-gray-300 font-bold ml-1">/ 5.0</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {aggregatedData.workplaceReviews.map(rev => (
                          <ReviewAccordion 
                            key={rev.reviewId}
                            title=""
                            rating={rev.totalScore}
                            keywords={rev.keywords}
                            reviewText={rev.review}
                          />
                        ))}
                      </div>
                    </section>
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