import React from "react";
import { Link } from "react-router-dom";

const RFQTable = ({
  rfqs,
}) => {
  return (
    <div className="overflow-x-auto">

      <table className="table">

        <thead>
          <tr>
            <th>RFQ No</th>
            <th>Supplier</th>
            <th>Date</th>
            <th>Status</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {rfqs?.length > 0 ? (
            rfqs.map((rfq) => (
              <tr key={rfq._id}>

                <td>{rfq.rfqNumber}</td>

               <td>
                {rfq.vendorIds
                  ?.map((v) => v.vendorName)
                  .join(", ")}
              </td>

                <td>
                  {new Date(
                    rfq.createdAt
                  ).toLocaleDateString()}
                </td>

                <td>

                  <span
                    className={`badge ${
                      rfq.status === "SENT"
                        ? "badge-success"
                        : rfq.status === "DRAFT"
                        ? "badge-warning"
                        : "badge-error"
                    }`}
                  >
                    {rfq.status}
                  </span>

                </td>

                <td>
                  {rfq.items?.length || 0}
                </td>

                <td>

                  <Link
                      to={`/procurement/rfqs/${rfq._id}`}
                      className="
                        btn
                        btn-primary
                        btn-sm
                      "
                    >
                      View
                    </Link>

                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="text-center"
              >
                No RFQs Found
              </td>
            </tr>
          )}

        </tbody>

      </table>

    </div>
  );
};

export default RFQTable;
