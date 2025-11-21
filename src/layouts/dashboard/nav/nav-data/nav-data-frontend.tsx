// -----------------------------------------------------------------------------
// nav-data-frontend.tsx
// Estructura de navegación para la barra lateral (navbar) del frontend.
// Cada objeto en el array representa una sección del menú y cada item es una ruta o grupo de rutas.
// -----------------------------------------------------------------------------
import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";
import { Badge } from "@/ui/badge";

/**
 * Estructura de una sección de la barra lateral:
 * - name: Nombre de la sección (puede ser string o key de traducción)
 * - items: Array de rutas o grupos de rutas
 *
 * Estructura de un item (ruta):
 * - title: Nombre visible o key de traducción
 * - path: Ruta a la que navega
 * - icon: (opcional) Icono a mostrar
 * - info: (opcional) Badge o información extra
 * - children: (opcional) Submenús o rutas anidadas
 * - disabled, hidden, auth, caption: (opcional) Propiedades adicionales para control de acceso, visibilidad, etc.
 *
 * Ejemplo básico de item:
 * {
 *   title: "Dashboard",
 *   path: "/dashboard",
 *   icon: <Icon icon="solar:home-2-bold-duotone" size="24" />,
 *   info: <Badge variant="destructive">5</Badge>,
 * }
 */

