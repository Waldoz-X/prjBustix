/**
 * Servicio de API para gestión de eventos
 * Base URL: https://waldoz-001-site1.stempurl.com//api/Eventos
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Eventos";

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

// Helper: convertir ticks (.NET 100-ns ticks) a "HH:mm:ss"
const ticksToTimeString = (ticks: number): string => {
	if (!Number.isFinite(ticks)) return "00:00:00";
	const totalSeconds = Math.floor(ticks / 10000000);
	const hours = Math.floor(totalSeconds / 3600) % 24;
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const handleResponse = async (response: Response) => {
	if (!response.ok) {
		let parsed: any;
		try {
			parsed = await response.json(); // Leer como JSON para obtener detalles del error
		} catch (_e) {
			// Si no es JSON, tratar de leer texto
			try {
				parsed = { title: await response.text() };
			} catch {
				parsed = null;
			}
		}
		console.error("API Error:", parsed || response.statusText);
		// Lanzar objeto estructurado para que la UI lo maneje (incluye status y detalles)
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

export interface HoraInicio {
	ticks: number;
	days?: number;
	hours?: number;
	milliseconds?: number;
	microseconds?: number;
	nanoseconds?: number;
	minutes?: number;
	seconds?: number;
	totalDays?: number;
	totalHours?: number;
	totalMilliseconds?: number;
	totalMicroseconds?: number;
	totalNanoseconds?: number;
	totalMinutes?: number;
	totalSeconds?: number;
}

export interface EventoDto {
	eventoID: number;
	nombre: string;
	descripcion: string;
	tipoEvento: string;
	fecha: string;
	horaInicio: HoraInicio;
	recinto: string;
	direccion: string;
	ciudad: string;
	estado: string;
	ubicacionLat: number;
	ubicacionLong: number;
	urlImagen: string;
	estatus: number;
	estatusNombre: string;
	fechaCreacion: string;
	creadoPor: string;
	totalViajes: number;
}

// Tipos para el payload que espera la API
export interface EventoPayloadDto {
	Nombre: string;
	Descripcion: string;
	TipoEvento: string;
	Fecha: string;
	Recinto: string;
	Direccion: string;
	Ciudad: string;
	Estado: string;
	UbicacionLat: number;
	UbicacionLong: number;
	UrlImagen: string;
}

export interface CreateEventoDto {
	dto: EventoPayloadDto;
	horaInicio: string; // Formato "HH:mm:ss"
}

export interface UpdateEventoDto extends CreateEventoDto {
	// Update puede tener campos adicionales si es necesario
}

export interface EventosFilterParams {
	fechaDesde?: string;
	fechaHasta?: string;
	ciudad?: string;
	estatus?: number;
	soloActivos?: boolean;
}

// ==================== FUNCIONES ====================

/**
 * GET /api/Eventos
 * Obtener todos los eventos con filtros opcionales
 */
const getAllEventos = async (filters?: EventosFilterParams): Promise<EventoDto[]> => {
	console.log("[EventosService] Fetching eventos with filters:", filters);

	const params = new URLSearchParams();
	if (filters?.fechaDesde) params.append("fechaDesde", filters.fechaDesde);
	if (filters?.fechaHasta) params.append("fechaHasta", filters.fechaHasta);
	if (filters?.ciudad) params.append("ciudad", filters.ciudad);
	if (filters?.estatus !== undefined) params.append("estatus", filters.estatus.toString());
	if (filters?.soloActivos !== undefined) params.append("soloActivos", filters.soloActivos.toString());

	const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	console.log("[EventosService] Eventos received:", data?.length || 0);

	return Array.isArray(data) ? data : [];
};

/**
 * GET /api/Eventos/{id}
 * Obtener un evento por ID
 */
