import { LineChart, Line, XAxis, YAxis } from 'recharts';

const data = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 6200 },
  { month: 'Mar', revenue: 5800 },
  { month: 'Apr', revenue: 7100 },
];

function ReportModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal">
      <button onClick={onClose}>Close</button>
      <LineChart width={500} height={300} data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Line type="monotone" dataKey="revenue" stroke="#0EA5E9" />
      </LineChart>
    </div>
  );
}

export default ReportModal;