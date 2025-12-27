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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/deals/:id" element={<DealDetailsPage />} />
          <Route path="/money" element={<MoneyPage />} />
          <Route path="/calls" element={<CallsPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/focus" element={<FocusPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;