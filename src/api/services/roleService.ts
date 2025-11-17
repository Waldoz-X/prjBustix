/**
 * Servicio de API para gestión de roles
 * Endpoints: GET, POST, PUT, DELETE roles y asignación a usuarios
 */

export interface RoleDto {
	id: string;
	name: string;
	normalizedName?: string;
	descripcion?: string;
	concurrencyStamp?: string;
	usuariosAsignados?: number;
	fechaCreacion?: string;
	fechaModificacion?: string | null;
	activo?: boolean;
	permisos?: string[];
}

export interface CreateRoleDto {
	name: string;
}

export interface UpdateRoleDto {
	name: string;
}

export interface AssignRoleDto {
	userId: string;
	roleId: string;
}

export interface RoleApiResponse {
	success: boolean;
	message: string;
	data: RoleDto;
}

export interface RolesListResponse {
	success: boolean;
	message: string;
	data: RoleDto[];
	pagination?: {
		currentPage: number;
		pageSize: number;
		totalPages: number;
		totalRecords: number;
	};
}

export interface PermisoDto {
	permisoId: number;
	clave: string;
	nombre: string;
	descripcion: string;
	modulo: string;
}

export interface RolePermisosResponse {
	success: boolean;
	message: string;
	data: {
		roleId: string;
		roleName: string;
		permisos: PermisoDto[];
		totalPermisos: number;
	};
}

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Roles";

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
	// Aceptar JSON y plain text para ser tolerantes con el backend
	Accept: "application/json, text/plain",
	Authorization: `Bearer ${getToken()}`,
});

/**
 * Intenta parsear la respuesta como JSON; si falla devuelve el texto crudo
 */
async function parseResponseSafe(response: Response): Promise<any> {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

/**
 * Obtiene todos los roles
 */
const getAll = async (params?: {
	page?: number;
	pageSize?: number;
	search?: string;
	activo?: boolean;
}): Promise<RolesListResponse> => {
	const queryParams = new URLSearchParams();
	if (params?.page) queryParams.append("page", params.page.toString());
	if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
	if (params?.search) queryParams.append("search", params.search);
	if (params?.activo !== undefined) queryParams.append("activo", params.activo.toString());

	const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;

		if (response.status === 401) {
			error.message = "No autorizado. Por favor, inicia sesión.";
		} else if (response.status === 403) {
			error.message = "No tienes permisos para ver los roles.";
		} else {
			error.message = "Error al obtener los roles";
		}

		throw error;
	}

	// El backend puede devolver directamente un array de roles (sin envoltura)
	const body = await response.json();

	if (Array.isArray(body)) {
		// Mapear respuesta simple a RolesListResponse esperado por la UI
		const mapped = body.map((r: any) => ({
			id: r.id,
			name: r.name,
			normalizedName: r.name?.toUpperCase?.(),
			descripcion: r.descripcion || "",
			concurrencyStamp: r.concurrencyStamp,
			usuariosAsignados: r.totalUsers ?? r.usuariosAsignados ?? 0,
			fechaCreacion: r.fechaCreacion,
			fechaModificacion: r.fechaModificacion ?? null,
			activo: r.activo ?? true,
		}));

		return {
			success: true,
			message: "Roles obtenidos exitosamente",
			data: mapped,
			pagination: {
				currentPage: params?.page || 1,
				pageSize: params?.pageSize || mapped.length,
				totalPages: 1,
				totalRecords: mapped.length,
			},
		};
	}

	// Si viene una envoltura (success/message/data)
	return body as RolesListResponse;
};

/**
 * Obtiene un rol por ID
 */
const getById = async (id: string): Promise<RoleApiResponse> => {
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "GET",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;

		if (response.status === 404) {
			error.message = "Rol no encontrado";
		} else if (response.status === 401) {
			error.message = "No autorizado";
		} else {
			error.message = "Error al obtener el rol";
		}

		throw error;
	}

	return response.json();
};

/**
 * Crea un nuevo rol
 */
const create = async (data: CreateRoleDto): Promise<RoleApiResponse> => {
	// Validar datos antes de enviar
	if (!data.name || data.name.trim() === "") {
		const error: any = new Error("El nombre del rol es requerido");
		error.status = 400;
		throw error;
	}

	// Asegurar que enviamos los datos en el formato correcto que exige el backend
	// Backend espera: { roleName: string }
	const payload = {
		roleName: data.name.trim(),
	};

	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;

		// Intentar obtener el mensaje de error del backend
		try {
			const errorData = await response.json();
			error.message = errorData.message || errorData.Message || "Error al crear el rol";
			error.errors = errorData.errors || errorData.Errors;
		} catch {
			// Si no hay JSON, usar mensajes por defecto
			if (response.status === 400) {
				error.message = "Datos inválidos. Verifica que el nombre sea válido.";
			} else if (response.status === 409) {
				error.message = "El rol ya existe.";
			} else if (response.status === 401) {
				error.message = "No autorizado";
			} else if (response.status === 403) {
				error.message = "No tienes permisos para crear roles.";
			} else {
				error.message = "Error al crear el rol";
			}
		}

		throw error;
	}

	return response.json();
};

/**
 * Actualiza un rol existente
 */
