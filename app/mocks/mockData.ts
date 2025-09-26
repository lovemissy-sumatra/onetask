import type { PrintJobT } from "~/schema/PrintJob.schema";
import { getFormattedDateTime } from "~/utils/formatting/getFormattedDateTime";

export let mockOrders: PrintJobT[] = [
  {
    id: "1",
    referenceId: "PJ123",
    isPaid: false,
    status: "Pending",
    createdAt: getFormattedDateTime({ date: new Date() }),
    customer: {
      name: "Juan Dela Cruz",
      email: "juan.delacruz@gmail.com",
    },
    printFiles: [
      {
        name: "thesis.pdf",
        path: "/uploads/thesis.pdf",
        fileSize: 2.5,
        copies: 2,
        isColored: false,
        paperSize: "A4",
        notes: "Print double-sided",
        createdAt: getFormattedDateTime({ date: new Date }),
      },
      {
        name: "resume.docx",
        path: "/uploads/resume.docx",
        fileSize: 0.3,
        copies: 1,
        isColored: true,
        paperSize: "Letter",
        createdAt: getFormattedDateTime({ date: new Date }),
      },
    ],
  },
  {
    id: "2",
    referenceId: "PJ124",
    isPaid: true,
    status: "Completed",
    createdAt: getFormattedDateTime({ date: new Date() }),
    customer: {
      name: "Maria Santos",
      email: "maria.santos@yahoo.com",
    },
    printFiles: [
      {
        name: "poster.png",
        path: "/uploads/poster.png",
        fileSize: 5.2,
        copies: 3,
        isColored: true,
        paperSize: "A3",
        notes: "Use glossy paper",
         createdAt: getFormattedDateTime({date: new Date}),
      },
    ],
  },
];
