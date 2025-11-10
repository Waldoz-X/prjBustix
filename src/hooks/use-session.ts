import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "@/routes/hooks";
import { useUserActions, useUserToken } from "@/store/userStore";
import { clearSession, isTokenValid } from "@/utils/jwt";

/**
 * Hook que verifica la validez de la sesión periódicamente
 * Si el token expira, cierra la sesión automáticamente
 *
 * @param checkInterval Intervalo en ms para verificar (default: 60000 = 1 minuto)
 */
export function useSessionCheck(checkInterval: number = 60000) {
	const { accessToken } = useUserToken();
	const { clearUserInfoAndToken } = useUserActions();
	const router = useRouter();
	const hasShownExpiredMessage = useRef(false);

	const handleSessionExpired = useCallback(() => {
		// Evitar mostrar múltiples mensajes
		if (hasShownExpiredMessage.current) return;
		hasShownExpiredMessage.current = true;

		// Limpiar sesión
		clearSession();
		clearUserInfoAndToken();

		// Notificar al usuario
		toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", {
			position: "top-center",
			duration: 5000,
		});

		// Redirigir al login
		router.replace("/auth/login");
	}, [clearUserInfoAndToken, router]);

	useEffect(() => {
		// No hacer nada si no hay token
		if (!accessToken) return;

		// Verificar inmediatamente al montar
		if (!isTokenValid(accessToken)) {
			handleSessionExpired();
			return;
		}

		// Configurar verificación periódica
		const intervalId = setInterval(() => {
			if (!isTokenValid(accessToken)) {
				handleSessionExpired();
			}
		}, checkInterval);

		return () => clearInterval(intervalId);
	}, [accessToken, checkInterval, handleSessionExpired]);
}

/**
 * Hook para verificar si el usuario tiene un permiso específico
 */
export function useHasPermission(permission: string): boolean {
	const { accessToken } = useUserToken();

	if (!accessToken || !isTokenValid(accessToken)) return false;

	const { hasPermission } = require("@/utils/jwt");
	return hasPermission(accessToken, permission);
}

/**
 * Hook para verificar si el usuario tiene al menos uno de los permisos
 */
export function useHasAnyPermission(permissions: string[]): boolean {
	const { accessToken } = useUserToken();

	if (!accessToken || !isTokenValid(accessToken)) return false;

	const { hasAnyPermission } = require("@/utils/jwt");
	return hasAnyPermission(accessToken, permissions);
}

/**
 * Hook para verificar si el usuario es Admin
 */
export function useIsAdmin(): boolean {
	const { accessToken } = useUserToken();

	if (!accessToken || !isTokenValid(accessToken)) return false;

	const { isAdmin } = require("@/utils/jwt");
	return isAdmin(accessToken);
}

/**
 * Hook para verificar si el usuario tiene un rol específico
 */
export function useHasRole(role: string): boolean {
	const { accessToken } = useUserToken();

	if (!accessToken || !isTokenValid(accessToken)) return false;

	const { hasRole } = require("@/utils/jwt");
	return hasRole(accessToken, role);
}
