import type { Metadata } from "next";

import { AdminEventsView } from "@/components/admin/admin-events-view";

export const metadata: Metadata = {
  title: "Events",
};

export default function AdminEventsPage() {
  return <AdminEventsView />;
}
