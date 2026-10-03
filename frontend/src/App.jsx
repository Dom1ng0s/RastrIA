import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./features/ui/ToastProvider";
import { AppRoutes } from "./routes";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {/* Boundary de topo (issue #122): acima do router, para pegar também um
            erro vindo do próprio roteamento, e abaixo dos providers, para o
            fallback continuar com tema e tokens de estilo aplicados. */}
        <ErrorBoundary>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ErrorBoundary>
      </ToastProvider>
    </QueryClientProvider>
  );
}
