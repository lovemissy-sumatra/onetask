import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ErrorMessage } from "~/components/common/errorMessage";
import {
  redirect,
  useActionData,
  Form,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import { validateUserSession } from "~/utils/auth/validateUserSession";

const LoginFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});
type LoginFormType = z.infer<typeof LoginFormSchema>;

interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await validateUserSession(request);
  if (user) return redirect("/admin");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  const response = await fetch("http://localhost:5024/api/adminauth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: request.headers.get("Cookie") ?? "",
    },
    body: JSON.stringify({ username, password }),
  });

  const cookies =
    response.headers.getSetCookie?.() ?? response.headers.get("set-cookie");

  const headers = new Headers();
  if (cookies) {
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    cookieArray.forEach((cookie) => headers.append("Set-Cookie", cookie));
  }

  if (response.ok) {
    return redirect("/admin", { headers });
  } else {
    const errorData = await response.json();
    return {
      success: false,
      error: errorData.message || "Login failed",
      status: response.status,
    };
  }
}

export default function Login() {
  const actionData = useActionData() as LoginResponse | undefined;

  const {
    register,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormType>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <div className="p-5 rounded-xl flex flex-col items-center justify-center bg-white/5 min-h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-bold text-4xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 inline-block text-transparent bg-clip-text pb-3">
            PrintAway
          </h1>
          <p className="text-neutral-400 mt-2">Sign in to your account</p>
        </div>

        <Form method="post" className="flex flex-col gap-4">
          {actionData?.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{actionData.error}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Email Address</Label>
            <Input
              type="text"
              placeholder="Enter your email"
              {...register("username")}
              disabled={isSubmitting}
            />
            <ErrorMessage message={errors.username?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
              {...register("password")}
              disabled={isSubmitting}
            />
            <ErrorMessage message={errors.password?.message} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors mt-4"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>

        </Form>
      </div>
    </div>
  );
}
