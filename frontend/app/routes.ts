import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

const projectRoutes = prefix("projects", [
  index("routes/projects/list.tsx"),
  route("new", "routes/projects/new.tsx"),
  route(":projectId", "routes/projects/detail.tsx"),
]);

const runRoutes = prefix("runs", [
  route("new", "routes/runs/new.tsx"),
  route(":runId", "routes/runs/pipeline.tsx"),
  route(":runId/plan-review", "routes/runs/plan-review.tsx"),
  route(":runId/code-review", "routes/runs/code-review.tsx"),
]);

export default [
  layout("routes/app-layout.tsx", [
    index("routes/dashboard/dashboard.tsx"),
    ...projectRoutes,
    ...runRoutes,
    route("role-configs", "routes/role-configs/edit.tsx"),
  ]),
] satisfies RouteConfig;
