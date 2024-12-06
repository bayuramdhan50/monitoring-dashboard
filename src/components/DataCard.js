import React from "react";
import { IoChevronUpOutline, IoChevronDownOutline } from "react-icons/io5";

const DataCard = ({
  title,
  value,
  unit = "",
  valueType = "normal",
  gaugeValue,
  gaugeColors,
  trend = null,
  trendPercentage = null,
  icon = null,
}) => {
  const renderGauge = () => {
    if (!gaugeValue || !gaugeColors) return null;

    const fillPercentage = Math.min(Math.max(gaugeValue * 100, 0), 100);

    return (
      <div className="relative w-full h-2 bg-gray-600 rounded-full overflow-hidden mt-2">
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${fillPercentage}%`,
            background: `linear-gradient(to right, ${gaugeColors.join(", ")})`,
          }}
        ></div>
      </div>
    );
  };

  const getTrendIcon = () => {
    if (trend === "up") {
      return (
        <div className="flex items-center text-green-500">
          <IoChevronUpOutline className="mr-1" />
          {trendPercentage && <span>{trendPercentage}%</span>}
        </div>
      );
    } else if (trend === "down") {
      return (
        <div className="flex items-center text-red-500">
          <IoChevronDownOutline className="mr-1" />
          {trendPercentage && <span>{trendPercentage}%</span>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 shadow-md transform transition-all duration-300 hover:scale-105">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          {icon && React.cloneElement(icon, { className: "mr-2 text-2xl" })}
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
        {getTrendIcon()}
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white text-xl font-bold">
            {value}
            {unit}
          </p>
        </div>
      </div>
      {valueType === "gauge" && renderGauge()}
    </div>
  );
};

export default DataCard;
