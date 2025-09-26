"use client";

import { useState } from "react";
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
import type { PrintJobStatusT, PrintJobT } from "~/schema/PrintJob.schema";
import { getFormattedDateTime } from "~/utils/formatting/getFormattedDateTime";

export function PrintJobDialog({ row }: { row: Row<PrintJobT> }) {
    const [downloaded, setDownloaded] = useState<Record<number, boolean>>({});
    const [isPaid, setIsPaid] = useState(row.original.isPaid);
    const [status, setStatus] = useState<PrintJobStatusT>(row.original.status);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary">View</Button>
            </DialogTrigger>

            <DialogContent className="dark max-w-lg text-sm">
                <DialogTitle>
                    <h1 className="text-lg font-semibold">
                        PrintJob Details: {row.getValue<string>("referenceCode")}
                    </h1>
                </DialogTitle>

                <Separator />

                <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
                    <div className="space-y-2 mt-4">
                        <p>
                            <span className="font-medium">Status:</span> {status}
                        </p>
                        <p>
                            <span className="font-medium">Paid:</span>{" "}
                            {isPaid ? "Yes" : "No"}
                        </p>
                        <p>
                            <span className="font-medium">Created At:</span>
                            {getFormattedDateTime({ date: new Date(row.original.createdAt) })}
                        </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h2 className="text-md font-semibold">Customer</h2>
                        <p>
                            <span className="font-medium">Name:</span>{" "}
                            {row.original.customer.name}
                        </p>
                        <p>
                            <span className="font-medium">Email:</span>{" "}
                            {row.original.customer.email}
                        </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h2 className="text-md font-semibold">Update Status</h2>
                        <Select
                            defaultValue={status}
                            onValueChange={(val) => setStatus(val as PrintJobStatusT)}
                        >
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
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h2 className="text-md font-semibold">Payment</h2>
                        <Button
                            onClick={() => {
                                setIsPaid(true);
                            }}
                            disabled={isPaid}
                        >
                            {isPaid ? "Paid" : "Mark as Paid"}
                        </Button>
                    </div>

                    <Separator />

                    <div>
                        <h2 className="text-md font-semibold mb-2">Files</h2>
                        <ul className="space-y-2">
                            {row.original.printFiles.map((file: any) => (
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

                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        asChild
                                        disabled={!isPaid}
                                    >
                                        <a
                                            href={file.path}
                                            download
                                            onClick={() =>
                                                setDownloaded((prev) => ({
                                                    ...prev,
                                                    [file.id]: true,
                                                }))
                                            }
                                        >
                                            {downloaded[file.id] ? "Downloaded" : "Download"}
                                        </a>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
