"use client";
import { useEffect, useState } from "react";
import DataCard from "../components/DataCard";
import LineChart from "../components/LineChart";
import PieChart from "../components/PieChart";
import GaugeChart from "react-gauge-chart";
// import MapComponent from "../components/MapComponent";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false, // Nonaktifkan server-side rendering untuk komponen ini
});

export default function Page() {
  const [latestData, setLatestData] = useState({});
  const [chartData, setChartData] = useState({
    soilMoisture: [],
    temperature: [],
    labels: [],
  });
  const [weatherData, setWeatherData] = useState({
    Clear: 0,
    Rain: 0,
    Cloudy: 0,
  });
  const [filter, setFilter] = useState("all");
  const [originalData, setOriginalData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/sensordata/all");
      const jsonResponse = await response.json();
      const data = jsonResponse.data;

      if (data.length > 0) {
        setOriginalData(data);

        const newestData = data.reduce((prev, current) =>
          prev.id > current.id ? prev : current
        );

        setLatestData(newestData);
        updateChartData(data);
        updateWeatherData(data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const updateChartData = (data) => {
    const sortedData = data.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    setChartData({
      soilMoisture: sortedData.map((item) => item.soilMoisture),
      temperature: sortedData.map((item) => item.temperature),
      labels: sortedData.map((item) => item.timestamp),
    });
  };

  const updateWeatherData = (data) => {
    const weatherCount = { Clear: 0, Rain: 0, Cloudy: 0 };

    data.forEach((entry) => {
      let normalizedWeather = entry.weather.toLowerCase();

      if (normalizedWeather.includes("clear")) {
        weatherCount.Clear += 1;
      } else if (normalizedWeather.includes("rain")) {
        weatherCount.Rain += 1;
      } else if (normalizedWeather.includes("cloud")) {
        weatherCount.Cloudy += 1;
      }
    });

    setWeatherData(weatherCount);
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
    updateWeatherData(filteredData);
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
      {/* Status Koneksi ESP32 */}
      <div className="text-center text-white mb-4">
        {latestData.espConnected ? (
          <span className="text-green-500">ESP Connected</span>
        ) : (
          <span className="text-red-500">ESP Not Connected</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {latestData && (
          <>
            <DataCard
              title="Soil Moisture"
              value={latestData.soilMoisture || 0}
              unit="%"
            />
            <DataCard
              title="Gas Level"
              value={
                latestData.gasLevel < 51
                  ? "Aman"
                  : latestData.gasLevel < 101
                  ? "Perhatian"
                  : latestData.gasLevel < 301
                  ? "Berbahaya"
                  : "Sangat Berbahaya"
              }
              unit=""
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
              unit=""
            />

            <DataCard
              title="Water Pump"
              value={latestData.waterPumpStatus || "N/A"}
            />

            <DataCard
              title="Ultrasonic Distance"
              value={latestData.ultrasonicDistance || 0}
              unit="cm"
            />

            <DataCard
              title="GPS"
              value={`Lat: ${latestData.latitude || 0}, Lon: ${
                latestData.longitude || 0
              }`}
            />
            <DataCard
              title="Temperature"
              value={
                <div className="flex justify-between items-center overflow-hidden">
                  <span>{(latestData.temperature || 0).toFixed(2)}°C</span>
                  <div className="ml-4 w-28 h-28">
                    <GaugeChart
                      id="temperature-gauge"
                      nrOfLevels={30}
                      percent={(latestData.temperature || 0) / 100}
                      colors={["#00FF00", "#FFFF00", "#FF0000"]}
                      arcWidth={0.2}
                      textColor="#FFFFFF"
                    />
                  </div>
                </div>
              }
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
                const newFilter = e.target.value;
                setFilter(newFilter); // Keep the current filter state
                filterDataByTime(newFilter); // Update the chart data based on the new filter
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
      </div>

      {latestData.latitude && latestData.longitude && (
        <div className="mt-8">
          <h2 className="text-2xl text-white font-bold mb-4">Location Map</h2>
          <MapComponent
            latitude={latestData.latitude}
            longitude={latestData.longitude}
          />
        </div>
      )}
    </div>
  );
}
