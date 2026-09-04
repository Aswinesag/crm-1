import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMapPin } from "react-icons/fi";
import { FaRegBuilding, FaRegEnvelope, FaUserTie } from "react-icons/fa";
import { CiGlobe } from "react-icons/ci";
import { CgNotes } from "react-icons/cg";
import { City, Country, State } from "country-state-city";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../api/axiosInstance.jsx";
import { useDispatch, useSelector } from "react-redux";
import { clearCompanyDetail, createLead, setCompanyDetail, setEngineerTaskCounts } from "../redux/leadSlice.jsx";
import { fetchEngineersWithTaskCount } from "../api/fetchdata.jsx";

const CreateNewLead = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get engineers from Redux state
  const engineerTaskCounts = useSelector(
    (state) => state.leads.engineer_taskCounts
  );

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [phoneCode, setPhoneCode] = useState("");

  // Dynamic Products State
const [products, setProducts] = useState([
  {
    productName: "",
    quantity: 1,
    serialNumbers: "",
    invoiceNo: ""
  },
]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    name: "",
    company: "",
    leadSource: "",
    priority: "",
    email: "",
    phone: "",
    country: "", 
    state: "",  
    city: "",   
    address: "",
    description: "",
    assignedTo: ""||null,      // Engineer name
    engineer_id: ""||null      // Engineer ID
  });

  // Fetch engineers on component mount
  useEffect(() => {
    const loadEngineers = async () => {
      try {
        const engineersData = await fetchEngineersWithTaskCount();
        dispatch(setEngineerTaskCounts(engineersData));
      } catch (error) {
        console.error("Failed to fetch engineers:", error);
      }
    };
    loadEngineers();
  }, [dispatch]);

 

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (formData.country) {
      setStates(State.getStatesOfCountry(formData.country));
      setFormData((prev) => ({ ...prev, state: "", city: "" }));
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
      setFormData((prev) => ({ ...prev, state: "", city: "" }));
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.country && formData.state) {
      setCities(City.getCitiesOfState(formData.country, formData.state));
      setFormData((prev) => ({ ...prev, city: "" }));
    } else {
      setCities([]);
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  }, [formData.country, formData.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  //   if (name === "company") {
  //   debouncedSearch(value); 
  // }
  };

  // Add Product Row
const handleAddProduct = () => {
  setProducts([
    ...products,
    {
      productName: "",
      quantity: 1,
      serialNumbers: "",
      invoiceNo: "",
    },
  ]);
};

// Remove Product
const handleRemoveProduct = (index) => {
  const updatedProducts = products.filter((_, i) => i !== index);
  setProducts(updatedProducts);
};

// Handle Product Change
const handleProductChange = (index, field, value) => {
  const updatedProducts = [...products];

  updatedProducts[index][field] = value;

  setProducts(updatedProducts);
};

  // Handle engineer selection
  const handleEngineerChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setFormData((prev) => ({ 
        ...prev, 
        assignedTo: "", 
        engineer_id: "" 
      }));
      return;
    }
    
    try {
      const selectedEngineer = JSON.parse(value);
      setFormData((prev) => ({ 
        ...prev, 
        assignedTo: selectedEngineer.name, 
        engineer_id: selectedEngineer.id 
      }));
    } catch (error) {
      console.error("Error parsing engineer selection:", error);
      toast.error("Invalid engineer selection");
    }
  };

  const handleClose = () => {
    navigate("/leads");
  };


  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }




