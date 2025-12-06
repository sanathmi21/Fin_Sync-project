import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const SignUp = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("red");  // To handle message color

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Password confirmation check
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show backend message if signup failed
        setMessage(data.message || "Signup failed");
        setMessageColor("red");
        return;
      }

      // Success
      setMessage(data.message || "Account created successfully!");
      setMessageColor("green");
      
      // Redirect to SignIn after a short delay
      setTimeout(() => navigate("/signin"), 1000);
    } catch (err) {
      console.error("SignUp fetch error:", err);
      setMessage("Something went wrong. Please Try again.");
      setMessageColor("red");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm">

        <h1 className="text-4xl font-bold text-center mb-2">
          <span className="text-yellow-400">Penny</span>
          <span className="text-green-500">Pal</span>
        </h1>
        <p className="text-gray-300 text-center mb-6">Create an account</p>

        {message && <p className="text-center text-red-400 mb-2">{message}</p>}

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
