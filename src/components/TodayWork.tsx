const TodayWork: React.FC = () => {
  return (
    <div className="bg-gray-300 rounded-lg p-10 text-center">
      <div className="text-5xl font-bold mb-4">!</div>
      <p className="text-lg font-semibold">
        아직 등록된 알바 일정이 없어요
      </p>
      <p className="mb-6">알바 일정을 추가해주세요</p>

      <button className="bg-yellow-400 px-6 py-2 rounded font-bold">
        알바 일정 추가
      </button>
    </div>
  );
};

export default TodayWork;
