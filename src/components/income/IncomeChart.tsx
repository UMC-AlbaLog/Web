import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface IncomeChartProps {
  incomeByStore: { name: string; value: number }[];
}

const COLORS = ["#86efac", "#fcd34d", "#f9a8d4", "#93c5fd", "#c4b5fd"];

const IncomeChart = ({ incomeByStore }: IncomeChartProps) => {
  const hasData =
    incomeByStore.length > 0 &&
    incomeByStore.some((d) => d.value > 0);
  const data = hasData
    ? incomeByStore.filter((d) => d.value > 0)
    : [{ name: "데이터 없음", value: 1 }];

  return (
    <div className="bg-slate-100/20 rounded-[35px] p-6 min-w-0 flex flex-col">
      <h3 className="text-white text-2xl font-semibold font-['Pretendard'] mb-4 shrink-0">
        수입 분류 차트
      </h3>

      <div className="w-full min-h-[256px] flex-1" style={{ height: 256 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, value }) =>
                hasData ? `${name} ${value > 0 ? value.toLocaleString() + "원" : ""}` : name
              }
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {hasData ? (
        <ul className="mt-4 text-zinc-300 text-base font-normal font-['Pretendard'] space-y-1.5 shrink-0">
          {incomeByStore.map((d, i) => {
            const total = incomeByStore.reduce((s, x) => s + x.value, 0);
            const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
            return (
              <li key={d.name} className="inline-flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-[3px] shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                {d.name} | {pct}%, {d.value.toLocaleString()}원
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-zinc-400 text-base font-['Pretendard'] shrink-0">
          수입 데이터가 없습니다
        </p>
      )}
    </div>
  );
};

export default IncomeChart;
