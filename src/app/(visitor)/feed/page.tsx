import type { Metadata } from "next";

import { FeedView } from "@/components/feed/feed-view";

export const metadata: Metadata = {
  title: "My Feed",
  description: "Upcoming events from the categories you follow.",
};

export default function FeedPage() {
  return <FeedView />;
}
