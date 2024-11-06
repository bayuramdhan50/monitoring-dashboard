// src/components/LineChart.js
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  Tooltip,
  Legend
);

const LineChart = ({ labels, dataSets }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    setChartData({
      labels: labels,
      datasets: dataSets.map((dataSet) => ({
        label: dataSet.label,
        data: dataSet.data,
        borderColor: dataSet.borderColor,
        backgroundColor: dataSet.backgroundColor,
        fill: true,
      })),
    });
  }, [labels, dataSets]);

  return (
    <div>
      <Line data={chartData} />
    </div>
  );
};

export default LineChart;
