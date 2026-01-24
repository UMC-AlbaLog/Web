import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface IncomeChartProps {
  incomeByStore: { name: string; value: number }[];
}

const COLORS = ["#4B5563", "#9CA3AF", "#D1D5DB", "#F3F4F6", "#E5E7EB"];

const IncomeChart = ({ incomeByStore }: IncomeChartProps) => {
  // 데이터가 없을 경우 빈 배열 처리
  const data = incomeByStore.length > 0 ? incomeByStore : [{ name: "데이터 없음", value: 0 }];

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="font-semibold mb-4">수입 분류 차트</h3>

      {data.length > 0 && data[0].value > 0 ? (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-4 text-sm space-y-1">
            {data.map((d) => (
              <li key={d.name}>
                {d.name}: {d.value.toLocaleString()}원
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>수입 데이터가 없습니다</p>
        </div>
      )}
    </div>
  );
};

export default IncomeChart;
