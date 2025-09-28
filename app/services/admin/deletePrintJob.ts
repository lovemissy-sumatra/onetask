import type { AlertData } from "~/providers/AlertProvider";
import axiosClient from "~/utils/api/axiosClient";
import { extractErrorMessage } from "~/utils/formatting/extractErrorMessage";

export async function deleteJob(id: number, revalidate: () => void): Promise<AlertData> {
  try {
    await axiosClient.delete(`/api/printjob/${id}`);
    revalidate();
    return {
      type: "success",
      title: "Job Deleted",
      description: `Print job ${id} has been deleted successfully.`,
    };
  } catch (err: any) {
    return {
      type: "error",
      title: "Delete Failed",
      description: extractErrorMessage(err, "Failed to delete the print job. Please try again."),
    };
  }
}

export async function bulkDelete(ids: number[], revalidate: () => void): Promise<AlertData> {
  try {
    await axiosClient.delete("/api/printjob/bulk-delete", {
      data: { jobIds: ids },
    });
    revalidate();
    return {
      type: "success",
      title: "Jobs Deleted",
      description: `${ids.length} job${ids.length > 1 ? "s" : ""} deleted successfully.`,
    };
  } catch (err: any) {
    return {
      type: "error",
      title: "Bulk Delete Failed",
      description: extractErrorMessage(err, "Failed to delete selected jobs. Please try again."),
    };
  }
}
