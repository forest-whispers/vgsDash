import { createBrowserRouter } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import PublicOnlyRoute from "../features/auth/components/PublicOnlyRoute";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import ProjectsPage from "../features/projects/pages/ProjectsPage";
import ProjectDetailsPage from "../features/projects/pages/ProjectDetailsPage";
import PlaceholderPage from "../shared/ui/PlaceholderPage";
import RootRedirect from "../shared/ui/RootRedirect";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootRedirect />,
    },
    {
        element: <PublicOnlyRoute />,
        children: [
            {
                element: <PublicLayout />,
                children: [
                    {
                        path: "/login",
                        element: <LoginPage />,
                    },
                    {
                        path: "/register",
                        element: <RegisterPage />,
                    },
                ],
            },
        ],
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AuthenticatedLayout />,
                children: [
                    {
                        path: "/dashboard",
                        element: <PlaceholderPage title="Dashboard" />,
                    },
                    {
                        path: "/projects",
                        element: <ProjectsPage />,
                    },
                    {
                        path: "/projects/:projectId",
                        element: <ProjectDetailsPage />,
                    },
                    {
                        path: "/clients",
                        element: <PlaceholderPage title="Clients" />,
                    },
                    {
                        path: "/activity",
                        element: <PlaceholderPage title="Activity" />,
                    },
                    {
                        path: "/tasks",
                        element: <PlaceholderPage title="My Tasks" />,
                    },
                ],
            },
        ],
    },
    {
        path: "*",
        element: <RootRedirect />,
    },
]);