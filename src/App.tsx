import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LocationProvider } from "@/hooks/useLocationContext";
import Index from "./pages/Index";
import Lakes from "./pages/Lakes";
import LakeDetail from "./pages/LakeDetail";
import Recommendations from "./pages/Recommendations";
import FishingLog from "./pages/FishingLog";
import Community from "./pages/Community";
import Auth from "./pages/Auth";
import MySpots from "./pages/MySpots";
import SavedRecommendationDetail from "./pages/SavedRecommendationDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LocationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/lakes" element={<Lakes />} />
              <Route path="/lakes/:id" element={<LakeDetail />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/log" element={<FishingLog />} />
              <Route path="/community" element={<Community />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/my-spots" element={<MySpots />} />
              <Route path="/my-spots/recommendation/:id" element={<SavedRecommendationDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LocationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
