import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

// Landing loads eagerly (first paint); everything else is lazy so heavy deps
// like Monaco only download when that route is actually opened.
import Landing from "./pages/Landing";
const DocsIndex = lazy(() => import("./pages/DocsIndex"));
const ConceptPage = lazy(() => import("./pages/ConceptPage"));
const DeepDives = lazy(() => import("./pages/DeepDives"));
const ChapterPage = lazy(() => import("./pages/ChapterPage"));
const Innovations = lazy(() => import("./pages/Innovations"));
const Lifecycle = lazy(() => import("./pages/Lifecycle"));
const SandwichSim = lazy(() => import("./pages/SandwichSim"));
const Learn = lazy(() => import("./pages/Learn"));
const Labs = lazy(() => import("./pages/Labs"));
const Resources = lazy(() => import("./pages/Resources"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid var(--line-2)", borderTopColor: "var(--sol-green)", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Analytics />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/innovations" element={<Innovations />} />
            <Route path="/deep-dives" element={<DeepDives />} />
            <Route path="/deep-dives/:id" element={<ChapterPage />} />
            <Route path="/lifecycle" element={<Lifecycle />} />
            <Route path="/sandwich" element={<SandwichSim />} />
            <Route path="/docs" element={<DocsIndex />} />
            <Route path="/docs/:id" element={<ConceptPage />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/labs" element={<Labs />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
