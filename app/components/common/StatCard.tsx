export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string; 
  subtitle?: string;
}) => (
  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-300 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);