export const frontendNavData: NavProps["data"] = [
	// =========================================================================
	// SECCIÓN 1: DASHBOARD Y NOTIFICACIONES
	// Acceso: Todos los roles autenticados
	// =========================================================================
	{
		name: "Principal",
		items: [
			{
				title: "Dashboard",
				path: "/dashboard",
				icon: <Icon icon="solar:home-2-bold-duotone" size="24" />,
				// Visible para todos los usuarios autenticados
			},
			{
				title: "Notificaciones",
				path: "/notifications",
				icon: <Icon icon="solar:bell-bing-bold-duotone" size="24" />,
				info: <Badge variant="destructive">5</Badge>,
				// Visible para todos los usuarios autenticados
			},
		],
	},

	// =========================================================================
	// SECCIÓN 2: EVENTOS MASIVOS
	// Acceso: Admin, Manager, Operator (limitado)
	// =========================================================================
	{
		name: "Eventos Masivos",
		items: [
			{
				title: "Gestión de Eventos",
				path: "/events",
				icon: <Icon icon="solar:calendar-bold-duotone" size="24" />,
				auth: ["Admin", "Manager"],
			},
			{
				title: "Rutas Públicas",
				path: "/rutas",
				icon: <Icon icon="solar:map-point-bold-duotone" size="24" />,
				auth: ["Admin", "Manager", "Operator"],
			},
			{
				title: "Boletos Vendidos",
				path: "/tickets",
				icon: <Icon icon="solar:ticket-bold-duotone" size="24" />,
				auth: ["Admin", "Manager"],
			},
			{
				title: "Estadísticas de Eventos",
				path: "/analytics/events",
				icon: <Icon icon="solar:chart-bold-duotone" size="24" />,
				auth: ["Admin", "Manager"],
			},
		],
	},

	// =========================================================================
	// SECCIÓN 3: VIAJES Y OPERACIONES
	// Acceso: Admin, Manager, Operator, Staff (según asignación)
	// =========================================================================
	{
		name: "Viajes y Operaciones",
		items: [
			{
				title: "Gestión de Viajes",
				path: "/trips",
				icon: <Icon icon="solar:bus-bold-duotone" size="24" />,
				auth: ["Admin", "Manager"],
			},
			{
				title: "Mis Viajes Asignados",
				path: "/trips/assigned",
				icon: <Icon icon="solar:clipboard-list-bold-duotone" size="24" />,
				auth: ["Operator", "Staff"],
			},
			{
				title: "Asignación de Staff",
				path: "/trips/staff-assignment",
				icon: <Icon icon="solar:users-group-rounded-bold-duotone" size="24" />,
				auth: ["Admin", "Manager"],
			},
			{
				title: "Check-In Progresivo",
				path: "/trips/checkin",
				icon: <Icon icon="solar:check-circle-bold-duotone" size="24" />,
				auth: ["Operator", "Staff"],
			},
			{
				title: "Validación de Boletos",
				path: "/trips/validation",
				icon: <Icon icon="solar:ticket-sale-bold-duotone" size="24" />,
				auth: ["Operator", "Staff"],
			},
		],
	},

	// =========================================================================
	// SECCIÓN 4: RECURSOS OPERATIVOS
	// Acceso: Admin, Manager, Operator (limitado)
	// =========================================================================
	{
		name: "Recursos Operativos",
		items: [
			{
				title: "Flota de Vehículos",
				path: "/fleet",
				icon: <Icon icon="solar:bus-bold-duotone" size="24" />,
				auth: ["Admin", "Manager", "Operator"],
			},
			{
				title: "Staff y Operadores",
				path: "/operators",
				icon: <Icon icon="solar:user-check-rounded-bold-duotone" size="24" />,
				auth: ["Admin", "Manager"],
				children: [
					{
						title: "Lista de Operadores",
						path: "/operators/list",
					},
					{
						title: "Roles y Permisos",
						path: "/operators/roles",
					},
					{
						title: "Gestión de Accesos",
						path: "/operators/access",
						auth: ["Admin"],
					},
				],
			},
			{
				title: "Incidencias",
				path: "/incidents",
				icon: <Icon icon="solar:danger-triangle-bold-duotone" size="24" />,
				auth: ["Admin", "Manager", "Operator", "Staff"],
			},
			{
				title: "Calendario General",
				path: "/calendar-general",
				icon: <Icon icon="solar:calendar-mark-bold-duotone" size="24" />,
				auth: ["Admin", "Manager", "Operator"],
			},
		],
	},

	// =========================================================================
	// SECCIÓN 5: FINANZAS
	// Acceso: Admin, Manager
	// =========================================================================
	{
		name: "Finanzas",
		items: [
			{
				title: "Ingresos y Ventas",
				path: "/finance/revenue",
				icon: <Icon icon="solar:dollar-bold-duotone" size="24" />,
				auth: ["Admin", "Manager"],
			},
			{
				title: "Pagos",
				path: "/finance/payments",
				icon: <Icon icon="solar:card-bold-duotone" size="24" />,
				auth: ["Admin", "Manager"],
			},
			{
				title: "Cupones de Descuento",
				path: "/management/cupones",
				icon: <Icon icon="solar:ticket-sale-bold-duotone" size="24" />,
				auth: ["Admin", "Manager"],
			},
			{
				title: "Reportes Financieros",
				path: "/finance/reports",
				icon: <Icon icon="solar:chart-2-bold-duotone" size="24" />,
				auth: ["Admin", "Manager"],
			},
		],
	},

	// =========================================================================
	// SECCIÓN 6: PRECIOS Y TARIFAS
	// Acceso: Admin, Manager
	// =========================================================================
	{
		name: "Precios y Tarifas",
		items: [
			{
				title: "Configuración de Precios",
				path: "/pricing/configuration",
				icon: <Icon icon="solar:tag-price-bold-duotone" size="24" />,
				auth: ["Admin", "Manager"],
			},
		],
	},

	// =========================================================================
	// SECCIÓN 7: CONFIGURACIÓN Y ADMINISTRACIÓN
	// Acceso: Admin (principalmente)
	// =========================================================================
	{
		name: "Configuración",
		items: [
			{
				title: "Gestión de Usuarios",
				path: "/management/users",
				icon: <Icon icon="solar:users-group-rounded-bold-duotone" size="24" />,
				auth: ["Admin"],
				children: [
					{
						title: "Lista de Usuarios",
						path: "/management/users/list",
					},
					{
						title: "Roles y Permisos",
						path: "/management/users/roles",
					},
				],
			},
			{
				title: "Confirmación de Email",
				path: "/settings/email-confirmation",
				icon: <Icon icon="solar:letter-opened-bold-duotone" size="24" />,
				auth: ["Admin"],
			},
			{
				title: "Auditoría",
				path: "/settings/audit",
				icon: <Icon icon="solar:document-text-bold-duotone" size="24" />,
				auth: ["Admin"],
			},
			{
				title: "Configuración General",
				path: "/settings",
				icon: <Icon icon="solar:settings-bold-duotone" size="24" />,
				auth: ["Admin"],
			},
		],
	},

	// =========================================================================
	// SECCIÓN 8: MI PERFIL
	// Acceso: Todos los usuarios autenticados
	// =========================================================================
	{
		name: "Mi Perfil",
		items: [
			{
				title: "Mi Perfil",
				path: "/profile",
				icon: <Icon icon="solar:user-bold-duotone" size="24" />,
				// Visible para todos los usuarios autenticados
			},
			{
				title: "Mis Boletos",
				path: "/profile/tickets",
				icon: <Icon icon="solar:ticket-bold-duotone" size="24" />,
				// Visible para todos los usuarios autenticados
			},
			{
				title: "Cambiar Contraseña",
				path: "/profile/change-password",
				icon: <Icon icon="solar:lock-password-bold-duotone" size="24" />,
				// Visible para todos los usuarios autenticados
			},
		],
	},

	// =========================================================================
	// SECCIÓN 9: DESARROLLO Y TESTING
	// Acceso: Solo Admin - Para desarrollo y pruebas
	// =========================================================================
	{
		name: "Desarrollo",
		items: [
			{
				title: "sys.nav.workbench",
				path: "/workbench",
				icon: <Icon icon="local:ic-workbench" size="24" />,
				auth: ["Admin"],
			},
			{
				title: "sys.nav.analysis",
				path: "/analysis",
				icon: <Icon icon="local:ic-analysis" size="24" />,
				auth: ["Admin"],
			},
			{
				title: "sys.nav.components",
				path: "/components",
				icon: <Icon icon="solar:widget-5-bold-duotone" size="24" />,
				caption: "sys.nav.custom_ui_components",
				auth: ["Admin"],
				children: [
					{
						title: "sys.nav.icon",
						path: "/components/icon",
					},
					{
						title: "sys.nav.animate",
						path: "/components/animate",
					},
					{
						title: "sys.nav.scroll",
						path: "/components/scroll",
					},
					{
						title: "sys.nav.i18n",
						path: "/components/multi-language",
					},
					{
						title: "sys.nav.upload",
						path: "/components/upload",
					},
					{
						title: "sys.nav.chart",
						path: "/components/chart",
					},
					{
						title: "sys.nav.toast",
						path: "/components/toast",
					},
				],
			},
			{
				title: "sys.nav.permission",
				path: "/permission",
				icon: <Icon icon="mingcute:safe-lock-fill" size="24" />,
				auth: ["Admin"],
			},
			{
				title: "sys.nav.calendar",
				path: "/calendar",
				icon: <Icon icon="solar:calendar-bold-duotone" size="24" />,
				info: <Badge variant="warning">+12</Badge>,
				auth: ["Admin"],
			},
			{
				title: "sys.nav.kanban",
				path: "/kanban",
				icon: <Icon icon="solar:clipboard-bold-duotone" size="24" />,
				auth: ["Admin"],
			},
			{
				title: "Cerrar Sesión",
				path: "/functions/token_expired",
				icon: <Icon icon="solar:logout-2-bold-duotone" size="24" />,
				// Visible para todos los usuarios autenticados
			},
		],
	},
];
