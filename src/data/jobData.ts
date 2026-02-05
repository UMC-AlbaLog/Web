import type { Work } from "../types/work";

const baseWork = (
  id: string,
  name: string,
  address: string,
  time: string,
  duration: number,
  pay: number,
  date: string,
  status: Work["status"] = "scheduled",
  applicationStatus?: Work["applicationStatus"],
  settlementStatus?: Work["settlementStatus"],
  actualPay?: number
): Work => ({
    id,
    name,
    address,
    time,
    duration,
    pay,
    expectedPay: Math.round(duration * pay),
    status,
    date,
    memo: "",
    description: `${name} 근무입니다.`,
    requirements: "성실하신 분 환영합니다.",
    notice: "근무 완료 후 정산됩니다.",
    ...(applicationStatus && { applicationStatus, appliedDate: date }),
    ...(settlementStatus && { settlementStatus }),
    ...(actualPay !== undefined && { actualPay }),
    startTime: "",
    endTime: ""
});

// 2026-01 완료·승인 작업 (수입/정산 테이블/수입 분류 차트용)
const completedJanuary: Work[] = [
  baseWork("201", "CU 홍대점", "서울 마포구 양화로 160", "14:00~18:00", 4, 9620, "2026-01-02", "completed", "approved", "completed", 42000),
  baseWork("202", "메가커피 상수점", "서울 마포구 독막로 78", "09:00~14:00", 5, 9500, "2026-01-03", "completed", "approved", "pending"),
  baseWork("203", "스타벅스 강남점", "서울 강남구 강남대로 396", "09:00~13:00", 4, 12000, "2026-01-04", "completed", "approved", "completed", 48000),
  baseWork("204", "GS25 역삼점", "서울 강남구 테헤란로 142", "18:00~23:00", 5, 10000, "2026-01-05", "completed", "approved", "pending"),
  baseWork("205", "개인카페 연남", "서울 마포구 연남로 45", "10:00~15:00", 5, 11000, "2026-01-06", "completed", "approved", "completed", 55000),
  baseWork("206", "CU 홍대점", "서울 마포구 양화로 160", "19:00~23:00", 4, 9620, "2026-01-07", "completed", "approved", "pending"),
  baseWork("207", "메가커피 상수점", "서울 마포구 독막로 78", "14:00~19:00", 5, 9500, "2026-01-08", "completed", "approved", "completed", 48000),
  baseWork("208", "스타벅스 강남점", "서울 강남구 강남대로 396", "13:00~18:00", 5, 12000, "2026-01-09", "completed", "approved", "pending"),
  baseWork("209", "배민커넥트 배달", "서울 전체", "11:00~15:00", 4, 15000, "2026-01-10", "completed", "approved", "completed", 60000),
  baseWork("210", "GS25 역삼점", "서울 강남구 테헤란로 142", "06:00~10:00", 4, 10000, "2026-01-11", "completed", "approved"),
  baseWork("211", "CU 홍대점", "서울 마포구 양화로 160", "10:00~14:00", 4, 9620, "2026-01-12", "completed", "approved", "completed", 40000),
  baseWork("212", "맥도날드 여의도점", "서울 영등포구 국제금융로 10", "14:00~18:00", 4, 12000, "2026-01-13", "completed", "approved", "pending"),
  baseWork("213", "개인카페 연남", "서울 마포구 연남로 45", "15:00~20:00", 5, 11000, "2026-01-14", "completed", "approved", "completed", 55000),
  baseWork("214", "메가커피 상수점", "서울 마포구 독막로 78", "09:00~13:00", 4, 9500, "2026-01-15", "completed", "approved"),
  baseWork("215", "스타벅스 강남점", "서울 강남구 강남대로 396", "08:00~12:00", 4, 12000, "2026-01-16", "completed", "approved", "pending"),
  baseWork("216", "시립도서관", "서울 종로구 세종대로 110", "13:00~17:00", 4, 10000, "2026-01-17", "completed", "approved", "completed", 40000),
  baseWork("217", "CU 홍대점", "서울 마포구 양화로 160", "15:00~19:00", 4, 9620, "2026-01-18", "completed", "approved", "completed", 38500),
  baseWork("218", "GS25 역삼점", "서울 강남구 테헤란로 142", "12:00~16:00", 4, 10000, "2026-01-19", "completed", "approved", "pending"),
  baseWork("219", "배민커넥트 배달", "서울 전체", "18:00~21:00", 3, 15000, "2026-01-20", "completed", "approved", "completed", 45000),
  baseWork("220", "개인카페 연남", "서울 마포구 연남로 45", "11:00~16:00", 5, 11000, "2026-01-21", "completed", "approved"),
  // 2025-12 완료 (이전 달 수입용)
  baseWork("221", "CU 홍대점", "서울 마포구 양화로 160", "14:00~18:00", 4, 9620, "2025-12-15", "completed", "approved", "completed", 40000),
  baseWork("222", "스타벅스 강남점", "서울 강남구 강남대로 396", "09:00~13:00", 4, 12000, "2025-12-18", "completed", "approved", "completed", 48000),
  baseWork("223", "메가커피 상수점", "서울 마포구 독막로 78", "10:00~15:00", 5, 9500, "2025-12-20", "completed", "approved", "pending"),
  baseWork("224", "GS25 역삼점", "서울 강남구 테헤란로 142", "18:00~22:00", 4, 10000, "2025-12-22", "completed", "approved"),
  baseWork("225", "배민커넥트 배달", "서울 전체", "12:00~16:00", 4, 15000, "2025-12-28", "completed", "approved", "completed", 60000),
  // 2026-02 완료 (다음 달용)
  baseWork("226", "CU 홍대점", "서울 마포구 양화로 160", "10:00~14:00", 4, 9620, "2026-02-01", "completed", "approved", "pending"),
  baseWork("227", "개인카페 연남", "서울 마포구 연남로 45", "15:00~20:00", 5, 11000, "2026-02-02", "completed", "approved"),
  baseWork("228", "스타벅스 강남점", "서울 강남구 강남대로 396", "08:00~12:00", 4, 12000, "2026-02-03", "completed", "approved", "completed", 48000),
];

