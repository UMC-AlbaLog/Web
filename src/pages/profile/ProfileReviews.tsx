import { useEffect, useMemo, useState } from "react";

type Review = {
  id: number;
  storeName: string;
  rating: number;
  content: string;
};

const generateMockReviews = (): Review[] => {
  const base: Review[] = [
    {
      id: 1,
      storeName: "GS25 영등포점",
      rating: 5,
      content: "다시 일하고 싶어요~~",
    },
    {
      id: 2,
      storeName: "CU 상수역점",
      rating: 4,
      content: "다시 일하고 싶어요~~",
    },
  ];

  const list: Review[] = [];
  for (let i = 0; i < 10; i++) {
    base.forEach((b) => {
      list.push({
        ...b,
        id: list.length + 1,
      });
    });
  }
  return list;
};

const ALL_REVIEWS = generateMockReviews();

const ProfileReviews = () => {
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);
  const [reviews, setReviews] = useState<Review[]>(ALL_REVIEWS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const filteredSorted = useMemo(() => {
    let list = reviews;
    if (search.trim()) {
      const q = search.trim();
      list = list.filter(
        (r) =>
          r.storeName.includes(q) ||
          r.content.includes(q) ||
          String(r.rating).includes(q)
      );
    }
    const sorted = [...list].sort((a, b) =>
      sortAsc
        ? a.storeName.localeCompare(b.storeName)
        : b.storeName.localeCompare(a.storeName)
    );
    return sorted;
  }, [reviews, search, sortAsc]);

  const visibleReviews = filteredSorted.slice(0, visibleCount);

  // 무한 스크롤: 아래로 스크롤 시 더 불러오기
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollHeight - scrollTop - clientHeight < 100) {
        setVisibleCount((prev) => {
          if (prev >= filteredSorted.length) return prev;
          return prev + 4;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredSorted.length]);

  const handleContentChange = (id: number, value: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, content: value } : r))
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <main className="flex-1 p-6 bg-gray-200">
      <h1 className="text-xl font-bold mb-6">내 리뷰 모아보기</h1>

      {/* 검색 + 정렬 */}
      <div className="flex gap-4 mb-6 items-center">
        <div className="flex-1 flex items-center bg-white rounded-full px-4 border">
          <span className="mr-2 text-gray-500">🔍</span>
          <input
            className="flex-1 py-2 outline-none"
            placeholder="검색창"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setVisibleCount(4);
            }}
          />
        </div>
        <button
          className="bg-white border px-6 rounded"
          type="button"
          onClick={() => setSortAsc((prev) => !prev)}
        >
          정렬
        </button>
      </div>

      {/* 리뷰 카드들 */}
      {visibleReviews.map((review) => (
        <section
          key={review.id}
          className="bg-white p-6 rounded-lg mb-6 shadow-sm"
        >
          <h3 className="font-bold mb-2">{review.storeName}</h3>

          {/* 별점 */}
          <div className="flex items-center gap-1 mb-3 text-yellow-400 text-2xl">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < review.rating ? "★" : "☆"}</span>
            ))}
          </div>

          {/* 리뷰 내용: 클릭 시 바로 수정 가능 */}
          <div
            className="bg-gray-200 p-4 rounded mb-4 cursor-text"
            onClick={() => setEditingId(review.id)}
          >
            {editingId === review.id ? (
              <textarea
                className="w-full bg-transparent outline-none resize-none"
                rows={2}
                value={review.content}
                onChange={(e) =>
                  handleContentChange(review.id, e.target.value)
                }
                onBlur={() => setEditingId(null)}
                autoFocus
              />
            ) : (
              <p>{review.content}</p>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-4">
            <button
              className="bg-gray-200 px-6 py-2 rounded"
              type="button"
              onClick={() => setEditingId(review.id)}
            >
              리뷰 수정하기
            </button>
            <button
              className="bg-gray-200 px-6 py-2 rounded"
              type="button"
              onClick={() => setDeleteTarget(review)}
            >
              리뷰 삭제하기
            </button>
          </div>
        </section>
      ))}

      {/* 삭제 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="border-b px-6 py-4 text-center text-sm">
              해당 리뷰를 삭제하시겠습니까?
            </div>
            <div className="grid grid-cols-2">
              <button
                type="button"
                className="px-6 py-4 border-r hover:bg-gray-100"
                onClick={() => setDeleteTarget(null)}
              >
                취소하기
              </button>
              <button
                type="button"
                className="px-6 py-4 hover:bg-gray-100 text-red-600"
                onClick={handleConfirmDelete}
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProfileReviews;
