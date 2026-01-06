import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DealsPage from "./pages/DealsPage";
import DealDetailsPage from "./pages/DealDetailsPage";
import MoneyPage from "./pages/MoneyPage";
import CallsPage from "./pages/CallsPage";
import AIPage from "./pages/AIPage";
import FocusPage from "./pages/FocusPage";
import InstallPage from "./pages/InstallPage";
import JobsPage from "./pages/JobsPage";
import PartnersPage from "./pages/PartnersPage";
import PartnerDetailsPage from "./pages/PartnerDetailsPage";
import NotFound from "./pages/NotFound";
import { OfflineIndicator } from "./components/OfflineIndicator";
import ElectronTitleBar from "./components/ElectronTitleBar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour (renamed from cacheTime)
      retry: (failureCount, error) => {
        // Don't retry if offline
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ElectronTitleBar />
      <Toaster />
      <Sonner />
      <OfflineIndicator />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/deals/:id" element={<DealDetailsPage />} />
          <Route path="/money" element={<MoneyPage />} />
          <Route path="/calls" element={<CallsPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/focus" element={<FocusPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/partners/:name" element={<PartnerDetailsPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;