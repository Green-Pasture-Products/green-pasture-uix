import React, { useState } from "react";
import { CheckCircle, Clock, XCircle, Eye, Upload, Download } from "lucide-react";
import { PaymentStatus } from "@/types";

interface Payment {
  id: string;
  paymentStatus: PaymentStatus;
  amount: number;
  currency: string;
  customerPhone?: string;
  receiptUrl?: string;
  submittedAt?: string;
  verifiedAt?: string;
  declinedAt?: string;
  adminNote?: string;
}

interface PaymentStatusProps {
  payment: Payment;
  onUploadReceipt?: () => void;
  isUploadingReceipt?: boolean;
}

const PaymentStatusComponent: React.FC<PaymentStatusProps> = ({
  payment,
  onUploadReceipt,
  isUploadingReceipt = false,
}) => {
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 0,
    });
    return formatter.format(amount / 100);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "VERIFIED":
      case "PAID":
        return "#10b981";
      case "DECLINED":
      case "NOT_PAID":
        return "#ef4444";
      case "AWAITING_VERIFICATION":
        return "#f59e0b";
      case "PENDING":
        return "#6b7280";
      default:
        return "var(--text-secondary)";
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "VERIFIED":
      case "PAID":
        return <CheckCircle className="h-5 w-5" />;
      case "DECLINED":
      case "NOT_PAID":
        return <XCircle className="h-5 w-5" />;
      case "AWAITING_VERIFICATION":
        return <Clock className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const canReupload =
    payment.paymentStatus === "DECLINED" || payment.paymentStatus === "NOT_PAID";

  return (
    <div
      className="rounded-lg border p-6"
      style={{
        borderColor: "var(--border-light)",
        backgroundColor: "var(--surface-paper)",
      }}
    >
      <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Payment Information
      </h3>

      <div className="space-y-4">
        {/* Status */}
        <div>
          <p style={{ color: "var(--text-hint)" }} className="text-sm mb-1">
            Payment Status
          </p>
          <div className="flex items-center gap-2">
            <div style={{ color: getStatusColor(payment.paymentStatus) }}>
              {getStatusIcon(payment.paymentStatus)}
            </div>
            <p
              className="font-medium"
              style={{ color: getStatusColor(payment.paymentStatus) }}
            >
              {payment.paymentStatus.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div>
          <p style={{ color: "var(--text-hint)" }} className="text-sm mb-1">
            Amount
          </p>
          <p className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
            {formatAmount(payment.amount, payment.currency)}
          </p>
        </div>

        {/* Phone */}
        {payment.customerPhone && (
          <div>
            <p style={{ color: "var(--text-hint)" }} className="text-sm mb-1">
              Contact Phone
            </p>
            <p style={{ color: "var(--text-primary)" }}>{payment.customerPhone}</p>
          </div>
        )}

        {/* Receipt Section */}
        {payment.receiptUrl && (
          <div className="pt-2 border-t" style={{ borderColor: "var(--border-light)" }}>
            <p style={{ color: "var(--text-hint)" }} className="text-sm mb-2">
              Receipt
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setViewingReceipt(payment.receiptUrl!)}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                }}
              >
                <Eye className="h-4 w-4" />
                View
              </button>
              <a
                href={payment.receiptUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition border"
                style={{
                  borderColor: "var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
            {payment.submittedAt && (
              <p style={{ color: "var(--text-hint)" }} className="text-xs mt-2">
                Submitted: {formatDate(payment.submittedAt)}
              </p>
            )}
          </div>
        )}

        {/* Verification Status */}
        {payment.verifiedAt && (
          <div className="pt-2 border-t" style={{ borderColor: "var(--border-light)" }}>
            <p style={{ color: "#10b981" }} className="text-sm font-medium">
              ✓ Payment verified on {formatDate(payment.verifiedAt)}
            </p>
          </div>
        )}

        {/* Decline Reason */}
        {payment.declinedAt && payment.adminNote && (
          <div className="pt-2 border-t" style={{ borderColor: "var(--border-light)" }}>
            <p style={{ color: "#ef4444" }} className="text-sm font-medium mb-1">
              Payment Declined
            </p>
            <p style={{ color: "var(--text-secondary)" }} className="text-sm">
              {payment.adminNote}
            </p>
            {canReupload && (
              <button
                onClick={onUploadReceipt}
                disabled={isUploadingReceipt}
                className="mt-2 flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  opacity: isUploadingReceipt ? 0.5 : 1,
                }}
              >
                <Upload className="h-4 w-4" />
                {isUploadingReceipt ? "Uploading..." : "Upload New Receipt"}
              </button>
            )}
          </div>
        )}

        {/* Pending Status */}
        {payment.paymentStatus === "PENDING" && (
          <div
            className="pt-2 border-t"
            style={{ borderColor: "var(--border-light)" }}
          >
            <button
              onClick={onUploadReceipt}
              disabled={isUploadingReceipt}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
                opacity: isUploadingReceipt ? 0.5 : 1,
              }}
            >
              <Upload className="h-4 w-4" />
              {isUploadingReceipt ? "Uploading..." : "Upload Receipt"}
            </button>
          </div>
        )}
      </div>

      {/* Receipt Viewer Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] max-w-2xl">
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute -top-10 right-0 text-white hover:opacity-70 text-2xl"
              title="Close"
            >
              ×
            </button>
            {viewingReceipt.match(/\.(jpg|jpeg|png)$/i) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={viewingReceipt}
                alt="Payment Receipt"
                className="max-h-[80vh] max-w-full object-contain rounded-lg"
              />
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="mb-4 font-medium">PDF Preview</p>
                <a
                  href={viewingReceipt}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2 rounded font-medium text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Open in New Tab
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStatusComponent;
