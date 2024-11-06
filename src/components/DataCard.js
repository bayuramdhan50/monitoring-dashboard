const DataCard = ({ title, value, unit }) => {
  return (
    <div className="rounded-lg shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
      <h2 className="text-white text-lg font-semibold">{title}</h2>
      <p className="text-3xl text-white mt-2">
        {value} {unit}
      </p>
    </div>
  );
};

export default DataCard;
