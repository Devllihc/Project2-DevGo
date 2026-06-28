import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const { backendUrl } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email!");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/user/forgot-password`, { email });

      if (response.data.success) {
        toast.success(response.data.message || "Reset link sent to your email");
      } else {
        toast.error(response.data.message || "Failed to send reset link");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white dark:bg-stone-900 p-8 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full">
        <h2 className="text-3xl font-semibold text-center text-stone-900 dark:text-stone-100">
          Forgot Password
        </h2>
        <p className="text-center text-stone-500 mt-2 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form onSubmit={onSubmitHandler} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-md font-medium text-stone-900 dark:text-stone-100">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-2 border border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-500 text-white py-2 mt-4 rounded-2xl hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 transition duration-300 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>
            Remember your password?{" "}
            <span
              className="text-accent-500 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