const handleAutoFillCompany = async (e) => {
  const companyName = e.target.value;
  // if (!companyName) return;

  if (!companyName || companyName.trim() === "") {
    setFormData((prev) => ({
      ...prev,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      country: "",
      state: "",
      city: "",
      // Keep only the fields the user might be currently typing
      company: "", 
      name: prev.name, 
    }));
    setPhoneCode("91");
    return;
  }

  try {
    // 1. Fetch with a tight timeout for speed
    const response = await axiosInstance.get(`/leads/company/${companyName}`, { 
      timeout: 1000 // 1 second limit
    });

    if (response.data.status && response.data.data) {
      const prevData = response.data.data;
      
      // 2. Dispatch to Redux Store
      dispatch(setCompanyDetail(prevData));
      
      toast.success("Details retrieved!");

       const phoneParts = prevData.phone ? prevData.phone.split("-") : ["", ""];
      const code = phoneParts[0]?.replace("+", "") || "";
      const number = phoneParts[1] || "";
      setPhoneCode(code);

      // 2. Find ISO codes if your backend only provides Names
      // This is crucial for the dropdowns to actually show the values
      const countryObj = Country.getAllCountries().find(c => c.name === prevData.country);
      const countryIso = countryObj ? countryObj.isoCode : "";
      
      let stateIso = "";
      if (countryIso) {
        const stateObj = State.getStatesOfCountry(countryIso).find(s => s.name === prevData.state);
        stateIso = stateObj ? stateObj.isoCode : "";
      }

      // 3. Update Form State
      setFormData((prev) => ({
        ...prev,
        firstName: prevData.firstName || "",
        lastName: prevData.lastName || "",
        email: prevData.email || "",
        phone: number,
        // leadSource: prevData.leadSource || "",
        address: prevData.address || "",
        country: countryIso, // Set ISO code for dropdown logic
        state: stateIso,     // Set ISO code for dropdown logic
        city: prevData.city || "",
        leadSource: prevData.leadSource || "",
        priority: prevData.priority || "",
        description: prevData.description || "",
        
        // KEEP THESE BLANK/PREVIOUS as requested
        name: prev.name, 
        assignedTo: prev.assignedTo,
        engineer_id: prev.engineer_id
      }));

    } else {
      toast.error("Company not found", { duration: 1000 });
    }
  } catch (error) {
    // This triggers instantly if timeout is reached or 404 is returned
    toast.error("No record found", { duration: 1000 });
    dispatch(clearCompanyDetail());
  }
};


  const isFormValid = () => {
    // Engineer assignment is optional, so we exclude it from validation
    const requiredFields = [
      "firstName", "lastName", "name", "company", 
      "leadSource", "priority", "email", "phone", 
      "country", "state", "city", "address"
    ];
    
    for (const key of requiredFields) {
      if (!formData[key]) {
        toast.error(`Please fill the ${key} field`);
        return false;
      }
    }
    
    if(!isValidEmail(formData.email)){
      toast.error('Please enter a valid email address')
      return false;
    }
    if (!phoneCode) {
      toast.error("Please select phone code");
      return false;
    }
    return true;
  };

  const handleCreateLead = async () => {
    if (!isFormValid()) return;

    // Find full country name from isoCode
    const selectedCountry = countries.find(c => c.isoCode === formData.country);

    // Find full state name from isoCode
    const selectedState = states.find(s => s.isoCode === formData.state);

   const payload = {
  ...formData,

  products: products,

  country: selectedCountry ? selectedCountry.name : formData.country,

  state: selectedState ? selectedState.name : formData.state,

  phone: `+${phoneCode}-${formData.phone}`,

  ...(formData.assignedTo && {
    assignedTo: formData.assignedTo,
    engineer_id: formData.engineer_id
  })
};

    try {
      const response = await axiosInstance.post("/leads", payload);
      if (response.data.success) {
        toast.success("Lead created successfully");
        dispatch(createLead(response.data.data));
        
        // Refresh engineer task counts if an engineer was assigned
        if (formData.assignedTo) {
          const updatedEngineers = await fetchEngineersWithTaskCount();
          dispatch(setEngineerTaskCounts(updatedEngineers));
        }
        
        navigate("/leads");
      } else {
        toast.error(response.data.message || "Failed to create lead");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating lead");
    }
  };

  return (
    <div className="px-6">
      {/* Breadcrumb */}
      <div className="my-4">
        <Link to="/">Dashboard</Link> /{" "}
        <Link to="/leads" className="hover:text-[#C2410C]">
          Leads{" "}
        </Link>{" "}
        / <span className="text-[#C2410C]">Create Lead</span>
      </div>

      {/* Form Container */}
      <div className="flex justify-center">
        <div className="bg-white w-full max-w-4xl rounded-md p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-6">Create New Lead</h2>

          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputWithIcon
              label="First Name"
              icon={<FiUser />}
              placeholder="First Name"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
            />
            <InputWithIcon
              label="Last Name"
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
            <InputWithIcon
              label="Lead Name"
              name="name"
              type="text"
              placeholder="Lead Name"
              value={formData.name}
              onChange={handleChange}
            />
            <InputWithIcon
              label="Company Name"
              icon={<FaRegBuilding />}
              name="company"
              type="text"
              onBlur={handleAutoFillCompany}
              placeholder="Company Name"
              value={formData.company}
              onChange={handleChange}
            />

            {/* Lead Source */}
            <SelectField
              label="Lead Source"
              name="leadSource"
              type="text"
              value={formData.leadSource}
              onChange={handleChange}
              options={[
                { value: "IndiaMart", label: "IndiaMart" },
                { value: "Facebook", label: "Facebook" },
                { value: "JustDial", label: "JustDial" },
                { value: "LinkedIn", label: "LinkedIn" },
                { value: "Website", label: "Website" },
                { value: "Instagram", label: "Instagram" },
                { value: "Email", label: "Email" },
                { value: "Referral", label: "Referral" },
                { value: "Other", label: "Other" },
              ]}
            />

            {/* Priority */}
            <SelectField
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={[
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
              ]}
            />

            <InputWithIcon
              type="email"
              label="Email"
              icon={<FaRegEnvelope />}
              name="email"
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
            />

            {/* Phone */}
            <div>
              <label className="block mb-1 font-medium">Phone</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <select
                  className="outline-none max-w-20"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                >
                  <option value="">Code</option>
                  {countries.map((c, i) => (
                    <option key={i} value={c.phonecode}>
                      +{c.phonecode}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="outline-none w-full"
                  name="phone"
                  pattern="\d+"
                  maxLength="15"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            <SelectField
              label="Country"
              icon={<CiGlobe />}
              name="country"
              type="text"
              value={formData.country}
              onChange={(e) => {
                const selectedCountry = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  country: selectedCountry,
                  state: "",
                  city: "",
                }));
                const countryObj = countries.find((c) => c.isoCode === selectedCountry);
                if (countryObj) {
                  setStates(State.getStatesOfCountry(countryObj.isoCode));
                  setCities([]);
                } else {
                  setStates([]);
                  setCities([]);
                }
              }}
              options={countries.map((c) => ({ value: c.isoCode, label: c.name }))}
            />
            <SelectField
              label="State"
              name="state"
              type="text"
              value={formData.state}
              onChange={(e) => {
                const selectedState = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  state: selectedState,
                  city: "",
                }));
                const countryObj = countries.find((c) => c.isoCode === formData.country);
                if (!countryObj) return;
                const stateObj = states.find((s) => s.isoCode === selectedState);
                if (stateObj) {
                  setCities(City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode));
                } else {
                  setCities([]);
                }
              }}
              options={states.map((s) => ({ value: s.isoCode, label: s.name }))}
            />
            <SelectField
              label="City"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              options={cities.map((c) => ({ value: c.name, label: c.name }))}
            />
          </div>

          {/* Address */}
          <div className="mt-5">
            <InputWithIcon
              label="Address"
              icon={<FiMapPin />}
              name="address"
              type="text"
              placeholder='Address'
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          {/* Assigned Engineer - New Field */}
          <div className="mt-5">
            <label className="block mb-1 font-medium">Assigned Engineer (Optional)</label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
              <FaUserTie className="text-gray-400" />
              <select
                className="outline-none w-full"
                value={
                  formData.assignedTo
                    ? JSON.stringify({
                        name: formData.assignedTo,
                        id: formData.engineer_id,
                      })
                    : ""
                }
                onChange={handleEngineerChange}
              >
                <option value="">Select Engineer (Optional)</option>
                {engineerTaskCounts.map((eng, idx) => (
                  <option
                    key={idx}
                    value={JSON.stringify({
                      name: eng.name,
                      id: eng._id,
                    })}
                  >
                    {eng.name} ({eng.assignedTaskCount} tasks)
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              You can assign an engineer now or later from the leads table
            </p>
          </div>

          {/* Description */}
          <div className="mt-5">
            <label className="block mb-1 font-medium">Description</label>
            <div className="flex items-start gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
              <CgNotes className="mt-1" />
              <textarea
                className="outline-none w-full resize-none"
                rows="4"
                name="description"
                placeholder="About Leads"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-white rounded-md bg-[#FB6514] hover:bg-[#e1580b] cursor-pointer"
              onClick={handleCreateLead}
            >
              Create Lead
            </button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

// Reusable InputWithIcon component
const InputWithIcon = ({ label, icon, value, onChange, name,onBlur, type, placeholder }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
      {icon}
      <input
        type={type}
        className="outline-none w-full"
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        name={name}
        placeholder={placeholder}
      />
    </div>
  </div>
);

// Reusable SelectField component
const SelectField = ({ label, icon, name, value, onChange, options }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <div
      className={`flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514] ${
        icon ? "" : "pl-3"
      }`}
    >
      {icon}
      <select
        className="outline-none w-full"
        name={name}
        value={value}
        onChange={onChange}
      >
        <option value="">{`Select ${label}`}</option>
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default CreateNewLead;
