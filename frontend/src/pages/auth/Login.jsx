import React, { useState, useEffect, useContext, useMemo } from "react";  
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { useLocation, useNavigate } from "react-router-dom";

const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { key: "uppercase", label: "One uppercase letter (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { key: "lowercase", label: "One lowercase letter (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { key: "number", label: "One number (0-9)", test: (pw) => /[0-9]/.test(pw) },
  { key: "special", label: "One special character (!@#$...)", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const LoginPage = () => {
  const { backendUrl, setToken, setUser, user } = useContext(AppContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password]
  );
  const allPasswordRulesPassed = passwordChecks.every((r) => r.passed);
  const passedCount = passwordChecks.filter((r) => r.passed).length;
  const strengthPercent = (passedCount / PASSWORD_RULES.length) * 100;
  const strengthColor =
    strengthPercent <= 40
      ? "bg-red-500"
      : strengthPercent <= 80
      ? "bg-yellow-500"
      : "bg-green-500";
  const strengthLabel =
    strengthPercent <= 40
      ? "Weak"
      : strengthPercent <= 80
      ? "Medium"
      : "Strong";

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

  const handlePhoneChange = (e) => {
    // Only allow digits and common phone chars
    const val = e.target.value.replace(/[^0-9+\-() ]/g, "");
    setPhone(val);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      // Validation
      if (!email || !password || (!isLogin && (!name || !phone))) {
        toast.error("All fields are required!");
        return;
      }

      // Register-specific validations
      if (!isLogin) {
        // Phone validation (Vietnamese format or international)
        const phoneDigits = phone.replace(/[^0-9]/g, "");
        if (phoneDigits.length < 9 || phoneDigits.length > 15) {
          toast.error("Please enter a valid phone number (9-15 digits)");
          return;
        }

        // Password strength validation
        if (!allPasswordRulesPassed) {
          toast.error("Password does not meet all security requirements");
          return;
        }
      }

      let response;

      if (isLogin) {
        response = await axios.post(
          `${backendUrl}/api/user/login`,
          { email, password },
          { withCredentials: true }
        );
      } else {
        response = await axios.post(
          `${backendUrl}/api/user/register`,
          { name, email, password, phone },
          { withCredentials: true }
        );
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
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 mt-2 border border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="e.g. Nguyen Van A"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-md font-medium text-stone-900 dark:text-stone-100">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-2 mt-2 border border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="e.g. 0901 234 567"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-md font-medium text-stone-900 dark:text-stone-100">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-2 border border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder="e.g. yourname@gmail.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-md font-medium text-stone-900 dark:text-stone-100">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => !isLogin && setShowPasswordRules(true)}
              onBlur={() => setShowPasswordRules(false)}
              className="w-full px-4 py-2 mt-2 border border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
              placeholder={isLogin ? "Enter your password" : "Min 8 chars, uppercase, number & special char"}
            />

            {/* Password Strength Indicator - only on Register */}
            {!isLogin && password.length > 0 && (
              <div className="mt-3 space-y-2">
                {/* Strength bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${strengthPercent}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium min-w-[52px] text-right ${
                    strengthPercent <= 40
                      ? "text-red-500"
                      : strengthPercent <= 80
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}>
                    {strengthLabel}
                  </span>
                </div>

                {/* Requirement checklist */}
                {(showPasswordRules || !allPasswordRulesPassed) && (
                  <ul className="space-y-1">
                    {passwordChecks.map((rule) => (
                      <li
                        key={rule.key}
                        className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                          rule.passed
                            ? "text-green-500"
                            : "text-stone-400 dark:text-stone-500"
                        }`}
                      >
                        <span className="text-sm">
                          {rule.passed ? "✓" : "○"}
                        </span>
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          {isLogin && (
            <div className="flex justify-end">
              <span 
                className="text-sm text-accent-500 cursor-pointer hover:underline"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </span>
            </div>
          )}
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
