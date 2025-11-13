import { useUserInfo, useUserToken } from "@/store/userStore";

/**
 * permission/role check hook
 * @param baseOn - check type: 'role' or 'permission'
 *
 * @example
 * // permission check
 * const { check, checkAny, checkAll } = useAuthCheck('permission');
 * check('user.create')
 * checkAny(['user.create', 'user.edit'])
 * checkAll(['user.create', 'user.edit'])
 *
 * @example
 * // role check
 * const { check, checkAny, checkAll } = useAuthCheck('role');
 * check('admin')
 * checkAny(['admin', 'editor'])
 * checkAll(['admin', 'editor'])
 */
export const useAuthCheck = (baseOn: "role" | "permission" = "permission") => {
	const { accessToken } = useUserToken();
	const { permissions = [], roles = [] } = useUserInfo();

	// Normalize roles to check for Admin (handle strings and objects)
	const normalizedRoles = roles.map((r: any) => {
		if (typeof r === "string") return r.toLowerCase();
		return (r?.name ?? r?.code ?? r?.id ?? "").toLowerCase();
	});

	// If user is Admin, grant access to everything
	const isAdmin = normalizedRoles.includes("admin") || normalizedRoles.includes("*");

	// depends on baseOn to select resource pool
	const resourcePool = baseOn === "role" ? roles : permissions;

	// check if item exists
	const check = (item: string): boolean => {
		// if user is not logged in, return false
		if (!accessToken) {
			return false;
		}

		// Admin has access to everything
		if (isAdmin) {
			return true;
		}

		// Check in resource pool (handle both strings and objects)
		return resourcePool.some((p: any) => {
			if (typeof p === "string") {
				return p.toLowerCase() === item.toLowerCase();
			}
			const value = p?.code ?? p?.name ?? p?.id ?? "";
			return value.toLowerCase() === item.toLowerCase();
		});
	};

	// check if any item exists
	const checkAny = (items: string[]) => {
		if (items.length === 0) {
			return true;
		}

		// Admin has access to everything
		if (isAdmin) {
			return true;
		}

		return items.some((item) => check(item));
	};

	// check if all items exist
	const checkAll = (items: string[]) => {
		if (items.length === 0) {
			return true;
		}

		// Admin has access to everything
		if (isAdmin) {
			return true;
		}

		return items.every((item) => check(item));
	};

	return { check, checkAny, checkAll };
};
