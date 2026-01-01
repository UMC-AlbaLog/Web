const QuickAction: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-bold mb-4">빠른 액션</h3>

      <label className="flex items-center gap-2 mb-4 text-sm">
        <input type="checkbox" />
        알바 일정 직접 추가
      </label>

      <button className="bg-yellow-400 w-full py-2 rounded font-bold">
        알바 일정 추가 캘린더로 이동
      </button>
    </div>
  );
};

export default QuickAction;
