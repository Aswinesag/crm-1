import React from 'react'
import { useNavigate } from 'react-router-dom'

const EditEmployee = () => {
    const navigate = useNavigate()
  return (
    <>
     <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-6 text-blue-600">
        Edit Employee Details
      </h2>

      <form className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Employee Name"
          className="border p-2 rounded"
        />
        <select className="border p-2 rounded" name="" id="">
            <option value="">Select Roles</option>
            <option value="">Developer</option>
            <option value="">Designer</option>
            <option value="">HR</option>
            <option value="">Tester</option>
            <option value="">Manager</option>
        </select>

        <select className="border p-2 rounded" name="" id="">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
        </select>

        <select className="border p-2 rounded" name="" id="">
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>

        </select>
        
        {/* <input
          type="text"
          placeholder="Role"
          className="border p-2 rounded"
        /> */}

        <div className="col-span-2 flex gap-4 mt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>   
    </>
  )
}

export default EditEmployee