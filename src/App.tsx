import { Suspense, useState, useEffect } from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Routes, Route, Navigate } from "react-router-dom";
import { initializeI18n } from "./i18n";
import authRoutes from "./routes/authRoutes";
import guestRoutes from "./routes/guestRoutes";
import Loading from "./components/common/Loading";
import customTheme from "./components/theme/theme";
import { AuthProvider, useAuth } from "./context/AuthContext";

const theme = extendTheme(customTheme);

initializeI18n("local"); // Initialize i18n with default language

// Protected Route component
const ProtectedRoute = ({ children, requireSuperAdmin }: { children: React.ReactNode, requireSuperAdmin?: boolean }) => {
  const { isSuperAdmin } = useAuth();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<
    { path: string; component: React.ElementType; requireSuperAdmin?: boolean }[]
  >([]);

  useEffect(() => {
    const checkAuthAndSetRoutes = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setRoutes(authRoutes);
      } else {
        setRoutes(guestRoutes);
      }
      setLoading(false);
    };

    // Check auth on initial load
    checkAuthAndSetRoutes();

    // Listen for token changes
    const handleTokenChange = () => {
      checkAuthAndSetRoutes();
    };

    window.addEventListener("tokenChanged", handleTokenChange);

    return () => {
      window.removeEventListener("tokenChanged", handleTokenChange);
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {routes?.map((item, index) => (
          <Route
            key={item?.path + index}
            path={item?.path}
            element={
              item.requireSuperAdmin ? (
                <ProtectedRoute requireSuperAdmin>
                  <item.component />
                </ProtectedRoute>
              ) : (
                <item.component />
              )
            }
          />
        ))}
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
