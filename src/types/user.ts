/**
 * Tipos y DTOs para gestión de usuarios
 * Sincronizado con API BusTix
 */

/**
 * Catálogo de Estatus de Usuario
 */
export interface UserStatus {
	id_Estatus: number;
	nombre_Estatus: string;
}

/**
 * Valores de estatus disponibles
 */
export enum UserStatusEnum {
	Activo = 1,
	Inactivo = 2,
	Validado = 3,
	Pendiente = 4,
	Cancelado = 5,
	Suspendido = 6,
	Bloqueado = 7,
}

/**
 * DTO para registro de usuario (incluye documento)
 */
export interface RegisterDto {
	emailAddress: string;
	nombreCompleto: string; // Cambiado de fullName
	password: string;
	roles?: string[];
	tipoDocumento?: string; // ✨ Opcional
	numeroDocumento?: string; // ✨ Opcional
}

/**
 * DTO de detalle completo del usuario
 */
export interface UserDetailDto {
	id: string;
	email: string;
	fullName: string;
	roles: string[];
	phoneNumber?: string;
	phoneNumberConfirmed: boolean;
	accessFailedCount: number;
	estatus: number; // ✨ NUEVO
	estatusNombre: string; // ✨ NUEVO
	fechaRegistro: string; // ✨ NUEVO (ISO date)
	tipoDocumento: string; // ✨ NUEVO
	numeroDocumento: string; // ✨ NUEVO
	accountStatus: string;
	emailConfirmed: boolean;
}

/**
 * DTO para actualizar perfil de usuario
 */
export interface UpdateUserDto {
	fullName?: string;
	phoneNumber?: string;
	tipoDocumento?: string;
	numeroDocumento?: string;
}

/**
 * DTO para cambiar estatus de usuario
 */
export interface UpdateUserStatusDto {
	estatus: number; // 1-7
}

/**
 * DTO de respuesta de login
 */
export interface LoginResponseDto {
	token: string;
	refreshToken: string;
	isSuccess: boolean;
	message: string;
}

/**
 * DTO de permisos del usuario
 */
export interface UserPermissionsDto {
	userId: string;
	email: string;
	name: string;
	roles: string[];
	permissions: string[];
	sessionId: string;
	accountStatus: string;
}

/**
 * Estadísticas de usuarios por estatus
 */
export interface UserStatusStats {
	estatusId: number;
	estatusNombre: string;
	count: number;
	percentage: number;
}

/**
 * Estadísticas generales de usuarios
 */
export interface UserStatsDto {
	totalUsers: number;
	usersByStatus: UserStatusStats[];
	newUsers: {
		today: number;
		thisWeek: number;
		thisMonth: number;
	};
}

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T = any> {
	isSuccess: boolean;
	message: string;
	data?: T;
}

/**
 * Request de cambio de contraseña
 */
export interface ChangePasswordDto {
	email: string;
	currentPassword: string;
	newPassword: string;
}

/**
 * Request de forgot password
 */
export interface ForgotPasswordDto {
	email: string;
}

/**
 * Request de reset password
 */
export interface ResetPasswordDto {
	email: string;
	token: string;
	newPassword: string;
}

/**
 * Request de refresh token
 */
export interface RefreshTokenDto {
	email: string;
	refreshToken: string;
}
