/**
 * Servicio de API para gestión de viajes
 * Base URL: https://waldoz-001-site1.stempurl.com/api/Viajes
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Viajes";

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

export interface ViajeDto {
	viajeID: number;
	codigoViaje: string;
	tipoViaje: string;
	eventoID: number;
	eventoNombre: string;
	eventoFecha: string;
	plantillaRutaID: number;
	rutaNombre: string;
	ciudadOrigen: string;
	ciudadDestino: string;
	unidadID: number;
	unidadPlacas: string;
	unidadModelo: string;
	choferID: string;
	choferNombre: string;
	fechaSalida: string;
	fechaLlegadaEstimada: string;
	cupoTotal: number;
	asientosDisponibles: number;
	asientosVendidos: number;
	precioBase: number;
	cargoServicio: number;
	ventasAbiertas: boolean;
	estatus: number;
	estatusNombre: string;
	fechaCreacion: string;
	totalParadas: number;
	totalStaff: number;
	totalIncidencias: number;
}

export interface CreateViajeDto {
	eventoID: number;
	plantillaRutaID: number;
	unidadID: number;
	choferID: string;
	tipoViaje: string;
	fechaSalida: string;
	fechaLlegadaEstimada: string;
	cupoTotal: number;
	precioBase: number;
	cargoServicio: number;
	ventasAbiertas: boolean;
}

export interface UpdateViajeDto {
	unidadID: number;
	choferID: string;
	fechaSalida: string;
	fechaLlegadaEstimada: string;
	precioBase: number;
	cargoServicio: number;
	ventasAbiertas: boolean;
	estatus?: number;
}

export interface ParadaDto {
	paradaID: number;
	viajeID: number;
	ubicacionNombre: string;
	direccion: string;
	ciudad: string;
	ubicacionLat: number;
	ubicacionLong: number;
	orden: number;
	horaEstimadaLlegada: string;
	horaRealLlegada?: string;
	pasajerosSuben: number;
	pasajerosBajan: number;
	estatus: number;
	estatusNombre: string;
}

export interface PasajeroManifiestoDto {
	boletoID: number;
	codigoQR: string;
	clienteID: string;
	clienteNombre: string;
	clienteEmail: string;
	clienteTelefono: string;
	asientoAsignado: string;
	estadoBoleto: string;
	estadoAbordaje: string;
	fechaValidacion?: string;
	validadoPor?: string;
}

export interface ManifiestoDto {
	viajeID: number;
	codigoViaje: string;
	fechaSalida: string;
	totalPasajeros: number;
	pasajerosAbordados: number;
	pasajerosPendientes: number;
	pasajerosNoAsistieron: number;
	pasajeros: PasajeroManifiestoDto[];
}

export interface AsignacionStaffDto {
	asignacionID: number;
	viajeID: number;
	staffID: string;
	staffNombre: string;
	staffEmail: string;
	staffTelefono: string;
	rolEnViaje: string;
	fechaAsignacion: string;
	observaciones: string;
}

export interface CreateStaffAsignacionDto {
	staffID: string;
	rolEnViaje: string;
	observaciones?: string;
}

export interface UpdateStaffAsignacionDto {
	rolEnViaje: string;
	observaciones?: string;
}

export interface ConflictoDisponibilidadDto {
	viajeID: number;
	codigoViaje: string;
	fechaSalida: string;
	fechaLlegadaEstimada: string;
	eventoNombre: string;
	rutaNombre: string;
}

export interface DisponibilidadDto {
	estaDisponible: boolean;
	mensaje: string;
	conflictos: ConflictoDisponibilidadDto[];
}

export interface ViajesFilterParams {
	eventoID?: number;
	// Alias que algunos endpoints usan
	eventoId?: number;
	estatus?: number;
	fechaDesde?: string;
	fechaHasta?: string;
	ciudadOrigen?: string;
	ciudadDestino?: string;
	soloDisponibles?: boolean;
}

export interface MisViajesParams {
	fechaDesde?: string;
	fechaHasta?: string;
	soloProximos?: boolean;
}

export interface VerificarDisponibilidadParams {
	fechaInicio: string;
	fechaFin: string;
	unidadId?: number;
	choferId?: string;
	staffId?: string;
}

export interface ParadaClienteDto {
	paradaViajeID: number;
	nombreParada: string;
	direccion: string;
	latitud: number;
	longitud: number;
	ordenParada: number;
	horaEstimadaLlegada: string;
	tiempoEsperaMinutos: number;
	precioBase: number;
	cargoServicio: number;
	precioTotal: number;
	iva: number;
	totalAPagar: number;
	asientosDisponibles: number;
	tieneDisponibilidad: boolean;
}

export interface PrecioParadaDto {
	precioParadaID: number;
	viajeID: number;
	paradaViajeID: number;
	nombreParada: string;
	precioBase: number;
	cargoServicio: number;
	precioTotal: number;
	esActivo: boolean;
	fechaCreacion: string;
	creadoPor: string;
	nombreCreador: string;
	observaciones: string;
}

export interface ConfigurarPrecioParadaDto {
	paradaViajeID: number;
	precioBase: number;
	cargoServicio: number;
	observaciones?: string;
}

export interface UpdatePrecioParadaDto {
	paradaViajeID: number;
	precioBase: number;
	cargoServicio: number;
	observaciones?: string;
}

// ==================== CHECK-IN PROGRESIVO ====================

export interface EstadoParadaViajeDto {
	estadoParadaViajeID: number;
	viajeID: number;
	codigoViaje: string;
	paradaViajeID: number;
	nombreParada: string;
	direccion: string;
	ordenParada: number;
	horaEstimadaLlegada: string;
	estado: string;
	fechaHoraLlegadaChofer: string;
	choferID: string;
	nombreChofer: string;
	latitudConfirmacion: number;
	longitudConfirmacion: number;
	fechaHoraInicioValidacion: string;
	fechaHoraFinalizacionValidacion: string;
	staffID: string;
	nombreStaff: string;
	totalPasajerosEsperados: number;
	totalPasajerosAbordados: number;
	totalPasajerosNoShow: number;
	pasajerosPorValidar: number;
	tuvoIncidencia: boolean;
	observaciones: string;
}

export interface ProgresoCheckinDto {
	viajeID: number;
	codigoViaje: string;
	estadoGeneral: string;
	fechaSalida: string;
	totalParadas: number;
	paradasCompletadas: number;
	paradaActual: number;
	paradas: EstadoParadaViajeDto[];
	totalPasajerosViaje: number;
	totalAbordados: number;
	totalNoShow: number;
	totalPendientes: number;
	porcentajeAvance: number;
}

export interface ConfirmarLlegadaDto {
	paradaViajeID: number;
	latitud: number;
	longitud: number;
	observaciones?: string;
}

export interface IniciarValidacionDto {
	paradaViajeID: number;
	observaciones?: string;
}

export interface FinalizarValidacionDto {
	paradaViajeID: number;
	totalAbordados: number;
	totalNoShow: number;
	observaciones?: string;
}

export interface ViajeDetalleClienteDto {
	viajeID: number;
	codigoViaje: string;
	tipoViaje: string;
	eventoID: number;
	eventoNombre: string;
	eventoDescripcion: string;
	eventoFecha: string;
	eventoRecinto: string;
	eventoCiudad: string;
	eventoUrlImagen: string;
	rutaNombre: string;
	ciudadOrigen: string;
	ciudadDestino: string;
	fechaSalida: string;
	fechaLlegadaEstimada: string;
	duracionEstimadaHoras: number;
	cupoTotal: number;
	asientosDisponibles: number;
	asientosVendidos: number;
	porcentajeOcupacion: number;
	ventasAbiertas: boolean;
	precioBase: number;
	cargoServicio: number;
	precioDesde: number;
	precioHasta: number;
	unidadModelo: string;
	unidadPlacas: string;
	capacidadUnidad: number;
	choferNombre: string;
	paradas: ParadaClienteDto[];
	observaciones: string;
	tieneServicioWifi: boolean;
	tieneAireAcondicionado: boolean;
	tieneBaño: boolean;
}

// Caracteres no permitidos a nivel cliente/servicio (se detectan y se rechazan)
const forbiddenPattern = /(--|;|<|>|\/\*|\*\/|\$|\||\\|%|&)/;
const hasForbiddenChars = (s: any): boolean => {
	if (s === null || s === undefined) return false;
	try {
		return forbiddenPattern.test(String(s));
	} catch {
		return false;
	}
};

// ==================== FUNCIONES ====================

/**
 * GET /api/Viajes
 * Obtener todos los viajes con filtros opcionales
 */
