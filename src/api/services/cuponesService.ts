/**
 * Servicio de API para gestión de cupones
 * Endpoints: GET, POST, PUT, DELETE cupones y validación
 */

const BASE_URL = "http://localhost:5289/api/Cupones";

/**
 * Obtener el token de autenticación del localStorage
 */
const getToken = (): string | null => {
	return localStorage.getItem("token");
};

const getHeaders = () => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (response: Response) => {
	if (!response.ok) {
		const error = await response.text();
		throw new Error(error || "Error en la petición");
	}
	const text = await response.text();
	return text ? JSON.parse(text) : null;
};

export interface CuponDto {
	cuponID: number;
	codigo: string;
	descripcion: string;
	tipoDescuento: string;
	valorDescuento: number;
	usosMaximos: number;
	usosRealizados: number;
	fechaInicio: string;
	fechaExpiracion: string;
	esActivo: boolean;
	fechaCreacion: string;
	estaVigente: boolean;
}

export interface CreateCuponDto {
	codigo: string;
	descripcion: string;
	tipoDescuento: string;
	valorDescuento: number;
	usosMaximos: number;
	fechaInicio: string;
	fechaExpiracion: string;
	esActivo: boolean;
}

export interface UpdateCuponDto {
	descripcion: string;
	tipoDescuento: string;
	valorDescuento: number;
	usosMaximos: number;
	fechaInicio: string;
	fechaExpiracion: string;
	esActivo: boolean;
}

export interface ValidarCuponResponse {
	valido: boolean;
	message: string;
	cuponID?: number;
	codigo?: string;
	tipoDescuento?: string;
	valorDescuento?: number;
	fechaExpiracion?: string;
	usosMaximos?: number;
	usosRealizados?: number;
}

/**
 * Obtener todos los cupones con filtros opcionales
 */
const getAllCupones = async (activos?: boolean, search?: string): Promise<CuponDto[]> => {
	console.log(`[CuponesService] Fetching cupones - activos: ${activos}, search: ${search}`);

	const params = new URLSearchParams();
	if (activos !== undefined) params.append("activos", activos.toString());
	if (search) params.append("search", search);

	const url = params.toString() ? `${BASE_URL}?${params}` : BASE_URL;

	const response = await fetch(url, {
		method: "GET",
		headers: getHeaders(),
	});

	const data = await handleResponse(response);
	console.log(`[CuponesService] Cupones received:`, data?.length || 0);

	return Array.isArray(data) ? data : [];
};

/**
 * Obtener un cupón por ID
 */
const getCuponById = async (id: number): Promise<CuponDto> => {
	console.log(`[CuponesService] Fetching cupon by ID: ${id}`);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

/**
 * Crear un nuevo cupón
 */
const createCupon = async (data: CreateCuponDto): Promise<CuponDto> => {
	console.log(`[CuponesService] Creating cupon:`, data);

	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	return await handleResponse(response);
};

/**
 * Actualizar un cupón
 */
const updateCupon = async (id: number, data: UpdateCuponDto): Promise<CuponDto> => {
	console.log(`[CuponesService] Updating cupon ${id}:`, data);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "PUT",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	return await handleResponse(response);
};

/**
 * Eliminar un cupón
 */
const deleteCupon = async (id: number): Promise<void> => {
	console.log(`[CuponesService] Deleting cupon: ${id}`);

	const response = await fetch(`${BASE_URL}/${id}`, {
		method: "DELETE",
		headers: getHeaders(),
	});

	await handleResponse(response);
};

/**
 * Validar un cupón por código
 */
const validarCupon = async (codigo: string): Promise<ValidarCuponResponse> => {
	console.log(`[CuponesService] Validating cupon: ${codigo}`);

	const response = await fetch(`${BASE_URL}/validar?codigo=${encodeURIComponent(codigo)}`, {
		method: "GET",
		headers: getHeaders(),
	});

	return await handleResponse(response);
};

const cuponesService = {
	getAllCupones,
	getCuponById,
	createCupon,
	updateCupon,
	deleteCupon,
	validarCupon,
};

export default cuponesService;
