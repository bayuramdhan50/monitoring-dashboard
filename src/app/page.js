"use client";
import { useEffect, useState } from "react";
import DataCard from "../components/DataCard";
import LineChart from "../components/LineChart";

export default function Page() {
  const [latestData, setLatestData] = useState({});
  const [chartData, setChartData] = useState({
    soilMoisture: [],
    temperature: [],
    labels: [],
  });

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/sensordata/all");
      const jsonResponse = await response.json();
      const data = jsonResponse.data; // Ambil data dari objek 'data'

      // Ambil data terbaru berdasarkan id
      if (data.length > 0) {
        const newestData = data.reduce((prev, current) => {
          return prev.id > current.id ? prev : current; // Menemukan data dengan id tertinggi
        });

        setLatestData(newestData); // Set data terbaru

        // Urutkan data berdasarkan timestamp
        const sortedData = data.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        // Ambil data untuk grafik
        const soilMoistureData = sortedData.map((item) => item.soilMoisture);
        const temperatureData = sortedData.map((item) => item.temperature);
        const timestamps = sortedData.map((item) => item.timestamp);

        setChartData({
          soilMoisture: soilMoistureData,
          temperature: temperatureData,
          labels: timestamps, // Simpan timestamp sebagai label untuk grafik
        });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data saat komponen di-mount

    const intervalId = setInterval(fetchData, 5000); // Polling setiap 5 detik

    return () => clearInterval(intervalId); // Bersihkan interval saat komponen di-unmount
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
              value={latestData.soilMoisture} // Periksa apakah ini adalah nama yang benar
              unit="%"
            />
            <DataCard
              title="Temperature"
              value={latestData.temperature}
              unit="°C"
            />
            <DataCard title="Weather" value={latestData.weather} unit="" />
          </>
        )}
      </div>

      {/* Tambahkan tampilan grafik */}
      <div className="mt-8">
        <h2 className="text-2xl text-white font-bold text-center mb-4">
          Data Trend
        </h2>
        <LineChart labels={chartData.labels} dataSets={chartData} />
      </div>
    </div>
  );
}
