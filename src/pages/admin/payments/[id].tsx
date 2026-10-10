import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CheckCircle, XCircle, Clock, Eye, Download, X } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import Button from "@/_UI/Button";
import Badge from "@/_UI/Badge";
import axiosInstance from "@/_utils/axiosInstance";
import { getReceiptDeliveryUrl, isPdfReceipt } from "@/_utils/receiptUrl";
import { PaymentStatus, PaymentMethod } from "@/types";

interface OrderItem {
  id: string;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  weightValue?: number;
  weightUnit?: string;
}

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerPhone: string;
  receiptUrl: string;
  adminNote: string;
  submittedAt: string;
  verifiedAt: string;
  declinedAt: string;
  createdAt: string;
  order?: {
    id: string;
    orderReference: string;
    totalAmount: number;
    items?: OrderItem[];
    customer?: {
      id: string;
      profile?: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
      };
    };
  };
}

interface ApprovalModalState {
  isOpen: boolean;
  paymentId?: string;
}

interface DeclineModalState {
  isOpen: boolean;
  paymentId?: string;
  reason: string;
  explanation: string;
}

const AdminPaymentDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [approvalModal, setApprovalModal] = useState<ApprovalModalState>({ isOpen: false });
  const [declineModal, setDeclineModal] = useState<DeclineModalState>({
    isOpen: false,
    reason: "",
    explanation: "",
  });

  const declineReasons = [
    { value: "RECEIPT_UNCLEAR", label: "Receipt is unclear" },
    { value: "AMOUNT_MISMATCH", label: "Amount does not match" },
    { value: "INVALID_TRANSFER", label: "Transfer could not be verified" },
    { value: "DUPLICATE_TRANSFER", label: "Appears to be duplicate transfer" },
    { value: "WRONG_REFERENCE", label: "Wrong order reference" },
    { value: "OTHER", label: "Other reason" },
  ];

  useEffect(() => {
    if (!id) return;

    const fetchPayment = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get<{ data: Payment }>(`/payment/admin/${id}`);
        setPayment(response.data.data);
      } catch (error) {
        toast.error("Failed to load payment details");
        console.error(error);
        router.push("/admin/payments/manual");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayment();
  }, [id, router]);

  const handleApproveClick = () => {
    setApprovalModal({ isOpen: true, paymentId: payment?.id });
  };

  const handleConfirmApproval = async () => {
    if (!approvalModal.paymentId) return;

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post<{ data: Payment }>(
        `/payment/admin/${approvalModal.paymentId}/approve`,
        {},
      );
      setPayment(response.data.data);
      setApprovalModal({ isOpen: false });
      toast.success("Payment approved successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to approve payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineClick = () => {
    setDeclineModal({
      isOpen: true,
      paymentId: payment?.id,
      reason: "",
      explanation: "",
    });
  };

  const handleConfirmDecline = async () => {
    if (!declineModal.paymentId || !declineModal.reason) {
      toast.error("Please select a reason");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post<{ data: Payment }>(
        `/payment/admin/${declineModal.paymentId}/decline`,
        {
          reason: declineModal.reason,
          explanation: declineModal.explanation || undefined,
        },
      );
      setPayment(response.data.data);
      setDeclineModal({ isOpen: false, reason: "", explanation: "" });
      toast.success("Payment declined successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to decline payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 0,
    });
    return formatter.format(amount / 100);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="h-6 w-6" style={{ color: "#10b981" }} />;
      case "DECLINED":
        return <XCircle className="h-6 w-6" style={{ color: "#ef4444" }} />;
      case "AWAITING_VERIFICATION":
        return <Clock className="h-6 w-6" style={{ color: "var(--color-primary)" }} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div
              className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-500 mx-auto mb-4 animate-spin"
              style={{ borderTopColor: "var(--color-primary)" }}
            ></div>
            <p style={{ color: "var(--text-secondary)" }}>Loading payment details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!payment) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p style={{ color: "var(--text-secondary)" }}>Payment not found</p>
          <Link href="/admin/payments/manual">
            <Button variant="filled" className="mt-4">
              Back to Payments
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const profile = payment.order?.customer?.profile;
  const canApprove =
    payment.paymentStatus === "AWAITING_VERIFICATION" && payment.receiptUrl;
  const canDecline =
    payment.paymentStatus === "AWAITING_VERIFICATION" || payment.paymentStatus === "PENDING";

  const formatPaymentMethod = (method: PaymentMethod): string => {
    switch (method) {
      case "PAYSTACK":
        return "Paystack";
      case "MANUAL_TRANSFER":
        return "Bank Transfer";
      case "CUSTOMER_PICKUP":
        return "Customer Pickup";
      default:
        return method;
    }
  };

  return (
    <AdminLayout>
      <div className="animate-page-enter space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Payment Details
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-hint)" }}>
              {payment.order?.orderReference || payment.orderId}
            </p>
          </div>
          <Link href="/admin/payments/manual">
            <Button variant="text">← Back to List</Button>
          </Link>
        </div>

        {/* Status Card */}
        <div
          className="rounded-lg border p-6"
          style={{ borderColor: "var(--border-light)", background: "var(--surface-paper)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-hint)" }}>
                Payment Status
              </p>
              <div className="flex items-center gap-2 mt-2">
                {statusIcon(payment.paymentStatus)}
                <Badge variant={
                  payment.paymentStatus === "VERIFIED"
                    ? "success"
                    : payment.paymentStatus === "DECLINED"
                      ? "error"
                      : "warning"
                }>
                  {payment.paymentStatus.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm" style={{ color: "var(--text-hint)" }}>
                Amount
              </p>
              <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                {formatAmount(payment.amount, payment.currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Order & Customer */}
          <div
            className="rounded-lg border p-6"
            style={{ borderColor: "var(--border-light)", background: "var(--surface-paper)" }}
          >
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Customer Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p style={{ color: "var(--text-hint)" }}>Name</p>
                <p style={{ color: "var(--text-primary)" }}>
                  {profile
                    ? `${profile.firstName} ${profile.lastName}`
                    : "Unknown"}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-hint)" }}>Email</p>
                <p style={{ color: "var(--text-primary)" }}>
                  {profile?.email || "—"}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-hint)" }}>Phone</p>
                <p style={{ color: "var(--text-primary)" }}>
                  {payment.customerPhone || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div
            className="rounded-lg border p-6"
            style={{ borderColor: "var(--border-light)", background: "var(--surface-paper)" }}
          >
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Order Details
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p style={{ color: "var(--text-hint)" }}>Order Reference</p>
                <p style={{ color: "var(--text-primary)" }}>
                  {payment.order?.orderReference || "—"}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-hint)" }}>Order Total</p>
                <p style={{ color: "var(--text-primary)" }}>
                  {payment.order?.totalAmount
                    ? formatAmount(payment.order.totalAmount, payment.currency)
                    : "—"}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-hint)" }}>Order Date</p>
                <p style={{ color: "var(--text-primary)" }}>
                  {formatDate(payment.createdAt)}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-hint)" }}>Payment Method</p>
                <p style={{ color: "var(--text-primary)" }}>
                  {formatPaymentMethod(payment.paymentMethod)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {payment.order?.items && payment.order.items.length > 0 && (
          <div
            className="rounded-lg border p-6"
            style={{ borderColor: "var(--border-light)", background: "var(--surface-paper)" }}
          >
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <th className="text-left py-2" style={{ color: "var(--text-hint)" }}>
                      Item
                    </th>
                    <th className="text-right py-2" style={{ color: "var(--text-hint)" }}>
                      Qty
                    </th>
                    <th className="text-right py-2" style={{ color: "var(--text-hint)" }}>
                      Price
                    </th>
                    <th className="text-right py-2" style={{ color: "var(--text-hint)" }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payment.order.items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td className="py-2" style={{ color: "var(--text-primary)" }}>
                        {item.itemName || "—"}
                        {item.weightValue && (
                          <div className="text-xs" style={{ color: "var(--text-hint)" }}>
                            {item.weightValue}
                            {item.weightUnit}
                          </div>
                        )}
                      </td>
                      <td className="text-right py-2" style={{ color: "var(--text-primary)" }}>
                        {item.quantity}
                      </td>
                      <td className="text-right py-2" style={{ color: "var(--text-primary)" }}>
                        {formatAmount(item.unitPrice, payment.currency)}
                      </td>
                      <td className="text-right py-2" style={{ color: "var(--text-primary)" }}>
                        {formatAmount(item.unitPrice * item.quantity, payment.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Receipt Section */}
        {payment.receiptUrl && (
          <div
            className="rounded-lg border p-6"
            style={{ borderColor: "var(--border-light)", background: "var(--surface-paper)" }}
          >
            <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Payment Receipt
            </h3>
            <div className="space-y-4">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Submitted: {formatDate(payment.submittedAt)}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewingImage(payment.receiptUrl)}
                  className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "white",
                  }}
                >
                  <Eye className="h-4 w-4" />
                  View Receipt
                </button>
                <a
                  href={getReceiptDeliveryUrl(payment.receiptUrl)}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                  style={{
                    border: "1px solid var(--border-light)",
                    color: "var(--text-primary)",
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Payment Timeline */}
        <div
          className="rounded-lg border p-6"
          style={{ borderColor: "var(--border-light)", background: "var(--surface-paper)" }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Payment Timeline
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div
                className="h-2 w-2 rounded-full mt-1.5"
                style={{ backgroundColor: "var(--color-primary)" }}
              ></div>
              <div>
                <p style={{ color: "var(--text-hint)" }}>Order Created</p>
                <p style={{ color: "var(--text-primary)" }}>{formatDate(payment.createdAt)}</p>
              </div>
            </div>
            {payment.submittedAt && (
              <div className="flex gap-3">
                <div
                  className="h-2 w-2 rounded-full mt-1.5"
                  style={{ backgroundColor: "var(--color-primary)" }}
                ></div>
                <div>
                  <p style={{ color: "var(--text-hint)" }}>Receipt Submitted</p>
                  <p style={{ color: "var(--text-primary)" }}>
                    {formatDate(payment.submittedAt)}
                  </p>
                </div>
              </div>
            )}
            {payment.verifiedAt && (
              <div className="flex gap-3">
                <div className="h-2 w-2 rounded-full mt-1.5" style={{ backgroundColor: "#10b981" }}></div>
                <div>
                  <p style={{ color: "var(--text-hint)" }}>Payment Verified</p>
                  <p style={{ color: "var(--text-primary)" }}>
                    {formatDate(payment.verifiedAt)}
                  </p>
                </div>
              </div>
            )}
            {payment.declinedAt && (
              <div className="flex gap-3">
                <div className="h-2 w-2 rounded-full mt-1.5" style={{ backgroundColor: "#ef4444" }}></div>
                <div>
                  <p style={{ color: "var(--text-hint)" }}>Payment Declined</p>
                  <p style={{ color: "var(--text-primary)" }}>
                    {formatDate(payment.declinedAt)}
                  </p>
                  {payment.adminNote && (
                    <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
                      Reason: {payment.adminNote}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {(canApprove || canDecline) && (
          <div className="flex gap-3">
            {canApprove && (
              <button
                onClick={handleApproveClick}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50 transition"
                style={{ backgroundColor: "#10b981" }}
              >
                {isSubmitting ? "Approving..." : "✓ Approve Payment"}
              </button>
            )}
            {canDecline && (
              <button
                onClick={handleDeclineClick}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50 transition"
                style={{ backgroundColor: "#ef4444" }}
              >
                {isSubmitting ? "Declining..." : "✗ Decline Payment"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Approval Confirmation Modal */}
      {approvalModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="rounded-lg p-6 max-w-sm w-full"
            style={{ backgroundColor: "var(--surface-paper)" }}
          >
            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Approve Payment?
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Are you sure you want to approve this payment? The order will be marked as paid
              and ready for processing.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setApprovalModal({ isOpen: false })}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition"
                style={{
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApproval}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50 transition"
                style={{ backgroundColor: "#10b981" }}
              >
                {isSubmitting ? "Confirming..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {declineModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="rounded-lg p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: "var(--surface-paper)" }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Decline Payment
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Reason for Decline *
                </label>
                <select
                  value={declineModal.reason}
                  onChange={(e) =>
                    setDeclineModal({ ...declineModal, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <option value="">Select a reason</option>
                  {declineReasons.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Explanation for Customer
                </label>
                <textarea
                  value={declineModal.explanation}
                  onChange={(e) =>
                    setDeclineModal({ ...declineModal, explanation: e.target.value })
                  }
                  placeholder="Explain why the payment was declined (customer will see this)"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border resize-none"
                  style={{ borderColor: "var(--border-light)" }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeclineModal({ isOpen: false, reason: "", explanation: "" })
                }
                className="flex-1 px-4 py-2 rounded-lg font-medium transition"
                style={{
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecline}
                disabled={isSubmitting || !declineModal.reason}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50 transition"
                style={{ backgroundColor: "#ef4444" }}
              >
                {isSubmitting ? "Declining..." : "Decline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] max-w-2xl">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-10 right-0 text-white hover:opacity-70"
              title="Close"
            >
              <X size={32} />
            </button>
            {!isPdfReceipt(viewingImage, payment.receiptUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={viewingImage}
                alt="Payment Receipt"
                className="max-h-[80vh] max-w-full object-contain rounded-lg"
              />
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="mb-4 font-medium">PDF receipt</p>
                <a
                  href={getReceiptDeliveryUrl(viewingImage, payment.receiptUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2 rounded-lg font-medium text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Download / Open PDF Receipt
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default withAdminAuth(AdminPaymentDetail);
