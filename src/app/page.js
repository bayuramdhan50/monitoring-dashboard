"use client";
import { useEffect, useState } from "react";
import DataCard from "../components/DataCard";
import LineChart from "../components/LineChart";
import PieChart from "../components/PieChart";
import GaugeChart from "react-gauge-chart";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
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
      const response = await fetch(
        "https://rc-research-mining-dtja4f15j-bayuramdhan50-gmailcoms-projects.vercel.app/api/sensordata/all"
      );
      const jsonResponse = await response.json();

      // Assuming the data is in the "data" field of the JSON
      const dataEntries = jsonResponse.data;

      if (dataEntries && dataEntries.length > 0) {
        // Update latestData to the most recent entry
        const sortedData = dataEntries.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setLatestData(sortedData[0]); // Set the latest data
        setOriginalData(dataEntries); // Save original data
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
      soilMoisture: sortedData.map((item) => item.soilmoisture),
      temperature: sortedData.map((item) => item.temperature),
      labels: sortedData.map((item) => item.timestamp),
    });
  };

  const updateWeatherData = (data) => {
    const weatherCount = { Clear: 0, Rain: 0, Cloudy: 0 };

    data.forEach((entry) => {
      let normalizedWeather = entry.weather ? entry.weather.toLowerCase() : "";

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
        {latestData.espconnected ? (
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
              value={latestData.soilmoisture || 0}
              unit="%"
            />
            <DataCard
              title="Gas Level"
              value={
                latestData.gaslevel < 51
                  ? "Aman"
                  : latestData.gaslevel < 101
                  ? "Perhatian"
                  : latestData.gaslevel < 301
                  ? "Berbahaya"
                  : "Sangat Berbahaya"
              }
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
              title="Water Pump"
              value={latestData.waterpumpstatus ? "On" : "Off"}
            />
            <DataCard
              title="Ultrasonic Distance"
              value={latestData.ultrasonicdistance || 0}
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
                  <span>
                    {Number(latestData.temperature || 0).toFixed(2)}°C
                  </span>
                  <div className="ml-4 w-28 h-28">
                    <GaugeChart
                      id="temperature-gauge"
                      nrOfLevels={30}
                      percent={Number(latestData.temperature || 0) / 100}
                      colors={["#00FF00", "#FFFF00", "#FF0000"]}
                      arcWidth={0.2}
                      textColor="#FFFFFF"
                    />
                  </div>
                </div>
              }
            />
            <DataCard
              title="Infrared Status"
              value={latestData.infraredstatus ? "Active" : "Inactive"}
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
