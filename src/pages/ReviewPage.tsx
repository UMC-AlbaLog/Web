import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobs } from "../hooks/useJobs";
import { DUMMY_BOSS_REVIEWS, DUMMY_WORKPLACE_REVIEWS } from "../data/reviewData";
import RatingRow from "../components/jobs/review/RatingRow";
import ReviewAccordion from "../components/jobs/review/ReviewAccordion";

const ReviewPage: React.FC<{ mode: "view" | "write" }> = ({ mode }) => {
  const { jobId, workplaceId } = useParams();
  const navigate = useNavigate();
  const { jobs } = useJobs(); 
  
  const [targetInfo, setTargetInfo] = useState<{ name: string; date: string } | null>(null);
  const [openSection, setOpenSection] = useState<'boss' | 'workplace' | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    const id = jobId || workplaceId;
    if (!id) return;
    const foundInJobs = jobs.find(j => j.id === id);
    if (foundInJobs) {
      setTargetInfo({ name: foundInJobs.name, date: foundInJobs.date });
    } else {
      const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      const workplaces = JSON.parse(localStorage.getItem('workplaces') || '[]');
      const schedule = schedules.find((s: any) => s.id === id || s.jobId === id);
      if (schedule) {
        const wp = workplaces.find((w: any) => w.id === schedule.workplaceId);
        setTargetInfo({ name: wp?.name || schedule.workplaceName || "알바 매장", date: schedule.date });
      }
    }
  }, [jobs, jobId, workplaceId]);

  const [ratings, setRatings] = useState({ kindness: 5, communication: 5, settlement: 5, restTime: 5, cleanliness: 5, congestion: 5, safety: 5, restSpace: 5 });
  const [bossComment, setBossComment] = useState("");
  const [workplaceComment, setWorkplaceComment] = useState("");

  const bossAvg = useMemo(() => ((ratings.kindness + ratings.communication + ratings.settlement + ratings.restTime) / 4).toFixed(1), [ratings]);
  const workplaceAvg = useMemo(() => ((ratings.cleanliness + ratings.congestion + ratings.safety + ratings.restSpace) / 4).toFixed(1), [ratings]);

  const handleSaveReview = () => {
    const newReview = { jobId: jobId || workplaceId, jobName: targetInfo?.name, bossRating: bossAvg, workplaceRating: workplaceAvg, bossComment, workplaceComment, date: new Date().toLocaleDateString('ko-KR') };
    const existing = JSON.parse(localStorage.getItem('user_reviews') || '[]');
    localStorage.setItem('user_reviews', JSON.stringify([...existing, newReview]));
    alert("평가가 저장되었습니다.");
    navigate(-1);
  };

  return (
    <main className="flex-1 bg-[#F3F4F6] p-10 overflow-y-auto text-center">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-gray-800">근무지 평가</h1>
        <p className="text-sm font-bold text-blue-600 mt-2">{targetInfo?.name || "매장 정보를 불러오고 있어요"}</p>
        {mode === 'write' && <p className="text-xs text-gray-400 mt-1">{targetInfo?.date?.replace(/-/g, '.') || "로딩 중..."} 근무</p>}
      </div>

      <div className="max-w-3xl mx-auto space-y-6 text-left">
        <ReviewAccordion title="사장님 평가" avgRating={mode === 'write' ? bossAvg : DUMMY_BOSS_REVIEWS.averageRating.toString()} mode={mode} isOpen={openSection === 'boss'} onToggle={() => setOpenSection(openSection === 'boss' ? null : 'boss')} reviews={DUMMY_BOSS_REVIEWS.reviews} expandedReviews={expandedReviews} onReadMore={(id) => setExpandedReviews(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; })}>
          <div className="space-y-6">
             <RatingRow 
                label="사장님의 전반적인 친절도는 어땠나요?" 
                value={mode === 'view' ? DUMMY_BOSS_REVIEWS.detailRatings.kindness : ratings.kindness} 
                onChange={(v) => mode === 'write' && setRatings(p => ({...p, kindness: v}))} 
                disabled={mode === 'view'}
             />
             <RatingRow 
                label="사장님과의 소통은 얼마나 월활했나요?" 
                value={mode === 'view' ? DUMMY_BOSS_REVIEWS.detailRatings.communication : ratings.communication} 
                onChange={(v) => mode === 'write' && setRatings(p => ({...p, communication: v}))} 
                disabled={mode === 'view'}
             />
             <RatingRow 
                label="약속된 시급과 정산은 정확하게 지켜졌나요?" 
                value={mode === 'view' ? DUMMY_BOSS_REVIEWS.detailRatings.settlement : ratings.settlement} 
                onChange={(v) => mode === 'write' && setRatings(p => ({...p, settlement: v}))} 
                disabled={mode === 'view'}
             />
             <RatingRow 
                label="근무 중 휴게시간은 안내된 대로 보장되었나요?" 
                value={mode === 'view' ? DUMMY_BOSS_REVIEWS.detailRatings.restTime : ratings.restTime} 
                onChange={(v) => mode === 'write' && setRatings(p => ({...p, restTime: v}))} 
                disabled={mode === 'view'}
             />
          </div>
          {mode === 'write' && 
            <textarea 
                value={bossComment} 
                onChange={(e) => setBossComment(e.target.value)}
                placeholder="리뷰를 남겨주세요(선택 사항)" 
                className="w-full mt-8 bg-gray-50 rounded-2xl p-6 text-sm min-h-30 outline-none border-none focus:ring-2 focus:ring-yellow-400"
             />
          }
        </ReviewAccordion>

        <ReviewAccordion title="근무지 평가" avgRating={mode === 'write' ? workplaceAvg : DUMMY_WORKPLACE_REVIEWS.averageRating.toString()} mode={mode} isOpen={openSection === 'workplace'} onToggle={() => setOpenSection(openSection === 'workplace' ? null : 'workplace')} reviews={DUMMY_WORKPLACE_REVIEWS.reviews} expandedReviews={expandedReviews} onReadMore={(id) => setExpandedReviews(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; })}>
          <div className="space-y-6">
             <RatingRow 
                label="매장 내부의 전반적인 청결 상태는 어땠나요?" 
                value={mode === 'view' ? DUMMY_WORKPLACE_REVIEWS.detailRatings.cleanliness : ratings.cleanliness} 
                onChange={(v) => mode === 'write' && setRatings(p => ({...p, cleanliness: v}))} 
                disabled={mode === 'view'}
             />
             <RatingRow 
                label="근무 시간 동안 매장 혼잡도는 어느 정도였나요?" 
                value={mode === 'view' ? DUMMY_WORKPLACE_REVIEWS.detailRatings.congestion : ratings.congestion} 
                onChange={(v) => mode === 'write' && setRatings(p => ({...p, congestion: v}))} 
                disabled={mode === 'view'}
             />
             <RatingRow 
                label="근무 중 안전/위험 요소는 어떻게 느끼셨나요?" 
                value={mode === 'view' ? DUMMY_WORKPLACE_REVIEWS.detailRatings.safety : ratings.safety} 
                onChange={(v) => mode === 'write' && setRatings(p => ({...p, safety: v}))} 
                disabled={mode === 'view'}
             />
             <RatingRow 
                label="매장의 휴게 공간은 편안하고 이용하기 쉬웠나요?" 
                value={mode === 'view' ? DUMMY_WORKPLACE_REVIEWS.detailRatings.restSpace : ratings.restSpace} 
                onChange={(v) => mode === 'write' && setRatings(p => ({...p, restSpace: v}))} 
                disabled={mode === 'view'}
             />
          </div>
          {mode === 'write' && 
            <textarea
                value={workplaceComment}
                onChange={(e) => setWorkplaceComment(e.target.value)}
                placeholder="리뷰를 남겨주세요(선택 사항)"
                className="w-full mt-8 bg-gray-50 rounded-2xl p-6 text-sm min-h-30 outline-none border-none focus:ring-2 focus:ring-yellow-400"
             />
          }
        </ReviewAccordion>

        <div className="flex gap-4 mt-8">
          <button onClick={() => navigate(-1)} className="flex-1 bg-white py-5 rounded-3xl font-black text-gray-400 border border-gray-200">뒤로가기</button>
          {mode === 'write' &&
           <button 
            onClick={handleSaveReview}
            className="flex-1 bg-yellow-400 py-5 rounded-3xl font-black text-gray-800 shadow-lg transition-all active:scale-95">평가하기
           </button>
          }
        </div>
      </div>
    </main>
  );
};

export default ReviewPage;