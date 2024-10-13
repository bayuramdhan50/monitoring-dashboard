"use client";
import { useEffect, useState } from "react";
import DataCard from "../components/DataCard";
import LineChart from "../components/LineChart";
import PieChart from "../components/PieChart";
import GaugeChart from "react-gauge-chart";

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {latestData && (
          <>
            <DataCard
              title="Soil Moisture"
              value={latestData.soilMoisture || 0}
              unit="%"
            />

            <DataCard
              title="Temperature"
              value={
                <div className="flex justify-between items-center overflow-hidden">
                  <span>{latestData.temperature || 0}°C</span>
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

            <DataCard
              title="Weather"
              value={latestData.weather || "N/A"}
              unit=""
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

        <div className="w-full lg:w-1/2">
          <h2 className="text-2xl text-white font-bold text-center mb-4">
            Weather Distribution
          </h2>
          <PieChart
            data={[weatherData.Clear, weatherData.Rain, weatherData.Cloudy]}
            labels={["Clear", "Rain", "Cloudy"]}
          />
        </div>
      </div>
    </div>
  );
}
