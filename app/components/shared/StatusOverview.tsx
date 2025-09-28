import type { PrintJobT } from "~/schema/PrintJob.schema";

export const calculateStats = (printjobs: PrintJobT[]) => {
  const totalJobs = printjobs.length;
  const pendingJobs = printjobs.filter((job) => job.status === "Pending").length;
  const processingJobs = printjobs.filter((job) => job.status === "Processing").length;
  const completedJobs = printjobs.filter((job) => job.status === "Completed").length;
  const cancelledJobs = printjobs.filter((job) => job.status === "Cancelled").length;

  const totalprintFiles = printjobs.reduce(
    (sum, job) => sum + job.printFiles.length,
    0
  );
  const coloredprintFiles = printjobs.reduce(
    (sum, job) => sum + job.printFiles.filter((file) => file.isColored).length,
    0
  );

  const totalPages = printjobs.reduce(
    (sum, job) =>
      sum + job.printFiles.reduce((printFilesum, file) => printFilesum + file.copies, 0),
    0
  );
  const coloredPages = printjobs.reduce(
    (sum, job) =>
      sum +
      job.printFiles.reduce(
        (printFilesum, file) => printFilesum + (file.isColored ? file.copies : 0),
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
    const jobRevenue = job.printFiles.reduce((printFilesum, file) => {
      const pagePrice = file.isColored ? 0.25 : 0.1;
      return printFilesum + file.copies * pagePrice;
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
    totalprintFiles,
    coloredprintFiles,
  };
};

export const StatusOverview = ({ stats }: { stats: ReturnType<typeof calculateStats> }) => (
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