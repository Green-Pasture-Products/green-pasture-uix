import type * as React from "react";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "brand" | "success" | "warning" | "danger";
  disabled?: boolean;
  hidden?: boolean;
  separatorAbove?: boolean;
}

export interface ActionDropdownProps {
  title?: string;
  items: ActionMenuItem[];
  align?: "start" | "center" | "end";
  className?: string;
}
