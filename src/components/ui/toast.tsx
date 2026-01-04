"use client";

import { toast as sonnerToast } from "sonner";
import { Info, CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

type ToastType = "info" | "success" | "error" | "warning";

interface ToastOptions {
  description?: string;
  duration?: number;
}

const toastConfig: Record<
  ToastType,
  {
    icon: typeof Info;
    title: string;
    bg: string;
    border: string;
    iconColor: string;
    titleColor: string;
    textColor: string;
  }
> = {
  success: {
    icon: CheckCircle,
    title: "Success",
    bg: "bg-green-100/95",
    border: "border-l-green-600",
    iconColor: "text-green-600",
    titleColor: "text-green-600",
    textColor: "text-green-600",
  },
  info: {
    icon: Info,
    title: "Info",
    bg: "bg-blue-100/95",
    border: "border-l-blue-600",
    iconColor: "text-blue-600",
    titleColor: "text-blue-600",
    textColor: "text-blue-600",
  },
  warning: {
    icon: AlertTriangle,
    title: "Warning",
    bg: "bg-orange-100/95",
    border: "border-l-orange-600",
    iconColor: "text-orange-600",
    titleColor: "text-orange-600",
    textColor: "text-orange-600",
  },
  error: {
    icon: XCircle,
    title: "Error",
    bg: "bg-red-100/95",
    border: "border-l-red-600",
    iconColor: "text-red-600",
    titleColor: "text-red-600",
    textColor: "text-red-600",
  },
};

function showToast(type: ToastType, message: string, options?: ToastOptions) {
  const config = toastConfig[type];
  const Icon = config.icon;

  return sonnerToast.custom(
    (t) => (
      <div
        className={`relative flex w-sm items-start gap-3 rounded-lg border-l-[6px] p-3 shadow-lg backdrop-blur-lg ${config.border} ${config.bg} transition-all`}>
        <Icon className={`mt-1.5 h-7 w-7 shrink-0 ${config.iconColor}`} />

        <div className="flex-1">
          <p className={`font-semibold text-base ${config.titleColor}`}>
            {config.title}
          </p>
          <p className={`text-sm ${config.textColor}`}>{message}</p>
        </div>

        <button
          onClick={() => sonnerToast.dismiss(t)}
          className={`ml-4 shrink-0 rounded-md p-1 transition-colors hover:bg-black/5 cursor-pointer ${config.textColor}`}>
          <X className="h-5 w-5" />
        </button>
      </div>
    ),
    {
      duration: options?.duration ?? 4000,
    }
  );
}

export const toast = {
  info: (message: string, options?: ToastOptions) =>
    showToast("info", message, options),
  success: (message: string, options?: ToastOptions) =>
    showToast("success", message, options),
  error: (message: string, options?: ToastOptions) =>
    showToast("error", message, options),
  warning: (message: string, options?: ToastOptions) =>
    showToast("warning", message, options),
  dismiss: sonnerToast.dismiss,
};
