import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ErrorMessage } from "~/components/common/errorMessage";
import { useState } from "react";
import { useNavigate, type LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { validateUserSession } from "~/services/auth/validateUserSession";
import { loginUser } from "~/services/auth/loginUser";
import { LoginFormSchema, type LoginFormT } from "~/schema/Login.schema";

export async function loader({ request }: LoaderFunctionArgs) {
  const authResult = await validateUserSession(request);
  
  if (authResult.success && authResult.user) {
    throw redirect("/admin");
  }
  
  return { isAuthenticated: false };
}

export default function Login() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormT>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: LoginFormT) => {
    setLoginError(null);
    setIsLoading(true);
    
    try {
      const result = await loginUser(data.username, data.password);
      
      if (result.success) {
        navigate('/admin', { replace: true });
      } else {
        setLoginError(result.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isSubmitting || isLoading;

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
              disabled={isFormDisabled}
            />
            <ErrorMessage message={errors.username?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              disabled={isFormDisabled}
            />
            <ErrorMessage message={errors.password?.message} />
          </div>

          <button
            type="submit"
            disabled={isFormDisabled}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors mt-4 flex items-center justify-center gap-2"
          >
            {isFormDisabled && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isFormDisabled ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}