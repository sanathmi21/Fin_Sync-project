import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const SignUp = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loginType, setLoginType] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [message, setMessage] = useState("");

  const [messageColor, setMessageColor] = useState("red");

  const [headingText, setHeadingText] = useState("Create an account");
  const [headingColor, setHeadingColor] = useState("text-gray-300");

  


  const handleSignUp = async (e) => {
    e.preventDefault();

    if (pwd !== confirmPwd) {
      setMessage("Passwords do not match");
      setMessageColor("red");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: name,
          email,
          password: pwd,
          type: loginType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Signup failed");
        setMessageColor("red");

        // Keep inputs for retry — DO NOT clear on error
        return;
      }

      // SUCCESS STATE — FIXED
      setHeadingText("Account created successfully!");
      setHeadingColor("text-green-500");

      setMessage("Account created successfully!");
      setMessageColor("green");


      // Delay redirect — FIXED TO 450ms
      setTimeout(() => navigate("/signin"), 450);


    } catch (err) {
      console.error("SignUp fetch error:", err);
      setMessage("Something went wrong. Please try again.");
      setMessageColor("red");
    }
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const options = ["Personal", "Business"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

        {/* Dynamic heading text */}
        <p className={`text-center mb-6 ${headingColor}`}>
          {headingText}
        </p>

        {message && (
          <p className="text-center mb-2" style={{ color: messageColor }}>
            {message}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSignUp}>

          <div>
            <label className="text-gray-200 block mb-1">Name:</label>
            <input
              type="text"
              placeholder="enter your name"
              className="w-full p-2 rounded-lg bg-black text-white focus:ring focus:ring-green-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              style={{ transformOrigin: "top" }}
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

          <div>
            <label className="text-gray-200 block mb-1">Password :</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                className="w-full p-2 rounded-lg bg-black text-white focus:ring focus:ring-green-500"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
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

          <div>
            <label className="text-gray-200 block mb-1">Confirm Password :</label>
            <div className="relative">
              <input
                type={showConfirmPwd ? "text" : "password"}
                className="w-full p-2 rounded-lg bg-black text-white focus:ring focus:ring-green-500"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                required
              />
              <span
                className="absolute right-3 top-2 cursor-pointer text-gray-400"
                onClick={() => setShowConfirmPwd(!showConfirmPwd)}
              >
                {showConfirmPwd ? "Hide" : "Show"}
              </span>
            </div>
          </div>

          <button
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 shrink-0"
            type="submit"
          >
            Sign Up
          </button>

        </form>

        <p className="text-center text-gray-300 mt-4">
          Already have an account?{" "}
          <Link to="/signin" className="text-yellow-400 hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default SignUp;