import React,
{
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  getGRNById,
} from "../../services/grnService";

const GRNDetails = () => {

  const { id } =
    useParams();

  const [grn, setGrn] =
    useState(null);

  useEffect(() => {
    fetchGRN();
  }, []);

  const fetchGRN =
    async () => {
      const res =
        await getGRNById(id);

      setGrn(res.data);
    };

  if (!grn)
    return (
      <p>Loading...</p>
    );

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        {grn.grnNumber}
      </h1>

      <div className="grid md:grid-cols-4 gap-4 mb-6">

        <div className="stat shadow rounded-xl">
          <div className="stat-title">
            Ordered
          </div>
          <div className="stat-value">
            {
              grn.totalOrderedQuantity
            }
          </div>
        </div>

        <div className="stat shadow rounded-xl">
          <div className="stat-title">
            Received
          </div>
          <div className="stat-value">
            {
              grn.totalReceivedQuantity
            }
          </div>
        </div>

        <div className="stat shadow rounded-xl">
          <div className="stat-title">
            Accepted
          </div>
          <div className="stat-value">
            {
              grn.totalAcceptedQuantity
            }
          </div>
        </div>

        <div className="stat shadow rounded-xl">
          <div className="stat-title">
            Rejected
          </div>
          <div className="stat-value">
            {
              grn.totalRejectedQuantity
            }
          </div>
        </div>

      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Ordered</th>
              <th>Received</th>
              <th>Accepted</th>
              <th>Rejected</th>
            </tr>
          </thead>

          <tbody>
            {grn.items.map(
              (item) => (
                <tr
                  key={
                    item._id
                  }
                >
                  <td>
                    {
                      item
                        .materialId
                        ?.materialName
                    }
                  </td>

                  <td>
                    {
                      item.orderedQuantity
                    }
                  </td>

                  <td>
                    {
                      item.quantityReceived
                    }
                  </td>

                  <td>
                    {
                      item.acceptedQuantity
                    }
                  </td>

                  <td>
                    {
                      item.rejectedQuantity
                    }
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default GRNDetails;