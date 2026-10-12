import * as React from "react";

import { cn } from "@/lib/utils";

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn("flex w-full items-start gap-3 rounded-lg border p-4 text-sm", className)}
      {...props}
    />
  ),
);
Alert.displayName = "Alert";

export { Alert };
