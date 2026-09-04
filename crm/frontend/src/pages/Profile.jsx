import React, { useEffect, useState } from 'react'
import { MdEdit } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { FaRegEnvelope } from "react-icons/fa6";
import { FiPhone, FiMapPin } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import { FiUserPlus } from "react-icons/fi";
import { RiHandbagFill } from "react-icons/ri";
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'   // ✅ NEW
import axiosInstance from '../api/axiosInstance.jsx'
import { postLogin, putUserProfile } from '../redux/userSlice';
import toast from 'react-hot-toast'
import { Country } from 'country-state-city'

const Profile = () => {

  const [editOpen,setEditOpen] = useState(false)
  const [preview,setPreview] = useState(null)

  const dispatch = useDispatch()
  const navigate = useNavigate()   // ✅ NEW

  const [editProfile,setEditProfile] = useState({
    name: "",avatar:"",phoneNum:"",location:""
  })

  const [countries,setCountries] = useState([])

  useEffect(()=>{
    setCountries(Country.getAllCountries())
    setEditProfile((prev)=>({...prev,location:''}))
  },[])

  const me = useSelector((state) => state.users.currentUser)

  // ✅ CLOSE PAGE → GO BACK
  const handleClosePage = () => {
    navigate(-1)
  }

  const handleEditOpen = (me) =>{
    setEditOpen(true)
    setEditProfile({
      _id: me._id,
      name: me.name,
      avatar: me.avatar,
      phoneNum: me.phoneNum,
      location: me.location
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if(file){
      setEditProfile({...editProfile,avatar: file})
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleDeleteAvatar = async () => {
    try {
      const { data } = await axiosInstance.delete("/users/me/avatar");
      dispatch(putUserProfile(data));
      toast.success("Avatar deleted");
      setPreview(null);
      setEditProfile({ ...editProfile, avatar: "" });
      setEditOpen(false)
    } catch (err) {
      toast.error("Failed to delete avatar");
    }
  };

  const handleEditProfile = async(editProfile) =>{
    try{
      const formData = new FormData()
      formData.append('name',editProfile.name)

      if(editProfile.avatar instanceof File){
        formData.append('avatar',editProfile.avatar)
      }

      formData.append('phoneNum',editProfile.phoneNum)
      formData.append('location',editProfile.location)

      const { data } = await axiosInstance.put(
        "/users/me",
        formData
      );

      dispatch(putUserProfile(data))
      toast.success(data.message)
      setEditOpen(false)

    }catch(err){
      if(err.response?.data?.message){
        toast.error(err.response.data.message)
      }else{
        toast.error('Something went wrong')
      }
    }
  }

  useEffect(()=>{
    const fetchdata = async() => {
      try{
        const {data} = await axiosInstance.get('/auth/me')
        dispatch(postLogin(data))
      }catch(err){
        console.log(`fetch data error : ${err.message}`)
      }
    }
    fetchdata()
  },[dispatch])

  return (
    <div className='xl:w-[60%] md:w-[80%] mx-auto mt-5'>

      {/* HEADER */}
      <div className='flex justify-between items-center'>
        <h1 className="font-semibold text-2xl text-gray-800">
          Profile Settings
        </h1>

        {me && (
          <div className='flex gap-3'>

            {/* EDIT BUTTON */}
            <button
              className='bg-orange-500 text-white px-3 py-2 rounded-md flex gap-2 items-center'
              onClick={() => handleEditOpen(me)}
            >
              <MdEdit /> Edit Profile
            </button>

            {/* ✅ CLOSE BUTTON */}
            <button
              onClick={handleClosePage}
              className='bg-gray-600 text-white px-3 py-2 rounded-md flex items-center gap-2'
            >
              <RxCross1 /> Close
            </button>

          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <div className="absolute right-0 top-20 h-135 md:h-164 w-70 md:w-100 bg-white shadow-lg rounded-md z-10 p-4">
  
          <div className="flex flex-row items-center justify-between mb-5 mt-3">
            <h4 className="text-xl text-gray-700 font-medium">Edit Profile</h4>
            <div className="text-gray-500 mt-1 cursor-pointer" 
              onClick={() => setEditOpen(false)}
            >
              <RxCross1 size={15} />
            </div>
          </div>
          
          <hr className="text-gray-200" />
                    
            <div className="mt-5 flex flex-col gap-4">

              <div className="flex flex-col gap-3">
                <label htmlFor="un" className="text-gray-700 font-medium text-sm">Name</label>
                <input
                  type="text"
                  id='un'
                  value={editProfile?.name} onChange={(e)=>setEditProfile({...editProfile,name: e.target.value})}
                  className='border border-gray-300 rounded-md px-2 py-2 focus:border-[#FB6514] outline-none'
                />
              </div>

              <div className="flex flex-col gap-3">
                <label htmlFor="im" className="text-gray-700 font-medium text-sm">
                  Profile Image
                </label>

                {/* Current or Previewed Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border flex items-center justify-center bg-gray-100">
                    {preview || editProfile?.avatar ? (
                      <img
                        src={preview || editProfile?.avatar}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaRegUser className="w-10 h-10 text-gray-400" />
                    )}
                  </div>

                  {editProfile?.avatar && typeof editProfile.avatar === "string" && (
                    <button
                      type="button"
                      onClick={handleDeleteAvatar}
                      className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer"
                    >
                      Delete Profile Image
                    </button>
                  )}
                </div>

                {/* Upload New */}
                <input
                  type="file"
                  id="im"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/jpg"
                  multiple={false}
                  className="border border-gray-300 rounded-md px-2 py-2 focus:border-[#FB6514] outline-none"
                />
              </div>


              <div className="flex flex-col gap-3">
                <label htmlFor="mn" className="text-gray-700 font-medium text-sm">Mobile Number</label>
                <input
                  type="number"
                  id='mn'
                  placeholder='mobile number'
                  value={editProfile?.phoneNum}
                  onChange={(e)=>setEditProfile({...editProfile,phoneNum: e.target.value})}
                  className='border border-gray-300 rounded-md px-2 py-2 focus:border-[#FB6514] outline-none'
                />
              </div>
                        
              <div className="flex flex-col gap-3">
                <label htmlFor="ln" className="text-gray-700 font-medium text-sm">Location</label>
                  <select
                    type="text"
                    placeholder='Location'
                    id='ln'
                    value={editProfile?.location}
                    onChange={(e)=>setEditProfile({...editProfile,location: e.target.value})}
                    className='border border-gray-300 rounded-md px-2 py-2 focus:border-[#FB6514] outline-none'
                  >
                    <option value=''>Select Country</option>
                    {countries.map((c,i)=>(
                      <option key={i} value={c.name}>{c.name}</option>
                    ))}
                  </select>
              </div>
                        
              <div onClick={()=>handleEditProfile(editProfile)}
                className='bg-[#FB6514] text-white px-4 py-3 rounded-md flex justify-center cursor-pointer absolute bottom-0 w-62 md:w-90 mb-5' 
              >            
                <button className='flex gap-3 items-center font-semibold cursor-pointer'>
                  <FiUserPlus />Save Changes
                </button>
              </div>

            </div>

        </div>
      )}

      {/* PROFILE CARD */}
      <div className='w-full rounded-2xl shadow-sm mt-7 relative bg-white'>

        <div className='w-full h-[130px] bg-orange-500 rounded-t-2xl'></div>

        <div className='w-30 h-30 rounded-full bg-gray-300 top-[-80px] left-12 shadow-sm flex justify-center items-center border-4 border-white text-gray-600 relative'>
          {me?.avatar ? (
            <img
              src={me?.avatar}
              alt="Profile"
              className='w-full h-full object-cover rounded-full'
            />
          ) : (
            <FaRegUser className='w-20 h-20 p-3' />
          )}
        </div>

        <div className='p-7 relative top-[-100px]'>

          <h3 className='text-xl text-gray-700 font-semibold mb-9'>
            Personal Information
          </h3>

          <div className='flex flex-col gap-9'>
            <div className='flex gap-2 items-center text-gray-700'>
              <FaRegUser />
              <p>{me?.name}</p>
            </div>

            <div className='flex gap-2 items-center text-gray-700'>
              <FaRegEnvelope />
              <p>{me?.email}</p>
            </div>

            <div className='flex gap-2 items-center text-gray-700'>
              <RiHandbagFill />
              <p>{me?.role}</p>
            </div>

            <div className='flex gap-2 items-center text-gray-700'>
              <FiPhone />
              <p>{me?.phoneNum}</p>
            </div>

            <div className='flex gap-2 items-center text-gray-700'>
              <FiMapPin />
              <p>{me?.location || "N/A"}</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Profile