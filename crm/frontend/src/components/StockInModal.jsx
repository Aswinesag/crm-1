import React,{useEffect} from "react";

const StockInModal=({
isOpen,
onClose,
onSubmit,
formData,
setFormData,
suppliers,
materials,
warehouses,
isEdit,
})=>{

useEffect(()=>{

const quantity=Number(formData.quantity)||0;

const unitPrice=Number(formData.unitPrice)||0;

setFormData((prev)=>({
...prev,
totalCost:quantity*unitPrice
}));

},[
formData.quantity,
formData.unitPrice,
setFormData
]);

if(!isOpen)return null;

return(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">

<div className="flex items-center justify-between border-b px-6 py-4">

<h2 className="text-xl font-semibold">
{isEdit?"Edit Stock In":"Add Stock In"}
</h2>

<button
onClick={onClose}
className="text-2xl text-gray-500 hover:text-red-500"
>
×
</button>

</div>

<div className="p-6">

<div className="grid grid-cols-2 gap-4">

<div>

<label className="block mb-2 font-medium">
Date
</label>

<input
type="date"
value={formData.date}
onChange={(e)=>
setFormData({
...formData,
date:e.target.value
})
}
className="w-full border rounded-md px-3 py-2"
/>

</div>

<div>

<label className="block mb-2 font-medium">
Supplier
</label>

<select
value={formData.supplier}
onChange={(e)=>
setFormData({
...formData,
supplier:e.target.value
})
}
className="w-full border rounded-md px-3 py-2"
>

<option value="">
Select Supplier
</option>

{suppliers.map((supplier)=>(

<option
key={supplier._id}
value={supplier._id}
>
{supplier.name}
</option>

))}

</select>

</div>

<div>

<label className="block mb-2 font-medium">
Raw Material
</label>

<select
value={formData.material}
onChange={(e)=>
setFormData({
...formData,
material:e.target.value
})
}
className="w-full border rounded-md px-3 py-2"
>

<option value="">
Select Raw Material
</option>

{materials.map((material)=>(

<option
key={material._id}
value={material._id}
>
{material.materialName}
</option>

))}

</select>

</div>
<div>

<label className="block mb-2 font-medium">
Quantity
</label>

<input
type="number"
value={formData.quantity}
onChange={(e)=>
setFormData({
...formData,
quantity:e.target.value
})
}
className="w-full border rounded-md px-3 py-2"
/>

</div>

<div>

<label className="block mb-2 font-medium">
Unit Price
</label>

<input
type="number"
value={formData.unitPrice}
onChange={(e)=>
setFormData({
...formData,
unitPrice:e.target.value
})
}
className="w-full border rounded-md px-3 py-2"
/>

</div>

<div>

<label className="block mb-2 font-medium">
Total Cost
</label>

<input
type="number"
value={formData.totalCost}
readOnly
className="w-full border rounded-md px-3 py-2 bg-gray-100"
/>

</div>

<div>

<label className="block mb-2 font-medium">
Warehouse
</label>

<select
value={formData.warehouse}
onChange={(e)=>
setFormData({
...formData,
warehouse:e.target.value
})
}
className="w-full border rounded-md px-3 py-2"
>

<option value="">
Select Warehouse
</option>

{warehouses.map((warehouse)=>(

<option
key={warehouse._id}
value={warehouse._id}
>
{warehouse.warehouseName}
</option>

))}

</select>

</div>

<div className="col-span-2">

<label className="block mb-2 font-medium">
Remarks
</label>

<textarea
rows={4}
value={formData.remarks}
onChange={(e)=>
setFormData({
...formData,
remarks:e.target.value
})
}
className="w-full border rounded-md px-3 py-2 resize-none"
/>

</div>
          </div>

          <div className="flex justify-end gap-3 mt-6">

            <button
              onClick={onClose}
              className="px-6 py-2 border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={onSubmit}
              className="px-6 py-2 bg-[#FB6514] text-white rounded-md hover:bg-[#e85b10]"
            >
              {isEdit ? "Update Stock In" : "Save Stock In"}
            </button>

          </div>

        </div>

      </div>

    </div>

  );
};

export default StockInModal;