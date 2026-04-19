import { type RouteConfig, index } from "@react-router/dev/routes";
import { authRoute } from "./routes/auth/auth.route";

export default [index("routes/home.tsx"), authRoute] satisfies RouteConfig;
