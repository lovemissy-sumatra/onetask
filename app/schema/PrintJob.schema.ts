import { z } from "zod";

export const PrintFileSchema = z.object({
  name: z.string(),
  path: z.string(),
  fileSize: z.number().nonnegative(),
  copies: z.number().int().min(1),
  isColored: z.boolean(),
  paperSize: z.enum(["A4", "A3", "A2", "Letter"]),
  notes: z.string().optional(),
  createdAt: z.string(),
});

export const CustomerSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().min(1, { message: "Email is required" }).email(),
});

export const PrintJobFormSchema = z.object({
  customer: CustomerSchema,
  useDefaultOptions: z.boolean(),
  defaultOptions: z.object({
    copies: z.number({ message: "1 more or copies is required" }).int().min(1, { message: "1 more or copies is required" }),
    isColored: z.boolean(),
    paperSize: z.enum(["A4", "Letter", "Long"]),
  }),
  printFiles: z.array(PrintFileSchema).min(1, { message: "Upload at least 1 file" }),
  createdAt: z.string(),
});

export const statusEnum = z.enum(["Pending", "Processing", "Completed", "Cancelled"]);

export type PrintJobStatusT = z.infer<typeof statusEnum>;
export type PrintFileT = z.infer<typeof PrintFileSchema>;
export type PrintJobFormT = z.infer<typeof PrintJobFormSchema>;
export type PrintJobT = Omit<PrintJobFormT, "useDefaultOptions" | "defaultOptions"> & {
  id: string;
  referenceId: string;
  status: PrintJobStatusT;
  isPaid: boolean;
};[];

