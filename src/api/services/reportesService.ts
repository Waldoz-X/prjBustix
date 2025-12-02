/**
 * Servicio de API para reportes y estadísticas
 * Base URL: https://waldoz-001-site1.stempurl.com/api/Reportes
 */

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Reportes";

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

export interface ReporteVentasParams {
	fechaDesde?: string;
	fechaHasta?: string;
	eventoId?: number;
}

export interface ReporteOcupacionParams {
	fechaDesde?: string;
	fechaHasta?: string;
	eventoId?: number;
}

export interface VentaPorDiaDto {
	fecha: string;
	totalBoletos: number;
	boletosVendidos: number;
	ingresoTotal: number;
}

export interface VentaPorEventoDto {
	eventoId: number;
	eventoNombre: string;
	totalBoletos: number;
	boletosVendidos: number;
	ingresoTotal: number;
}

export interface ReporteVentasDto {
	periodo: {
		desde: string;
		hasta: string;
	};
	totalBoletos: number;
	boletosVendidos: number;
	boletosCancelados: number;
	ingresoTotal: number;
	ingresoBase: number;
	descuentosAplicados: number;
	cargosServicio: number;
	iva: number;
	ventasPorEvento: VentaPorEventoDto[];
	ventasPorDia: VentaPorDiaDto[];
}

export interface OcupacionPorViajeDto {
	viajeID: number;
	codigoViaje: string;
	eventoNombre: string;
	rutaNombre: string;
	fechaSalida: string;
	cupoTotal: number;
	asientosVendidos: number;
	asientosDisponibles: number;
	unidadPlacas: string;
	porcentajeOcupacion: number;
}

export interface OcupacionPorEventoDto {
	eventoId: number;
	eventoNombre: string;
	totalViajes: number;
	totalAsientos: number;
	asientosVendidos: number;
	porcentajeOcupacion: number;
}

export interface ReporteOcupacionDto {
	periodo: {
		desde: string;
		hasta: string;
	};
	totalViajes: number;
	viajesCompletos: number;
	promedioOcupacion: number;
	totalAsientosDisponibles: number;
	totalAsientosVendidos: number;
	ocupacionPorViaje: OcupacionPorViajeDto[];
	ocupacionPorEvento: OcupacionPorEventoDto[];
}

export interface DashboardMetricasDto {
	boletosHoy: number;
	boletosMes: number;
	ingresosMes: number;
	viajesProximos: number;
	viajesHoy: number;
	usuariosActivos: number;
	usuariosNuevosMes: number;
	incidenciasAbiertas: number;
	eventosActivos: number;
}

export interface UltimoEventoDto {
	eventoID: number;
	nombre: string;
	fecha: string;
	ciudad: string;
	totalViajes: number;
}

export interface ProximoViajeDto {
	viajeID: number;
	codigoViaje: string;
	eventoNombre: string;
	rutaNombre: string;
	fechaSalida: string;
	asientosVendidos: number;
	cupoTotal: number;
	asientosDisponibles: number;
	porcentajeOcupacion: number;
}

export interface DashboardDto {
	metricas: DashboardMetricasDto;
	ultimosEventos: UltimoEventoDto[];
	proximosViajes: ProximoViajeDto[];
}

export interface ReporteRutasDto {
	success: boolean;
	desde: string;
	hasta: string;
	totalRutas: number;
	rutas: {
		rutaId: number;
		nombreRuta: string;
		ciudadOrigen: string;
		ciudadDestino: string;
		totalViajes: number;
		totalAsientos: number;
		asientosVendidos: number;
		ocupacionPromedio: number;
		ingresoTotal: number;
		totalBoletos: number;
		ingresoPromedioPorViaje: number;
	}[];
}

export interface ReporteUnidadesDto {
	success: boolean;
	desde: string;
	hasta: string;
	totalUnidades: number;
	unidades: {
		unidadId: number;
		placas: string;
		modelo: string;
		capacidad: number;
		totalViajes: number;
		ocupacionPromedio: number;
		ingresoTotal: number;
		ingresoPorViaje: number;
		totalIncidencias: number;
		incidenciasCriticas: number;
		eficiencia: {
			viajesPorDia: number;
			ingresoPorDia: number;
		};
	}[];
}

