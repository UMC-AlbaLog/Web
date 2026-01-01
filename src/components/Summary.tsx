interface CardProps {
  title: string;
  value: string;
}

const Card: React.FC<CardProps> = ({ title, value }) => {
  return (
    <div className="bg-white rounded-lg p-6 w-52 text-center shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  );
};

const Summary: React.FC = () => {
  return (
    <div className="flex gap-6">
      <Card title="오늘 근무 개수" value="0건" />
      <Card title="총 근무 시간" value="0시간" />
      <Card title="예상 수입" value="0원" />
    </div>
  );
};

export default Summary;
