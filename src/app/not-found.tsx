import Link from "next/link";
import { Compass } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page py-16">
      <EmptyState
        icon={Compass}
        title="We could not find that page."
        description="The link may be outdated, or the event is no longer available."
        action={
          <Button asChild>
            <Link href="/events">Browse events</Link>
          </Button>
        }
      />
    </div>
  );
}
