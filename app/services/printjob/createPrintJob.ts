export async function createPrintJob({ formData }: { formData: FormData }) {
    try {
        const response = await fetch("http://localhost:5024/api/printjob/create", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            return {
                type: "success",
                title: "Print Job Created",
                description: `Print job created successfully! Reference code: ${result.referenceCode}`,
                referenceCode: result.referenceCode,
            };
        }

        return {
            type: "error",
            title: "Create Failed",
            description: `Failed to create print job: ${await response.text()}`,
        };
    } catch (err) {
        console.error("Submission error:", err);
        return {
            type: "error",
            title: "Network Error",
            description: "An error occurred while submitting the form.",
        };
    }
}
