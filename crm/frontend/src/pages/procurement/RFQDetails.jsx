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
  getRFQById
}
from "../../services/rfqService";

const RFQDetails = () => {

  const { id } =
    useParams();

  const [rfq, setRfq] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    loadRFQ();

  }, []);

  const loadRFQ =
    async () => {

      try {

        const response =
          await getRFQById(id);

        console.log("RFQ API Response:", response.data);

        setRfq(
          response.data
        );

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }
    };

  if (loading) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  if (!rfq) {
    return (
      <div>
        RFQ Not Found
      </div>
    );
  }

  return (

    <div className="container-fluid p-4">

      <h2 className="mb-4">
        RFQ Details
      </h2>

      <div className="card mb-4">
        <div className="card-body">

          <div className="row">

            <div className="col-md-4">
              <strong>
                RFQ Number:
              </strong>
              <br />
              {rfq.rfqNumber}
            </div>

           <div className="col-md-4">
            <strong>Material:</strong>
            <br />
            {rfq.materialId?.materialName}
          </div>

            <div className="col-md-4">
              <strong>
                Status:
              </strong>
              <br />
              {rfq.status}
            </div>

          </div>

        </div>
      </div>

          <div className="card mb-4">
          <div className="card-header">
            RFQ Information
          </div>

          <div className="card-body">

            <p>
              <strong>Required Date:</strong>{" "}
              {new Date(rfq.requiredDate).toLocaleDateString()}
            </p>

            <p>
              <strong>Created By:</strong>{" "}
              {rfq.createdBy}
            </p>

            <p>
              <strong>Remarks:</strong>{" "}
              {rfq.remarks}
            </p>

          </div>
        </div>

      <div className="card mb-4">

        <div className="card-header">
          Materials
        </div>

        <div className="card-body">

          <table className="table">

            <thead>

              <tr>

                <th>
                  Material
                </th>

                <th>
                  Quantity
                </th>

                <th>
                  Unit
                </th>

              </tr>

            </thead>

            <tbody>

            <tr>

              <td>
                {rfq.materialId?.materialName}
              </td>

              <td>
                {rfq.quantity}
              </td>

              <td>
                {rfq.unit}
              </td>

            </tr>

          </tbody>

          </table>

        </div>

      </div>

      <div className="card mb-4">

        <div className="card-header">
          Suppliers
        </div>

        <div className="card-body">

          <table className="table">

            <thead>

              <tr>

                <th>
                  Supplier
                </th>

                <th>
                  Email
                </th>

              </tr>

            </thead>

            <tbody>

              {rfq.vendorIds?.map((vendor) => (

                <tr key={vendor._id}>

                  <td>
                    {vendor.vendorName}
                  </td>

                  <td>
                    {vendor.email}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
};

export default RFQDetails;