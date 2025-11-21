/**
 * Servicio de API para gestión de incidencias
 * Base URL: https://waldoz-001-site1.stempurl.com/api/Incidencias
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Incidencias";

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

export interface IncidenciasFiltros {
	Estatus?: number;
	Prioridad?: string;
	ViajeID?: number;
	UnidadID?: number;
	TipoIncidenciaID?: number;
	AsignadoA?: string;
	ReportadoPor?: string;
	FechaDesde?: string;
	FechaHasta?: string;
	Busqueda?: string;
	Pagina?: number;
	TamanoPagina?: number;
	OrdenarPor?: string;
	Direccion?: string;
}

export interface IncidenciaListaDto {
	incidenciaID: number;
	codigoIncidencia: string;
	titulo: string;
	tipoIncidenciaNombre: string;
	prioridad: string;
	fechaReporte: string;
	estatus: number;
	estatusNombre: string;
	reportadorNombre: string;
	asignadoNombre: string;
	viajeID: number;
	viajeCodigoViaje: string;
	unidadPlacas: string;
}

export interface IncidenciaDetalleDto {
	incidenciaID: number;
	codigoIncidencia: string;
	tipoIncidenciaID: number;
	tipoIncidenciaNombre: string;
	tipoIncidenciaCategoria: string;
	viajeID: number;
	viajeCodigoViaje: string;
	unidadID: number;
	unidadPlacas: string;
	reportadoPor: string;
	reportadorNombre: string;
	reportadorEmail: string;
	titulo: string;
	descripcion: string;
	prioridad: string;
	fechaReporte: string;
	fechaResolucion: string;
	estatus: number;
	estatusNombre: string;
	estatusCodigo: string;
	asignadoA: string;
	asignadoNombre: string;
	asignadoEmail: string;
	tiempoTranscurrido: string;
	estaResuelta: boolean;
	diasDesdeReporte: number;
}

export interface CreateIncidenciaDto {
	tipoIncidenciaID: number;
	viajeID?: number;
	unidadID?: number;
	titulo: string;
	descripcion: string;
	prioridad: "Baja" | "Media" | "Alta" | "Crítica";
	urlEvidencia?: string;
}

export interface UpdateIncidenciaDto {
	estatus: number;
	prioridad: "Baja" | "Media" | "Alta" | "Crítica";
	asignadoA?: string;
	notas?: string;
}

export interface TipoIncidenciaDto {
	tipoIncidenciaID: number;
	codigo: string;
	nombre: string;
	categoria: string;
	prioridad: string;
	esActivo: boolean;
}

export interface EstadisticasIncidenciasDto {
	totalIncidencias: number;
	abiertas: number;
	enProceso: number;
	resueltas: number;
	cerradas: number;
	canceladas: number;
	porPrioridad: Array<{
		prioridad: string;
		cantidad: number;
		porcentaje: number;
	}>;
	porTipo: Array<{
		tipoID: number;
		tipo: string;
		categoria: string;
		cantidad: number;
		porcentaje: number;
	}>;
	tiempoPromedioResolucionHoras: number;
	reportadasHoy: number;
	reportadasEstaSemana: number;
	reportadasEsteMes: number;
}

// ==================== FUNCIONES ====================

/**
 * GET /api/Incidencias
 * Obtener lista de incidencias con filtros
 */
