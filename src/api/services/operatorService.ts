/**
 * Servicio de API para gestión de Operadores
 * Base URL: http://localhost:5289/api/Operadores
 */

const BASE_URL = "http://localhost:5289/api/Operadores";

const getToken = (): string | null => {
	return localStorage.getItem("token");
};

const getHeaders = () => ({
	"Content-Type": "application/json",
	Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (response: Response) => {
	if (!response.ok) {
		const error = await response.json().catch(() => ({ title: "Error en la petición" }));
		console.error("API Error:", error);
		throw new Error(error.title || "Error desconocido");
	}
	const text = await response.text();
	return text ? JSON.parse(text) : null;
};

// ==================== TIPOS ====================

export interface OperatorDto {
	id: string; // o number, dependiendo de tu API
	nombre: string;
	apellido: string;
	email: string;
	licencia: string;
	telefono: string;
	// Añade aquí otros campos que devuelva tu API
}

export interface CreateOperatorDto {
	nombre: string;
	apellido: string;
	email: string;
	licencia: string;
	telefono: string;
	// Asegúrate de que estos campos coincidan con lo que espera tu API
}

// ==================== FUNCIONES ====================

/**
 * POST /api/Operadores
 * Crear un nuevo operador
 */
const createOperator = async (data: CreateOperatorDto): Promise<OperatorDto> => {
	console.log("[OperatorService] Creating operator with data:", data);

	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});

	return await handleResponse(response);
};

const operatorService = {
	create: createOperator,
	// Aquí podrías añadir `getAll`, `getById`, `update`, `delete` en el futuro
};

export default operatorService;
