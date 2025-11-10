/**
 * Servicio de API para gestión de roles
 * Endpoints: GET, POST, PUT, DELETE roles y asignación a usuarios
 */

export interface RoleDto {
	id: string;
	name: string;
}

export interface CreateRoleDto {
	name: string;
}

export interface UpdateRoleDto {
	name: string;
}

export interface AssignRoleDto {
	userId?: string;
	email?: string;
}

export interface RoleApiResponse {
	id: string;
	name: string;
}

export enum RoleApi {
	GetAll = "/roles",
	GetById = "/roles/:id",
	Create = "/roles",
	Update = "/roles/:id",
	Delete = "/roles/:id",
	Assign = "/roles/:roleName/assign",
	Remove = "/roles/:roleName/remove",
}

const BASE_URL = "http://localhost:5289/api/roles";

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
	Accept: "application/json",
	Authorization: `Bearer ${getToken()}`,
});

/**
 * Obtiene todos los roles
 */
const getAll = async (): Promise<RoleDto[]> => {
	const response = await fetch(BASE_URL, {
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

	return response.json();
};

/**
 * Obtiene un rol por ID
 */
const getById = async (id: string): Promise<RoleDto> => {
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
	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;

		if (response.status === 400) {
			error.message = "Datos inválidos. El nombre es requerido.";
		} else if (response.status === 409) {
			error.message = "El rol ya existe.";
		} else if (response.status === 401) {
			error.message = "No autorizado";
		} else if (response.status === 403) {
			error.message = "No tienes permisos para crear roles.";
		} else {
			error.message = "Error al crear el rol";
		}

		throw error;
	}

	return response.json();
};

/**
 * Actualiza un rol existente
 */
const update = async (id: string, data: UpdateRoleDto): Promise<void> => {
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;

		if (response.status === 404) {
			error.message = "Rol no encontrado";
		} else if (response.status === 400) {
			error.message = "Datos inválidos";
		} else if (response.status === 401) {
			error.message = "No autorizado";
		} else if (response.status === 403) {
			error.message = "No tienes permisos para actualizar roles.";
		} else {
			error.message = "Error al actualizar el rol";
		}

		throw error;
	}
};

/**
 * Elimina un rol
 */
const deleteRole = async (id: string): Promise<void> => {
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
		} else {
			error.message = "Error al eliminar el rol";
		}

		throw error;
	}
};

/**
 * Asigna un rol a un usuario
 */
const assignToUser = async (roleName: string, data: AssignRoleDto): Promise<void> => {
	const response = await fetch(`${BASE_URL}/${roleName}/assign`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(data),
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
		} else {
			error.message = "Error al asignar el rol";
		}

		throw error;
	}
};

/**
 * Remueve un rol de un usuario
 */
const removeFromUser = async (roleName: string, data: AssignRoleDto): Promise<void> => {
	const response = await fetch(`${BASE_URL}/${roleName}/remove`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;

		if (response.status === 404) {
			error.message = "Usuario no encontrado";
		} else if (response.status === 401) {
			error.message = "No autorizado";
		} else if (response.status === 403) {
			error.message = "No tienes permisos para remover roles.";
		} else {
			error.message = "Error al remover el rol";
		}

		throw error;
	}
};

export default {
	getAll,
	getById,
	create,
	update,
	delete: deleteRole,
	assignToUser,
	removeFromUser,
};
