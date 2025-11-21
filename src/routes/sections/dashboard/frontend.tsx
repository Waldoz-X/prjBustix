import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import { Component } from "./utils";

export function getFrontendDashboardRoutes(): RouteObject[] {
	return [
		// Dashboard y Notificaciones
		{ path: "dashboard", element: Component("/pages/dashboard") },
		{ path: "notifications", element: Component("/pages/notifications") },

		// Eventos Masivos
		{ path: "events", element: Component("/pages/management/events") },
		{ path: "rutas", element: Component("/pages/rutas") },
		{ path: "tickets", element: Component("/pages/tickets") },
		{ path: "analytics/events", element: Component("/pages/analytics/events") },

		// Recursos Operativos
		{ path: "fleet", element: Component("/pages/unidades") },
		{ path: "calendar-general", element: Component("/pages/calendar/general") },
		{ path: "incidents", element: Component("/pages/incidents") },

		// Operadores (mapea a src/pages/operators con subrutas)
		{
			path: "operators",
			children: [
				{ index: true, element: <Navigate to="list" replace /> },
				{ path: "list", element: Component("/pages/operators/list") },
				{ path: "roles", element: Component("/pages/operators/roles") },
				{ path: "access", element: Component("/pages/operators/access") },
			],
		},

		// Viajes y Operaciones
		{
			path: "trips",
			children: [
				{ index: true, element: Component("/pages/trips") },
				{ path: "assigned", element: Component("/pages/trips/assigned") },
				{ path: "staff-assignment", element: Component("/pages/trips/staff-assignment") },
				{ path: "checkin", element: Component("/pages/trips/checkin") },
				{ path: "validation", element: Component("/pages/trips/validation") },
			],
		},

		// Finanzas
		{
			path: "finance",
			children: [
				{ index: true, element: <Navigate to="revenue" replace /> },
				{ path: "revenue", element: Component("/pages/finance/revenue") },
				{ path: "payments", element: Component("/pages/finance/payments") },
				{ path: "reports", element: Component("/pages/finance/reports") },
			],
		},

		// Precios y Tarifas
		{
			path: "pricing",
			children: [{ path: "configuration", element: Component("/pages/pricing/configuration") }],
		},

		// Mi Perfil
		{
			path: "profile",
			children: [
				{ index: true, element: Component("/pages/profile") },
				{ path: "tickets", element: Component("/pages/profile/tickets") },
				{ path: "change-password", element: Component("/pages/profile/change-password") },
			],
		},

		// Desarrollo
		{ path: "workbench", element: Component("/pages/dashboard/workbench") },
		{ path: "analysis", element: Component("/pages/dashboard/analysis") },
		{ path: "debug-auth", element: Component("/pages/dashboard/debug-auth") },
		{
			path: "components",
			children: [
				{ index: true, element: <Navigate to="animate" replace /> },
				{ path: "animate", element: Component("/pages/components/animate") },
				{ path: "scroll", element: Component("/pages/components/scroll") },
				{ path: "multi-language", element: Component("/pages/components/multi-language") },
				{ path: "icon", element: Component("/pages/components/icon") },
				{ path: "upload", element: Component("/pages/components/upload") },
				{ path: "chart", element: Component("/pages/components/chart") },
				{ path: "toast", element: Component("/pages/components/toast") },
			],
		},
		{
			path: "functions",
			children: [
				{ index: true, element: <Navigate to="clipboard" replace /> },
				{ path: "clipboard", element: Component("/pages/functions/clipboard") },
				{ path: "token_expired", element: Component("/pages/functions/token-expired") },
			],
		},
		{
			path: "management",
			children: [
				{ index: true, element: <Navigate to="users" replace /> },
				{
					path: "users",
					children: [
						{ index: true, element: <Navigate to="list" replace /> },
						{ path: "list", element: Component("/pages/management/users/list") },
						{ path: "roles", element: Component("/pages/management/users/roles") },
					],
				},
				{
					path: "user",
					children: [
						{ index: true, element: <Navigate to="profile" replace /> },
						{ path: "profile", element: Component("/pages/management/user/profile") },
						{ path: "account", element: Component("/pages/management/user/account") },
					],
				},
				{
					path: "system",
					children: [
						{ index: true, element: <Navigate to="permission" replace /> },
						{ path: "permission", element: Component("/pages/management/system/permission") },
						{ path: "role", element: Component("/pages/management/system/role") },
						{ path: "user", element: Component("/pages/management/system/user") },
						{ path: "user/:id", element: Component("/pages/management/system/user/detail") },
					],
				},
				// Ruta de cupones
				{ path: "cupones", element: Component("/pages/management/cupones") },
			],
		},

		// Settings (Configuración)
		{
			path: "settings",
			children: [
				{ index: true, element: Component("/pages/settings") },
				{ path: "email-confirmation", element: Component("/pages/settings/email-confirmation") },
				{ path: "audit", element: Component("/pages/settings/audit") },
			],
		},
		{
			path: "error",
			children: [
				{ index: true, element: <Navigate to="403" replace /> },
				{ path: "403", element: Component("/pages/sys/error/Page403") },
				{ path: "404", element: Component("/pages/sys/error/Page404") },
				{ path: "500", element: Component("/pages/sys/error/Page500") },
			],
		},
		{
			path: "menu_level",
			children: [
				{ index: true, element: <Navigate to="1a" replace /> },
				{ path: "1a", element: Component("/pages/menu-level/menu-level-1a") },
				{
					path: "1b",
					children: [
						{ index: true, element: <Navigate to="2a" replace /> },
						{ path: "2a", element: Component("/pages/menu-level/menu-level-1b/menu-level-2a") },
						{
							path: "2b",
							children: [
								{ index: true, element: <Navigate to="3a" replace /> },
								{ path: "3a", element: Component("/pages/menu-level/menu-level-1b/menu-level-2b/menu-level-3a") },
								{ path: "3b", element: Component("/pages/menu-level/menu-level-1b/menu-level-2b/menu-level-3b") },
							],
						},
					],
				},
			],
		},
		{
			path: "link",
			children: [
				{ index: true, element: <Navigate to="iframe" replace /> },
				{ path: "iframe", element: Component("/pages/sys/others/link/iframe", { src: "https://ant.design/index-cn" }) },
				{
					path: "external-link",
					element: Component("/pages/sys/others/link/external-link", { src: "https://ant.design/index-cn" }),
				},
			],
		},
		{
			path: "permission",
			children: [
				{ index: true, element: Component("/pages/sys/others/permission") },
				{ path: "page-test", element: Component("/pages/sys/others/permission/page-test") },
			],
		},
		{ path: "calendar", element: Component("/pages/sys/others/calendar") },
		{ path: "kanban", element: Component("/pages/sys/others/kanban") },
		{ path: "blank", element: Component("/pages/sys/others/blank") },
	];
}
