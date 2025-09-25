import { z } from "zod";

export const FileSchema = z.object({
  name: z.string(),
  path: z.string(),
  fileSize: z.number().nonnegative(),
  copies: z.number().int().min(1),
  isColored: z.boolean(),
  paperSize: z.enum(["A4", "A3", "A2", "Letter"]),
  notes: z.string().optional(),
});

export const CustomerSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().min(1, { message: "Email is required" }).email(),
  phoneNumber: z
    .string()
    .regex(/^\d{11}$/, { message: "Phone must be exactly 11 digits" })
    .optional()
    .or(z.literal("")),
});

export const OrderFormSchema = z.object({
  customer: CustomerSchema,
  useDefaultOptions: z.boolean(),
  defaultOptions: z.object({
    copies: z.number({ message: "1 more or copies is required" }).int().min(1, { message: "1 more or copies is required" }),
    isColored: z.boolean(),
    paperSize: z.enum(["A4", "Letter", "Long"]),
  }),
  files: z.array(FileSchema).min(1, { message: "Upload at least 1 file" }),
});

export type OrderFormType = z.infer<typeof OrderFormSchema>;
export type OrderType = Omit<OrderFormType, "useDefaultOptions" | "defaultOptions"> & {
  id: string;
  referenceId: string;
  status: 'pending' | 'paid';
  isPaid: boolean;
};[];