const getAll = async (filtros?: IncidenciasFiltros): Promise<IncidenciaListaDto[]> => {
	console.log("[IncidenciasService] Fetching incidencias with filtros:", filtros);

	const queryParams = new URLSearchParams();
	if (filtros?.Estatus !== undefined) queryParams.append("Estatus", String(filtros.Estatus));
	if (filtros?.Prioridad) queryParams.append("Prioridad", filtros.Prioridad);
	if (filtros?.ViajeID !== undefined) queryParams.append("ViajeID", String(filtros.ViajeID));
	if (filtros?.UnidadID !== undefined) queryParams.append("UnidadID", String(filtros.UnidadID));
	if (filtros?.TipoIncidenciaID !== undefined) queryParams.append("TipoIncidenciaID", String(filtros.TipoIncidenciaID));
	if (filtros?.AsignadoA) queryParams.append("AsignadoA", filtros.AsignadoA);
	if (filtros?.ReportadoPor) queryParams.append("ReportadoPor", filtros.ReportadoPor);
	if (filtros?.FechaDesde) queryParams.append("FechaDesde", filtros.FechaDesde);
	if (filtros?.FechaHasta) queryParams.append("FechaHasta", filtros.FechaHasta);
	if (filtros?.Busqueda) queryParams.append("Busqueda", filtros.Busqueda);
	if (filtros?.Pagina !== undefined) queryParams.append("Pagina", String(filtros.Pagina));
	if (filtros?.TamanoPagina !== undefined) queryParams.append("TamanoPagina", String(filtros.TamanoPagina));
	if (filtros?.OrdenarPor) queryParams.append("OrdenarPor", filtros.OrdenarPor);
	if (filtros?.Direccion) queryParams.append("Direccion", filtros.Direccion);

	const url = queryParams.toString() ? `${BASE_URL}?${queryParams}` : BASE_URL;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

/**
 * POST /api/Incidencias
 * Crear una nueva incidencia
 */
const create = async (payload: CreateIncidenciaDto): Promise<IncidenciaDetalleDto> => {
	console.log("[IncidenciasService] Creating incidencia:", payload);

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[IncidenciasService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.tipoIncidenciaID || payload.tipoIncidenciaID <= 0) {
		throw { status: 400, message: "El tipo de incidencia es requerido.", details: { field: "tipoIncidenciaID" } };
	}

	if (!payload.titulo || payload.titulo.trim() === "") {
		throw { status: 400, message: "El título es requerido.", details: { field: "titulo" } };
	}

	if (payload.titulo.length < 10) {
		throw { status: 400, message: "El título debe tener al menos 10 caracteres.", details: { field: "titulo" } };
	}

	if (!payload.descripcion || payload.descripcion.trim() === "") {
		throw { status: 400, message: "La descripción es requerida.", details: { field: "descripcion" } };
	}

	if (payload.descripcion.length < 10) {
		throw {
			status: 400,
			message: "La descripción debe tener al menos 10 caracteres.",
			details: { field: "descripcion" },
		};
	}

	if (!payload.prioridad) {
		throw { status: 400, message: "La prioridad es requerida.", details: { field: "prioridad" } };
	}

	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Incidencias/{id}
 * Obtener detalle de una incidencia
 */
const getById = async (id: number): Promise<IncidenciaDetalleDto> => {
	console.log("[IncidenciasService] Fetching incidencia by ID:", id);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * PUT /api/Incidencias/{id}
 * Actualizar una incidencia
 */
const update = async (id: number, payload: UpdateIncidenciaDto): Promise<IncidenciaDetalleDto> => {
	console.log("[IncidenciasService] Updating incidencia:", id, payload);

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[IncidenciasService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (payload.estatus === undefined || payload.estatus === null) {
		throw { status: 400, message: "El estatus es requerido.", details: { field: "estatus" } };
	}

	if (!payload.prioridad) {
		throw { status: 400, message: "La prioridad es requerida.", details: { field: "prioridad" } };
	}

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Incidencias/estadisticas
 * Obtener estadísticas de incidencias
 */
const getEstadisticas = async (): Promise<EstadisticasIncidenciasDto> => {
	console.log("[IncidenciasService] Fetching estadisticas");

	const response = await fetch(`${BASE_URL}/estadisticas`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Incidencias/viaje/{viajeId}
 * Obtener incidencias de un viaje específico
 */
const getByViaje = async (viajeId: number): Promise<IncidenciaDetalleDto[]> => {
	console.log("[IncidenciasService] Fetching incidencias for viaje:", viajeId);

	const response = await fetch(`${BASE_URL}/viaje/${viajeId}`, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

/**
 * GET /api/Incidencias/mis-reportes
 * Obtener incidencias reportadas por el usuario actual
 */
const getMisReportes = async (): Promise<IncidenciaDetalleDto[]> => {
	console.log("[IncidenciasService] Fetching mis reportes");

	const response = await fetch(`${BASE_URL}/mis-reportes`, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

/**
 * GET /api/Incidencias/tipos
 * Obtener tipos de incidencias disponibles
 */
const getTipos = async (): Promise<TipoIncidenciaDto[]> => {
	console.log("[IncidenciasService] Fetching tipos de incidencias");

	const response = await fetch(`${BASE_URL}/tipos`, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

const incidenciasService = {
	getAll,
	create,
	getById,
	update,
	getEstadisticas,
	getByViaje,
	getMisReportes,
	getTipos,
};

export default incidenciasService;
