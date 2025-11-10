/**
 * Mapeo de permisos de la API a secciones del menú
 * Basado en los permisos definidos en tu API .NET
 */

/**
 * Permisos disponibles en el sistema (según AppPermissions.RolePermissions)
 */
export const APP_PERMISSIONS = {
	// Usuarios
	USERS_VIEW: "users:view",
	USERS_CREATE: "users:create",
	USERS_EDIT: "users:edit",
	USERS_DELETE: "users:delete",

	// Roles
	ROLES_VIEW: "roles:view",
	ROLES_CREATE: "roles:create",
	ROLES_EDIT: "roles:edit",
	ROLES_DELETE: "roles:delete",

	// Boletos
	TICKETS_VIEW: "tickets:view",
	TICKETS_CREATE: "tickets:create",
	TICKETS_EDIT: "tickets:edit",
	TICKETS_DELETE: "tickets:delete",

	// Reportes
	REPORTS_VIEW: "reports:view",
	REPORTS_GENERATE: "reports:generate",
} as const;

/**
 * Mapeo de rutas del menú a permisos requeridos
 * Si una ruta no está aquí, está disponible para todos los usuarios autenticados
 */
export const MENU_PERMISSIONS: Record<string, string[]> = {
	// Dashboard - accesible para todos los autenticados
	"/dashboard": [],
	"/notifications": [],

	// Eventos Masivos - requiere ver o crear boletos
	"/events": [APP_PERMISSIONS.TICKETS_VIEW],
	"/routes/public": [APP_PERMISSIONS.TICKETS_VIEW],
	"/tickets": [APP_PERMISSIONS.TICKETS_VIEW],
	"/analytics/events": [APP_PERMISSIONS.REPORTS_VIEW],

	// Viajes Privados - accesible para roles comerciales
	"/quotes": [APP_PERMISSIONS.TICKETS_CREATE],
	"/bookings/private": [APP_PERMISSIONS.TICKETS_VIEW],
	"/corporate": [APP_PERMISSIONS.USERS_VIEW], // Ver clientes corporativos
	"/contracts": [APP_PERMISSIONS.TICKETS_VIEW],

	// Recursos Operativos - requiere permisos de gestión
	"/fleet": [APP_PERMISSIONS.USERS_VIEW], // Ver flota
	"/operators": [APP_PERMISSIONS.USERS_VIEW],
	"/maintenance": [APP_PERMISSIONS.USERS_VIEW],
	"/calendar-general": [],

	// Finanzas - requiere ver reportes
	"/finance/revenue": [APP_PERMISSIONS.REPORTS_VIEW],
	"/invoices": [APP_PERMISSIONS.REPORTS_VIEW],
	"/finance/reports": [APP_PERMISSIONS.REPORTS_VIEW, APP_PERMISSIONS.REPORTS_GENERATE],
	"/services": [APP_PERMISSIONS.TICKETS_VIEW],

	// Configuración - solo Admin y roles con permisos específicos
	"/settings/pricing": [APP_PERMISSIONS.TICKETS_EDIT],
	"/settings/users": [APP_PERMISSIONS.USERS_VIEW, APP_PERMISSIONS.ROLES_VIEW],
	"/settings": [APP_PERMISSIONS.USERS_VIEW],

	// Management (sistema interno)
	"/management": [APP_PERMISSIONS.USERS_VIEW],
	"/management/user": [APP_PERMISSIONS.USERS_VIEW],
	"/management/user/profile": [APP_PERMISSIONS.USERS_VIEW],
	"/management/user/account": [APP_PERMISSIONS.USERS_EDIT],
	"/management/system": [APP_PERMISSIONS.ROLES_VIEW],
	"/management/system/permission": [APP_PERMISSIONS.ROLES_VIEW],
	"/management/system/role": [APP_PERMISSIONS.ROLES_VIEW, APP_PERMISSIONS.ROLES_EDIT],
	"/management/system/user": [APP_PERMISSIONS.USERS_VIEW, APP_PERMISSIONS.USERS_EDIT],
};

/**
 * Roles predefinidos en el sistema
 */
export const ROLES = {
	ADMIN: "Admin",
	OPERATOR: "Operator",
	ACCOUNTANT: "Accountant",
	SALESPERSON: "Salesperson",
	CLIENT: "Client",
} as const;

/**
 * Permisos por rol (según tu API)
 * Admin tiene "*" (acceso total)
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
	[ROLES.ADMIN]: ["*"], // Wildcard - acceso total

	// Operador - gestiona flota, operadores y mantenimientos
	[ROLES.OPERATOR]: [APP_PERMISSIONS.TICKETS_VIEW, APP_PERMISSIONS.USERS_VIEW],

	// Contador - solo finanzas y reportes
	[ROLES.ACCOUNTANT]: [APP_PERMISSIONS.REPORTS_VIEW, APP_PERMISSIONS.REPORTS_GENERATE],

	// Vendedor - gestiona boletos y cotizaciones
	[ROLES.SALESPERSON]: [APP_PERMISSIONS.TICKETS_VIEW, APP_PERMISSIONS.TICKETS_CREATE, APP_PERMISSIONS.TICKETS_EDIT],

	// Cliente - solo ve sus propios boletos
	[ROLES.CLIENT]: [APP_PERMISSIONS.TICKETS_VIEW],
};
