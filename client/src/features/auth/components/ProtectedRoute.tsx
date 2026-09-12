import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Spinner from "../../../shared/ui/Spinner";

export default function ProtectedRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}