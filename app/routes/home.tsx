import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Link, useFetcher } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/components/ui/select";
import { PrintJobFormSchema, type PrintJobFormT } from "~/schema/PrintJob.schema";
import { createPrintJob } from "~/services/printjob/createPrintJob";
import { useFileManager } from "~/hooks/useFileManager";
import { ErrorMessage } from "~/components/shared/InlineErrorMessage";
import { InlineAlertMessage } from "../components/shared/InlineAlertMessage";
import type { AlertData } from "~/providers/AlertProvider";
import { Button } from "~/components/ui/button";
import { LogoHeader } from "~/components/shared/Logo";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { type, description, referenceCode } = await createPrintJob({ formData })
  return { type, description, referenceCode }
}

export default function Home() {
  const fetcher = useFetcher<typeof action>();

  const {
    control,
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrintJobFormT>({
    resolver: zodResolver(PrintJobFormSchema),
    defaultValues: {
      customer: { name: "", email: "" },
      useDefaultOptions: true,
      defaultOptions: { copies: 1, isColored: false, paperSize: "A4" },
      printFiles: [],
      createdAt: new Date().toISOString(),
    },
  });

  const { fields: printFiles, append, remove } = useFieldArray({
    control,
    name: "printFiles",
  });

  const { addFile, removeFile, uploadedprintFiles, setUploadedprintFiles } = useFileManager(append, remove);

  const useDefault = watch("useDefaultOptions");
  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data?.type === 'success' && fetcher.state === "idle") {
      reset();
      setUploadedprintFiles([]);
    }
  }, [fetcher.data, fetcher.state, reset]);

  const onSubmit = async (data: PrintJobFormT) => {
    if (uploadedprintFiles.length === 0) {
      alert('Please upload at least one file.');
      return;
    }

    const formData = new FormData();

    formData.append('Customer.Name', data.customer.name);
    formData.append('Customer.Email', data.customer.email);

    uploadedprintFiles.forEach((file, index) => {
      const fileData = data.printFiles[index];
      const options = data.useDefaultOptions ? data.defaultOptions : fileData;

      formData.append(`printFiles[${index}].File`, file);

      formData.append(`printFiles[${index}].Name`, file.name);
      formData.append(`printFiles[${index}].Copies`, options.copies.toString());
      formData.append(`printFiles[${index}].IsColored`, options.isColored.toString());
      formData.append(`printFiles[${index}].PaperSize`, options.paperSize);
      formData.append(`printFiles[${index}].Notes`, fileData?.notes || '');
      formData.append(`printFiles[${index}].printFilesize`, Math.round(file.size / (1024 * 1024)).toString());
    });

    fetcher.submit(formData, {
      method: 'POST',
      encType: 'multipart/form-data'
    });
  };

  return (
    <div className="p-5 rounded-xl flex flex-col items-center bg-white/5 h-full min-h-screen">
      <LogoHeader context="" />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-lg">
        <div className="text-xs text-gray-500">

        </div>
        {fetcher.data && (
          <InlineAlertMessage
            alert={fetcher.data as AlertData}
          />
        )}

        <div className="flex flex-col gap-2">
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
        </div>

        <Label className="">Upload printFiles</Label>
        <div className="flex flex-col gap-1">
          <Label
            className="border border-dashed border-neutral-500 rounded-xl h-20 flex items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors"
            htmlFor="uploadprintFiles"
          >
            Click here to upload printFiles
          </Label>
          <Input
            type="file"
            id="uploadprintFiles"
            className="hidden"
            multiple
            onChange={addFile}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
          <ErrorMessage message={errors.printFiles?.message || errors.printFiles?.root?.message} />


          {uploadedprintFiles.length > 0 && (
            <div className="text-sm text-neutral-600">
              {uploadedprintFiles.length} file(s) selected
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("useDefaultOptions")} />
          <Label className="">Use Default Print Options For All</Label>
        </div>

        {useDefault && printFiles.length > 0 && (
          <div className="flex flex-col gap-2 border p-3 rounded-md">
            <h3 className="font-medium">Default Print Options</h3>

            <div className="mt-2">
              <h4 className="text-sm font-medium mb-2">printFiles to be printed:</h4>
              <ul className="text-sm space-y-1">
                {printFiles.map((file, index) => (
                  <div key={file.id} className="flex flex-col gap-1 p-2 bg-neutral-50/5 rounded">
                    <div className="flex justify-between items-center p-2 bg-neutral-50/5 rounded">
                      <span>{file.name} ({file.printFilesize}MB)</span>
                      <Button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </Button>
                    </div>
                    <Label>Notes (optional)</Label>
                    <Input
                      {...register(`printFiles.${index}.notes`)}
                      placeholder="Notes (optional)"
                    />
                    <ErrorMessage message={errors.printFiles?.[index]?.notes?.message} />
                  </div>
                ))}
              </ul>
            </div>

            <h4 className="font-medium">Number of copies:</h4>
            <Input
              type="number"
              min="1"
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
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select paper size" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectGroup>
                      <SelectLabel>Paper Sizes</SelectLabel>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="Long">Long</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <ErrorMessage message={errors.defaultOptions?.paperSize?.message} />
          </div>
        )}

        {!useDefault &&
          printFiles.map((file, index) => {
            const currentPaperSize = watch(`printFiles.${index}.paperSize`);

            return (
              <div key={file.id} className="border p-3 rounded-md flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{file.name}</h4>
                  <Button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </Button>
                </div>

                <div className="text-sm text-neutral-600">
                  Size: {file.printFilesize}MB | Paper Size: {currentPaperSize || 'Not set'}
                </div>

                <h4 className="font-medium">Number of copies:</h4>
                <Input
                  type="number"
                  min="1"
                  {...register(`printFiles.${index}.copies`, { valueAsNumber: true })}
                  placeholder="Copies"
                />
                <ErrorMessage message={errors.printFiles?.[index]?.copies?.message} />

                <div className="flex items-center gap-2">
                  <input type="checkbox" {...register(`printFiles.${index}.isColored`)} />
                  <Label>Colored</Label>
                </div>
                <ErrorMessage message={errors.printFiles?.[index]?.isColored?.message} />

                <Controller
                  control={control}
                  name={`printFiles.${index}.paperSize`}
                  render={({ field }) => {
                    return (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select paper size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Paper Sizes</SelectLabel>
                            <SelectItem value="A4">A4</SelectItem>
                            <SelectItem value="Letter">Letter</SelectItem>
                            <SelectItem value="Long">Long</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    );
                  }}
                />

                <ErrorMessage message={errors.printFiles?.[index]?.paperSize?.message} />

                <Input {...register(`printFiles.${index}.notes`)} placeholder="Notes (optional)" />
              </div>
            );
          })}

        <Button
          type="submit"
          disabled={isSubmitting || uploadedprintFiles.length === 0}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Print Job'}
        </Button>

        <Button asChild className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 transition-colors w-auto">
          <Link to={fetcher.data?.referenceCode ? `/status?referenceCode=${fetcher.data.referenceCode}` : "/status"} target="_blank">
            {fetcher?.data?.referenceCode ? 'View status' : 'Check Reference Code'}
          </Link>
        </Button>

      </form>
    </div>
  );
}