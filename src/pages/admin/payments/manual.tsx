import React, { useCallback, useEffect, useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, XCircle, Clock, Eye, Settings } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { DataTable } from "@/_components/DataTable";
import Button from "@/_UI/Button";
import Badge from "@/_UI/Badge";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { useListParams } from "@/_hooks/useListParams";
import axiosInstance from "@/_utils/axiosInstance";
import { PaymentStatus, PaymentMethod } from "@/types";

interface ManualPayment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerPhone: string;
  submittedAt: string;
  createdAt: string;
  order?: {
    id: string;
    orderReference: string;
    customer?: {
      id: string;
      profile?: {
        firstName: string;
        lastName: string;
        email: string;
      };
    };
  };
}

interface PaginatedResponse {
  items: ManualPayment[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    first: string;
    previous: string;
    next: string;
    last: string;
  };
}

const AdminPaymentsManual: React.FC = () => {
  const { page: currentPage, pageSize, search: searchTerm, setPage, setSearch, setPageSize } = useListParams();
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse["meta"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | "ALL">("ALL");

  const statusFilters: Array<{ label: string; value: PaymentStatus | "ALL" }> = [
    { label: "All", value: "ALL" },
    { label: "Awaiting Verification", value: "AWAITING_VERIFICATION" },
    { label: "Verified", value: "VERIFIED" },
    { label: "Declined", value: "DECLINED" },
    { label: "Pending", value: "PENDING" },
  ];

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("limit", String(pageSize));
      if (filterStatus !== "ALL") {
        params.append("status", filterStatus);
      }

      const response = await axiosInstance.get<{ data: PaginatedResponse }>(
        `/payment/admin/list?${params}`,
      );

      setPayments(response.data.data.items);
      setPagination(response.data.data.meta);
    } catch (error) {
      toast.error("Failed to fetch manual payments");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, filterStatus]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const statusBadgeVariant = (status: PaymentStatus): string => {
    switch (status) {
      case "VERIFIED":
        return "success";
      case "DECLINED":
        return "error";
      case "AWAITING_VERIFICATION":
        return "warning";
      case "PENDING":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const paymentMethodBadgeVariant = (method: PaymentMethod): string => {
    switch (method) {
      case "PAYSTACK":
        return "info";
      case "MANUAL_TRANSFER":
        return "warning";
      case "CASH_ON_DELIVERY":
        return "success";
      default:
        return "neutral";
    }
  };

  const formatPaymentMethod = (method: PaymentMethod): string => {
    switch (method) {
      case "PAYSTACK":
        return "Paystack";
      case "MANUAL_TRANSFER":
        return "Bank Transfer";
      case "CASH_ON_DELIVERY":
        return "Cash on Delivery";
      default:
        return method;
    }
  };

  const statusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "VERIFIED":
        return <CheckCircle className="h-4 w-4" />;
      case "DECLINED":
        return <XCircle className="h-4 w-4" />;
      case "AWAITING_VERIFICATION":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 0,
    });
    return formatter.format(amount / 100); // Convert from minor units
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns: ColumnDef<ManualPayment, any>[] = [
    {
      id: "orderReference",
      header: "Order",
      meta: { width: "140px" },
      cell: ({ row }) => (
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {row.original.order?.orderReference || row.original.orderId.slice(0, 8)}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      meta: { width: "180px" },
      cell: ({ row }) => {
        const profile = row.original.order?.customer?.profile;
        const name = profile
          ? `${profile.firstName} ${profile.lastName}`
          : "Unknown Customer";
        return (
          <div>
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {name}
            </span>
            <div
              className="text-xs"
              style={{ color: "var(--text-hint)" }}
            >
              {profile?.email || "—"}
            </div>
          </div>
        );
      },
    },
    {
      id: "phone",
      header: "Phone",
      meta: { width: "130px" },
      cell: ({ row }) => (
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {row.original.customerPhone || "—"}
        </span>
      ),
    },
    {
      id: "paymentMethod",
      header: "Payment Method",
      meta: { width: "140px" },
      cell: ({ row }) => (
        <Badge variant={paymentMethodBadgeVariant(row.original.paymentMethod) as any}>
          {formatPaymentMethod(row.original.paymentMethod)}
        </Badge>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      meta: { width: "120px", align: "right" },
      cell: ({ row }) => (
        <span className="text-sm font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>
          {formatAmount(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      id: "paymentStatus",
      header: "Status",
      meta: { width: "160px" },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {statusIcon(row.original.paymentStatus)}
          <Badge variant={statusBadgeVariant(row.original.paymentStatus) as any}>
            {row.original.paymentStatus.replace(/_/g, " ")}
          </Badge>
        </div>
      ),
    },
    {
      id: "submitted",
      header: "Submitted",
      meta: { width: "160px" },
      cell: ({ row }) => (
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {row.original.submittedAt ? formatDate(row.original.submittedAt) : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      enableSorting: false,
      meta: { width: "100px", align: "center" },
      cell: ({ row }) => (
        <Link href={`/admin/payments/${row.original.id}`}>
          <Button variant="text" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            Review
          </Button>
        </Link>
      ),
    },
  ];

  const awaiting = useMemo(
    () => payments.filter((p) => p.paymentStatus === "AWAITING_VERIFICATION").length,
    [payments],
  );

  const verified = useMemo(
    () => payments.filter((p) => p.paymentStatus === "VERIFIED").length,
    [payments],
  );

  const declined = useMemo(
    () => payments.filter((p) => p.paymentStatus === "DECLINED").length,
    [payments],
  );

  return (
    <AdminLayout>
      <div className="animate-page-enter space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Manual Payments
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-hint)" }}>
              Review and verify bank transfer payments
            </p>
          </div>
          <Link href="/admin/settings/manual-payments">
            <Button variant="outlined" className="gap-2">
              <Settings className="h-4 w-4" />
              Bank Settings
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            className="rounded-lg border p-6"
            style={{ borderColor: "var(--border-light)", background: "var(--surface-paper)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: "var(--text-hint)" }}>
                  Awaiting Verification
                </p>
                <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                  {awaiting}
                </p>
              </div>
              <Clock className="h-8 w-8" style={{ color: "var(--color-primary)" }} />
            </div>
          </div>

          <div
            className="rounded-lg border p-6"
            style={{ borderColor: "var(--border-light)", background: "var(--surface-paper)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: "var(--text-hint)" }}>
                  Verified
                </p>
                <p className="text-2xl font-bold" style={{ color: "#10b981" }}>
                  {verified}
                </p>
              </div>
              <CheckCircle className="h-8 w-8" style={{ color: "#10b981" }} />
            </div>
          </div>

          <div
            className="rounded-lg border p-6"
            style={{ borderColor: "var(--border-light)", background: "var(--surface-paper)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: "var(--text-hint)" }}>
                  Declined
                </p>
                <p className="text-2xl font-bold" style={{ color: "#ef4444" }}>
                  {declined}
                </p>
              </div>
              <XCircle className="h-8 w-8" style={{ color: "#ef4444" }} />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => {
                setFilterStatus(filter.value);
                setPage(1);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === filter.value
                  ? "text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              style={
                filterStatus === filter.value
                  ? { backgroundColor: "var(--color-primary)" }
                  : {}
              }
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={payments ?? []}
          isLoading={isLoading}
          onRefresh={refresh}
          refreshing={isLoading}
          manualFiltering
          pageIndex={currentPage - 1}
          pageSize={pageSize}
          pageCount={pagination?.totalPages ?? 1}
          totalItems={pagination?.totalItems}
          onPageChange={(idx) => setPage(idx + 1)}
          onPageSizeChange={setPageSize}
          emptyMessage="No manual payments found"
          showAuditColumns={false}
        />
      </div>
    </AdminLayout>
  );
};

export default withAdminAuth(AdminPaymentsManual);
