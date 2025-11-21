/**
 * Servicio de API para gestión de rutas
 * Base URL: https://waldoz-001-site1.stempurl.com/api/Rutas
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Rutas";

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

export interface RutaDto {
	rutaID: number;
	codigoRuta: string;
	nombreRuta: string;
	ciudadOrigen: string;
	ciudadDestino: string;
	puntoPartidaLat: number;
	puntoPartidaLong: number;
	puntoPartidaNombre: string;
	puntoLlegadaLat: number;
	puntoLlegadaLong: number;
	puntoLlegadaNombre: string;
	distanciaKm: number;
	tiempoEstimadoMinutos: number;
	activa: boolean;
	fechaCreacion: string;
	totalParadas: number;
	totalViajes: number;
}

export interface ParadaRutaDto {
	nombreParada: string;
	latitud: number;
	longitud: number;
	direccion: string;
	ordenParada: number;
	tiempoEsperaMinutos: number;
}

export interface CreateRutaDto {
	codigoRuta: string;
	nombreRuta: string;
	ciudadOrigen: string;
	ciudadDestino: string;
	puntoPartidaLat: number;
	puntoPartidaLong: number;
	puntoPartidaNombre: string;
	puntoLlegadaLat: number;
	puntoLlegadaLong: number;
	puntoLlegadaNombre: string;
	distanciaKm: number;
	tiempoEstimadoMinutos: number;
	paradas?: ParadaRutaDto[];
}

// ==================== FUNCIONES ====================

/**
 * GET /api/Rutas
 * Obtener todas las rutas con filtro opcional
 * @param soloActivas - Si es true, solo retorna rutas activas
 */
const getAll = async (soloActivas?: boolean): Promise<RutaDto[]> => {
	console.log("[RutasService] Fetching rutas, soloActivas:", soloActivas);

	const params = new URLSearchParams();
	if (soloActivas !== undefined) params.append("soloActivas", String(soloActivas));

	const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	console.log("[RutasService] Rutas received:", Array.isArray(data) ? data.length : data ? 1 : 0);

	return Array.isArray(data) ? data : [];
};

/**
 * GET /api/Rutas/{id}
 * Obtener una ruta por ID
 */
const getById = async (id: number): Promise<RutaDto> => {
	console.log("[RutasService] Fetching ruta by ID:", id);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * POST /api/Rutas
 * Crear una nueva ruta
 */
const create = async (payload: CreateRutaDto): Promise<RutaDto> => {
	console.log("[RutasService] Creating ruta with payload:", payload);

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[RutasService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.codigoRuta || payload.codigoRuta.trim() === "") {
		throw { status: 400, message: "El código de ruta es requerido.", details: { field: "codigoRuta" } };
	}

	if (!payload.nombreRuta || payload.nombreRuta.trim() === "") {
		throw { status: 400, message: "El nombre de ruta es requerido.", details: { field: "nombreRuta" } };
	}

	if (!payload.ciudadOrigen || payload.ciudadOrigen.trim() === "") {
		throw { status: 400, message: "La ciudad de origen es requerida.", details: { field: "ciudadOrigen" } };
	}

	if (!payload.ciudadDestino || payload.ciudadDestino.trim() === "") {
		throw { status: 400, message: "La ciudad de destino es requerida.", details: { field: "ciudadDestino" } };
	}

	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * DELETE /api/Rutas/{id}
 * Eliminar una ruta
 */
const deleteRuta = async (id: number): Promise<void> => {
	console.log("[RutasService] Deleting ruta:", id);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	});

	await handleResponse(response);
};

/**
 * PUT /api/Rutas/{id}/toggle
 * Activar/desactivar una ruta
 */
const toggle = async (id: number): Promise<void> => {
	console.log("[RutasService] Toggling ruta:", id);

	const response = await fetch(`${BASE_URL}/${id}/toggle`, {
		method: "PUT",
		headers: getHeaders(),
	});

	await handleResponse(response);
};

/**
 * GET /api/Rutas/{id}/paradas
 * Obtener las paradas de una ruta
 */
const getParadas = async (id: number): Promise<ParadaRutaDto[]> => {
	console.log("[RutasService] Fetching paradas for ruta:", id);

	const response = await fetch(`${BASE_URL}/${id}/paradas`, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

const rutasService = {
	getAll,
	getById,
	create,
	delete: deleteRuta,
	toggle,
	getParadas,
};

export default rutasService;
