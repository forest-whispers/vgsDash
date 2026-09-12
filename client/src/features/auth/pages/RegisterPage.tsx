import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import AuthFormContainer from "../components/AuthFormContainer";
import { useAuth } from "../AuthContext";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState("");
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
            await register({
                name,
                email,
                password,
            });

            navigate("/login");
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to register");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthFormContainer
            title="Create account"
            subtitle="Create your project dashboard account"
        >
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
            >
                <Input
                    label="Name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                        setName(event.target.value)
                    }
                    placeholder="Your name"
                    required
                />

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
                    placeholder="Create a password"
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
                    {isSubmitting
                        ? "Creating account..."
                        : "Register"}
                </Button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-700"
                >
                    Sign in
                </Link>
            </p>
        </AuthFormContainer>
    );
}