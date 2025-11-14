import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Permission, Role, UserInfo, UserToken } from "#/entity";
import { StorageEnum } from "#/enum";
import userService, { type LoginResponse } from "@/api/services/userService";
import { logError, sanitizeForLog } from "../utils/error-handler";
import { logger } from "@/utils/logger";
import { sanitizeEmail, validatePassword } from "../utils/security";

// Tipos para el login
export interface SignInReq {
	email: string;
	password: string;
}

type UserStore = {
	userInfo: Partial<UserInfo>;
	userToken: UserToken;

	actions: {
		setUserInfo: (userInfo: UserInfo) => void;
		setUserToken: (token: UserToken) => void;
		clearUserInfoAndToken: () => void;
	};
};

const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			userInfo: {},
			userToken: {},
			actions: {
				setUserInfo: (userInfo) => {
					set({ userInfo });
				},
				setUserToken: (userToken) => {
					set({ userToken });
				},
				clearUserInfoAndToken() {
					set({ userInfo: {}, userToken: {} });
				},
			},
		}),
		{
			name: "userStore",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				[StorageEnum.UserInfo]: state.userInfo,
				[StorageEnum.UserToken]: state.userToken,
			}),
		},
	),
);

export const useUserInfo = () => useUserStore((state) => state.userInfo);
export const useUserToken = () => useUserStore((state) => state.userToken);
export const useUserPermissions = () => useUserStore((state) => state.userInfo.permissions || []);
export const useUserActions = () => useUserStore((state) => state.actions);

export const useSignIn = () => {
	const { setUserToken, setUserInfo } = useUserActions();

	const signInMutation = useMutation<LoginResponse, Error, SignInReq>({
		mutationFn: ({ email, password }: SignInReq) => userService.login(email, password),
	});

	return async (data: SignInReq) => {
		// 1. Sanitizar y validar datos de entrada
		const sanitizedEmail = sanitizeEmail(data.email);
		const passwordValidation = validatePassword(data.password);

		if (!passwordValidation.valid) {
			toast.error(passwordValidation.message, {
				position: "top-center",
			});
			throw new Error(passwordValidation.message);
		}

		const sanitizedData: SignInReq = {
			email: sanitizedEmail,
			password: data.password,
		};

		try {
			// 2. Intentar login - el backend maneja el bloqueo
			const res = await signInMutation.mutateAsync(sanitizedData);
			const { token, refreshToken } = res;

			// 3. Login exitoso - guardar token
			localStorage.setItem("token", token);
			const expiresInMinutes = 60;
			localStorage.setItem("tokenExpiry", String(Date.now() + expiresInMinutes * 60 * 1000));

			// 4. Decodificar JWT y extraer información del usuario
			const { getUserInfoFromToken } = await import("../utils/jwt");
			const userInfo = getUserInfoFromToken(token);

			// 5. Actualizar store con información completa
			setUserToken({ accessToken: token, refreshToken: refreshToken || "" });

			if (userInfo) {
				const mappedRoles: Role[] = (userInfo.roles || []).map((r) => ({ id: r, name: r, code: r }));
				const mappedPermissions: Permission[] = (userInfo.permissions || []).map((p) => ({ id: p, name: p, code: p }));

				const userInfoToStore: UserInfo = {
					id: userInfo.id,
					email: userInfo.email,
					username: userInfo.email,
					avatar: "",
					roles: mappedRoles,
					permissions: mappedPermissions,
				};

				setUserInfo(userInfoToStore);

				logger.info("Usuario autenticado", {
					name: userInfo.name,
					email: userInfo.email,
					roles: userInfo.roles,
					permissions: userInfo.permissions,
					isAdmin: userInfo.isAdmin,
				});
			}

			// 6. Notificación de éxito
			toast.success("¡Bienvenido!", {
				description: userInfo ? `Has iniciado sesión como ${userInfo.name}` : "Has iniciado sesión correctamente",
				position: "top-center",
			});
		} catch (err: any) {
			// 7. Manejar error - el backend ya maneja el contador de intentos
			const errorMessage = err.message || "Error al iniciar sesión";

			// 8. Log del error (sin datos sensibles)
			logError(err, sanitizeForLog({ email: sanitizedEmail }));

			// 9. Mostrar mensaje del servidor al usuario
			toast.error(errorMessage, {
				position: "top-center",
				duration: 5000,
			});

			// 13. Re-lanzar error para que el formulario lo maneje
			throw err;
		}
	};
};

export default useUserStore;
