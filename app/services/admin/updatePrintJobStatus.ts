import type { AxiosInstance } from "axios";
import { extractErrorMessage } from "~/utils/formatting/extractErrorMessage";

type UpdatePrintJobStatusT = {
    formData: FormData;
    client: AxiosInstance;
};

export async function updatePrintJobStatus({
    formData,
    client
}: UpdatePrintJobStatusT) {
    const intent = formData.get("_intent") as "status" | "pay" | "download" | null;
    const jobId = formData.get("jobId") as string | null;
    const filePath = formData.get("filePath") as string | null;


    if (!intent) {
        return {
            type: "error",
            title: "Invalid Request",
            description: "Missing or invalid intent value.",
        };
    }

    try {
        let res;
        switch (intent) {
            case "status": {
                const status = formData.get("status");
                if (!status) {
                    return {
                        type: "error",
                        title: "Missing Status",
                        description: "You must provide a status value.",
                    };
                }
                res = await client.put(
                    `/api/printjob/${Number(jobId)}/status`,
                    JSON.stringify(status)
                );
                break;
            }

            case "pay": {
                if (!jobId) {
                    return {
                        type: "error",
                        title: "Missing Job ID",
                        description: "Cannot update payment without a jobId.",
                    };
                }
                res = await client.put(`/api/printjob/${jobId}/pay`);
                break;
            }

            case "download": {
                if (!filePath) {
                    return {
                        type: "error",
                        title: "Missing File Path",
                        description: "Cannot update download without a file path.",
                    };
                }
                const fileId = formData.get("fileId") as string;
                res = await client.put(`/api/printfile/${fileId}/downloaded`);
                break;
            }
        }

        return {
            type: "success",
            title: "Update Successful",
            description: `Print job ${intent} update completed successfully.`,
            data: res?.data,
        };
    } catch (error: any) {
        console.error("Update failed:", error);
        return {
            type: "error",
            title: "Update Failed",
            description: extractErrorMessage(error, "Unknown error")
        };
    }
}
