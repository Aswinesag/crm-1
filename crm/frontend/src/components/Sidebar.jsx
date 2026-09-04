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
import { MdManageHistory, MdManageAccounts } from "react-icons/md";
import { RiTruckLine } from "react-icons/ri";
import { IoChevronBack, IoChevronForward, IoChevronDown} from "react-icons/io5";
import { FaBoxes } from "react-icons/fa";
import { FaBoxOpen } from "react-icons/fa";
import {
  FaPlus,
  FaCog,
  FaFolder,
  FaFolderOpen,
  FaTags,
  FaBalanceScale,
  FaLayerGroup,
  FaListAlt,
  FaBarcode,
  FaPercentage,
  FaImage,
  FaFileImport,
  FaFileExport,
} from "react-icons/fa";
import { GiMetalBar } from "react-icons/gi";
import { TbSettingsCog } from "react-icons/tb";
import { MdInventory2,MdOutlineInventory} from "react-icons/md";
import { MdInventory } from "react-icons/md";
import { TbArrowsTransferUp } from "react-icons/tb";
import { ClipboardList } from "lucide-react";
import {
  MdOutlinePayments,
  MdAssignment,
  MdShoppingCartCheckout,
} from "react-icons/md";

import {
  FaTruckLoading,
  FaFileInvoiceDollar,
  FaUndoAlt,
  FaUsers,
  FaShoppingCart,
} from "react-icons/fa";

import {
  HiOutlineDocumentText,
} from "react-icons/hi";

import {
  BsReceipt,
} from "react-icons/bs";

import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import "../css/scrollbar.css";

