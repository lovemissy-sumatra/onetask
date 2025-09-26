"use client";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "../ui/select";
import type { Row } from "@tanstack/react-table";
import type { PrintJobT } from "~/schema/PrintJob.schema";
import { getFormattedDateTime } from "~/utils/formatting/getFormattedDateTime";
import { useNavigation, useRevalidator } from "react-router";

export function PrintJobDialog({ row }: { row: Row<PrintJobT> }) {
    const job = row.original;
    const navigation = useNavigation();
    const revalidator = useRevalidator();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary">View</Button>
            </DialogTrigger>

            <DialogContent className="dark max-w-lg text-sm">
                <DialogTitle asChild>
                    <h1 className="text-lg font-semibold">
                        PrintJob Details: {job.referenceId}
                    </h1>
                </DialogTitle>

                <Separator />

                <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">

                    <div className="space-y-2 mt-4">
                        <p>
                            <span className="font-medium">Status:</span> {job.status}
                        </p>
                        <p>
                            <span className="font-medium">Paid:</span>{" "}
                            {job.isPaid ? "Yes" : "No"}
                        </p>
                        <p>
                            <span className="font-medium">Created At:</span>{" "}
                            {getFormattedDateTime({ date: new Date(job.createdAt) })}
                        </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h2 className="text-md font-semibold">Update Status</h2>
                        <form method="post">
                            <input type="hidden" name="_intent" value="status" />
                            <input type="hidden" name="jobId" value={job.id} />
                            <Select name="status" defaultValue={job.status}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Processing">Processing</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                type="submit"
                                className="ml-2"
                                disabled={navigation.state === "submitting"}
                            >
                                Save
                            </Button>
                        </form>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h2 className="text-md font-semibold">Payment</h2>
                        <form method="post">
                            <input type="hidden" name="_intent" value="pay" />
                            <input type="hidden" name="jobId" value={job.id} />
                            <Button
                                type="submit"
                                disabled={job.isPaid || navigation.state === "submitting"}
                            >
                                {job.isPaid ? "Paid" : "Mark as Paid"}
                            </Button>
                        </form>
                    </div>

                    <Separator />

                    <div>
                        <h2 className="text-md font-semibold mb-2">Files</h2>
                        <ul className="space-y-2">
                            {job.printFiles.map((file: any) => (
                                <li
                                    key={file.id}
                                    className="rounded border p-2 space-y-1"
                                >
                                    <p>
                                        <span className="font-medium">File:</span> {file.name}
                                    </p>
                                    <p>
                                        <span className="font-medium">Paper Size:</span>{" "}
                                        {file.paperSize}
                                    </p>
                                    <p>
                                        <span className="font-medium">Copies:</span> {file.copies}
                                    </p>
                                    <p>
                                        <span className="font-medium">Colored:</span>{" "}
                                        {file.isColored ? "Yes" : "No"}
                                    </p>
                                    {file.notes && (
                                        <p>
                                            <span className="font-medium">Notes:</span>{" "}
                                            {file.notes}
                                        </p>
                                    )}

                                    <form method="post" target="_blank" onSubmit={() => {
                                        setTimeout(() => revalidator.revalidate(), 500); 
                                    }}>
                                        <input type="hidden" name="_intent" value="download" />
                                        <input type="hidden" name="fileId" value={file.id} />
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled={!job.isPaid}
                                            type="submit"
                                        >
                                            {file.isDownloaded ? "Downloaded" : "Download"}
                                        </Button>
                                    </form>

                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
