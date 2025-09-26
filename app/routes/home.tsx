import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/components/ui/select";
import { ErrorMessage } from "~/components/common/errorMessage";
import { PrintJobFormSchema, type PrintJobFormT } from "~/schema/PrintJob.schema";
import { getFormattedDateTime } from "~/utils/formatting/getFormattedDateTime";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();

    const response = await fetch('http://localhost:5024/api/printjob/create', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        message: `Print job created successfully! Reference code: ${result.referenceCode}`,
        referenceCode: result.referenceCode
      };
    } else {
      const error = await response.text();
      return {
        success: false,
        message: `Failed to create print job: ${error}`
      };
    }
  } catch (error) {
    console.error('Submission error:', error);
    return {
      success: false,
      message: 'An error occurred while submitting the form.'
    };
  }
}

export default function Home() {
  const fetcher = useFetcher<typeof action>();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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

  const { fields: files, append, remove } = useFieldArray({
    control,
    name: "printFiles",
  });

  const useDefault = watch("useDefaultOptions");
  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === "idle") {
      reset();
      setUploadedFiles([]);
    }
  }, [fetcher.data, fetcher.state, reset]);

  const onSubmit = async (data: PrintJobFormT) => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file.');
      return;
    }

    const formData = new FormData();

    formData.append('Customer.Name', data.customer.name);
    formData.append('Customer.Email', data.customer.email);

    uploadedFiles.forEach((file, index) => {
      const fileData = data.printFiles[index];
      const options = data.useDefaultOptions ? data.defaultOptions : fileData;

      formData.append(`Files[${index}].File`, file);

      formData.append(`Files[${index}].Name`, file.name);
      formData.append(`Files[${index}].Copies`, options.copies.toString());
      formData.append(`Files[${index}].IsColored`, options.isColored.toString());
      formData.append(`Files[${index}].PaperSize`, options.paperSize);
      formData.append(`Files[${index}].Notes`, fileData?.notes || '');
      formData.append(`Files[${index}].FileSize`, Math.round(file.size / (1024 * 1024)).toString());
    });

    fetcher.submit(formData, {
      method: 'POST',
      encType: 'multipart/form-data'
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);

      newFiles.forEach((file) => {
        append({
          name: file.name,
          path: URL.createObjectURL(file),
          fileSize: +(file.size / (1024 * 1024)).toFixed(2),
          copies: 1,
          isColored: false,
          paperSize: "A4",
          notes: "",
          createdAt: getFormattedDateTime({ date: new Date() })
        });
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    remove(index);
  };

  return (
    <div className="p-5 rounded-xl flex flex-col items-center bg-white/5 h-full min-h-screen">
      <h1 className="font-bold text-4xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 inline-block text-transparent bg-clip-text pb-3">
        PrintAway
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full max-w-lg">
        <div className="text-xs text-gray-500">
          Debug: Files: {uploadedFiles.length}, Form valid: {Object.keys(errors).length === 0 ? 'Yes' : 'No'}
          {Object.keys(errors).length > 0 && (
            <div>Errors: {Object.keys(errors).join(', ')}</div>
          )}
        </div>
        {fetcher.data && (
          <div className={`p-3 rounded-md ${fetcher.data.success
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
            {fetcher.data.message}
          </div>
        )}

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
        </div>

        <Label className="">Upload Files</Label>
        <div className="flex flex-col gap-1">
          <Label
            className="border border-dashed border-neutral-500 rounded-xl h-20 flex items-center justify-center cursor-pointer hover:border-neutral-400 transition-colors"
            htmlFor="uploadFiles"
          >
            Click here to upload files
          </Label>
          <Input
            type="file"
            id="uploadFiles"
            className="hidden"
            multiple
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
          <ErrorMessage message={errors.printFiles?.message as string} />

          {uploadedFiles.length > 0 && (
            <div className="text-sm text-neutral-600">
              {uploadedFiles.length} file(s) selected
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("useDefaultOptions")} />
          <Label className="">Use Default Print Options For All</Label>
        </div>

        {useDefault && files.length > 0 && (
          <div className="flex flex-col gap-2 border p-3 rounded-md">
            <h3 className="font-medium">Default Print Options</h3>

            <div className="mt-2">
              <h4 className="text-sm font-medium mb-2">Files to be printed:</h4>
              <ul className="text-sm space-y-1">
                {files.map((file, index) => (
                  <div className="flex flex-col gap-1 p-2 bg-neutral-50/5 rounded"> <li key={file.id} className="flex justify-between items-center p-2 bg-neutral-50/5 rounded">
                    <span>{file.name} ({file.fileSize}MB)</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                  <Label>Notes (optional)</Label>
                    <Input
                      {...register(`printFiles.${index}.notes`)}
                      placeholder="Notes (optional)"
                    />
                    <ErrorMessage message={errors.printFiles?.[index]?.notes?.message} /></div>

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
          files.map((file, index) => (
            <div key={file.id} className="border p-3 rounded-md flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{file.name}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="text-sm text-neutral-600">
                Size: {file.fileSize}MB
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

              <select {...register(`printFiles.${index}.paperSize`)} className="border rounded px-3 py-2">
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
                <option value="Long">Long</option>
              </select>
              <ErrorMessage message={errors.printFiles?.[index]?.paperSize?.message} />

              <Input {...register(`printFiles.${index}.notes`)} placeholder="Notes (optional)" />
            </div>
          ))}

        <button
          type="submit"
          disabled={isSubmitting || uploadedFiles.length === 0}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Print Job'}
        </button>

        <button
          type="button"
          className="bg-gray-500 text-white px-4 py-2 rounded text-sm"
        >
          Debug: Test Form Data
        </button>
      </form>
    </div>
  );
}