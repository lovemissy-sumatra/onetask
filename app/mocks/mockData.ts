import type { PrintJobT } from "~/schema/PrintJob.schema";
import { getFormattedDateTime } from "~/utils/formatting/getFormattedDateTime";

export let mockOrders: PrintJobT[] = [
  {
    id: "1",
    referenceCode: "PJ123",
    paymentStatus: "Unpaid",
    status: "Pending",
    createdAt: getFormattedDateTime({ date: new Date() }),
    updatedAt: new Date(),
    customer: {
      name: "Juan Dela Cruz",
      email: "juan.delacruz@gmail.com",
    },
    printFiles: [
      {
        name: "thesis.pdf",
        path: "/uploads/thesis.pdf",
        printFilesize: 2.5,
        copies: 2,
        isColored: false,
        paperSize: "A4",
        notes: "Print double-sided",
        createdAt: getFormattedDateTime({ date: new Date }),

        isDownloaded: false,
      },
      {
        name: "resume.docx",
        path: "/uploads/resume.docx",
        printFilesize: 0.3,
        copies: 1,
        isColored: true,
        paperSize: "Letter",
        createdAt: getFormattedDateTime({ date: new Date }),
        isDownloaded: false,
      },
    ],
  },
  {
    id: "2",
    referenceCode: "PJ124",
    paymentStatus: "Paid",
    status: "Completed",
    createdAt: getFormattedDateTime({ date: new Date() }),
    updatedAt: new Date(),
    customer: {
      name: "Maria Santos",
      email: "maria.santos@yahoo.com",
    },
    printFiles: [
      {
        name: "poster.png",
        path: "/uploads/poster.png",
        printFilesize: 5.2,
        copies: 3,
        isColored: true,
        paperSize: "A4",
        notes: "Use glossy paper",
        createdAt: getFormattedDateTime({ date: new Date }),

        isDownloaded: false,
      },
    ],
  },
];