const getEventoById = async (id: number): Promise<EventoDto> => {
	console.log("[EventosService] Fetching evento by ID:", id);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * POST /api/Eventos
 * Crear un nuevo evento
 */
const createEvento = async (payload: CreateEventoDto): Promise<EventoDto> => {
	console.log("[EventosService] Creating evento with payload:", payload);

	// Copia superficial del payload para normalizar sin mutar la referencia externa
	const anyPayload: any = { ...((payload as any) || {}) };

	// Aceptar payloads planos: si no existe payload.dto pero existen propiedades Nombre/Recinto etc. en la raíz,
	// convertirlos en { dto: { ... } }
	try {
		// Si payload no tiene dto pero sí tiene campos esperados, reempaquetar
		if (!anyPayload.dto && (anyPayload.Nombre || anyPayload.Recinto || anyPayload.Ciudad || anyPayload.Fecha)) {
			anyPayload.dto = {
				Nombre: anyPayload.Nombre,
				Descripcion: anyPayload.Descripcion,
				TipoEvento: anyPayload.TipoEvento,
				Fecha: anyPayload.Fecha,
				Recinto: anyPayload.Recinto,
				Direccion: anyPayload.Direccion,
				Ciudad: anyPayload.Ciudad,
				Estado: anyPayload.Estado,
				UbicacionLat: anyPayload.UbicacionLat,
				UbicacionLong: anyPayload.UbicacionLong,
				UrlImagen: anyPayload.UrlImagen,
			};
		}

		// Normalizar horaInicio: si viene como objeto { ticks } o número, convertir a string HH:mm:ss
		if (anyPayload?.horaInicio) {
			const h = anyPayload.horaInicio;
			if (typeof h === "object" && h !== null && typeof h.ticks === "number") {
				anyPayload.horaInicio = ticksToTimeString(h.ticks);
			} else if (typeof h === "number") {
				anyPayload.horaInicio = ticksToTimeString(h);
			} else if (typeof h === "string") {
				// si viene como HH:mm (5) convertir a HH:mm:ss
				if (/^\d{2}:\d{2}$/.test(h)) anyPayload.horaInicio = `${h}:00`;
			}
		}
	} catch (e) {
		console.warn("[EventosService] Error normalizando payload de create:", e);
	}

	// Validaciones cliente antes de enviar para dar feedback inmediato
	if (!anyPayload || typeof anyPayload !== "object") {
		console.error("[EventosService] Payload inválido:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}

	if (!anyPayload.dto) {
		console.error(
			"[EventosService] Falta la propiedad 'dto' en el payload -> intenté reempaquetar, result:",
			anyPayload,
		);
		throw {
			status: 400,
			message: "El payload debe contener la propiedad 'dto' con los datos del evento.",
			details: { payload: anyPayload },
		};
	}

	const dto = anyPayload.dto as Partial<EventoPayloadDto>;
	if (!dto.Nombre || String(dto.Nombre).trim() === "") {
		console.error("[EventosService] Nombre requerido en dto", dto);
		throw { status: 400, message: "El nombre del evento (dto.Nombre) es requerido.", details: { field: "Nombre" } };
	}
	if (!dto.Recinto || String(dto.Recinto).trim() === "") {
		console.error("[EventosService] Recinto requerido en dto", dto);
		throw { status: 400, message: "El recinto (dto.Recinto) es requerido.", details: { field: "Recinto" } };
	}
	if (!dto.Ciudad || String(dto.Ciudad).trim() === "") {
		console.error("[EventosService] Ciudad requerida en dto", dto);
		throw { status: 400, message: "La ciudad (dto.Ciudad) es requerida.", details: { field: "Ciudad" } };
	}
	if (!dto.Fecha || Number.isNaN(Date.parse(dto.Fecha))) {
		console.error("[EventosService] Fecha inválida en dto", dto);
		throw {
			status: 400,
			message: "La fecha (dto.Fecha) es requerida y debe ser una fecha ISO válida.",
			details: { field: "Fecha" },
		};
	}

	// horaInicio debe existir y ser string en formato HH:mm:ss en este punto (se normalizó arriba si vino como ticks)
	if (!anyPayload.horaInicio) {
		console.error("[EventosService] horaInicio requerida en payload", anyPayload);
		throw { status: 400, message: "La hora de inicio (horaInicio) es requerida.", details: { field: "horaInicio" } };
	}
	if (typeof anyPayload.horaInicio !== "string") {
		console.error(
			"[EventosService] horaInicio debe ser string en formato HH:mm:ss tras normalización",
			anyPayload.horaInicio,
		);
		throw {
			status: 400,
			message: "La hora de inicio (horaInicio) debe ser una cadena en formato HH:mm:ss.",
			details: { field: "horaInicio" },
		};
	}
	// validar formato simple HH:mm:ss
	if (!/^\d{2}:\d{2}:\d{2}$/.test(anyPayload.horaInicio)) {
		console.warn('[EventosService] horaInicio no cumple "HH:mm:ss" exacto, valor:', anyPayload.horaInicio);
	}

	// NEW: comprobar caracteres prohibidos y construir mapa de errores compatible con ModelState-style
	const validationErrors: Record<string, string[]> = {};
	const pushError = (key: string, msg: string) => {
		if (!validationErrors[key]) validationErrors[key] = [];
		validationErrors[key].push(msg);
	};

	if (hasForbiddenChars(dto.Nombre)) pushError("dto.Nombre", "El campo Nombre contiene caracteres no permitidos.");
	if (hasForbiddenChars(dto.Descripcion))
		pushError("dto.Descripcion", "El campo Descripcion contiene caracteres no permitidos.");
	if (hasForbiddenChars(dto.Recinto)) pushError("dto.Recinto", "El campo Recinto contiene caracteres no permitidos.");
	if (hasForbiddenChars(dto.Direccion))
		pushError("dto.Direccion", "El campo Direccion contiene caracteres no permitidos.");
	if (hasForbiddenChars(dto.Ciudad)) pushError("dto.Ciudad", "El campo Ciudad contiene caracteres no permitidos.");
	if (hasForbiddenChars(dto.Estado)) pushError("dto.Estado", "El campo Estado contiene caracteres no permitidos.");
	if (hasForbiddenChars(dto.UrlImagen))
		pushError("dto.UrlImagen", "El campo UrlImagen contiene caracteres no permitidos.");

	if (Object.keys(validationErrors).length > 0) {
		console.warn("[EventosService] Rechazando payload por caracteres prohibidos:", validationErrors);
		throw {
			status: 400,
			title: "One or more validation errors occurred.",
			statusText: "Bad Request",
			errors: validationErrors,
		};
	}

	console.log("[EventosService] Final payload (stringified):", JSON.stringify(anyPayload));

	// Construir body plano que el API espera (llaves en minúscula)
	const dtoFromAny = anyPayload.dto ?? anyPayload;
	const sendBody: any = {
		nombre: dtoFromAny.Nombre ?? dtoFromAny.nombre ?? "",
		descripcion: dtoFromAny.Descripcion ?? dtoFromAny.descripcion ?? "",
		tipoEvento: dtoFromAny.TipoEvento ?? dtoFromAny.tipoEvento ?? "",
		fecha: dtoFromAny.Fecha ?? dtoFromAny.fecha ?? "",
		horaInicio: anyPayload.horaInicio ?? dtoFromAny.horaInicio ?? "",
		recinto: dtoFromAny.Recinto ?? dtoFromAny.recinto ?? "",
		direccion: dtoFromAny.Direccion ?? dtoFromAny.direccion ?? "",
		ciudad: dtoFromAny.Ciudad ?? dtoFromAny.ciudad ?? "",
		estado: dtoFromAny.Estado ?? dtoFromAny.estado ?? "",
		ubicacionLat: dtoFromAny.UbicacionLat ?? dtoFromAny.ubicacionLat ?? 0,
		ubicacionLong: dtoFromAny.UbicacionLong ?? dtoFromAny.ubicacionLong ?? 0,
		urlImagen: dtoFromAny.UrlImagen ?? dtoFromAny.urlImagen ?? "",
	};

	console.log("[EventosService] Enviando body plano a API:", sendBody);

	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(sendBody),
	});

	return await handleResponse(response);
};

/**
 * PUT /api/Eventos/{id}
 * Actualizar un evento
 */
const updateEvento = async (id: number, payload: UpdateEventoDto): Promise<EventoDto> => {
	console.log("[EventosService] Updating evento with payload:", id, payload);

	// Copia superficial para normalizar
	const anyPayload: any = { ...((payload as any) || {}) };

	// Conversión defensiva igual que en create
	try {
		if (anyPayload?.horaInicio) {
			const h = anyPayload.horaInicio;
			if (typeof h === "object" && h !== null && typeof h.ticks === "number") {
				anyPayload.horaInicio = ticksToTimeString(h.ticks);
			} else if (typeof h === "number") {
				anyPayload.horaInicio = ticksToTimeString(h);
			} else if (typeof h === "string" && /^\d{2}:\d{2}$/.test(h)) {
				anyPayload.horaInicio = `${h}:00`;
			}
		}
	} catch (e) {
		console.warn("[EventosService] No se pudo normalizar horaInicio en update:", e);
	}

	// Validaciones cliente (similares a create) antes de enviar
	if (!anyPayload || typeof anyPayload !== "object") {
		console.error("[EventosService] Payload inválido en update:", payload);
		throw { status: 400, message: "Payload inválido", details: { payload } };
	}
	if (!anyPayload.dto) {
		console.error("[EventosService] Falta la propiedad 'dto' en el payload de update", anyPayload);
		throw {
			status: 400,
			message: "El payload debe contener la propiedad 'dto' con los datos del evento.",
			details: { payload: anyPayload },
		};
	}
	const dtoU = anyPayload.dto as Partial<EventoPayloadDto>;
	if (!dtoU.Nombre || String(dtoU.Nombre).trim() === "") {
		console.error("[EventosService] Nombre requerido en dto para update", dtoU);
		throw {
			status: 400,
			message: "El nombre del evento (dto.Nombre) es requerido para actualizar.",
			details: { field: "Nombre" },
		};
	}
	if (!dtoU.Recinto || String(dtoU.Recinto).trim() === "") {
		console.error("[EventosService] Recinto requerido en dto para update", dtoU);
		throw {
			status: 400,
			message: "El recinto (dto.Recinto) es requerido para actualizar.",
			details: { field: "Recinto" },
		};
	}
	if (!dtoU.Ciudad || String(dtoU.Ciudad).trim() === "") {
		console.error("[EventosService] Ciudad requerida en dto para update", dtoU);
		throw {
			status: 400,
			message: "La ciudad (dto.Ciudad) es requerida para actualizar.",
			details: { field: "Ciudad" },
		};
	}
	if (!dtoU.Fecha || Number.isNaN(Date.parse(dtoU.Fecha))) {
		console.error("[EventosService] Fecha inválida en dto para update", dtoU);
		throw {
			status: 400,
			message: "La fecha (dto.Fecha) es requerida y debe ser una fecha ISO válida.",
			details: { field: "Fecha" },
		};
	}
	if (!anyPayload.horaInicio) {
		console.error("[EventosService] horaInicio requerida en payload para update", anyPayload);
		throw {
			status: 400,
			message: "La hora de inicio (horaInicio) es requerida para actualizar.",
			details: { field: "horaInicio" },
		};
	}
	if (typeof anyPayload.horaInicio !== "string") {
		console.error(
			"[EventosService] horaInicio debe ser string en formato HH:mm:ss tras normalización en update",
			anyPayload.horaInicio,
		);
		throw {
			status: 400,
			message: "La hora de inicio (horaInicio) debe ser una cadena en formato HH:mm:ss.",
			details: { field: "horaInicio" },
		};
	}
	if (!/^\d{2}:\d{2}:\d{2}$/.test(anyPayload.horaInicio)) {
		console.warn('[EventosService] horaInicio no cumple "HH:mm:ss" exacto en update, valor:', anyPayload.horaInicio);
	}

	// NEW: comprobar caracteres prohibidos y construir mapa de errores compatible con ModelState-style
	const validationErrors: Record<string, string[]> = {};
	const pushError = (key: string, msg: string) => {
		if (!validationErrors[key]) validationErrors[key] = [];
		validationErrors[key].push(msg);
	};

	if (hasForbiddenChars(dtoU.Nombre)) pushError("dto.Nombre", "El campo Nombre contiene caracteres no permitidos.");
	if (hasForbiddenChars(dtoU.Descripcion))
		pushError("dto.Descripcion", "El campo Descripcion contiene caracteres no permitidos.");
	if (hasForbiddenChars(dtoU.Recinto)) pushError("dto.Recinto", "El campo Recinto contiene caracteres no permitidos.");
	if (hasForbiddenChars(dtoU.Direccion))
		pushError("dto.Direccion", "El campo Direccion contiene caracteres no permitidos.");
	if (hasForbiddenChars(dtoU.Ciudad)) pushError("dto.Ciudad", "El campo Ciudad contiene caracteres no permitidos.");
	if (hasForbiddenChars(dtoU.Estado)) pushError("dto.Estado", "El campo Estado contiene caracteres no permitidos.");
	if (hasForbiddenChars(dtoU.UrlImagen))
		pushError("dto.UrlImagen", "El campo UrlImagen contiene caracteres no permitidos.");

	if (Object.keys(validationErrors).length > 0) {
		console.warn("[EventosService] Rechazando payload por caracteres prohibidos (update):", validationErrors);
		throw {
			status: 400,
			title: "One or more validation errors occurred.",
			statusText: "Bad Request",
			errors: validationErrors,
		};
	}

	// Construir body plano que el API espera (llaves en minúscula) - para update
	const dtoFromAny = anyPayload.dto ?? anyPayload;
	const sendBody: any = {
		nombre: dtoFromAny.Nombre ?? dtoFromAny.nombre ?? "",
		descripcion: dtoFromAny.Descripcion ?? dtoFromAny.descripcion ?? "",
		tipoEvento: dtoFromAny.TipoEvento ?? dtoFromAny.tipoEvento ?? "",
		fecha: dtoFromAny.Fecha ?? dtoFromAny.fecha ?? "",
		horaInicio: anyPayload.horaInicio ?? dtoFromAny.horaInicio ?? "",
		recinto: dtoFromAny.Recinto ?? dtoFromAny.recinto ?? "",
		direccion: dtoFromAny.Direccion ?? dtoFromAny.direccion ?? "",
		ciudad: dtoFromAny.Ciudad ?? dtoFromAny.ciudad ?? "",
		estado: dtoFromAny.Estado ?? dtoFromAny.estado ?? "",
		ubicacionLat: dtoFromAny.UbicacionLat ?? dtoFromAny.ubicacionLat ?? 0,
		ubicacionLong: dtoFromAny.UbicacionLong ?? dtoFromAny.ubicacionLong ?? 0,
		urlImagen: dtoFromAny.UrlImagen ?? dtoFromAny.urlImagen ?? "",
	};

	console.log("[EventosService] Enviando body plano a API:", sendBody);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(sendBody),
	});

	return await handleResponse(response);
};

/**
 * DELETE /api/Eventos/{id}
 * Eliminar un evento
 */
const deleteEvento = async (id: number): Promise<void> => {
	console.log("[EventosService] Deleting evento:", id);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	});

	await handleResponse(response);
};

/**
 * GET /api/Eventos/{id}/viajes
 * Obtener viajes de un evento
 */
const getViajesEvento = async (id: number): Promise<any[]> => {
	console.log("[EventosService] Fetching viajes for evento:", id);

	const response = await fetch(`${BASE_URL}/${id}/viajes`, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	return Array.isArray(data) ? data : [];
};

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

const eventosService = {
	getAllEventos,
	getEventoById,
	createEvento,
	updateEvento,
	deleteEvento,
	getViajesEvento,
};

export default eventosService;
