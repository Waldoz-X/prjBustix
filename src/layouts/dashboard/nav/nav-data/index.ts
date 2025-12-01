import { useMemo } from "react";
import type { NavItemDataProps } from "@/components/nav/types";
import { GLOBAL_CONFIG } from "@/global-config";
import { useUserInfo, useUserPermissions } from "@/store/userStore";
import { checkAny } from "@/utils";
import { backendNavData } from "./nav-data-backend";
import { frontendNavData } from "./nav-data-frontend";

const navData = GLOBAL_CONFIG.routerMode === "backend" ? backendNavData : frontendNavData;

/**
 * 递归处理导航数据，过滤掉没有权限的项目
 * @param items 导航项目数组
 * @param permissions 权限列表
 * @returns 过滤后的导航项目数组
 */
const filterItems = (items: NavItemDataProps[], permissions: string[], roles: string[]) => {
	return items.filter((item) => {
		// Normalizamos los requisitos del item a minúsculas para comparación insensible a mayúsculas
		const itemAuthNormalized = item.auth ? item.auth.map((a) => a.toLowerCase()) : [];

		// Verificamos si existe coincidencia en roles O en permisos (usando pools normalizados)
		const hasRole = item.auth ? checkAny(itemAuthNormalized, roles) : true;
		const hasPermission = item.auth ? checkAny(itemAuthNormalized, permissions) : true;

		// Si tiene rol O permiso, es visible.
		const isVisible = item.auth ? hasRole || hasPermission : true;

		if (!isVisible) return false;

		// Si hay subitems, filtrar recursivamente
		if (item.children?.length) {
			const filteredChildren = filterItems(item.children, permissions, roles);
			if (filteredChildren.length === 0) {
				return false;
			}
			item.children = filteredChildren;
		}

		return true;
	});
};

const filterNavData = (permissions: string[], roles: string[]) => {
	return navData
		.map((group) => {
			const filteredItems = filterItems(group.items, permissions, roles);
			if (filteredItems.length === 0) {
				return null;
			}
			return {
				...group,
				items: filteredItems,
			};
		})
		.filter((group): group is NonNullable<typeof group> => group !== null);
};

export const useFilteredNavData = () => {
	const permissions = useUserPermissions();
	const userInfo = useUserInfo();

	// Normalizamos permisos y roles del usuario a minúsculas
	const permissionCodes = useMemo(() => permissions.map((p) => p.code.toLowerCase()), [permissions]);
	const userRoles = useMemo(() => (userInfo?.roles || []).map((r) => r.code.toLowerCase()), [userInfo]);

	return useMemo(() => filterNavData(permissionCodes, userRoles), [permissionCodes, userRoles]);
};
