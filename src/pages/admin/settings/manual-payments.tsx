import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import Link from "next/link";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { SettingsFrame } from "@/_components/SettingsFrame";
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

  const CARD = "border-border bg-card overflow-hidden rounded-xl border";
  const header = (
    <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border-light)" }}>
      <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        Manual Payment Settings
      </h3>
      <p className="mt-0.5 text-xs" style={{ color: "var(--text-hint)" }}>
        Bank transfer details shown to customers at checkout
      </p>
    </div>
  );

  return (
    <AdminLayout pageTitle="Manual Payment Settings">
      <SettingsFrame active="manual">
        {isLoading ? (
          <div className={CARD}>
            {header}
            <div className="space-y-4 p-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg" style={{ background: "var(--surface-medium)" }} />
              ))}
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className={CARD} aria-label="Manual payment settings">
              {header}
              <div className="space-y-6 p-6">
                <div className="flex items-center justify-between gap-4 rounded-lg p-4" style={{ background: "var(--surface-low)" }}>
                  <div className="min-w-0">
                    <label htmlFor="isEnabled" className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      Enable manual bank transfers
                    </label>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-hint)" }}>
                      {isEnabled ? "Customers can pay by bank transfer." : "Bank transfer is hidden at checkout."}
                    </p>
                  </div>
                  <input id="isEnabled" type="checkbox" {...register("isEnabled")} className="size-5 shrink-0 rounded accent-[var(--color-primary)]" />
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-hint)" }}>
                    Bank account
                  </h4>
                  <FormInput label="Bank Name" placeholder="e.g., First Bank of Nigeria" error={errors.bankName?.message} {...register("bankName")} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput label="Account Name" placeholder="e.g., Green Pasture Organics" error={errors.accountName?.message} {...register("accountName")} />
                    <FormInput label="Account Number" placeholder="e.g., 1234567890" error={errors.accountNumber?.message} {...register("accountNumber")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-hint)" }}>
                    Customer instructions
                  </h4>
                  <label htmlFor="instructions" className="block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Payment instructions
                  </label>
                  <textarea
                    id="instructions"
                    {...register("instructions")}
                    placeholder="e.g., Please include your order number in the transfer reference"
                    rows={4}
                    className="w-full resize-y rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border-light)", background: "var(--surface-low)", color: "var(--text-primary)" }}
                  />
                  <p className="text-xs" style={{ color: "var(--text-hint)" }}>
                    Shown to customers on the payment instructions page.
                  </p>
                </div>
              </div>
              <div className="border-border bg-secondary/15 flex justify-end gap-2 border-t px-6 py-3">
                <Link href="/admin/payments/manual">
                  <Button type="button" variant="outlined" color="secondary" size="sm">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" variant="filled" size="sm" disabled={isSaving} leftIcon={Save}>
                  {isSaving ? "Saving..." : "Save settings"}
                </Button>
              </div>
            </form>
            <p className="text-muted-foreground text-xs">These details are shown to every customer who chooses bank transfer at checkout.</p>
          </>
        )}
      </SettingsFrame>
    </AdminLayout>
  );
};

export default withAdminAuth(AdminManualPaymentSettingsPage);
