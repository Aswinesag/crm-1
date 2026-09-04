import React, { useState, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import Login from "./components/Login.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import Layout from "./components/Layout.jsx";

import Profile from "./pages/Profile.jsx";
import Users from "./pages/Users.jsx";
import CreateUser from "./pages/CreateUser.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Leads from "./pages/Leads.jsx";
import Opportunies from "./pages/Opportunities.jsx";
import Enquiry from "./pages/Enquiry.jsx";
import Quotation from "./pages/Quotation.jsx";
import Converted from "./pages/Converted.jsx";
import FollowUp from "./pages/FollowUp.jsx";
import Account from "./pages/Account.jsx";
import Report from "./pages/Report.jsx";
import Trash from "./pages/Trash.jsx";
import Calendar from "./pages/Calendar.jsx";
import FollowUpView from "./pages/FollowUpView.jsx";
import QuotationView from "./pages/QuotationView.jsx";
import ConvertedView from "./pages/ConvertedView.jsx";
import EnquiryView from "./pages/EnquiryView.jsx";
import ActivityLogs from "./pages/ActivityLogs.jsx";
import LeadsHistory from "./pages/LeadsHistory.jsx";
import LeadsView from "./pages/LeadsView.jsx";
import OpportunityView from "./pages/OpportunityView.jsx";
import CreateLead from "./pages/CreateLead.jsx";
import UserDetails from "./pages/UserDetails.jsx";
import HistoryDetails from "./pages/HistoryDetails.jsx";
import AddQuotation from "./pages/AddQuotation.jsx";
import AccountView from "./pages/AccountView.jsx";
import NotFound from "./pages/NotFound.jsx";
import Delivery from "./pages/Delivery.jsx"; // ✅ ADDED

import { postLogin } from "./redux/userSlice.jsx";
import axiosInstance from "./api/axiosInstance.jsx";
import { initSocket } from "./api/socketIO.jsx";
import { registerSocketListeners } from "./api/socketListeners.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import EditEmployee from "./pages/EditEmployee.jsx";
import DetailsExample from "./pages/DetailsExample.jsx";
import DeliveryView from "./pages/DeliveryView";
import Ticket from "./pages/Ticket.jsx";
import EditDelivery from "./pages/EditDelivery.jsx";
import ViewTickets from "./pages/ViewTickets";
import TicketDetails from "./pages/TicketDetails";
import LeadView from "./pages/LeadView";
import EditLead from "./pages/EditLead";
import PurchaseRequest from "./pages/PurchaseRequest";
import ERPDashboard from "./pages/ERP/ERPDashboard";
//import RFQList from "./pages/procurement/RFQList";
//import CreateRFQ from "./pages/procurement/CreateRFQ";
//import RFQDetails from "./pages/procurement/RFQDetails";
//import PurchaseOrderList from "./pages/procurement/PurchaseOrderList";
//import PurchaseOrderDetails from "./pages/procurement/PurchaseOrderDetails";
import GRNList from "./pages/procurement/GRNList";
import CreateGRN from "./pages/procurement/CreateGRN";
import GRNDetails from "./pages/procurement/GRNDetails";

import ProductsList from "./pages/products/ProductsList";
import CreateProduct from "./pages/products/CreateProduct";
import Categories from "./pages/product-settings/Categories";
import SubCategories from "./pages/product-settings/SubCategories";
import Brands from "./pages/product-settings/Brands";
import Units from "./pages/product-settings/Units";
import HsnCodes from "./pages/product-settings/HsnCodes";
import Warehouse from "./pages/product-settings/Warehouse.jsx";
import RawMaterials from "./pages/inventory/RawMaterials.jsx";
import Components from "./pages/inventory/Components";
import StockIn from "./pages/inventory/StockIn";
import StockOut from "./pages/inventory/StockOut";
import StockTransfer from "./pages/inventory/StockTransfer";
import StockAudit from "./pages/inventory/StockAudit";
import ReorderAlert from "./pages/inventory/ReorderAlert";

import Suppliers from "./pages/purchase/Supplier";
import PurchaseRequisition from "./pages/purchase/PurchaseRequisition";
import RequestForQuotation from "./pages/purchase/RequestForQuotation";
import PurchaseOrders from "./pages/purchase/PurchaseOrders";
import GoodsReceiptNote from "./pages/purchase/goodsReceiptNote";
import PurchaseBill from "./pages/purchase/PurchaseBill";
import PurchaseReturn from "./pages/purchase/PurchaseReturn";
import SupplierPayment from "./pages/purchase/SupplierPayment";

const App = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axiosInstance.get("/auth/me");
        dispatch(postLogin(data));
        const socket = initSocket(data?.data?._id, data?.data?.role);
        registerSocketListeners(socket, dispatch);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [dispatch]);

  const currentUser = useSelector((state) => state.users.currentUser);

  if (loading) {
    return (
      <div className="bg-gray-50 flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={currentUser ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />

          <Route path="/employee/edit" element={<EditEmployee />} />

          {/* Leads */}
          <Route
            path="leads"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Coordinator"]}>
                <Leads />
              </ProtectedRoute>
            }
          />
          
          <Route path="leads/create" element={<CreateLead />} />
          <Route path="/delivery/edit/:id" element={<EditDelivery />} />
          <Route path="/tickets" element={<ViewTickets />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />
          <Route path="/editLead/:id" element={<EditLead />}/>
          <Route path="/purchase-request" element={<PurchaseRequest />}/>
          <Route path="/erp-dashboard" element={<ERPDashboard />}/>
          {/*<Route path="/rfqs" element={<RFQList />}/>
          <Route path="/procurement/rfq/create" element={<CreateRFQ />}/>
          <Route path="/procurement/rfqs/:id"  element={<RFQDetails />}/>*/}
          <Route path="/procurement/grns" element={<GRNList />}/>
          <Route path="/procurement/grns/create" element={<CreateGRN />}/>
          <Route path="/procurement/grns/:id" element={<GRNDetails />}/>

          <Route path="/products"  element={<ProductsList />}/>
          <Route path="/products/create" element={<CreateProduct />}/>
          <Route path="/categories" element={<Categories />}/>
          <Route path="/sub-categories" element={<SubCategories />}/>
          <Route path="/brands" element={<Brands />}/>
          <Route path="/product-settings/units" element={<Units />}/>
          <Route path="/hsn-codes" element={<HsnCodes />}/>
          <Route path="/warehouse" element={<Warehouse/>}/>
          

          <Route path="/inventory/raw-materials" element={<RawMaterials />}/>
          <Route path="/inventory/components" element={<Components />}/>
          <Route path="/inventory/stock-in" element={<StockIn />}/>
          <Route path="/inventory/stock-out" element={<StockOut />}/>
          <Route path="/inventory/stock-transfer" element={<StockTransfer />}/>
          <Route path="/inventory/stock-audit" element={<StockAudit />}/>
          <Route path="/inventory/reorder-alert" element={<ReorderAlert />}/>

          <Route path="/purchase/suppliers" element={<Suppliers />} />
          <Route path="/purchase/purchase-requisition" element={<PurchaseRequisition />}/>
          <Route path="/purchase/request-for-quotation" element={<RequestForQuotation />}/>
          <Route path="/purchase/purchase-orders" element={<PurchaseOrders />}/>
          <Route path="/purchase/goods-receipt-notes" element={<GoodsReceiptNote />} />
          <Route path="/purchase/purchase-bills" element={<PurchaseBill />} />
          <Route path="/purchase/purchase-returns" element={<PurchaseReturn />} />
          <Route path="/purchase/supplier-payments" element={<SupplierPayment />} />
          {/* ✅ ADD TICKET HERE */}
          <Route
            path="ticket"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Engineer", "Coordinator"]}>
                <Ticket />
              </ProtectedRoute>
            }
          />

          {/* Opportunities */}
          <Route
            path="opportunities"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Engineer"]}>
                <Opportunies />
              </ProtectedRoute>
            }
          />

          {/* Enquiry */}
          <Route
            path="enquiry"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Engineer"]}>
                <Enquiry />
              </ProtectedRoute>
            }
          />
        <Route
  path="/view/:type/:id"
  element={<LeadView />}
