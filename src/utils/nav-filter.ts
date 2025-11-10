/**
 * Filtrado de navegación basado en permisos del JWT
 */
import type { NavItemDataProps, NavProps } from "@/components/nav";
import { getRolesFromToken, hasAnyPermission, isAdmin } from "./jwt";
import { MENU_PERMISSIONS } from "./permissions";

/**
 * Verifica si el usuario tiene alguno de los roles requeridos
 */
function hasAnyRole(token: string, requiredRoles: string[]): boolean {
	// Admin siempre tiene acceso
	if (isAdmin(token)) return true;

	const userRoles = getRolesFromToken(token);

	console.log("🔍 Verificando roles:", {
		userRoles,
		requiredRoles,
		hasAccess: requiredRoles.some((role) => userRoles.includes(role)),
	});

	// Verificar si el usuario tiene al menos uno de los roles requeridos
	return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Verifica si un item del menú debe ser visible según los permisos del usuario
 */
export function canAccessMenuItem(path: string, token: string | null, itemAuth?: string[]): boolean {
	// Si no hay token, no tiene acceso
	if (!token) return false;

	// Admin siempre tiene acceso a todo
	if (isAdmin(token)) {
		console.log("✅ Admin detectado - acceso completo a:", path);
		return true;
	}

	// Si el item tiene su propia configuración de auth (roles), usar esa
	if (itemAuth && itemAuth.length > 0) {
		// Verificar si es verificación de roles (nombres sin "permission:")
		const isRoleCheck = itemAuth.every((auth) => !auth.startsWith("permission:"));

		if (isRoleCheck) {
			// Verificar roles
			const hasAccess = hasAnyRole(token, itemAuth);
			console.log(`🔐 Verificando acceso a "${path}":`, {
				requiredRoles: itemAuth,
				hasAccess,
			});
			return hasAccess;
		} else {
			// Verificar permisos específicos
			const permissions = itemAuth.map((auth) => auth.replace("permission:", "").trim());
			return hasAnyPermission(token, permissions);
		}
	}

	// Buscar permisos requeridos para esta ruta
	const requiredPermissions = MENU_PERMISSIONS[path];

	// Si no hay permisos definidos, está accesible para todos los autenticados
	if (!requiredPermissions || requiredPermissions.length === 0) {
		console.log(`✅ Sin restricciones - acceso permitido a: ${path}`);
		return true;
	}

	// Verificar si tiene al menos uno de los permisos requeridos
	return hasAnyPermission(token, requiredPermissions);
}

/**
 * Filtra recursivamente los items del menú según permisos
 */
function filterNavItems(items: NavItemDataProps[], token: string | null): NavItemDataProps[] {
	if (!items || items.length === 0) return [];

	return items
		.filter((item) => {
			// Si el item está marcado como hidden, no mostrarlo
			if (item.hidden) return false;

			// Si el item está deshabilitado, dejarlo pero deshabilitado
			if (item.disabled) return true;

			// Verificar permisos para este item
			if (!canAccessMenuItem(item.path, token, item.auth)) {
				return false;
			}

			return true;
		})
		.map((item) => {
			// Si tiene children, filtrar recursivamente
			if (item.children && item.children.length > 0) {
				const filteredChildren = filterNavItems(item.children, token);

				// Si no quedan children visibles, podríamos ocultar el padre
				// Pero por ahora lo dejamos visible
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
		// Sin token, retornar menú vacío o solo items públicos
		console.warn("⚠️ No hay token - menú vacío");
		return [];
	}

	const userRoles = getRolesFromToken(token);
	const isUserAdmin = isAdmin(token);

	console.log("🎯 Filtrando navegación:", {
		isAdmin: isUserAdmin,
		userRoles,
		totalSections: navData.length,
	});

	const filtered = navData
		.map((section) => {
			const filteredItems = filterNavItems(section.items, token);

			// Solo incluir secciones que tengan al menos un item visible
			if (filteredItems.length === 0) {
				console.log(`❌ Sección "${section.name}" eliminada - sin items visibles`);
				return null;
			}

			console.log(`✅ Sección "${section.name}" incluida - ${filteredItems.length} items`);
			return {
				...section,
				items: filteredItems,
			};
		})
		.filter((section): section is NonNullable<typeof section> => section !== null);

	console.log(`📊 Resultado final: ${filtered.length} secciones de ${navData.length} originales`);

	return filtered;
}

/**
 * Hook para obtener el menú filtrado
 */
export function useFilteredNavigation(navData: NavProps["data"]): NavProps["data"] {
	// Obtener token del localStorage
	const token = localStorage.getItem("token");

	// Si no hay token, retornar vacío
	if (!token) return [];

	// Filtrar navegación
	return filterNavigation(navData, token);
}
