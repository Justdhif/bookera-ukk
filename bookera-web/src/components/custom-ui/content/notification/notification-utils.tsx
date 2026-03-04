import {
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Clock,
} from "lucide-react";

export const getNotificationIcon = (type: string | null) => {
  switch (type) {
    case "borrow_request_approved":
    case "return_approved":
    case "approved":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "borrow_request_rejected":
    case "rejected":
      return <XCircle className="h-5 w-5 text-red-600" />;
    case "borrow_request_cancelled":
      return <XCircle className="h-5 w-5 text-orange-500" />;
    case "borrow_request":
    case "borrow_request_created":
    case "return_request":
      return <FileText className="h-5 w-5 text-blue-600" />;
    case "fine_created":
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
  }
};
