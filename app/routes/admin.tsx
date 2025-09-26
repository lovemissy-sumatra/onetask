import { OrdersTable } from "../components/feature/OrdersTable"
import axiosClient from "~/utils/api/axiosClient"
import { useLoaderData } from "react-router"

export async function loader() {
  const printjobs = await axiosClient("/api/printjob")
  return printjobs.data.data
}

export default function Admin() {
  const printjobs  = useLoaderData();

  return (
    <div className="p-6 bg-white/5 rounded-xl h-full min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Admin PrintJobs Management</h1>
      <OrdersTable data={printjobs} />
    </div>
  )
}
