/**
 * Utilidades para trabajar con JWT y permisos
 */
import { jwtDecode } from "jwt-decode";
import { logger } from "./logger";

/**
 * Estructura del JWT decodificado según tu API
 */
export interface DecodedJWT {
	// Claims estándar JWT
	sub: string; // user.Id
	email: string;
	name: string; // user.FullName
	aud: string;
	iss: string;
	jti: string;
	iat: number;
	exp: number;

	// Claims custom de tu API
	accountStatus: string; // "active"
	emailVerified: string; // "True" / "False"
	sessionId: string;

	// Claims opcionales
	corporateId?: string;
	operatorId?: string;
	deviceId?: string;
	ipAddress?: string;

	// Roles y permisos (pueden ser arrays o strings según JWT)
	role?: string | string[];
	permission?: string | string[];
}

/**
 * Decodifica el JWT y extrae la información
 */
export function decodeToken(token: string): DecodedJWT | null {
	try {
		const decoded = jwtDecode<DecodedJWT>(token);
		return decoded;
	} catch (error) {
		logger.error("Error decoding JWT:", error);
		return null;
	}
}

/**
 * Obtiene los roles del token
 */
export function getRolesFromToken(token: string): string[] {
	const decoded = decodeToken(token);
	if (!decoded) {
		// No podemos decodificar el token, devolver array vacío
		logger.warn("decodeToken: token inválido o decodificación fallida");
		return [];
	}

	// El rol puede venir como string o array
	if (Array.isArray(decoded.role)) {
		return decoded.role.map((r) => String(r));
	}

	if (typeof decoded.role === "string") {
		return [decoded.role];
	}

	return [];
}

/**
 * Obtiene los permisos del token
 */
export function getPermissionsFromToken(token: string): string[] {
	const decoded = decodeToken(token);
	if (!decoded) return [];

	// Los permisos pueden venir como string o array
	if (Array.isArray(decoded.permission)) {
		return decoded.permission;
	}

	if (typeof decoded.permission === "string") {
		return [decoded.permission];
	}

	return [];
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export function hasRole(token: string, role: string): boolean {
	const roles = getRolesFromToken(token).map((r) => String(r).toLowerCase());
	return roles.includes(role.toLowerCase());
}

/**
 * Verifica si el usuario es Admin (tiene acceso total)
 */
export function isAdmin(token: string): boolean {
	const roles = getRolesFromToken(token).map((r) => String(r).toLowerCase());
	const permissions = getPermissionsFromToken(token);

	// Si tiene rol Admin o permiso wildcard "*"
	return roles.includes("admin") || roles.includes("*") || permissions.includes("*");
}

/**
 * Verifica si el usuario tiene un permiso específico
 */
export function hasPermission(token: string, permission: string): boolean {
	// Admin tiene acceso a todo
	if (isAdmin(token)) return true;

	const permissions = getPermissionsFromToken(token);
	return permissions.includes(permission);
}

/**
 * Verifica si el usuario tiene al menos uno de los permisos dados
 */
export function hasAnyPermission(token: string, requiredPermissions: string[]): boolean {
	// Admin tiene acceso a todo
	if (isAdmin(token)) return true;

	const userPermissions = getPermissionsFromToken(token);
	return requiredPermissions.some((perm) => userPermissions.includes(perm));
}

/**
 * Verifica si el usuario tiene todos los permisos dados
 */
export function hasAllPermissions(token: string, requiredPermissions: string[]): boolean {
	// Admin tiene acceso a todo
	if (isAdmin(token)) return true;

	const userPermissions = getPermissionsFromToken(token);
	return requiredPermissions.every((perm) => userPermissions.includes(perm));
}

/**
 * Obtiene información del usuario desde el token
 */
export function getUserInfoFromToken(token: string): {
	id: string;
	email: string;
	name: string;
	roles: string[];
	permissions: string[];
	accountStatus: string;
	emailVerified: boolean;
	isAdmin: boolean;
} | null {
	const decoded = decodeToken(token);
	if (!decoded) return null;

	return {
		id: decoded.sub,
		email: decoded.email,
		name: decoded.name,
		roles: getRolesFromToken(token),
		permissions: getPermissionsFromToken(token),
		accountStatus: decoded.accountStatus,
		emailVerified: decoded.emailVerified === "True",
		isAdmin: isAdmin(token),
	};
}

/**
 * Verifica si el token ha expirado
 */
export function isTokenExpired(token: string): boolean {
	try {
		const decoded = decodeToken(token);
		if (!decoded || !decoded.exp) return true;

		// exp está en segundos, Date.now() en milisegundos
		const currentTime = Date.now() / 1000;
		return decoded.exp < currentTime;
	} catch (error) {
		logger.error("Error checking token expiration:", error);
		return true;
	}
}

/**
 * Verifica si el token es válido (existe, es decodificable y no ha expirado)
 */
export function isTokenValid(token: string | null | undefined): boolean {
	if (!token) return false;

	try {
		const decoded = decodeToken(token);
		if (!decoded) return false;

		// Verificar que no haya expirado
		return !isTokenExpired(token);
	} catch (_error) {
		return false;
	}
}

/**
 * Obtiene el token del localStorage de forma segura
 */
export function getStoredToken(): string | null {
	try {
		return localStorage.getItem("token");
	} catch (error) {
		logger.error("Error getting token from localStorage:", error);
		return null;
	}
}

/**
 * Verifica si hay una sesión válida
 */
export function hasValidSession(): boolean {
	const token = getStoredToken();
	return isTokenValid(token);
}

/**
 * Limpia la sesión (token y datos del usuario)
 */
export function clearSession(): void {
	try {
		localStorage.removeItem("token");
		localStorage.removeItem("tokenExpiry");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("userStore");
	} catch (error) {
		logger.error("Error clearing session:", error);
	}
}