// 업커밍/지원 가능 일자리
const upcomingJobs: Work[] = [
  baseWork("101", "GS25 영등포역점", "서울 영등포구 경인로102길 4", "10:00~13:30", 3.5, 11500, "2026-01-25"),
  baseWork("102", "컴포즈커피 신길점", "서울 영등포구 신풍로 93", "17:00~22:00", 5, 11000, "2026-01-26"),
  baseWork("103", "맥도날드 여의도점", "서울 영등포구 국제금융로 10 IFC몰 L3층", "14:00~18:00", 4, 12000, "2026-01-27"),
  baseWork("104", "스타벅스 당산점", "서울 영등포구 양평로 64", "09:00~13:00", 4, 11500, "2026-01-28"),
  baseWork("105", "올리브영 강남점", "서울 강남구 강남대로 420", "11:00~16:00", 5, 11800, "2026-01-29"),
  baseWork("106", "파리바게뜨 신촌점", "서울 서대문구 연세로 10", "07:30~12:30", 5, 11200, "2026-01-30"),
  baseWork("107", "이디야 홍대점", "서울 마포구 와우산로 80", "10:00~15:00", 5, 9500, "2026-01-31"),
  baseWork("108", "투썸플레이스 강남역점", "서울 강남구 강남대로 396", "12:00~17:00", 5, 10500, "2026-02-01"),
  baseWork("109", "세븐일레븐 역삼점", "서울 강남구 테헤란로 152", "06:00~10:00", 4, 9800, "2026-02-02"),
  baseWork("110", "빽다방 신촌점", "서울 서대문구 신촌로 120", "08:00~13:00", 5, 9000, "2026-02-03"),
  baseWork("111", "한솥도시락 여의도점", "서울 영등포구 여의대로 108", "11:00~14:00", 3, 10000, "2026-02-04"),
  baseWork("112", "버거킹 강남점", "서울 강남구 강남대로 420", "17:00~22:00", 5, 11500, "2026-02-05"),
  baseWork("113", "GS25 마곡점", "서울 강서구 마곡중앙로 160", "09:00~14:00", 5, 9620, "2026-02-06"),
  baseWork("114", "카페베네 판교점", "경기 성남시 분당구 판교역로 235", "10:00~16:00", 6, 9500, "2026-02-07"),
  baseWork("115", "CU 대학로점", "서울 종로구 대학로 120", "14:00~19:00", 5, 9620, "2026-02-08"),
];

export const INITIAL_JOBS: Work[] = [...completedJanuary, ...upcomingJobs];
