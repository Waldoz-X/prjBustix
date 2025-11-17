/**
 * Servicio de API para gestión de Unidades (Flota)
 * Endpoints: GET, POST, PUT, DELETE unidades
 */

export interface UnidadResponseDto {
	Id: number;
	NumeroEconomico: string;
	Placas: string;
	Marca?: string;
	Modelo?: string;
	Año?: number;
	TipoUnidad: string;
	CapacidadAsientos: number;
	TieneClimatizacion: boolean;
	TieneBaño: boolean;
	TieneWifi: boolean;
	UrlFoto?: string;
	Estatus: number;
	FechaAlta: string;
}

export interface CreateUnidadDto {
	NumeroEconomico: string;
	Placas: string;
	Marca?: string;
	Modelo?: string;
	Año?: number;
	TipoUnidad: string;
	CapacidadAsientos: number;
	TieneClimatizacion: boolean;
	TieneBaño: boolean;
	TieneWifi: boolean;
	UrlFoto?: string;
	Estatus: number;
}

export interface UpdateUnidadDto {
	NumeroEconomico: string;
	Placas: string;
	Marca?: string;
	Modelo?: string;
	Año?: number;
	TipoUnidad: string;
	CapacidadAsientos: number;
	TieneClimatizacion: boolean;
	TieneBaño: boolean;
	TieneWifi: boolean;
	UrlFoto?: string;
	Estatus: number;
}

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Unidades";

const getToken = (): string | null => {
	return localStorage.getItem("token");
};

const getHeaders = () => ({
	"Content-Type": "application/json",
	Accept: "application/json, text/plain",
	Authorization: `Bearer ${getToken()}`,
});

/**
 * Obtiene todas las unidades
 */
const getAll = async (): Promise<{ success: boolean; message: string; data: UnidadResponseDto[] }> => {
	const response = await fetch(BASE_URL, {
		method: "GET",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		error.message = "Error al obtener las unidades";
		throw error;
	}

	const body = await response.json();
	// Si backend devuelve array directo
	if (Array.isArray(body)) {
		return {
			success: true,
			message: "Unidades obtenidas exitosamente",
			data: body,
		};
	}
	return body;
};

/**
 * Obtiene una unidad por ID
 */
const getById = async (id: number): Promise<{ success: boolean; message: string; data: UnidadResponseDto }> => {
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "GET",
		headers: getHeaders(),
	});

	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		error.message = response.status === 404 ? "Unidad no encontrada" : "Error al obtener la unidad";
		throw error;
	}
	return response.json();
};

/**
 * Crea una nueva unidad
 */
const create = async (
	data: CreateUnidadDto,
): Promise<{ success: boolean; message: string; data: UnidadResponseDto }> => {
	// Validación básica
	if (
		!data.NumeroEconomico ||
		!data.Placas ||
		!data.TipoUnidad ||
		typeof data.CapacidadAsientos !== "number" ||
		typeof data.Estatus !== "number"
	) {
		const error: any = new Error("Campos obligatorios faltantes");
		error.status = 400;
		throw error;
	}
	const payload = { ...data };
	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		try {
			const errorData = await response.json();
			error.message = errorData.message || "Error al crear la unidad";
		} catch {
			error.message = "Error al crear la unidad";
		}
		throw error;
	}
	return response.json();
};

/**
 * Actualiza una unidad existente
 */
const update = async (id: number, data: UpdateUnidadDto): Promise<void> => {
	// Validación básica
	if (
		!data.NumeroEconomico ||
		!data.Placas ||
		!data.TipoUnidad ||
		typeof data.CapacidadAsientos !== "number" ||
		typeof data.Estatus !== "number"
	) {
		const error: any = new Error("Campos obligatorios faltantes");
		error.status = 400;
		throw error;
	}
	const payload = { ...data };
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		try {
			const errorData = await response.json();
			error.message = errorData.message || "Error al actualizar la unidad";
		} catch {
			error.message = "Error al actualizar la unidad";
		}
		throw error;
	}
	// NoContent, no retorna nada
};

/**
 * Elimina una unidad
 */
const deleteUnidad = async (id: number): Promise<void> => {
	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	});
	if (!response.ok) {
		const error: any = new Error();
		error.status = response.status;
		error.message = response.status === 404 ? "Unidad no encontrada" : "Error al eliminar la unidad";
		throw error;
	}
	// NoContent, no retorna nada
};

export const unidadService = {
	getAll,
	getById,
	create,
	update,
	delete: deleteUnidad,
};
