import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import SecureAuthWrapper from "./components/SecureAuthWrapper";
import VigilanteChecklistPage from "./pages/VigilanteChecklistPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <React.Fragment>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <div className="min-h-screen w-full">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Sistema Carregado</h1>
                        <p>React funcionando corretamente</p>
                      </div>
                    </div>
                  } />
                  <Route path="/admin" element={<SecureAuthWrapper />} />
                  <Route path="/vigilante-checklist" element={<VigilanteChecklistPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.Fragment>
  );
};

export default App;