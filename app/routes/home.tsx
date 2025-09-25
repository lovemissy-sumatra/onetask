import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderFormSchema, type OrderFormType } from "~/schema/OrderForm.schema";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ErrorMessage } from "~/components/ui/custom/errorMessage";


export default function Home() {
  const {
    control,
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderFormType>({
    resolver: zodResolver(OrderFormSchema),
    defaultValues: {
      customer: { name: "", email: "", phoneNumber: "" },
      useDefaultOptions: true,
      defaultOptions: { copies: 1, isColored: false, paperSize: "A4" },
      files: [],
    },
  });

  const { fields: files, append, remove } = useFieldArray({
    control,
    name: "files",
  });

  const useDefault = watch("useDefaultOptions");

  const onSubmit = (data: OrderFormType) => {
    console.log("Form Data:", data);
    reset();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        append({
          name: file.name,
          path: URL.createObjectURL(file),
          fileSize: +(file.size / (1024 * 1024)).toFixed(2),
          copies: 1,
          isColored: false,
          paperSize: "A4",
          notes: "",
        });
      });
    }
  };

  return (
    <div className="p-5 /10 rounded-xl flex flex-col items-center bg-white/5 h-full min-h-screen">
      <h1 className="font-bold text-4xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 inline-block text-transparent bg-clip-text pb-3">
        PrintAway
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-lg">
        <div className="flex flex-col gap-2">
          <h2 className="font-medium">Your Information</h2>
          <Label className="">Your Name</Label>
          <Input placeholder="Juan Dela Cruz" {...register("customer.name")} />
          <ErrorMessage message={errors.customer?.name?.message} />

          <Label className="">Your Email</Label>
          <Input
            placeholder="juan.delacruz@gmail.com"
            type="email"
            {...register("customer.email")}
          />
          <ErrorMessage message={errors.customer?.email?.message} />

          <Label className="">Your Phone Number</Label>
          <Input placeholder="09123456789" {...register("customer.phoneNumber")} />
          <ErrorMessage message={errors.customer?.phoneNumber?.message} />
        </div>

        <Label className="">Upload Files</Label>
        <div className="flex flex-col gap-1">
          <Label
            className=" border border-dashed border-neutral-500 rounded-xl h-20 flex items-center justify-center cursor-pointer"
            htmlFor="uploadFiles"
          >
            Click here to upload
          </Label>
          <Input
            type="file"
            id="uploadFiles"
            className="hidden"
            multiple
            onChange={handleFileUpload}
          />
          <ErrorMessage message={errors.files?.message as string} />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("useDefaultOptions")} />
          <Label className="">Use Default Print Options For All</Label>
        </div>

        {useDefault && (
          <div className="flex flex-col gap-2 border p-3 rounded-md">
            <h3 className="font-medium">Default Print Options</h3>

            <div className="mt-2">

              <ul className="">
                {files.map((file) => (
                  <li key={file.id}>{file.name}</li>
                ))}
              </ul>
            </div>

            <h4 className="font-medium">Number of copies:</h4>
            <Input
              type="number"
              {...register("defaultOptions.copies", { valueAsNumber: true })}
              placeholder="Copies"
            />
            <ErrorMessage message={errors.defaultOptions?.copies?.message} />

            <div className="flex items-center gap-2">
              <input type="checkbox" {...register("defaultOptions.isColored")} />
              <Label>Colored</Label>
            </div>
            <ErrorMessage message={errors.defaultOptions?.isColored?.message} />

            <Controller
              control={control}
              name="defaultOptions.paperSize"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-[180px] ">
                    <SelectValue placeholder="Select paper size" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectGroup>
                      <SelectLabel>Paper Sizes</SelectLabel>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="A3">A3</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <ErrorMessage message={errors.defaultOptions?.paperSize?.message} />
          </div>
        )}

        {!useDefault &&
          files.map((file, index) => (
            <div key={file.id} className="border p-3 rounded-md flex flex-col gap-2">
              <h4 className="font-medium">{file.name}</h4>

              <h4 className="font-medium">Number of copies:</h4>
              <Input
                type="number"
                {...register(`files.${index}.copies`, { valueAsNumber: true })}
                placeholder="Copies"
              />
              <ErrorMessage message={errors.files?.[index]?.copies?.message} />


              <div className="flex items-center gap-2">
                <input type="checkbox" {...register(`files.${index}.isColored`)} />
                <Label>Colored</Label>
              </div>
              <ErrorMessage message={errors.files?.[index]?.isColored?.message} />

              <select {...register(`files.${index}.paperSize`)}>
                <option value="A4">A4</option>
                <option value="A3">A3</option>
                <option value="A2">A2</option>
                <option value="Letter">Letter</option>
              </select>
              <ErrorMessage message={errors.files?.[index]?.paperSize?.message} />

              <Input {...register(`files.${index}.notes`)} placeholder="Notes (optional)" />

              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}

        <button type="submit" className="bg-blue-500  px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}
