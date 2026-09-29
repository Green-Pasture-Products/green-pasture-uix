import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Copy, Check, Upload, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import Layout from "@/_components/Layout";
import Button from "@/_UI/Button";
import axiosInstance from "@/_utils/axiosInstance";

interface ManualPaymentSettings {
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string;
  isEnabled: boolean;
}

interface OrderInfo {
  orderReference: string;
  totalAmount: number;
  currency: string;
}

const PaymentInstructionsPage: React.FC = () => {
  const router = useRouter();
  const { orderId } = router.query;

  const [settings, setSettings] = useState<ManualPaymentSettings | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch payment settings
        const settingsResponse = await axiosInstance.get<{ data: ManualPaymentSettings }>(
          `/manual-payment-settings`,
        );
        console.log("Settings response:", settingsResponse.data);
        setSettings(settingsResponse.data.data);

        // Fetch order details from backend
        const orderResponse = await axiosInstance.get<any>(
          `/order/my-orders/${orderId}`,
        );
        console.log("Order response:", orderResponse.data);
        const orderData = orderResponse.data?.data;
        if (orderData) {
          const totalAmount = typeof orderData.totalAmount === 'string'
            ? parseInt(orderData.totalAmount, 10)
            : orderData.totalAmount;
          console.log("Parsed totalAmount:", totalAmount);
          setOrderInfo({
            orderReference: orderData.orderReference,
            totalAmount: totalAmount,
            currency: orderData.currency || "NGN",
          });
        } else {
          console.error("No order data in response");
          toast.error("Could not load order information");
        }
      } catch (error: any) {
        console.error("Error fetching payment details:", error);
        toast.error(error?.response?.data?.message || "Failed to load payment details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 0,
    });
    return formatter.format(amount / 100);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div
              className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-500 mx-auto mb-4 animate-spin"
              style={{ borderTopColor: "var(--color-primary)" }}
            ></div>
            <p style={{ color: "var(--text-secondary)" }}>Loading payment instructions...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!settings) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p style={{ color: "var(--text-secondary)" }}>Payment details not available</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Success Message */}
        <div className="mb-8 text-center">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <Check className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Order Confirmed!
          </h1>
          <p style={{ color: "var(--text-secondary)" }} className="text-lg">
            Order Reference: <span className="font-semibold">{orderId}</span>
          </p>
        </div>

        {/* Info Alert */}
        <div
          className="rounded-lg p-4 mb-8 flex gap-3"
          style={{ backgroundColor: "#fef3c7", borderLeft: "4px solid #f59e0b" }}
        >
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900">Complete Your Payment</p>
            <p className="text-sm text-yellow-800 mt-1">
              Please transfer the amount shown below to the account details provided. Your order will be processed once payment is verified.
            </p>
          </div>
        </div>

        {/* Amount Section */}
        <div
          className="rounded-lg p-8 mb-8 text-center border-2"
          style={{
            borderColor: "var(--color-primary)",
            backgroundColor: "var(--surface-paper)",
          }}
        >
          <p style={{ color: "var(--text-hint)" }} className="text-sm uppercase tracking-wide mb-2">
            Amount to Pay
          </p>
          <p
            className="text-4xl font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            {orderInfo ? formatAmount(orderInfo.totalAmount, orderInfo.currency) : "Loading..."}
          </p>
          <p style={{ color: "var(--text-secondary)" }} className="text-sm mt-2">
            {orderInfo?.currency} ({orderInfo?.currency === "NGN" ? "Nigerian Naira" : orderInfo?.currency})
          </p>
        </div>

        {/* Bank Details Section */}
        <div
          className="rounded-lg border p-8 mb-8 space-y-6"
          style={{ borderColor: "var(--border-light)", backgroundColor: "var(--surface-paper)" }}
        >
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Bank Transfer Details
          </h2>

          <div>
            <p style={{ color: "var(--text-hint)" }} className="text-sm mb-2">
              Bank Name
            </p>
            <div className="flex items-center justify-between">
              <p style={{ color: "var(--text-primary)" }} className="font-semibold text-lg">
                {settings.bankName}
              </p>
              <button
                onClick={() => handleCopy(settings.bankName, "Bank Name")}
                className="p-2 rounded-lg transition"
                style={{
                  backgroundColor:
                    copiedField === "Bank Name"
                      ? "var(--color-primary)"
                      : "var(--surface-low)",
                }}
              >
                {copiedField === "Bank Name" ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Copy className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
                )}
              </button>
            </div>
          </div>

          <div>
            <p style={{ color: "var(--text-hint)" }} className="text-sm mb-2">
              Account Name
            </p>
            <div className="flex items-center justify-between">
              <p style={{ color: "var(--text-primary)" }} className="font-semibold text-lg">
                {settings.accountName}
              </p>
              <button
                onClick={() => handleCopy(settings.accountName, "Account Name")}
                className="p-2 rounded-lg transition"
                style={{
                  backgroundColor:
                    copiedField === "Account Name"
                      ? "var(--color-primary)"
                      : "var(--surface-low)",
                }}
              >
                {copiedField === "Account Name" ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Copy className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
                )}
              </button>
            </div>
          </div>

          <div>
            <p style={{ color: "var(--text-hint)" }} className="text-sm mb-2">
              Account Number
            </p>
            <div className="flex items-center justify-between">
              <p
                style={{ color: "var(--text-primary)" }}
                className="font-mono font-semibold text-lg tracking-wider"
              >
                {settings.accountNumber}
              </p>
              <button
                onClick={() => handleCopy(settings.accountNumber, "Account Number")}
                className="p-2 rounded-lg transition"
                style={{
                  backgroundColor:
                    copiedField === "Account Number"
                      ? "var(--color-primary)"
                      : "var(--surface-low)",
                }}
              >
                {copiedField === "Account Number" ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Copy className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {settings.instructions && (
          <div
            className="rounded-lg border p-6 mb-8"
            style={{ borderColor: "var(--border-light)", backgroundColor: "var(--surface-paper)" }}
          >
            <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Important Instructions
            </h3>
            <p style={{ color: "var(--text-secondary)" }} className="text-sm leading-relaxed">
              {settings.instructions}
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div
          className="rounded-lg border p-6 mb-8"
          style={{ borderColor: "var(--border-light)", backgroundColor: "var(--surface-paper)" }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Next Steps
          </h3>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span
                className="font-semibold flex-shrink-0"
                style={{ color: "var(--color-primary)" }}
              >
                1.
              </span>
              <span style={{ color: "var(--text-secondary)" }}>
                Transfer the exact amount to the bank account above
              </span>
            </li>
            <li className="flex gap-3">
              <span
                className="font-semibold flex-shrink-0"
                style={{ color: "var(--color-primary)" }}
              >
                2.
              </span>
              <span style={{ color: "var(--text-secondary)" }}>
                Include your order reference in the transfer memo/narration
              </span>
            </li>
            <li className="flex gap-3">
              <span
                className="font-semibold flex-shrink-0"
                style={{ color: "var(--color-primary)" }}
              >
                3.
              </span>
              <span style={{ color: "var(--text-secondary)" }}>
                Upload your payment receipt for verification
              </span>
            </li>
            <li className="flex gap-3">
              <span
                className="font-semibold flex-shrink-0"
                style={{ color: "var(--color-primary)" }}
              >
                4.
              </span>
              <span style={{ color: "var(--text-secondary)" }}>
                We'll verify and process your order within 2-4 hours
              </span>
            </li>
          </ol>
        </div>

        {/* Upload Receipt Button */}
        <div className="flex flex-col gap-3">
          <Link href={`/payment-instructions/${orderId}/upload-receipt`} className="w-full">
            <button
              className="w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <Upload className="h-5 w-5" />
              Upload Payment Receipt
            </button>
          </Link>
          <Link href="/orders">
            <button
              className="w-full py-3 rounded-lg font-semibold transition"
              style={{
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            >
              View My Orders
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentInstructionsPage;
