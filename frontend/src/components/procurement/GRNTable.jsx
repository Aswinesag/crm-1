import React from "react";
import { Link } from "react-router-dom";

const getStatusClass = (
  status
) => {
  switch (status) {
    case "Completed":
      return "badge badge-success";

    case "Partial":
      return "badge badge-warning";

    case "Rejected":
      return "badge badge-error";

    default:
      return "badge badge-info";
  }
};

const GRNTable = ({
  grns = [],
}) => {
  return (
    <div className="overflow-x-auto bg-base-100 rounded-xl shadow">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>GRN No</th>
            <th>PO</th>
            <th>Vendor</th>
            <th>Status</th>
            <th>Delivery Date</th>
            <th>Grand Total</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {grns.map((grn) => (
            <tr key={grn._id}>
              <td>
                {grn.grnNumber}
              </td>

              <td>
                {
                  grn.purchaseOrder
                    ?._id
                }
              </td>

              <td>
                {grn.vendor?.name ||
                  grn.vendor
                    ?.vendorName}
              </td>

              <td>
                <span
                  className={getStatusClass(
                    grn.status
                  )}
                >
                  {grn.status}
                </span>
              </td>

              <td>
                {new Date(
                  grn.deliveryDate
                ).toLocaleDateString()}
              </td>

              <td>
                ₹
                {grn.grandTotal?.toLocaleString()}
              </td>

              <td>
                <Link
                  to={`/procurement/grns/${grn._id}`}
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

export default GRNTable;