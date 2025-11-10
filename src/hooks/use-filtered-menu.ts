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

	// Verificar por rol
	if (item.roles && item.roles.length > 0) {
		const userRoleNames = userRoles.map((r) => r.name || r.code || r.id);
		const hasRole = item.roles.some((role) => userRoleNames.includes(role));
		if (hasRole) return true;
	}

	// Verificar por permiso
	if (item.permission) {
		const userPermissionNames = userPermissions.map((p) => p.name || p.code || p.id);
		// Verificar si tiene el permiso específico o es Admin (tiene *)
		if (userPermissionNames.includes("*") || userPermissionNames.includes(item.permission)) {
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

	const filteredMenu = useMemo(() => {
		if (!userInfo || !userPermissions) {
			return [];
		}

		const roles = userInfo.roles || [];
		const permissions = userPermissions || [];

		return filterMenu(menu, permissions, roles);
	}, [menu, userPermissions, userInfo]);

	return filteredMenu;
};

export default useFilteredMenu;
