import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ data, labels }) {
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: ["#4CAF50", "#2196F3", "#FF9800"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false, // Agar ukurannya bisa disesuaikan secara custom
    plugins: {
      legend: {
        position: "bottom", // Tempatkan legend di bawah chart
      },
    },
  };

  return (
    <div className="w-full h-96">
      {" "}
      {/* Wrapper untuk ukuran */}
      <Pie data={chartData} options={options} />
    </div>
  );
}
