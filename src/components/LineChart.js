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
); // Daftarkan skala dan elemen yang diperlukan

const LineChart = ({
  labels,
  dataSets,
  chartLabel,
  borderColor,
  backgroundColor,
}) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    setChartData({
      labels: labels,
      datasets: [
        {
          label: chartLabel,
          data: dataSets,
          borderColor: borderColor,
          backgroundColor: backgroundColor,
          fill: true,
        },
      ],
    });
  }, [labels, dataSets, chartLabel, borderColor, backgroundColor]); // Update chartData setiap kali props berubah

  return (
    <div>
      <Line data={chartData} />
    </div>
  );
};

export default LineChart;
