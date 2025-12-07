import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const SignIn = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
      // Save the token to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', data.Type); 

      console.log(localStorage.getItem('userType'));

      // Redirect or update UI
      navigate('/dashboard'); } 
      else {
      alert(data.error || 'Login failed'); }
    } catch (err) {
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm">

        <h1 className="text-4xl font-bold text-center mb-2">
          <span className="text-yellow-400">Penny</span>
          <span className="text-green-500">Pal</span>
        </h1>
        <p className="text-gray-300 text-center mb-6">Sign in to your account</p>

        {message && <p className="text-center text-red-400 mb-2">{message}</p>}

        <form className="space-y-4" onSubmit={handleSignIn}>
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
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 shrink-0"
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