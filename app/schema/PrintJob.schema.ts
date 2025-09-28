import { z } from "zod";

export const PrintprintFileschema = z.object({
  name: z.string(),
  path: z.string(),
  printFilesize: z.number().nonnegative(),
  copies: z.number().int().min(1),
  isColored: z.boolean(),
  isDownloaded: z.boolean(),
  paperSize: z.enum(["A4", "Long", "Letter"]),
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
    copies: z.number().int().min(1, { message: "1 or more copies is required" }),
    isColored: z.boolean(),
    paperSize: z.enum(["A4", "Letter", "Long"]),
  }),
  printFiles: z.array(PrintprintFileschema).min(1, { message: "Upload at least 1 file" }),
  createdAt: z.string(),
});

export const statusEnum = z.enum(["Pending", "Processing", "Completed", "Cancelled"]);

export const PrintJobSchema = PrintJobFormSchema.omit({
  useDefaultOptions: true,
  defaultOptions: true,
}).extend({
  id: z.string(),
  referenceCode: z.string(),
  status: statusEnum,
  isPaid: z.boolean(),
  updatedAt: z.date(),
});

export type PrintJobStatusT = z.infer<typeof statusEnum>;
export type PrintFileT = z.infer<typeof PrintprintFileschema>;
export type PrintJobFormT = z.infer<typeof PrintJobFormSchema>;
export type PrintJobT = z.infer<typeof PrintJobSchema>;

export const ReferenceCodeSchema = PrintJobSchema.pick({
  referenceCode: true,
});

export type ReferenceCodeFormT = z.infer<typeof ReferenceCodeSchema>;
