import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "CU", value: 300000 },
  { name: "아르바이트", value: 200000 },
  { name: "개인과외", value: 120000 },
];

const COLORS = ["#4B5563", "#9CA3AF", "#D1D5DB"];

const IncomeChart = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="font-semibold mb-4">수입 분류 차트</h3>

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
                <Cell key={index} fill={COLORS[index]} />
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
    </div>
  );
};

export default IncomeChart;
