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
import PurchaseRequisitionPage from "./pages/PurchaseRequisition/PurchaseRequisitionPage";
import RFQList from "./pages/procurement/RFQList";
import CreateRFQ from "./pages/procurement/CreateRFQ";
import RFQDetails from "./pages/procurement/RFQDetails";
import PurchaseOrderList from "./pages/procurement/PurchaseOrderList";
import PurchaseOrderDetails from "./pages/procurement/PurchaseOrderDetails";
import GRNList from "./pages/procurement/GRNList";
import CreateGRN from "./pages/procurement/CreateGRN";
import GRNDetails from "./pages/procurement/GRNDetails";
import InvoiceManagement from "./pages/BillingAndFinance/InvoiceManagement";
import CreditNotes from "./pages/BillingAndFinance/CreditNotes";
import DebitNotes from "./pages/BillingAndFinance/DebitNotes";
import CustomerPayments from "./pages/BillingAndFinance/CustomerPayments";
import Subscriptions from "./pages/BillingAndFinance/Subscriptions";
import SupplierPayments from "./pages/BillingAndFinance/SupplierPayments";
import Expenses from "./pages/BillingAndFinance/Expenses";
import CustomerLedger from "./pages/BillingAndFinance/CustomerLedger";
import SupplierLedger from "./pages/BillingAndFinance/SupplierLedger";
import CashBankManagement from "./pages/BillingAndFinance/CashBankManagement";
import GSTManagement from "./pages/BillingAndFinance/GSTManagement";
import DispatchOrders from "./pages/DeliveryAndDispatch/DispatchOrders";
import PackingList from "./pages/DeliveryAndDispatch/PackingList";
import VehicleAllocation from "./pages/DeliveryAndDispatch/VehicleAllocation";
import ShipmentTracking from "./pages/DeliveryAndDispatch/ShipmentTracking";
import DeliveryChallan from "./pages/DeliveryAndDispatch/DeliveryChallan";
import DeliveryConfirmation from "./pages/DeliveryAndDispatch/DeliveryConfirmation";
import TransportersMaster from "./pages/DeliveryAndDispatch/TransportersMaster";
import Returns from "./pages/ReturnsAndReplacements/Returns";
import BOM from "./pages/Manufacturing/BOM";
import ProductionPlanning from "./pages/Manufacturing/ProductionPlanning";
import ProductionOrders from "./pages/Manufacturing/ProductionOrders";
import MaterialIssue from "./pages/Manufacturing/MaterialIssue";
import WorkOrders from "./pages/Manufacturing/WorkOrders";
import AssemblyProcess from "./pages/Manufacturing/AssemblyProcess";
import QualityControl from "./pages/Manufacturing/QualityControl";
import FinishedGoodsEntry from "./pages/Manufacturing/FinishedGoodsEntry";
import ProductionCosting from "./pages/Manufacturing/ProductionCosting";

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
          <Route path="/purchase-requisitions" element={<PurchaseRequisitionPage />}/>
          <Route path="/rfqs" element={<RFQList />}/>
          <Route path="/procurement/rfq/create" element={<CreateRFQ />}/>
          <Route path="/procurement/rfqs/:id"  element={<RFQDetails />}/>
          <Route path="/procurement/purchase-orders" element={<PurchaseOrderList />}/>
          <Route path="/procurement/purchase-orders/:id" element={<PurchaseOrderDetails />}/>
          <Route path="/procurement/grns" element={<GRNList />}/>
          <Route path="/procurement/grns/create" element={<CreateGRN />}/>
          <Route path="/procurement/grns/:id" element={<GRNDetails />}/>

          {/* Billing & Finance Routes */}
          <Route
            path="invoice-management"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <InvoiceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="credit-notes"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <CreditNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="debit-notes"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <DebitNotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="customer-payments"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <CustomerPayments />
              </ProtectedRoute>
            }
          />
          <Route path="subscriptions" element={<ProtectedRoute allowedRoles={["Super Admin", "Admin"]}><Subscriptions /></ProtectedRoute>} />
          <Route
            path="supplier-payments"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <SupplierPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="expenses"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <Expenses />
              </ProtectedRoute>
            }
          />
          <Route
            path="customer-ledger"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <CustomerLedger />
              </ProtectedRoute>
            }
          />
          <Route
            path="supplier-ledger"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <SupplierLedger />
              </ProtectedRoute>
            }
          />
          <Route
            path="cash-bank-management"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <CashBankManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="gst-management"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <GSTManagement />
              </ProtectedRoute>
            }
          />

          {/* Delivery & Dispatch */}
          <Route
            path="dispatch-orders"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <DispatchOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="packing-list"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <PackingList />
              </ProtectedRoute>
            }
          />
          <Route
            path="vehicle-allocation"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <VehicleAllocation />
              </ProtectedRoute>
            }
          />
          <Route
            path="shipment-tracking"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <ShipmentTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="delivery-challan"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <DeliveryChallan />
              </ProtectedRoute>
            }
          />
          <Route
            path="delivery-confirmation"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <DeliveryConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="transporters-master"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <TransportersMaster />
              </ProtectedRoute>
            }
          />

          {/* Returns & Replacements */}
          <Route
            path="returns"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <Returns />
              </ProtectedRoute>
            }
          />

          {/* Manufacturing */}
          <Route
            path="bom"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <BOM />
              </ProtectedRoute>
            }
          />
          <Route
            path="production-planning"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <ProductionPlanning />
              </ProtectedRoute>
            }
          />
          <Route
            path="production-orders"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <ProductionOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="material-issue"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <MaterialIssue />
              </ProtectedRoute>
            }
          />
          <Route
            path="work-orders"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <WorkOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="assembly-process"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <AssemblyProcess />
              </ProtectedRoute>
            }
          />
          <Route
            path="quality-control"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <QualityControl />
              </ProtectedRoute>
            }
          />
          <Route
            path="finished-goods-entry"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <FinishedGoodsEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="production-costing"
            element={
              <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
                <ProductionCosting />
              </ProtectedRoute>
            }
          />

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
