import React from "react";

const ServiceCard = ({ item }) => {
  return (
    <div className="bg-white/20 shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out">
      <div className="p-6 flex items-center space-x-4">
        <div className="text-4xl text-gray-700">{item.icon}</div>
        <div>
          <h5 className="text-xl font-semibold text-gray-800 mb-3">
            {item.title}
          </h5>
          <p className="text-gray-600">{item.desc}</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
