import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { useParams, Link } from "react-router-dom";

const VerifyEmail = () => {
  const { backendUrl } = useContext(AppContext);
  const { token } = useParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/user/verify-email/${token}`);
        setStatus(res.data.success ? "success" : "error");
        setMessage(res.data.message);
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Something went wrong");
      }
    };
    verify();
  }, [backendUrl, token]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white dark:bg-stone-900 p-8 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full text-center">
        <h2 className="text-3xl font-semibold text-stone-900 dark:text-stone-100">
          Email Verification
        </h2>
        <p className="mt-4 text-stone-600 dark:text-stone-300">
          {status === "verifying" ? "Verifying your email..." : message}
        </p>
        {status !== "verifying" && (
          <Link
            to="/login"
            className="inline-block mt-6 bg-accent-500 text-white py-2 px-6 rounded-2xl hover:bg-accent-600 transition duration-300"
          >
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
