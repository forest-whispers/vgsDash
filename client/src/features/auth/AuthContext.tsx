import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import * as authService from "./auth.service";
import type {
    AuthContextValue,
    AuthenticatedUser,
    LoginCredentials,
    RegisterData,
} from "./auth.types";

const AuthContext = createContext<AuthContextValue | undefined>(
    undefined
);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const currentUser =
                    await authService.getCurrentUser();

                setUser(currentUser);
            } catch {
                try {
                    await authService.refresh();
                    const currentUser =
                        await authService.getCurrentUser();

                    setUser(currentUser);
                } catch {
                    setUser(null);
                }
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (
        credentials: LoginCredentials
    ) => {
        const authenticatedUser =
            await authService.login(credentials);

        setUser(authenticatedUser);
    };

    const register = async (
        data: RegisterData
    ) => {
            await authService.register(data);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used within AuthProvider"
        );
    }

    return context;
};