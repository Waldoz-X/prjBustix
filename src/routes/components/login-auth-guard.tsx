import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useUserActions, useUserToken } from "@/store/userStore";
import { clearSession, isTokenValid } from "@/utils/jwt";
import { useRouter } from "../hooks";

type Props = {
	children: React.ReactNode;
};

/**
 * Guard para proteger rutas que requieren autenticación
 * Valida que el token JWT sea válido y no haya expirado
 */
export default function LoginAuthGuard({ children }: Props) {
	const router = useRouter();
	const { accessToken } = useUserToken();
	const { clearUserInfoAndToken } = useUserActions();

	const check = useCallback(() => {
		// Verificar si hay token y si es válido
		if (!accessToken || !isTokenValid(accessToken)) {
			// Limpiar sesión inválida
			clearSession();
			clearUserInfoAndToken();

			// Mostrar mensaje al usuario
			if (accessToken) {
				// Si había token pero era inválido/expirado
				toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.", {
					position: "top-center",
					duration: 4000,
				});
			}

			// Redirigir al login
			router.replace("/auth/login");
		}
	}, [router, accessToken, clearUserInfoAndToken]);

	useEffect(() => {
		check();
	}, [check]);

	// Si no hay token válido, no renderizar nada (ya estamos redirigiendo)
	if (!accessToken || !isTokenValid(accessToken)) {
		return null;
	}

	return <>{children}</>;
}
