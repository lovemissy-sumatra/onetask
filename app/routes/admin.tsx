import { useState } from "react"
import { mockOrders } from "~/data/mockData"
import type { OrderType } from "~/schema/OrderForm.schema"
import { OrdersTable } from "./OrdersTable"

export default function Admin() {
  const [orders, setOrders] = useState<OrderType[]>(mockOrders)

  return (
    <div className="p-6 bg-white/5 rounded-xl h-full min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Admin Order Management</h1>
      <OrdersTable data={orders} />
    </div>
  )
}
