// src/components/LineChart.js
import React from "react";
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

const LineChart = ({ labels, dataSets }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Soil Moisture",
        data: dataSets.soilMoisture,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
      {
        label: "Temperature",
        data: dataSets.temperature,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div>
      <Line data={data} />
    </div>
  );
};

export default LineChart;
