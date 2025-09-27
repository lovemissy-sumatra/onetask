export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Processing':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Completed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Cancelled':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};