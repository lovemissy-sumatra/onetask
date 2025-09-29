import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { useState, useMemo } from "react"
import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { getFormattedDateTime } from "~/utils/formatting/getFormattedDateTime"
import { PrintJobDialog } from "./PrintJobDialog"
import type { PaymentStatusT, PrintJobT } from "~/schema/PrintJob.schema"
import { useAlert } from "~/providers/AlertProvider"
import { Trash2, Trash } from "lucide-react"
import { extractErrorMessage } from "~/utils/formatting/extractErrorMessage"

interface OrdersTableProps {
  data: PrintJobT[]
  onDelete: (id: number) => void
  onBulkDelete: (ids: number[]) => void
}

export function OrdersTable({ data, onDelete, onBulkDelete }: OrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const { showAlert } = useAlert()

  const columns = useMemo<ColumnDef<PrintJobT>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-gray-300"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
        />
      ),
    },
    {
      accessorKey: "referenceCode",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Reference
        </Button>
      ),
    },
    {
      accessorKey: "customer.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Customer
        </Button>
      ),
    },
    {
      accessorKey: "customer.email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Email
        </Button>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <span
            className={`px-2 py-1 rounded text-xs ${status === "paid"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
              }`}
          >
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as PaymentStatusT;

        switch (status) {
          case "Paid":
            return <span className="text-green-600 font-medium">Paid</span>;
          case "Unpaid":
            return <span className="text-red-600 font-medium">Unpaid</span>;
          case "Refunded":
            return <span className="text-yellow-600 font-medium">Refunded</span>;
          default:
            return <span className="text-gray-500 font-medium">{status}</span>;
        }
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Date
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue<string>("createdAt")
        return getFormattedDateTime({ date })
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const job = row.original
        return (
          <div className="flex items-center gap-2">
            <PrintJobDialog row={row} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSingleDelete(job.id, job.referenceCode)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )
      },
    },
  ], [])

  const memoizedData = useMemo(() => data, [data])
   const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data: memoizedData,
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
  })

  const handleSingleDelete = async (id: string, referenceCode: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete print job ${referenceCode}? This action cannot be undone.`
    )

    if (confirmed) {
      try {
        await onDelete(Number(id))
        showAlert({
          type: "success",
          title: "Job Deleted",
          description: `Print job ${referenceCode} has been deleted successfully.`
        })
      } catch (error) {
        showAlert({
          type: "error",
          title: "Delete Failed",
          description: extractErrorMessage(error, "Failed to delete the print job. Please try again.")
        })
      }
    }
  }

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const selectedIds = selectedRows.map(row => Number(row.original.id))
    const selectedReferenceCodes = selectedRows.map(row => row.original.referenceCode)

    if (selectedIds.length === 0) {
      showAlert({
        type: "warning",
        title: "No Selection",
        description: "Please select at least one job to delete."
      })
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} print job${selectedIds.length > 1 ? 's' : ''}?\n\nJobs to delete:\n${selectedReferenceCodes.join(', ')}\n\nThis action cannot be undone.`
    )

    if (confirmed) {
      try {
        await onBulkDelete(selectedIds)
        setRowSelection({})
        showAlert({
          type: "success",
          title: "Jobs Deleted",
          description: `${selectedIds.length} print job${selectedIds.length > 1 ? 's' : ''} deleted successfully.`
        })
      } catch (error) {
        showAlert({
          type: "error",
          title: "Bulk Delete Failed",
          description: "Failed to delete selected jobs. Please try again."
        })
      }
    }
  }

  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <div>
       <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search orders..."
          className="border rounded px-3 py-2 w-1/3"
        />
      </div>
      {selectedRowsCount > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-blue-700 font-medium">
            {selectedRowsCount} job{selectedRowsCount > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="flex items-center gap-2"
          >
            <Trash size={16} />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-white">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={row.getIsSelected() ? "bg-red-500" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center py-4">
        <div className="text-sm text-gray-600">
          {selectedRowsCount > 0 && (
            <span>
              {selectedRowsCount} of {table.getFilteredRowModel().rows.length} row(s) selected
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
