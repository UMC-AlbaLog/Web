const Recommend: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
      <p className="text-sm">
        00님에게 맞는 아르바이트 추천 공고입니다.
      </p>
      <button className="bg-gray-200 px-4 py-2 rounded text-sm">
        자세히 보기
      </button>
    </div>
  );
};

export default Recommend;
