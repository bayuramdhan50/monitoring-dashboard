"use client";
import { useEffect, useState } from "react";
import DataCard from "../components/DataCard";
import LineChart from "../components/LineChart";
import PieChart from "../components/PieChart";
import {
  IoWaterSharp,
  IoThermometerSharp,
  IoLeafSharp,
  IoAlertCircleSharp,
} from "react-icons/io5"; // Import ikon

export default function Page() {
  const [latestData, setLatestData] = useState({});
  const [chartData, setChartData] = useState({
    humidity: [],
    temperature: [],
    ph: [],
    gas: [],
    labels: [],
  });
  const [filter, setFilter] = useState("all");
  const [originalData, setOriginalData] = useState([]);
  const [apiUrl, setApiUrl] = useState(""); // URL API dari input pengguna
  const [isConnected, setIsConnected] = useState(false); // Status koneksi
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChartVisible, setIsChartVisible] = useState(true);

  const fetchData = async () => {
    if (!apiUrl) return; // Jika URL belum diisi, tidak melakukan fetch

    try {
      const response = await fetch(`${apiUrl}`);
      const jsonResponse = await response.json();

      const dataArray = jsonResponse.data || [];
      if (dataArray.length > 0) {
        setLatestData(dataArray[0]); // Ambil data terbaru
        setOriginalData(dataArray); // Simpan semua data
        filterDataByTime("all"); // Set filter ke "all"
        setIsConnected(true); // Set status koneksi ke "Connected"
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setIsConnected(false); // Jika gagal, set status koneksi ke "Disconnected"
    }
  };

  const updateChartData = (data) => {
    if (data.length > 0) {
      const sortedData = data.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      const humidityData = sortedData.map((item) => item.humidity || 0);
      const temperatureData = sortedData.map((item) => item.temperature || 0);
      const phData = sortedData.map((item) => item.ph || 0);
      const gasData = sortedData.map((item) => item.gas || 0);
      const labelsData = sortedData.map((item) =>
        new Date(item.timestamp).toISOString()
      );

      setChartData({
        humidity: humidityData,
        temperature: temperatureData,
        ph: phData,
        gas: gasData,
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

  const calculateAverages = (data) => {
    const humidityAvg =
      data.reduce((sum, item) => sum + (item.humidity || 0), 0) / data.length;
    const temperatureAvg =
      data.reduce((sum, item) => sum + (item.temperature || 0), 0) /
      data.length;
    const phAvg =
      data.reduce((sum, item) => sum + (item.ph || 0), 0) / data.length;
    const gasAvg =
      data.reduce((sum, item) => sum + (item.gas || 0), 0) / data.length;

    return {
      humidityAvg: humidityAvg.toFixed(2),
      temperatureAvg: temperatureAvg.toFixed(2),
      phAvg: phAvg.toFixed(2),
      gasAvg: gasAvg.toFixed(2),
    };
  };

  useEffect(() => {
    if (apiUrl) {
      fetchData();
      const intervalId = setInterval(fetchData, 5000);
      return () => clearInterval(intervalId);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (originalData.length > 0) {
      updateChartData(originalData); // Pastikan data chart diupdate setiap kali originalData berubah
    }
  }, [originalData]);

  const averages = calculateAverages(originalData);

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-4xl text-white font-bold text-center mb-8">
          Monitoring Dashboard
        </h1>

        {/* Input API URL */}
        <div className="text-center mb-6">
          <input
            type="text"
            className="p-2 w-3/4 md:w-1/2 text-black rounded"
            placeholder="Enter API Server URL"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
          <button
            className="ml-4 bg-blue-500 text-white p-2 rounded"
            onClick={fetchData}
          >
            Connect
          </button>
        </div>

        {/* Status Koneksi */}
        <div className="text-center text-white mb-4">
          {isConnected ? (
            <span className="text-green-500">ESP Connected</span>
          ) : (
            <span className="text-red-500">Disconnected</span>
          )}
        </div>

        <div className="p-6 bg-gray-800 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl text-white font-bold mb-4 text-center">
            Sensor Data
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isConnected && latestData && (
              <>
                <div className="p-4 bg-gray-700 rounded-lg shadow-md ">
                  <DataCard
                    title="Temperature"
                    value={
                      Number(latestData.temperature || 0).toFixed(2) + "°C"
                    }
                    valueType="gauge"
                    gaugeValue={Number(latestData.temperature || 0) / 100}
                    gaugeColors={["#00FF00", "#FFFF00", "#FF0000"]}
                  />
                </div>
                <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                  <DataCard
                    title="Humidity"
                    value={latestData.humidity || 0}
                    unit="%"
                  />
                </div>
                <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                  <DataCard
                    title="Soil Moisture Level"
                    value={
                      latestData.ph < 300
                        ? "Basah"
                        : latestData.ph < 700
                        ? "Lembap"
                        : "Kering"
                    }
                  />
                </div>
                <div className="p-4 bg-gray-700 rounded-lg shadow-md">
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
                </div>
                <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                  <DataCard
                    title="Getaran Status"
                    value={
                      latestData.getaran ? "Ada Getaran" : "Tidak Ada Getaran"
                    }
                  />
                </div>
                <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                  <DataCard
                    title="Infrared Status"
                    value={
                      latestData.infrared ? "Ada Benda" : "Tidak Ada Benda"
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Rata-rata Sensor Data */}
        <div className="mt-8 text-white text-center">
          <h3 className="text-xl font-bold mb-4">Sensor Averages</h3>
          <div className="container mx-auto p-4 bg-gray-800 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Humidity */}
              <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-center">
                <IoWaterSharp className="text-blue-500 mr-3 text-3xl" />
                <div>
                  <p className="font-semibold">Humidity</p>
                  <p>{averages.humidityAvg}%</p>
                </div>
              </div>
              {/* Temperature */}
              <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-center">
                <IoThermometerSharp className="text-red-500 mr-3 text-3xl" />
                <div>
                  <p className="font-semibold">Temperature</p>
                  <p>{averages.temperatureAvg}°C</p>
                </div>
              </div>
              {/* Soil Moisture */}
              <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-center">
                <IoLeafSharp className="text-green-500 mr-3 text-3xl" />
                <div>
                  <p className="font-semibold">Soil Moisture</p>
                  <p>{averages.phAvg}</p>
                </div>
              </div>
              {/* Gas Level */}
              <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-center">
                <IoAlertCircleSharp className="text-yellow-500 mr-3 text-3xl" />
                <div>
                  <p className="font-semibold">Gas Level</p>
                  <p>{averages.gasAvg}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grafik dan Statistik */}
        <div className="p-6">
          <button
            className="bg-blue-500 text-white p-2 rounded mb-4"
            onClick={() => setIsChartVisible(!isChartVisible)}
          >
            {isChartVisible ? "Hide Charts" : "Show Charts"}
          </button>
          {isChartVisible && isConnected && (
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
                <LineChart
                  labels={chartData.labels}
                  dataSets={[
                    {
                      label: "Temperature",
                      data: chartData.temperature,
                      borderColor: "rgba(255, 99, 132, 1)",
                      backgroundColor: "rgba(255, 99, 132, 0.2)",
                    },
                    {
                      label: "Humidity",
                      data: chartData.humidity,
                      borderColor: "rgba(54, 162, 235, 1)",
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                    },
                  ]}
                />
                <LineChart
                  labels={chartData.labels}
                  dataSets={[
                    {
                      label: "Soil Moisture Level",
                      data: chartData.ph,
                      borderColor: "rgba(0, 128, 0, 1)",
                      backgroundColor: "rgba(0, 128, 0, 0.2)",
                    },
                  ]}
                />
                <LineChart
                  labels={chartData.labels}
                  dataSets={[
                    {
                      label: "Gas Level",
                      data: chartData.gas,
                      borderColor: "rgba(255, 165, 0, 1)",
                      backgroundColor: "rgba(255, 165, 0, 0.2)",
                    },
                  ]}
                />
              </div>
              <div className="w-full lg:w-1/2">
                <h2 className="text-2xl text-white font-bold mb-4">
                  Gas Level Distribution
                </h2>
                <PieChart
                  data={{
                    labels: [
                      "Aman",
                      "Perhatian",
                      "Berbahaya",
                      "Sangat Berbahaya",
                    ],
                    datasets: [
                      {
                        data: [
                          latestData.gas < 51 ? 1 : 0,
                          latestData.gas < 101 && latestData.gas >= 51 ? 1 : 0,
                          latestData.gas < 301 && latestData.gas >= 101 ? 1 : 0,
                          latestData.gas >= 301 ? 1 : 0,
                        ],
                        backgroundColor: [
                          "#00FF00",
                          "#FFFF00",
                          "#FF0000",
                          "#FF0000",
                        ],
                      },
                    ],
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
