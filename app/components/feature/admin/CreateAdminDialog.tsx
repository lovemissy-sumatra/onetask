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
import { useState } from "react";
import { useFetcher } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAdminSchema, type CreateAdminFormT } from "~/schema/CreateAdmin.schema";

export function CreateAdminDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAdminFormT>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { role: "Admin" },
  });

  const onSubmit = (data: CreateAdminFormT) => {
    const formData = new FormData();
    formData.append("_action", "createAdmin");
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("role", data.role);

    fetcher.submit(formData, { method: "post" });
  };

  if (fetcher.state === "idle" && fetcher.data?.error == null && fetcher.data != null) {
    setOpen(false);
    reset();
    onCreated(); 
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">+ Add Admin</Button>
      </DialogTrigger>
      <DialogContent className="dark">
        <DialogHeader>
          <DialogTitle>Create New Admin</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input {...register("username")} />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          <div>
            <Label>Password</Label>
            <Input type="password" {...register("password")} />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label>Role</Label>
            <select
              {...register("role")}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="Admin">Admin</option>
              <option value="Superadmin">Superadmin</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={fetcher.state !== "idle"}>
            {fetcher.state === "submitting" ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
