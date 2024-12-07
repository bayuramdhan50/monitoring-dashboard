"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { IoCaretUpSharp, IoCaretDownSharp } from "react-icons/io5";

const DataCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendPercentage,
  unit = '',
  color = 'blue',
  status
}) => {
  const gradients = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  };

  const renderTrend = () => {
    if (!trend || !trendPercentage) return null;

    const isUp = trend === 'up';
    const TrendIcon = isUp ? IoCaretUpSharp : IoCaretDownSharp;
    const trendColor = isUp ? 'text-green-300' : 'text-red-300';
    const bgColor = isUp ? 'bg-green-400/20' : 'bg-red-400/20';

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${bgColor} ${trendColor}`}>
        <TrendIcon className="w-4 h-4" />
        <span className="text-sm font-medium">{trendPercentage}%</span>
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br shadow-lg"
      style={{
        background: `linear-gradient(135deg, var(--${color}-500) 0%, var(--${color}-600) 100%)`
      }}
    >
      <div className="px-6 py-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="h-8 w-8 text-white opacity-80" />}
            <h3 className="text-lg font-medium text-white opacity-90">{title}</h3>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <p className="text-3xl font-bold text-white">
              {typeof value === 'number' ? value.toFixed(2) : value}
              <span className="ml-1 text-lg">{unit}</span>
            </p>
            {renderTrend()}
          </div>

          {status && (
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-white/20 text-white w-fit">
              {status}
            </div>
          )}
        </div>
      </div>
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent"></div>
    </motion.div>
  );
};

export default DataCard;