const Sidebar = ({
  menuOpen,
  setMenuOpen,
  sidebarExpanded,
  setSidebarExpanded,
}) => {
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (key) => {
  setOpenMenus((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
};

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
         /* {
  title: "Product Master",
  label: "Product Master",
  icon: <FaBoxes />,
  children: [
    {
      label: "All Products",
      icon: <FaBoxes />,
      path: "/products",
    },

    {
      label: "Create New Product",
      icon: <FaPlus />,
      path: "/products/create",
    },

    {
      title: "Product Settings",
      label: "Product Settings",
      icon: <FaCog />,
      children: [
        {
          label: "Categories",
          icon: <FaFolder />,
          path: "/categories",
        },
        {
          label: "Sub Categories",
          icon: <FaFolderOpen />,
          path: "/sub-categories",
        },
        {
          label: "Brands",
          icon: <FaTags />,
          path: "/brands",
        },
         {
        label: "Units",
        icon: <FaBalanceScale />,
        path: "/product-settings/units",
      },
      {
        label: "HSN Codes",
        icon: <FaBarcode />,
        path: "/hsn-codes"
      },
       {
        label: "Warehouse",
        icon: <FaBoxOpen />,
        path: "/warehouse"
      },
      ],
    },
  ],
},*/

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
  title: "Product Master",
  label: "Product Master",
  icon: <FaBoxes />,
  children: [
    {
      label: "All Products",
      icon: <FaBoxes />,
      path: "/products",
    },

     {
      title: "Product Settings",
      label: "Product Settings",
      icon: <FaCog />,
      children: [
        {
          label: "Categories",
          icon: <FaFolder />,
          path: "/categories",
        },
        {
          label: "Sub Categories",
          icon: <FaFolderOpen />,
          path: "/sub-categories",
        },
        {
          label: "Brands",
          icon: <FaTags />,
          path: "/brands",
        },
         {
        label: "Units",
        icon: <FaBalanceScale />,
        path: "/product-settings/units",
      },
      {
        label: "HSN Codes",
        icon: <FaBarcode />,
        path: "/hsn-codes"
      },
       {
        label: "Warehouse",
        icon: <FaBoxOpen />,
        path: "/warehouse"
      },
      ],
    },
  ],
},
 {
      title: "Inventory",
      icon: <MdInventory />,
      label: "Inventory",
      children: [
         {
            label: "Raw Materials",
            icon: <GiMetalBar />, 
            path: "/inventory/raw-materials",
          },
          
          {
            label: "Components",
            icon: <TbSettingsCog />,
            path: "/inventory/components",
          },

           {
            label: "StockIn",
            icon: <MdInventory2 />,
            path: "/inventory/stock-in",
          }, 
          
          {
            label:"StockOut",
            icon:<MdOutlineInventory />,
            path:"/inventory/stock-out",
          },

          {
              label: "Stock Transfer",
              icon: <TbArrowsTransferUp />,
              path: "/inventory/stock-transfer",
          },

          {
            label: "Stock Audit",
            icon: <FaLayerGroup />,
            path: "/inventory/stock-audit",
          },

          {
            label: "Reorder Alert",
            icon: <FaListAlt />,  
            path: "/inventory/reorder-alert",
          },       
      ],
    },

    {
  title: "Purchase",
  icon: <FaShoppingCart />,
  label: "Purchase",

  children: [

    {
      label: "Suppliers",
      path: "/purchase/suppliers",
      icon: <FaUsers />,
    },

    {
      label: "Purchase Requisition",
      path: "/purchase/purchase-requisition",
      icon: <MdAssignment />,
    },

    {
      label: "Request For Quotation",
      path: "/purchase/request-for-quotation",
      icon: <HiOutlineDocumentText />,
    },

    {
      label: "Purchase Orders",
      path: "/purchase/purchase-orders",
      icon: <MdShoppingCartCheckout />,
    },

    {
      label: "Goods Receipt Notes",
      path: "/purchase/goods-receipt-notes",
      icon: <FaTruckLoading />,
    },

    {
      label: "Purchase Bills",
      path: "/purchase/purchase-bills",
      icon: <FaFileInvoiceDollar />,
    },

    {
      label: "Purchase Returns",
      path: "/purchase/purchase-returns",
      icon: <FaUndoAlt />,
    },

    {
      label: "Supplier Payments",
      path: "/purchase/supplier-payments",
      icon: <MdOutlinePayments />,
    },

  ],
},

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

 const MenuItem = ({ item, level = 0 }) => {

  const isOpen = openMenus[item.label];

  const isActive =
    item.path &&
    location.pathname === item.path;

  // Normal menu item
  if (!item.children) {
    return (
      <Link
        to={item.path}
        key={item.label}
      >
        <div
          className={`
            flex items-center gap-3
            px-3 py-2
            rounded-lg
            cursor-pointer
            transition-all
            ${
              isActive
                ? "bg-orange-100 text-orange-600"
                : "text-gray-600 hover:bg-gray-100"
            }
          `}
          style={{
            paddingLeft: `${12 + level * 20}px`,
          }}
        >
          {item.icon && (
            <span className="text-lg">
              {item.icon}
            </span>
          )}

          {sidebarExpanded && (
            <span>{item.label}</span>
          )}
        </div>
      </Link>
    );
  }

  // Dropdown
  return (
    <div key={item.label}>

      <div
        onClick={() =>
          toggleMenu(item.label)
        }
        className="
          flex items-center justify-between
          px-3 py-2
          rounded-lg
          cursor-pointer
          hover:bg-gray-100
          transition-all
        "
        style={{
          paddingLeft: `${12 + level * 20}px`,
        }}
      >

        <div className="flex items-center gap-3">

          {item.icon && (
            <span className="text-lg">
              {item.icon}
            </span>
          )}

          {sidebarExpanded && (
            <span>{item.label}</span>
          )}

        </div>

        {sidebarExpanded &&
          (isOpen
            ? <IoChevronDown />
            : <IoChevronForward />
          )}

      </div>

      {isOpen &&
        sidebarExpanded && (

          <div>

            {item.children.map((child) => (

              <MenuItem
                key={child.label}
                item={child}
                level={level + 1}
              />

            ))}

          </div>

        )}

    </div>
  );

};

const renderMenu = (items) => {
  return items.map((item) => (
    <MenuItem
      key={item.label}
      item={item}
    />
  ));
};

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
            <img
              src="https://smie-crm.vercel.app/assets/logo-Ck8_dChu.png"
              alt="logo"
              className="h-15 object-contain"
            />
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