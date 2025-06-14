import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TourCard from "./TourCard";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);

  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/tours`);
        const data = await res.json();
        setTours(data);
        // Không set filteredTours để không hiển thị ban đầu
      } catch (err) {
        console.error("Failed to fetch tours:", err);
      }
    };

    fetchTours();
  }, [baseUrl]);

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();

    const results = tours.filter((tour) => {
      const matchesTerm =
        [tour.title, tour.city, tour.desc].join(" ").toLowerCase().includes(term);

      const matchesPrice =
        maxPrice === "" || parseFloat(tour.price) <= parseFloat(maxPrice);

      const matchesGroupSize =
        groupSize === "" || parseInt(tour.maxGroupSize) >= parseInt(groupSize);

      return matchesTerm && matchesPrice && matchesGroupSize;
    });

    setFilteredTours(results);
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center my-32"
      initial={{ opacity: 0.2, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      viewport={{ once: true }}
    >
      <h1 className="text-3xl sm:text-4xl font-semibold mb-2 text-center">
        Find Your Perfect <span className="text-blue-500">Destination</span>
      </h1>
      <p className="text-center text-lg text-gray-600 mb-8">
        Discover Destinations Based on Your Interests
      </p>

      {/* Input Fields */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <input
          type="text"
          placeholder="Search name or location..."
          className="px-4 py-3 border rounded-lg shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          className="px-4 py-3 border rounded-lg shadow-sm"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Group Size"
          className="px-4 py-3 border rounded-lg shadow-sm"
          value={groupSize}
          onChange={(e) => setGroupSize(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {filteredTours.length > 0 ? (
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <TourCard key={tour._id} tour={tour} />
          ))}
        </div>
      ) : (searchTerm || maxPrice || groupSize) ? (
        <p className="text-center text-gray-500">No tours found.</p>
      ) : null}
    </motion.div>
  );
};

export default SearchBar;
