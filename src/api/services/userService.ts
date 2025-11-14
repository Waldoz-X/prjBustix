/**
 * Servicio de API para gestión de usuarios
 * Endpoints: GET, POST, PUT usuarios y gestión de estatus
 */

export enum UserStatus {
	Activo = 1,
	Inactivo = 2,
	Bloqueado = 3,
}

export interface UserDto {
	id: string;
	email: string;
	nombreCompleto: string;
	roles: string[];
	phoneNumber: string;
	phoneNumberConfirmed: boolean;
	accessFailedCount: number;
	estatus: UserStatus;
	estatusNombre: string;
	fechaRegistro: string;
	tipoDocumento: string;
	numeroDocumento: string;
	emailConfirmed: boolean;
}

export interface CreateUserDto {
	emailAddress: string;
	nombreCompleto: string;
	password: string;
	roles: string[];
	tipoDocumento?: string;
	numeroDocumento?: string;
}

// DTO para registro público
export interface RegisterDto {
	emailAddress: string;
	nombreCompleto: string;
	password: string;
	tipoDocumento?: string;
	numeroDocumento?: string;
}

// Respuesta de login
export interface LoginResponse {
	token: string;
	refreshToken?: string;
	user?: UserDto;
	message?: string;
}

export interface UpdateUserProfileDto {
	nombreCompleto: string;
	phoneNumber?: string;
	tipoDocumento?: string;
	numeroDocumento?: string;
}

export interface UpdateUserStatusDto {
	estatus: UserStatus;
}

export interface UserStatsDto {
	totalUsers: number;
	activeUsers: number;
	inactiveUsers: number;
	suspendedUsers: number;
	lockedUsers: number;
}

export interface LockoutInfoDto {
	isLockedOut: boolean;
	lockoutEnd?: string;
	accessFailedCount: number;
}

export interface UsersAtRiskDto {
	totalUsersAtRisk: number;
	usersAtRisk: Array<{
		userId: string;
		email: string;
		nombreCompleto: string;
		accessFailedCount: number;
		lastFailedAttempt?: string;
	}>;
}

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
	Accept: "application/json, text/plain",
	Authorization: `Bearer ${getToken()}`,
});

/**
 * Maneja errores de respuesta
 */
const handleResponse = async (response: Response) => {
	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;

		try {
			const errorData = await response.json();
			error.message = errorData.message || errorData.title || `Error ${response.status}`;
			error.errors = errorData.errors;
		} catch {
			if (response.status === 401) {
				error.message = "No autorizado. Por favor, inicia sesión.";
			} else if (response.status === 403) {
				error.message = "No tienes permisos para realizar esta acción.";
			} else if (response.status === 404) {
				error.message = "Usuario no encontrado.";
			} else {
				error.message = `Error ${response.status}`;
			}
		}

		throw error;
	}

	const text = await response.text();
	if (!text) return null;

	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
};

/**
 * Login
 */
