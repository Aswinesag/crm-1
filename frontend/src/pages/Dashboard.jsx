import React, { useState, useEffect, useMemo } from "react";
import { selectUsersWithStatus } from "../redux/userSlice.jsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut, Pie } from "react-chartjs-2";
import {
  LuUsers,
  LuLayoutDashboard,
  LuTrendingUp,
  LuTrendingDown,
  LuCalendarCheck,
  LuUserCheck,
  LuTarget,
  LuDollarSign,
  LuClock,
  LuActivity,
} from "react-icons/lu";
import { HiTrendingUp } from "react-icons/hi";
import { BiSolidPieChartAlt } from "react-icons/bi";
import { useSelector } from "react-redux";
import TicketCount from "../components/TicketCount";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const Dashboard = () => {
  const usersWithStatus = useSelector(selectUsersWithStatus);
  const users = usersWithStatus;
  const leads = useSelector((state) => state.leads.leads);
  const reminders = useSelector((state) => state.remainders.remainders);
  const logs = useSelector((state) => state.logs.logs);
  const currentUser = useSelector((state) => state.users.currentUser);
  const isAdmin = currentUser?.role === "Admin" || currentUser?.role === "Super Admin";

  const [timeFilter, setTimeFilter] = useState("month"); // week, month, year
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerWidth,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamic font sizes
  const getFontSize = () => {
    if (windowSize.width < 480) return 10;
    if (windowSize.width < 768) return 12;
    return 14;
  };

  // Date filtering functions
  const getDateRange = (filter) => {
    const now = new Date();
    const start = new Date();

    switch (filter) {
      case "week":
        start.setDate(now.getDate() - 7);
        break;
      case "month":
        start.setMonth(now.getMonth() - 1);
        break;
      case "year":
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setMonth(now.getMonth() - 1);
    }
    return { start, end: now };
  };

  const filterDataByDate = (data, dateField = "createdAt") => {
    const { start, end } = getDateRange(timeFilter);
    return data.filter((item) => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= start && itemDate <= end;
    });
  };

  // Processed data
  const processedData = useMemo(() => {
    const filteredLeads = filterDataByDate(leads);
    const filteredLogs = filterDataByDate(logs);
    const filteredReminders = filterDataByDate(reminders, "date");

    // Lead statistics
    const leadStats = {
      total: leads.length,
      active: leads.filter(
        (l) => !["Converted", "Lost", "deleted"].includes(l.status),
      ).length,
      converted: leads.filter((l) => l.status === "Converted").length,
      failed: leads.filter((l) => l.status === "Lost").length,
      inProgress: leads.filter((l) => l.status === "Work In Progress").length,
      opportunities: leads.filter((l) =>
        [
          "Opportunity",
          "Enquiry",
          "Quotation",
          "Quotation Sent",
          "Follow-up",
        ].includes(l.status),
      ).length,
    };

    // Lead sources
    const leadSources = leads.reduce((acc, lead) => {
      const source = lead.source || "Other";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    // User statistics
    const userStats = {
      total: users.length,
      online: users.filter((u) => u.isOnline).length,
      engineers: users.filter((u) => u.role === "Engineer").length,
      admins: users.filter((u) => ["Admin", "Super Admin"].includes(u.role))
        .length,
    };

    // Time series data
    const getTimeLabels = () => {
      const labels = [];
      const { start, end } = getDateRange(timeFilter);
      const current = new Date(start);

      while (current <= end) {
        if (timeFilter === "week") {
          labels.push(
            current.toLocaleDateString("en-US", { weekday: "short" }),
          );
          current.setDate(current.getDate() + 1);
        } else if (timeFilter === "month") {
          labels.push(current.toLocaleDateString("en-US", { day: "2-digit" }));
          current.setDate(current.getDate() + 1);
        } else {
          labels.push(current.toLocaleDateString("en-US", { month: "short" }));
          current.setMonth(current.getMonth() + 1);
        }

        if (labels.length > 30) break; // Prevent too many labels
      }
      return labels;
    };

    const timeLabels = getTimeLabels();
    const leadsTrend = timeLabels.map(() => 0);
    const conversionTrend = timeLabels.map(() => 0);

    filteredLeads.forEach((lead) => {
      const leadDate = new Date(lead.createdAt);
      const index = timeLabels.findIndex((_, i) => {
        const { start } = getDateRange(timeFilter);
        const labelDate = new Date(start);
        if (timeFilter === "week") {
          labelDate.setDate(labelDate.getDate() + i);
        } else if (timeFilter === "month") {
          labelDate.setDate(labelDate.getDate() + i);
        } else {
          labelDate.setMonth(labelDate.getMonth() + i);
        }
        return leadDate.toDateString() === labelDate.toDateString();
      });

      if (index !== -1) {
        leadsTrend[index]++;
        if (lead.status === "Converted") {
          conversionTrend[index]++;
        }
      }
    });

    return {
      leadStats,
      leadSources,
      userStats,
      timeLabels,
      leadsTrend,
      conversionTrend,
      filteredReminders,
      filteredLogs,
    };
  }, [leads, users, reminders, logs, timeFilter]);

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { size: getFontSize() },
          padding: 15,
          boxWidth: 12,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: getFontSize() } },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        ticks: { font: { size: getFontSize() } },
        grid: { display: false },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { size: getFontSize() },
          padding: 15,
          boxWidth: 12,
        },
      },
    },
  };

  // Chart data
  const leadTrendData = {
    labels: processedData.timeLabels,
    datasets: [
      {
        label: "New Leads",
        data: processedData.leadsTrend,
        borderColor: "#ff7e00",
        backgroundColor: "rgba(255, 126, 0, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Conversions",
        data: processedData.conversionTrend,
        borderColor: "#059669",
        backgroundColor: "rgba(5, 150, 105, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const leadStatusData = {
    labels: ["In Progress", "Opportunities", "Converted", "Lost Orders"],
    datasets: [
      {
        data: [
          processedData.leadStats.inProgress,
          processedData.leadStats.opportunities,
          processedData.leadStats.converted,
          processedData.leadStats.failed,
        ],
        backgroundColor: ["#ff7e00", "#3b82f6", "#059669", "#dc2626"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const leadSourceData = {
    labels: Object.keys(processedData.leadSources),
    datasets: [
      {
        data: Object.values(processedData.leadSources),
        backgroundColor: [
          "#ff7e00",
          "#ffb347",
          "#ffd700",
          "#ffcba4",
          "#e3e3e3",
          "#d1d5db",
          "#9ca3af",
          "#6b7280",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  // Metric cards data
  const metricCards = [
    {
      title: "Total Leads",
      value: processedData.leadStats.total,
      change: "+12%",
      icon: LuTarget,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      title: "Active Leads",
      value: processedData.leadStats.active,
      change: "+5%",
      icon: LuActivity,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Converted",
      value: processedData.leadStats.converted,
      change: "+8%",
      icon: LuTrendingUp,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Lost Orders",
      value: processedData.leadStats.failed,
      change: "5%",
      icon: LuTrendingDown,
      color: "bg-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Team Members",
      value: processedData.userStats.online,
      change: `${processedData.userStats.total} total`,
      icon: LuUserCheck,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
        // 👇 ADD THIS
   {
    title: "My Tickets",
    value: <TicketCount />, // 👈 important
    change: "Total raised",
    icon: LuActivity,
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50",
  },
  ];

  return (
    <div className="w-full px-4 md:px-6 py-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <LuLayoutDashboard className="text-orange-500 text-2xl" />
          <h1 className="text-gray-900 font-semibold text-xl md:text-2xl">
            CRM Analytics Dashboard
          </h1>
        </div>

        {/* Time Filter */}
        <div className="flex bg-white rounded-lg shadow-sm p-1">
          {["week", "month", "year"].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeFilter === filter
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>
          
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {metricCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{card.title}</p>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {card.value}
              </div>
                <p className="text-xs text-gray-500 mt-1">{card.change}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon
                  className={`text-xl ${card.color.replace("bg-", "text-")}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Lead Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <HiTrendingUp className="text-orange-500 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Lead Trends</h2>
              <p className="text-sm text-gray-600">New leads vs conversions</p>
            </div>
          </div>
          <div className="h-[300px]">
            <Line
              data={leadTrendData}
              options={chartOptions}
              key={`trend-${timeFilter}-${windowSize.width}`}
            />
          </div>
        </div>

        {/* Lead Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <BiSolidPieChartAlt className="text-orange-500 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Lead Pipeline</h2>
              <p className="text-sm text-gray-600">Distribution by status</p>
            </div>
          </div>
          <div className="h-[300px]">
            <Doughnut
              data={leadStatusData}
              options={{ ...pieOptions, cutout: "60%" }}
              key={`status-${windowSize.width}`}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Sources */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <LuTarget className="text-orange-500 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Lead Sources</h2>
              <p className="text-sm text-gray-600">Where leads come from</p>
            </div>
          </div>
          <div className="h-[250px]">
            <Pie
              data={leadSourceData}
              options={pieOptions}
              key={`sources-${windowSize.width}`}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <LuActivity className="text-orange-500 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <p className="text-sm text-gray-600">Latest team actions</p>
            </div>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {processedData.filteredLogs.slice(0, 8).map((log, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {log.type || "Activity"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {log.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {log.user} • {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <LuCalendarCheck className="text-orange-500 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
              <p className="text-sm text-gray-600">Scheduled reminders</p>
            </div>
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {processedData.filteredReminders
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 6)
              .map((reminder, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <LuClock className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {reminder.title}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {reminder.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(reminder.date).toLocaleDateString()} •{" "}
                      {reminder.createby}
                    </p>
                  </div>
                </div>
              ))}
            {processedData.filteredReminders.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No upcoming reminders
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Team Performance Summary */}
      {isAdmin && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-100 p-2 rounded-lg">
              <LuUsers className="text-orange-500 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Team Performance</h2>
              <p className="text-sm text-gray-600">
                Engineer task distribution
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {usersWithStatus
              .filter((user) => user.role === "Engineer")
              .slice(0, 8)
              .map((engineer, index) => {
                const assignedLeads = leads.filter(
                  (lead) => lead.engineer_id === engineer._id,
                ).length;
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {engineer.name}
                      </h3>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          engineer.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Assigned Leads:</span>
                        <span className="font-medium">{assignedLeads}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
