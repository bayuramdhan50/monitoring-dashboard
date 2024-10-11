const DataCard = ({ title, value, unit }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-white text-lg font-semibold">{title}</h2>
      <p className="text-3xl text-white mt-2">
        {value} {unit}
      </p>
    </div>
  );
};

export default DataCard;
