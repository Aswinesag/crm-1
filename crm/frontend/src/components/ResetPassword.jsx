import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance.jsx'
import { setUsers } from '../redux/userSlice'
import toast from 'react-hot-toast'

const ResetPassword = () => {

  const dispatch = useDispatch()

  const {uid,uToken} = useParams()

  const [loading,setLoading] = useState(false)

  const navigate = useNavigate()

  const [password,setPassword] = useState('')

  const handleResetPassword = async () => {
    if(!password.trim()){
      toast.error("Password cannot be empty")
      return 
    }
    setLoading(true)
    try{
      const {data} = await axiosInstance.post(`/auth/reset-password/${uid}/${uToken}`,{password})
      dispatch(setUsers(data))
      toast.success(data.message)
      navigate('/login')
    }catch(err){
      if(err.response && err.response.data && err.response.data.message){
        toast.error(err.response.data.message)
      }else{
        toast.error('Something went wrong')
      }
    }finally{
      setLoading(false)
    }
  }
  return (
    <div className="bg-gray-200 bg-opacity-30 fixed inset-0 flex items-center justify-center z-50">

      <div className="bg-white w-md rounded-xl p-7 shadow-lg mx-3">

        <h1 className="text-3xl font-bold text-orange-600 text-center">Create New Password</h1>

        <div className="mt-5 flex flex-col gap-3">

            <div className="flex flex-col gap-2">
                <label className="text-gray-950 text-lg">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 hover:border-orange-500 outline-none"
                  placeholder="Enter your Password"
                />
            </div>

            <button 
              className={`bg-orange-600 text-white p-3 rounded-md mt-5 font-semibold text-lg ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`} 
              type='button'
              onClick={()=>!loading && handleResetPassword(password)}
            >
              Reset Password
            </button>  

        </div>
      </div>
    </div>
  )
}

export default ResetPassword