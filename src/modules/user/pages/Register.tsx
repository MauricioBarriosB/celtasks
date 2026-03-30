import { useState, useEffect, type FormEvent } from "react";
import { Card, CardBody, CardHeader, Input, Button, Link, addToast } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuthContext } from "@modules/user/context/AuthContext";

export default function Register() {
    const { register, isAuthenticated, isLoading, error, clearError } = useAuthContext();
    const navigate = useNavigate();

    const [appCode, setAppCode] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/projects", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => clearError();
    }, [clearError]);

    const validate = (): boolean => {
        setValidationError(null);

        if (password.length < 8) {
            setValidationError("Password must be at least 8 characters long.");
            return false;
        }

        if (password !== confirmPassword) {
            setValidationError("Passwords do not match.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const success = await register({ name, email, password, appCode });
        if (success) {
            addToast({
                title: "Account created!",
                description: "Your account has been created successfully.",
                color: "success",
            });
        }
    };

    const displayError = validationError ?? error;

    return (
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="flex flex-col items-center gap-1 pb-0">
                    <h1 className="text-2xl font-bold">Create Account</h1>
                    <p className="text-sm text-default-500">Join CelTasks to manage your projects</p>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {displayError && (
                            <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger">{displayError}</div>
                        )}

                        <Input
                            label="Account Code"
                            placeholder="Enter your account code"
                            value={appCode}
                            onValueChange={setAppCode}
                            isRequired
                            autoComplete="off"
                        />

                        <Input
                            label="Name"
                            placeholder="Your full name"
                            value={name}
                            onValueChange={setName}
                            isRequired
                            autoComplete="name"
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onValueChange={setEmail}
                            isRequired
                            autoComplete="email"
                        />

                        <Input
                            label="Password"
                            type={isVisible ? "text" : "password"}
                            placeholder="At least 8 characters"
                            value={password}
                            onValueChange={(val) => {
                                setPassword(val);
                                setValidationError(null);
                            }}
                            isRequired
                            autoComplete="new-password"
                            endContent={
                                <button
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={() => setIsVisible((v) => !v)}
                                    aria-label={isVisible ? "Hide password" : "Show password"}
                                >
                                    {isVisible ? (
                                        <EyeOff className="pointer-events-none text-default-400" size={20} />
                                    ) : (
                                        <Eye className="pointer-events-none text-default-400" size={20} />
                                    )}
                                </button>
                            }
                        />

                        <Input
                            label="Confirm Password"
                            type={isConfirmVisible ? "text" : "password"}
                            placeholder="Repeat your password"
                            value={confirmPassword}
                            onValueChange={(val) => {
                                setConfirmPassword(val);
                                setValidationError(null);
                            }}
                            isRequired
                            autoComplete="new-password"
                            endContent={
                                <button
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={() => setIsConfirmVisible((v) => !v)}
                                    aria-label={isConfirmVisible ? "Hide password" : "Show password"}
                                >
                                    {isConfirmVisible ? (
                                        <EyeOff className="pointer-events-none text-default-400" size={20} />
                                    ) : (
                                        <Eye className="pointer-events-none text-default-400" size={20} />
                                    )}
                                </button>
                            }
                        />

                        <Button type="submit" color="primary" isLoading={isLoading} className="mt-2" fullWidth>
                            Create Account
                        </Button>

                        <p className="text-center text-sm text-default-500">
                            Already have an account?{" "}
                            <Link as={RouterLink} to="/login" size="sm">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
