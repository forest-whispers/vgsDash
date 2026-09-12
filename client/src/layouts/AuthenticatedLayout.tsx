import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../features/auth/AuthContext";
import { connectSocket, disconnectSocket } from "../lib/socket";

export default function AuthenticatedLayout() {
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            connectSocket();
        }

        return () => {
            disconnectSocket();
        };
    }, [user]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
            <Navbar />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
