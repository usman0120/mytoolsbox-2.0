import { ProcessingStatus } from "@/lib/processing/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UI_COPY } from "@/lib/ui-copy";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Ban,
  Clock,
  ShieldAlert,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Human-readable labels & icons for all 8 processing states
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  ProcessingStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  idle: {
    label: "Ready",
    icon: Clock,
    variant: "outline",
  },
  uploading: {
    label: "Uploading",
    icon: Upload,
    variant: "secondary",
    className: "animate-pulse",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    variant: "secondary",
    className: "animate-spin",
  },
  success: {
    label: "Done",
    icon: CheckCircle2,
    variant: "default",
    className: "bg-green-500 hover:bg-green-500",
  },
  error: {
    label: "Error",
    icon: XCircle,
    variant: "destructive",
  },
  cancelled: {
    label: "Cancelled",
    icon: Ban,
    variant: "secondary",
  },
  unsupported: {
    label: "Unsupported",
    icon: AlertTriangle,
    variant: "secondary",
  },
  "limit-exceeded": {
    label: "Limit Exceeded",
    icon: ShieldAlert,
    variant: "destructive",
  },
};

// ---------------------------------------------------------------------------
// User-friendly error messages for each state
// ---------------------------------------------------------------------------

const STATUS_MESSAGES: Record<ProcessingStatus, string> = {
  idle: "Ready to process",
  uploading: "Uploading your file...",
  processing: "Processing your file. This may take a moment.",
  success: "Your file has been processed successfully!",
  error: "Something went wrong. Please try again.",
  cancelled: "Processing was cancelled.",
  unsupported: "This file type is not supported yet.",
  "limit-exceeded": "You've reached the processing limit. Try a smaller input or check your available credits.",
};

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

interface ProcessingStatusBadgeProps {
  status: ProcessingStatus;
}

export function ProcessingStatusBadge({ status }: ProcessingStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const { t } = UI_COPY;
  if (!config) return null;

  const Icon = config.icon;
  const isSpinner = status === "processing";

  const statusKeyMap: Record<ProcessingStatus, string> = {
    idle: "status_ready",
    uploading: "status_uploading",
    processing: "status_processing",
    success: "status_done",
    error: "status_error",
    cancelled: "status_cancelled",
    unsupported: "status_unsupported",
    "limit-exceeded": "status_limit_exceeded",
  };

  const label = statusKeyMap[status] ? t(statusKeyMap[status] as any, config.label) : config.label;

  return (
    <Badge variant={config.variant} className={cn("gap-1", config.className)}>
      <Icon className={cn("h-3 w-3", isSpinner && "animate-spin")} />
      {label}
    </Badge>
  );
}

interface ProcessingStatusMessageProps {
  status: ProcessingStatus;
  customMessage?: string;
}

export function ProcessingStatusMessage({
  status,
  customMessage,
}: ProcessingStatusMessageProps) {
  const message = customMessage ?? STATUS_MESSAGES[status] ?? "";

  if (!message) return null;

  const isError = status === "error" || status === "limit-exceeded";
  const isSuccess = status === "success";

  return (
    <p
      className={cn(
        "text-sm mt-2",
        isError && "text-destructive",
        isSuccess && "text-green-600 dark:text-green-400",
        !isError && !isSuccess && "text-muted-foreground"
      )}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      {message}
    </p>
  );
}

interface ProcessingStatusIndicatorProps {
  status: ProcessingStatus;
  message?: string;
}

export function ProcessingStatusIndicator({
  status,
  message,
}: ProcessingStatusIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <ProcessingStatusBadge status={status} />
      <ProcessingStatusMessage status={status} customMessage={message} />
    </div>
  );
}
