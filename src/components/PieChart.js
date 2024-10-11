// src/components/PieChart.js
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, labels }) => {
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: ["#4F46E5", "#EC4899", "#10B981"], // Warna untuk setiap bagian pie
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "white",
        },
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChart;
