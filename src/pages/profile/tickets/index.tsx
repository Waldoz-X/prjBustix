import { message } from "antd";
import { Calendar, ChevronDown, ChevronUp, Download, Ticket } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import boletosService from "@/api/services/boletosService";
import type { EventoDto } from "@/api/services/eventosService";
import eventosService from "@/api/services/eventosService";
import { apiGetExactAddress } from "@/api/services/geoapify.service";
import viajesService from "@/api/services/viajesService";
import type { BoletoResponseDto } from "@/types/boletos";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

interface EventoAgrupado {
	codigoViaje: string;
	eventoNombre: string;
	ciudadOrigen: string;
	ciudadDestino: string;
	fechaSalida: string;
	viajeID: number;
	boletos: BoletoResponseDto[];
}

export function MyTicketsPage() {
	const navigate = useNavigate();
	const [boletos, setBoletos] = useState<BoletoResponseDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [boletosPagados, setBoletosPagados] = useState<BoletoResponseDto[]>([]);
	const [qrCodes, setQrCodes] = useState<Record<number, string>>({});
	const [expandedViajes, setExpandedViajes] = useState<Set<string>>(new Set());
	const [paradasDirecciones, setParadasDirecciones] = useState<Record<string, string>>({}); // Dirección por paradaAbordaje

	useEffect(() => {
		const fetchBoletos = async () => {
			try {
				const response = await boletosService.getMisBoletos();
				console.log("📦 Boletos recibidos:", response);

				if (response && Array.isArray(response)) {
					setBoletos(response);
					// Filtrar solo boletos pagados
					const pagados = response.filter((b) => b.estatusNombre === "Pagado");

					// Obtener información de viajes para mapear eventoID
					const viajesUnicos = Array.from(new Set(pagados.map((b) => b.viajeID)));
					const viajesInfo: Map<number, { eventoID: number; eventoNombre: string }> = new Map();
					const eventosMap = new Map<number, EventoDto>();

					// Obtener detalles de cada viaje para conseguir eventoID
					for (const viajeID of viajesUnicos) {
						try {
							const detalleViaje = await viajesService.getDetalleCliente(viajeID);
							if (detalleViaje) {
								viajesInfo.set(viajeID, {
									eventoID: detalleViaje.eventoID,
									eventoNombre: detalleViaje.eventoNombre || "Evento sin nombre",
								});

								// Si no está en cache, obtener detalles del evento
								if (!eventosMap.has(detalleViaje.eventoID)) {
									try {
										const evento = await eventosService.getEventoById(detalleViaje.eventoID);
										eventosMap.set(detalleViaje.eventoID, evento);
									} catch (err) {
										console.warn("Error obteniendo evento", detalleViaje.eventoID, err);
									}
								}
							}
						} catch (err) {
							console.warn("Error obteniendo detalles del viaje", viajeID, err);
						}
					}

					// Enriquecer boletos con información del evento
					const boletosConEvento: BoletoResponseDto[] = pagados.map((boleto) => {
						const viajeInfo = viajesInfo.get(boleto.viajeID);
						const eventoNombre = viajeInfo?.eventoNombre || "Evento sin nombre";

						return {
							...boleto,
							eventoNombre: eventoNombre,
						};
					});

					setBoletosPagados(boletosConEvento);
					console.log(`✅ Total boletos: ${response.length}, Pagados: ${boletosConEvento.length}`); // Generar códigos QR para cada boleto pagado
					const qrCodesMap: Record<number, string> = {};
					for (const boleto of boletosConEvento) {
						try {
							qrCodesMap[boleto.boletoID] = await QRCode.toDataURL(boleto.codigoQR, {
								width: 200,
								margin: 1,
								color: {
									dark: "#000000",
									light: "#FFFFFF",
								},
							});
						} catch (err) {
							console.error("Error generando QR para boleto", boleto.boletoID, err);
						}
					}
					setQrCodes(qrCodesMap);

					// Expandir el primer evento por defecto
					if (boletosConEvento.length > 0) {
						setExpandedViajes(new Set([boletosConEvento[0].codigoViaje]));
					}
				} else {
					console.warn("⚠️ Respuesta vacía o inválida:", response);
					setBoletos([]);
					setBoletosPagados([]);
				}
			} catch (error: any) {
				console.error("❌ Error al cargar boletos:", error);
				message.error("No se pudieron cargar tus boletos: " + (error?.message || "Error de conexión"));
			} finally {
				setLoading(false);
			}
		};

		// Usamos `void` para indicar intencionalmente que la promesa no se espera aquí
		void fetchBoletos();
	}, []);

	// Cargar direcciones de paradas usando Geoapify
	useEffect(() => {
		if (boletosPagados.length === 0) return;

		console.log("📍 Cargando direcciones de paradas para", boletosPagados.length, "boletos");

		const loadParadasDirecciones = async () => {
			const direccionesMap: Record<string, string> = {};

			// Obtener paradas únicas (por viajeID y numero de parada)
			for (const boleto of boletosPagados) {
				try {
					// Obtener detalles del viaje para acceder a las paradas
					const detalleViaje = await viajesService.getDetalleCliente(boleto.viajeID);

					if (detalleViaje?.paradas) {
						// Buscar la parada que corresponde a este boleto
						const paradaInfo = detalleViaje.paradas.find(
							(p) => p.paradaViajeID.toString() === boleto.paradaAbordaje?.split("-")[0],
						);

						if (paradaInfo?.latitud && paradaInfo?.longitud) {
							const key = `${boleto.viajeID}-${paradaInfo.paradaViajeID}`;

							// Evitar llamadas duplicadas
							if (!direccionesMap[key]) {
								console.log(
									`🔄 Obteniendo dirección para parada ${paradaInfo.paradaViajeID}:`,
									paradaInfo.latitud,
									paradaInfo.longitud,
								);

								try {
									const resultado = await apiGetExactAddress(paradaInfo.latitud, paradaInfo.longitud);
									const dir =
										resultado?.address?.trim() && resultado.address !== ""
											? resultado.address
											: paradaInfo.nombreParada;
									direccionesMap[key] = dir;
									console.log(`✅ Dirección obtenida: ${dir}`);
								} catch (error) {
									console.error(`❌ Error obteniendo dirección:`, error);
									direccionesMap[key] = paradaInfo.nombreParada;
								}
							}
						}
					}
				} catch (error) {
					console.error("Error cargando detalles del viaje:", error);
				}
			}

			console.log("📍 Todas las direcciones cargadas:", direccionesMap);
			setParadasDirecciones(direccionesMap);
		};

		// Indicar explícitamente que ignoramos la promesa (se maneja internamente)
		void loadParadasDirecciones();
	}, [boletosPagados]);

	// Agrupar boletos por evento (codigoViaje)
	const agruparBoletosporEvento = (): EventoAgrupado[] => {
		const eventos: { [key: string]: EventoAgrupado } = {};

		boletosPagados.forEach((boleto) => {
			const key = boleto.codigoViaje;

			if (!eventos[key]) {
				eventos[key] = {
					codigoViaje: boleto.codigoViaje,
					eventoNombre: boleto.eventoNombre || "Evento sin nombre",
					ciudadOrigen: boleto.ciudadOrigen,
					ciudadDestino: boleto.ciudadDestino,
					fechaSalida: boleto.fechaSalida,
					viajeID: boleto.viajeID,
					boletos: [],
				};
			}

			eventos[key].boletos.push(boleto);
		});

		// Ordenar eventos por fecha (más próximos primero)
		return Object.values(eventos).sort((a, b) => new Date(a.fechaSalida).getTime() - new Date(b.fechaSalida).getTime());
	};

	const toggleViajeExpanded = (key: string) => {
		const newExpanded = new Set(expandedViajes);
		if (newExpanded.has(key)) {
			newExpanded.delete(key);
		} else {
			newExpanded.add(key);
		}
		setExpandedViajes(newExpanded);
	};

	const downloadPDF = async (boleto: BoletoResponseDto) => {
		try {
			// Importar jsPDF dinámicamente
			const { default: jsPDF } = await import("jspdf");

			const doc = new jsPDF();

			// Obtener la dirección de la parada
			const paradaDir =
				paradasDirecciones[`${boleto.viajeID}-${boleto.paradaAbordaje?.split("-")[0]}`] ||
				boleto.paradaAbordaje ||
				"N/A";

			// Título
			doc.setFontSize(20);
			doc.text("BusTix - Boleto de Viaje", 105, 20, { align: "center" });

			// Información del boleto
			doc.setFontSize(12);
			doc.text(`Código de Boleto: ${boleto.codigoBoleto}`, 20, 40);
			doc.text(`Pasajero: ${boleto.nombrePasajero}`, 20, 50);
			doc.text(`Origen: ${boleto.ciudadOrigen}`, 20, 60);
			doc.text(`Destino: ${boleto.ciudadDestino}`, 20, 70);
			doc.text(`Fecha de Salida: ${new Date(boleto.fechaSalida).toLocaleString("es-MX")}`, 20, 80);
			doc.text(`Asiento: ${boleto.numeroAsiento}`, 20, 90);
			doc.text(`Parada de Abordaje: ${paradaDir}`, 20, 100);
			doc.text(`Precio Total: $${boleto.precioTotal.toFixed(2)}`, 20, 110);
			doc.text(`Estado: ${boleto.estatusNombre}`, 20, 120);

			// Agregar código QR
			if (qrCodes[boleto.boletoID]) {
				doc.addImage(qrCodes[boleto.boletoID], "PNG", 70, 130, 60, 60);
				doc.text("Código QR", 105, 200, { align: "center" });
			}

			// Información de contacto
			doc.setFontSize(10);
			doc.text(`Email: ${boleto.emailPasajero || "N/A"}`, 20, 220);
			doc.text(`Teléfono: ${boleto.telefonoPasajero || "N/A"}`, 20, 230);

			// Pie de página
			doc.setFontSize(8);
			doc.text("Gracias por viajar con BusTix", 105, 280, { align: "center" });

			// Descargar
			doc.save(`Boleto-${boleto.codigoBoleto}.pdf`);
			message.success("Boleto descargado exitosamente");
		} catch (error) {
			console.error("Error al generar PDF:", error);
			message.error("No se pudo generar el PDF");
		}
	};

	const formatDateShort = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("es-MX", {
			weekday: "short",
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const formatTime = (dateString: string) => {
		return new Date(dateString).toLocaleTimeString("es-MX", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading) {
		return (
			<div className="space-y-6 p-6">
				<p className="text-center">Cargando boletos...</p>
			</div>
		);
	}

	const totalBoletos = boletos.length;
	const totalPagados = boletosPagados.length;
	const proximosViajes = boletosPagados.filter(
		(b) => new Date(b.fechaSalida) > new Date() && !b.fechaValidacion,
	).length;

	const viajes = agruparBoletosporEvento();

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-bold flex items-center gap-2">
					<Ticket className="h-8 w-8" />
					Mis Boletos
				</h1>
				<p className="text-muted-foreground mt-2">Historial de boletos comprados</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Boletos</CardTitle>
						<Ticket className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalBoletos}</div>
						<p className="text-xs text-muted-foreground">Comprados</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Próximos Viajes</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{proximosViajes}</div>
						<p className="text-xs text-muted-foreground">Pendientes</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Pagados</CardTitle>
						<Ticket className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{totalPagados}</div>
						<p className="text-xs text-muted-foreground">Confirmados</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Boletos Pagados</CardTitle>
					<p className="text-sm text-muted-foreground mt-1">
						{viajes.length} {viajes.length === 1 ? "evento" : "eventos"} | {boletosPagados.length}{" "}
						{boletosPagados.length === 1 ? "boleto" : "boletos"}
					</p>
				</CardHeader>
				<CardContent>
					{boletosPagados.length === 0 ? (
						<div className="text-center py-12">
							<Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">No tienes boletos pagados</h3>
							<p className="text-muted-foreground mb-4">
								{boletos.length > 0
									? `Tienes ${boletos.length} boleto(s) en otros estados. Revisa la consola para más detalles.`
									: "Cuando compres boletos aparecerán aquí"}
							</p>
							<Button onClick={() => navigate("/events")}>Comprar Boleto</Button>
						</div>
					) : (
						<div className="space-y-4">
							{viajes.map((evento) => {
								const eventoKey = evento.codigoViaje;
								const isExpanded = expandedViajes.has(eventoKey);
								const esProximo = new Date(evento.fechaSalida) > new Date();

								return (
									<div key={eventoKey} className="border rounded-lg overflow-hidden">
										{/* Header del Evento */}
										<button
											type="button"
											onClick={() => toggleViajeExpanded(eventoKey)}
											className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors flex items-center justify-between border-b"
										>
											<div className="flex items-center gap-4 flex-1">
												<div className="text-left">
													<p className="font-bold text-gray-900 text-lg">{evento.eventoNombre}</p>
													<p className="text-sm text-gray-600">
														{evento.ciudadOrigen} → {evento.ciudadDestino}
													</p>
													<p className="text-xs text-gray-600">
														{formatDateShort(evento.fechaSalida)} - {formatTime(evento.fechaSalida)}
													</p>
												</div>
												<div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full">
													<span className="text-sm font-semibold text-blue-600">{evento.boletos.length}</span>
													<Ticket className="h-4 w-4 text-blue-600" />
												</div>
												{esProximo && (
													<span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
														Próximo
													</span>
												)}
											</div>

											<div className="text-gray-600">
												{isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
											</div>
										</button>

										{/* Boletos del Evento */}
										{isExpanded && (
											<div className="p-4 bg-white space-y-4">
												<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
													{evento.boletos.map((boleto) => (
														<Card key={boleto.boletoID} className="overflow-hidden border-2">
															<CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white pb-3">
																<div className="space-y-2">
																	<CardTitle className="text-base">{boleto.codigoBoleto}</CardTitle>
																	<p className="text-sm opacity-90 font-medium">{boleto.nombrePasajero}</p>
																	<div className="flex items-center gap-2 text-xs opacity-80">
																		<Ticket className="h-3 w-3" />
																		Asiento: {boleto.numeroAsiento}
																	</div>
																</div>
															</CardHeader>
															<CardContent className="p-4 space-y-3">
																{/* QR Code */}
																<div className="flex justify-center py-2 bg-gray-50 rounded">
																	{qrCodes[boleto.boletoID] ? (
																		<img src={qrCodes[boleto.boletoID]} alt="QR Code" className="w-28 h-28" />
																	) : (
																		<div className="w-28 h-28 bg-gray-200 flex items-center justify-center">
																			<p className="text-xs text-gray-500 text-center">Generando QR...</p>
																		</div>
																	)}
																</div>

																{/* Información del Boleto */}
																<div className="space-y-2 text-sm border-t pt-3">
																	<div className="flex justify-between">
																		<span className="text-gray-600">Parada:</span>
																		<span className="font-medium text-gray-900">
																			{paradasDirecciones[
																				`${boleto.viajeID}-${boleto.paradaAbordaje?.split("-")[0]}`
																			] ||
																				boleto.paradaAbordaje ||
																				"N/A"}
																		</span>
																	</div>
																	<div className="flex justify-between">
																		<span className="text-gray-600">Salida:</span>
																		<span className="font-medium text-gray-900">{formatTime(boleto.fechaSalida)}</span>
																	</div>
																	<div className="flex justify-between">
																		<span className="text-gray-600">Precio:</span>
																		<span className="font-bold text-green-600">${boleto.precioTotal.toFixed(2)}</span>
																	</div>
																	<div className="flex justify-between">
																		<span className="text-gray-600">Estado:</span>
																		<span className="font-medium text-green-600">{boleto.estatusNombre}</span>
																	</div>
																</div>

																{/* Botón Descargar */}
																<Button
																	onClick={() => downloadPDF(boleto)}
																	className="w-full mt-2"
																	variant="outline"
																	size="sm"
																>
																	<Download className="h-4 w-4 mr-2" />
																	Descargar PDF
																</Button>
															</CardContent>
														</Card>
													))}
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// Export por defecto y named export (reduce avisos de export sin usar en algunos linters)
export default MyTicketsPage;
