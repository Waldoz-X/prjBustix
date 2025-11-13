/**
 * Filtrado de navegación basado en permisos del JWT
 */
import type { NavItemDataProps, NavProps } from "@/components/nav";
import { getRolesFromToken, hasAnyPermission, isAdmin } from "./jwt";
import { logger } from "./logger";
import { MENU_PERMISSIONS } from "./permissions";

/**
 * Verifica si el usuario tiene alguno de los roles requeridos
 */
function hasAnyRole(token: string, requiredRoles: string[]): boolean {
	if (!token) return false;

	// Admin siempre tiene acceso
	if (isAdmin(token)) return true;

	const userRoles = getRolesFromToken(token).map((r) => String(r).toLowerCase());
	const requiredLower = (requiredRoles || []).map((r) => String(r).toLowerCase());

	// Verificar si el usuario tiene al menos uno de los roles requeridos
	return requiredLower.some((role) => userRoles.includes(role));
}

/**
 * Verifica si un item del menú debe ser visible según los permisos del usuario
 */
export function canAccessMenuItem(path: string, token: string | null, itemAuth?: string[]): boolean {
	// Si no hay token, no tiene acceso
	if (!token) return false;

	// Admin siempre tiene acceso a todo
	if (isAdmin(token)) return true;

	// Si el item tiene su propia configuración de auth (roles o permisos), usar esa
	if (itemAuth && itemAuth.length > 0) {
		const isRoleCheck = itemAuth.every((auth) => !auth.startsWith("permission:"));

		if (isRoleCheck) {
			return hasAnyRole(token, itemAuth);
		} else {
			const permissions = itemAuth.map((auth) => auth.replace("permission:", "").trim());
			return hasAnyPermission(token, permissions);
		}
	}

	// Buscar permisos requeridos para esta ruta
	const requiredPermissions = MENU_PERMISSIONS[path];

	// Si no hay permisos definidos, está accesible para todos los autenticados
	if (!requiredPermissions || requiredPermissions.length === 0) {
		return true;
	}

	// Verificar si tiene al menos uno de los permisos requeridos
	return hasAnyPermission(token, requiredPermissions);
}

/**
 * Filtra recursivamente los items del menú según permisos
 */
function filterNavItems(items: NavItemDataProps[], token: string | null): NavItemDataProps[] {
	if (!items || items.length === 0 || !token) return [];

	return items
		.filter((item) => {
			if (item.hidden) return false; // oculto
			if (item.disabled) return true; // dejar pero deshabilitado
			if (!canAccessMenuItem(item.path, token, item.auth)) return false;
			return true;
		})
		.map((item) => {
			if (item.children && item.children.length > 0) {
				const filteredChildren = filterNavItems(item.children, token);
				return {
					...item,
					children: filteredChildren,
				};
			}
			return item;
		});
}

/**
 * Filtra toda la navegación según los permisos del usuario
 */
export function filterNavigation(navData: NavProps["data"], token: string | null): NavProps["data"] {
	if (!token) {
		logger.warn("No hay token - menú vacío");
		return [];
	}

	return navData
		.map((section) => {
			const filteredItems = filterNavItems(section.items, token);
			if (filteredItems.length === 0) return null;
			return {
				...section,
				items: filteredItems,
			};
		})
		.filter((section): section is NonNullable<typeof section> => section !== null);
}

/**
 * Hook para obtener el menú filtrado
 */
export function useFilteredNavigation(navData: NavProps["data"]): NavProps["data"] {
	const token = localStorage.getItem("token");
	if (!token) return [];
	return filterNavigation(navData, token);
}