const login = async (email: string, password: string): Promise<LoginResponse> => {
	const response = await fetch(`${BASE_URL}/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({ email, password }),
	});

	return await handleResponse(response);
};

/**
 * Logout
 */
const logout = async (): Promise<{ message?: string }> => {
	const response = await fetch(`${BASE_URL}/logout`, {
		method: "POST",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * Registro público
 */
const register = async (data: RegisterDto): Promise<{ message?: string }> => {
	const response = await fetch(`${BASE_URL}/register`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(data),
	});

	return await handleResponse(response);
};

/**
 * Confirmar email
 */
const confirmEmail = async (email: string, token: string): Promise<{ message?: string }> => {
	const response = await fetch(`${BASE_URL}/confirm-email`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({ email, token }),
	});

	return await handleResponse(response);
};

/**
 * Obtener todos los usuarios (sin filtro de estatus)
 */
const getAllUsers = async (): Promise<UserDto[]> => {
	console.log(`[UserService] Fetching all users from ${BASE_URL}`);

	const response = await fetch(`${BASE_URL}`, {
		method: "GET",
		headers: getHeaders(),
	});

	console.log(`[UserService] Response status: ${response.status}`);

	const data = await handleResponse(response);
	console.log(`[UserService] Data received:`, data);
	console.log(`[UserService] Is array:`, Array.isArray(data));
	console.log(`[UserService] Array length:`, Array.isArray(data) ? data.length : "N/A");

	const result = Array.isArray(data) ? data : [];
	console.log(`[UserService] Returning: ${result.length} users`);

	return result;
};

/**
 * Obtener todos los usuarios por estatus
 */
const getUsersByStatus = async (estatusId: number): Promise<UserDto[]> => {
	console.log(`[UserService] Fetching users by status: ${estatusId} from ${BASE_URL}/users/by-status/${estatusId}`);

	const response = await fetch(`${BASE_URL}/users/by-status/${estatusId}`, {
		method: "GET",
		headers: getHeaders(),
	});

	console.log(`[UserService] Response status: ${response.status}`);

	const data = await handleResponse(response);
	console.log(`[UserService] Data received:`, data);
	console.log(`[UserService] Is array:`, Array.isArray(data));
	console.log(`[UserService] Array length:`, Array.isArray(data) ? data.length : "N/A");

	const result = Array.isArray(data) ? data : [];
	console.log(`[UserService] Returning: ${result.length} users`);

	return result;
};

/**
 * Obtener un usuario por ID
 */
const getUserById = async (userId: string): Promise<UserDto> => {
	const response = await fetch(`${BASE_URL}/${userId}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * Obtener estadísticas de usuarios
 */
const getStats = async (): Promise<UserStatsDto> => {
	const response = await fetch(`${BASE_URL}/stats`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * Obtener todos los estatus disponibles
 */
const getStatuses = async (): Promise<Array<{ id: number; name: string }>> => {
	console.log(`[UserService] Fetching statuses from ${BASE_URL}/statuses`);

	const response = await fetch(`${BASE_URL}/statuses`, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	console.log(`[UserService] Statuses received:`, data);

	// La API devuelve { id_Estatus, nombre }, necesitamos mapear a { id, name }
	if (Array.isArray(data)) {
		const mapped = data.map((status: any) => ({
			id: status.id_Estatus,
			name: status.nombre,
		}));
		console.log(`[UserService] Mapped statuses:`, mapped);
		return mapped;
	}

	return [];
};

/**
 * Obtener permisos del usuario actual
 */
const getPermissions = async (): Promise<string[]> => {
	const response = await fetch(`${BASE_URL}/permissions`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * Crear un nuevo usuario (registro)
 */
const createUser = async (data: CreateUserDto): Promise<string> => {
	const response = await fetch(`${BASE_URL}/register`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	return await handleResponse(response);
};

/**
 * Actualizar perfil de usuario
 */
const updateProfile = async (data: UpdateUserProfileDto): Promise<void> => {
	const response = await fetch(`${BASE_URL}/update-profile`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	return await handleResponse(response);
};

/**
 * Actualizar estatus de un usuario
 */
const updateStatus = async (userId: string, data: UpdateUserStatusDto): Promise<void> => {
	const response = await fetch(`${BASE_URL}/${userId}/status`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	return await handleResponse(response);
};

/**
 * Desbloquear usuario
 */
const unlockUser = async (userId: string): Promise<void> => {
	const response = await fetch(`${BASE_URL}/${userId}/unlock`, {
		method: "POST",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * Bloquear usuario
 */
const lockUser = async (userId: string, minutes: number = 30): Promise<void> => {
	const response = await fetch(`${BASE_URL}/${userId}/lock?minutes=${minutes}`, {
		method: "POST",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * Resetear intentos fallidos de login
 */
const resetFailedAttempts = async (userId: string): Promise<void> => {
	const response = await fetch(`${BASE_URL}/${userId}/reset-failed-attempts`, {
		method: "POST",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * Obtener usuarios bloqueados
 */
const getLockedUsers = async (): Promise<UserDto[]> => {
	console.log(`[UserService] Fetching locked users from ${BASE_URL}/locked-users`);

	const response = await fetch(`${BASE_URL}/locked-users`, {
		method: "GET",
		headers: getHeaders(),
	});

	console.log(`[UserService] Response status: ${response.status}`);

	const data = await handleResponse(response);
	console.log(`[UserService] Locked users data:`, data);

	const result = Array.isArray(data) ? data : [];
	console.log(`[UserService] Returning: ${result.length} locked users`);

	return result;
};

/**
 * Obtener información de bloqueo de un usuario
 */
const getLockoutInfo = async (userId: string): Promise<LockoutInfoDto> => {
	const response = await fetch(`${BASE_URL}/${userId}/lockout-info`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * Obtener usuarios en riesgo (con múltiples intentos fallidos)
 */
const getUsersAtRisk = async (): Promise<UsersAtRiskDto> => {
	console.log(`[UserService] Fetching users at risk from ${BASE_URL}/users-at-risk`);

	const response = await fetch(`${BASE_URL}/users-at-risk`, {
		method: "GET",
		headers: getHeaders(),
	});

	console.log(`[UserService] Response status: ${response.status}`);

	const data = await handleResponse(response);
	console.log(`[UserService] Users at risk:`, data);

	return data;
};

/**
 * Confirmar email directamente (admin action)
 * Usa el endpoint admin que NO requiere token de confirmación
 */
const confirmEmailDirect = async (email: string, nota?: string): Promise<{ message?: string; isSuccess: boolean }> => {
	console.log(`[UserService] Admin confirming email for: ${email}`);

	try {
		const response = await fetch(`${BASE_URL}/admin/confirm-email`, {
			method: "POST",
			headers: getHeaders(),
			body: JSON.stringify({
				email: email,
				nota: nota || "Verificado manualmente por administrador",
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`[UserService] ERROR: admin/confirm-email failed with status ${response.status}:`, errorText);
			throw new Error(`Error ${response.status}: ${errorText || "No se pudo verificar el email"}`);
		}

		const data = await handleResponse(response);
		console.log(`[UserService] Email confirmation result:`, data);

		return data || { isSuccess: true, message: "Email verificado correctamente" };
	} catch (error) {
		console.error(`[UserService] ERROR: Error confirming email:`, error);
		throw error;
	}
};

/**
 * Reenviar email de confirmación (admin action)
 * Usa el endpoint admin que permite agregar una nota
 */
const resendConfirmationEmail = async (email: string, nota?: string): Promise<{ message?: string }> => {
	console.log(`[UserService] Admin resending confirmation email to: ${email}`);

	const response = await fetch(`${BASE_URL}/admin/resend-confirmation`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify({
			email,
			nota: nota || "Email de confirmación reenviado por administrador",
		}),
	});

	const data = await handleResponse(response);
	console.log(`[UserService] Resend result:`, data);

	return data;
};

const userService = {
	login,
	logout,
	register,
	confirmEmail,
	confirmEmailDirect,
	resendConfirmationEmail,
	getAllUsers,
	getUsersByStatus,
	getUserById,
	getStats,
	getStatuses,
	getPermissions,
	createUser,
	updateProfile,
	updateStatus,
	unlockUser,
	lockUser,
	resetFailedAttempts,
	getLockedUsers,
	getLockoutInfo,
	getUsersAtRisk,
};

export default userService;
