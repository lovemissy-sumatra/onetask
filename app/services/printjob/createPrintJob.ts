import axiosClient from "~/utils/api/axiosClient";
import { extractErrorMessage } from "~/utils/formatting/extractErrorMessage";

export async function createPrintJob({ formData }: { formData: FormData }) {
    try {
        const response = await axiosClient.post("api/printjob/create", formData, { headers: { "Content-Type": "multipart/form-data" }, });

        return {
            type: "success",
            title: "Print Job Created",
            description: `Print job created successfully! Reference code: ${response.data.referenceCode}`,
        };
    } catch (err: any) {
        if (err.response) {
            return {
                type: "error",
                title: "Create Failed",
                description: `Failed to create print job: ${extractErrorMessage(err, "Unknown error")}`,
            };
        }

        return {
            type: "error",
            title: "Network Error",
            description: "An error occurred while submitting the form.",
        };
    }
}
