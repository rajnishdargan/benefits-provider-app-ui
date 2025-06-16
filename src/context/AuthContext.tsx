import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

interface AuthContextType {
  userRole: string | null;
  setUserRole: (role: string) => void;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) {
      setUserRole(role);
    }
  }, []);

  const isSuperAdmin = userRole === "Super Admin";

  const authContextValue = useMemo(
    () => ({
      userRole,
      setUserRole,
      isSuperAdmin,
    }),
    [userRole, isSuperAdmin] // only re-compute if these change
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
