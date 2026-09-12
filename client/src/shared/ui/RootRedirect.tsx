import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import Spinner from "./Spinner";

export default function RootRedirect() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}
