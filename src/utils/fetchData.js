export const fetchSensorData = async () => {
  try {
    const res = await fetch(
      "https://4f98-2001-448a-3047-157e-f1a6-c90f-43-20b8.ngrok-free.app/api/sensordata/all"
    );
    if (!res.ok) {
      throw new Error(`Error: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch sensor data", error);
  }
};
