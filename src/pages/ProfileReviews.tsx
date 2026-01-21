import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";

interface Review {
  id: string;
  branchName: string; // 지점명 (예: "GS25 보문역점")
  rating: number;
  comment: string;
  createdAt: string; // 날짜 (ISO 형식)
}

type SortType = "none" | "latest" | "oldest";

// 더미 데이터 - 실제로는 API에서 가져옴
const allReviewsData: Review[] = [
  {
    id: "1",
    branchName: "GS25 보문역점",
    rating: 4,
    comment: "다시 일하고 싶어요~~",
    createdAt: "2025-01-15T10:00:00",
  },
  {
    id: "2",
    branchName: "GS25 영등포점",
    rating: 4,
    comment: "다시 일하고 싶어요~~",
    createdAt: "2025-01-10T14:30:00",
  },
  {
    id: "3",
    branchName: "GS25 성신여대점",
    rating: 4,
    comment: "다시 일하고 싶어요~~",
    createdAt: "2025-01-20T09:15:00",
  },
  {
    id: "4",
    branchName: "GS25 동숭점",
    rating: 4,
    comment: "다시 일하고 싶어요~~",
    createdAt: "2025-01-05T16:45:00",
  },
  {
    id: "5",
    branchName: "CU 상수역점",
    rating: 3,
    comment: "다시 일하고 싶어요~~",
    createdAt: "2025-01-18T11:20:00",
  },
  {
    id: "6",
    branchName: "GS25 강남점",
    rating: 5,
    comment: "최고의 환경이었어요!",
    createdAt: "2025-01-12T11:00:00",
  },
  {
    id: "7",
    branchName: "CU 역삼점",
    rating: 4,
    comment: "편하게 일할 수 있었습니다.",
    createdAt: "2025-01-08T14:00:00",
  },
];

const ITEMS_PER_PAGE = 3;

const ProfileReviews: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortType, setSortType] = useState<SortType>("none");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editedRating, setEditedRating] = useState<number>(0);
  const [editedComment, setEditedComment] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(allReviewsData);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 전체 리뷰 데이터에서 검색 및 정렬
  const processedReviews = useMemo(() => {
    let filtered = [...reviews];

    // 검색 필터링
    if (searchQuery) {
      filtered = filtered.filter((review) =>
        review.branchName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 정렬
    if (sortType === "latest") {
      filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortType === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return filtered;
  }, [searchQuery, sortType, reviews]);

  // 현재까지 표시할 리뷰 (페이지네이션)
  const displayedReviews = useMemo(() => {
    return processedReviews.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [processedReviews, currentPage]);

  const hasMore = displayedReviews.length < processedReviews.length;

  // 다음 페이지 로드
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setIsLoading(true);
      // 시뮬레이션: 실제로는 API 호출
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsLoading(false);
      }, 500);
    }
  }, [isLoading, hasMore]);

  // 무한스크롤: Intersection Observer로 스크롤 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  // 검색어나 정렬이 변경되면 페이지 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortType]);

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm("해당 리뷰를 삭제하시겠습니까?")) {
      // 리뷰 상태에서 삭제
      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
      // 실제로는 서버에 삭제 요청 후 상태 업데이트
      console.log("Delete review:", reviewId);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditedRating(review.rating);
    setEditedComment(review.comment);
  };

  const handleSaveReview = () => {
    if (editingReviewId) {
      // 리뷰 상태 업데이트
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === editingReviewId
            ? {
                ...review,
                rating: editedRating,
                comment: editedComment,
              }
            : review
        )
      );
      // 실제로는 서버에 수정 요청 후 상태 업데이트
      console.log("Save review:", editingReviewId, editedRating, editedComment);
      setEditingReviewId(null);
      setEditedRating(0);
      setEditedComment("");
    }
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditedRating(0);
    setEditedComment("");
  };

  const handleSort = () => {
    if (sortType === "none") {
      setSortType("latest");
    } else if (sortType === "latest") {
      setSortType("oldest");
    } else {
      setSortType("none");
    }
  };

  const getSortButtonText = () => {
    switch (sortType) {
      case "latest":
        return "정렬: 최신순";
      case "oldest":
        return "정렬: 오래된순";
      default:
        return "정렬";
    }
  };

  return (
    <main
      ref={scrollContainerRef}
      className="p-10 bg-[#F3F4F6] flex-1 overflow-y-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800">내 리뷰 모아보기</h1>
      </div>

      {/* 검색 및 정렬 */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색창"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={handleSort}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            sortType === "none"
              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          {getSortButtonText()}
        </button>
      </div>

      {/* 리뷰 목록 - 각 지점별로 개별 카드 */}
      <div className="space-y-6">
        {displayedReviews.length === 0 ? (
          <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white text-center">
            <p className="text-gray-600">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <>
            {displayedReviews.map((review) => {
              const isEditing = editingReviewId === review.id;
              const currentRating = isEditing ? editedRating : review.rating;
              const currentComment = isEditing ? editedComment : review.comment;

              return (
                <div
                  key={review.id}
                  className="bg-white rounded-[35px] p-8 shadow-sm border border-white"
                >
                  {/* 지점명 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-black text-gray-800">{review.branchName}</h3>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 별점 */}
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => isEditing && setEditedRating(star)}
                        disabled={!isEditing}
                        className={`${
                          isEditing ? "cursor-pointer" : "cursor-default"
                        } transition-all`}
                      >
                        <svg
                          className={`w-6 h-6 ${
                            star <= currentRating
                              ? "text-gray-800 fill-current"
                              : "text-gray-300"
                          } ${isEditing ? "hover:scale-110" : ""}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* 리뷰 내용 */}
                  <div className="bg-gray-100 rounded-lg p-4 mb-4">
                    {isEditing ? (
                      <textarea
                        value={currentComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        className="w-full bg-transparent border-none outline-none resize-none text-sm font-medium text-gray-800"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-800">{currentComment}</p>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-3 justify-end">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveReview}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition-all"
                        >
                          저장하기
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-6 py-2 bg-gray-200 rounded-lg text-sm font-bold text-gray-800 hover:bg-gray-300 transition-all"
                        >
                          취소하기
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditReview(review)}
                          className="px-6 py-2 bg-gray-200 rounded-lg text-sm font-bold text-gray-800 hover:bg-gray-300 transition-all"
                        >
                          리뷰 수정하기
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="px-6 py-2 bg-gray-200 rounded-lg text-sm font-bold text-gray-800 hover:bg-gray-300 transition-all"
                        >
                          리뷰 삭제하기
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 무한스크롤 감지 영역 */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
              {isLoading && (
                <p className="text-gray-500 text-sm">더 불러오는 중...</p>
              )}
              {!hasMore && displayedReviews.length > 0 && (
                <p className="text-gray-500 text-sm">모든 리뷰를 불러왔습니다.</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default ProfileReviews;