export interface ReporteCuponesDto {
	success: boolean;
	desde: string;
	hasta: string;
	message?: string;
	resumen: {
		totalCuponesActivos: number;
		totalUsos: number;
		descuentoTotalOtorgado: number;
		ingresosTotalesGenerados: number;
		roi: number;
		promedioDescuentoPorUso: number;
	};
	cupones: any[];
}

export interface ReportePuntualidadDto {
	success: boolean;
	desde: string;
	hasta: string;
	resumen: {
		totalViajes: number;
		viajesCompletados: number;
		viajesEnProceso: number;
		viajesProgramados: number;
		porcentajeCompletados: number;
	};
	desempeñoChoferes: any[];
}

export interface ReporteComparacionDto {
	success: boolean;
	periodo1: { desde: string; hasta: string };
	periodo2: { desde: string; hasta: string };
	comparacion: {
		ingresos: ComparacionMetrica;
		boletos: ComparacionMetrica;
		viajes: ComparacionMetrica;
		ticketPromedio: { periodo1: number; periodo2: number };
	};
}

interface ComparacionMetrica {
	periodo1: number;
	periodo2: number;
	diferencia: number;
	crecimientoPorcentaje: number;
	tendencia: string;
}

export interface ReporteFinancieroPagosDto {
	desde: string;
	hasta: string;
	totalPagos: number;
	montoTotal: number;
	porProveedor: {
		proveedor: string;
		total: number;
		count: number;
	}[];
	porMetodo: {
		metodo: string;
		total: number;
		count: number;
	}[];
	porEstatus: {
		estatus: number;
		total: number;
		count: number;
	}[];
}

export interface ReporteFinancieroIngresosDto {
	desde: string;
	hasta: string;
	ingresoTotal: number;
	ingresoBase: number;
	descuentos: number;
	cargos: number;
	agrupado: {
		fecha: string;
		ingreso: number;
		boletos: number;
	}[];
}

export interface ReporteFinancieroVentasDto {
	desde: string;
	hasta: string;
	totalBoletos: number;
	ingresoTotal: number;
	ingresoBase: number;
	descuentos: number;
	cargos: number;
	ticketPromedio: number;
	ventasPorRuta: {
		rutaId: number;
		ingresos: number;
		boletos: number;
	}[];
}

// ==================== FUNCIONES ====================

/**
 * GET /api/Reportes/ventas
 * Obtener reporte de ventas con filtros opcionales
 * @param params - Filtros opcionales (fechaDesde, fechaHasta, eventoId)
 */
const getReporteVentas = async (params?: ReporteVentasParams): Promise<ReporteVentasDto> => {
	console.log("[ReportesService] Fetching reporte ventas with params:", params);

	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);
	if (params?.eventoId !== undefined) queryParams.append("eventoId", String(params.eventoId));

	const url = queryParams.toString() ? `${BASE_URL}/ventas?${queryParams}` : `${BASE_URL}/ventas`;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Reportes/ocupacion
 * Obtener reporte de ocupación con filtros opcionales
 * @param params - Filtros opcionales (fechaDesde, fechaHasta, eventoId)
 */
const getReporteOcupacion = async (params?: ReporteOcupacionParams): Promise<ReporteOcupacionDto> => {
	console.log("[ReportesService] Fetching reporte ocupacion with params:", params);

	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);
	if (params?.eventoId !== undefined) queryParams.append("eventoId", String(params.eventoId));

	const url = queryParams.toString() ? `${BASE_URL}/ocupacion?${queryParams}` : `${BASE_URL}/ocupacion`;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * GET /api/Reportes/dashboard
 * Obtener datos del dashboard principal
 */
