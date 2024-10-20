// MapComponent.js
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "../app/leaflet/leaflet.css";
import L from "leaflet";

// Set default icon for Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("../app/leaflet/images/marker-icon-2x.png"),
  iconUrl: require("../app/leaflet/images/marker-icon.png"),
  shadowUrl: require("../app/leaflet/images/marker-shadow.png"),
});

const MapComponent = ({ latitude, longitude }) => {
  const position = [latitude, longitude];

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>
          Latitude: {latitude}, Longitude: {longitude}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
