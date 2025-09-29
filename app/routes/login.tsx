import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import { useNavigate, type LoaderFunctionArgs } from "react-router";
import { loginUser } from "~/services/auth/loginUser";
import { LoginFormSchema, type LoginFormT } from "~/schema/Login.schema";
import { ErrorMessage } from "~/components/shared/InlineErrorMessage";
import { Button } from "~/components/ui/button";
import { Eye, EyeClosed } from "lucide-react";
import { InlineAlertMessage } from "~/components/shared/InlineAlertMessage";
import { LogoHeader } from "~/components/shared/Logo";

export default function Login() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false)

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

        <LogoHeader context="Sign in to your account" />
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {loginError && (
            <InlineAlertMessage
              alert={{
                type: "error",
                title: "Error",
                description: loginError
              }}
            />
          )}


          <div className="flex flex-col gap-2">
            <Label>Username</Label>
            <Input
              type="text"
              placeholder="Enter your username"
              {...register("username")}
              disabled={isFormDisabled}
            />
            <ErrorMessage message={errors.username?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={`${showPassword ? 'text' : 'password'}`}
                placeholder="Enter your password"
                {...register("password")}
                disabled={isFormDisabled}

              />
              <Button type="button" variant={'link'} onClick={() => setShowPassword(!showPassword)} className="absolute top-0 right-0">
                {showPassword ? <Eye color="white" /> : <EyeClosed color="white" />}
              </Button>
            </div>
            <ErrorMessage message={errors.password?.message} />
          </div>

          <Button
            type="submit"
            disabled={isFormDisabled}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors mt-4 flex items-center justify-center gap-2"
          >
            {isFormDisabled && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isFormDisabled ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}