import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetcher, useSearchParams } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { checkReferenceCode } from "~/services/printjob/checkReferenceCode";
import { getFormattedDateTime } from "~/utils/formatting/getFormattedDateTime";
import { getStatusColor } from "~/utils/formatting/getStatusColor";
import { ReferenceCodeSchema, type PrintJobT, type ReferenceCodeFormT } from "~/schema/PrintJob.schema";
import { ErrorMessage } from "~/components/shared/InlineErrorMessage";
import { InlineAlertMessage } from "~/components/shared/InlineAlertMessage";
import { Button } from "~/components/ui/button";
import { LogoHeader } from "~/components/shared/Logo";
import type { AlertData } from "~/providers/AlertProvider";
import { updatePrintJobStatus } from "~/services/admin/updatePrintJobStatus";
import { axiosSSR } from "~/utils/api/axiosSSR";



export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("_intent");

  const client = axiosSSR(request);

  if (intent === "status" || intent === "pay" || intent === "download") {
    const result = await updatePrintJobStatus({ formData, client });

    if (result.type === "success") {
      const referenceCode = formData.get("referenceCode");
      const jobId = formData.get("jobId");

      if (referenceCode) {
        const checkFormData = new FormData();
        checkFormData.append("referenceCode", referenceCode.toString());
        return await checkReferenceCode({ formData: checkFormData });
      }

      if (jobId) {
        const res = await client.get(`/api/printjob/${jobId}`);
        return {
          type: "success",
          title: "Print Job Updated",
          description: "The status was updated successfully.",
          data: res.data,
        };
      }
    }

    return result;
  }

  return await checkReferenceCode({ formData });
}

export default function StatusChecker() {
  const fetcher = useFetcher<typeof action>();
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialReferenceCode = searchParams.get("referenceCode") || '';


  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReferenceCodeFormT>({
    resolver: zodResolver(ReferenceCodeSchema),
    defaultValues: {
      referenceCode: initialReferenceCode,
    },
  });

  const isSubmitting = fetcher.state === "submitting";
  const printJob = fetcher.data?.data as PrintJobT | null;

  useEffect(() => {
    if (initialReferenceCode) {
      onSubmit({ referenceCode: initialReferenceCode });
    }
  }, [initialReferenceCode]);

  const onSubmit = (data: ReferenceCodeFormT) => {
    const formData = new FormData();
    formData.append("referenceCode", data.referenceCode);

    fetcher.submit(formData, {
      method: 'POST',
    });

    setSearchParams({ referenceCode: data.referenceCode });

    setSearchPerformed(true);
  };

  const handleNewSearch = () => {
    setSearchParams({});
    reset({ referenceCode: "" });
    setSearchPerformed(false);
    fetcher.data = undefined;
  };

  const handleCancel = () => {
    if (!printJob) return;

    const formData = new FormData();
    formData.append("_intent", "status");
    formData.append("jobId", String(printJob.id));
    formData.append("newStatus", "Cancelled");
    formData.append("referenceCode", printJob.referenceCode);

    fetcher.submit(formData, {
      method: "POST",
    });
  };



  return (
    <div className="p-5 rounded-xl flex flex-col items-center bg-white/5 h-full min-h-screen">
      <LogoHeader context="Enter your reference code to check the status of your print job" />

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
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded transition-colors whitespace-nowrap"
              >
                {isSubmitting ? 'Checking...' : 'Check Status'}
              </Button>
            </div>
            <ErrorMessage message={errors.referenceCode?.message} />
          </div>
        </form>

        {searchPerformed && fetcher.data && (
          <div className="bg-white/10 rounded-lg p-6">
            {fetcher.data.type === 'error' && (
              <InlineAlertMessage
                alert={{
                  type: fetcher.data.type || "error",
                  title: fetcher.data.title || "Failed fetching printjob",
                  description: fetcher.data.description || "Please try again"
                }}
              />
            )}


            {fetcher.data.type === 'success' && printJob && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Print Job Details</h2>
                    <p className="text-gray-300">Reference: {printJob.referenceCode}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-sm border font-medium ${getStatusColor(printJob.status)}`}>
                    {printJob.status}
                  </div>
                </div>

                <InlineAlertMessage
                  alert={fetcher.data as AlertData}
                  printJob={printJob}
                />


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
                    printFiles ({printJob.printFiles.length} {printJob.printFiles.length === 1 ? 'file' : 'printFiles'})
                  </h3>
                  <div className="space-y-3">
                    {printJob.printFiles.map((file, index) => (
                      <div key={file.name} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{file.name}</h4>
                            <p className="text-gray-400 text-sm">Size: {file.printFilesize} MB</p>
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
                      {printJob.printFiles.reduce((total, file) => total + file.copies, 0)}
                    </span>
                  </div>
                </div>

                {printJob.status === "Pending" && (
                  <Button
                    type="button"
                    onClick={handleCancel}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 transition-colors"
                  >
                    Cancel Print Job
                  </Button>
                )}

              </div>
            )}

            <div className="mt-6 text-center">
              <Button
                onClick={handleNewSearch}
                type="button"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 transition-colors"
              >
                Check Another Reference Code
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}