"use client";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
} from "../../ui/dialog";
import { Separator } from "../../ui/separator";
import { Button } from "../../ui/button";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "../../ui/select";
import type { Row } from "@tanstack/react-table";
import type { PrintJobT } from "~/schema/PrintJob.schema";
import { getFormattedDateTime } from "~/utils/formatting/getFormattedDateTime";
import { useFetcher, useRevalidator } from "react-router";
import apiUrl from "~/utils/api/apiUrl";
import { useAlert } from "~/providers/AlertProvider";
import { useEffect, type FormEvent } from "react";

export function PrintJobDialog({ row }: { row: Row<PrintJobT> }) {
    const job = row.original;
    const fetcher = useFetcher();
    const revalidator = useRevalidator();

    const { showAlert } = useAlert();

    useEffect(() => {
        if (fetcher.data) {
            const { type, title, description } = fetcher.data;
            if (type && title && description) {
                showAlert({ type, title, description });
            }

            revalidator.revalidate();
        }
    }, [fetcher.data]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary">View</Button>
            </DialogTrigger>

            <DialogContent className="dark max-w-lg text-sm">
                <DialogTitle asChild>
                    <h1 className="text-lg font-semibold">
                        PrintJob Details: {job.referenceCode}
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
                        <fetcher.Form
                            method="post"
                            className="flex gap-2"

                        >
                            <input type="hidden" name="_action" value="updateJobStatus" />
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
                                disabled={fetcher.state !== "idle"}
                            >
                                Save
                            </Button>
                        </fetcher.Form>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h2 className="text-md font-semibold">Payment</h2>
                        <fetcher.Form method="post">
                            <input type="hidden" name="_intent" value="pay" />
                            <input type="hidden" name="jobId" value={job.id} />
                            <input type="hidden" name="_action" value="updateJobStatus" />
                            <Button
                                type="submit"
                                disabled={job.isPaid || fetcher.state !== "idle"}
                            >
                                {job.isPaid ? "Paid" : "Mark as Paid"}
                            </Button>
                        </fetcher.Form>
                    </div>

                    <Separator />

                    <div>
                        <h2 className="text-md font-semibold mb-2">printFiles</h2>
                        <ul className="space-y-2">
                            {job.printFiles?.map((file: any) => (
                                <li key={file.id} className="rounded border p-2 space-y-1">
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
                                            <span className="font-medium">Notes:</span> {file.notes}
                                        </p>
                                    )}

                                    <fetcher.Form
                                        method="post"
                                    >
                                        <input type="hidden" name="_intent" value="download" />
                                        <input type="hidden" name="fileId" value={file.id} />
                                        <input type="hidden" name="filePath" value={file.path} />
                                        <input type="hidden" name="_action" value="updateJobStatus" />
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled={!job.isPaid || fetcher.state !== "idle"}
                                            type="submit"
                                            onClick={() =>
                                                window.open(`${apiUrl}${file.path}`, "_blank")
                                            }
                                        >
                                            {file.isDownloaded ? "Downloaded" : "Download"}
                                        </Button>
                                    </fetcher.Form>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
