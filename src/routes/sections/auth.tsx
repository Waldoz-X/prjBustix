import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router";
import { Outlet } from "react-router";

const LoginPage = lazy(() => import("@/pages/sys/login"));
const ConfirmEmailPage = lazy(() => import("@/pages/sys/confirm-email/index"));

const authCustom: RouteObject[] = [
	{
		path: "login",
		element: <LoginPage />,
	},
	{
		path: "confirm-email",
		element: <ConfirmEmailPage />,
	},
];

export const authRoutes: RouteObject[] = [
	{
		path: "auth",
		element: (
			<Suspense>
				<Outlet />
			</Suspense>
		),
		children: [...authCustom],
	},
];
