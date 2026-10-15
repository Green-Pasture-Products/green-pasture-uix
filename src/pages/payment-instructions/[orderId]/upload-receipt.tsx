import React, { useState } from "react";
import { useRouter } from "next/router";
import { Upload, X, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

import Layout from "@/_components/Layout";
import Button from "@/_UI/Button";
import axiosInstance from "@/_utils/axiosInstance";

const UploadReceiptPage: React.FC = () => {
  const router = useRouter();
  const { orderId } = router.query;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type) && !isPdf) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !orderId) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("receipt", selectedFile);

      await axiosInstance.post(
        `/payment/${orderId}/manual/upload-receipt`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setUploadSuccess(true);
      toast.success("Receipt uploaded successfully!");

      router.push("/my-orders");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to upload receipt",
      );
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Receipt Uploaded!
            </h1>
            <p style={{ color: "var(--text-secondary)" }} className="mb-6">
              Your payment receipt has been submitted and is awaiting verification. We'll
              notify you once it's been reviewed.
            </p>
            <p className="text-sm" style={{ color: "var(--text-hint)" }}>
              Redirecting to your orders...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Upload Payment Receipt
        </h1>
        <p style={{ color: "var(--text-secondary)" }} className="mb-8">
          Order Reference: <span className="font-semibold">{orderId}</span>
        </p>

        {/* Upload Area */}
        <div
          className="rounded-lg border-2 border-dashed p-8 mb-8 text-center"
          style={{
            borderColor: "var(--border-light)",
            backgroundColor: "var(--surface-paper)",
          }}
        >
          <input
            type="file"
            id="file-upload"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer block">
            <Upload className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--color-primary)" }} />
            <p className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Click to upload receipt
            </p>
            <p style={{ color: "var(--text-secondary)" }} className="text-sm">
              or drag and drop
            </p>
            <p style={{ color: "var(--text-hint)" }} className="text-xs mt-2">
              JPG, PNG, or PDF (max 5MB)
            </p>
          </label>
        </div>

        {/* File Preview */}
        {selectedFile && (
          <div
            className="rounded-lg border p-6 mb-8"
            style={{ borderColor: "var(--border-light)", backgroundColor: "var(--surface-paper)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {selectedFile.name}
                </p>
                <p style={{ color: "var(--text-hint)" }} className="text-sm">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="p-2 rounded-lg transition"
                style={{ backgroundColor: "var(--surface-low)" }}
              >
                <X className="h-5 w-5" style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>

            {/* Image Preview */}
            {preview && (
              <div className="mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Receipt preview"
                  className="max-h-48 rounded-lg mx-auto object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div
          className="rounded-lg border p-6 mb-8"
          style={{ borderColor: "var(--border-light)", backgroundColor: "var(--surface-paper)" }}
        >
          <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            What to include in your receipt
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span style={{ color: "var(--color-primary)" }}>✓</span>
              <span style={{ color: "var(--text-secondary)" }}>Clear view of the transaction amount</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: "var(--color-primary)" }}>✓</span>
              <span style={{ color: "var(--text-secondary)" }}>Bank or payment method name</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: "var(--color-primary)" }}>✓</span>
              <span style={{ color: "var(--text-secondary)" }}>Transaction reference/confirmation number</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: "var(--color-primary)" }}>✓</span>
              <span style={{ color: "var(--text-secondary)" }}>Date of transaction</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1 py-3 rounded-lg font-semibold text-white disabled:opacity-50 transition"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {isUploading ? "Uploading..." : "Upload Receipt"}
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-lg font-semibold transition"
            style={{
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
          >
            Cancel
          </button>
        </div>

        {/* Help Text */}
        <p style={{ color: "var(--text-hint)" }} className="text-xs text-center mt-6">
          Having trouble? Contact our support team for help.
        </p>
      </div>
    </Layout>
  );
};

export default UploadReceiptPage;
