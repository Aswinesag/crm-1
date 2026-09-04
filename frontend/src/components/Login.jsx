import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axiosInstance from '../api/axiosInstance.jsx'
import { postLogin } from '../redux/userSlice.jsx'
import toast from 'react-hot-toast'
import { FiEye, FiEyeOff } from "react-icons/fi" // ✅ added icons
import logo3 from '../assets/3.png'

const Login = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [oldUser, setOldUser] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // ✅ new state

  const handleLogin = async (oldUser) => {
    setLoading(true)
    try {
      const { data } = await axiosInstance.post('/auth/login', oldUser, { withCredentials: true })
      localStorage.setItem("token", data.token)
      dispatch(postLogin(data))
      toast.success(data.message)

      setTimeout(() => {
        navigate('/')
        window.location.reload()
      }, 1500)

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message)
      } else {
        toast.error('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* ================= LEFT SIDE ================= */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-orange-300 via-orange-400 to-amber-400 text-white p-10">

        <img
          src={logo3}
          alt="logo"
          className="h-20 object-contain mb-6"
        />

        <h1 className="text-4xl font-bold mb-4 text-center">
          Welcome Back 👋
        </h1>

        <p className="text-lg text-center max-w-md opacity-90">
          Manage your CRM, leads, quotations and delivery operations in a smarter and faster way.
        </p>

        <img
          src="https://illustrations.popsy.co/amber/digital-nomad.svg"
          alt="dashboard"
          className="w-80 mt-10"
        />

        <div className="mt-8 bg-white/30 backdrop-blur-md rounded-xl p-5 shadow-lg w-full max-w-sm text-center">
          <h3 className="text-lg font-semibold mb-2">All-in-One CRM</h3>
          <p className="text-sm opacity-90">
            Track leads, manage deals and monitor your business growth easily.
          </p>
        </div>

      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="flex items-center justify-center bg-gray-50 px-5">

        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">

          <h2 className="text-3xl font-bold text-center text-orange-500 mb-6">
            Login
          </h2>

          <div className="flex flex-col gap-4">

            {/* Email */}
            <div>
              <label className="text-gray-700 font-medium">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={oldUser.email}
                onChange={(e) => setOldUser({ ...oldUser, email: e.target.value })}
                className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-700 font-medium">Password</label>

              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"} // ✅ dynamic type
                  placeholder="Enter your password"
                  value={oldUser.password}
                  onChange={(e) => setOldUser({ ...oldUser, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-300 pr-10"
                />

                {/* Eye Icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-orange-500"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-orange-500 hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Button */}
            <button
              onClick={() => !loading && handleLogin(oldUser)}
              disabled={loading}
              className={`w-full py-3 rounded-md text-white font-semibold transition 
                ${loading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              {loading ? "Logging..." : "Login"}
            </button>

            {/* Register */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-orange-500 font-medium hover:underline">
                Register
              </Link>
            </p>

          </div>
        </div>

      </div>

    </div>
  )
}

export default Login