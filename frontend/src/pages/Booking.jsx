import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";

const Booking = () => {
  const { user, token } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const tour = location.state?.tour;

  if (!tour || !user) {
    return navigate("/login");
  }

  const { _id: tourId, title, price } = tour;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    travelers: 1,
    specialRequests: "",
  });
  const [totalPrice, setTotalPrice] = useState(price);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            tourId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create booking");
      }

      const data = await response.json();

      toast.success("Booking successful!");
      navigate("/invoice", { state: { booking: data.booking } });
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Error: " + error.message);
    }
  };

  useEffect(() => {
    setTotalPrice(price * parseInt(formData.travelers, 10));
  }, [formData.travelers, price]);

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return user ? (
    <motion.div
      className="max-w-4xl mx-auto p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-3xl font-bold mb-6 text-stone-900 dark:text-stone-100">Book Your Tour: {title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg font-semibold text-stone-900 dark:text-stone-100">Name</label>
          <motion.input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-stone-900 dark:text-stone-100">Email</label>
          <motion.input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-stone-900 dark:text-stone-100">Phone Number</label>
          <motion.input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 border border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-stone-900 dark:text-stone-100">
            Number of Travelers
          </label>
          <motion.input
            type="number"
            name="travelers"
            min="1"
            value={formData.travelers}
            onChange={handleChange}
            className="w-full p-3 border border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-stone-900 dark:text-stone-100">
            Special Requests (Optional)
          </label>
          <motion.textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            className="w-full p-3 border border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Total Price: ₹{totalPrice}</h3>
        </div>
        <motion.button
          type="submit"
          className="w-full bg-accent-500 hover:bg-accent-600 text-white p-3 rounded-2xl transition duration-300"
        >
          Confirm Booking
        </motion.button>
      </form>
    </motion.div>
  ) : (
    <div className="text-center mt-20 text-stone-600 dark:text-stone-400">Please log in to make a booking.</div>
  );
};

export default Booking;