/>

          {/* Quotation */}
          <Route
            path="quotation"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Engineer"]}>
                <Quotation />
              </ProtectedRoute>
            }
          />
         
          <Route path="addQuotation/:id" element={<AddQuotation />} />

          {/* Converted */}
          <Route
            path="converted"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin", "Engineer"]}>
                <Converted />
              </ProtectedRoute>
            }
          />
          <Route path="convertedView/:id" element={<ConvertedView />} />

          {/* ✅ DELIVERY ROUTE (ADDED HERE) */}
          <Route
            path="delivery"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <Delivery />
              </ProtectedRoute>
            }
          />

          {/* Followup */}
          <Route path="followup" element={<FollowUp />} />

          {/* Account */}
          <Route
            path="account"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route path="accountView/:id" element={<AccountView />} />

          {/* Report */}
          <Route
            path="report"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <Report />
              </ProtectedRoute>
            }
          />

          {/* History */}
          <Route
            path="leadsHistory"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <LeadsHistory />
              </ProtectedRoute>
            }
          />
          <Route path="leadsHistoryView" element={<HistoryDetails />} />

          {/* Others */}
          <Route path="calendar" element={<Calendar />} />

          <Route
            path="activityLogs"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <ActivityLogs />
              </ProtectedRoute>
            }
          />

          <Route
            path="createUser"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <CreateUser />
              </ProtectedRoute>
            }
          />

          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route path="usersView" element={<UserDetails />} />

          <Route
            path="trash"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <Trash />
              </ProtectedRoute>
            }
          />

          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:uToken" element={<ResetPassword />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster />
    </>
  );
};

export default App;