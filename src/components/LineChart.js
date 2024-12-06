import React from "react";
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

const LineChart = ({ labels, dataSets }) => {
  // Transform labels and data into Recharts format
  const chartData = labels.map((label, index) => {
    const dataPoint = { name: new Date(label).toLocaleString() };
    dataSets.forEach((dataset) => {
      dataPoint[dataset.label] = dataset.data[index];
    });
    return dataPoint;
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="name" stroke="#fff" />
        <YAxis stroke="#fff" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "8px",
          }}
          itemStyle={{ color: "#fff" }}
        />
        <Legend />
        {dataSets.map((dataset, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={dataset.label}
            stroke={dataset.borderColor}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;