const getAllViajes = async (filters?: ViajesFilterParams): Promise<ViajeDto[]> => {
	console.log("[ViajesService] Fetching viajes with filters:", filters);

	const params = new URLSearchParams();
	const evento = filters?.eventoID ?? filters?.eventoId;
	if (evento !== undefined && evento !== null) params.append("eventoId", String(evento));
	if (filters?.estatus !== undefined) params.append("estatus", String(filters.estatus));
	if (filters?.fechaDesde) params.append("fechaDesde", filters.fechaDesde);
	if (filters?.fechaHasta) params.append("fechaHasta", filters.fechaHasta);
	if (filters?.ciudadOrigen) params.append("ciudadOrigen", filters.ciudadOrigen);
	if (filters?.ciudadDestino) params.append("ciudadDestino", filters.ciudadDestino);
	if (filters?.soloDisponibles !== undefined) params.append("soloDisponibles", String(filters.soloDisponibles));

	const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	console.log("[ViajesService] Viajes received:", Array.isArray(data) ? data.length : data ? 1 : 0);

	return Array.isArray(data) ? data : [];
};

/**
 * GET /api/Viajes/{id}
 * Obtener un viaje por ID
 */
const getViajeById = async (id: number): Promise<ViajeDto> => {
	console.log("[ViajesService] Fetching viaje by ID:", id);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Viajes/{id}/detalle-cliente
 * Obtener detalle completo de un viaje para clientes (incluye paradas con precios, amenidades, etc.)
 */
const getDetalleCliente = async (id: number): Promise<ViajeDetalleClienteDto> => {
	console.log("[ViajesService] Fetching detalle cliente for viaje:", id);

	const response = await fetch(`${BASE_URL}/${id}/detalle-cliente`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * POST /api/Viajes
 * Crear un nuevo viaje
 */
const createViaje = async (payload: CreateViajeDto): Promise<ViajeDto> => {
	console.log("[ViajesService] Creating viaje with payload:", payload);

	// Validaciones cliente antes de enviar
	if (!payload || typeof payload !== "object") {
		console.error("[ViajesService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.eventoID || payload.eventoID <= 0) {
		console.error("[ViajesService] EventoID requerido");
		throw {
			status: 400,
			message: "El evento es requerido.",
			details: { field: "eventoID" },
		};
	}

	if (!payload.plantillaRutaID || payload.plantillaRutaID <= 0) {
		console.error("[ViajesService] PlantillaRutaID requerido");
		throw {
			status: 400,
			message: "La ruta es requerida.",
			details: { field: "plantillaRutaID" },
		};
	}

	if (!payload.unidadID || payload.unidadID <= 0) {
		console.error("[ViajesService] UnidadID requerido");
		throw { status: 400, message: "La unidad es requerida.", details: { field: "unidadID" } };
	}

	if (!payload.choferID || String(payload.choferID).trim() === "") {
		console.error("[ViajesService] ChoferID requerido");
		throw { status: 400, message: "El chofer es requerido.", details: { field: "choferID" } };
	}

	if (!payload.fechaSalida || Number.isNaN(Date.parse(payload.fechaSalida))) {
		console.error("[ViajesService] FechaSalida inválida");
		throw {
			status: 400,
			message: "La fecha de salida es requerida y debe ser válida.",
			details: { field: "fechaSalida" },
		};
	}

	// Comprobar caracteres prohibidos
	const validationErrors: Record<string, string[]> = {};
	const pushError = (key: string, msg: string) => {
		if (!validationErrors[key]) validationErrors[key] = [];
		validationErrors[key].push(msg);
	};

	if (hasForbiddenChars(payload.tipoViaje))
		pushError("tipoViaje", "El campo Tipo de Viaje contiene caracteres no permitidos.");
	if (hasForbiddenChars(payload.choferID)) pushError("choferID", "El campo Chofer contiene caracteres no permitidos.");

	if (Object.keys(validationErrors).length > 0) {
		console.warn("[ViajesService] Rechazando payload por caracteres prohibidos:", validationErrors);
		throw {
			status: 400,
			title: "One or more validation errors occurred.",
			statusText: "Bad Request",
			errors: validationErrors,
		};
	}

	console.log("[ViajesService] Final payload (stringified):", JSON.stringify(payload));

	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * PUT /api/Viajes/{id}
 * Actualizar un viaje
 */
const updateViaje = async (id: number, payload: UpdateViajeDto): Promise<ViajeDto> => {
	console.log("[ViajesService] Updating viaje with payload:", id, payload);

	// Validaciones cliente antes de enviar
	if (!payload || typeof payload !== "object") {
		console.error("[ViajesService] Payload inválido en update:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.unidadID || payload.unidadID <= 0) {
		console.error("[ViajesService] UnidadID requerido para update");
		throw {
			status: 400,
			message: "La unidad es requerida para actualizar.",
			details: { field: "unidadID" },
		};
	}

	if (!payload.choferID || String(payload.choferID).trim() === "") {
		console.error("[ViajesService] ChoferID requerido para update");
		throw {
			status: 400,
			message: "El chofer es requerido para actualizar.",
			details: { field: "choferID" },
		};
	}

	if (!payload.fechaSalida || Number.isNaN(Date.parse(payload.fechaSalida))) {
		console.error("[ViajesService] FechaSalida inválida en update");
		throw {
			status: 400,
			message: "La fecha de salida es requerida y debe ser válida.",
			details: { field: "fechaSalida" },
		};
	}

	// Comprobar caracteres prohibidos
	const validationErrors: Record<string, string[]> = {};
	const pushError = (key: string, msg: string) => {
		if (!validationErrors[key]) validationErrors[key] = [];
		validationErrors[key].push(msg);
	};

	if (hasForbiddenChars(payload.choferID)) pushError("choferID", "El campo Chofer contiene caracteres no permitidos.");

	if (Object.keys(validationErrors).length > 0) {
		console.warn("[ViajesService] Rechazando payload por caracteres prohibidos (update):", validationErrors);
		throw {
			status: 400,
			title: "One or more validation errors occurred.",
			statusText: "Bad Request",
			errors: validationErrors,
		};
	}

	console.log("[ViajesService] Enviando body a API:", JSON.stringify(payload));

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * DELETE /api/Viajes/{id}
 * Eliminar un viaje
 */
const deleteViaje = async (id: number): Promise<void> => {
	console.log("[ViajesService] Deleting viaje:", id);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	});

	await handleResponse(response);
};

/**
 * GET /api/Viajes/{id}/paradas
 * Obtener paradas de un viaje
 */
const getParadasViaje = async (id: number): Promise<ParadaDto[]> => {
	console.log("[ViajesService] Fetching paradas for viaje:", id);

	const response = await fetch(`${BASE_URL}/${id}/paradas`, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

/**
 * GET /api/Viajes/{id}/manifiesto
 * Obtener manifiesto de pasajeros de un viaje
 * @param id - ID del viaje
 * @param compact - Si es true, retorna versión compacta (opcional)
 * @param since - Filtrar cambios desde esta fecha (opcional)
 */
const getManifiesto = async (id: number, options?: { compact?: boolean; since?: string }): Promise<ManifiestoDto> => {
	console.log("[ViajesService] Fetching manifiesto for viaje:", id, options);

	const params = new URLSearchParams();
	if (options?.compact !== undefined) params.append("compact", String(options.compact));
	if (options?.since) params.append("since", options.since);

	const url = params.toString() ? `${BASE_URL}/${id}/manifiesto?${params}` : `${BASE_URL}/${id}/manifiesto`;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * POST /api/Viajes/{id}/staff
 * Asignar staff a un viaje
 */
const assignStaff = async (id: number, payload: CreateStaffAsignacionDto): Promise<AsignacionStaffDto> => {
	console.log("[ViajesService] Assigning staff to viaje:", id, payload);

	// Validaciones cliente
	if (!payload.staffID || String(payload.staffID).trim() === "") {
		throw { status: 400, message: "El ID del staff es requerido.", details: { field: "staffID" } };
	}

	if (!payload.rolEnViaje || String(payload.rolEnViaje).trim() === "") {
		throw { status: 400, message: "El rol es requerido.", details: { field: "rolEnViaje" } };
	}

	// Validar caracteres prohibidos
	const validationErrors: Record<string, string[]> = {};
	const pushError = (key: string, msg: string) => {
		if (!validationErrors[key]) validationErrors[key] = [];
		validationErrors[key].push(msg);
	};

	if (hasForbiddenChars(payload.staffID)) pushError("staffID", "El campo Staff ID contiene caracteres no permitidos.");
	if (hasForbiddenChars(payload.rolEnViaje)) pushError("rolEnViaje", "El campo Rol contiene caracteres no permitidos.");
	if (payload.observaciones && hasForbiddenChars(payload.observaciones))
		pushError("observaciones", "El campo Observaciones contiene caracteres no permitidos.");

	if (Object.keys(validationErrors).length > 0) {
		console.warn("[ViajesService] Rechazando staff assignment por caracteres prohibidos:", validationErrors);
		throw {
			status: 400,
			title: "One or more validation errors occurred.",
			statusText: "Bad Request",
			errors: validationErrors,
		};
	}

	const response = await fetch(`${BASE_URL}/${id}/staff`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Viajes/{id}/staff
 * Obtener staff asignado a un viaje
 */
const getStaff = async (id: number): Promise<AsignacionStaffDto[]> => {
	console.log("[ViajesService] Fetching staff for viaje:", id);

	const response = await fetch(`${BASE_URL}/${id}/staff`, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

/**
 * PUT /api/Viajes/{viajeId}/staff/{asignacionId}
 * Actualizar asignación de staff de un viaje
 */
const updateStaff = async (
	viajeId: number,
	asignacionId: number,
	payload: UpdateStaffAsignacionDto,
): Promise<AsignacionStaffDto> => {
	console.log("[ViajesService] Updating staff assignment:", viajeId, asignacionId, payload);

	// Validaciones cliente
	if (!payload.rolEnViaje || String(payload.rolEnViaje).trim() === "") {
		throw { status: 400, message: "El rol es requerido.", details: { field: "rolEnViaje" } };
	}

	// Validar caracteres prohibidos
	const validationErrors: Record<string, string[]> = {};
	const pushError = (key: string, msg: string) => {
		if (!validationErrors[key]) validationErrors[key] = [];
		validationErrors[key].push(msg);
	};

	if (hasForbiddenChars(payload.rolEnViaje)) pushError("rolEnViaje", "El campo Rol contiene caracteres no permitidos.");
	if (payload.observaciones && hasForbiddenChars(payload.observaciones))
		pushError("observaciones", "El campo Observaciones contiene caracteres no permitidos.");

	if (Object.keys(validationErrors).length > 0) {
		console.warn("[ViajesService] Rechazando staff update por caracteres prohibidos:", validationErrors);
		throw {
			status: 400,
			title: "One or more validation errors occurred.",
			statusText: "Bad Request",
			errors: validationErrors,
		};
	}

	const response = await fetch(`${BASE_URL}/${viajeId}/staff/${asignacionId}`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * DELETE /api/Viajes/{viajeId}/staff/{asignacionId}
 * Eliminar asignación de staff de un viaje
 */
const removeStaff = async (viajeId: number, asignacionId: number): Promise<void> => {
	console.log("[ViajesService] Removing staff assignment:", viajeId, asignacionId);

	const response = await fetch(`${BASE_URL}/${viajeId}/staff/${asignacionId}`, {
		method: "DELETE",
		headers: getHeaders(),
	});

	await handleResponse(response);
};

/**
 * GET /api/Viajes/mis-viajes
 * Obtener mis viajes (usuario actual)
 */
const getMisViajes = async (params?: MisViajesParams): Promise<ViajeDto[]> => {
	console.log("[ViajesService] Fetching mis viajes with params:", params);

	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);
	if (params?.soloProximos !== undefined) queryParams.append("soloProximos", params.soloProximos.toString());

	const url = queryParams.toString() ? `${BASE_URL}/mis-viajes?${queryParams}` : `${BASE_URL}/mis-viajes`;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

/**
 * GET /api/Viajes/{viajeId}/precios
 * Obtener todos los precios de paradas de un viaje
 */
const getPreciosParadas = async (viajeId: number): Promise<PrecioParadaDto[]> => {
	console.log("[ViajesService] Fetching precios paradas for viaje:", viajeId);

	const response = await fetch(`${BASE_URL}/${viajeId}/precios`, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

/**
 * GET /api/Viajes/{viajeId}/precios/parada/{paradaId}
 * Obtener precio de una parada específica
 */
const getPrecioParada = async (viajeId: number, paradaId: number): Promise<PrecioParadaDto> => {
	console.log("[ViajesService] Fetching precio for parada:", viajeId, paradaId);

	const response = await fetch(`${BASE_URL}/${viajeId}/precios/parada/${paradaId}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * POST /api/Viajes/{viajeId}/precios/configurar
 * Configurar precios para múltiples paradas de un viaje
 */
const configurarPrecios = async (viajeId: number, precios: ConfigurarPrecioParadaDto[]): Promise<string> => {
	console.log("[ViajesService] Configuring precios for viaje:", viajeId, precios);

	// Validaciones cliente
	if (!Array.isArray(precios)) {
		console.error("[ViajesService] Precios debe ser un array:", precios);
		throw { status: 400, message: "Los precios deben ser un array", details: { precios } };
	}

	if (precios.length === 0) {
		throw { status: 400, message: "Debe proporcionar al menos un precio.", details: { field: "precios" } };
	}

	// Validar cada precio
	for (let i = 0; i < precios.length; i++) {
		const precio = precios[i];

		if (!precio.paradaViajeID || precio.paradaViajeID <= 0) {
			throw {
				status: 400,
				message: `Precio ${i}: El ID de la parada es requerido.`,
				details: { index: i, field: "paradaViajeID" },
			};
		}

		if (typeof precio.precioBase !== "number" || precio.precioBase < 0) {
			throw {
				status: 400,
				message: `Precio ${i}: El precio base debe ser un número mayor o igual a 0.`,
				details: { index: i, field: "precioBase" },
			};
		}

		if (typeof precio.cargoServicio !== "number" || precio.cargoServicio < 0) {
			throw {
				status: 400,
				message: `Precio ${i}: El cargo de servicio debe ser un número mayor o igual a 0.`,
				details: { index: i, field: "cargoServicio" },
			};
		}
	}

	const response = await fetch(`${BASE_URL}/${viajeId}/precios/configurar`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(precios),
	});

	return await handleResponse(response);
};

/**
 * PUT /api/Viajes/{viajeId}/precios/{precioId}
 * Actualizar precio de una parada
 */
const updatePrecioParada = async (
	viajeId: number,
	precioId: number,
	payload: UpdatePrecioParadaDto,
): Promise<PrecioParadaDto> => {
	console.log("[ViajesService] Updating precio parada:", viajeId, precioId, payload);

	// Validaciones cliente
	if (!payload.paradaViajeID || payload.paradaViajeID <= 0) {
		throw { status: 400, message: "El ID de la parada es requerido.", details: { field: "paradaViajeID" } };
	}

	if (typeof payload.precioBase !== "number" || payload.precioBase < 0) {
		throw {
			status: 400,
			message: "El precio base debe ser un número mayor o igual a 0.",
			details: { field: "precioBase" },
		};
	}

	if (typeof payload.cargoServicio !== "number" || payload.cargoServicio < 0) {
		throw {
			status: 400,
			message: "El cargo de servicio debe ser un número mayor o igual a 0.",
			details: { field: "cargoServicio" },
		};
	}

	const response = await fetch(`${BASE_URL}/${viajeId}/precios/${precioId}`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * DELETE /api/Viajes/{viajeId}/precios/{precioId}
 * Eliminar precio de una parada
 */
const deletePrecioParada = async (viajeId: number, precioId: number): Promise<void> => {
	console.log("[ViajesService] Deleting precio parada:", viajeId, precioId);

	const response = await fetch(`${BASE_URL}/${viajeId}/precios/${precioId}`, {
		method: "DELETE",
		headers: getHeaders(),
	});

	await handleResponse(response);
};

/**
 * POST /api/Viajes/{viajeId}/precios/copiar-base
 * Copiar precios base de la plantilla de ruta al viaje
 */
const copiarPreciosBase = async (viajeId: number): Promise<void> => {
	console.log("[ViajesService] Copying base prices for viaje:", viajeId);

	const response = await fetch(`${BASE_URL}/${viajeId}/precios/copiar-base`, {
		method: "POST",
		headers: getHeaders(),
	});

	await handleResponse(response);
};

// ==================== CHECK-IN PROGRESIVO ====================

/**
 * GET /api/viajes/{viajeId}/checkin/progreso
 * Obtener progreso del check-in progresivo de un viaje
 */
const getProgresoCheckin = async (viajeId: number): Promise<ProgresoCheckinDto> => {
	console.log("[ViajesService] Fetching progreso checkin for viaje:", viajeId);

	const response = await fetch(`${BASE_URL}/${viajeId}/checkin/progreso`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * POST /api/viajes/{viajeId}/checkin/confirmar-llegada
 * Confirmar llegada del chofer a una parada
 */
const confirmarLlegada = async (viajeId: number, payload: ConfirmarLlegadaDto): Promise<EstadoParadaViajeDto> => {
	console.log("[ViajesService] Confirming llegada for viaje:", viajeId, payload);

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[ViajesService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.paradaViajeID || payload.paradaViajeID <= 0) {
		throw { status: 400, message: "El ID de la parada es requerido.", details: { field: "paradaViajeID" } };
	}

	if (typeof payload.latitud !== "number" || payload.latitud < -90 || payload.latitud > 90) {
		throw {
			status: 400,
			message: "La latitud debe ser un número entre -90 y 90.",
			details: { field: "latitud" },
		};
	}

	if (typeof payload.longitud !== "number" || payload.longitud < -180 || payload.longitud > 180) {
		throw {
			status: 400,
			message: "La longitud debe ser un número entre -180 y 180.",
			details: { field: "longitud" },
		};
	}

	const response = await fetch(`${BASE_URL}/${viajeId}/checkin/confirmar-llegada`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * POST /api/viajes/{viajeId}/checkin/iniciar-validacion
 * Iniciar proceso de validación de pasajeros en una parada
 */
const iniciarValidacion = async (viajeId: number, payload: IniciarValidacionDto): Promise<EstadoParadaViajeDto> => {
	console.log("[ViajesService] Initiating validacion for viaje:", viajeId, payload);

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[ViajesService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.paradaViajeID || payload.paradaViajeID <= 0) {
		throw { status: 400, message: "El ID de la parada es requerido.", details: { field: "paradaViajeID" } };
	}

	const response = await fetch(`${BASE_URL}/${viajeId}/checkin/iniciar-validacion`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * POST /api/viajes/{viajeId}/checkin/finalizar-validacion
 * Finalizar proceso de validación de pasajeros en una parada
 */
const finalizarValidacion = async (viajeId: number, payload: FinalizarValidacionDto): Promise<EstadoParadaViajeDto> => {
	console.log("[ViajesService] Finalizing validacion for viaje:", viajeId, payload);

	// Validaciones cliente
	if (!payload || typeof payload !== "object") {
		console.error("[ViajesService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!payload.paradaViajeID || payload.paradaViajeID <= 0) {
		throw { status: 400, message: "El ID de la parada es requerido.", details: { field: "paradaViajeID" } };
	}

	if (typeof payload.totalAbordados !== "number" || payload.totalAbordados < 0) {
		throw {
			status: 400,
			message: "El total de abordados debe ser un número mayor o igual a 0.",
			details: { field: "totalAbordados" },
		};
	}

	if (typeof payload.totalNoShow !== "number" || payload.totalNoShow < 0) {
		throw {
			status: 400,
			message: "El total de no-show debe ser un número mayor o igual a 0.",
			details: { field: "totalNoShow" },
		};
	}

	const response = await fetch(`${BASE_URL}/${viajeId}/checkin/finalizar-validacion`, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(payload),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Viajes/verificar-disponibilidad
 * Verificar disponibilidad de unidad, chofer o staff
 */
const verificarDisponibilidad = async (params: VerificarDisponibilidadParams): Promise<DisponibilidadDto> => {
	console.log("[ViajesService] Verificando disponibilidad:", params);

	const queryParams = new URLSearchParams();
	queryParams.append("fechaInicio", params.fechaInicio);
	queryParams.append("fechaFin", params.fechaFin);
	if (params.unidadId !== undefined) queryParams.append("unidadId", params.unidadId.toString());
	if (params.choferId) queryParams.append("choferId", params.choferId);
	if (params.staffId) queryParams.append("staffId", params.staffId);

	const response = await fetch(`${BASE_URL}/verificar-disponibilidad?${queryParams}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

const viajesService = {
	getAllViajes,
	getViajeById,
	getDetalleCliente,
	createViaje,
	updateViaje,
	deleteViaje,
	getParadasViaje,
	getManifiesto,
	assignStaff,
	getStaff,
	updateStaff,
	removeStaff,
	getPreciosParadas,
	getPrecioParada,
	configurarPrecios,
	updatePrecioParada,
	deletePrecioParada,
	copiarPreciosBase,
	getMisViajes,
	verificarDisponibilidad,
	// Check-in Progresivo
	getProgresoCheckin,
	confirmarLlegada,
	iniciarValidacion,
	finalizarValidacion,
};

export default viajesService;
