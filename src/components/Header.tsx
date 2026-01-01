const Header: React.FC = () => {
  return (
    <header className="h-14 bg-white flex justify-end items-center px-6 gap-4 shadow">
      <button className="text-sm">알림</button>
      <button className="text-sm">프로필</button>
    </header>
  );
};

export default Header;
