import axiosClient from "~/utils/api/axiosClient";
import { extractErrorMessage } from "~/utils/formatting/extractErrorMessage";

export async function checkReferenceCode({ formData }: { formData: FormData }) {
    try {
        const referenceCode = formData.get("referenceCode") as string;
        if (!referenceCode) {
            return {
                type: "error",
                title: "Missing Reference Code",
                description: "Reference code is required.",
                data: null,
            };
        }

        const response = await axiosClient.get(`api/printjob/status/${referenceCode}`);

        return {
            type: "success",
            title: "Print Job Found",
            description: `Print job with reference code ${referenceCode} was found.`,
            data: response.data,
        };
    } catch (err: any) {
        if (err.response) {
            if (err.response.status === 404) {
                return {
                    type: "error",
                    title: "Not Found",
                    description: "Print job not found. Please check your reference code.",
                    data: null,
                };
            }

            return {
                type: "error",
                title: "Request Failed",
                description: `Error fetching print job: ${extractErrorMessage(err, "Unknown error")}`,
                data: null,
            };
        }

        return {
            type: "error",
            title: "Network Error",
            description: "An error occurred while checking the status.",
            data: null,
        };
    }
}
