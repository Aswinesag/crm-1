import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../api/axiosInstance.jsx";
import { useDispatch, useSelector } from "react-redux";
import { updateLead } from "../redux/leadSlice.jsx";
import ksb from '../assets/ksb-logo.png'
import smie from '../assets/logo.png'
import floq from '../assets/FloQ-Logo.png'


const AddQuotation = () => {
    const dispatch = useDispatch();
    const [isOpen,setIsOpen] = useState(false)
    const [sendOpen,setSendOpen] = useState(true)
    const [editOpen,setEditOpen] = useState(false)
    const [originalDetails, setOriginalDetails] = useState(null)
    const [isChanged, setIsChanged] = useState(false)
    const navigate = useNavigate()
    const {id} = useParams()
    const lead = useSelector((state) => state.leads.leads.find((l) => l._id === id))
    console.log("lead data from add quotation", lead);

    const [details,setDetails] = useState({
      // paper 1
      selectedCompany: "",
      quoteMessage: "",
      quotationId: "",
      quoteDate: "",
      quoteSenderName: "",
      quoteSenderNumber:  "",
      quoteSenderEmail: "",
      quotePumpName: "",
      quoteAddress: "",
      quoteBranchName: "",
      partnerLogo: "",
      partnerName: "",

      //paper 2 - section 1
      tag: "",
      qty: "",
      application: "",
      liquid: "",
      flowm: "",
      headm: "",
      density: "",
      suctionPR: "",
      duty: "",

      //paper 2 - section 2
      make: "",
      pumpModel: "",
      pumpSize: "",
      capacity: "",
      dischargePressure: "",
      reliefValue: "",
      reliefValueSetPressure: "",
      shaftSeal: "",
      Bearing: "",
      operatingTem: "",
      designTem: "",
      hydrotestTem: "",
      mounting: "",

      //paper 2 - section 3
      drive: "",
      BKWDutyPoint: "",
      BKWRVSetPressure: "",
      motor: "",

      //paper 2 - section 4
      pumpBody: "",
      rotor: "",
      shaft: "",

      //paper 2 - section 5
      price: null,

      //paper 3 
      incoterms: "",
      pakFor: "",
      IECCode: "",
      deliveryTime: null,
    })
    const [editdetails,setEditDetails] = useState({
      // paper 1
    //   _id: lead._id,
      selectedCompany: "",
      quoteMessage: "",
      quotationId: "",
      quoteDate: "",
      quoteSenderName: "",
      quoteSenderNumber:  "",
      quoteSenderEmail: "",
      quotePumpName: "",
      quoteAddress: "",
      quoteBranchName: "",
      partnerLogo: "",
      partnerName: "",

      //paper 2 - section 1
      tag: "",
      qty: "",
      application: "",
      liquid: "",
      flowm: "",
      headm: "",
      density: "",
      suctionPR: "",
      duty: "",

      //paper 2 - section 2
      make: "",
      pumpModel: "",
      pumpSize: "",
      capacity: "",
      dischargePressure: "",
      reliefValue: "",
      reliefValueSetPressure: "",
      shaftSeal: "",
      Bearing: "",
      operatingTem: "",
      designTem: "",
      hydrotestTem: "",
      mounting: "",

      //paper 2 - section 3
      drive: "",
      BKWDutyPoint: "",
      BKWRVSetPressure: "",
      motor: "",

      //paper 2 - section 4
      pumpBody: "",
      rotor: "",
      shaft: "",

      //paper 2 - section 5
      price: null,

      //paper 3 
      incoterms: "",
      pakFor: "",
      IECCode: "",
      deliveryTime: null,
    })
    // const lead = useSelector((state) => state.leads.leads.find((l) => l._id === id))

    console.log("edit details", editdetails);

    useEffect(()=>{
        
        if(lead){
            setEditDetails({
      // paper 1
    //   _id: lead._id,
      selectedCompany: lead.selectedCompany,
      quoteMessage: lead.quoteMessage,
      quotationId: lead.quotationId,
      quoteDate: lead.quoteDate,
      quoteSenderName: lead.quoteSenderName,
      quoteSenderNumber: lead.quoteSenderNumber,
      quoteSenderEmail: lead.quoteSenderEmail,
      quotePumpName: lead.quotePumpName,
      quoteAddress: lead.quoteAddress,
      quoteBranchName: lead.quoteBranchName,
      partnerLogo: lead.partnerLogo,
      partnerName: lead.partnerName,

      //paper 2 - section 1
      tag: lead.tag,
      qty: lead.qty,
      application: lead.application,
      liquid: lead.liquid,
      flowm: lead.flowm,
      headm: lead.headm,
      density: lead.density,
      suctionPR: lead.suctionPR,
      duty: lead.duty,

      //paper 2 - section 2
      make: lead.make,
      pumpModel: lead.pumpModel,
      pumpSize: lead.pumpSize,
      capacity: lead.capacity,
      dischargePressure: lead.dischargePressure,
      reliefValue: lead.reliefValue,
      reliefValueSetPressure: lead.reliefValueSetPressure,
      shaftSeal: lead.shaftSeal,
      Bearing: lead.Bearing,
      operatingTem: lead.operatingTem,
      designTem: lead.designTem,
      hydrotestTem: lead.hydrotestTem,
      mounting: lead.mounting,

      //paper 2 - section 3
      drive: lead.drive,
      BKWDutyPoint: lead.BKWDutyPoint,
      BKWRVSetPressure: lead.BKWRVSetPressure,
      motor: lead.motor,

      //paper 2 - section 4
      pumpBody: lead.pumpBody,
      rotor: lead.rotor,
      shaft: lead.shaft,

      //paper 2 - section 5
      price: lead.price,

      //paper 3 
      incoterms: lead.incoterms,
      pakFor: lead.pakFor,
      IECCode: lead.IECCode,
      deliveryTime: lead.deliveryTime,
    })
        }
    },[lead])

    const handleAddQuotation = async(id,details) => {
  try{
    const fieldLabels = {
      // Company selection
      selectedCompany: "Company Selection",
      
      // Paper 1
      quoteMessage: "Subject",
      quotationId: "Quotation ID",
      quoteDate: "Quotation Date",
      quoteSenderName: "Sender Name",
      quoteSenderNumber: "Sender Phone Number",
      quoteSenderEmail: "Direct Email",
      quotePumpName: "Pump Name",
      quoteAddress: "Branch Address",
      quoteBranchName: "Branch Name",
      partnerLogo: "Partner Logo",
      partnerName: "Partner Name",

      // Paper 2 - Section 1
      tag: "Tag",
      qty: "Quantity",
      application: "Application",
      liquid: "Liquid",
      flowm: "Flow m³/hr",
      headm: "Head (m)",
      density: "Density (kg/m³)",
      suctionPR: "Suction PR",
      duty: "Duty",

      // Paper 2 - Section 2
      make: "Make",
      pumpModel: "Pump Model",
      pumpSize: "Pump Size (Suction/Discharge)",
      capacity: "Capacity",
      dischargePressure: "Discharge Pressure",
      reliefValue: "Relief Valve",
      reliefValueSetPressure: "Relief Valve Set Pressure",
      shaftSeal: "Shaft Seal",
      Bearing: "Bearing",
      operatingTem: "Operating Temperature",
      designTem: "Design Temperature",
      hydrotestTem: "Hydrotest Pressure",
      mounting: "Mounting",

      // Paper 2 - Section 3
      drive: "Drive",
      BKWDutyPoint: "BKW at Duty Point",
      BKWRVSetPressure: "BKW at RV Set Pressure",
      motor: "Motor",

      // Paper 2 - Section 4
      pumpBody: "Pump Body",
      rotor: "Rotor",
      shaft: "Shaft",

      // Paper 2 - Section 5
      price: "Price",

      // Paper 3
      incoterms: "Incoterms",
      pakFor: "Packing & Forwarding",
      IECCode: "IEC Code",
      deliveryTime: "Delivery Time",
    };

    for (let key in details) {
      if (
        details[key] === "" ||
        details[key] === null ||
        details[key] === undefined
      ) {
        const label = fieldLabels[key] || key; // fallback to key if no label
        toast.error(`Please fill in ${label}`);
        return;
      }
    }

    const quote = await axiosInstance.put(`/leads/${id}`,details)
    dispatch(updateLead(quote.data.data))
    window.location.reload()
    toast.success("Quotations added successfully")
    setDetails([
      {
        // Company selection
        selectedCompany: "",
        
        // paper 1
        quotationId: "",
        quoteDate: "",
        quoteSenderName: "",
        quoteSenderNumber:  "",
        quoteSenderEmail: "",
        quotePumpName: "",
        quoteAddress: "",
        quoteBranchName: "",
        partnerLogo: "",
        partnerName: "",

        //paper 2 - section 1
        tag: "",
        qty: "",
        application: "",
        liquid: "",
        flowm: "",
        headm: "",
        density: "",
        suctionPR: "",
        duty: "",

        //paper 2 - section 2
        make: "",
        pumpModel: "",
        pumpSize: "",
        capacity: "",
        dischargePressure: "",
        reliefValue: "",
        reliefValueSetPressure: "",
        shaftSeal: "",
        Bearing: "",
        operatingTem: "",
        designTem: "",
        hydrotestTem: "",
        mounting: "",

        //paper 2 - section 3
        drive: "",
        BKWDutyPoint: "",
        BKWRVSetPressure: "",
        motor: "",

        //paper 2 - section 4
        pumpBody: "",
        rotor: "",
        shaft: "",

        //paper 2 - section 5
        price: null,

        //paper 3 
        incoterms: "",
        pakFor: "",
        IECCode: "",
        deliveryTime: null,
      }
    ])
  }catch(err){
    if(err?.response?.data?.message){
      toast.error(err.response.data.message)
    }
  }
}


    const handleEditQuotation = async(lid,editdetails) => {
      try{
        const fieldLabels = {
          // Paper 1
          quoteMessage: "Subject",
          quotationId: "Quotation ID",
          quoteDate: "Quotation Date",
          quoteSenderName: "Sender Name",
          quoteSenderNumber:  "Sender Phone Number",
          quoteSenderEmail: "Direct Email",
          quotePumpName: "Pump Name",
          quoteAddress: "Branch Address",
          quoteBranchName: "Branch Name",
          partnerLogo: "Partner Logo",
          partnerName: "Partner Name",

          // Paper 2 - Section 1
          tag: "Tag",
          qty: "Quantity",
          application: "Application",
          liquid: "Liquid",
          flowm: "Flow m³/hr",
          headm: "Head (m)",
          density: "Density (kg/m³)",
          suctionPR: "Suction PR",
          duty: "Duty",

          // Paper 2 - Section 2
          make: "Make",
          pumpModel: "Pump Model",
          pumpSize: "Pump Size (Suction/Discharge)",
          capacity: "Capacity",
          dischargePressure: "Discharge Pressure",
          reliefValue: "Relief Valve",
          reliefValueSetPressure: "Relief Valve Set Pressure",
          shaftSeal: "Shaft Seal",
          Bearing: "Bearing",
          operatingTem: "Operating Temperature",
          designTem: "Design Temperature",
          hydrotestTem: "Hydrotest Pressure",
          mounting: "Mounting",

          // Paper 2 - Section 3
          drive: "Drive",
          BKWDutyPoint: "BKW at Duty Point",
          BKWRVSetPressure: "BKW at RV Set Pressure",
          motor: "Motor",

          // Paper 2 - Section 4
          pumpBody: "Pump Body",
          rotor: "Rotor",
          shaft: "Shaft",

          // Paper 2 - Section 5
          price: "Price",

          // Paper 3
          incoterms: "Incoterms",
          pakFor: "Packing & Forwarding",
          IECCode: "IEC Code",
          deliveryTime: "Delivery Time",
        };

        for (let key in editdetails) {
          if (
            editdetails[key] === "" ||
            editdetails[key] === null ||
            editdetails[key] === undefined
          ) {
            const label = fieldLabels[key] || key; // fallback to key if no label
            toast.error(`Please fill in ${label}`);
            return;
          }
        }

        const quoted = await axiosInstance.put(`/leads/${lid}`,editdetails)
        dispatch(updateLead(quoted.data.data))
        window.location.reload()
        toast.success("Quotations Edited successfully")
      }catch(err){
        if(err?.response?.data?.message){
          toast.error(err.response.data.message)
        }
      }
    }

    const handleClose = () => {
      navigate('/quotation')
    }

    const handleSendEmailQuote = async (lid) => {
        try{
          const send = await axiosInstance.post(`/leads/send-quotation/${lid}`)
          // dispatch(setLeads(send.data))
          setTimeout(() => {
            navigate('/quotation')
            window.location.reload()
          }, 500);
          toast.success(send.data.message)
          setSendOpen(!sendOpen)
        }catch(err){
          console.log(`post quotation to email : ${err.message}`)
          if(err?.response && err?.response?.data && err?.response?.data?.message ){
            toast.error(err.response.data.message)
          }
        }
    }
    
  return (
    <div className="px-6">
      {/* Breadcrumb */}
      <div className="my-4">
        <Link to="/">Dashboard</Link> /{" "}
        <Link to="/quotation" className="hover:text-[#C2410C]">
            Quotations{" "}
        </Link>{" "}
        / <span className="text-[#C2410C]">Make Quotation</span>
      </div>

        <div className="flex flex-row justify-end items-center gap-3">
            {lead?.deliveryTime && (
            <div className=" ml-150 mt-0 md:mt-[-50px]">
            <button
                className="px-4 py-2 text-white rounded-md bg-[#FB6514] mb-5 hover:bg-[#e1580b] cursor-pointer"
                onClick={()=>{
                    setIsOpen(isOpen)
                    setEditOpen(!editOpen)
                }}
            >
              {!editOpen ? "Preview Quotation" : "Edit Quotation"} 
            </button>
            </div>
          )} 
        </div>
          
      {/* Form Container this is not work why tell me */}
        <div className="flex justify-center">
        {lead?.IECCode === ""  ? (
        <div className="bg-white w-full max-w-4xl rounded-md p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-8 text-center">Paper 1 - Quotation</h2>

          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <div>
                <label for="companyname"  className="block mb-1 font-medium">CompanyName</label>
                <div className="div">
                <select name="" id="companyname" onChange={(e)=>setDetails({...details,selectedCompany: e.target.value})} className="outline-none w-full border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                    <option value="">Select Company</option>
                    <option value="SMIE">SMIE</option>
                    <option value="FLOQ">FLOQ</option>
                </select>
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Subject</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={details?.quoteMessage}
                    onChange={(e)=>setDetails({...details,quoteMessage: e.target.value})}
                    placeholder="Please find your quotation"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Quotation ID</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={details?.quotationId}
                    onChange={(e)=>setDetails({...details,quotationId: e.target.value})}
                    placeholder="2618-25-KV-SMIE"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Quotation Date</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.quoteDate}
                    onChange={(e)=>setDetails({...details,quoteDate: e.target.value})}
                    type="date"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Sender Name</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={details?.quoteSenderName}
                    onChange={(e)=>setDetails({...details,quoteSenderName: e.target.value})}
                    placeholder="Velmurugan.K"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Sender Number</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                {/* {icon} */}
                <input
                    type="text"
                    className="outline-none w-full"
                    value={details?.quoteSenderNumber}
                    onChange={(e)=>setDetails({...details,quoteSenderNumber: e.target.value})}
                    placeholder="+917358755442"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Direct Email</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                {/* {icon} */}
                <input
                    type="email"
                    className="outline-none w-full"
                    value={details?.quoteSenderEmail}
                    onChange={(e)=>setDetails({...details,quoteSenderEmail: e.target.value})}
                    placeholder="Sales.smiv@gmail.com"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Pump Name</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.quotePumpName}
                    onChange={(e)=>setDetails({...details,quotePumpName: e.target.value})}
                    // name={name}
                    placeholder="FLOQ PUMPS"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Branch Name</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <select name="" id="" value={details?.quoteBranchName}
                    onChange={(e)=>setDetails({...details,quoteBranchName: e.target.value})} className="outline-none w-full">
                  <option value="">-- Select Branch Name --</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Tamil Nadu">TamilNadu</option>
                </select>
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Branch Address</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <select name="" value={details?.quoteAddress}
                    onChange={(e)=>setDetails({...details,quoteAddress: e.target.value})} id="" className="outline-none w-full">
                  <option value="">-- Select Branch Address--</option>
                  <option value="No 7/287, Saud building, Kozhikode- Palakkad National Highway, Kumaramputhur, Palakkad, Kerala - 678583.">Kerala</option>
                  <option value="No.519/2, Srinivasapillai Nagar, Ayanambakkam, Tamil Nadu, Chennai – 600095.">TamilNadu</option>
                </select>
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Partner Name</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.partnerName}
                    onChange={(e)=>setDetails({...details,partnerName: e.target.value})}
                    // name={name}
                    placeholder="KSB PUMPS"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Partner Logo</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={details?.partnerLogo}
                    onChange={(e)=>setDetails({...details,partnerLogo: e.target.value})}
                    // name={name}
                    placeholder="KSB PUMPS Logo Link"
                />
                </div>
            </div>
            
          
          </div>

          <h2 className="text-xl font-semibold mb-8 mt-9 text-center">Paper 2 - Quotation</h2>

          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* paper 2 - section */}
            <div>
                <label className="block mb-1 font-medium">Tag</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="number"
                    className="outline-none w-full"
                    value={details?.tag}
                    onChange={(e)=>setDetails({...details,tag: e.target.value})}
                    // name={name}
                    placeholder="1"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Quantity</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.qty}
                    onChange={(e)=>setDetails({...details,qty: e.target.value})}
                    // name={name}
                    type="number"
                    placeholder="1"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Application</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={details?.application}
                    onChange={(e)=>setDetails({...details,application: e.target.value})}
                    placeholder="Transfer"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Liquid</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.liquid}
                    onChange={(e)=>setDetails({...details,liquid: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="Cement mill grinding aid chemical"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Flow m3/hr</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.flowm}
                    onChange={(e)=>setDetails({...details,flowm: e.target.value})}
                    // name={name}
                    placeholder="8000 LPH"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Head m</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.headm}
                    onChange={(e)=>setDetails({...details,headm: e.target.value})}
                    // name={name}
                    placeholder="50 Mtrs"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Density (kg/m3)</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="number"
                    className="outline-none w-full"
                    value={details?.density}
                    onChange={(e)=>setDetails({...details,density: e.target.value})}
                    // name={name}
                    placeholder="998"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Suction Pr</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.suctionPR}
                    onChange={(e)=>setDetails({...details,suctionPR: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="Flooded"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Duty</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={details?.duty}
                    onChange={(e)=>setDetails({...details,duty: e.target.value})}
                    placeholder="Transfer"
                />
                </div>
            </div>

            {/* paper 2 - section 2 */}
            <div>
                <label className="block mb-1 font-medium">Make</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.make}
                    onChange={(e)=>setDetails({...details,make: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="FloQ"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Pump model</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.pumpModel}
                    onChange={(e)=>setDetails({...details,pumpModel: e.target.value})}
                    // name={name}
                    placeholder="SMP-125/38"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Pump Size – Suction/Discharge</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.pumpSize}
                    onChange={(e)=>setDetails({...details,pumpSize: e.target.value})}
                    // name={name}
                    placeholder="1 ½ ” x 1 ½ ” BSP"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Capacity</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={details?.capacity}
                    onChange={(e)=>setDetails({...details,capacity: e.target.value})}
                    // name={name}
                    placeholder="8000 LPH"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Discharge Pressure</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.dischargePressure}
                    onChange={(e)=>setDetails({...details,dischargePressure: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="5 Kg/Cm2"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Relief Valve</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={details?.reliefValue}
                    onChange={(e)=>setDetails({...details,reliefValue: e.target.value})}
                    placeholder="Built-in"
                />
                </div>
            </div>

            <div>
                <label className="block mb-1 font-medium">Relief Valve Set pressure</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.reliefValueSetPressure}
                    onChange={(e)=>setDetails({...details,reliefValueSetPressure: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="5 Kg/cm2"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Shaft Seal</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.shaftSeal}
                    onChange={(e)=>setDetails({...details,shaftSeal: e.target.value})}
                    // name={name}
                    placeholder="Oil Seal"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Bearing</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.Bearing}
                    onChange={(e)=>setDetails({...details,Bearing: e.target.value})}
                    // name={name}
                    placeholder="Ball bearing"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Operating Temperature</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.operatingTem}
                    onChange={(e)=>setDetails({...details,operatingTem: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="Ambient"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Design temperature</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.designTem}
                    onChange={(e)=>setDetails({...details,designTem: e.target.value})}
                    // name={name}
                    placeholder="70 Deg. C"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Hydrotest pressure</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.hydrotestTem}
                    onChange={(e)=>setDetails({...details,hydrotestTem: e.target.value})}
                    // name={name}
                    placeholder="7.5 Kg/Cm2"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Mounting</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={details?.mounting}
                    onChange={(e)=>setDetails({...details,mounting: e.target.value})}
                    // name={name}
                    placeholder="Horizontal Foot"
                />
                </div>
            </div>
            {/* paper 2 - section 3 */}
            <div>
                <label className="block mb-1 font-medium">Drive</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.drive}
                    onChange={(e)=>setDetails({...details,drive: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="Direct"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">BKW at duty point</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={details?.BKWDutyPoint}
                    onChange={(e)=>setDetails({...details,BKWDutyPoint: e.target.value})}
                    placeholder="2.40 KW"
                />
                </div>
            </div>

            <div>
                <label className="block mb-1 font-medium">BKW at RV Set pressure</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.BKWRVSetPressure}
                    onChange={(e)=>setDetails({...details,BKWRVSetPressure: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="2.80 KW"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Motor</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.motor}
                    onChange={(e)=>setDetails({...details,motor: e.target.value})}
                    // name={name}
                    placeholder="3.70 KW/1450 RPM NFLP IE2 AC 3 Ph, 415V"
                />
                </div>
            </div>

            {/* paper 2 - section 4 */}
            <div>
                <label className="block mb-1 font-medium">Pump body</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.pumpBody}
                    onChange={(e)=>setDetails({...details,pumpBody: e.target.value})}
                    // name={name}
                    placeholder="Cast Iron IS 210 FG 260"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Rotor</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.rotor}
                    onChange={(e)=>setDetails({...details,rotor: e.target.value})}
                    // name={name}
                    placeholder="Cast Iron IS 210 FG 260"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Shaft</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.shaft}
                    onChange={(e)=>setDetails({...details,shaft: e.target.value})}
                    // name={name}
                    placeholder="EN-8"
                    type="text"
                />
                </div>
            </div>

            {/* paper 2- section 5 */}

            <div>
                <label className="block mb-1 font-medium">PRICE FOR PUMP </label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.price ?? ""}
                    onChange={(e)=>setDetails({...details,price: e.target.value})}
                    // name={name}
                    placeholder="61132.00"
                    type="number"
                />
                </div>
            </div>

            
            
          </div>

          <h2 className="text-xl font-semibold mt-9 mb-8 text-center">Paper 3 - Quotation</h2>

          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label className="block mb-1 font-medium">Price basis / Incoterms</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={details?.incoterms}
                    onChange={(e)=>setDetails({...details,incoterms: e.target.value})}
                    // name={name}
                    placeholder="Ex -Works"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Packaging and forwarding</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.pakFor}
                    onChange={(e)=>setDetails({...details,pakFor: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="2%"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">IEC Code</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                {/* {icon} */}
                <input
                    type="email"
                    className="outline-none w-full"
                    value={details?.IECCode}
                    onChange={(e)=>setDetails({...details,IECCode: e.target.value})}
                    placeholder="ABNCS6715M"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Delivery Time in Weeks</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={details?.deliveryTime ?? ""}
                    onChange={(e)=>setDetails({...details,deliveryTime: e.target.value})}
                    // name={name}
                    placeholder="6"
                    type="number"
                />
                </div>
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
              onClick={()=>handleAddQuotation(id,details)}
            >
              Add Quotation
            </button>
            
          </div>
        
        </div>
        ) : (
            <>
            {!editOpen && (
           <div className="bg-white w-full max-w-4xl rounded-md p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-8 text-center">Edit Quotation</h3>
          <h2 className="text-xl font-semibold mb-8 text-center">Paper 1 - Quotation</h2>

          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <div>
                <label for="companyname"  className="block mb-1 font-medium">CompanyName</label>
                <div className="div">
                <select name="" id="companyname" value={editdetails?.selectedCompany ?? ""} onChange={(e)=>setEditDetails({...editdetails,selectedCompany: e.target.value})} className="outline-none w-full border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                    <option value="">Select Company</option>
                    <option value="SMIE">SMIE</option>
                    <option value="FLOQ">FLOQ</option>
                </select>
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Subject</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={editdetails?.quoteMessage ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,quoteMessage: e.target.value})}
                    // name={name}
                    placeholder="Please find your quotation"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Quotation ID</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={editdetails?.quotationId ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,quotationId: e.target.value})}
                    // name={name}
                    placeholder="2618-25-KV-SMIE"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Quotation Date</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={new Date(editdetails?.quoteDate).toLocaleDateString() ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,quoteDate: new Date(e.target.value).toLocaleDateString()})}
                    // name={name}
                    // type="date"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Sender Name</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                {/* {icon} */}
                <input
                    type="text"
                    className="outline-none w-full"
                    value={editdetails?.quoteSenderName ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,quoteSenderName: e.target.value})}
                    placeholder="Velmurugan.K"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Sender Phone Number</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                {/* {icon} */}
                <input
                    type="text"
                    className="outline-none w-full"
                    value={editdetails?.quoteSenderNumber ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,quoteSenderNumber: e.target.value})}
                    placeholder="+91 7358744552"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Direct Email</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                {/* {icon} */}
                <input
                    type="email"
                    className="outline-none w-full"
                    value={editdetails?.quoteSenderEmail ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,quoteSenderEmail: e.target.value})}
                    placeholder="Sales.smiv@gmail.com"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Pump Name</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.quotePumpName ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,quotePumpName: e.target.value})}
                    // name={name}
                    placeholder="FLOQ PUMPS"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Branch Name</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <select name="" id="" value={editdetails?.quoteBranchName ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,quoteBranchName: e.target.value})} className="outline-none w-full">
                  <option value="">-- Select Branch Name --</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Tamil Nadu">TamilNadu</option>
                </select>
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Branch Address</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <select name="" value={editdetails?.quoteAddress ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,quoteAddress: e.target.value})} id="" className="outline-none w-full">
                  <option value="">-- Select Branch Address--</option>
                  <option value="No 7/287, Saud building, Kozhikode- Palakkad National Highway, Kumaramputhur, Palakkad, Kerala - 678583.">Kerala</option>
                  <option value="No.519/2, Srinivasapillai Nagar, Ayanambakkam, Tamil Nadu, Chennai – 600095.">TamilNadu</option>
                </select>
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Partner Name</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.partnerName ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,partnerName: e.target.value})}
                    // name={name}
                    placeholder="KSB PUMPS"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Partner Logo</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={editdetails?.partnerLogo ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,partnerLogo: e.target.value})}
                    // name={name}
                    placeholder="KSB PUMPS Logo Link"
                />
                </div>
            </div>
            
          
          </div>

          <h2 className="text-xl font-semibold mb-8 mt-9 text-center">Paper 2 - Quotation</h2>

          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* paper 2 - section */}
            <div>
                <label className="block mb-1 font-medium">Tag</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="number"
                    className="outline-none w-full"
                    value={editdetails?.tag ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,tag: e.target.value})}
                    // name={name}
                    placeholder="1"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Quantity</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.qty ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,qty: e.target.value})}
                    // name={name}
                    type="number"
                    placeholder="1"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Application</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={editdetails?.application ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,application: e.target.value})}
                    placeholder="Transfer"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Liquid</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.liquid ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,liquid: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="Cement mill grinding aid chemical"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Flow m3/hr</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.flowm ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,flowm: e.target.value})}
                    // name={name}
                    placeholder="8000 LPH"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Head m</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.headm ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,headm: e.target.value})}
                    // name={name}
                    placeholder="50 Mtrs"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Density (kg/m3)</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="number"
                    className="outline-none w-full"
                    value={editdetails?.density ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,density: e.target.value})}
                    // name={name}
                    placeholder="998"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Suction Pr</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.suctionPR ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,suctionPR: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="Flooded"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Duty</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={editdetails?.duty ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,duty: e.target.value})}
                    placeholder="Transfer"
                />
                </div>
            </div>

            {/* paper 2 - section 2 */}
            <div>
                <label className="block mb-1 font-medium">Make</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.make ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,make: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="FloQ"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Pump model</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.pumpModel ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,pumpModel: e.target.value})}
                    // name={name}
                    placeholder="SMP-125/38"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Pump Size – Suction/Discharge</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.pumpSize ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,pumpSize: e.target.value})}
                    // name={name}
                    placeholder="1 ½ ” x 1 ½ ” BSP"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Capacity</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={editdetails?.capacity ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,capacity: e.target.value})}
                    // name={name}
                    placeholder="8000 LPH"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Discharge Pressure</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.dischargePressure ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,dischargePressure: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="5 Kg/Cm2"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Relief Valve</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={editdetails?.reliefValue ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,reliefValue: e.target.value})}
                    placeholder="Built-in"
                />
                </div>
            </div>

            <div>
                <label className="block mb-1 font-medium">Relief Valve Set pressure</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.reliefValueSetPressure ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,reliefValueSetPressure: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="5 Kg/cm2"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Shaft Seal</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.shaftSeal ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,shaftSeal: e.target.value})}
                    // name={name}
                    placeholder="Oil Seal"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Bearing</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.Bearing ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,Bearing: e.target.value})}
                    // name={name}
                    placeholder="Ball bearing"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Operating Temperature</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.operatingTem ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,operatingTem: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="Ambient"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Design temperature</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.designTem ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,designTem: e.target.value})}
                    // name={name}
                    placeholder="70 Deg. C"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Hydrotest pressure</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.hydrotestTem ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,hydrotestTem: e.target.value})}
                    // name={name}
                    placeholder="7.5 Kg/Cm2"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Mounting</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={editdetails?.mounting ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,mounting: e.target.value})}
                    // name={name}
                    placeholder="Horizontal Foot"
                />
                </div>
            </div>
            {/* paper 2 - section 3 */}
            <div>
                <label className="block mb-1 font-medium">Drive</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.drive ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,drive: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="Direct"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">BKW at duty point</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={editdetails?.BKWDutyPoint ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,BKWDutyPoint: e.target.value})}
                    placeholder="2.40 KW"
                />
                </div>
            </div>

            <div>
                <label className="block mb-1 font-medium">BKW at RV Set pressure</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.BKWRVSetPressure ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,BKWRVSetPressure: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="2.80 KW"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Motor</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.motor ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,motor: e.target.value})}
                    // name={name}
                    placeholder="3.70 KW/1450 RPM NFLP IE2 AC 3 Ph, 415V"
                />
                </div>
            </div>

            {/* paper 2 - section 4 */}
            <div>
                <label className="block mb-1 font-medium">Pump body</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.pumpBody ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,pumpBody: e.target.value})}
                    // name={name}
                    placeholder="Cast Iron IS 210 FG 260"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Rotor</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.rotor ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,rotor: e.target.value})}
                    // name={name}
                    placeholder="Cast Iron IS 210 FG 260"
                    type="text"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Shaft</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.shaft ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,shaft: e.target.value})}
                    // name={name}
                    placeholder="EN-8"
                    type="text"
                />
                </div>
            </div>

            {/* paper 2- section 5 */}

            <div>
                <label className="block mb-1 font-medium">PRICE FOR PUMP </label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.price ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,price: e.target.value})}
                    // name={name}
                    placeholder="61132.00"
                    type="number"
                />
                </div>
            </div>

            
            
          </div>

          <h2 className="text-xl font-semibold mt-9 mb-8 text-center">Paper 3 - Quotation</h2>

          {/* Input Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label className="block mb-1 font-medium">Price basis / Incoterms</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    type="text"
                    className="outline-none w-full"
                    value={editdetails?.incoterms ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,incoterms: e.target.value})}
                    // name={name}
                    placeholder="Ex -Works"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Packaging and forwarding</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.pakFor ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,pakFor: e.target.value})}
                    // name={name}
                    type="text"
                    placeholder="2%"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">IEC Code</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                {/* {icon} */}
                <input
                    type="email"
                    className="outline-none w-full"
                    value={editdetails?.IECCode ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,IECCode: e.target.value})}
                    placeholder="ABNCS6715M"
                />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Delivery Time in Weeks</label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:border-[#FB6514]">
                <input
                    className="outline-none w-full"
                    value={editdetails?.deliveryTime ?? ""}
                    onChange={(e)=>setEditDetails({...editdetails,deliveryTime: e.target.value})}
                    // name={name}
                    placeholder="6"
                    type="number"
                />
                </div>
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
              onClick={()=>handleEditQuotation(id,editdetails)}
            >
              Edit Quotation
            </button>
            
          </div>
        
        </div> 
            )}
            </>
        )}

        </div>


    {/* open preview  */}
    {(!isOpen && editOpen) && (
    <div className="p-5 w-full max-w-4xl rounded-2xl mx-auto">
        <div className="bg-white p-3 w-full rounded-md shadow-md mb-5">
            <h2 className="text-center"><span className="font-bold mr-2">Subject:</span>Hi {lead?.firstName} {lead?.lastName}, {lead?.quoteMessage}</h2>
        </div>
        <div className="bg-white w-full max-w-4xl rounded-md p-6 shadow-md">
            {/* Dynamic gradient colors based on company */}
            <div className="w-full h-10" style={{
                background: lead?.selectedCompany === "FLOQ" 
                    ? 'linear-gradient(to right, #0066CC, #99CCFF)' 
                    : 'linear-gradient(to right, #FF6600, #FFCC80)'
            }}></div>
            <div className="w-full h-4 mt-1" style={{
                background: lead?.selectedCompany === "FLOQ"
                    ? 'linear-gradient(to right, #99CCFF, #0066CC)'
                    : 'linear-gradient(to right, #FFCC80, #FF6600)'
            }}></div>
            
            <div className="flex flex-row items-center">
                <img src={lead?.selectedCompany==="FLOQ" ? floq : smie} className="h-20 w-30 mt-4 ml-5" alt={lead?.selectedCompany || "Company"} />
                <h2 className={`text-2xl ml-30 font-medium ${
                    lead?.selectedCompany === "FLOQ" ? "text-blue-600" : "text-amber-600"
                }`}>
                    {lead?.selectedCompany === "FLOQ" 
                        ? "FLOQ INDUSTRIES PRIVATE LIMITED" 
                        : "SMIE INDUSTRIES PRIVATE LIMITED"
                    }
                </h2>
            </div>
            
            <div className="mt-20 w-[100%] flex flex-row justify-between">
                <div className="ml-3 mt-10 w-[50%]">
                    <h3 className={`text-md font-bold ${
                        lead?.selectedCompany === "FLOQ" ? "text-blue-400" : "text-orange-400"
                    }`}>Customer:</h3>
                    <div className={`mt-[-25px] ${
                        lead?.selectedCompany === "FLOQ" ? "text-blue-400" : "text-orange-400"
                    }`}>___________</div>
                    <h3 className="mt-4 text-sm font-medium">{lead?.company}</h3>
                    <h3 className="mt-2 text-sm text-gray-500">{lead?.address}, {lead?.city}, {lead?.state}, {lead?.country}</h3>
                </div>
                <div className={`w-[50%] h-48 pl-3 shadow-md ${
                    lead?.selectedCompany === "FLOQ" ? "bg-blue-100" : "bg-orange-100"
                }`}>
                    <h3 className={`mt-3 text-md font-sans font-bold ${
                        lead?.selectedCompany === "FLOQ" ? "text-blue-400" : "text-orange-400"
                    }`}>Customer Reference data</h3>
                    <h3 className="mt-2 text-sm"><span className="font-medium">Reference</span>        : {lead?.quotationId}</h3>
                    <h3 className="mt-2 text-sm"><span className="font-medium">Date</span>             : {lead?.quoteDate && new Date(lead.quoteDate).toLocaleDateString()}</h3>
                    <h3 className="mt-2 text-sm"><span className="font-medium">Contact Person</span>   : {lead?.firstName} {lead?.lastName}</h3>
                    <h3 className="mt-2 text-sm"><span className="font-medium">Telephone</span>        : {lead?.phone}</h3>
                    <h3 className="mt-2 text-sm"><span className="font-medium">Email</span>            : <u className="text-blue-700">{lead?.email}</u></h3>
                </div>
            </div>
            
            <div className="mt-20 w-[100%] flex flex-row justify-between">
                <div className="ml-3 mt-23 w-[50%]">
                    <h3 className="mt-4 text-sm"><span className="font-medium">Subject</span> : OFFER FOR {lead?.quotePumpName}</h3>
                    <h3 className="mt-2 text-sm">Enquiry Ref – Verbal Enquiry <span className="font-medium">Date</span> : {lead?.quoteDate && new Date(lead.quoteDate).toLocaleDateString()}</h3>
                </div>
                <div className={`w-[50%] h-48 pl-3 shadow-md ${
                    lead?.selectedCompany === "FLOQ" ? "bg-blue-100" : "bg-orange-100"
                }`}>
                    <h3 className={`mt-3 text-md font-sans font-bold ${
                        lead?.selectedCompany === "FLOQ" ? "text-blue-400" : "text-orange-400"
                    }`}>
                        {lead?.selectedCompany === "FLOQ" ? "FLOQ" : "SMIV"} - Reference data
                    </h3>
                    <h3 className="mt-2 text-sm"><span className="font-medium">Quotation ID</span> : {lead?.quotationId}</h3>
                    <h3 className="mt-2 text-sm"><span className="font-medium">Date</span> : {lead?.quoteDate && new Date(lead.quoteDate).toLocaleDateString()}</h3>
                    <h3 className="mt-2 text-sm"><span className="font-medium">Contact</span> : {lead?.quoteSenderName}</h3>
                    <h3 className="mt-2 text-sm"><span className="font-medium">Mobile</span> : {lead?.quoteSenderNumber}</h3>
                    <h3 className="mt-2 text-sm"><span className="font-medium">Direct Email</span> : <u className="text-blue-700">{lead?.quoteSenderEmail}</u></h3>
                </div>
            </div>
            
            <hr className="mt-5" />
            <div className="mt-5">
                <h3 className="mt-2 text-sm font-medium">Dear Sir/Madam,</h3>
                <h3 className="mt-5 text-sm">We thank you very much for your above-mentioned enquiry. Based on the same we are pleased to submit our technocommercial offer.</h3>
                <h3 className="mt-5 text-sm">Following Annexure will form part of this offer</h3>
                <h3 className="mt-5 text-sm"><span className="font-medium">Annexure 1</span> Technical submittals</h3>
                <h3 className="mt-2 text-sm"><span className="font-medium">Annexure 2</span> General terms and conditions</h3>
                <h3 className="mt-5 text-sm">We trust that the offer is inline with your requirement. Please do let us know in case any clarification is required; we will be happy to provide the same.</h3>
                <h3 className="mt-5 text-sm">We look forward for your valued order and we assure our prompt services always.</h3>
                <h3 className="mt-5 text-sm">Best Regards,</h3>
                <h3 className="mt-2 text-sm font-bold">
                    For {lead?.selectedCompany === "FLOQ" 
                        ? "FLOQ INDUSTRIES PVT LTD" 
                        : "SMIE INDUSTRIES PVT LTD"
                    }
                </h3>
            </div>
            
            <div className="mt-20 flex flex-row w-[100%] items-center">
                <div className="w-[65%]">
                    <h3 className="mt-15 text-sm font-bold text-red-500">{lead?.quoteBranchName} - <span className="text-black">{lead?.quoteAddress}</span></h3>
                </div>
                <div className="w-[25%] ml-20 mt-10">
                    <img src={ksb} alt="ksb" />
                </div>
            </div>
            
            {/* Dynamic bottom gradients */}
            <div className="w-full h-4 mt-7" style={{
                background: lead?.selectedCompany === "FLOQ"
                    ? 'linear-gradient(to right, #99CCFF, #0066CC)'
                    : 'linear-gradient(to right, #FFCC80, #FF6600)'
            }}></div>
            <div className="w-full h-10" style={{
                background: lead?.selectedCompany === "FLOQ" 
                    ? 'linear-gradient(to right, #0066CC, #99CCFF)' 
                    : 'linear-gradient(to right, #FF6600, #FFCC80)'
            }}></div>
            <h3 className="text-center mt-2"><span className="bg-gray-500 text-white px-3 rounded">1</span></h3>
        </div>
        
        {/* Second page with dynamic colors */}
        <div className="bg-white mt-10 w-full max-w-4xl rounded-md p-6 shadow-md">
            <div className="flex flex-row items-center">
                <img src={lead?.selectedCompany === "FLOQ" ? floq : smie} className="h-20 w-30 mt-4 ml-5" alt={lead?.selectedCompany || "Company"} />
                <h2 className={`text-2xl ml-30 font-medium ${
                    lead?.selectedCompany === "FLOQ" ? "text-blue-600" : "text-amber-600"
                }`}>
                    {lead?.selectedCompany === "FLOQ" 
                        ? "FLOQ INDUSTRIES PRIVATE LIMITED" 
                        : "SMIE INDUSTRIES PRIVATE LIMITED"
                    }
                </h2>
            </div>
            <h3 className="text-center mt-10 font-medium">Annexure - 2</h3>
            <h3 className="text-center mt-10 font-medium">OFFER FOR {lead?.partnerName}</h3>
            
            <table className="mt-10 ml-5">
                <tbody>
                <tr>
                    <td className="border px-20 border-black">Tag</td>
                    <td className="border px-20 border-black">{lead?.tag}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Quantity</td>
                    <td className="border px-20 border-black">{lead?.qty}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Application</td>
                    <td className="border px-20 border-black">{lead?.application}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Liquid</td>
                    <td className="border px-20 border-black text-red-500">{lead?.liquid}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Flow m3/hr</td>
                    <td className="border px-20 border-black">{lead?.flowm}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Head m</td>
                    <td className="border px-20 border-black">{lead?.headm}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Density (kg/m3)</td>
                    <td className="border px-20 border-black">{lead?.density}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Suction Pr</td>
                    <td className="border px-20 border-black">{lead?.suctionPR}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Duty</td>
                    <td className="border px-20 border-black">{lead?.duty}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black text-center" colSpan={2}>PUMP OFFERED</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Make</td>
                    <td className="border px-20 border-black">{lead?.make}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Pump model</td>
                    <td className="border px-20 border-black">{lead?.pumpModel}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Pump Size – Suction/Discharge</td>
                    <td className="border px-20 border-black">{lead?.pumpSize}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Capacity</td>
                    <td className="border px-20 border-black">{lead?.capacity}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Discharge Pressure</td>
                    <td className="border px-20 border-black">{lead?.dischargePressure}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Relief Valve</td>
                    <td className="border px-20 border-black text-red-500">{lead?.reliefValue}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Relief Valve Set pressure</td>
                    <td className="border px-20 border-black">{lead?.reliefValueSetPressure}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Shaft Seal</td>
                    <td className="border px-20 border-black">{lead?.shaftSeal}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Bearing</td>
                    <td className="border px-20 border-black">{lead?.Bearing}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Operating Temperature</td>
                    <td className="border px-20 border-black">{lead?.operatingTem}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Design temperature</td>
                    <td className="border px-20 border-black">{lead?.designTem}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Hydrotest pressure</td>
                    <td className="border px-20 border-black">{lead?.hydrotestTem}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Mounting</td>
                    <td className="border px-20 border-black">{lead?.mounting}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black text-center" colSpan={2}>DRIVE DATA</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Drive</td>
                    <td className="border px-20 border-black">{lead?.drive}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">BKW at duty point</td>
                    <td className="border px-20 border-black">{lead?.BKWDutyPoint}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">BKW at RV Set pressure</td>
                    <td className="border px-20 border-black">{lead?.BKWRVSetPressure}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Motor</td>
                    <td className="border px-20 border-black">{lead?.motor}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black text-center" colSpan={2}>MATERIALS OF CONSTRUCTION</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Pump body</td>
                    <td className="border px-20 border-black">{lead?.pumpBody}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Rotor</td>
                    <td className="border px-20 border-black">{lead?.rotor}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">Shaft</td>
                    <td className="border px-20 border-black">{lead?.shaft}</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black text-center" colSpan={2}>PRICE</td>
                </tr>
                <tr>
                    <td className="border px-20 border-black">PRICE FOR PUMP</td>
                    <td className="border px-20 border-black">{lead?.price}</td>
                </tr>
                </tbody>
            </table>
            
            <div className="mt-20 flex flex-row w-[100%] items-center">
                <div className="w-[65%]">
                    <h3 className="mt-15 text-sm font-bold text-red-500">{lead?.quoteBranchName} - <span className="text-black">{lead?.quoteAddress}</span></h3>
                </div>
                <div className="w-[25%] ml-20 mt-10">
                    <img src={ksb} alt="ksb" />
                </div>
            </div>
            
            {/* Dynamic bottom gradients */}
            <div className="w-full h-4 mt-7" style={{
                background: lead?.selectedCompany === "FLOQ"
                    ? 'linear-gradient(to right, #99CCFF, #0066CC)'
                    : 'linear-gradient(to right, #FFCC80, #FF6600)'
            }}></div>
            <div className="w-full h-10" style={{
                background: lead?.selectedCompany === "FLOQ" 
                    ? 'linear-gradient(to right, #0066CC, #99CCFF)' 
                    : 'linear-gradient(to right, #FF6600, #FFCC80)'
            }}></div>
            <h3 className="text-center mt-2"><span className="bg-gray-500 text-white px-3 rounded">2</span></h3>
        </div>
        
        {/* Third page with dynamic colors */}
        <div className="bg-white mt-10 w-full max-w-4xl rounded-md p-6 shadow-md">
            <div className="flex flex-row items-center">
                <img src={lead?.selectedCompany === "FLOQ" ? floq : smie} className="h-20 w-30 mt-4 ml-5" alt={lead?.selectedCompany || "Company"} />
                <h2 className={`text-2xl ml-30 font-medium ${
                    lead?.selectedCompany === "FLOQ" ? "text-blue-600" : "text-amber-600"
                }`}>
                    {lead?.selectedCompany === "FLOQ" 
                        ? "FLOQ INDUSTRIES PRIVATE LIMITED" 
                        : "SMIE INDUSTRIES PRIVATE LIMITED"
                    }
                </h2>
            </div>
            <h3 className="text-center mt-10 font-medium">Annexure - 2</h3>
            <h3 className="text-start mt-10 font-bold ml-2">Commercial Terms and Conditions</h3>
            <div className="ml-5 mb-20">
                <h3 className="mt-5 text-sm"><span className="font-medium">1. Price basis / Incoterms :</span> {lead?.incoterms}</h3>
                <h3 className="mt-5 text-sm"><span className="font-medium">2. Packaging and forwarding :</span> {lead?.pakFor}</h3>
                <h3 className="mt-5 text-sm"><span className="font-medium">3. IEC Code :</span> {lead?.IECCode}</h3>
                <h3 className="mt-5 text-sm"><span className="font-medium">4. GST :</span> 18%</h3>
                <h3 className="mt-5 text-sm"><span className="font-medium">5. Payment Terms :</span> 100% advance with PO</h3>
                <h3 className="mt-5 text-sm"><span className="font-medium">6. Delivery Time :</span> Tag {lead?.deliveryTime} Weeks from date of receipt of your PO along with advance.</h3>
                <h3 className="mt-5 text-sm"><span className="font-medium">7. Freight :</span> Extra and actual</h3>
                <h3 className="mt-5 text-sm"><span className="font-medium">8. Warranty :</span> 12 Month from date of dispatch manufacturing defects</h3>
                <h3 className="mt-5 text-sm"><span className="font-medium">9. Validity of offer :</span> 30 Days</h3>
            </div>
            <div className="mt-5 ml-3">
                <h3 className="mt-2 text-sm">Above prices include only components and works as strictly described in our technical offer.</h3>
                <h3 className="mt-5 text-sm">Our offer is based on our General Terms and Conditions as attached herewith.</h3>
                <h3 className="mt-5 text-sm">Best Regards,</h3>
                <h3 className="mt-2 text-sm font-bold">
                    For {lead?.selectedCompany === "FLOQ" 
                        ? "FLOQ INDUSTRIES PVT LTD" 
                        : "SMIE INDUSTRIES PVT LTD"
                    }
                </h3>
                <h3 className="mt-5 text-sm">{lead?.quoteSenderName}</h3>
                <h3 className="mt-2 text-sm">{lead?.quoteSenderNumber}</h3>
            </div>
            
            <div className="mt-20 flex flex-row w-[100%] items-center">
                <div className="w-[65%]">
                    <h3 className="mt-15 text-sm font-bold text-red-500">{lead?.quoteBranchName}- <span className="text-black">{lead?.quoteAddress}</span></h3>
                </div>
                <div className="w-[25%] ml-20 mt-10">
                    <img src={ksb} alt="ksb" />
                </div>
            </div>
            
            {/* Dynamic bottom gradients */}
            <div className="w-full h-4 mt-7" style={{
                background: lead?.selectedCompany === "FLOQ"
                    ? 'linear-gradient(to right, #99CCFF, #0066CC)'
                    : 'linear-gradient(to right, #FFCC80, #FF6600)'
            }}></div>
            <div className="w-full h-10" style={{
                background: lead?.selectedCompany === "FLOQ" 
                    ? 'linear-gradient(to right, #0066CC, #99CCFF)' 
                    : 'linear-gradient(to right, #FF6600, #FFCC80)'
            }}></div>
            <h3 className="text-center mt-2"><span className="bg-gray-500 text-white px-3 rounded">3</span></h3>
        </div>
        
        <div className="flex flex-row mt-5 gap-3 justify-end">
            {/* <button className="px-5 py-3 border-2 border-orange-500 bg-white text-orange-600 rounded-2xl cursor-pointer" onClick={()=>setIsOpen(!isOpen)}>Cancel</button> */}
            <button className="px-5 py-3 bg-orange-500 text-white rounded-2xl cursor-pointer" onClick={()=>setSendOpen(!sendOpen)} >Send Quotation Email</button>
        </div>
    </div>
)}
          

    {!sendOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Send to Email</h2>
            <p className="mb-6">
              Are you sure you want to send lead to email!?
            </p>
            <div className="flex justify-end gap-4">
              <button
                // onClick={closeDeleteModal}
                onClick={()=>setSendOpen(!sendOpen)}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 cursor-pointer"
                // disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={()=>handleSendEmailQuote(id)}
                className="px-4 py-2 rounded-md bg-orange-600 text-white disabled:opacity-60 cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
    )}
          
    </div>
  );
};

export default AddQuotation;
