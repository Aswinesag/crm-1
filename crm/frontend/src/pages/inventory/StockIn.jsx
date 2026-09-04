import React,{useEffect,useState} from "react";
import Card from "../../components/Card";
import StockInModal from "../../components/StockInModal";
import {IoIosSearch} from "react-icons/io";
import {MdDelete} from "react-icons/md";
import {PencilIcon} from "@heroicons/react/24/outline";
import{
getStockIns,
createStockIn,
updateStockIn,
deleteStockIn,
activateStockIn,
deactivateStockIn
}from "../../services/stockInService";
import{getSuppliers}from "../../services/supplierService";
import{getRawMaterials}from "../../services/rawMaterialService";
import{getWarehouses}from "../../services/warehouseService";

const StockIn=()=>{

const[stockIns,setStockIns]=useState([]);
const[suppliers,setSuppliers]=useState([]);
const[materials,setMaterials]=useState([]);
const[warehouses,setWarehouses]=useState([]);

const[loading,setLoading]=useState(false);

const[search,setSearch]=useState("");

const[page,setPage]=useState(1);

const[totalPages,setTotalPages]=useState(1);

const[showModal,setShowModal]=useState(false);

const[isEdit,setIsEdit]=useState(false);

const[selectedId,setSelectedId]=useState(null);

const[formData,setFormData]=useState({
stockInNumber:"",
date:new Date().toISOString().split("T")[0],
supplier:"",
material:"",
quantity:"",
unitPrice:"",
totalCost:"",
warehouse:"",
remarks:"",
status:"Active"
});

const fetchStockIns = async () => {
  try {
    setLoading(true);

    const response = await getStockIns(page, 10, search);

    console.log("========== API RESPONSE ==========");
    console.log(response);

    console.log("response.data:");
    console.log(response.data);

    console.log("response.pages:");
    console.log(response.pages);

    setStockIns(response.data || []);
    setTotalPages(response.pages || 1);

  } catch (error) {
    console.log("ERROR:", error);
  } finally {
    setLoading(false);
  }
};

const fetchSuppliers=async()=>{
try{
const response=await getSuppliers(
1,
1000,
""
);

setSuppliers(
response.data.data||[]
);
}
catch(error){
console.log(error);
}
};

const fetchMaterials=async()=>{
try{
const response=await getRawMaterials(
1,
1000,
""
);

setMaterials(
response.data.data||[]
);
}
catch(error){
console.log(error);
}
};

const fetchWarehouses=async()=>{
try{
const response=await getWarehouses(
1,
1000,
""
);

setWarehouses(
response.data.data||[]
);
}
catch(error){
console.log(error);
}
};
useEffect(()=>{
fetchStockIns();
},[page]);

useEffect(()=>{
fetchSuppliers();
fetchMaterials();
fetchWarehouses();
},[]);

const totalStockIns=stockIns.length;

const activeStockIns=stockIns.filter(
(item)=>item.isActive===true
).length;

const inactiveStockIns=stockIns.filter(
(item)=>item.isActive===false
).length;

const filteredStockIns=stockIns.filter(
(item)=>
item.stockInNumber
?.toLowerCase()
.includes(search.toLowerCase())||
item.material?.materialName
?.toLowerCase()
.includes(search.toLowerCase())||
item.supplier?.supplierName
?.toLowerCase()
.includes(search.toLowerCase())
);

if(loading){
return(
<div className="p-5">
Loading...
</div>
);
}
const handleAdd=()=>{
setFormData({
stockInNumber:"",
date:new Date().toISOString().split("T")[0],
supplier:"",
material:"",
quantity:"",
unitPrice:"",
totalCost:"",
warehouse:"",
remarks:"",
status:"Active"
});

setSelectedId(null);

setIsEdit(false);

setShowModal(true);
};

const handleEdit=(stockIn)=>{
setSelectedId(stockIn._id);

setFormData({
stockInNumber:stockIn.stockInNumber||"",
date:stockIn.date?stockIn.date.split("T")[0]:"",
supplier:stockIn.supplier?._id||stockIn.supplier||"",
material:stockIn.material?._id||stockIn.material||"",
quantity:stockIn.quantity||"",
unitPrice:stockIn.unitPrice||"",
totalCost:stockIn.totalCost||"",
warehouse:stockIn.warehouse?._id||stockIn.warehouse||"",
remarks:stockIn.remarks||"",
status:stockIn.isActive?"Active":"Inactive"
});

setIsEdit(true);

setShowModal(true);
};

const handleSubmit=async()=>{
try{

if(!formData.supplier){
return alert("Supplier is required.");
}

if(!formData.material){
return alert("Material is required.");
}

if(!formData.quantity){
return alert("Quantity is required.");
}

if(!formData.unitPrice){
return alert("Unit Price is required.");
}

if(!formData.warehouse){
return alert("Warehouse is required.");
}

const payload={
date:formData.date,
supplier:formData.supplier,
material:formData.material,
quantity:Number(formData.quantity),
unitPrice:Number(formData.unitPrice),
warehouse:formData.warehouse,
remarks:formData.remarks
};

if(isEdit){
await updateStockIn(
selectedId,
payload
);
}
else{
await createStockIn(
payload
);
}

setShowModal(false);

fetchStockIns();

}
catch(error){
alert(
error.response?.data?.message||
"Something went wrong."
);
}
};

const handleDelete=async(id)=>{
const confirmDelete=window.confirm(
"Delete this Stock In entry?"
);

if(!confirmDelete){
return;
}

try{

await deleteStockIn(id);

fetchStockIns();

}
catch(error){
alert(
error.response?.data?.message||
"Delete failed."
);
}
};

const toggleStatus=async(stockIn)=>{
try{

if(stockIn.isActive){
await deactivateStockIn(
stockIn._id
);
}
else{
await activateStockIn(
stockIn._id
);
}

fetchStockIns();

}
catch(error){
console.log(error);
}
};

console.log("stockIns =", stockIns);
return(
<>
<div className="flex flex-wrap gap-3 mt-4">

<Card
title="Total Stock In"
count={totalStockIns}
bg="#FFF7ED"
color="#C2410C"
/>

<Card
title="Active"
count={activeStockIns}
bg="#F0FDF4"
color="#15803D"
/>

<Card
title="Inactive"
count={inactiveStockIns}
bg="#FEF2F2"
color="#DC2626"
/>

</div>

<div className="flex justify-between items-center mt-6 mb-5">

<div className="relative w-full max-w-md">

<IoIosSearch
size={22}
className="absolute left-3 top-3 text-gray-400"
/>

<input
type="text"
placeholder="Search Stock In"
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="w-full pl-10 pr-4 py-2 border rounded-lg"
/>

</div>

<div className="flex gap-2">

<button
onClick={fetchStockIns}
className="bg-gray-600 text-white px-6 py-2 rounded-md"
>
Search
</button>

<button
onClick={handleAdd}
className="bg-[#FB6514] text-white px-6 py-2 rounded-md"
>
+ Add Stock In
</button>

</div>

</div>

<div className="bg-white rounded-lg shadow-sm overflow-x-auto">

<table className="w-full">

<thead className="bg-gray-50">

<tr>

<th className="p-3 text-left">
#
</th>

<th className="p-3 text-left">
Stock In No.
</th>

<th className="p-3 text-left">
Date
</th>

<th className="p-3 text-left">
Supplier
</th>

<th className="p-3 text-left">
Material
</th>

<th className="p-3 text-left">
Quantity
</th>

<th className="p-3 text-left">
Unit Price
</th>

<th className="p-3 text-left">
Total Cost
</th>

<th className="p-3 text-left">
Warehouse
</th>

<th className="p-3 text-left">
Status
</th>

<th className="p-3 text-left">
Actions
</th>

</tr>

</thead>

<tbody>
{filteredStockIns.map((stockIn,index)=>(

<tr
key={stockIn._id}
className="border-t"
>

<td className="p-3">
{(page-1)*10+index+1}
</td>

<td className="p-3">
{stockIn.stockInNumber}
</td>

<td className="p-3">
{stockIn.date
?new Date(stockIn.date).toLocaleDateString("en-IN")
:""}
</td>

<td className="p-3">
{stockIn.supplier?.name || stockIn.supplier?.supplierCode || ""}
</td>

<td className="p-3">
{stockIn.material?.materialName||
stockIn.material}
</td>

<td className="p-3">
{stockIn.quantity}
</td>

<td className="p-3">
₹ {stockIn.unitPrice}
</td>

<td className="p-3">
₹ {stockIn.totalCost}
</td>

<td className="p-3">
{stockIn.warehouse?.warehouseName||
stockIn.warehouse}
</td>

<td className="p-3">

<button
onClick={()=>toggleStatus(stockIn)}
className={
stockIn.isActive
?"bg-green-100 text-green-700 px-3 py-1 rounded"
:"bg-red-100 text-red-700 px-3 py-1 rounded"
}
>
{stockIn.isActive
?"Active"
:"Inactive"}
</button>

</td>

<td className="p-3">

<div className="flex gap-3">

<PencilIcon
className="h-5 w-5 text-yellow-500 cursor-pointer"
onClick={()=>handleEdit(stockIn)}
/>

<MdDelete
className="text-red-500 text-xl cursor-pointer"
onClick={()=>handleDelete(stockIn._id)}
/>

</div>

</td>

</tr>

))}

{filteredStockIns.length===0&&(

<tr>

<td
colSpan="11"
className="text-center py-6 text-gray-500"
>
No Stock In Found
</td>

</tr>

)}

</tbody>

</table>
<div className="flex justify-between items-center p-4 border-t">

<span>
Page {page} of {totalPages}
</span>

<div className="flex gap-3">

<button
disabled={page===1}
onClick={()=>setPage(page-1)}
className="px-3 py-1 border rounded disabled:opacity-50"
>
Previous
</button>

<button
disabled={page===totalPages}
onClick={()=>setPage(page+1)}
className="px-3 py-1 border rounded disabled:opacity-50"
>
Next
</button>

</div>

</div>

</div>

<StockInModal
isOpen={showModal}
onClose={()=>setShowModal(false)}
onSubmit={handleSubmit}
formData={formData}
setFormData={setFormData}
suppliers={suppliers}
materials={materials}
warehouses={warehouses}
isEdit={isEdit}
/>

</>
);
};

export default StockIn;