import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";
import AuthFormContainer from "../components/AuthFormContainer";
import { useAuth } from "../AuthContext";

const DEMO_PASSWORD = "Password123!";

const DEMO_ACCOUNTS = [
    { label: "Admin", email: "admin@demo.com", password: DEMO_PASSWORD },
    { label: "Project Manager 1", email: "pm1@demo.com", password: DEMO_PASSWORD },
    { label: "Project Manager 2", email: "pm2@demo.com", password: DEMO_PASSWORD },
    { label: "Developer 1", email: "dev1@demo.com", password: DEMO_PASSWORD },
    { label: "Developer 2", email: "dev2@demo.com", password: DEMO_PASSWORD },
    { label: "Developer 3", email: "dev3@demo.com", password: DEMO_PASSWORD },
    { label: "Developer 4", email: "dev4@demo.com", password: DEMO_PASSWORD },
] as const;

const DEMO_OPTIONS = DEMO_ACCOUNTS.map((account) => ({
    label: account.label,
    value: account.email,
}));

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [selectedDemo, setSelectedDemo] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const submitLogin = async (credentials: {
        email: string;
        password: string;
    }) => {
        setError("");
        setIsSubmitting(true);

        try {
            await login(credentials);
            navigate("/dashboard");
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to sign in");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        await submitLogin({ email, password });
    };

    const handleDemoSelect = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selectedEmail = event.target.value;
        setSelectedDemo(selectedEmail);

        if (!selectedEmail) {
            return;
        }

        const account = DEMO_ACCOUNTS.find(
            (item) => item.email === selectedEmail
        );
        if (!account) {
            return;
        }

        setEmail(account.email);
        setPassword(account.password);

        await submitLogin({
            email: account.email,
            password: account.password,
        });
    };

    return (
        <AuthFormContainer
            title="Sign in"
            subtitle="Sign in to your project dashboard"
        >
            <div className="mb-4">
                <Select
                    label="Demo account"
                    value={selectedDemo}
                    onChange={handleDemoSelect}
                    options={DEMO_OPTIONS}
                    disabled={isSubmitting}
                />
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
            >
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                        setEmail(event.target.value);
                        setSelectedDemo("");
                    }}
                    placeholder="you@example.com"
                    required
                />

                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(event) => {
                        setPassword(event.target.value);
                        setSelectedDemo("");
                    }}
                    placeholder="Enter your password"
                    required
                />

                {error && (
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                )}

                <Button
                    type="submit"
                    className="mt-2 w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                    to="/register"
                    className="font-medium text-blue-600 hover:text-blue-700"
                >
                    Register
                </Link>
            </p>
        </AuthFormContainer>
    );
}