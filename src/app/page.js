"use client";
import React, { use, useEffect, useState } from "react";
import DataCard from "../components/DataCard";
import LineChart from "../components/LineChart";
import {
  IoWaterSharp,
  IoThermometerSharp,
  IoLeafSharp,
  IoAlertCircleSharp,
  IoSpeedometerSharp, // tambahan untuk vibration
  IoEyeSharp,
} from "react-icons/io5";
import regression from "regression"; // Import regression library

export default function Page() {
  const [latestData, setLatestData] = useState({
    temperature: 0,
    humidity: 0,
    gas: 0,
    getaran: 0,
  });
  const [chartData, setChartData] = useState({
    humidity: [],
    temperature: [],
    gas: [],
    labels: [],
  });
  const [filter, setFilter] = useState("all");
  const [originalData, setOriginalData] = useState([]);
  const [apiUrl, setApiUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [averages, setAverages] = useState({
    temperature: "0",
    humidity: "0",
    gas: "0",
  });
  const [isChartVisible, setIsChartVisible] = useState(true);
  const [predictedData, setPredictedData] = useState({
    temperature: 0,
    humidity: 0,
    gas: 0,
  });
  const [trends, setTrends] = useState({
    temperature: { trend: null, change: 0 },
    humidity: { trend: null, change: 0 },
    gas: { trend: null, change: 0 },
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = async () => {
    if (!apiUrl) return;
    try {
      const response = await fetch(`${apiUrl}`);
      const jsonResponse = await response.json();
      const dataArray = jsonResponse.data || [];
      if (dataArray.length > 0) {
        setLatestData(dataArray[0]);
        setOriginalData(dataArray);
        filterDataByTime("all");
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setIsConnected(false);
    }
  };

  const updateChartData = (data) => {
    if (data.length > 0) {
      const sortedData = data.sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      const humidityData = sortedData.map((item) => item.humidity || 0);
      const temperatureData = sortedData.map((item) => item.temperature || 0);
      const gasData = sortedData.map((item) => item.gas || 0);
      const labelsData = sortedData.map((item) =>
        new Date(item.timestamp).toISOString()
      );

      setChartData({
        humidity: humidityData,
        temperature: temperatureData,
        gas: gasData,
        labels: labelsData,
      });

      // Prediksi data masa depan
      predictFutureData(sortedData);
    }
  };

  const calculateTrend = (currentData, pastData) => {
    if (!pastData) return { trend: null, percentage: null };

    const percentageChange = ((currentData - pastData) / pastData) * 100;

    return {
      trend: percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : null,
      percentage: Math.abs(percentageChange.toFixed(1)),
    };
  };

  const calculateChange = (current, previous) => {
    if (!previous || current === undefined || previous === undefined) {
      return { trend: null, change: 0 };
    }
    const change = ((current - previous) / previous) * 100;
    return {
      trend: change > 0 ? "up" : change < 0 ? "down" : null,
      change: Math.abs(change).toFixed(1),
    };
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

    // Update chart data
    updateChartData(filteredData);

    // Update latest data with the most recent filtered entry
    if (filteredData.length > 0) {
      const sortedData = [...filteredData].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setLatestData(sortedData[0]);
    }

    // Update averages for filtered data
    const newAverages = calculateAverages(filteredData);
    if (newAverages) {
      setAverages(newAverages);
    }

    // Calculate trends for filtered data
    if (filteredData.length >= 2) {
      const tempData = filteredData.map((d) => d.temperature);
      const humData = filteredData.map((d) => d.humidity);
      const gasData = filteredData.map((d) => d.gas);

      setPredictedData({
        temperature: predictFutureData(tempData),
        humidity: predictFutureData(humData),
        gas: predictFutureData(gasData),
      });
    }
  };

  const predictFutureData = (data, steps = 5) => {
    if (data.length < 2) return null;

    // Create arrays for regression
    const points = data.map((value, index) => [index, value]);
    const result = regression.linear(points);

    // Predict next values
    const lastIndex = points.length - 1;
    return result.predict(lastIndex + steps)[1];
  };

  useEffect(() => {
    if (originalData.length >= 2) {
      const tempData = originalData.map((d) => d.temperature);
      const humData = originalData.map((d) => d.humidity);
      const gasData = originalData.map((d) => d.gas);

      setPredictedData({
        temperature: predictFutureData(tempData),
        humidity: predictFutureData(humData),
        gas: predictFutureData(gasData),
      });
    }
  }, [originalData]);

  // Calculate averages
  const calculateAverages = (data) => {
    if (!data || data.length === 0) return null;

    return {
      temperature: (
        data.reduce((sum, item) => sum + item.temperature, 0) / data.length
      ).toFixed(2),
      humidity: (
        data.reduce((sum, item) => sum + item.humidity, 0) / data.length
      ).toFixed(2),
      gas: (
        data.reduce((sum, item) => sum + item.gas, 0) / data.length
      ).toFixed(2),
    };
  };

  useEffect(() => {
    const averages = calculateAverages(originalData);
    if (averages) {
      setAverages(averages);
    }
  }, [originalData]);

  useEffect(() => {
    if (apiUrl) {
      fetchData();
      const intervalId = setInterval(fetchData, 5000);
      return () => clearInterval(intervalId);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (originalData.length > 0) {
      updateChartData(originalData);
    }
  }, [originalData]);

  useEffect(() => {
    // Pastikan averages diperbarui terlebih dahulu
    const averages = calculateAverages(originalData);
    setAverages(averages);
  }, [originalData]);

  useEffect(() => {
    if (originalData.length >= 2) {
      const current = originalData[0];
      const previous = originalData[1];

      setTrends({
        temperature: calculateChange(current.temperature, previous.temperature),
        humidity: calculateChange(current.humidity, previous.humidity),
        gas: calculateChange(current.gas, previous.gas),
      });
    }
  }, [originalData]);

  useEffect(() => {
    setIsChartVisible(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const AveragesSection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Average Sensor Values
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <IoThermometerSharp className="text-red-500 text-xl" />
            <span className="text-gray-600 dark:text-gray-300">
              Temperature
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
            {averages?.temperature || "0"} °C
          </p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <IoWaterSharp className="text-blue-500 text-xl" />
            <span className="text-gray-600 dark:text-gray-300">Humidity</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
            {averages?.humidity || "0"} %
          </p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <IoAlertCircleSharp className="text-yellow-500 text-xl" />
            <span className="text-gray-600 dark:text-gray-300">Gas Level</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
            {averages?.gas || "0"} ppm
          </p>
        </div>
      </div>
    </div>
  );

  const PredictionsSection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Predicted Next Values
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <IoThermometerSharp className="text-red-500 text-xl" />
            <span className="text-gray-600 dark:text-gray-300">
              Temperature
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
            {predictedData?.temperature
              ? predictedData.temperature.toFixed(2)
              : "0"}{" "}
            °C
          </p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <IoWaterSharp className="text-blue-500 text-xl" />
            <span className="text-gray-600 dark:text-gray-300">Humidity</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
            {predictedData?.humidity ? predictedData.humidity.toFixed(2) : "0"}{" "}
            %
          </p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <IoAlertCircleSharp className="text-yellow-500 text-xl" />
            <span className="text-gray-600 dark:text-gray-300">Gas Level</span>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
            {predictedData?.gas ? predictedData.gas.toFixed(2) : "0"} ppm
          </p>
        </div>
      </div>
    </div>
  );

  // Add export function
  const exportToCSV = (data, filename) => {
    // Define CSV headers
    const headers = ["Timestamp", "Temperature", "Humidity", "Gas", "Getaran"];

    // Convert data to CSV format with proper timestamp handling
    const csvData = data.map((row) => {
      const timestamp = new Date(row.timestamp);
      const formattedDate = `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`;
      return [
        `"${formattedDate}"`, // Wrap timestamp in quotes to handle commas
        row.temperature || "0",
        row.humidity || "0",
        row.gas || "0",
        row.getaran === 0 ? "false" : row.getaran || "false", // Convert 0 to "false" for getaran
      ];
    });

    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    }); // Add BOM for Excel
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add export button handler
  const handleExport = () => {
    const currentDate = new Date().toLocaleDateString().replace(/\//g, "-");
    let dataToExport = originalData;

    // If a filter is active, export only filtered data
    if (filter !== "all") {
      const now = new Date();
      if (filter === "24h") {
        dataToExport = originalData.filter(
          (item) => now - new Date(item.timestamp) <= 24 * 60 * 60 * 1000
        );
      } else if (filter === "7d") {
        dataToExport = originalData.filter(
          (item) => now - new Date(item.timestamp) <= 7 * 24 * 60 * 60 * 1000
        );
      } else if (filter === "30d") {
        dataToExport = originalData.filter(
          (item) => now - new Date(item.timestamp) <= 30 * 24 * 60 * 60 * 1000
        );
      }
    }

    exportToCSV(dataToExport, `sensor_data_${currentDate}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              IoT Research Mining Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Real-time monitoring and analysis
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-3 shadow-lg">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-mono text-xl text-gray-700 dark:text-gray-200">
                  {formattedTime}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="Enter API URL"
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Connect
              </button>
            </div>
            <div
              className={`flex items-center ${
                isConnected ? "text-green-500" : "text-red-500"
              }`}
            >
              <div
                className="w-3 h-3 rounded-full mr-2 animate-pulse"
                style={{ backgroundColor: isConnected ? "#10B981" : "#EF4444" }}
              />
              {isConnected ? "Connected" : "Disconnected"}
            </div>
          </div>
        </div>

        {/* Sensor Status Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IoSpeedometerSharp className="text-2xl text-purple-500" />
                <h3 className="text-lg font-medium">Vibration Status</h3>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  latestData.getaran
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                }`}
              >
                {latestData.getaran ? "Detected" : "Normal"}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IoAlertCircleSharp className="text-2xl text-yellow-500" />
                <h3 className="text-lg font-medium">Gas Level</h3>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  latestData.gas < 51
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : latestData.gas < 101
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {latestData.gas < 51
                  ? "Safe"
                  : latestData.gas < 101
                  ? "Warning"
                  : "Danger"}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <IoEyeSharp className="text-2xl text-blue-500" />
                <h3 className="text-lg font-medium">Object Detection</h3>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  latestData.infrared
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {latestData.infrared ? "Detected" : "None"}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setFilter("all");
              filterDataByTime("all");
            }}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => {
              setFilter("24h");
              filterDataByTime("24h");
            }}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              filter === "24h"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Last 24 Hours
          </button>
          <button
            onClick={() => {
              setFilter("7d");
              filterDataByTime("7d");
            }}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              filter === "7d"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => {
              setFilter("30d");
              filterDataByTime("30d");
            }}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              filter === "30d"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Last 30 Days
          </button>
        </div>

        {/* Add Export Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleExport}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Export Data
          </button>
        </div>

        {/* Data Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <DataCard
            title="Temperature"
            value={latestData.temperature}
            unit="°C"
            icon={IoThermometerSharp}
            trend={trends.temperature.trend}
            trendPercentage={trends.temperature.change}
            color="red"
          />
          <DataCard
            title="Humidity"
            value={latestData.humidity}
            unit="%"
            icon={IoWaterSharp}
            trend={trends.humidity.trend}
            trendPercentage={trends.humidity.change}
            color="blue"
          />
          <DataCard
            title="Gas Level"
            value={latestData.gas}
            unit="ppm"
            status={
              latestData.gas < 51
                ? "Safe"
                : latestData.gas < 101
                ? "Warning"
                : "Danger"
            }
            icon={IoAlertCircleSharp}
            trend={trends.gas.trend}
            trendPercentage={trends.gas.change}
            color="yellow"
          />
        </div>

        {/* Averages and Predictions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AveragesSection />
          <PredictionsSection />
        </div>

        {/* Charts Section */}
        <div className="mt-8 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Sensor Data Trends
              </h2>
              <button
                onClick={() => setIsChartVisible(!isChartVisible)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {isChartVisible ? "Hide Charts" : "Show Charts"}
              </button>
            </div>

            {isChartVisible && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                      Temperature & Humidity
                    </h3>
                    <LineChart
                      labels={chartData.labels}
                      datasets={[
                        {
                          label: "Temperature (°C)",
                          data: chartData.temperature,
                          borderColor: "rgba(239, 68, 68, 0.8)",
                          tension: 0.4,
                        },
                        {
                          label: "Humidity (%)",
                          data: chartData.humidity,
                          borderColor: "rgba(59, 130, 246, 0.8)",
                          tension: 0.4,
                        },
                      ]}
                    />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                      Gas Levels
                    </h3>
                    <LineChart
                      labels={chartData.labels}
                      datasets={[
                        {
                          label: "Gas Level (ppm)",
                          data: chartData.gas,
                          borderColor: "rgba(245, 158, 11, 0.8)",
                          tension: 0.4,
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
