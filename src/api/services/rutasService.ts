// rutasService.ts

export interface PlantillaRutaResponseDto {
	RutaID: number;
	CodigoRuta: string;
	NombreRuta: string;
	CiudadOrigen: string;
	CiudadDestino: string;
	PuntoPartidaLat: number;
	PuntoPartidaLong: number;
	PuntoPartidaNombre: string;
	PuntoLlegadaLat: number;
	PuntoLlegadaLong: number;
	PuntoLlegadaNombre: string;
	DistanciaKm: number;
	TiempoEstimadoMinutos: number;
	Activa: boolean;
	FechaCreacion: string;
	TotalParadas: number;
	TotalViajes: number;
}

export interface CrearPlantillaRutaDto {
	CodigoRuta: string;
	NombreRuta: string;
	CiudadOrigen: string;
	CiudadDestino: string;
	PuntoPartidaLat: number;
	PuntoPartidaLong: number;
	PuntoPartidaNombre: string;
	PuntoLlegadaLat: number;
	PuntoLlegadaLong: number;
	PuntoLlegadaNombre: string;
	DistanciaKm: number;
	TiempoEstimadoMinutos: number;
	Paradas?: ParadaDto[];
}

export interface ParadaDto {
	NombreParada: string;
	Latitud: number;
	Longitud: number;
	Direccion: string;
	OrdenParada: number;
	TiempoEsperaMinutos: number;
}

// Función de transformación: Convierte el objeto de camelCase (API) a PascalCase (Interfaz)
const mapToPascalCase = (data: any): PlantillaRutaResponseDto => ({
	RutaID: data.rutaID,
	CodigoRuta: data.codigoRuta,
	NombreRuta: data.nombreRuta,
	CiudadOrigen: data.ciudadOrigen,
	CiudadDestino: data.ciudadDestino,
	PuntoPartidaLat: data.puntoPartidaLat,
	PuntoPartidaLong: data.puntoPartidaLong,
	PuntoPartidaNombre: data.puntoPartidaNombre,
	PuntoLlegadaLat: data.puntoLlegadaLat,
	PuntoLlegadaLong: data.puntoLlegadaLong,
	PuntoLlegadaNombre: data.puntoLlegadaNombre,
	DistanciaKm: data.distanciaKm,
	TiempoEstimadoMinutos: data.tiempoEstimadoMinutos,
	Activa: data.activa,
	FechaCreacion: data.fechaCreacion,
	TotalParadas: data.totalParadas,
	TotalViajes: data.totalViajes,
});

const BASE_URL = "https://waldoz-001-site1.stempurl.com/api/Rutas";

const getToken = (): string | null => localStorage.getItem("token");

const getHeaders = () => ({
	"Content-Type": "application/json",
	Accept: "application/json, text/plain",
	Authorization: `Bearer ${getToken()}`,
});

const getAll = async (soloActivas?: boolean): Promise<PlantillaRutaResponseDto[]> => {
	const url = soloActivas !== undefined ? `${BASE_URL}?soloActivas=${soloActivas}` : BASE_URL;
	const response = await fetch(url, { method: "GET", headers: getHeaders() });
	if (!response.ok) throw new Error("Error al obtener rutas");
	const json = await response.json();
	return json.map(mapToPascalCase); // Aplicamos la transformación
};

const getById = async (id: number): Promise<PlantillaRutaResponseDto> => {
	const response = await fetch(`${BASE_URL}/${id}`, { method: "GET", headers: getHeaders() });
	if (!response.ok) throw new Error("Ruta no encontrada");
	const data = await response.json();
	return mapToPascalCase(data); // Aplicamos la transformación
};

const create = async (data: CrearPlantillaRutaDto): Promise<PlantillaRutaResponseDto> => {
	const response = await fetch(BASE_URL, {
		method: "POST",
		headers: getHeaders(),
		body: JSON.stringify(data),
	});
	if (!response.ok) throw new Error("Error al crear ruta");
	return await response.json();
};

const toggle = async (id: number): Promise<{ message: string; activa: boolean }> => {
	const response = await fetch(`${BASE_URL}/${id}/toggle`, {
		method: "PUT",
		headers: getHeaders(),
	});
	if (!response.ok) throw new Error("Error al cambiar estado de ruta");
	return await response.json();
};

const getParadas = async (id: number): Promise<ParadaDto[]> => {
	const response = await fetch(`${BASE_URL}/${id}/paradas`, { method: "GET", headers: getHeaders() });
	if (!response.ok) throw new Error("Error al obtener paradas");
	return await response.json();
};

const deleteRuta = async (id: number): Promise<{ message: string }> => {
	const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers: getHeaders() });
	if (!response.ok) throw new Error("Error al eliminar ruta");
	return await response.json();
};

export const rutasService = {
	getAll,
	getById,
	create,
	toggle,
	getParadas,
	delete: deleteRuta,
};
