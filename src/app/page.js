"use client";
import { useEffect, useState } from "react";
import DataCard from "../components/DataCard";
import LineChart from "../components/LineChart";
import PieChart from "../components/PieChart";

export default function Page() {
  const [latestData, setLatestData] = useState({});
  const [chartData, setChartData] = useState({
    humidity: [],
    temperature: [],
    labels: [],
  });
  const [filter, setFilter] = useState("all");
  const [originalData, setOriginalData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://flutter-iot-app-44a88-default-rtdb.asia-southeast1.firebasedatabase.app/sensor_data.json"
      );
      const jsonResponse = await response.json();
      console.log(jsonResponse); // Cek data di console

      // Gunakan jsonResponse langsung, karena itu adalah objek
      setLatestData(jsonResponse); // Set the latest data
      setOriginalData([jsonResponse]); // Simpan sebagai array dengan satu elemen
      filterDataByTime("all"); // Set filter to "all" after fetching data
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const updateChartData = (data) => {
    // Jika data tidak kosong, kita akan mengupdate chartData
    if (data.length > 0) {
      const sortedData = data.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      // Ekstrak humidity dan temperature dari sortedData
      const humidityData = sortedData.map((item) => item.humidity || 0);
      const temperatureData = sortedData.map((item) => item.temperature || 0);
      const labelsData = sortedData.map((item) =>
        new Date(item.timestamp).toISOString()
      );

      setChartData({
        humidity: humidityData,
        temperature: temperatureData,
        labels: labelsData,
      });
    }
  };

  const filterDataByTime = (filter) => {
    const now = new Date();
    let filteredData = originalData;

    if (filter === "24h") {
      filteredData = originalData.filter(
        (item) => now - new Date(item.timestamp) <= 24 * 60 * 60 * 1000
      );
    } else if (filter === "7d") {
      filteredData = originalData.filter(
        (item) => now - new Date(item.timestamp) <= 7 * 24 * 60 * 60 * 1000
      );
    } else if (filter === "30d") {
      filteredData = originalData.filter(
        (item) => now - new Date(item.timestamp) <= 30 * 24 * 60 * 60 * 1000
      );
    }

    updateChartData(filteredData);
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl text-white font-bold text-center mb-8">
        Monitoring Dashboard
      </h1>
      <div className="text-center text-white mb-4">
        {latestData.infrared ? (
          <span className="text-green-500">ESP Connected</span>
        ) : (
          <span className="text-red-500">ESP Not Connected</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {latestData && (
          <>
            <DataCard
              title="Temperature"
              value={Number(latestData.temperature || 0).toFixed(2) + "°C"}
              valueType="gauge"
              gaugeValue={Number(latestData.temperature || 0) / 100}
              gaugeColors={["#00FF00", "#FFFF00", "#FF0000"]}
            />
            <DataCard
              title="Humidity"
              value={latestData.humidity || 0}
              unit="%"
            />
            <DataCard
              title="pH Level"
              value={
                latestData.ph < 6
                  ? "Terlalu Asam"
                  : latestData.ph < 6.5
                  ? "Asam"
                  : latestData.ph <= 7.5
                  ? "Normal"
                  : latestData.ph <= 8.5
                  ? "Basa"
                  : "Sangat Basa"
              }
            />
            <DataCard
              title="Gas Level"
              value={
                latestData.gas < 51
                  ? "Aman"
                  : latestData.gas < 101
                  ? "Perhatian"
                  : latestData.gas < 301
                  ? "Berbahaya"
                  : "Sangat Berbahaya"
              }
            />
            <DataCard
              title="Buzzer Status"
              value={
                latestData.temperature >= 30 ? "Buzzer Menyala" : "Buzzer Mati"
              }
              unit=""
            />
            <DataCard
              title="Getaran Status"
              value={
                latestData.getaran >= 1 ? "Ada Getaran" : "Tidak Ada Getaran"
              }
              unit=""
            />
            <DataCard
              title="Infrared Status"
              value={latestData.infrared ? "Ada Benda" : "Tidak Ada Benda"}
            />
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <div className="w-full lg:w-1/2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl text-white font-bold">Data Trend</h2>
            <select
              className="bg-gray-800 text-white p-2 rounded"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                filterDataByTime(e.target.value);
              }}
            >
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <LineChart labels={chartData.labels} dataSets={chartData} />
        </div>
        <div className="w-full lg:w-1/2">
          <h2 className="text-2xl text-white font-bold mb-4">
            Gas Level Distribution
          </h2>
          <PieChart
            data={{
              labels: ["Aman", "Perhatian", "Berbahaya", "Sangat Berbahaya"],
              datasets: [
                {
                  data: [
                    latestData.infrared < 1 ? 1 : 0, // Aman
                    latestData.infrared < 2 && latestData.infrared >= 1 ? 1 : 0, // Perhatian
                    latestData.infrared < 3 && latestData.infrared >= 2 ? 1 : 0, // Berbahaya
                    latestData.infrared >= 3 ? 1 : 0, // Sangat Berbahaya
                  ],
                  backgroundColor: ["#00FF00", "#FFFF00", "#FF0000", "#FF0000"],
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
}