const update = async (id: string, data: UpdateRoleDto): Promise<RoleApiResponse> => {
	// Validar datos antes de enviar
	if (!data.name || data.name.trim() === "") {
		const error: any = new Error("El nombre del rol es requerido");
		error.status = 400;
		throw error;
	}

	// Asegurar que enviamos los datos en el formato correcto que exige el backend
	// Backend espera: { roleName: string } (igual que create)
	const payload = {
		roleName: data.name.trim(),
	};

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;

		// Intentar obtener el mensaje de error del backend
		try {
			const errorData = await response.json();
			error.message = errorData.message || errorData.Message || "Error al actualizar el rol";
			error.errors = errorData.errors || errorData.Errors;
		} catch {
			// Si no hay JSON, usar mensajes por defecto
			if (response.status === 404) {
				error.message = "Rol no encontrado";
			} else if (response.status === 400) {
				error.message = "Datos inválidos. Verifica que el nombre sea válido.";
			} else if (response.status === 401) {
				error.message = "No autorizado";
			} else if (response.status === 403) {
				error.message = "No tienes permisos para actualizar roles.";
			} else {
				error.message = "Error al actualizar el rol";
			}
		}

		throw error;
	}

	return response.json();
};

/**
 * Elimina un rol
 */
const deleteRole = async (id: string): Promise<{ success: boolean; message: string }> => {
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;

		if (response.status === 404) {
			error.message = "Rol no encontrado";
		} else if (response.status === 401) {
			error.message = "No autorizado";
		} else if (response.status === 403) {
			error.message = "No tienes permisos para eliminar roles.";
		} else if (response.status === 409) {
			error.message = "No se puede eliminar este rol porque tiene usuarios asignados o es un rol del sistema.";
		} else {
			error.message = "Error al eliminar el rol";
		}

		throw error;
	}

	// Intentar parsear respuesta (puede ser text/plain o JSON vacío)
	const parsed = await parseResponseSafe(response);
	if (!parsed) {
		return { success: true, message: "Rol eliminado exitosamente" };
	}

	// Si backend devuelve objeto con success/message
	if (typeof parsed === "object") {
		return {
			success: parsed.success ?? true,
			message: parsed.message ?? "Rol eliminado exitosamente",
		};
	}

	// Si es texto, devolver como message
	return { success: true, message: String(parsed) };
};

/**
 * Asigna un rol a un usuario
 */
const assignToUser = async (data: AssignRoleDto): Promise<RoleApiResponse> => {
	// Validar payload
	if (!data || !data.userId || !data.roleId) {
		const error: any = new Error("userId y roleId son requeridos");
		error.status = 400;
		throw error;
	}
	const response = await fetch(`${BASE_URL}/assign`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify({ userId: data.userId, roleId: data.roleId }),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;

		if (response.status === 404) {
			error.message = "Usuario o rol no encontrado";
		} else if (response.status === 401) {
			error.message = "No autorizado";
		} else if (response.status === 403) {
			error.message = "No tienes permisos para asignar roles.";
		} else if (response.status === 409) {
			error.message = "El usuario ya tiene este rol asignado.";
		} else {
			error.message = "Error al asignar el rol";
		}

		throw error;
	}

	// Parsear respuesta de forma segura
	const parsed = await parseResponseSafe(response);
	if (!parsed) {
		return { success: true, message: "Rol asignado exitosamente", data: null as any };
	}
	return parsed as RoleApiResponse;
};

/**
 * Remueve un rol de un usuario
 */
const removeFromUser = async (roleId: string, userId: string): Promise<{ success: boolean; message: string }> => {
	const response = await fetch(`${BASE_URL}/${roleId}/usuarios/${userId}`, {
		method: "DELETE",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;

		if (response.status === 404) {
			error.message = "Usuario o rol no encontrado";
		} else if (response.status === 401) {
			error.message = "No autorizado";
		} else if (response.status === 403) {
			error.message = "No tienes permisos para remover roles.";
		} else {
			error.message = "Error al remover el rol";
		}

		throw error;
	}

	// Parsear respuesta de forma segura (podría venir text/plain o vacío)
	const parsed = await parseResponseSafe(response);
	if (!parsed) {
		return { success: true, message: "Rol removido del usuario exitosamente" };
	}
	if (typeof parsed === "object") {
		return {
			success: parsed.success ?? true,
			message: parsed.message ?? "Rol removido del usuario exitosamente",
		};
	}
	return { success: true, message: String(parsed) };
};

/**
 * Obtiene los permisos de un rol
 */
const getPermisos = async (roleId: string): Promise<RolePermisosResponse> => {
	const response = await fetch(`${BASE_URL}/${roleId}/permisos`, {
		method: "GET",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;

		if (response.status === 404) {
			error.message = "Rol no encontrado";
		} else if (response.status === 401) {
			error.message = "No autorizado";
		} else if (response.status === 403) {
			error.message = "No tienes permisos para ver los permisos de roles.";
		} else {
			error.message = "Error al obtener los permisos";
		}

		throw error;
	}

	return response.json();
};

export default {
	getAll,
	getById,
	create,
	update,
	delete: deleteRole,
	assignToUser,
	removeFromUser,
	getPermisos,
};
