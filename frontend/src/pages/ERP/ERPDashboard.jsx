import React, {
  useEffect,
  useState,
  useMemo
} from "react";

import { getERPSummary } from "../../api/erpDashboardApi";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

import {
  Line,
  Doughnut,
  Pie
} from "react-chartjs-2";

import {
  LuLayoutDashboard,
  LuPackage,
  LuWarehouse,
  LuUsers,
  LuShoppingCart,
  LuTriangleAlert,
  LuActivity,
  LuClock
} from "react-icons/lu";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

const ERPDashboard = () => {

  const [summary, setSummary] = useState({});
  const [timeFilter, setTimeFilter] = useState("month");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {

    try {

      const response =
        await getERPSummary();

     console.log(
  "ERP Dashboard Response:",
  JSON.stringify(response, null, 2)
);

console.log(
  "ERP Dashboard Data:",
  JSON.stringify(response.data, null, 2)
);

      setSummary(response.data);

    } catch (error) {

      console.log(error);

    }

  };

  const cards = [
    {
      title: "Materials",
      value: summary.totalMaterials,
      icon: LuPackage,
      color: "bg-blue-500"
    },
    {
      title: "Vendors",
      value: summary.totalVendors,
      icon: LuUsers,
      color: "bg-green-500"
    },
    {
      title: "Warehouses",
      value: summary.totalWarehouses,
      icon: LuWarehouse,
      color: "bg-purple-500"
    },
    {
      title: "Purchase Orders",
      value: summary.totalPOs,
      icon: LuShoppingCart,
      color: "bg-orange-500"
    },
    {
      title: "Low Stock",
      value: summary.lowStockMaterials,
      icon: LuTriangleAlert,
      color: "bg-yellow-500"
    },
    {
      title: "Out Of Stock",
      value: summary.outOfStockMaterials,
      icon: LuTriangleAlert,
      color: "bg-red-500"
    }
  ];

  const inventoryTrendData = {
    labels:
      summary.inventoryTrend?.map(
        item => item.month
      ) || [],

    datasets: [
      {
        label: "Inventory Value",
        data:
          summary.inventoryTrend?.map(
            item => item.stock
          ) || [],

        borderColor: "#ff7e00",
        backgroundColor:
          "rgba(255,126,0,0.15)",

        fill: true,
        tension: 0.4
      }
    ]
  };

  const stockStatusData = {
    labels: [
      "Available",
      "Low Stock",
      "Out Of Stock"
    ],

    datasets: [
      {
        data: [
          (summary.totalMaterials || 0) -
            (summary.lowStockMaterials || 0) -
            (summary.outOfStockMaterials || 0),

          summary.lowStockMaterials || 0,

          summary.outOfStockMaterials || 0
        ],

        backgroundColor: [
          "#10b981",
          "#f59e0b",
          "#ef4444"
        ]
      }
    ]
  };

  const categoryData = {
    labels:
      summary.categoryDistribution?.map(
        item => item.name
      ) || [],

    datasets: [
      {
        data:
          summary.categoryDistribution?.map(
            item => item.value
          ) || [],

        backgroundColor: [
          "#ff7e00",
          "#3b82f6",
          "#10b981",
          "#ef4444",
          "#8b5cf6",
          "#f59e0b"
        ]
      }
    ]
  };

  return (
    <div className="w-full px-6 py-4 bg-gray-50 min-h-screen">

      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6">

        <div className="flex items-center gap-3">

          <LuLayoutDashboard
            className="text-orange-500 text-3xl"
          />

          <div>
            <h1 className="text-2xl font-bold">
              ERP Dashboard
            </h1>

            <p className="text-gray-500">
              Inventory & Procurement Analytics
            </p>
          </div>

        </div>

        <div className="flex bg-white rounded-lg shadow-sm p-1">

          {["Week", "Month", "Year"].map(filter => (

            <button
              key={filter}
              onClick={() =>
                setTimeFilter(filter)
              }
              className={`px-4 py-2 rounded-md text-sm ${
                timeFilter === filter
                  ? "bg-orange-500 text-white"
                  : "text-gray-600"
              }`}
            >
              {filter}
            </button>

          ))}

        </div>

      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">

        {cards.map((card, index) => (

          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-5"
          >

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500 text-sm">
                  {card.title}
                </p>

                <h2 className="text-2xl font-bold text-gray-800 mt-2">
                  {card.value || 0}
                </h2>

              </div>

              <div
                className={`${card.color} p-3 rounded-lg`}
              >
                <card.icon className="text-white text-xl" />
              </div>

            </div>

          </div>

        ))}

      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        <div className="bg-white rounded-xl shadow-sm p-6">

          <h2 className="font-semibold text-lg mb-4">
            Inventory Trend
          </h2>

          <div className="h-[320px]">

            <Line
              data={inventoryTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />

          </div>

        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">

          <h2 className="font-semibold text-lg mb-4">
            Stock Status
          </h2>

          <div className="h-[320px]">

            <Doughnut
              data={stockStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "65%"
              }}
            />

          </div>

        </div>

      </div>

      {/* Bottom Section */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Categories */}

        <div className="bg-white rounded-xl shadow-sm p-6">

          <h2 className="font-semibold text-lg mb-4">
            Material Categories
          </h2>

          <div className="h-[260px]">

            <Pie
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />

          </div>

        </div>

        {/* Recent Activities */}

        <div className="bg-white rounded-xl shadow-sm p-6">

          <h2 className="font-semibold text-lg mb-4">
            Recent Procurement Activity
          </h2>

          <div className="space-y-3">

            {summary.recentActivities?.map(
              (item, index) => (

                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg"
                >

                  <p className="font-medium text-sm">
                    {item.type}
                  </p>

                  <p className="text-xs text-gray-600">
                    {item.description}
                  </p>

                </div>

              )
            )}

          </div>

        </div>

        {/* Low Stock */}

        <div className="bg-white rounded-xl shadow-sm p-6">

          <h2 className="font-semibold text-lg mb-4">
            Low Stock Materials
          </h2>

          <div className="space-y-3">

            {summary.lowStockItems?.map(
              (item, index) => (

                <div
                  key={index}
                  className="bg-red-50 p-3 rounded-lg"
                >

                  <p className="font-medium">
                    {item.materialName}
                  </p>

                  <p className="text-sm text-gray-600">

                    Stock:
                    {" "}
                    {item.currentStock}

                    {" / "}

                    Reorder:
                    {" "}
                    {item.reorderLevel}

                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ERPDashboard;