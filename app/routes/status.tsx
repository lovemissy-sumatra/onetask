import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetcher } from "react-router";
import { z } from "zod";
import type { ActionFunctionArgs } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ErrorMessage } from "~/components/common/errorMessage";
import { checkReferenceCode } from "~/services/printjob/checkReferenceCode";
import { getFormattedDateTime } from "~/utils/formatting/getFormattedDateTime";
import { getStatusColor } from "~/utils/formatting/getStatusColor";
import { ReferenceCodeSchema, type PrintJobT, type ReferenceCodeFormT } from "~/schema/PrintJob.schema";


export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  return await checkReferenceCode({ formData })

}


export default function StatusChecker() {
  const fetcher = useFetcher<typeof action>();
  const [searchPerformed, setSearchPerformed] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReferenceCodeFormT>({
    resolver: zodResolver(ReferenceCodeSchema),
    defaultValues: {
      referenceCode: "",
    },
  });

  const isSubmitting = fetcher.state === "submitting";
  const printJob = fetcher.data?.data as PrintJobT | null;

  const onSubmit = (data: ReferenceCodeFormT) => {
    const formData = new FormData();
    formData.append("referenceCode", data.referenceCode);

    fetcher.submit(formData, {
      method: 'POST',
    });

    setSearchPerformed(true);
  };

  const handleNewSearch = () => {
    reset();
    setSearchPerformed(false);
    window.location.reload();
  };

  return (
    <div className="p-5 rounded-xl flex flex-col items-center bg-white/5 h-full min-h-screen">
      <h1 className="font-bold text-4xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 inline-block text-transparent bg-clip-text pb-3">
        Check Print Job Status
      </h1>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Enter your reference code to check the status of your print job
      </p>

      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <Label>Reference Code</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your reference code (e.g., PJ-ABC123)"
                {...register("referenceCode")}
                className="flex-1"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded transition-colors whitespace-nowrap"
              >
                {isSubmitting ? 'Checking...' : 'Check Status'}
              </button>
            </div>
            <ErrorMessage message={errors.referenceCode?.message} />
          </div>
        </form>

        {searchPerformed && fetcher.data && (
          <div className="bg-white/10 rounded-lg p-6">
            {!fetcher.data.success && (
              <div className="bg-red-100 text-red-700 border border-red-300 p-4 rounded-md mb-4">
                {fetcher.data.message}
              </div>
            )}

            {fetcher.data.success && printJob && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Print Job Details</h2>
                    <p className="text-gray-300">Reference: {printJob.referenceCode}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg border font-medium ${getStatusColor(printJob.status)}`}>
                    {printJob.status}
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">Customer Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Name:</span>
                      <p className="text-white font-medium">{printJob.customer.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <p className="text-white font-medium">{printJob.customer.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">Timeline</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Created:</span>
                      <p className="text-white font-medium">{getFormattedDateTime({ date: new Date(printJob.createdAt) })}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Updated:</span>
                      <p className="text-white font-medium">{getFormattedDateTime({ date: new Date(printJob.updatedAt) })}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3">
                    Files ({printJob.files.length} {printJob.files.length === 1 ? 'file' : 'files'})
                  </h3>
                  <div className="space-y-3">
                    {printJob.files.map((file, index) => (
                      <div key={file.name} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{file.name}</h4>
                            <p className="text-gray-400 text-sm">Size: {file.fileSize} MB</p>
                            {file.notes && (
                              <p className="text-gray-300 text-sm mt-1">Notes: {file.notes}</p>
                            )}
                          </div>
                          <div className="text-sm">
                            <div className="flex flex-col sm:items-end gap-1">
                              <span className="text-white font-medium">{file.copies} copies</span>
                              <div className="flex gap-2">
                                <span className={`px-2 py-1 rounded text-xs ${file.isColored ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {file.isColored ? 'Colored' : 'B&W'}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {file.paperSize}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200 font-medium">Total Copies:</span>
                    <span className="text-blue-100 font-bold text-lg">
                      {printJob.files.reduce((total, file) => total + file.copies, 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={handleNewSearch}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
              >
                Check Another Reference Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}