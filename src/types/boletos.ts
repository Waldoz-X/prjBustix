// Dto para iniciar compra (según BoletosAPI.md)
export interface IniciarCompraDto {
	viajeID: number;
	paradaAbordajeID: number;
	cuponID: number | null;
	pasajeros: PasajeroDto[];
}

export interface PasajeroDto {
	nombrePasajero: string;
	emailPasajero?: string;
	telefonoPasajero?: string;
}

// Respuesta de iniciar compra (según BoletosAPI.md)
export interface IniciarCompraResponseDto {
	success: boolean;
	message: string;
	codigoPago: string;
	montoTotal: number;
	cantidadBoletos: number;
	boletos: string[];
}

export interface CalculoPrecioDto {
	viajeID: number;
	codigoViaje: string;
	ciudadOrigen: string;
	ciudadDestino: string;
	fechaSalida: string;
	precioBase: number;
	cargoServicio: number;
	descuento: number;
	descuentoPorcentaje: number;
	subtotal: number;
	iva: number;
	precioTotal: number;
	cuponAplicado?: string;
	ventasAbiertas: boolean;
	asientosDisponibles: number;
}

export interface BoletoResponseDto {
	boletoID: number;
	codigoBoleto: string;
	codigoQR: string;
	viajeID: number;
	codigoViaje: string;
	ciudadOrigen: string;
	ciudadDestino: string;
	fechaSalida: string;
	numeroAsiento: string;
	nombrePasajero: string;
	emailPasajero?: string;
	telefonoPasajero?: string;
	precioBase: number;
	descuento: number;
	cargoServicio: number;
	iva: number;
	precioTotal: number;
	estatus: number;
	estatusNombre: string;
	fechaCompra: string;
	fechaValidacion?: string | null;
	paradaAbordaje?: string;
	horaEstimadaAbordaje?: string | null;
}
