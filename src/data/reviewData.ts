export interface ReviewItem {
  id: string;
  author: string;
  date: string;
  rating: number;
  content: string;
  tags?: string[];
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  detailRatings: { [key: string]: number };
  reviews: ReviewItem[];
}

// 사장님 평가 더미 데이터
export const DUMMY_BOSS_REVIEWS: ReviewSummary = {
  averageRating: 4.8,
  totalReviews: 12,
  detailRatings: { kindness: 4.8, communication: 4.5, settlement: 5.0, restTime: 4.2 },
  reviews: [
    { id: "r1", author: "김**", date: "2026.01.10", rating: 5, content: "사장님 정말 친절하시고 첫날이라 어리버리했는데 잘 알려주셨어요! 정산도 바로 해주셔서 좋았습니다."},
    { id: "r2", author: "이**", date: "2025.12.25", rating: 4, content: "바쁜 시간대라 조금 정신없긴 했지만 요구사항 명확하게 말씀해주셔서 일하기 편했습니다."},
    { id: "r3", author: "박**", date: "2025.11.30", rating: 5, content: "약속된 시급 정확히 주시고 쉬는 시간도 잘 챙겨주셨습니다."},
  ],
};

// 근무지 평가 더미 데이터
export const DUMMY_WORKPLACE_REVIEWS: ReviewSummary = {
  averageRating: 4.5,
  totalReviews: 10,
  detailRatings: { cleanliness: 4.5, congestion: 3.5, safety: 4.8, restSpace: 4.0 },
  reviews: [
    { id: "w1", author: "최**", date: "2026.01.05", rating: 5, content: "매장이 전체적으로 깨끗해서 좋았어요. 손님이 많긴 했지만 일하는 동선이 불편하진 않았습니다."},
    { id: "w2", author: "정**", date: "2025.12.15", rating: 4, content: "휴게 공간이 조금 좁긴 했지만, 잠깐 쉬기에는 충분했습니다. 매장 내에 위험 요소는 딱히 없었어요."},
  ],
};