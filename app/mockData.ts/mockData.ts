import type { OrderType } from "~/schema/OrderForm.schema";

export let mockOrders: OrderType[] = [
  {
    id: "1",
    referenceId: "PJ123",
    isPaid: false,
    status: "pending",
    customer: {
      name: "Juan Dela Cruz",
      email: "juan.delacruz@gmail.com",
      phoneNumber: "09123456789",
    },
    files: [
      {
        name: "thesis.pdf",
        path: "/uploads/thesis.pdf",
        fileSize: 2.5,
        copies: 2,
        isColored: false,
        paperSize: "A4",
        notes: "Print double-sided",
      },
      {
        name: "resume.docx",
        path: "/uploads/resume.docx",
        fileSize: 0.3,
        copies: 1,
        isColored: true,
        paperSize: "Letter",
      },
    ],
  },
  {
    id: "2",
    referenceId: "PJ123",
    isPaid: true,
    status: "paid",
    customer: {
      name: "Maria Santos",
      email: "maria.santos@yahoo.com",
      phoneNumber: "",
    },
    files: [
      {
        name: "poster.png",
        path: "/uploads/poster.png",
        fileSize: 5.2,
        copies: 3,
        isColored: true,
        paperSize: "A3",
        notes: "Use glossy paper",
      },
    ],
  },
];
