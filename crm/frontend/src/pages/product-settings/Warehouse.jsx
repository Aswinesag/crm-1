// Warehouse.jsx
// NOTE:
// This component is based on your existing Brands.jsx structure.
// Because the original project files (Card, WarehouseModal, routes, styling)
// are not available in this environment, this file is a ready-to-paste
// template that matches the logic discussed in the conversation.

import React,{useEffect,useState} from "react";
import Card from "../../components/Card";
import WarehouseModal from "../../components/WarehouseModal";
import {IoIosSearch} from "react-icons/io";
import {MdDelete} from "react-icons/md";
import {PencilIcon} from "@heroicons/react/24/outline";
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from "../../services/warehouseService";

export default function Warehouse(){

const [warehouses,setWarehouses]=useState([]);
const [loading,setLoading]=useState(false);
const [search,setSearch]=useState("");
const [page,setPage]=useState(1);
const [totalPages]=useState(1);
const [showModal,setShowModal]=useState(false);
const [isEdit,setIsEdit]=useState(false);
const [selectedId,setSelectedId]=useState(null);

const [formData,setFormData]=useState({
 warehouseCode:"",
 warehouseName:"",
 location:"",
 managerName:"",
 contactNumber:"",
 status:"Active"
});

const fetchWarehouses=async()=>{
 try{
  setLoading(true);
  const res=await getWarehouses();
  setWarehouses(res.data.data||[]);
 }finally{
  setLoading(false);
 }
};

useEffect(()=>{fetchWarehouses();},[]);

const handleAdd=()=>{
 setFormData({
  warehouseCode:"",
  warehouseName:"",
  location:"",
  managerName:"",
  contactNumber:"",
  status:"Active"
 });
 setIsEdit(false);
 setSelectedId(null);
 setShowModal(true);
};

const handleEdit=(w)=>{
 setSelectedId(w._id);
 setFormData({...w});
 setIsEdit(true);
 setShowModal(true);
};

const handleSubmit=async()=>{
 if(!formData.warehouseCode.trim()) return alert("Warehouse Code Required");
 if(!formData.warehouseName.trim()) return alert("Warehouse Name Required");
 if(!formData.location.trim()) return alert("Location Required");

 if(isEdit) await updateWarehouse(selectedId,formData);
 else await createWarehouse(formData);

 setShowModal(false);
 fetchWarehouses();
};

const handleDelete=async(id)=>{
 if(!window.confirm("Delete Warehouse ?")) return;
 await deleteWarehouse(id);
 fetchWarehouses();
};

const toggleStatus=async(w)=>{
 await updateWarehouse(w._id,{
  status:w.status==="Active"?"Inactive":"Active"
 });
 fetchWarehouses();
};

const filtered=warehouses.filter(w=>
 [w.warehouseCode,w.warehouseName,w.location,w.managerName,w.contactNumber]
 .some(v=>(v||"").toLowerCase().includes(search.toLowerCase()))
);

if(loading) return <div className="p-5">Loading...</div>;

return (
<>
<div className="flex flex-wrap gap-3 mt-4">
<Card title="Total Warehouses" count={warehouses.length} bg="#FFF7ED" color="#C2410C"/>
<Card title="Active" count={warehouses.filter(x=>x.status==="Active").length} bg="#F0FDF4" color="#15803D"/>
<Card title="Inactive" count={warehouses.filter(x=>x.status==="Inactive").length} bg="#FEF2F2" color="#DC2626"/>
</div>

<div className="flex justify-between items-center mt-6 mb-5">
<div className="relative w-full max-w-md">
<IoIosSearch className="absolute left-3 top-3 text-gray-400" size={22}/>
<input
className="w-full pl-10 pr-4 py-2 border rounded-lg"
placeholder="Search Warehouse"
value={search}
onChange={e=>setSearch(e.target.value)}
/>
</div>

<div className="flex gap-2">
<button className="bg-gray-600 text-white px-6 py-2 rounded-md">Search</button>
<button onClick={handleAdd} className="bg-[#FB6514] text-white px-6 py-2 rounded-md">+ Add Warehouse</button>
</div>
</div>

<div className="bg-white rounded-lg shadow-sm overflow-hidden">
<table className="w-full">
<thead className="bg-gray-50">
<tr>
<th className="p-3">#</th>
<th className="p-3 text-left">Code</th>
<th className="p-3 text-left">Warehouse</th>
<th className="p-3 text-left">Location</th>
<th className="p-3 text-left">Manager</th>
<th className="p-3 text-left">Contact</th>
<th className="p-3 text-left">Status</th>
<th className="p-3 text-left">Actions</th>
</tr>
</thead>
<tbody>
{filtered.map((w,i)=>(
<tr key={w._id} className="border-t">
<td className="p-3">{i+1}</td>
<td className="p-3">{w.warehouseCode}</td>
<td className="p-3">{w.warehouseName}</td>
<td className="p-3">{w.location}</td>
<td className="p-3">{w.managerName}</td>
<td className="p-3">{w.contactNumber}</td>
<td className="p-3">
<button onClick={()=>toggleStatus(w)} className={w.status==="Active"?"bg-green-100 text-green-700 px-3 py-1 rounded":"bg-red-100 text-red-700 px-3 py-1 rounded"}>{w.status}</button>
</td>
<td className="p-3">
<div className="flex gap-3">
<PencilIcon className="h-5 w-5 text-yellow-500 cursor-pointer" onClick={()=>handleEdit(w)}/>
<MdDelete className="text-xl text-red-500 cursor-pointer" onClick={()=>handleDelete(w._id)}/>
</div>
</td>
</tr>
))}
{filtered.length===0&&(
<tr><td colSpan="8" className="text-center py-5">No Warehouses Found</td></tr>
)}
</tbody>
</table>

<div className="flex justify-between items-center p-4 border-t">
<span>Page {page} of {totalPages}</span>
<div className="flex gap-3">
<button disabled className="px-3 py-1 border rounded">Previous</button>
<button disabled className="px-3 py-1 border rounded">Next</button>
</div>
</div>
</div>

<WarehouseModal
isOpen={showModal}
onClose={()=>setShowModal(false)}
onSubmit={handleSubmit}
formData={formData}
setFormData={setFormData}
isEdit={isEdit}
/>
</>
);
}
