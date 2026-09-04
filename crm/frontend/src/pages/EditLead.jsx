import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineIdentification } from "react-icons/hi2";
import { FaUserEdit } from "react-icons/fa";
import toast from 'react-hot-toast';
import { IoSendSharp } from "react-icons/io5";

const EditLead = () => {
  const [loading,setLoading] = useState(false)
  const [Qloading,setQloading] = useState(false)
  const navigate = useNavigate()

  const editLead = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }

  const sendEmail = () => {
    setQloading(true)
    setTimeout(() => setQloading(false), 1500)
  }

  const warn = (message) => {
    toast(message, {
      icon: "⚠️",
      style: {
        border: '1px solid #facc15',
        padding: '8px',
        color: '#92400e',
        background: '#fef9c3',
      },
    });
  };

  const disabledShow = () => {
    warn("The Created By field is read-only")
  }

  const sourceData = ['IndiaMart','Facebook','JustDial','LinkedIn','Website','Instagram','Email','Referral','Other']

  return (
    <div>

      {/* Header */}
      <div className='flex flex-col md:flex-row justify-between items-center mb-6'>
        <div className='flex items-center gap-3'>
          <HiOutlineIdentification size={40} className='bg-orange-100 text-orange-500 rounded p-2' />
          <h2 className='text-2xl font-bold text-gray-700'>Lead Information</h2>
        </div>

        {/* Buttons */}
        <div className='flex gap-3 mt-4 md:mt-0'>
          <button
            onClick={() => !Qloading && sendEmail()}
            className={`bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 ${Qloading && 'opacity-50 cursor-not-allowed'}`}
          >
            {Qloading ? "Sending..." : <><IoSendSharp /> Send Quotation</>}
          </button>

          <button
            onClick={() => !loading && editLead()}
            className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 ${loading && 'opacity-50 cursor-not-allowed'}`}
          >
            {loading ? "Updating..." : <><FaUserEdit /> Update Lead</>}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>

        {/* Input Field */}
        {[
          {label:"Lead Name", value:"leads name1"},
          {label:"Company Name", value:"ABC Company"},
          {label:"First Name", value:"first name1"},
          {label:"Last Name", value:"last name1"},
          {label:"Email", value:"email1"},
          {label:"Phone Number", value:"687979868"},
          {label:"Quote Amount", value:"Rs.25000"}
        ].map((item,i)=>(
          <div key={i}>
            <label className='text-sm font-semibold text-gray-600'>{item.label}</label>
            <input type="text" value={item.value} className='mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-400 outline-none'/>
          </div>
        ))}

        {/* Created By */}
        <div>
          <label className='text-sm font-semibold text-gray-600'>Created By</label>
          <input type="text" value="creator name" disabled
            onMouseOver={disabledShow}
            className='mt-1 w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed'/>
        </div>

        {/* Dropdowns */}
        <div>
          <label className='text-sm font-semibold'>Assigned To</label>
          <select className='mt-1 w-full p-3 border rounded-lg'>
            <option>engineers</option>
          </select>
        </div>

        <div>
          <label className='text-sm font-semibold'>Priority</label>
          <select className='mt-1 w-full p-3 border rounded-lg'>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div>
          <label className='text-sm font-semibold'>Status</label>
          <select className='mt-1 w-full p-3 border rounded-lg'>
            <option>Follow-up</option>
            <option>Converted</option>
            <option>Quotation</option>
            <option>Lost</option>
          </select>
        </div>

        <div>
          <label className='text-sm font-semibold'>Country</label>
          <select className='mt-1 w-full p-3 border rounded-lg'><option>countries</option></select>
        </div>

        <div>
          <label className='text-sm font-semibold'>State</label>
          <select className='mt-1 w-full p-3 border rounded-lg'><option>states</option></select>
        </div>

        <div>
          <label className='text-sm font-semibold'>City</label>
          <select className='mt-1 w-full p-3 border rounded-lg'><option>cities</option></select>
        </div>

        <div className='md:col-span-2 xl:col-span-3'>
          <label className='text-sm font-semibold'>Address</label>
          <textarea className='mt-1 w-full p-3 border rounded-lg' value="123 street"/>
        </div>

        <div>
          <label className='text-sm font-semibold'>Source</label>
          <select className='mt-1 w-full p-3 border rounded-lg'>
            {sourceData.map((s,i)=><option key={i}>{s}</option>)}
          </select>
        </div>

      </div>
    </div>
  )
}

export default EditLead