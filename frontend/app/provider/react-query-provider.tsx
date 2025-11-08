import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth-context";

export const queryClient = new QueryClient();

const ReactQueryProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>
    <AuthProvider>
      {children}
    </AuthProvider>
    <Toaster position="top-center" richColors />
  </QueryClientProvider>;
};

export default ReactQueryProvider;