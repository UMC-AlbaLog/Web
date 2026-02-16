import React, { useState, useEffect } from "react";
import { getUserReviews, updateReview, deleteReview } from "../api/reviews";

interface Review {
  id: string;
  company: string;
  date: string;
  text: string;
  rating: number;
}

const ProfileReviews: React.FC = () => {
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingRating, setEditingRating] = useState(5);

  // 평균 별점 계산
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const totalReviews = reviews.length;

  // 리뷰 데이터 로드
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoadingInitial(true);
        const reviewData = await getUserReviews();
        
        // API 응답을 UI에서 사용하는 Review 형식으로 변환
        const mappedReviews: Review[] = reviewData.map((item) => ({
          id: item.reviewId,
          company: item.storeName || "알 수 없음",
          text: item.content || "",
          rating: item.rating || 0,
          date: item.createdAt 
            ? new Date(item.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).replace(/\./g, ".").replace(/\s/g, "")
            : new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).replace(/\./g, ".").replace(/\s/g, ""),
        }));
        
        // 정렬 적용
        const sorted = sortOrder === "latest"
          ? mappedReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          : mappedReviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setReviews(sorted);
      } catch (error) {
        console.error("리뷰 로드 실패:", error);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    loadReviews();
  }, [sortOrder]);

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("리뷰를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteReview(id);
      setReviews(reviews.filter((review) => review.id !== id));
      alert("리뷰가 삭제되었습니다.");
    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
      alert(error instanceof Error ? error.message : "리뷰 삭제에 실패했습니다.");
    }
  };

  const handleStartEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditingContent(review.text);
    setEditingRating(review.rating);
  };

  const handleCancelEditReview = () => {
    setEditingReviewId(null);
    setEditingContent("");
    setEditingRating(5);
  };

  const handleSaveEditReview = async () => {
    if (!editingReviewId) return;

    try {
      await updateReview(editingReviewId, {
        content: editingContent,
        rating: editingRating,
      });

      // 로컬 상태 업데이트
      setReviews(reviews.map((review) =>
        review.id === editingReviewId
          ? { ...review, text: editingContent, rating: editingRating }
          : review
      ));

      setEditingReviewId(null);
      setEditingContent("");
      setEditingRating(5);
      alert("리뷰가 수정되었습니다.");
    } catch (error) {
      console.error("리뷰 수정 실패:", error);
      alert(error instanceof Error ? error.message : "리뷰 수정에 실패했습니다.");
    }
  };

  return (
    <div 
      className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto min-h-full"
    >
      <div className="max-w-4xl mx-auto min-h-full">
        {/* 페이지 제목 */}
        <h1 className="text-xl font-bold text-gray-800 mb-4">내가 쓴 리뷰</h1>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 작성한 리뷰 카드 */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{totalReviews}</p>
                <p className="text-xs text-gray-600">작성한 리뷰</p>
              </div>
            </div>
          </div>

          {/* 평균 별점 카드 */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{averageRating.toFixed(1)}</p>
                <p className="text-xs text-gray-600">평균 별점</p>
              </div>
            </div>
          </div>
        </div>

        {/* 정렬 버튼 */}
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setSortOrder(sortOrder === "latest" ? "oldest" : "latest")}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <span>최신순</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* 리뷰 목록 */}
        {isLoadingInitial ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500">작성한 리뷰가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg p-4 border border-gray-200">
                {editingReviewId === review.id ? (
                  // 수정 모드
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">매장명</label>
                      <p className="text-sm text-gray-800">{review.company}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">리뷰 내용</label>
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="리뷰 내용을 입력하세요"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">별점</label>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setEditingRating(i + 1)}
                            className="focus:outline-none"
                          >
                            <svg
                              className={`w-6 h-6 ${i < editingRating ? "text-yellow-400" : "text-gray-300"}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                        <span className="text-sm text-gray-600 ml-2">{editingRating}점</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveEditReview}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        저장
                      </button>
                      <button
                        onClick={handleCancelEditReview}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  // 보기 모드
                  <>
                    {/* 매장명과 작성일 */}
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold text-gray-800 mb-0.5">{review.company}</h3>
                      <p className="text-xs text-gray-500">작성일 {review.date}</p>
                    </div>

                    {/* 리뷰 내용과 별점 */}
                    <div className="flex items-start gap-4 mb-3">
                      <p className="text-sm text-gray-700 leading-relaxed flex-1">{review.text}</p>
                      <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">별점 {review.rating}.0점</span>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex gap-4 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        삭제
                      </button>
                      <button
                        onClick={() => handleStartEditReview(review)}
                        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        리뷰 수정
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfileReviews;
