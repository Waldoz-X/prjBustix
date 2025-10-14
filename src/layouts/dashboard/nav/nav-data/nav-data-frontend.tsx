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
	// BusTix Modules
	{
		name: "BusTix",
		items: [
			{
				title: "Dashboard",
				path: "/dashboard",
				icon: <Icon icon="solar:home-2-bold-duotone" size="24" />,
			},
			{
				title: "Notificaciones",
				path: "/notifications",
				icon: <Icon icon="solar:bell-bing-bold-duotone" size="24" />,
				info: <Badge variant="destructive">5</Badge>,
			},
		],
	},
	{
		name: "Eventos Masivos",
		items: [
			{
				title: "Gestión de Eventos",
				path: "/events",
				icon: <Icon icon="solar:calendar-bold-duotone" size="24" />,
			},
			{
				title: "Rutas Públicas",
				path: "/routes/public",
				icon: <Icon icon="solar:map-point-bold-duotone" size="24" />,
			},
			{
				title: "Boletos Vendidos",
				path: "/tickets",
				icon: <Icon icon="solar:ticket-bold-duotone" size="24" />,
			},
			{
				title: "Estadísticas Eventos",
				path: "/analytics/events",
				icon: <Icon icon="solar:chart-bold-duotone" size="24" />,
			},
		],
	},
	{
		name: "Viajes Privados",
		items: [
			{
				title: "Cotizaciones",
				path: "/quotes",
				icon: <Icon icon="solar:chat-round-money-bold-duotone" size="24" />,
				info: <Badge variant="warning">3</Badge>,
			},
			{
				title: "Reservas Privadas",
				path: "/bookings/private",
				icon: <Icon icon="solar:case-round-bold-duotone" size="24" />,
			},
			{
				title: "Clientes Corporativos",
				path: "/corporate",
				icon: <Icon icon="solar:users-group-rounded-bold-duotone" size="24" />,
			},
			{
				title: "Contratos",
				path: "/contracts",
				icon: <Icon icon="solar:document-text-bold-duotone" size="24" />,
			},
		],
	},
	{
		name: "Recursos Operativos",
		items: [
			{
				title: "Flota de Vehículos",
				path: "/fleet",
				icon: <Icon icon="solar:bus-bold-duotone" size="24" />,
			},
			{
				title: "Operadores",
				path: "/operators",
				icon: <Icon icon="solar:user-check-rounded-bold-duotone" size="24" />,
			},
			{
				title: "Mantenimientos",
				path: "/maintenance",
				icon: <Icon icon="solar:settings-bold-duotone" size="24" />,
			},
			{
				title: "Calendario General",
				path: "/calendar-general",
				icon: <Icon icon="solar:calendar-mark-bold-duotone" size="24" />,
			},
		],
	},
	{
		name: "Finanzas",
		items: [
			{
				title: "Ingresos y Ventas",
				path: "/finance/revenue",
				icon: <Icon icon="solar:dollar-bold-duotone" size="24" />,
			},
			{
				title: "Facturación CFDI",
				path: "/invoices",
				icon: <Icon icon="solar:bill-list-bold-duotone" size="24" />,
			},
			{
				title: "Reportes Financieros",
				path: "/finance/reports",
				icon: <Icon icon="solar:chart-2-bold-duotone" size="24" />,
			},
			{
				title: "Servicios Adicionales",
				path: "/services",
				icon: <Icon icon="solar:box-bold-duotone" size="24" />,
			},
		],
	},
	{
		name: "Configuración",
		items: [
			{
				title: "Precios y Tarifas",
				path: "/settings/pricing",
				icon: <Icon icon="solar:tag-price-bold-duotone" size="24" />,
			},
			{
				title: "Usuarios y Roles",
				path: "/settings/users",
				icon: <Icon icon="solar:shield-user-bold-duotone" size="24" />,
			},
			{
				title: "Configuración General",
				path: "/settings",
				icon: <Icon icon="solar:settings-bold-duotone" size="24" />,
			},
		],
	},
	{
		name: "sys.nav.dashboard",
		items: [
			{
				title: "sys.nav.workbench",
				path: "/workbench",
				icon: <Icon icon="local:ic-workbench" size="24" />,
			},
			{
				title: "sys.nav.analysis",
				path: "/analysis",
				icon: <Icon icon="local:ic-analysis" size="24" />,
			},
		],
	},
	{
		name: "sys.nav.pages",
		items: [
			// management
			{
				title: "sys.nav.management",
				path: "/management",
				icon: <Icon icon="local:ic-management" size="24" />,
				children: [
					{
						title: "sys.nav.user.index",
						path: "/management/user",
						children: [
							{
								title: "sys.nav.user.profile",
								path: "/management/user/profile",
							},
							{
								title: "sys.nav.user.account",
								path: "/management/user/account",
							},
						],
					},
					{
						title: "sys.nav.system.index",
						path: "/management/system",
						children: [
							{
								title: "sys.nav.system.permission",
								path: "/management/system/permission",
							},
							{
								title: "sys.nav.system.role",
								path: "/management/system/role",
							},
							{
								title: "sys.nav.system.user",
								path: "/management/system/user",
							},
						],
					},
				],
			},
			// menulevel
			{
				title: "sys.nav.menulevel.index",
				path: "/menu_level",
				icon: <Icon icon="local:ic-menulevel" size="24" />,
				children: [
					{
						title: "sys.nav.menulevel.1a",
						path: "/menu_level/1a",
					},
					{
						title: "sys.nav.menulevel.1b.index",
						path: "/menu_level/1b",
						children: [
							{
								title: "sys.nav.menulevel.1b.2a",
								path: "/menu_level/1b/2a",
							},
							{
								title: "sys.nav.menulevel.1b.2b.index",
								path: "/menu_level/1b/2b",
								children: [
									{
										title: "sys.nav.menulevel.1b.2b.3a",
										path: "/menu_level/1b/2b/3a",
									},
									{
										title: "sys.nav.menulevel.1b.2b.3b",
										path: "/menu_level/1b/2b/3b",
									},
								],
							},
						],
					},
				],
			},
			// errors
			{
				title: "sys.nav.error.index",
				path: "/error",
				icon: <Icon icon="bxs:error-alt" size="24" />,
				children: [
					{
						title: "sys.nav.error.403",
						path: "/error/403",
					},
					{
						title: "sys.nav.error.404",
						path: "/error/404",
					},
					{
						title: "sys.nav.error.500",
						path: "/error/500",
					},
				],
			},
		],
	},
	{
		name: "sys.nav.ui",
		items: [
			// components
			{
				title: "sys.nav.components",
				path: "/components",
				icon: <Icon icon="solar:widget-5-bold-duotone" size="24" />,
				caption: "sys.nav.custom_ui_components",
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
			// functions
			{
				title: "sys.nav.functions",
				path: "/functions",
				icon: <Icon icon="solar:plain-2-bold-duotone" size="24" />,
				children: [
					{
						title: "sys.nav.clipboard",
						path: "/functions/clipboard",
					},
					{
						title: "sys.nav.token_expired",
						path: "/functions/token_expired",
					},
				],
			},
		],
	},
	{
		name: "sys.nav.others",
		items: [
			{
				title: "sys.nav.permission",
				path: "/permission",
				icon: <Icon icon="mingcute:safe-lock-fill" size="24" />,
			},
			{
				title: "sys.nav.permission.page_test",
				path: "/permission/page-test",
				icon: <Icon icon="mingcute:safe-lock-fill" size="24" />,
				auth: ["permission: "],
				hidden: true,
			},
			{
				title: "sys.nav.calendar",
				path: "/calendar",
				icon: <Icon icon="solar:calendar-bold-duotone" size="24" />,
				info: <Badge variant="warning">+12</Badge>,
			},
			{
				title: "sys.nav.kanban",
				path: "/kanban",
				icon: <Icon icon="solar:clipboard-bold-duotone" size="24" />,
			},
			{
				title: "sys.nav.disabled",
				path: "/disabled",
				icon: <Icon icon="local:ic-disabled" size="24" />,
				disabled: true,
			},
			{
				title: "sys.nav.label",
				path: "#label",
				icon: <Icon icon="local:ic-label" size="24" />,
				info: (
					<Badge variant="info">
						<Icon icon="solar:bell-bing-bold-duotone" size={14} />
						New
					</Badge>
				),
			},
			{
				title: "sys.nav.link",
				path: "/link",
				icon: <Icon icon="local:ic-external" size="24" />,
				children: [
					{
						title: "sys.nav.external_link",
						path: "/link/external-link",
					},
					{
						title: "sys.nav.iframe",
						path: "/link/iframe",
					},
				],
			},
			{
				title: "sys.nav.blank",
				path: "/blank",
				icon: <Icon icon="local:ic-blank" size="24" />,
			},
		],
	},
];
