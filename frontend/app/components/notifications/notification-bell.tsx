import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { Bell } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import { notificationQueries } from "~/lib/queries";
import { notificationMutations } from "~/lib/mutations";
import { cn } from "~/lib/utils";
import type { AppNotification } from "~/lib/queries";

function linkForNotification(notification: AppNotification): string | null {
  if (!notification.runId) return null;
  switch (notification.type) {
    case "plan_ready_for_review":
      return `/runs/${notification.runId}/plan-review`;
    case "code_ready_for_review":
      return `/runs/${notification.runId}/code-review`;
    default:
      return `/runs/${notification.runId}`;
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data } = useQuery(notificationQueries.list());
  const markRead = useMutation({
    ...notificationMutations.markRead(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationQueries.list().queryKey }),
  });
  const markAllRead = useMutation({
    ...notificationMutations.markAllRead(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationQueries.list().queryKey }),
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen((o) => !o)}>
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {open && (
        <>
          <button
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-medium">Notifications</span>
              {unreadCount > 0 && (
                <button
                  className="text-xs text-muted-foreground hover:underline"
                  onClick={() => markAllRead.mutate()}
                >
                  Mark all read
                </button>
              )}
            </div>
            <ScrollArea className="max-h-96">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                <ul>
                  {notifications.map((notification) => {
                    const href = linkForNotification(notification);
                    const content = (
                      <div
                        className={cn(
                          "border-b px-3 py-2 last:border-b-0 hover:bg-accent",
                          !notification.readAt && "bg-accent/40",
                        )}
                      >
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.body}</p>
                      </div>
                    );
                    return (
                      <li key={notification.id}>
                        {href ? (
                          <Link
                            to={href}
                            onClick={() => {
                              if (!notification.readAt) markRead.mutate(notification.id);
                              setOpen(false);
                            }}
                          >
                            {content}
                          </Link>
                        ) : (
                          <button
                            className="w-full text-left"
                            onClick={() => markRead.mutate(notification.id)}
                          >
                            {content}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}
