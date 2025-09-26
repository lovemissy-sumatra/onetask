import { OrdersTable } from "../components/feature/OrdersTable";
import axiosClient from "~/utils/api/axiosClient";
import {
  redirect,
  useLoaderData,
  useRevalidator,
  Form,
  useSubmit,
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
import { validateUserSession } from "~/utils/auth/validateUserSession";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await validateUserSession(request);
  if (!user) return redirect("/login");

  const printjobs = await axiosClient("/api/printjob");
  return { user, printjobs: printjobs.data.data as PrintJobT[] };
}

const calculateStats = (printjobs: PrintJobT[]) => {
  const totalJobs = printjobs.length;
  const pendingJobs = printjobs.filter((job) => job.status === "Pending").length;
  const processingJobs = printjobs.filter((job) => job.status === "Processing").length;
  const completedJobs = printjobs.filter((job) => job.status === "Completed").length;
  const cancelledJobs = printjobs.filter((job) => job.status === "Cancelled").length;

  const totalFiles = printjobs.reduce(
    (sum, job) => sum + job.printFiles.length,
    0
  );
  const coloredFiles = printjobs.reduce(
    (sum, job) => sum + job.printFiles.filter((file) => file.isColored).length,
    0
  );

  const totalPages = printjobs.reduce(
    (sum, job) =>
      sum + job.printFiles.reduce((fileSum, file) => fileSum + file.copies, 0),
    0
  );
  const coloredPages = printjobs.reduce(
    (sum, job) =>
      sum +
      job.printFiles.reduce(
        (fileSum, file) => fileSum + (file.isColored ? file.copies : 0),
        0
      ),
    0
  );

  const uniqueCustomers = new Set(printjobs.map((job) => job.customer.email)).size;

  const today = new Date().toDateString();
  const todayJobs = printjobs.filter(
    (job) => new Date(job.createdAt).toDateString() === today
  ).length;

  const revenue = printjobs.reduce((sum, job) => {
    const jobRevenue = job.printFiles.reduce((fileSum, file) => {
      const pagePrice = file.isColored ? 0.25 : 0.1;
      return fileSum + file.copies * pagePrice;
    }, 0);
    return sum + jobRevenue;
  }, 0);

  return {
    totalJobs,
    pendingJobs,
    processingJobs,
    completedJobs,
    cancelledJobs,
    totalPages,
    coloredPages,
    uniqueCustomers,
    todayJobs,
    revenue: revenue.toFixed(2),
    totalFiles,
    coloredFiles,
  };
};

const StatusOverview = ({ stats }: { stats: ReturnType<typeof calculateStats> }) => (
  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
    <h3 className="text-lg font-semibold text-white mb-4">Job Status Overview</h3>
    <div className="space-y-3">
      {[
        { label: "Pending", value: stats.pendingJobs, color: "bg-yellow-500" },
        { label: "Processing", value: stats.processingJobs, color: "bg-blue-500" },
        { label: "Completed", value: stats.completedJobs, color: "bg-green-500" },
        { label: "Cancelled", value: stats.cancelledJobs, color: "bg-red-500" },
      ].map((item) => (
        <div key={item.label} className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-3 h-3 ${item.color} rounded-full mr-3`} />
            <span className="text-gray-300">{item.label}</span>
          </div>
          <span className="text-white font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function Admin() {
  const { user, printjobs } = useLoaderData() as {
    user: { username: string };
    printjobs: PrintJobT[];
  };

  const stats = calculateStats(printjobs);
  const revalidator = useRevalidator();
  const submit = useSubmit();

  return (
    <div className="p-6 bg-white/5 rounded-xl h-full min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 inline-block text-transparent bg-clip-text mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Welcome back, <span className="text-white font-medium">{user.username}</span>
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
          <form method="post" action="/logout">
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Logout
            </button>
          </form>
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
          subtitle={`${stats.coloredFiles} colored, ${stats.totalFiles - stats.coloredFiles
            } B&W`}
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
