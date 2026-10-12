import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RemindersProvider } from "@/hooks/use-reminders";
import { SessionProvider } from "@/hooks/use-session";

/**
 * Everything a visitor sees shares this shell: the session context (who is
 * signed in), the reminders context (the "Remind me" state) and the chrome.
 */
export default function VisitorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RemindersProvider>
        <div className="flex min-h-dvh flex-col">
          <SiteHeader />
          <main className="container-page flex-1 py-8 sm:py-10">{children}</main>
          <SiteFooter />
        </div>
      </RemindersProvider>
    </SessionProvider>
  );
}
