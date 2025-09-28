import { OrdersTable } from "../components/feature/admin/OrdersTable";
import axiosClient, { setSSRRequestCookies } from "~/utils/api/axiosClient";
import {
  redirect,
  useLoaderData,
  useRevalidator,
  useNavigate,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
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
import { StatCard } from "~/components/shared/StatCard";
import { calculateStats, StatusOverview } from "~/components/shared/StatusOverview";
import { validateUserSession } from "~/services/auth/validateUserSession";
import { logoutUser } from "~/services/auth/logoutUser";
import { updatePrintJobStatus } from "~/services/admin/updatePrintJobStatus";
import { bulkDelete, deleteJob } from "~/services/admin/deletePrintJob";
import { AdminsTable } from "~/components/feature/admin/AdminsTable";
import { axiosSSR } from "~/utils/api/axiosSSR";

export async function loader({ request }: LoaderFunctionArgs) {

  const { user, success } = await validateUserSession(request);
  if (!user) {
    throw redirect("/login");
  }

  const client = axiosSSR(request);

  try {
    const allJobs = await client.get("/api/printjob");
    const jobs = allJobs.data.data as PrintJobT[];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1);

    const recentJobs = jobs.filter((job) => new Date(job.createdAt) >= cutoff);
    const olderJobs = jobs.filter((job) => new Date(job.createdAt) < cutoff);

    let admins: any[] = [];
    if (user?.role === "Superadmin") {
      const res = await client.get("/api/admin");
      admins = res.data;
    }

    return {
      user: user,
      recentJobs,
      olderJobs,
      admins,
    };
  } catch (error) {
    throw redirect("/login");
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const _action = formData.get("_action");

  if (_action === "createAdmin") {
    const username = formData.get("username");
    const password = formData.get("password");
    const role = formData.get("role") || "Admin";

    try {
      const client = axiosSSR(request);
      const res = await client.post("/api/admin", { username, password, role });
    } catch (error: any) {
      return { error: "Could not create admin", status: error?.response?.status };
    }
  }

  if (_action === "updateJobStatus") {
    const { type, title, description } = await updatePrintJobStatus({ formData });
    return { type, title, description };
  }

  return { error: "Unknown action" };
}


export default function Admin() {
  const { user, recentJobs, olderJobs, admins } = useLoaderData() as {
    user: { username: string; role: string };
    recentJobs: PrintJobT[];
    olderJobs: PrintJobT[];
    admins: any[];
  }

  const stats = calculateStats([...recentJobs, ...olderJobs]);
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login", { replace: true });
  };

  return (
    <div className="p-6 bg-white/5 rounded-xl h-full min-h-screen">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 inline-block text-transparent bg-clip-text mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">
            Welcome back,{" "}
            <span className="text-white font-medium">{user?.username}</span>
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
          value={stats.totalprintFiles.toLocaleString()}
          icon={Printer}
          color="bg-indigo-500"
          subtitle={`${stats.coloredprintFiles} colored, ${stats.totalprintFiles - stats.coloredprintFiles
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


      <div className="bg-white/10 rounded-lg border border-white/20 mb-8">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">Recent Print Jobs</h2>
          <p className="text-gray-400 text-sm mt-1">
            Jobs created in the last 24 hours
          </p>
        </div>
        <div className="p-6">
          <OrdersTable
            data={recentJobs}
            onDelete={(id) => deleteJob(id, revalidator.revalidate)}
            onBulkDelete={(ids) => bulkDelete(ids, revalidator.revalidate)}
          />
        </div>
      </div>

      <div className="bg-white/10 rounded-lg border border-white/20 mb-8">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">Older Print Jobs</h2>
          <p className="text-gray-400 text-sm mt-1">
            Jobs older than 1 day (safe to delete/archive)
          </p>
        </div>
        <div className="p-6">
          <OrdersTable
            data={olderJobs}
            onDelete={(id) => deleteJob(id, revalidator.revalidate)}
            onBulkDelete={(ids) => bulkDelete(ids, revalidator.revalidate)}
          />
        </div>
      </div>

      <div className="bg-white/10 rounded-lg border border-white/20">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">Admins</h2>
          <p className="text-gray-400 text-sm mt-1">
            View, Create Admin here
          </p>
        </div>
        <div className="p-6">
          {user.role === "Superadmin" && <AdminsTable data={admins} />}
        </div>
      </div>


    </div>
  );
}
