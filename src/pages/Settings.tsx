import { useState } from "react";

type TabKey = "alarm" | "settlement" | "work";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("alarm");

  const renderTabButton = (key: TabKey, label: string) => {
    const isActive = activeTab === key;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(key)}
        className={`px-10 py-3 text-sm font-medium border rounded-t-xl ${
          isActive
            ? "bg-gray-500 text-white border-gray-500"
            : "bg-white text-black border-gray-300"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <main className="flex-1 bg-gray-200 px-16 py-8">
      <h1 className="text-2xl font-bold mb-6">설정</h1>
      <p className="text-xl font-semibold mb-8">Settings</p>

      {/* 상단 탭 */}
      <div className="flex gap-0 mb-8">
        {renderTabButton("alarm", "알림 설정")}
        {renderTabButton("settlement", "정산 정보")}
        {renderTabButton("work", "근무 환경")}
      </div>

      {/* 탭 내용 */}
      {activeTab === "alarm" && <AlarmSettings />}
      {activeTab === "settlement" && <SettlementSettings />}
      {activeTab === "work" && <WorkEnvSettings />}
    </main>
  );
};

const ToggleRow = ({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between bg-white rounded-full px-6 py-3 mb-3 shadow-sm"
    >
      <span className="text-sm">{label}</span>
      <div
        className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
          on ? "bg-gray-600" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-5" : ""
          }`}
        />
      </div>
    </button>
  );
};

const AlarmSettings = () => {
  const [states, setStates] = useState<boolean[]>(Array(7).fill(false));

  const toggleIndex = (index: number) => {
    setStates((prev) =>
      prev.map((v, i) => (i === index ? !v : v))
    );
  };

  return (
    <section className="max-w-3xl">
      <ToggleRow
        label="전체 알림"
        on={states[0]}
        onToggle={() => toggleIndex(0)}
      />
      <ToggleRow
        label="근무 관련 알림"
        on={states[1]}
        onToggle={() => toggleIndex(1)}
      />
      <ToggleRow
        label="출근/퇴근 시간 알림"
        on={states[2]}
        onToggle={() => toggleIndex(2)}
      />
      <ToggleRow
        label="근무 시작 전 알림"
        on={states[3]}
        onToggle={() => toggleIndex(3)}
      />
      <ToggleRow
        label="대타 추천 관련 알림"
        on={states[4]}
        onToggle={() => toggleIndex(4)}
      />
      <ToggleRow
        label="신규 맞춤 대타 공고 알림"
        on={states[5]}
        onToggle={() => toggleIndex(5)}
      />
      <ToggleRow
        label="정산 완료/대기 상태 변경 알림"
        on={states[6]}
        onToggle={() => toggleIndex(6)}
      />
    </section>
  );
};

const SettlementSettings = () => {
  return (
    <section className="space-y-10 max-w-3xl">
      {/* 계좌 정보 */}
      <div>
        <h2 className="font-bold text-lg mb-4">정산 정보</h2>

        <div className="mb-2">
          <label className="block mb-1 text-sm">은행명</label>
          <div className="flex gap-3">
            <input
              className="flex-1 bg-white rounded px-4 py-2"
              defaultValue="신한"
              readOnly
            />
            <button className="px-6 py-2 rounded bg-gray-500 text-white text-sm">
              수정
            </button>
          </div>
        </div>

        <div className="mb-2">
          <label className="block mb-1 text-sm">계좌번호</label>
          <input
            className="w-full bg-white rounded px-4 py-2"
            defaultValue="110-000-0000000"
            readOnly
          />
        </div>

        <div className="mb-1">
          <label className="block mb-1 text-sm">예금주</label>
          <input
            className="w-full bg-white rounded px-4 py-2"
            defaultValue="홍길동"
            readOnly
          />
        </div>

        <p className="mt-1 text-xs text-gray-600">
          *계좌 번호는 본인 명의의 계좌만 가능합니다
        </p>
      </div>

      {/* 정산 내역 확인 */}
      <div>
        <h2 className="font-bold text-lg mb-2">정산 내역 확인</h2>
        <p className="text-sm mb-4">
          이전 정산 내역의 검색을 빠르게 확인할 수 있습니다.
        </p>
        <button className="w-full bg-white rounded-full py-3 text-sm shadow-sm">
          [정산 내역 바로가기]
        </button>
      </div>

      {/* 정산 주기 안내 */}
      <div>
        <h2 className="font-bold text-lg mb-3">정산 주기 및 방식 안내</h2>
        <p className="text-sm mb-1">
          정산 주기: 매월 1일 (전월 1일~말일 기준)
        </p>
        <p className="text-sm mb-1">
          지급 방식: 영업일 기준 3일 이내 자동 이체
        </p>
        <p className="text-sm mb-4">
          수수료: 서비스 약관에 따른 0% 부과
        </p>
        <p className="text-xs text-gray-500">
          [정산 정책 상세 내용 보기]
        </p>
      </div>
    </section>
  );
};

const WorkEnvSettings = () => {
  return (
    <section className="space-y-8 max-w-3xl">
      {/* 주요 활동 지역 설정 */}
      <div className="bg-white rounded-2xl px-10 py-8">
        <h2 className="font-bold text-lg mb-6">주요 활동 지역 설정</h2>

        <div className="border rounded-xl px-6 py-3 flex items-center mb-4">
          <span className="mr-2 text-gray-500">🔍</span>
          <input
            className="flex-1 outline-none"
            placeholder="검색창"
          />
        </div>

        <p className="text-sm mb-3">선택 항목</p>
        <div className="flex gap-3 mb-4">
          <button className="px-6 py-2 rounded-full bg-gray-300 text-sm">
            강남구
          </button>
          <button className="px-6 py-2 rounded-full bg-gray-300 text-sm">
            용산구
          </button>
        </div>

        <p className="text-xs text-gray-600">
          *대타 추천 시 기본 필터로 사용됩니다.
        </p>
      </div>

      {/* 시간대 / 달력 표시 방식 설정 */}
      <div className="bg-white rounded-2xl px-10 py-8">
        <h2 className="font-bold text-lg mb-6">시간대/달력 표시 방식 설정</h2>

        <div className="mb-6">
          <p className="text-sm mb-3">주 시작 요일</p>
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full bg-gray-400 text-white text-sm">
              월
            </button>
            <button className="w-10 h-10 rounded-full bg-gray-200 text-sm">
              일
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm mb-3">24시간제(오전/오후)</p>
          <div className="w-12 h-6 rounded-full bg-gray-300 flex items-center px-1 mb-2">
            <div className="w-4 h-4 rounded-full bg-white shadow" />
          </div>
          <p className="text-xs text-gray-600">예) 00:00~23:59</p>
        </div>
      </div>
    </section>
  );
};

export default Settings;


