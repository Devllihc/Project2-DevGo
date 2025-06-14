import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Calendar, DollarSign, MapPin, Users, Star } from "lucide-react";
import { AppContext } from "../context/AppContext";

const TourDetails = () => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/tours/${id}`);
        const data = await res.json();
        setTour(data);
        if (data?.availableDates?.length > 0) {
          setSelectedDate(data.availableDates[0]);
        }
      } catch (error) {
        console.error("Error fetching tour:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id, baseUrl]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const renderStars = (rating) => {
    const totalStars = 5;
    return Array.from({ length: totalStars }, (_, i) => (
      <Star
        key={i}
        className={`text-yellow-500 ${i + 1 <= rating ? "fill-current" : "text-gray-300"}`}
      />
    ));
  };

  if (loading) return <div className="text-center py-20 text-xl">Loading...</div>;
  if (!tour) return <div className="text-center py-20 text-red-600">Tour not found</div>;

  const {
    _id,
    photo,
    title,
    desc,
    price,
    reviews = [],
    city,
    distance,
    maxGroupSize,
    availableDates = [],
    avgRating,
  } = tour;

  const imageUrl = photo?.startsWith("http") ? photo : `${baseUrl}${photo}`;

  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-50 via-blue-50 to-violet-50 py-8">
      <div className="max-w-7xl mx-auto p-6 sm:p-8">
        {/* Tour Image */}
        <div className="mb-8">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-96 object-cover rounded-xl shadow-lg hover:opacity-90 transition duration-300"
          />
        </div>

        {/* Tour Title and Description */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            {title}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
            {desc}
          </p>
        </div>

        {/* Tour Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="flex flex-col items-center bg-white/20 p-6 border rounded-xl shadow-lg hover:scale-105 transform transition duration-300">
            <h3 className="text-xl font-semibold text-blue-600 flex items-center">
              <DollarSign className="mr-2 text-blue-600" />
              Price
            </h3>
            <p className="text-2xl text-gray-800 mt-3">₹{price}/person</p>
          </div>

          <div className="flex flex-col items-center bg-white/20 p-6 border rounded-xl shadow-lg hover:scale-105 transform transition duration-300">
            <h3 className="text-xl font-semibold text-blue-600 flex items-center">
              <MapPin className="mr-2 text-blue-600" />
              Location
            </h3>
            <p className="text-2xl text-gray-800 mt-3">{city}</p>
            <p className="text-lg text-gray-600 mt-1">{distance} km away</p>
          </div>

          <div className="flex flex-col items-center bg-white/20 p-6 border rounded-xl shadow-lg hover:scale-105 transform transition duration-300">
            <h3 className="text-xl font-semibold text-blue-600 flex items-center">
              <Users className="mr-2 text-blue-600" />
              Group Size
            </h3>
            <p className="text-2xl text-gray-800 mt-3">Max {maxGroupSize} people</p>
          </div>
        </div>

        {/* Available Dates */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            <Calendar className="inline-block mr-2 text-blue-600" />
            Choose Available Date
          </h3>
          <select
            value={selectedDate}
            onChange={handleDateChange}
            className="w-full p-3 border border-gray-300 rounded-xl bg-white/20 shadow-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          >
            {availableDates.map((date, index) => (
              <option key={index} value={date}>
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => {
              scrollTo(0, 0);
              if (!user) {
                navigate("/login");
              } else {
                navigate("/booking", { state: { tour } });
              }
            }}
            className="bg-gradient-to-b from-sky-500 to-blue-500 hover:from-sky-800 hover:to-blue-700 px-6 py-3 text-white text-lg font-semibold rounded-full transition duration-300"
          >
            Book This Tour
          </button>
        </div>

        {/* Reviews */}
        <div className="text-center mb-12 mt-12">
          <h3 className="text-2xl font-semibold text-gray-800">Reviews</h3>
          <div className="mt-4">
            <div className="flex justify-center mb-4">
              {renderStars(Math.round(avgRating))}
            </div>
            <p className="text-lg text-gray-600">{reviews.length} reviews</p>
          </div>

          <div className="mt-8 space-y-6">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="flex flex-col items-center bg-white/20 p-6 border rounded-xl shadow-lg space-y-3"
              >
                <div className="text-xl font-semibold text-gray-700">
                  {review.name}
                </div>
                <div className="flex space-x-1">
                  {renderStars(Math.round(review.rating))}
                </div>
                <p className="text-lg text-gray-600 mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetails;
