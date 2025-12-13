import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

// SignIn Component
const SignIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loginType, setLoginType] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [message, setMessage] = useState("");

  const [headingText, setHeadingText] = useState("Sign in to your account");
  const [headingColor, setHeadingColor] = useState("text-gray-300");

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      // API CALL
      const res = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, loginType }),
      });

      const data = await res.json();

      // ERROR HANDLING
      if (!res.ok) {
        setMessage(data.message || "Login failed");

        setTimeout(() => {
          setEmail("");
          setPassword("");
          setLoginType("");
        }, 450);

        return;
      }

      // On success
      setHeadingText("Signed in successfully!");
      setHeadingColor("text-green-500");
      setMessage("");

      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', data.user.Type);

      // Store user type separately
      const userType = data.user?.Type || "";
      localStorage.setItem('userType', userType);
      console.log("User Type:", userType);


      //  DELAY 450ms BEFORE REDIRECT
      setTimeout(() => {
        if (loginType.toLowerCase() === "personal") {
          navigate("/dashboard");
        } else if (loginType.toLowerCase() === "business") {
          navigate("/dashboard-business");
        } else {
          // Fallback
          navigate("/dashboard");
        }
      }, 450);


    } catch (err) {
      setMessage("Something went wrong. Try again.");

      setTimeout(() => {
        setEmail("");
        setPassword("");
        setLoginType("");
      }, 450);
    }
  };

  // Custom Dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();
  const options = ["Personal", "Business"];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm">

        <h1 className="text-4xl font-bold text-center mb-2">
          <span className="text-yellow-400">Penny</span>
          <span className="text-green-500">Pal</span>
        </h1>

        {/*  Dynamic heading */}
        <p className={`text-center mb-6 ${headingColor}`}>
          {headingText}
        </p>

        {message && <p className="text-center text-red-400 mb-2">{message}</p>}

        <form className="space-y-4" onSubmit={handleSignIn}>

          {/* Email */}
          <div>
            <label className="text-gray-200 block mb-1">E-mail :</label>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full p-2 rounded-lg bg-black text-white focus:ring focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Dropdown */}
          <div ref={dropdownRef} className="relative">
            <label className="text-gray-200 mb-1 block">Type of Account :</label>

            <div
              className="w-full p-2 bg-black text-white rounded-lg cursor-pointer flex justify-between items-center"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {loginType || <span className="text-gray-400">Select account type</span>}
              <span className="ml-2">▼</span>
            </div>

            <ul
              className={`absolute w-full bg-black rounded-lg mt-1 shadow-lg z-10 max-h-40 overflow-auto transition-all duration-300 origin-top ${
                dropdownOpen
                  ? "scale-y-100 opacity-100"
                  : "scale-y-0 opacity-0 pointer-events-none"
              }`}
            >
              {options.map((opt) => (
                <li
                  key={opt}
                  className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                  onClick={() => {
                    setLoginType(opt);
                    setDropdownOpen(false);
                  }}
                >
                  {opt}
                </li>
              ))}
            </ul>
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-200 block mb-1">Password :</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                className="w-full p-2 rounded-lg bg-black text-white focus:ring focus:ring-green-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <span
                className="absolute right-3 top-2 cursor-pointer text-gray-400"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? "Hide" : "Show"}
              </span>
            </div>
          </div>

          <button
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105"
            type="submit"
          >
            Sign In
          </button>

        </form>

        <p className="text-center text-gray-300 mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-yellow-400 hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
};


export default SignIn;
