import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`flex items-center p-4 text-red-700 bg-red-50 border border-red-200 rounded-md ${className}`}>
      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
};

export default ErrorMessage;