import { ProcessingStatus } from "@/lib/processing/types";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface ProcessingStatusBadgeProps {
  status: ProcessingStatus;
}

export function ProcessingStatusBadge({ status }: ProcessingStatusBadgeProps) {
  switch (status) {
    case "processing":
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Processing
        </Badge>
      );
    case "success":
      return (
        <Badge variant="default" className="gap-1 bg-green-500">
          <CheckCircle2 className="h-3 w-3" /> Done
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" /> Error
        </Badge>
      );
    case "unsupported":
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertTriangle className="h-3 w-3" /> Unsupported
        </Badge>
      );
    default:
      return null;
  }
}