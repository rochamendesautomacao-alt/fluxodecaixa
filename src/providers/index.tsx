import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { CompanyStoreProvider } from "./company-store-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CompanyStoreProvider>{children}</CompanyStoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
