import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiUserPlus, FiUploadCloud } from "react-icons/fi";
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance.jsx';
import { postUser } from '../redux/userSlice.jsx'
import { fetchEngineersWithTaskCount } from '../api/fetchdata.jsx';
import { setEngineerTaskCounts } from '../redux/leadSlice.jsx';

const CreateUser = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phoneNum: "",
    status: "Active",
    tasks: "",
    location: "",
    profileImage: null
  })

  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePass = (password) => /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be less than 2MB");
        return;
      }
      setNewUser({ ...newUser, profileImage: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "crm_un");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/drnz6tpox/image/upload",
      { method: "POST", body: formData }
    );

    const data = await res.json();

    if (!res.ok) throw new Error(data.error?.message || "Upload failed");

    return data.secure_url;
  };

  const addUser = async () => {
    if (!validateEmail(newUser.email)) return toast.error("Invalid email");
    if (!validatePass(newUser.password)) return toast.error("Weak password");

    setLoading(true);

    try {
      let imageUrl = "";

      if (newUser.profileImage) {
        imageUrl = await uploadToCloudinary(newUser.profileImage);
      }

      const { data } = await axiosInstance.post("/users", {
        ...newUser,
        avatar: imageUrl,
      });

      dispatch(postUser(data));

      const engineers = await fetchEngineersWithTaskCount();
      dispatch(setEngineerTaskCounts(engineers));

      toast.success(data.message);
      navigate("/users");

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-gray-500">
        <Link to="/">Dashboard</Link> /
        <Link to="/users"> Users</Link> /
        <span className="text-orange-500 font-medium"> Create User</span>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden grid md:grid-cols-3">

        {/* LEFT PANEL */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-8 flex flex-col items-center justify-center">

          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/20">
                <FiUploadCloud size={30} />
              </div>
            )}
          </div>

          <label className="cursor-pointer text-sm underline">
            Upload Photo
            <input type="file" onChange={handleImageChange} className="hidden" />
          </label>

          <p className="mt-6 text-center text-sm opacity-80">
            Add user details and assign responsibilities.
          </p>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-2 p-8 space-y-6">

          <h2 className="text-2xl font-semibold text-gray-700">
            Create New User
          </h2>

          {/* FORM GRID */}
          <div className="grid md:grid-cols-2 gap-5">

            <Input label="Full Name" value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />

            <Input label="Email Address" value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />

            <Input label="Phone Number" value={newUser.phoneNum}
              onChange={(e) => setNewUser({ ...newUser, phoneNum: e.target.value })} />

            <Select label="Role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              options={["Coordinator", "Engineer", "Admin"]}
            />

            <Select label="Status"
              value={newUser.status}
              onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
              options={["Active", "Inactive"]}
            />

            <Input label="Location"
              value={newUser.location}
              onChange={(e) => setNewUser({ ...newUser, location: e.target.value })}
            />

          </div>

          {/* TASKS */}
          {/*<div>
            <label className="text-sm font-medium text-gray-600">Tasks</label>
            <textarea
              value={newUser.tasks}
              onChange={(e) => setNewUser({ ...newUser, tasks: e.target.value })}
              className="mt-2 w-full border rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="Assign tasks..."
            />
          </div>*/}

          {/* PASSWORD */}
          <Input
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">

            <button
              onClick={() => navigate('/users')}
              className="px-5 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={addUser}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-md transition disabled:opacity-50"
            >
              {loading ? "Creating..." : <> <FiUserPlus /> Create User </>}
            </button>

          </div>

        </div>
      </div>
    </div>
  )
}

/* Reusable Components */

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <input
      {...props}
      className="mt-2 w-full border rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none"
    />
  </div>
)

const Select = ({ label, options = [], ...props }) => (
  <div>
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <select
      {...props}
      className="mt-2 w-full border rounded-xl p-3 focus:ring-2 focus:ring-orange-400 outline-none"
    >
      <option value="">Select {label}</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
)

export default CreateUser