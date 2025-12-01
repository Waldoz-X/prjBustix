import { Button, QRCode } from "antd";
import { CheckCircle } from "lucide-react";

interface PasajeroInfo {
	nombrePasajero: string;
	emailPasajero?: string;
	telefonoPasajero?: string;
}

interface PurchaseTicketProps {
	codigoPago: string;
	montoTotal: number;
	viajeInfo: {
		fecha: string;
		hora: string;
		origen: string;
		destino: string;
		numeroViaje?: string;
	};
	paradaInfo: {
		nombreParada: string;
		direccion: string;
	};
	pasajeros: PasajeroInfo[];
	ticketCount: number;
	onClose?: () => void;
}

export const PurchaseTicket = ({
	codigoPago,
	montoTotal,
	viajeInfo,
	paradaInfo,
	pasajeros,
	ticketCount,
	onClose,
}: PurchaseTicketProps) => {
	const generarQR = () => {
		return codigoPago;
	};

	return (
		<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[10000] p-4">
			<div
				className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in duration-300"
				id="ticket-content"
			>
				<div className="p-8 space-y-6">
					{/* Encabezado - Éxito */}
					<div className="text-center border-b border-gray-200 pb-6">
						<div className="flex items-center justify-center gap-3 mb-3">
							<CheckCircle className="w-9 h-9 text-green-500" />
							<h1 className="text-3xl font-bold text-gray-900">¡Compra Exitosa!</h1>
						</div>
						<p className="text-gray-600">Tus boletos han sido confirmados</p>
					</div>

					{/* QR y Código de Pago */}
					<div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
						<div className="flex justify-center">
							<QRCode value={generarQR()} size={150} />
						</div>
						<div className="flex-1 text-center sm:text-left">
							<p className="text-xs uppercase text-gray-600 tracking-wider font-semibold mb-2">Código de Pago</p>
							<p className="text-2xl font-bold text-blue-600 font-mono mb-2">{codigoPago}</p>
							<p className="text-xs text-gray-500">Guarda este código para tus registros</p>
						</div>
					</div>

					{/* Información del Viaje */}
					<div className="space-y-3">
						<h2 className="text-sm uppercase font-bold text-gray-900 border-b border-gray-200 pb-2">
							Información del Viaje
						</h2>
						<div className="grid grid-cols-2 gap-3">
							<div className="bg-gray-50 p-3 rounded-lg">
								<p className="text-xs uppercase text-gray-600 font-semibold mb-1">Fecha</p>
								<p className="font-semibold text-gray-900">{viajeInfo.fecha}</p>
							</div>
							<div className="bg-gray-50 p-3 rounded-lg">
								<p className="text-xs uppercase text-gray-600 font-semibold mb-1">Hora</p>
								<p className="font-semibold text-gray-900">{viajeInfo.hora}</p>
							</div>
							<div className="bg-gray-50 p-3 rounded-lg">
								<p className="text-xs uppercase text-gray-600 font-semibold mb-1">Origen</p>
								<p className="font-semibold text-gray-900">{viajeInfo.origen}</p>
							</div>
							<div className="bg-gray-50 p-3 rounded-lg">
								<p className="text-xs uppercase text-gray-600 font-semibold mb-1">Destino</p>
								<p className="font-semibold text-gray-900">{viajeInfo.destino}</p>
							</div>
						</div>
					</div>

					{/* Punto de Abordaje */}
					<div className="space-y-2 border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
						<h2 className="text-sm uppercase font-bold text-gray-900">Punto de Abordaje</h2>
						<p className="font-semibold text-blue-900">{paradaInfo.nombreParada}</p>
						<p className="text-sm text-gray-700">{paradaInfo.direccion}</p>
					</div>

					{/* Pasajeros */}
					<div className="space-y-3">
						<h2 className="text-sm uppercase font-bold text-gray-900 border-b border-gray-200 pb-2">
							Pasajeros ({ticketCount})
						</h2>
						<div className="space-y-2">
							{pasajeros.map((pasajero, index) => (
								<div
									key={`pasajero-${index}-${pasajero.nombrePasajero}`}
									className="flex gap-3 p-3 bg-gray-50 rounded border-l-3 border-blue-500"
								>
									<div className="font-bold text-blue-600 min-w-fit">#{index + 1}</div>
									<div className="flex-1">
										<p className="font-semibold text-gray-900">{pasajero.nombrePasajero}</p>
										{pasajero.emailPasajero && <p className="text-xs text-gray-600">{pasajero.emailPasajero}</p>}
										{pasajero.telefonoPasajero && <p className="text-xs text-gray-600">{pasajero.telefonoPasajero}</p>}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Resumen de Pago */}
					<div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg space-y-3">
						<div className="flex justify-between items-center">
							<span className="font-medium">Cantidad de Boletos</span>
							<span className="font-semibold">{ticketCount}</span>
						</div>
						<div className="border-t border-blue-400"></div>
						<div className="flex justify-between items-center text-lg">
							<span className="font-bold">Monto Total</span>
							<span className="font-bold">${montoTotal.toFixed(2)}</span>
						</div>
					</div>

					{/* Nota Importante */}
					<div className="bg-amber-50 border border-amber-300 rounded p-4">
						<p className="text-sm text-amber-900">
							<strong>Importante:</strong> Por favor, presenta tu código de pago en la taquilla 30 minutos antes de la
							salida. Se requiere identificación válida.
						</p>
					</div>

					{/* Botones de Acción */}
					{onClose && (
						<Button type="primary" size="large" onClick={onClose} className="w-full print:hidden">
							Cerrar
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};
