import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ErrorMessage } from "~/components/common/errorMessage";
import { useState } from "react";
import { redirect, useNavigate, type LoaderFunctionArgs } from "react-router";
import { validateUserSession } from "~/utils/auth/validateUserSession";
const LoginFormSchema = z.object({
    username: z.string().min(1, { message: "Username is required" }),
    password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormType = z.infer<typeof LoginFormSchema>;

interface LoginResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        email: string;
        name: string;
    };
    message?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await validateUserSession(request);
  
  if (user) {
    return redirect("/admin");
  }
}


export default function Login() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormType>({
        resolver: zodResolver(LoginFormSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormType) => {
        setIsLoading(true);
        setLoginError("");

        try {
            const response = await fetch("http://localhost:5024/api/adminauth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result: LoginResponse = await response.json();

            if (result.success && result.token) {
                localStorage.setItem("authToken", result.token);

                if (result.user) {
                    localStorage.setItem("user", JSON.stringify(result.user));
                }

                navigate("/");
            } else {
                setLoginError(result.message || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoginError("Network error. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-5 rounded-xl flex flex-col items-center justify-center bg-white/5 min-h-screen">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="font-bold text-4xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 inline-block text-transparent bg-clip-text pb-3">
                        PrintAway
                    </h1>
                    <p className="text-neutral-400 mt-2">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    {loginError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-red-400 text-sm">{loginError}</p>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Label>Email Address</Label>
                        <Input
                            type="text"
                            placeholder="Enter your email"
                            {...register("username")}
                            disabled={isLoading}
                        />
                        <ErrorMessage message={errors.username?.message} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Password</Label>
                        <Input
                            type="password"
                            placeholder="Enter your password"
                            {...register("password")}
                            disabled={isLoading}
                        />
                        <ErrorMessage message={errors.password?.message} />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors mt-4"
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>

                    <div className="flex flex-col gap-2 text-center text-sm mt-4">
                        <a
                            href="/forgot-password"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Forgot your password?
                        </a>
                        <p className="text-neutral-400">
                            Don't have an account?{" "}
                            <a
                                href="/register"
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                Sign up here
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}