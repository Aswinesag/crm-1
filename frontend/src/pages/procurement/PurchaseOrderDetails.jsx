import React,
{
 useEffect,
 useState
}
from "react";

import {
 useParams
}
from "react-router-dom";

import {
 getPurchaseOrderById
}
from "../../services/purchaseOrderService";

const PurchaseOrderDetails = () => {

 const { id } = useParams();

 const [po, setPo] =
 useState(null);

 useEffect(() => {
   fetchPO();
 }, []);

 const fetchPO =
 async () => {

   try {

    const res = await getPurchaseOrderById(id);

    console.log("PO RESPONSE:", res);

    setPo(res);

  } catch (err) {

    console.error("PO ERROR:", err);

  }
 };

 if (!po)
 return <div>Loading...</div>;

 return (
  <div>
   Purchase Order Details

 <div className="card bg-base-100 shadow">

 <div className="card-body">

  <h2 className="text-2xl font-bold">
   {po.poNumber}
  </h2>

  <p>
   Status:
   <span className="badge badge-success">
    {po.status}
   </span>
  </p>

 </div>

</div>
<div className="card bg-base-100 shadow">

 <div className="card-body">

  <h3 className="font-bold text-lg">
   Supplier Information
  </h3>

    <p>{po.vendorId?.vendorName}</p>

    <p>{po.vendorId?.email}</p>

    <p>{po.vendorId?.phone}</p>

 </div>

</div>
<div className="card bg-base-100 shadow">

 <div className="card-body">

  <h3 className="font-bold">
   Ordered Items
  </h3>

  <table className="table">

   <thead>

    <tr>
     <th>Material</th>
     <th>Qty</th>
     <th>Price</th>
     <th>Amount</th>
    </tr>

   </thead>

   <tbody>

   {po.items.map(item => (

    <tr key={item._id}>

      <td>
       {item.materialId?.materialName}
      </td>

      <td>
       {item.quantity}
      </td>

      <td>
       ₹{item.unitPrice}
      </td>

      <td>
       ₹{
        item.quantity *
        item.unitPrice
       }
      </td>

    </tr>

   ))}

   </tbody>

  </table>

 </div>

</div><div className="card bg-base-100 shadow">

 <div className="card-body">

  <h3 className="font-bold">
   Financial Summary
  </h3>

  <div>
   Subtotal:
   ₹{po.subtotal}
  </div>

 <div>
  Tax: ₹{po.totalTax}
 </div>

 <div>
  Total: ₹{po.grandTotal}
 </div>

 </div>

</div>
<div className="flex gap-3">

 <button
  className="btn btn-primary"
 >
  Print PO
 </button>

 <button
  className="btn btn-success"
 >
  Download PDF
 </button>

</div>
  </div>
  
 );
};

export default PurchaseOrderDetails;