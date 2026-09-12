import { Outlet } from "react-router-dom";

export default function PublicLayout() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <main className="w-full max-w-md">
                <Outlet />
            </main>
        </div>
    );
}