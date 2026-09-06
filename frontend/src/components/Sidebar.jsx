import React, { useEffect, useState } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { BsCheck2Square } from "react-icons/bs";
import { TbReportAnalytics } from "react-icons/tb";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FiUserPlus, FiUsers } from "react-icons/fi";
import { CiTrash } from "react-icons/ci";
import { RiFileUserLine } from "react-icons/ri";
import { MdOutlinePayment } from "react-icons/md";
import { SlQuestion } from "react-icons/sl";
import { RiUserFollowLine } from "react-icons/ri";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import { MdManageHistory, MdManageAccounts } from "react-icons/md";
import { RiTruckLine, RiBuildingLine, RiSettings3Line } from "react-icons/ri";
import { IoChevronBack, IoChevronForward, IoChevronDown} from "react-icons/io5";
import { FiFileText, FiCreditCard, FiRefreshCw } from "react-icons/fi";

import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import "../css/scrollbar.css";
import logo2 from "../assets/2.png";
import logo3 from "../assets/3.png";

const Sidebar = ({
  menuOpen,
  setMenuOpen,
  sidebarExpanded,
  setSidebarExpanded,
}) => {
  const location = useLocation();

  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const me = useSelector((state) => state.users.currentUser);

  const menuItems =
    me?.role === "Super Admin"
      ? [
          { label: "Dashboard", icon: <LuLayoutDashboard />, path: "/" },
          /**{
            label: "ERP Dashboard",
            icon: <FaShoppingCart />,
            path: "/erp-dashboard",
          }, */
          { label: "Leads", icon: <RiFileUserLine />, path: "/leads" },
          {
            label: "Opportunities",
            icon: <HiArrowTrendingUp />,
            path: "/opportunities",
          },
          { label: "Enquiry", icon: <SlQuestion />, path: "/enquiry" },
          {
            label: "Quotation",
            icon: <MdOutlinePayment />,
            path: "/quotation",
          },
          {
            label: "Follow Up",
            icon: <RiUserFollowLine />,
            path: "/followup",
          },
          {
            label: "Converted",
            icon: <BsCheck2Square />,
            path: "/converted",
          },
          { label: "Delivery", icon: <RiTruckLine />, path: "/delivery" },
          {
            label: "Account",
            icon: <MdManageAccounts />,
            path: "/account",
          },
          {
            label: "Billing & Finance",
            icon: <FiCreditCard />,
            children: [
              {
                label: "Invoice Management",
                path: "/invoice-management",
              },
              {
                label: "Credit Notes",
                path: "/credit-notes",
              },
              {
                label: "Debit Notes",
                path: "/debit-notes",
              },
              {
                label: "Customer Payments",
                path: "/customer-payments",
              },
              { label: "Subscriptions", path: "/subscriptions" },
              {
                label: "Supplier Payments",
                path: "/supplier-payments",
              },
              {
                label: "Purchase Bills",
                path: "/procurement/purchase-bills",
              },
              {
                label: "Expenses",
                path: "/expenses",
              },
              {
                label: "Customer Ledger",
                path: "/customer-ledger",
              },
              {
                label: "Supplier Ledger",
                path: "/supplier-ledger",
              },
              {
                label: "Cash & Bank Management",
                path: "/cash-bank-management",
              },
              {
                label: "GST Management",
                path: "/gst-management",
              },
            ],
          },
          {
            label: "Delivery & Dispatch",
            icon: <RiTruckLine />,
            children: [
              {
                label: "Dispatch Orders",
                path: "/dispatch-orders",
              },
              {
                label: "Packing List",
                path: "/packing-list",
              },
              {
                label: "Vehicle Allocation",
                path: "/vehicle-allocation",
              },
              {
                label: "Shipment Tracking",
                path: "/shipment-tracking",
              },
              {
                label: "Delivery Challan",
                path: "/delivery-challan",
              },
              {
                label: "Delivery Confirmation",
                path: "/delivery-confirmation",
              },
              {
                label: "Transporters Master",
                path: "/transporters-master",
              },
              {
                label: "Returns",
                path: "/returns",
              },
            ],
          },
          {
            label: "Manufacturing",
            icon: <RiBuildingLine />,
            children: [
              {
                label: "BOM",
                path: "/bom",
              },
              {
                label: "Production Planning",
                path: "/production-planning",
              },
              {
                label: "Production Orders",
                path: "/production-orders",
              },
              {
                label: "Material Issue",
                path: "/material-issue",
              },
              {
                label: "Work Orders",
                path: "/work-orders",
              },
              {
                label: "Assembly Process",
                path: "/assembly-process",
              },
              {
                label: "Quality Control",
                path: "/quality-control",
              },
              {
                label: "Finished Goods Entry",
                path: "/finished-goods-entry",
              },
              {
                label: "Production Costing",
                path: "/production-costing",
              },
            ],
          },
          {
            label: "Product Settings",
            icon: <RiSettings3Line />,
            children: [
              { label: "Categories", path: "/product-settings/categories" },
              { label: "Subcategories", path: "/product-settings/subcategories" },
              { label: "Brands", path: "/product-settings/brands" },
              { label: "Units", path: "/product-settings/units" },
              { label: "HSN Codes", path: "/product-settings/hsn-codes" },
              { label: "Warehouses", path: "/product-settings/warehouses" },
            ],
          },
          {
            label: "Product Master",
            icon: <FaShoppingCart />,
            children: [
              { label: "Products", path: "/product-master/products" },
              { label: "Raw Materials", path: "/product-master/raw-materials" },
              { label: "Components", path: "/product-master/components" },
            ],
          },
          { label: "Inventory", icon: <RiBuildingLine />, children: [
            { label: "Stock Overview", path: "/inventory/overview" }, { label: "Stock In", path: "/inventory/stock-in" }, { label: "Stock Out", path: "/inventory/stock-out" }, { label: "Stock Transfer", path: "/inventory/transfer" }, { label: "Stock Audit", path: "/inventory/audit" }, { label: "Transactions", path: "/inventory/transactions" }, { label: "Reorder Alerts", path: "/inventory/reorder-alerts" },
          ] },
          { label: "Report", icon: <TbReportAnalytics />, path: "/report" },
          {
            label: "Lead History",
            icon: <MdManageHistory />,
            path: "/leadsHistory",
          },
        /**   {
  label: "Procurement",
  icon: <FaShoppingCart />,
  children: [
    {
      label: "Purchase Request",
      path: "/purchase-request",
    },
    {
      label: "Purchase Requisition",
      path: "/purchase-requisitions",
    },
    {
      label: "RFQ List",
      path: "/rfqs",
    },
    {
      label: "Create RFQ",
      path: "/procurement/rfq/create",
    },
    {
      label: "Purchase Orders",
      path: "/procurement/purchase-orders",
    },
    {
      label: "GRN List",
      path: "/procurement/grns",
    },
    {
      label: "Create GRN",
      path: "/procurement/grns/create",
    },
  ],
}, */
        ]
      : me?.role === "Coordinator"
      ? [
          {
            label: "Dashboard",
            icon: <LuLayoutDashboard />,
            path: "/",
          },
          {
            label: "Leads",
            icon: <RiFileUserLine />,
            path: "/leads",
          },
        ]
      : me?.role === "Engineer"
      ? [
          {
            label: "Dashboard",
            icon: <LuLayoutDashboard />,
            path: "/",
          },
          {
            label: "Opportunities",
            icon: <HiArrowTrendingUp />,
            path: "/opportunities",
          },
          {
            label: "Enquiry",
            icon: <SlQuestion />,
            path: "/enquiry",
          },
          {
            label: "Quotation",
            icon: <MdOutlinePayment />,
            path: "/quotation",
          },
          {
            label: "Follow Up",
            icon: <RiUserFollowLine />,
            path: "/followup",
          },
          {
            label: "Converted",
            icon: <BsCheck2Square />,
            path: "/converted",
          },
        ]
      : me?.role === "Admin"
      ? [
          {
            label: "Dashboard",
            icon: <LuLayoutDashboard />,
            path: "/",
          },
          {
            label: "ERP Dashboard",
            icon: <FaShoppingCart />,
            path: "/erp-dashboard",
          },
          {
            label: "Leads",
            icon: <RiFileUserLine />,
            path: "/leads",
          },
          {
            label: "Opportunities",
            icon: <HiArrowTrendingUp />,
            path: "/opportunities",
          },
          {
            label: "Enquiry",
            icon: <SlQuestion />,
            path: "/enquiry",
          },
          {
            label: "Quotation",
            icon: <MdOutlinePayment />,
            path: "/quotation",
          },
          {
            label: "Follow Up",
            icon: <RiUserFollowLine />,
            path: "/followup",
          },
          {
            label: "Converted",
            icon: <BsCheck2Square />,
            path: "/converted",
          },
          {
            label: "Account",
            icon: <MdManageAccounts />,
            path: "/account",
          },
          {
            label: "Billing & Finance",
            icon: <FiCreditCard />,
            children: [
              {
                label: "Invoice Management",
                path: "/invoice-management",
              },
              {
                label: "Credit Notes",
                path: "/credit-notes",
              },
              {
                label: "Debit Notes",
                path: "/debit-notes",
              },
              {
                label: "Customer Payments",
                path: "/customer-payments",
              },
              { label: "Subscriptions", path: "/subscriptions" },
              {
                label: "Supplier Payments",
                path: "/supplier-payments",
              },
              {
                label: "Purchase Bills",
                path: "/procurement/purchase-bills",
              },
              {
                label: "Expenses",
                path: "/expenses",
              },
              {
                label: "Customer Ledger",
                path: "/customer-ledger",
              },
              {
                label: "Supplier Ledger",
                path: "/supplier-ledger",
              },
              {
                label: "Cash & Bank Management",
                path: "/cash-bank-management",
              },
              {
                label: "GST Management",
                path: "/gst-management",
              },
            ],
          },
          {
            label: "Delivery & Dispatch",
            icon: <RiTruckLine />,
            children: [
              {
                label: "Dispatch Orders",
                path: "/dispatch-orders",
              },
              {
                label: "Packing List",
                path: "/packing-list",
              },
              {
                label: "Vehicle Allocation",
                path: "/vehicle-allocation",
              },
              {
                label: "Shipment Tracking",
                path: "/shipment-tracking",
              },
              {
                label: "Delivery Challan",
                path: "/delivery-challan",
              },
              {
                label: "Delivery Confirmation",
                path: "/delivery-confirmation",
              },
              {
                label: "Transporters Master",
                path: "/transporters-master",
              },
              {
                label: "Returns",
                path: "/returns",
              },
            ],
          },
          {
            label: "Manufacturing",
            icon: <RiBuildingLine />,
            children: [
              {
                label: "BOM",
                path: "/bom",
              },
              {
                label: "Production Planning",
                path: "/production-planning",
              },
              {
                label: "Production Orders",
                path: "/production-orders",
              },
              {
                label: "Material Issue",
                path: "/material-issue",
              },
              {
                label: "Work Orders",
                path: "/work-orders",
              },
              {
                label: "Assembly Process",
                path: "/assembly-process",
              },
              {
                label: "Quality Control",
                path: "/quality-control",
              },
              {
                label: "Finished Goods Entry",
                path: "/finished-goods-entry",
              },
              {
                label: "Production Costing",
                path: "/production-costing",
              },
            ],
          },
          {
            label: "Product Settings",
            icon: <RiSettings3Line />,
            children: [
              { label: "Categories", path: "/product-settings/categories" },
              { label: "Subcategories", path: "/product-settings/subcategories" },
              { label: "Brands", path: "/product-settings/brands" },
              { label: "Units", path: "/product-settings/units" },
              { label: "HSN Codes", path: "/product-settings/hsn-codes" },
              { label: "Warehouses", path: "/product-settings/warehouses" },
            ],
          },
          {
            label: "Product Master",
            icon: <FaShoppingCart />,
            children: [
              { label: "Products", path: "/product-master/products" },
              { label: "Raw Materials", path: "/product-master/raw-materials" },
              { label: "Components", path: "/product-master/components" },
            ],
          },
          { label: "Inventory", icon: <RiBuildingLine />, children: [
            { label: "Stock Overview", path: "/inventory/overview" }, { label: "Stock In", path: "/inventory/stock-in" }, { label: "Stock Out", path: "/inventory/stock-out" }, { label: "Stock Transfer", path: "/inventory/transfer" }, { label: "Stock Audit", path: "/inventory/audit" }, { label: "Transactions", path: "/inventory/transactions" }, { label: "Reorder Alerts", path: "/inventory/reorder-alerts" },
          ] },
          {
            label: "Report",
            icon: <TbReportAnalytics />,
            path: "/report",
          },
          {
            label: "Lead History",
            icon: <MdManageHistory />,
            path: "/leadsHistory",
          },
        ]
      : [];

  const activityItems =
    me?.role === "Super Admin" || me?.role === "Admin"
      ? [
          {
            label: "Calendar",
            icon: <FaRegCalendarAlt />,
            path: "/calendar",
          },
          {
            label: "Activity Logs",
            icon: <FaArrowTrendUp />,
            path: "/activityLogs",
          },
          {
            label: "Create User",
            icon: <FiUserPlus />,
            path: "/createUser",
          },
          {
            label: "Users",
            icon: <FiUsers />,
            path: "/users",
          },
          {
            label: "Trash",
            icon: <CiTrash />,
            path: "/trash",
          },
        ]
      : [
          {
            label: "Calendar",
            icon: <FaRegCalendarAlt />,
            path: "/calendar",
          },
        ];

 const renderMenu = (items) =>
  items.map((item) => {

    // Dropdown Menu
    if (item.children) {
      return (
        <div key={item.label} className="mb-1">

          <div
            onClick={() =>
              setOpenDropdown(
                openDropdown === item.label
                  ? null
                  : item.label
              )
            }
            className="
              flex items-center justify-between
              px-3 py-3
              rounded-lg
              cursor-pointer
              text-gray-600
              hover:bg-gray-100
              transition-all
            "
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {item.icon}
              </span>

              {sidebarExpanded && (
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              )}
            </div>

            {sidebarExpanded &&
              (openDropdown === item.label ? (
                <IoChevronDown />
              ) : (
                <IoChevronForward />
              ))}
          </div>

          {openDropdown === item.label &&
            sidebarExpanded && (
              <div className="ml-10 mt-1 space-y-1">

                {item.children.map((child) => {

                  const isActive =
                    location.pathname === child.path;

                  return (
                    <Link
                      key={child.label}
                      to={child.path}
                    >
                      <div
                        className={`
                          px-3 py-2 rounded-md text-sm
                          transition-all
                          ${
                            isActive
                              ? "bg-orange-100 text-orange-600"
                              : "text-gray-600 hover:bg-gray-100"
                          }
                        `}
                      >
                        {child.label}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
        </div>
      );
    }

    // Normal Menu Item
    const isActive =
      location.pathname === item.path;

    return (
      <Link
        key={item.label}
        to={item.path}
      >
        <div
          className={`
            flex items-center gap-3
            px-3 py-3 rounded-lg
            transition-all duration-200
            cursor-pointer mb-1
            ${
              isActive
                ? "bg-orange-100 text-orange-600"
                : "text-gray-600 hover:bg-gray-100"
            }
          `}
        >
          <span className="text-lg">
            {item.icon}
          </span>

          {sidebarExpanded && (
            <span className="whitespace-nowrap text-sm font-medium">
              {item.label}
            </span>
          )}
        </div>
      </Link>
    );
  });

  return (
    <aside
      className={`
        fixed md:relative
        top-0 left-0 h-screen
        bg-white border-r shadow-md
        z-50
        transition-all duration-300
        ${sidebarExpanded ? "w-64" : "w-20"}
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="h-16 border-b flex items-center justify-between px-4">
          {sidebarExpanded && (
            <div className="flex items-center gap-2">
              <img
                src={logo2}
                alt="logo"
                className="h-14 object-contain"
              />
              <img
                src={logo3}
                alt="brand name"
                className="h-45 max-w-[500px] object-contain"
              />
            </div>
          )}

          <button
            onClick={() =>
              setSidebarExpanded(!sidebarExpanded)
            }
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {sidebarExpanded ? (
              <IoChevronBack />
            ) : (
              <IoChevronForward />
            )}
          </button>
        </div>

        {/* Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          <div className="p-3">
            {sidebarExpanded && (
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                Main Menu
              </p>
            )}

            {renderMenu(menuItems)}
          </div>

          <div className="p-3 border-t">
            {sidebarExpanded && (
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                Activities
              </p>
            )}

            {renderMenu(activityItems)}
          </div>

        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
