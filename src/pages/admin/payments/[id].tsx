import { SelectField } from "@/_UI/SelectField";
import RecordActivity from "@/_components/RecordActivity";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Check, X, CircleDollarSign } from "lucide-react";
import toast from "react-hot-toast";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import Button from "@/_UI/Button";
import Modal from "@/_UI/Modal";
import PageLoader from "@/_UI/PageLoader";
import { BackButton, DetailHeader, DetailSection, DetailRow } from "@/_UI/DetailField";
import { StatusTimeline, type TimelineStep } from "@/_UI/StatusTimeline";
import Badge from "@/_UI/Badge";
import axiosInstance from "@/_utils/axiosInstance";
import { useFeature } from "@/_hooks/useFeature";
import { useLiveEvent } from "@/_hooks/useLiveEvent";
import { useAppSelector } from "@/_redux/store";
import { DecisionCard } from "@/_components/PaymentDecisionParts";
import { DECISION_LABEL, isPending, type PaymentDecision } from "@/_utils/paymentDecisions";
import { ReceiptList, type ReceiptItem } from "@/_components/ReceiptList";
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
  receiptFileName?: string;
  receipts?: ReceiptItem[];
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
  const makerChecker = useFeature("payments.maker_checker");
  const meId = String(useAppSelector((s) => s.auth.user?.id ?? ""));
  const [decisions, setDecisions] = useState<PaymentDecision[]>([]);

  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incompleteNote, setIncompleteNote] = useState<string | null>(null);
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

  const fetchDecisions = useCallback(() => {
    if (!id) return;
    axiosInstance
      .get<{ data: PaymentDecision[] }>("payment-decisions", { params: { paymentId: id } })
      .then((r) => setDecisions(r.data?.data ?? []))
      .catch(() => {}); // viewers without the privilege simply see no decisions
  }, [id]);
  useEffect(fetchDecisions, [fetchDecisions]);
  // A decision confirmed elsewhere changes the payment too.
  const refetchAll = () => {
    fetchDecisions();
    if (id) axiosInstance.get<{ data: Payment }>(`/payment/admin/${id}`).then((r) => setPayment(r.data.data)).catch(() => {});
  };
  useLiveEvent("payment-decisions-changed", refetchAll);

  /** A 202 means "queued for a second person": nothing changed yet, so leave the payment alone. */
  const queued = (data: unknown): boolean => {
    if (!isPending(data)) return false;
    toast.success("Proposed. Waiting for someone else to confirm.");
    fetchDecisions();
    return true;
  };

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
      setApprovalModal({ isOpen: false });
      if (queued(response.data)) return;
      setPayment(response.data.data);
      toast.success("Payment approved successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to approve payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmIncomplete = async () => {
    if (!payment) return;
    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post(`/payment/admin/${payment.id}/incomplete`, { note: incompleteNote?.trim() || undefined });
      if (queued(res.data)) {
        setIncompleteNote(null);
        return;
      }
      // Re-fetch so the receipts list and status stay in sync.
      const response = await axiosInstance.get<{ data: Payment }>(`/payment/admin/${payment.id}`);
      setPayment(response.data.data);
      setIncompleteNote(null);
      toast.success("Marked incomplete. The customer can now upload the balance receipt.");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to mark payment incomplete");
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
      setDeclineModal({ isOpen: false, reason: "", explanation: "" });
      if (queued(response.data)) return;
      setPayment(response.data.data);
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
    return formatter.format(amount);
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

  if (isLoading) {
    return (
      <AdminLayout>
        <PageLoader fullScreen={false} message="Loading payment details..." />
      </AdminLayout>
    );
  }

  if (!payment) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-5xl space-y-5">
          <BackButton onClick={() => router.push("/admin/payments/manual")} label="Back to payments" />
          <p className="py-12 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Payment not found
          </p>
        </div>
      </AdminLayout>
    );
  }

  const profile = payment.order?.customer?.profile;
  const pendingDecision = decisions.find((d) => d.changeStatus === "PENDING");
  const canApprove = payment.paymentStatus === "AWAITING_VERIFICATION" && payment.receiptUrl && !pendingDecision;
  const canMarkIncomplete = payment.paymentStatus === "AWAITING_VERIFICATION" && !pendingDecision;
  const canDecline = (payment.paymentStatus === "AWAITING_VERIFICATION" || payment.paymentStatus === "PENDING") && !pendingDecision;
  const verb = makerChecker ? "Propose " : "";
  const proposeNote = makerChecker ? " A second person must confirm this before it takes effect." : "";
  const items = payment.order?.items ?? [];
  const itemsTotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const hasReceipt = !!(payment.receiptUrl || payment.receipts?.length);

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

  const statusVariant = payment.paymentStatus === "VERIFIED" ? "success" : payment.paymentStatus === "DECLINED" ? "error" : "warning";
  const settledAt = payment.verifiedAt ?? payment.declinedAt;
  const timeline: TimelineStep[] = [
    { label: "Payment created", at: payment.createdAt },
    ...(payment.submittedAt ? [{ label: "Receipt submitted", at: payment.submittedAt }] : []),
    ...(payment.verifiedAt ? [{ label: "Payment verified", at: payment.verifiedAt, tone: "success" as const }] : []),
    ...(payment.declinedAt ? [{ label: "Payment declined", at: payment.declinedAt, tone: "error" as const, note: payment.adminNote ? `Reason: ${payment.adminNote}` : undefined }] : []),
    ...decisions
      .filter((d) => (d.changeStatus === "CONFIRMED" || d.changeStatus === "REJECTED") && d.decidedAt)
      .map((d) => ({
        label: `${DECISION_LABEL[d.decision]} ${d.changeStatus === "CONFIRMED" ? "confirmed" : "rejected"}`,
        at: d.decidedAt!,
        tone: (d.changeStatus === "CONFIRMED" ? "success" : "error") as "success" | "error",
        note: `Proposed by ${d.requestedByName ?? "someone"}, ${d.changeStatus === "CONFIRMED" ? "confirmed" : "rejected"} by ${d.decidedByName ?? "someone"}${d.decisionNote ? `: ${d.decisionNote}` : ""}`,
      })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <AdminLayout>
      <div className="animate-page-enter mx-auto w-full max-w-6xl space-y-5">
        <BackButton onClick={() => router.push("/admin/payments/manual")} label="Back to payments" />

        <DetailHeader
          title={`Payment · ${payment.order?.orderReference || payment.orderId}`}
          subtitle={profile ? `${profile.firstName} ${profile.lastName}` : undefined}
          status={
            <>
              <Badge variant={statusVariant} dot>{payment.paymentStatus.replace(/_/g, " ")}</Badge>
              {pendingDecision && <Badge variant="warning" className="whitespace-nowrap">Awaiting confirmation</Badge>}
            </>
          }
          actions={
            <>
              {canDecline && (
                <Button variant="outlined" color="error" size="sm" onClick={handleDeclineClick} disabled={isSubmitting}>
                  <X className="mr-1.5 h-4 w-4" />
                  {verb ? "Propose decline" : "Decline"}
                </Button>
              )}
              {canMarkIncomplete && incompleteNote === null && (
                <Button variant="outlined" size="sm" onClick={() => setIncompleteNote("")} disabled={isSubmitting}>
                  <CircleDollarSign className="mr-1.5 h-4 w-4" />
                  {verb ? "Propose incomplete" : "Mark incomplete"}
                </Button>
              )}
              {canApprove && (
                <Button variant="filled" size="sm" onClick={handleApproveClick} loading={isSubmitting}>
                  <Check className="mr-1.5 h-4 w-4" />
                  {verb ? "Propose approval" : "Approve payment"}
                </Button>
              )}
            </>
          }
          metrics={[
            { label: "Amount", value: formatAmount(payment.amount, payment.currency) },
            { label: "Method", value: formatPaymentMethod(payment.paymentMethod) },
            { label: "Submitted", value: formatDate(payment.submittedAt) },
            { label: payment.declinedAt ? "Declined" : "Verified", value: formatDate(settledAt) },
          ]}
        />

        {canMarkIncomplete && incompleteNote !== null && (
          <DetailSection title="Mark as incomplete" description={`Use this when the amount received is less than the order total. The customer is notified and can upload the receipt for the balance.${proposeNote}`}>
            <div className="space-y-3 py-3">
              <textarea
                value={incompleteNote}
                onChange={(e) => setIncompleteNote(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Optional note, e.g. ₦10,000 received of ₦100,000. Please pay the balance of ₦90,000."
                className="w-full rounded-lg border p-3 text-sm"
                style={{ borderColor: "var(--border-light)", background: "var(--surface-low)", color: "var(--text-primary)" }}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outlined" color="secondary" size="sm" onClick={() => setIncompleteNote(null)}>
                  Cancel
                </Button>
                <Button variant="filled" size="sm" onClick={handleConfirmIncomplete} loading={isSubmitting}>
                  Confirm
                </Button>
              </div>
            </div>
          </DetailSection>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
          <div className="space-y-5 lg:col-span-2">
            {pendingDecision && (
              <DetailSection title="Waiting for confirmation">
                <div className="py-3">
                  <DecisionCard decision={pendingDecision} meId={meId} onDone={refetchAll} />
                </div>
              </DetailSection>
            )}
            <DetailSection title="Order items">
              {items.length > 0 ? (
                <div className="overflow-x-auto py-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left" style={{ color: "var(--text-hint)" }}>
                        <th className="py-2 font-medium">Item</th>
                        <th className="py-2 text-right font-medium">Qty</th>
                        <th className="py-2 text-right font-medium">Price</th>
                        <th className="py-2 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-t" style={{ borderColor: "var(--border-light)" }}>
                          <td className="whitespace-nowrap py-2.5" style={{ color: "var(--text-primary)" }}>
                            {item.itemName || "—"}
                            {item.weightValue && (
                              <div className="text-xs" style={{ color: "var(--text-hint)" }}>
                                {item.weightValue}
                                {item.weightUnit}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 text-right tabular-nums">{item.quantity}</td>
                          <td className="py-2.5 text-right tabular-nums">{formatAmount(item.unitPrice, payment.currency)}</td>
                          <td className="py-2.5 text-right font-medium tabular-nums">{formatAmount(item.unitPrice * item.quantity, payment.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t" style={{ borderColor: "var(--border-light)" }}>
                        <td colSpan={3} className="py-2.5 text-right" style={{ color: "var(--text-hint)" }}>
                          Items subtotal
                        </td>
                        <td className="py-2.5 text-right font-semibold tabular-nums">{formatAmount(itemsTotal, payment.currency)}</td>
                      </tr>
                      {payment.order?.totalAmount != null && payment.order.totalAmount !== itemsTotal && (
                        <tr>
                          <td colSpan={3} className="pb-2.5 text-right" style={{ color: "var(--text-hint)" }}>
                            Order total
                          </td>
                          <td className="pb-2.5 text-right font-semibold tabular-nums">{formatAmount(payment.order.totalAmount, payment.currency)}</td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="py-4 text-sm" style={{ color: "var(--text-hint)" }}>No items on this order.</p>
              )}
            </DetailSection>

            <DetailSection title="Payment receipt">
              {hasReceipt ? (
                <div className="space-y-3 py-3">
                  <p className="text-xs" style={{ color: "var(--text-hint)" }}>
                    Submitted {formatDate(payment.submittedAt)}
                  </p>
                  <ReceiptList receipts={payment.receipts} legacyUrl={payment.receiptUrl} legacyFileName={payment.receiptFileName} />
                </div>
              ) : (
                <p className="py-4 text-sm" style={{ color: "var(--text-hint)" }}>No receipt uploaded yet.</p>
              )}
            </DetailSection>
          </div>

          <div className="space-y-5">
            <DetailSection title="Customer">
              <DetailRow label="Name" value={profile ? `${profile.firstName} ${profile.lastName}` : "Unknown"} />
              <DetailRow label="Email" value={profile?.email} />
              <DetailRow label="Phone" value={payment.customerPhone || profile?.phoneNumber} />
            </DetailSection>

            <DetailSection title="Order">
              <DetailRow label="Reference" value={payment.order?.orderReference} />
              <DetailRow label="Order total" value={payment.order?.totalAmount ? formatAmount(payment.order.totalAmount, payment.currency) : undefined} />
              <DetailRow label="Placed" value={formatDate(payment.createdAt)} />
            </DetailSection>

            <DetailSection title="Timeline">
              <StatusTimeline steps={timeline} />
            </DetailSection>
          </div>
        </div>
      </div>

      <Modal isOpen={approvalModal.isOpen} onClose={() => setApprovalModal({ isOpen: false })} title={makerChecker ? "Propose approval?" : "Approve payment?"} size="sm">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            The order will be marked as paid and ready for processing.{proposeNote}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outlined" color="secondary" size="sm" onClick={() => setApprovalModal({ isOpen: false })}>
              Cancel
            </Button>
            <Button variant="filled" size="sm" onClick={handleConfirmApproval} loading={isSubmitting}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={declineModal.isOpen} onClose={() => setDeclineModal({ isOpen: false, reason: "", explanation: "" })} title={makerChecker ? "Propose decline" : "Decline payment"} size="sm">
        <div className="space-y-4">
          {proposeNote && <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{proposeNote.trim()}</p>}
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Reason for decline *
            </label>
            <SelectField
              value={declineModal.reason}
              onValueChange={(v) => setDeclineModal({ ...declineModal, reason: v })}
              placeholder="Select a reason"
              aria-label="Reason for decline"
              className="w-full"
              options={declineReasons}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Explanation for customer
            </label>
            <textarea
              value={declineModal.explanation}
              onChange={(e) => setDeclineModal({ ...declineModal, explanation: e.target.value })}
              placeholder="Explain why the payment was declined (the customer will see this)"
              rows={3}
              className="w-full resize-none rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--border-light)" }}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outlined" color="secondary" size="sm" onClick={() => setDeclineModal({ isOpen: false, reason: "", explanation: "" })}>
              Cancel
            </Button>
            <Button variant="filled" color="error" size="sm" onClick={handleConfirmDecline} loading={isSubmitting} disabled={!declineModal.reason}>
              {verb ? "Propose decline" : "Decline"}
            </Button>
          </div>
        </div>
      </Modal>

      <RecordActivity type="Payment" id={payment?.id} created={{ at: (payment as any)?.createdAt, by: (payment as any)?.createdBy }} />
    </AdminLayout>
  );
};

export default withAdminAuth(AdminPaymentDetail);
