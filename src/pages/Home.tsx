import Summary from "../components/Summary";
import TodayWork from "../components/TodayWork";
import QuickAction from "../components/QuickAction";
import Recommend from "../components/Recommend";

const Home: React.FC = () => {
  return (
    <main className="p-6 space-y-8">
      <h1 className="text-xl font-bold">홈</h1>

      <Summary />
      <TodayWork />

      <div className="grid grid-cols-2 gap-6">
        <QuickAction />
        <Recommend />
      </div>
    </main>
  );
};

export default Home;
