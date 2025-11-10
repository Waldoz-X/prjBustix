/**
 * Servicio de API para gestión completa de usuarios
 * Sincronizado con API BusTix - Endpoints mejorados
 */
import type {
	ApiResponse,
	LoginResponseDto,
	RegisterDto,
	UpdateUserDto,
	UpdateUserStatusDto,
	UserDetailDto,
	UserStatsDto,
	UserStatus,
} from "@/types/user";

const BASE_URL = "http://localhost:5289/api/Account";

/**
 * Obtiene el token del localStorage
 */
const getToken = (): string | null => {
	return localStorage.getItem("token");
};

/**
 * Headers comunes con JWT
 */
const getHeaders = () => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${getToken()}`,
});

/**
 * Headers para requests sin autenticación
 */
const getPublicHeaders = () => ({
	"Content-Type": "application/json",
});

/**
 * 1️⃣ Registro de Usuario (con documento)
 */
export const register = async (data: RegisterDto): Promise<ApiResponse> => {
	const response = await fetch(`${BASE_URL}/register`, {
		method: "POST",
		headers: getPublicHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		error.message =
			response.status === 400
				? "Datos inválidos. Verifica el formato de email y contraseña."
				: "Error al registrar usuario";
		throw error;
	}

	return response.json();
};

/**
 * 2️⃣ Login (retorna token + refreshToken)
 * Maneja mensajes de bloqueo del backend
 */
export const login = async (email: string, password: string): Promise<LoginResponseDto> => {
	const response = await fetch(`${BASE_URL}/login`, {
		method: "POST",
		headers: getPublicHeaders(),
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		// Intentar obtener el mensaje del backend
		let errorMessage = "Error al iniciar sesión";
		try {
			const errorData = await response.json();
			errorMessage = errorData.message || errorData.Message || errorMessage;
		} catch (_e) {
			// Si no hay JSON, usar mensaje por defecto
			if (response.status === 401) {
				errorMessage = "Credenciales inválidas";
			}
		}

		const error: any = new Error(errorMessage);
		error.status = response.status;
		error.message = errorMessage;
		throw error;
	}

	return response.json();
};

/**
 * 6️⃣ Obtener Mi Información (con campos nuevos)
 */
export const getMyProfile = async (): Promise<UserDetailDto> => {
	const response = await fetch(`${BASE_URL}/detail`, {
		method: "GET",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		error.message = response.status === 401 ? "No autorizado" : "Error al obtener perfil";
		throw error;
	}

	return response.json();
};

/**
 * 7️⃣ Actualizar Mi Perfil (incluye documento)
 */
export const updateMyProfile = async (data: UpdateUserDto): Promise<ApiResponse> => {
	const response = await fetch(`${BASE_URL}/update-profile`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		error.message = "Error al actualizar perfil";
		throw error;
	}

	return response.json();
};

/**
 * 1️⃣1️⃣ Listar Todos los Usuarios (con campos nuevos)
 */
export const getAllUsers = async (): Promise<UserDetailDto[]> => {
	const response = await fetch(BASE_URL, {
		method: "GET",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		error.message = response.status === 403 ? "No tienes permisos para ver usuarios" : "Error al obtener usuarios";
		throw error;
	}

	return response.json();
};

/**
 * 1️⃣2️⃣ Obtener Usuario por ID
 */
export const getUserById = async (userId: string): Promise<UserDetailDto> => {
	const response = await fetch(`${BASE_URL}/${userId}`, {
		method: "GET",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		error.message = response.status === 404 ? "Usuario no encontrado" : "Error al obtener usuario";
		throw error;
	}

	return response.json();
};

/**
 * 1️⃣3️⃣ Cambiar Estatus de Usuario
 */
export const updateUserStatus = async (userId: string, data: UpdateUserStatusDto): Promise<ApiResponse> => {
	const response = await fetch(`${BASE_URL}/${userId}/status`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		error.message = response.status === 403 ? "No tienes permisos para cambiar estatus" : "Error al actualizar estatus";
		throw error;
	}

	return response.json();
};

/**
 * 1️⃣4️⃣ Obtener Catálogo de Estatus
 */
export const getStatuses = async (): Promise<UserStatus[]> => {
	const response = await fetch(`${BASE_URL}/statuses`, {
		method: "GET",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		error.message = "Error al obtener catálogo de estatus";
		throw error;
	}

	return response.json();
};

/**
 * 1️⃣5️⃣ Filtrar Usuarios por Estatus
 */
export const getUsersByStatus = async (estatusId: number): Promise<UserDetailDto[]> => {
	const response = await fetch(`${BASE_URL}/users/by-status/${estatusId}`, {
		method: "GET",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		error.message = "Error al filtrar usuarios";
		throw error;
	}

	return response.json();
};

/**
 * 1️⃣6️⃣ Estadísticas de Usuarios
 */
export const getUserStats = async (): Promise<UserStatsDto> => {
	const response = await fetch(`${BASE_URL}/stats`, {
		method: "GET",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		error.message = "Error al obtener estadísticas";
		throw error;
	}

	return response.json();
};

/**
 * 9️⃣ Logout - Cerrar Sesión
 * Invalida el RefreshToken en el servidor
 */
export const logout = async (): Promise<ApiResponse> => {
	const response = await fetch(`${BASE_URL}/logout`, {
		method: "POST",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		error.message = "Error al cerrar sesión";
		throw error;
	}

	return response.json();
};

/**
 * 🔟 Confirm Email - Confirmar Email
 * Confirma el email del usuario con el token recibido por correo
 */
export const confirmEmail = async (email: string, token: string): Promise<ApiResponse> => {
	const response = await fetch(`${BASE_URL}/confirm-email`, {
		method: "POST",
		headers: getPublicHeaders(),
		body: JSON.stringify({ email, token }),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;

		try {
			const errorData = await response.json();
			error.message = errorData.message || "Error al confirmar email";
		} catch {
			error.message = "Error al confirmar email";
		}

		throw error;
	}

	return response.json();
};

// ============================================================================
// 📦 EXPORTAR SERVICIO COMO DEFAULT
// ============================================================================

const userService = {
	register,
	login,
	logout,
	confirmEmail,
	getMyProfile,
	updateMyProfile,
	getAllUsers,
	getUserById,
	updateUserStatus,
	getStatuses,
	getUsersByStatus,
	getUserStats,
};

export default userService;
