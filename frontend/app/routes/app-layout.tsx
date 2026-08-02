import { Link, Outlet } from "react-router";
import { NotificationBell } from "~/components/notifications/notification-bell";
import { useNotificationStream } from "~/lib/sse";

export default function AppLayout() {
  useNotificationStream();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link to="/" className="font-semibold">
          Agent Orchestrator
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/projects" className="text-sm text-muted-foreground hover:text-foreground">
            Projects
          </Link>
          <Link
            to="/role-configs"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Role configs
          </Link>
          <NotificationBell />
        </nav>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
