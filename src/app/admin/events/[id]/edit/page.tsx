import type { Metadata } from "next";

import { AdminEditEvent } from "@/components/admin/admin-edit-event";

export const metadata: Metadata = {
  title: "Edit event",
};

export default function EditEventPage() {
  return <AdminEditEvent />;
}
