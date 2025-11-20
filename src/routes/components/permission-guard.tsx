import { Navigate } from "react-router";
import { toast } from "sonner";
import { useUserInfo, useUserToken } from "@/store/userStore";
import { hasAnyPermission, hasPermission, isTokenValid } from "@/utils/jwt";

// Utility to check admin role from store (handles string or object roles)
const isAdminFromStore = (userInfo: any) => {
	const roles = userInfo?.roles || [];
	const normalized = roles
		.map((r: any) => (r && typeof r === "object" ? (r.name ?? r.code ?? r.id) : r))
		.filter(Boolean)
		.map((s: any) => String(s).toLowerCase());
	return normalized.includes("admin") || normalized.includes("*");
};

type Props = {
	children: React.ReactNode;
	/** Permiso requerido (ej: "users:view") */
	permission?: string;
	/** Lista de permisos, requiere al menos uno */
	anyPermission?: string[];
	/** Ruta a redirigir si no tiene permiso (por defecto /403) */
	fallbackPath?: string;
};

/**
 * Guard para proteger rutas basadas en permisos específicos
 * El usuario debe estar autenticado Y tener el permiso requerido
 */
export default function PermissionGuard({ children, permission, anyPermission, fallbackPath = "/403" }: Props) {
	const { accessToken } = useUserToken();
	const userInfo = useUserInfo();

	// Si no hay token válido, redirigir al login
	if (!accessToken || !isTokenValid(accessToken)) {
		return <Navigate to="/auth/login" replace />;
	}

	// If user has Admin role in store, allow everything
	if (isAdminFromStore(userInfo)) {
		return <>{children}</>;
	}

	// Verificar permiso específico
	if (permission && !hasPermission(accessToken, permission)) {
		toast.error("No tienes permisos para acceder a esta sección", {
			position: "top-center",
			duration: 3000,
		});
		return <Navigate to={fallbackPath} replace />;
	}

	// Verificar que tenga al menos uno de los permisos
	if (anyPermission && !hasAnyPermission(accessToken, anyPermission)) {
		toast.error("No tienes permisos para acceder a esta sección", {
			position: "top-center",
			duration: 3000,
		});
		return <Navigate to={fallbackPath} replace />;
	}

	return <>{children}</>;
}
