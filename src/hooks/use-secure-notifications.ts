/**
 * Hook personalizado para notificaciones de seguridad
 * Proporciona notificaciones con diferentes niveles de severidad
 */

import { toast } from "sonner";

export enum NotificationType {
	SUCCESS = "success",
	ERROR = "error",
	WARNING = "warning",
	INFO = "info",
	SECURITY = "security",
}

interface NotificationOptions {
	title: string;
	description?: string;
	duration?: number;
	action?: {
		label: string;
		onClick: () => void;
	};
}

export function useSecureNotifications() {
	const showNotification = (type: NotificationType, options: NotificationOptions) => {
		const { title, description, duration = 5000, action } = options;

		const baseConfig = {
			description,
			duration,
			action: action
				? {
						label: action.label,
						onClick: action.onClick,
					}
				: undefined,
		};

		switch (type) {
			case NotificationType.SUCCESS:
				toast.success(title, baseConfig);
				break;

			case NotificationType.ERROR:
				toast.error(title, baseConfig);
				break;

			case NotificationType.WARNING:
				toast.warning(title, baseConfig);
				break;

			case NotificationType.SECURITY:
				toast.error(title, {
					...baseConfig,
					className: "border-red-500",
				});
				break;
			default:
				toast.info(title, baseConfig);
				break;
		}
	};

	return {
		success: (options: NotificationOptions) => showNotification(NotificationType.SUCCESS, options),
		error: (options: NotificationOptions) => showNotification(NotificationType.ERROR, options),
		warning: (options: NotificationOptions) => showNotification(NotificationType.WARNING, options),
		info: (options: NotificationOptions) => showNotification(NotificationType.INFO, options),
		security: (options: NotificationOptions) => showNotification(NotificationType.SECURITY, options),
	};
}

/**
 * Notificaciones predefinidas de seguridad
 */
export const SecurityNotifications = {
	suspiciousActivity: () => {
		toast.error("Actividad sospechosa detectada", {
			description: "Se ha detectado un comportamiento inusual. Tu sesión será cerrada por seguridad.",
			duration: 8000,
		});
	},

	sessionExpired: () => {
		toast.warning("Sesión expirada", {
			description: "Por tu seguridad, tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
			duration: 6000,
		});
	},

	tooManyAttempts: (waitTime: number) => {
		toast.error("Demasiados intentos fallidos", {
			description: `Por seguridad, debes esperar ${waitTime} minutos antes de intentar nuevamente.`,
			duration: 8000,
		});
	},

	invalidToken: () => {
		toast.error("Token inválido", {
			description: "Tu sesión no es válida. Por favor, inicia sesión nuevamente.",
			duration: 5000,
		});
	},

	networkError: () => {
		toast.error("Error de conexión", {
			description: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
			duration: 5000,
		});
	},

	permissionDenied: () => {
		toast.warning("Permiso denegado", {
			description: "No tienes permisos para realizar esta acción.",
			duration: 5000,
		});
	},
};
