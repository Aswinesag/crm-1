import React from "react";
import { Link } from "react-router-dom";

const PurchaseOrderTable = ({
  purchaseOrders,
}) => {

  console.log("PO DATAS:", purchaseOrders);

  const getStatusBadge =
    (status) => {

      switch (status) {

        case "Approved":
          return "badge badge-success";

        case "Pending":
          return "badge badge-warning";

        case "Rejected":
          return "badge badge-error";

        default:
          return "badge";
      }
    };

  return (
    <div className="overflow-x-auto">

      <table className="table">

        <thead>
          <tr>
            <th>PO Number</th>
            <th>Supplier</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {purchaseOrders.map((po) => (

            <tr key={po._id}>

              <td>
                {po.poNumber}
              </td>

              <td>
                {po.vendorId?.vendorName}
              </td>

              <td>
                {new Date(
                  po.createdAt
                ).toLocaleDateString()}
              </td>

              <td>

                <span
                  className={
                    getStatusBadge(
                      po.status
                    )
                  }
                >
                  {po.status}
                </span>

              </td>

              <td>
                ₹
                {po.grandTotal?.toLocaleString()}
              </td>

              <td>

                <Link
                  to={`/procurement/purchase-orders/${po._id}`}
                  className="btn btn-sm btn-primary"
                >
                  View
                </Link>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default PurchaseOrderTable;