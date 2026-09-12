import { createBrowserRouter } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AuthenticatedLayout from "../layouts/AuthenticatedLayout";
import ProjectLayout from "../layouts/ProjectLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import PublicOnlyRoute from "../features/auth/components/PublicOnlyRoute";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import ProjectsPage from "../features/projects/pages/ProjectsPage";
import ProjectDetailsPage from "../features/projects/pages/ProjectDetailsPage";
import UsersPage from "../features/users/pages/UsersPage";
import ClientsPage from "../features/clients/pages/ClientsPage";
import DeveloperTasksPage from "../features/tasks/pages/DeveloperTasksPage";
import ActivitiesPage from "../features/activities/pages/ActivitiesPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
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
                        element: <DashboardPage />,
                    },
                    {
                        path: "/projects",
                        element: <ProjectsPage />,
                    },
                    {
                        path: "/projects/:projectId",
                        element: <ProjectLayout />,
                        children: [
                            {
                                index: true,
                                element: <ProjectDetailsPage />,
                            },
                        ],
                    },
                    {
                        path: "/clients",
                        element: <ClientsPage />,
                    },
                    {
                        path: "/users",
                        element: <UsersPage />,
                    },
                    {
                        path: "/activity",
                        element: <ActivitiesPage />,
                    },
                    {
                        path: "/tasks",
                        element: <DeveloperTasksPage />,
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