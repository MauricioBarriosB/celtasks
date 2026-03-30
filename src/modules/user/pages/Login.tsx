import { useState, useEffect, type FormEvent } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Link,
  addToast,
} from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { useAuthContext } from "@modules/user/context/AuthContext";
import type { LoginCredentials } from "@/types";

export default function Login() {
  const { login, isAuthenticated, isLoading, error, clearError } =
    useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [isVisible, setIsVisible] = useState(false);

  const from = (location.state as { from?: string })?.from ?? "/projects";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
      addToast({
        title: "Welcome back!",
        description: "You have signed in successfully.",
        color: "success",
      });
    } catch {
      // error is handled via context
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-1 pb-0">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-sm text-default-500">
            Welcome back to CelTasks
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-danger-50 p-3 text-sm text-danger">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={credentials.email}
              onValueChange={(val) =>
                setCredentials((prev) => ({ ...prev, email: val }))
              }
              isRequired
              autoComplete="email"
            />

            <Input
              label="Password"
              type={isVisible ? "text" : "password"}
              placeholder="Enter your password"
              value={credentials.password}
              onValueChange={(val) =>
                setCredentials((prev) => ({ ...prev, password: val }))
              }
              isRequired
              autoComplete="current-password"
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

            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              className="mt-2"
              fullWidth
            >
              Sign In
            </Button>

            <p className="text-center text-sm text-default-500">
              Don&apos;t have an account?{" "}
              <Link as={RouterLink} to="/register" size="sm">
                Create one
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
