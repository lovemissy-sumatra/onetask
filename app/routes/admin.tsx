import { OrdersTable } from "../components/feature/admin/OrdersTable";
import axiosClient from "~/utils/api/axiosClient";
import {
  redirect,
  useLoaderData,
  useRevalidator,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router";
import {
  FileText,
  Clock,
  CheckCircle,
  Users,
  Printer,
  RefreshCcw,
  LogOut,
} from "lucide-react";
import type { PrintJobT } from "~/schema/PrintJob.schema";
import { StatCard } from "~/components/common/StatCard";
import { calculateStats, StatusOverview } from "~/components/common/StatusOverview";
import { validateUserSession } from "~/services/auth/validateUserSession";
import { logoutUser } from "~/services/auth/logoutUser";
import { updatePrintJobStatus } from "~/services/admin/updatePrintJobStatus";

export async function loader({ request }: LoaderFunctionArgs) {
  const authResult = await validateUserSession(request);

  if (!authResult.success || !authResult.user) {
    throw redirect("/login");
  }

  try {
    const printjobs = await axiosClient.get("/api/printjob");
    return {
      user: authResult.user,
      printjobs: printjobs.data.data as PrintJobT[]
    };
  } catch (error) {
    throw redirect("/login");
  }
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const { type, title, description } = await updatePrintJobStatus({ formData })
  return { type, title, description };
}

export default function Admin() {
  const { user, printjobs } = useLoaderData() as {
    user: { username: string };
    printjobs: PrintJobT[];
  };

  const stats = calculateStats(printjobs);
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login', { replace: true });
  };

  return (
    <div className="p-6 bg-white/5 rounded-xl h-full min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 inline-block text-transparent bg-clip-text mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Welcome back, <span className="text-white font-medium">{user?.username}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => revalidator.revalidate()}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <RefreshCcw size={16} />
            Reload Data
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Jobs"
          value={stats.totalJobs}
          icon={FileText}
          color="bg-blue-500"
          subtitle="All time"
        />
        <StatCard
          title="Today's Jobs"
          value={stats.todayJobs}
          icon={Clock}
          color="bg-green-500"
          subtitle="New today"
        />
        <StatCard
          title="Unique Customers"
          value={stats.uniqueCustomers}
          icon={Users}
          color="bg-orange-500"
          subtitle="Active customers"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Number of Files"
          value={stats.totalFiles.toLocaleString()}
          icon={Printer}
          color="bg-indigo-500"
          subtitle={`${stats.coloredFiles} colored, ${stats.totalFiles - stats.coloredFiles} B&W`}
        />
        <StatCard
          title="Completion Rate"
          value={`${stats.totalJobs > 0
            ? Math.round((stats.completedJobs / stats.totalJobs) * 100)
            : 0
            }%`}
          icon={CheckCircle}
          color="bg-green-600"
          subtitle={`${stats.completedJobs} of ${stats.totalJobs} completed`}
        />
        <StatusOverview stats={stats} />
      </div>

      <div className="bg-white/10 rounded-lg border border-white/20">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">Recent Print Jobs</h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage and monitor all print jobs
          </p>
        </div>
        <div className="p-6">
          <OrdersTable data={printjobs} />
        </div>
      </div>
    </div>
  );
}