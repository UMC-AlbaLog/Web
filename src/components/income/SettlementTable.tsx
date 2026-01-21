// components/income/SettlementTable.tsx
const SettlementTable = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="font-semibold mb-4">정산 상태 리스트</h3>

      <table className="w-full text-sm">
        <thead className="border-b">
          <tr className="text-left text-gray-500">
            <th>근무일자</th>
            <th>매장명</th>
            <th>근무시간</th>
            <th>예상 수입</th>
            <th>실제 수입</th>
            <th>정산 상태</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td>11/01</td>
            <td>CU 홍대점</td>
            <td>4시간</td>
            <td>44,000원</td>
            <td>44,000원</td>
            <td className="text-green-600">정산 완료</td>
          </tr>
          <tr>
            <td>11/11</td>
            <td>CU 홍대점</td>
            <td>4시간</td>
            <td>44,000원</td>
            <td>44,000원</td>
            <td className="text-yellow-600">정산 대기</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SettlementTable;
