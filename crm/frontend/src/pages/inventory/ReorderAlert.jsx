import React, { useEffect, useState } from "react";
import Card from "../../components/Card";
import { IoIosSearch } from "react-icons/io";
import { getReorderAlerts } from "../../services/reorderAlertService";

const ReorderAlert = () => {

  // ==========================================
  // STATES
  // ==========================================

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const recordsPerPage = 10;

  // ==========================================
  // FETCH REORDER ALERTS
  // ==========================================

  const fetchReorderAlerts = async () => {

    try {

      setLoading(true);

      const response = await getReorderAlerts();

      // Handle both possible response formats

      if (Array.isArray(response)) {

        setAlerts(response);

      } else if (Array.isArray(response.data)) {

        setAlerts(response.data);

      } else {

        setAlerts([]);

      }

    } catch (error) {

      console.error("Error Fetching Reorder Alerts:", error);

    } finally {

      setLoading(false);

    }

  };

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {

    fetchReorderAlerts();

  }, []);

  // ==========================================
  // SUMMARY CARDS
  // ==========================================

  const totalAlerts = alerts.length;

  const reorderRequired = alerts.filter(
    (item) => item.status === "Reorder Required"
  ).length;

  const stockAvailable = alerts.filter(
    (item) => item.status !== "Reorder Required"
  ).length;

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredAlerts = alerts.filter((item) => {

    const keyword = search.toLowerCase();

    return (

      item.itemCode?.toLowerCase().includes(keyword) ||

      item.itemName?.toLowerCase().includes(keyword) ||

      item.status?.toLowerCase().includes(keyword)

    );

  });

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.ceil(
    filteredAlerts.length / recordsPerPage
  );

  const indexOfLastRecord = page * recordsPerPage;

  const indexOfFirstRecord =
    indexOfLastRecord - recordsPerPage;

  const currentRecords =
    filteredAlerts.slice(
      indexOfFirstRecord,
      indexOfLastRecord
    );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div className="p-5">
        Loading...
      </div>
    );

  }

  return (

    <>

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="flex flex-wrap gap-3 mt-4">

        <Card
          title="Total Alerts"
          count={totalAlerts}
          bg="#FFF7ED"
          color="#C2410C"
        />

        <Card
          title="Reorder Required"
          count={reorderRequired}
          bg="#FEF2F2"
          color="#DC2626"
        />

        <Card
          title="Stock Available"
          count={stockAvailable}
          bg="#F0FDF4"
          color="#15803D"
        />

      </div>

      {/* ==========================================
          SEARCH BAR
      ========================================== */}

      <div className="flex justify-between items-center mt-6 mb-5">

        <div className="relative w-full max-w-md">

          <IoIosSearch
            size={22}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search Reorder Alert"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />

        </div>

      </div>
            {/* ==========================================
          REORDER ALERT TABLE
      ========================================== */}

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50">

            <tr>

              <th className="p-3 text-left">
                #
              </th>

              <th className="p-3 text-left">
                Item Code
              </th>

              <th className="p-3 text-left">
                Item Name
              </th>

              <th className="p-3 text-left">
                Current Stock
              </th>

              <th className="p-3 text-left">
                Reorder Level
              </th>

              <th className="p-3 text-left">
                Suggested Quantity
              </th>

              <th className="p-3 text-left">
                Unit
              </th>

              <th className="p-3 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {

              currentRecords.length > 0

                ?

                currentRecords.map((alert, index) => (

                  <tr
                    key={index}
                    className="border-t"
                  >

                    <td className="p-3">
                      {(page - 1) * recordsPerPage + index + 1}
                    </td>

                    <td className="p-3">
                      {alert.itemCode}
                    </td>

                    <td className="p-3">
                      {alert.itemName}
                    </td>

                    <td className="p-3">
                      {alert.currentStock}
                    </td>

                    <td className="p-3">
                      {alert.reorderLevel}
                    </td>

                    <td className="p-3">
                      {alert.suggestedQuantity}
                    </td>

                    <td className="p-3">
                      {alert.unit}
                    </td>

                    <td className="p-3">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${

                          alert.status === "Reorder Required"

                            ? "bg-red-100 text-red-700"

                            : "bg-green-100 text-green-700"

                        }`}
                      >

                        {alert.status}

                      </span>

                    </td>

                  </tr>

                ))

                :

                <tr>

                  <td
                    colSpan="8"
                    className="text-center py-6 text-gray-500"
                  >

                    No Reorder Alerts Found

                  </td>

                </tr>

            }

          </tbody>

        </table>
                {/* ==========================================
            PAGINATION
        ========================================== */}

        <div className="flex justify-between items-center p-4 border-t">

          <span>
            Page {page} of {totalPages === 0 ? 1 : totalPages}
          </span>

          <div className="flex gap-3">

            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            <button
              disabled={
                page === totalPages ||
                totalPages === 0
              }
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>

          </div>

        </div>

      </div>

    </>

  );

};

export default ReorderAlert;