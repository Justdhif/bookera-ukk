import {
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
} from "lucide-react";

export const getNotificationIcon = (type: string | null) => {
  switch (type) {
    case "approved":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-red-600" />;
    case "borrow_request":
    case "return_request":
      return <FileText className="h-5 w-5 text-blue-600" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
  }
};
