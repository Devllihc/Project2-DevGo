import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useLocation, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { backendUrl, setToken, setUser, user } = useContext(AppContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleToggle = () => {
    setIsLogin((prev) => !prev);
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      // Validation
      if (!email || !password || (!isLogin && (!name || !phone))) {
        toast.error("All fields are required!");
        return;
      }

      let response;

      if (isLogin) {
        response = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });
      } else {
        response = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
          phone,
        });
      }

      if (response.data.success) {
        const { token, user } = response.data;
        setToken(token);
        setUser(user);

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        toast.success(
          isLogin ? "Logged in successfully!" : "Registered successfully!"
        );

        navigate(from, { replace: true });
      } else {
        toast.error(response.data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl max-w-[300px] sm:text-7xl sm:max-w-[590px] mx-auto mt-[-70px] text-center mb-10 text-stone-900 dark:text-stone-100">
        Welcome to <span className="text-accent-500">DevGo</span>
      </h1>
      <div className="bg-white dark:bg-stone-900 p-8 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full">
        <h2 className="text-3xl font-semibold text-center text-stone-900 dark:text-stone-100">
          {isLogin ? "Login" : "Register"}
        </h2>
        <form onSubmit={onSubmitHandler} className="space-y-4 mt-6">
          {!isLogin && (
            <>
              <div>
                <label htmlFor="name" className="block text-md font-medium text-stone-900 dark:text-stone-100">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 mt-2 border border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-md font-medium text-stone-900 dark:text-stone-100">
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 mt-2 border border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="Enter your phone number"
                />
              </div>
            </>
          )}

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
          <div>
            <label htmlFor="password" className="block text-md font-medium text-stone-900 dark:text-stone-100">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 border border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent-500 text-white py-2 mt-4 rounded-2xl hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 transition duration-300"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <span
                  className="text-accent-500 cursor-pointer"
                  onClick={handleToggle}
                >
                  Register here
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span
                  className="text-accent-500 cursor-pointer"
                  onClick={handleToggle}
                >
                  Login here
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
