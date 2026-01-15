const Header: React.FC = () => {
  return (
    <header className="h-14 bg-white flex items-center justify-between px-6 shadow">
      <h1 className="text-xl font-bold">프로필</h1>
      <div className="flex gap-4">
        <button className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-sm text-white">
          알림
        </button>
        <button className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-sm text-white">
          프로필
        </button>
      </div>
    </header>
  );
};

export default Header;
