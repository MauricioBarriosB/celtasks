import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@modules/user/context/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: Readonly<ProtectedRouteProps>) {
    const { isAuthenticated, isInitialized, isAdmin } = useAuthContext();
    const location = useLocation();

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-default-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
