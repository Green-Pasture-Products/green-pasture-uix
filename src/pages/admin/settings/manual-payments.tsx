import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import Button from "@/_UI/Button";
import axiosInstance from "@/_utils/axiosInstance";
import { FormInput } from "@/_UI/FormField";

const manualPaymentSettingsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  instructions: z.string().optional(),
  isEnabled: z.boolean(),
});

type ManualPaymentSettingsFormData = z.infer<typeof manualPaymentSettingsSchema>;

interface ManualPaymentSettings {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  instructions?: string | null;
  isEnabled: boolean;
}

const AdminManualPaymentSettingsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<ManualPaymentSettings | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<ManualPaymentSettingsFormData>({
    resolver: zodResolver(manualPaymentSettingsSchema),
  });

  const isEnabled = watch("isEnabled");

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get<{ data: ManualPaymentSettings }>(
          "/manual-payment-settings",
        );
        setSettings(response.data.data);
        reset({
          bankName: response.data.data.bankName,
          accountName: response.data.data.accountName,
          accountNumber: response.data.data.accountNumber,
          instructions: response.data.data.instructions || "",
          isEnabled: response.data.data.isEnabled,
        });
      } catch (error) {
        toast.error("Failed to load payment settings");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: ManualPaymentSettingsFormData) => {
    setIsSaving(true);
    try {
      const response = await axiosInstance.patch<{ data: ManualPaymentSettings }>(
        "/manual-payment-settings",
        {
          bankName: data.bankName,
          accountName: data.accountName,
          accountNumber: data.accountNumber,
          instructions: data.instructions || null,
          isEnabled: data.isEnabled,
        },
      );
      setSettings(response.data.data);
      toast.success("Payment settings updated successfully!");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update payment settings",
      );
      console.error(error);
    } finally {
      setIsSaving(false);
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
            <p style={{ color: "var(--text-secondary)" }}>Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="animate-page-enter space-y-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/payments/manual">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition">
              <ArrowLeft className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Manual Payment Settings
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-hint)" }}>
              Configure bank transfer payment details
            </p>
          </div>
        </div>

        {/* Settings Card */}
        <div
          className="rounded-lg border p-6"
          style={{ borderColor: "var(--border-light)", background: "var(--surface-paper)" }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Status Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: "var(--surface-low)" }}>
              <div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  Enable Manual Bank Transfers
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-hint)" }}>
                  Allow customers to pay via bank transfer
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isEnabled")}
                  className="w-5 h-5 rounded"
                />
              </label>
            </div>

            {/* Bank Details Section */}
            <div className="space-y-4">
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Bank Account Details
              </h3>

              <FormInput
                label="Bank Name"
                placeholder="e.g., First Bank of Nigeria"
                error={errors.bankName?.message}
                {...register("bankName")}
              />

              <FormInput
                label="Account Name"
                placeholder="e.g., Green Pasture Organics"
                error={errors.accountName?.message}
                {...register("accountName")}
              />

              <FormInput
                label="Account Number"
                placeholder="e.g., 1234567890"
                error={errors.accountNumber?.message}
                {...register("accountNumber")}
              />
            </div>

            {/* Instructions Section */}
            <div className="space-y-4">
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Customer Instructions
              </h3>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Payment Instructions
                </label>
                <textarea
                  {...register("instructions")}
                  placeholder="e.g., Please include your order number in the transfer reference"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: "var(--border-light)",
                    "--tw-ring-color": "var(--color-primary)",
                  } as any}
                  rows={4}
                />
                <p className="text-xs mt-1" style={{ color: "var(--text-hint)" }}>
                  This will be displayed to customers on the payment instructions page
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t" style={{ borderColor: "var(--border-light)" }}>
              <Button
                type="submit"
                variant="filled"
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
              <Link href="/admin/payments/manual">
                <Button variant="text">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Info Alert */}
        <div
          className="rounded-lg p-4 border-l-4"
          style={{
            borderColor: "var(--color-primary)",
            backgroundColor: "rgba(59, 130, 246, 0.05)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>
            <strong>Note:</strong> These settings will be displayed to all customers when they select
            bank transfer as their payment method during checkout.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default withAdminAuth(AdminManualPaymentSettingsPage);
