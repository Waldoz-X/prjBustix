/**
 * Hook para filtrar el menú basado en los permisos del usuario desde el JWT
 * Lee los permisos del token y oculta automáticamente las rutas no permitidas
 */
import { useMemo } from "react";
import { useUserInfo, useUserPermissions } from "@/store/userStore";

export interface MenuItem {
	label: string;
	key: string;
	icon?: any;
	path?: string;
	children?: MenuItem[];
	permission?: string;
	roles?: string[];
}

/**
 * Verifica si el usuario tiene permiso para ver un item del menú
 */
const hasPermission = (item: MenuItem, userPermissions: any[], userRoles: any[]): boolean => {
	// Si el item no requiere permisos, siempre es visible
	if (!item.permission && !item.roles) {
		return true;
	}

	// Normalize user roles to strings (handle both string and object roles)
	const normalizedUserRoleNames = (userRoles || [])
		.map((r) => {
			const v = (r as any)?.name ?? (r as any)?.code ?? (r as any)?.id ?? r;
			return v == null ? "" : String(v).toLowerCase();
		})
		.filter(Boolean);

	// If the user is Admin (role name 'admin') or has a wildcard role, show everything
	if (normalizedUserRoleNames.includes("admin") || normalizedUserRoleNames.includes("*")) {
		return true;
	}

	// Verificar por rol (item.roles puede ser un array de strings)
	if (item.roles && item.roles.length > 0) {
		const itemRolesLower = item.roles.map((r) => String(r).toLowerCase());
		const hasRole = itemRolesLower.some((role) => normalizedUserRoleNames.includes(role));
		if (hasRole) return true;
	}

	// Normalize user permissions (handle strings o objetos)
	const normalizedUserPermissionNames = (userPermissions || [])
		.map((p) => (typeof p === "string" ? p : p?.name || p?.code || p?.id))
		.filter(Boolean)
		.map((s) => String(s));

	// Verificar por permiso
	if (item.permission) {
		// Verificar si tiene el permiso específico o es Admin (tiene *)
		if (normalizedUserPermissionNames.includes("*") || normalizedUserPermissionNames.includes(item.permission)) {
			return true;
		}
	}

	return false;
};

/**
 * Filtra recursivamente el menú basado en permisos
 */
const filterMenu = (menu: MenuItem[], userPermissions: any[], userRoles: any[]): MenuItem[] => {
	return menu
		.filter((item) => hasPermission(item, userPermissions, userRoles))
		.map((item) => {
			if (item.children && item.children.length > 0) {
				return {
					...item,
					children: filterMenu(item.children, userPermissions, userRoles),
				};
			}
			return item;
		})
		.filter((item) => !item.children || item.children.length > 0); // Remover padres sin hijos
};

/**
 * Hook principal para obtener el menú filtrado
 */
export const useFilteredMenu = (menu: MenuItem[]) => {
	const userInfo = useUserInfo();
	const userPermissions = useUserPermissions();

	return useMemo(() => {
		if (!userInfo || !userPermissions) {
			return [];
		}

		const roles = userInfo.roles || [];
		const permissions = userPermissions || [];

		// If user has Admin role (string or object), return the original menu unfiltered
		const normalizedRoleNames = (roles || [])
			.map((r) => {
				const v = (r as any)?.name ?? (r as any)?.code ?? (r as any)?.id ?? r;
				return v == null ? "" : String(v).toLowerCase();
			})
			.filter(Boolean);

		if (normalizedRoleNames.includes("admin") || normalizedRoleNames.includes("*")) {
			return menu;
		}

		return filterMenu(menu, permissions, roles);
	}, [menu, userPermissions, userInfo]);
};

export default useFilteredMenu;
