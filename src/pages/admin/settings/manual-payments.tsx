import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Landmark } from "lucide-react";
import { useRouter } from "next/router";

import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { SettingsFrame } from "@/_components/SettingsFrame";
import { DetailSection } from "@/_UI/DetailField";
import { useHasPrivilege } from "@/_hooks/usePrivilege";
import { PanelHeading, SettingsSaveBar, ToggleRow } from "@/_components/SettingsParts";
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
  const router = useRouter();
  const hasPrivilege = useHasPrivilege();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<ManualPaymentSettings | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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

  const watched = watch();
  const canSave = hasPrivilege("MANAGE_STORE_SETTINGS");

  return (
    <AdminLayout pageTitle="Manual Payment Settings">
      <SettingsFrame active="manual">
        {isLoading ? (
          <div className="space-y-5">
            <PanelHeading title="Manual Payment Settings" description="Bank transfer details shown to customers at checkout" />
            <div className="border-border bg-card space-y-4 rounded-xl border p-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg" style={{ background: "var(--surface-medium)" }} />
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" aria-label="Manual payment settings">
            <PanelHeading title="Manual Payment Settings" description="Bank transfer details shown to customers at checkout" />
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
              {/* Without the privilege the fields are read-only: look, but no typing into something that cannot be saved. */}
              <fieldset disabled={!canSave} className="min-w-0 space-y-5 border-0 p-0">
                <DetailSection title="Availability" description="Turn bank transfer on or off at checkout.">
                  <ToggleRow
                    id="isEnabled"
                    title="Enable manual bank transfers"
                    description={isEnabled ? "Customers can pay by bank transfer." : "Bank transfer is hidden at checkout."}
                    checked={!!isEnabled}
                    onChange={(next) => setValue("isEnabled", next, { shouldDirty: true })}
                  />
                </DetailSection>

                <DetailSection title="Bank account" description="Where customers send the money.">
                  <div className="space-y-4 py-3">
                    <FormInput label="Bank Name" placeholder="e.g., First Bank of Nigeria" error={errors.bankName?.message} {...register("bankName")} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput label="Account Name" placeholder="e.g., Green Pasture Organics" error={errors.accountName?.message} {...register("accountName")} />
                      <FormInput label="Account Number" placeholder="e.g., 1234567890" error={errors.accountNumber?.message} {...register("accountNumber")} />
                    </div>
                  </div>
                </DetailSection>

                <DetailSection title="Customer instructions" description="Shown to customers on the payment instructions page.">
                  <div className="py-3">
                    <label htmlFor="instructions" className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
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
                  </div>
                </DetailSection>
              </fieldset>

              <aside className="space-y-3 lg:sticky lg:top-4">
                <DetailSection title="What customers see" description="Updates as you type.">
                  <div className="space-y-4 py-4">
                    {!isEnabled && (
                      <p className="rounded-lg px-3 py-2 text-xs font-medium" style={{ background: "var(--surface-medium)", color: "var(--text-secondary)" }}>
                        Hidden at checkout while transfers are off.
                      </p>
                    )}
                    <div className={isEnabled ? "" : "opacity-50"}>
                      <div className="mb-3 flex items-center gap-2">
                        <Landmark className="size-4" style={{ color: "var(--color-primary)" }} />
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          Pay by bank transfer
                        </span>
                      </div>
                      <dl className="space-y-3 text-sm">
                        {[
                          ["Bank", watched.bankName],
                          ["Account name", watched.accountName],
                          ["Account number", watched.accountNumber],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0">
                            <dt className="text-xs" style={{ color: "var(--text-hint)" }}>
                              {label}
                            </dt>
                            <dd className={`truncate font-semibold ${label === "Account number" ? "font-mono tracking-wider" : ""}`} style={{ color: "var(--text-primary)" }} title={value || undefined}>
                              {value || "—"}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      {watched.instructions?.trim() && (
                        <p className="mt-4 whitespace-pre-wrap rounded-lg px-3 py-2 text-xs" style={{ background: "var(--surface-medium)", color: "var(--text-secondary)" }}>
                          {watched.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                </DetailSection>
              </aside>
            </div>
            <SettingsSaveBar
              hint="These details are shown to every customer who chooses bank transfer at checkout."
              resetLabel="Cancel"
              onReset={() => router.push("/admin/payments/manual")}
              submitLabel="Save settings"
              saving={isSaving}
              readOnlyNote={canSave ? undefined : "You can view these details, but changing them needs the MANAGE_STORE_SETTINGS privilege."}
            />
          </form>
        )}
      </SettingsFrame>
    </AdminLayout>
  );
};

export default withAdminAuth(AdminManualPaymentSettingsPage);
