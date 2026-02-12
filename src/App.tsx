import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Consultation from "./pages/Consultation";
import Service from "./pages/Service";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import DesignerSearch from "./pages/DesignerSearch";
import Loading from "./pages/Loading";
import MatchingComplete from "./pages/MatchingComplete";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLeads from "./pages/admin/Leads";
import AdminProjects from "./pages/admin/Projects";
import AdminDesigners from "./pages/admin/Designers";
import CustomerDetail from "./pages/admin/CustomerDetail";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordComplete from "./pages/ResetPasswordComplete";
import ForgotPassword from "./pages/ForgotPassword";
import Survey from "./pages/Survey";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Plan from "./pages/Plan";
import ContactComplete from "./pages/ContactComplete";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ai-matching" element={<Consultation />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/service" element={<Service />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/designer-search" element={<DesignerSearch />} />
          <Route path="/matching-complete" element={<MatchingComplete />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/admin/projects" element={<AdminProjects />} />
          <Route path="/admin/designers" element={<AdminDesigners />} />
          <Route path="/admin/customers/:customerId" element={<CustomerDetail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password-complete" element={<ResetPasswordComplete />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/survey/:token" element={<Survey />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/contact-complete" element={<ContactComplete />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
