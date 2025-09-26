import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"), 
    route('/admin', 'routes/admin.tsx'),
    route('/login', 'routes/login.tsx'),
    route('/status', 'routes/status.tsx'),
    route('/logout', 'routes/logout.tsx'),
] satisfies RouteConfig;
