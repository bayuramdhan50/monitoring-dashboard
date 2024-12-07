"use client";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LineChart = ({ labels, datasets }) => {
  // Transform data for Recharts format
  const chartData = labels.map((label, index) => {
    const dataPoint = { name: new Date(label).toLocaleString() };
    datasets.forEach((dataset) => {
      dataPoint[dataset.label] = dataset.data[index];
    });
    return dataPoint;
  });

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6B7280' }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis tick={{ fill: '#6B7280' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: '#F3F4F6' }}
            itemStyle={{ color: '#F3F4F6' }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          {datasets.map((dataset, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={dataset.label}
              stroke={dataset.borderColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
