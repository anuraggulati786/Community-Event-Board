import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card/60">
      <div className="container-page flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>Community Events Board — local events, all in one place.</p>
        <div className="flex items-center gap-5">
          <Link href="/events" className="hover:text-foreground">
            Events
          </Link>
          <Link href="/feed" className="hover:text-foreground">
            My Feed
          </Link>
          <Link href="/admin/login" className="hover:text-foreground">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
