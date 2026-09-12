import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import AuthFormContainer from "../components/AuthFormContainer";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
            await login({
                email,
                password,
            });

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

    return (
        <AuthFormContainer
            title="Sign in"
            subtitle="Sign in to your project dashboard"
        >
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
            >
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    required
                />

                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
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