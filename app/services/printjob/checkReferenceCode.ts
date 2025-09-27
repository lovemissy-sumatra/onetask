import type { PrintJobStatusT } from "~/schema/PrintJob.schema";

export async function checkReferenceCode({formData} : {formData: FormData}) {
    try {
        
        const referenceCode = formData.get("referenceCode") as string;

        if (!referenceCode) {
            return {
                success: false,
                message: "Reference code is required",
                data: null
            };
        }

        const response = await fetch(`http://localhost:5024/api/printjob/status/${referenceCode}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const printJob: PrintJobStatusT = await response.json();
            return {
                success: true,
                message: "Print job found",
                data: printJob
            };
        } else if (response.status === 404) {
            return {
                success: false,
                message: "Print job not found. Please check your reference code.",
                data: null
            };
        } else {
            const error = await response.text();
            return {
                success: false,
                message: `Error fetching print job: ${error}`,
                data: null
            };
        }
    } catch (error) {
        console.error('Status check error:', error);
        return {
            success: false,
            message: 'An error occurred while checking the status.',
            data: null
        };
    }
}