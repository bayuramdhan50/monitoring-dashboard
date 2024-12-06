"use client";
import React, { use, useEffect, useState } from "react";
import DataCard from "../components/DataCard";
import LineChart from "../components/LineChart";
import PieChart from "../components/PieChart";
import {
  IoWaterSharp,
  IoThermometerSharp,
  IoLeafSharp,
  IoAlertCircleSharp,
  IoRadioSharp, // tambahan untuk vibration
  IoEyeSharp,
} from "react-icons/io5";
import regression from "regression"; // Import regression library

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
  const [apiUrl, setApiUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [averages, setAverages] = useState({});
  const [isChartVisible, setIsChartVisible] = useState(true);
  const [predictedData, setPredictedData] = useState({
    temperature: null,
    humidity: null,
    ph: null,
    gas: null,
  });
  const [trends, setTrends] = useState({
    temperature: null,
    humidity: null,
    ph: null,
    gas: null,
  });

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
    if (!data || data.length === 0) {
      return {
        humidityAvg: 0,
        temperatureAvg: 0,
        phAvg: 0,
        gasAvg: 0,
      };
    }

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
      humidityAvg: parseFloat(humidityAvg.toFixed(2)),
      temperatureAvg: parseFloat(temperatureAvg.toFixed(2)),
      phAvg: parseFloat(phAvg.toFixed(2)),
      gasAvg: parseFloat(gasAvg.toFixed(2)),
    };
  };

  const predictFutureData = (data) => {
    if (data.length < 2) return; // Memastikan ada cukup data untuk prediksi

    // Menyusun data untuk regresi linear (X = waktu, Y = sensor values)
    const timeSeries = data.map((item) => new Date(item.timestamp).getTime());
    const humiditySeries = data.map((item) => item.humidity || 0);
    const temperatureSeries = data.map((item) => item.temperature || 0);
    const phSeries = data.map((item) => item.ph || 0);
    const gasSeries = data.map((item) => item.gas || 0);

    // Buat model regresi linear sederhana untuk masing-masing sensor
    const humidityModel = regression.linear(
      timeSeries.map((time, index) => [time, humiditySeries[index]])
    );
    const temperatureModel = regression.linear(
      timeSeries.map((time, index) => [time, temperatureSeries[index]])
    );
    const phModel = regression.linear(
      timeSeries.map((time, index) => [time, phSeries[index]])
    );
    const gasModel = regression.linear(
      timeSeries.map((time, index) => [time, gasSeries[index]])
    );

    // Prediksi untuk waktu depan (misalnya, satu jam ke depan)
    const futureTime = new Date().getTime() + 60 * 60 * 1000; // 1 jam dari sekarang

    setPredictedData({
      temperature: temperatureModel.predict(futureTime)[1].toFixed(2),
      humidity: humidityModel.predict(futureTime)[1].toFixed(2),
      ph: phModel.predict(futureTime)[1].toFixed(2),
      gas: gasModel.predict(futureTime)[1].toFixed(2),
    });
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
      updateChartData(originalData);
    }
  }, [originalData]);

  useEffect(() => {
    // Pastikan averages diperbarui terlebih dahulu
    const averages = calculateAverages(originalData);
    setAverages(averages);
  }, [originalData]);

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

        {/* Connection Status */}
        <div className="text-center text-white mb-4">
          {isConnected ? (
            <span className="text-green-500">ESP Connected</span>
          ) : (
            <span className="text-red-500">Disconnected</span>
          )}
        </div>

        {/* Sensor Averages */}
        <div className="mt-8 text-white text-center mb-8">
          <h3 className="text-xl font-bold mb-4">Sensor Averages</h3>
          <div className="container mx-auto p-4 bg-gray-800 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Temperature */}
              <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-center">
                <IoThermometerSharp className="text-red-500 mr-3 text-3xl" />
                <div>
                  <p className="font-semibold">Temperature</p>
                  <div className="flex items-center">
                    <p>{averages.temperatureAvg}°C</p>
                  </div>
                </div>
              </div>
              {/* Humidity */}
              <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-center">
                <IoWaterSharp className="text-blue-500 mr-3 text-3xl" />
                <div>
                  <p className="font-semibold">Humidity</p>
                  <div className="flex items-center">
                    <p>{averages.humidityAvg}%</p>
                  </div>
                </div>
              </div>
              {/* Soil Moisture */}
              <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-center">
                <IoLeafSharp className="text-green-500 mr-3 text-3xl" />
                <div>
                  <p className="font-semibold">Soil Moisture</p>
                  <div className="flex items-center">
                    <p>{averages.phAvg}</p>
                  </div>
                </div>
              </div>
              {/* Gas Level */}
              <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-center">
                <IoAlertCircleSharp className="text-yellow-500 mr-3 text-3xl" />
                <div>
                  <p className="font-semibold">Gas Level</p>
                  <div className="flex items-center">
                    <p>{averages.gasAvg}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Data */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl text-white font-bold mb-4 text-center">
            Sensor Data
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isConnected && latestData && (
              <>
                <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                  <DataCard
                    title="Temperature"
                    value={Number(latestData.temperature || 0).toFixed(2)}
                    unit="°C"
                    icon={<IoThermometerSharp className="text-red-500" />}
                    valueType="gauge"
                    gaugeValue={Number(latestData.temperature || 0) / 100}
                    gaugeColors={["#00FF00", "#FFFF00", "#FF0000"]}
                    trend={
                      calculateTrend(
                        latestData.temperature,
                        originalData[1]?.temperature
                      ).trend
                    }
                    trendPercentage={
                      calculateTrend(
                        latestData.temperature,
                        originalData[1]?.temperature
                      ).percentage
                    }
                  />
                </div>
                <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                  <DataCard
                    title="Humidity"
                    value={latestData.humidity || 0}
                    unit="%"
                    icon={<IoWaterSharp className="text-blue-500" />}
                    trend={
                      calculateTrend(
                        latestData.humidity,
                        originalData[1]?.humidity
                      ).trend
                    }
                    trendPercentage={
                      calculateTrend(
                        latestData.humidity,
                        originalData[1]?.humidity
                      ).percentage
                    }
                  />
                </div>
                <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                  <DataCard
                    title="Soil Moisture Level"
                    value={
                      latestData.ph < 300
                        ? "Wet"
                        : latestData.ph < 700
                        ? "Moist"
                        : "Dry"
                    }
                    icon={<IoLeafSharp className="text-green-500" />}
                  />
                </div>
                <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                  <DataCard
                    title="Gas Level"
                    value={
                      latestData.gas < 51
                        ? "Safe"
                        : latestData.gas < 101
                        ? "Caution"
                        : latestData.gas < 301
                        ? "Dangerous"
                        : "Highly Dangerous"
                    }
                    icon={<IoAlertCircleSharp className="text-yellow-500" />}
                  />
                </div>
                <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                  <DataCard
                    title="Vibration Status"
                    value={
                      latestData.vibration
                        ? "Vibration Detected"
                        : "No Vibration"
                    }
                    icon={<IoRadioSharp className="text-purple-500" />}
                  />
                </div>
                <div className="p-4 bg-gray-700 rounded-lg shadow-md">
                  <DataCard
                    title="Infrared Status"
                    value={
                      latestData.infrared ? "Object Detected" : "No Object"
                    }
                    icon={<IoEyeSharp className="text-orange-500" />}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Predicted Data */}
        <div className="mt-8 text-white text-center mb-8">
          <h3 className="text-xl font-bold mb-4">Predicted Sensor Values</h3>
          <div className="container mx-auto p-4 bg-gray-800 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Predicted Temperature */}
              <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-center">
                <IoThermometerSharp className="text-red-500 mr-3 text-3xl" />
                <div>
                  <p className="font-semibold">Predicted Temperature</p>
                  <p>{predictedData.temperature}°C</p>
                </div>
              </div>
              {/* Predicted Humidity */}
              <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-center">
                <IoWaterSharp className="text-blue-500 mr-3 text-3xl" />
                <div>
                  <p className="font-semibold">Predicted Humidity</p>
                  <p>{predictedData.humidity}%</p>
                </div>
              </div>
              {/* Predicted Soil Moisture */}
              <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-center">
                <IoLeafSharp className="text-green-500 mr-3 text-3xl" />
                <div>
                  <p className="font-semibold">Predicted Soil Moisture</p>
                  <p>{predictedData.ph}</p>
                </div>
              </div>
              {/* Predicted Gas */}
              <div className="p-4 bg-gray-700 rounded-lg shadow-md flex items-center">
                <IoAlertCircleSharp className="text-yellow-500 mr-3 text-3xl" />
                <div>
                  <p className="font-semibold">Predicted Gas Level</p>
                  <p>{predictedData.gas}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Statistics */}
        <div className="p-6">
          <button
            className="bg-blue-500 text-white p-2 rounded mb-4"
            onClick={() => setIsChartVisible(!isChartVisible)}
          >
            {isChartVisible ? "Hide Charts" : "Show Charts"}
          </button>
          {isChartVisible && isConnected && (
            <div className="flex flex-col lg:flex-row gap-8 mt-8">
              {/* Left Section with 2 Charts */}
              <div className="w-full lg:w-1/2 grid grid-cols-1 gap-8">
                <div>
                  <h2 className="text-2xl text-white font-bold mb-4">
                    Data Trend
                  </h2>
                  <select
                    className="bg-gray-800 text-white p-2 rounded mb-4"
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
                </div>
                <div>
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
                </div>
              </div>

              {/* Right Section with 1 Chart and 1 Pie Chart */}
              <div className="w-full lg:w-1/2 grid grid-cols-1 gap-8">
                <div>
                  <h2 className="text-2xl text-white font-bold mb-4">
                    Gas Level Distribution
                  </h2>
                  <PieChart
                    data={{
                      labels: [
                        "Safe",
                        "Caution",
                        "Dangerous",
                        "Highly Dangerous",
                      ],
                      datasets: [
                        {
                          data: [
                            latestData.gas < 51 ? 1 : 0,
                            latestData.gas < 101 && latestData.gas >= 51
                              ? 1
                              : 0,
                            latestData.gas < 301 && latestData.gas >= 101
                              ? 1
                              : 0,
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
                <div>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
