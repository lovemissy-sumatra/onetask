import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAdminSchema, type CreateAdminFormT } from "~/schema/CreateAdmin.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Eye, EyeClosed } from "lucide-react";
import { InlineAlertMessage } from "~/components/shared/InlineAlertMessage";

export function CreateAdminDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateAdminFormT>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { username: "", password: "", role: "Admin" },
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const onSubmit = (data: CreateAdminFormT) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("_intent", "createAdmin");
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("role", data.role);

    fetcher.submit(formData, { method: "post" });
  };

  const isFormDisabled = isSubmitting || isLoading;

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data != null) {
      if (fetcher.data.success) {
        setIsLoading(false);
        reset();
        setOpen(false);
        onCreated();
      } else {
        setIsLoading(false);
      }
    }
  }, [fetcher.state, fetcher.data, onCreated, reset]);



  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          reset();
          setIsLoading(false);
          setShowPassword(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default">+ Add Admin</Button>
      </DialogTrigger>
      <DialogContent className="dark">
        <DialogHeader>
          <DialogTitle>Create New Admin</DialogTitle>
        </DialogHeader>

        {fetcher.data && !fetcher.data.success && (
          <InlineAlertMessage
            alert={{
              type: fetcher.data.type || "error",
              title: fetcher.data.title || "Error",
              description: fetcher.data.description || "Please try again",
            }}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label>Username</Label>
            <Input {...register("username")} disabled={isFormDisabled} />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                disabled={isFormDisabled}
              />
              <Button
                type="button"
                variant="link"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-0 right-0"
                disabled={isFormDisabled}
              >
                {showPassword ? <Eye color="white" /> : <EyeClosed color="white" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label>Role</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isFormDisabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Superadmin">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-red-500 text-sm">{errors.role.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isFormDisabled || fetcher.state !== "idle"}
          >
            {fetcher.state === "submitting" ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}