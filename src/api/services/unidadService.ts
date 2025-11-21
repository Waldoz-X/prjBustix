/**
 * Servicio de API para gestión de Unidades (Flota)
 * Base URL: https://waldoz-001-site1.stempurl.com/api/Unidades
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Unidades";

/**
 * Obtener el token de autenticación del localStorage
 */
const getToken = (): string | null => {
	return localStorage.getItem("token");
};

const getHeaders = () => {
	const token = getToken();
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
};

const handleResponse = async (response: Response) => {
	if (!response.ok) {
		let parsed: any;
		try {
			parsed = await response.json();
		} catch (_e) {
			try {
				parsed = { title: await response.text() };
			} catch {
				parsed = null;
			}
		}
		console.error("API Error:", parsed || response.statusText);
		throw {
			status: response.status,
			statusText: response.statusText,
			...(parsed || {}),
		};
	}
	const text = await response.text();
	return text ? JSON.parse(text) : null;
};

// ==================== TIPOS ====================

export interface UnidadDto {
	id: number;
	numeroEconomico: string;
	placas: string;
	marca: string;
	modelo: string;
	año: number;
	tipoUnidad: string;
	capacidadAsientos: number;
	tieneClimatizacion: boolean;
	tieneBaño: boolean;
	tieneWifi: boolean;
	urlFoto: string;
	estatus: number;
	fechaAlta: string;
}

export interface CreateUnidadDto {
	numeroEconomico: string;
	placas: string;
	marca: string;
	modelo: string;
	año: number;
	tipoUnidad: string;
	capacidadAsientos: number;
	tieneClimatizacion: boolean;
	tieneBaño: boolean;
	tieneWifi: boolean;
	urlFoto?: string;
	estatus: number;
}

export interface UpdateUnidadDto {
	numeroEconomico: string;
	placas: string;
	marca: string;
	modelo: string;
	año: number;
	tipoUnidad: string;
	capacidadAsientos: number;
	tieneClimatizacion: boolean;
	tieneBaño: boolean;
	tieneWifi: boolean;
	urlFoto?: string;
	estatus: number;
}

export interface UnidadesFilterParams {
	activos?: boolean;
	search?: string;
}

// ==================== FUNCIONES ====================

/**
 * GET /api/Unidades
 * Obtener todas las unidades con filtros opcionales
 * @param filters - Filtros opcionales (activos, search)
 */
const getAll = async (filters?: UnidadesFilterParams): Promise<UnidadDto[]> => {
	console.log("[UnidadesService] Fetching unidades with filters:", filters);

	const params = new URLSearchParams();
	if (filters?.activos !== undefined) params.append("activos", String(filters.activos));
	if (filters?.search) params.append("search", filters.search);

	const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	console.log("[UnidadesService] Unidades received:", Array.isArray(data) ? data.length : data ? 1 : 0);

	return Array.isArray(data) ? data : [];
};

/**
 * GET /api/Unidades/{id}
 * Obtener una unidad por ID
 */
const getById = async (id: number): Promise<UnidadDto> => {
	console.log("[UnidadesService] Fetching unidad by ID:", id);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * POST /api/Unidades
 * Crear una nueva unidad
 */
const create = async (payload: CreateUnidadDto): Promise<UnidadDto> => {
	console.log("[UnidadesService] Creating unidad with payload:", payload);

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[UnidadesService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.numeroEconomico || payload.numeroEconomico.trim() === "") {
		throw { status: 400, message: "El número económico es requerido.", details: { field: "numeroEconomico" } };
	}

	if (!payload.placas || payload.placas.trim() === "") {
		throw { status: 400, message: "Las placas son requeridas.", details: { field: "placas" } };
	}

	if (!payload.tipoUnidad || payload.tipoUnidad.trim() === "") {
		throw { status: 400, message: "El tipo de unidad es requerido.", details: { field: "tipoUnidad" } };
	}

	if (typeof payload.capacidadAsientos !== "number" || payload.capacidadAsientos <= 0) {
		throw {
			status: 400,
			message: "La capacidad de asientos debe ser un número mayor a 0.",
			details: { field: "capacidadAsientos" },
		};
	}

	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * PUT /api/Unidades/{id}
 * Actualizar una unidad existente
 */
const update = async (id: number, payload: UpdateUnidadDto): Promise<void> => {
	console.log("[UnidadesService] Updating unidad with payload:", id, payload);

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[UnidadesService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.numeroEconomico || payload.numeroEconomico.trim() === "") {
		throw { status: 400, message: "El número económico es requerido.", details: { field: "numeroEconomico" } };
	}

	if (!payload.placas || payload.placas.trim() === "") {
		throw { status: 400, message: "Las placas son requeridas.", details: { field: "placas" } };
	}

	if (!payload.tipoUnidad || payload.tipoUnidad.trim() === "") {
		throw { status: 400, message: "El tipo de unidad es requerido.", details: { field: "tipoUnidad" } };
	}

	if (typeof payload.capacidadAsientos !== "number" || payload.capacidadAsientos <= 0) {
		throw {
			status: 400,
			message: "La capacidad de asientos debe ser un número mayor a 0.",
			details: { field: "capacidadAsientos" },
		};
	}

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	await handleResponse(response);
};

/**
 * DELETE /api/Unidades/{id}
 * Eliminar una unidad
 */
const deleteUnidad = async (id: number): Promise<void> => {
	console.log("[UnidadesService] Deleting unidad:", id);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	});

	await handleResponse(response);
};

const unidadService = {
	getAll,
	getById,
	create,
	update,
	delete: deleteUnidad,
};

export default unidadService;
