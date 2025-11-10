import { Navigate, type RouteObject } from "react-router";
import { authRoutes } from "./auth";
import { dashboardRoutes } from "./dashboard";
import { mainRoutes } from "./main";
import { publicRoutes } from "./public";

export const routesSection: RouteObject[] = [
	// Public Landing Pages
	...publicRoutes,
	// Auth
	...authRoutes,
	// Dashboard
	...dashboardRoutes,
	// Main
	...mainRoutes,
	// No Match
	{ path: "*", element: <Navigate to="/404" replace /> },
];
