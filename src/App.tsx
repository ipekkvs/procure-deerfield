import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import NewRequest from "./pages/NewRequest";
import Approvals from "./pages/Approvals";
import RequestDetail from "./pages/RequestDetail";
import Renewals from "./pages/Renewals";
import Vendors from "./pages/Vendors";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />
          <Route
            path="/new-request"
            element={
              <AppLayout>
                <NewRequest />
              </AppLayout>
            }
          />
          <Route
            path="/approvals"
            element={
              <AppLayout>
                <Approvals />
              </AppLayout>
            }
          />
          <Route
            path="/requests/:id"
            element={
              <AppLayout>
                <RequestDetail />
              </AppLayout>
            }
          />
          <Route
            path="/renewals"
            element={
              <AppLayout>
                <Renewals />
              </AppLayout>
            }
          />
          <Route
            path="/vendors"
            element={
              <AppLayout>
                <Vendors />
              </AppLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <AppLayout>
                <Settings />
              </AppLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <AppLayout>
                <Reports />
              </AppLayout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