const getDashboard = async (): Promise<DashboardDto> => {
	console.log("[ReportesService] Fetching dashboard data");

	const response = await fetch(`${BASE_URL}/dashboard`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

const getReporteRutas = async (params?: { fechaDesde?: string; fechaHasta?: string }): Promise<ReporteRutasDto> => {
	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);
	const response = await fetch(`${BASE_URL}/rutas?${queryParams}`, { headers: getHeaders() });
	return await handleResponse(response);
};

const getReporteUnidades = async (params?: {
	fechaDesde?: string;
	fechaHasta?: string;
}): Promise<ReporteUnidadesDto> => {
	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);
	const response = await fetch(`${BASE_URL}/unidades?${queryParams}`, { headers: getHeaders() });
	return await handleResponse(response);
};

const getReporteCupones = async (params?: { fechaDesde?: string; fechaHasta?: string }): Promise<ReporteCuponesDto> => {
	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);
	const response = await fetch(`${BASE_URL}/cupones?${queryParams}`, { headers: getHeaders() });
	return await handleResponse(response);
};

const getReporteIncidenciasDetalle = async (params?: { fechaDesde?: string; fechaHasta?: string }): Promise<any> => {
	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);
	const response = await fetch(`${BASE_URL}/incidencias-detalle?${queryParams}`, { headers: getHeaders() });
	return await handleResponse(response);
};

const getReportePuntualidad = async (params?: {
	fechaDesde?: string;
	fechaHasta?: string;
}): Promise<ReportePuntualidadDto> => {
	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);
	const response = await fetch(`${BASE_URL}/puntualidad?${queryParams}`, { headers: getHeaders() });
	return await handleResponse(response);
};

const getReporteComparacion = async (params: {
	periodo1Desde?: string;
	periodo1Hasta?: string;
	periodo2Desde?: string;
	periodo2Hasta?: string;
}): Promise<ReporteComparacionDto> => {
	const queryParams = new URLSearchParams();
	if (params.periodo1Desde) queryParams.append("periodo1Desde", params.periodo1Desde);
	if (params.periodo1Hasta) queryParams.append("periodo1Hasta", params.periodo1Hasta);
	if (params.periodo2Desde) queryParams.append("periodo2Desde", params.periodo2Desde);
	if (params.periodo2Hasta) queryParams.append("periodo2Hasta", params.periodo2Hasta);
	const response = await fetch(`${BASE_URL}/comparacion?${queryParams}`, { headers: getHeaders() });
	return await handleResponse(response);
};

const getReporteFinancieroPagos = async (params?: {
	fechaDesde?: string;
	fechaHasta?: string;
	proveedor?: string;
	metodo?: string;
}): Promise<ReporteFinancieroPagosDto> => {
	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);
	if (params?.proveedor) queryParams.append("proveedor", params.proveedor);
	if (params?.metodo) queryParams.append("metodo", params.metodo);
	const response = await fetch(`${BASE_URL}/financieros/pagos?${queryParams}`, { headers: getHeaders() });
	return await handleResponse(response);
};

const getReporteFinancieroIngresos = async (params?: {
	fechaDesde?: string;
	fechaHasta?: string;
	agruparPor?: string;
}): Promise<ReporteFinancieroIngresosDto> => {
	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);
	if (params?.agruparPor) queryParams.append("agruparPor", params.agruparPor);
	const response = await fetch(`${BASE_URL}/financieros/ingresos?${queryParams}`, { headers: getHeaders() });
	return await handleResponse(response);
};

const getReporteFinancieroVentas = async (params?: {
	fechaDesde?: string;
	fechaHasta?: string;
}): Promise<ReporteFinancieroVentasDto> => {
	const queryParams = new URLSearchParams();
	if (params?.fechaDesde) queryParams.append("fechaDesde", params.fechaDesde);
	if (params?.fechaHasta) queryParams.append("fechaHasta", params.fechaHasta);
	const response = await fetch(`${BASE_URL}/financieros/ventas?${queryParams}`, { headers: getHeaders() });
	return await handleResponse(response);
};

const reportesService = {
	getReporteVentas,
	getReporteOcupacion,
	getDashboard,
	getReporteRutas,
	getReporteUnidades,
	getReporteCupones,
	getReporteIncidenciasDetalle,
	getReporteComparacion,
	getReportePuntualidad,
	getReporteFinancieroPagos,
	getReporteFinancieroIngresos,
	getReporteFinancieroVentas,
};

export default reportesService;
