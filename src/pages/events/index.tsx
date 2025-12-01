import { Button, Form, Input, InputNumber, Modal, message, Steps } from "antd";
import { useEffect, useState } from "react";
import boletosService from "@/api/services/boletosService";
import eventosService, { type EventoDto } from "@/api/services/eventosService";
import pagosService from "@/api/services/pagosService";
import viajesService, {
	type ParadaConPrecioDto,
	type ViajeDetalleClienteDto,
	type ViajeSimpleDto,
} from "@/api/services/viajesService";
import { LoadingScreen } from "@/components/loading-screen/LoadingScreen";
import { PurchaseTicket } from "@/components/purchase-ticket/PurchaseTicket";
import type { IniciarCompraDto, IniciarCompraResponseDto } from "@/types/boletos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { apiGetExactAddress } from "../../api/services/geoapify.service";

export default function EventsMainPage() {
	const [events, setEvents] = useState<EventoDto[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedEvent, setSelectedEvent] = useState<EventoDto | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [step, setStep] = useState(0);
	const [ticketCount, setTicketCount] = useState(1);
	const [names, setNames] = useState<string[]>([""]);
	const [emails, setEmails] = useState<string[]>([""]);
	const [cupon, setCupon] = useState<string>("");
	const [cardData, setCardData] = useState({ number: "", name: "", expiry: "", cvc: "" });
	const [loadingPrice, setLoadingPrice] = useState(false);
	const [loadingViajes, setLoadingViajes] = useState(false);
	const [loadingDetalle, setLoadingDetalle] = useState(false);
	const [precioTotal, setPrecioTotal] = useState<number | null>(null);
	const [viajes, setViajes] = useState<ViajeSimpleDto[]>([]);
	const [selectedViaje, setSelectedViaje] = useState<ViajeSimpleDto | null>(null);
	const [viajeDetalle, setViajeDetalle] = useState<ViajeDetalleClienteDto | null>(null);
	const [paradas, setParadas] = useState<ParadaConPrecioDto[]>([]);
	const [paradaSeleccionada, setParadaSeleccionada] = useState<ParadaConPrecioDto | null>(null);
	const [paradasDirecciones, setParadasDirecciones] = useState<Record<number, string>>({}); // Direcciones por paradaViajeID
	const [codigoPago, setCodigoPago] = useState<string | null>(null);
	const [phones, setPhones] = useState<string[]>([""]);
	const [showLoadingScreen, setShowLoadingScreen] = useState(false);
	const [showTicket, setShowTicket] = useState(false);
	// Validación de email
	const validateEmail = (email: string): boolean => {
		if (!email) return true; // Opcional
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	// Validación de teléfono (exactamente 10 dígitos)
	const validatePhone = (phone: string): boolean => {
		if (!phone) return true; // Opcional
		return /^\d{10}$/.test(phone);
	};

	// Validación de tarjeta
	const validateCard = (): boolean => {
		if (!cardData.number || cardData.number.length !== 16) return false;
		if (!cardData.name || cardData.name.trim().length < 3) return false;
		if (!cardData.expiry || !/^\d{2}\/\d{2}$/.test(cardData.expiry)) return false;
		if (!cardData.cvc || cardData.cvc.length < 3) return false;
		return true;
	};
	useEffect(() => {
		eventosService
			.getAllEventos({ soloActivos: true })
			.then((data) => setEvents(data))
			.catch(() => {
				message.error("No se pudieron cargar los eventos.");
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		if (paradaSeleccionada) {
			// Actualizar precio total basado en la parada seleccionada y el número de boletos
			setPrecioTotal(paradaSeleccionada.totalAPagar * ticketCount);
		}
	}, [paradaSeleccionada, ticketCount]);

	useEffect(() => {
		if (step === 2 && selectedViaje && paradaSeleccionada && cupon) {
			// Si hay cupón, recalcular el precio con el API
			const calculate = async () => {
				setLoadingPrice(true);
				try {
					let cuponID: number | undefined;
					if (cupon && !Number.isNaN(Number(cupon))) {
						cuponID = Number(cupon);
					}
					const precioData = await boletosService.calcularPrecio({
						viajeId: selectedViaje.viajeID,
						paradaAbordajeId: paradaSeleccionada.paradaViajeID,
						cuponId: cuponID,
					});
					setPrecioTotal(precioData.precioTotal * ticketCount);
				} catch (err: any) {
					message.error("No se pudo calcular el precio: " + (err?.message || ""));
					if (paradaSeleccionada) {
						setPrecioTotal(paradaSeleccionada.totalAPagar * ticketCount);
					}
				} finally {
					setLoadingPrice(false);
				}
			};
			calculate();
		}
	}, [step, selectedViaje, paradaSeleccionada, cupon, ticketCount]);

	// Cargar direcciones de paradas cuando cambian
	useEffect(() => {
		if (paradas.length === 0) return;

		console.log("📍 Iniciando carga de direcciones para", paradas.length, "paradas");

		const loadDirecciones = async () => {
			const direccionesMap: Record<number, string> = {};

			for (const parada of paradas) {
				try {
					console.log(`🔄 Obteniendo dirección para parada ${parada.paradaViajeID}:`, parada.latitud, parada.longitud);
					const resultado = await apiGetExactAddress(parada.latitud, parada.longitud);
					const dir = resultado?.address?.trim() && resultado.address !== "" ? resultado.address : parada.nombreParada;
					direccionesMap[parada.paradaViajeID] = dir;
					console.log(`✅ Dirección obtenida: ${dir}`);
				} catch (error) {
					console.error(`❌ Error obteniendo dirección para parada ${parada.paradaViajeID}:`, error);
					direccionesMap[parada.paradaViajeID] = parada.nombreParada;
				}
			}

			console.log("📍 Todas las direcciones cargadas:", direccionesMap);
			setParadasDirecciones(direccionesMap);
		};

		loadDirecciones();
	}, [paradas]);

	const handleCardClick = async (ev: EventoDto) => {
		setSelectedEvent(ev);
		setModalOpen(true);
		setStep(0);
		setTicketCount(1);
		setNames([""]);
		setEmails([""]);
		setPhones([""]);
		setCardData({ number: "", name: "", expiry: "", cvc: "" });
		setPrecioTotal(null);
		setViajes([]);
		setSelectedViaje(null);
		setViajeDetalle(null);
		setParadas([]);
		setParadaSeleccionada(null);
		setParadasDirecciones([]);
		setCupon("");
		setCodigoPago(null);

		// Cargar viajes del evento
		setLoadingViajes(true);
		try {
			const viajesResp = await viajesService.getAllViajes({ eventoId: ev.eventoID });
			if (viajesResp && viajesResp.length > 0) {
				setViajes(viajesResp);
				// Seleccionar el primer viaje por defecto
				await handleViajeSelect(viajesResp[0]);
			} else {
				message.warning("No hay viajes disponibles para este evento.");
			}
		} catch (error) {
			console.error("Error al cargar viajes:", error);
			message.error("No se pudieron cargar los viajes para este evento.");
		} finally {
			setLoadingViajes(false);
		}
	};

	const handleViajeSelect = async (viaje: ViajeSimpleDto) => {
		setSelectedViaje(viaje);
		setViajeDetalle(null);
		setParadas([]);
		setParadaSeleccionada(null);
		setPrecioTotal(null);
		setParadasDirecciones({});

		setLoadingDetalle(true);
		try {
			const detalle = await viajesService.getDetalleCliente(viaje.viajeID);
			setViajeDetalle(detalle);
			if (detalle.asientosDisponibles === 0) {
				message.error("Este viaje no tiene asientos disponibles. No es posible realizar la compra.");
			}
			if (detalle.paradas && detalle.paradas.length > 0) {
				// Seleccionar la primera parada por defecto
				setParadaSeleccionada(detalle.paradas[0]);
				setPrecioTotal(detalle.paradas[0].totalAPagar * ticketCount);
				// El useEffect se encargará de cargar las direcciones
				setParadas(detalle.paradas);
			}
		} catch (error) {
			console.error("Error al cargar detalle del viaje:", error);
			message.error("No se pudo cargar el detalle del viaje.");
		} finally {
			setLoadingDetalle(false);
		}
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setSelectedEvent(null);
		setStep(0);
		setTicketCount(1);
		setNames([""]);
		setEmails([""]);
		setPhones([""]);
		setCardData({ number: "", name: "", expiry: "", cvc: "" });
		setPrecioTotal(null);
		setViajes([]);
		setSelectedViaje(null);
		setViajeDetalle(null);
		setParadas([]);
		setParadaSeleccionada(null);
		setParadasDirecciones({});
		setCodigoPago(null);
		setCupon("");
	};

	const handleGoToPayment = async () => {
		if (!selectedViaje || !paradaSeleccionada) {
			message.error("Por favor, selecciona un viaje y una parada de abordaje.");
			return;
		}
		if (precioTotal === null) {
			message.error("Aguarde mientras se calcula el precio.");
			return;
		}
		try {
			// Construir el payload exactamente como lo espera el backend
			const cuponID: number | null =
				cupon && cupon.trim() !== "" && !Number.isNaN(Number(cupon)) ? Number(cupon) : null;

			const pasajeros = names.map((nombre, idx) => {
				const pasajero: any = {
					nombrePasajero: nombre,
				};

				// Solo agregar email si existe y no está vacío
				const email = emails[idx]?.trim();
				if (email) {
					pasajero.emailPasajero = email;
				}

				// Solo agregar teléfono si existe y no está vacío
				const phone = phones[idx]?.trim();
				if (phone) {
					pasajero.telefonoPasajero = phone;
				}

				return pasajero;
			});

			const iniciarCompraPayload: IniciarCompraDto = {
				viajeID: selectedViaje.viajeID,
				paradaAbordajeID: paradaSeleccionada.paradaViajeID,
				cuponID: cuponID,
				pasajeros: pasajeros,
			};

			console.log("📤 Enviando payload de iniciar compra:", JSON.stringify(iniciarCompraPayload, null, 2));

			const compraResp: IniciarCompraResponseDto = await boletosService.iniciarCompra(iniciarCompraPayload);

			console.log("📥 Respuesta de iniciar compra:", compraResp);

			if (!compraResp?.codigoPago) {
				message.error("No se pudo generar el código de pago.");
				return;
			}
			setCodigoPago(compraResp.codigoPago);
			setPrecioTotal(compraResp.montoTotal || 0);
			setStep(3);
		} catch (err: any) {
			console.error("❌ Error en iniciar compra:", err);

			// Mensaje más descriptivo según el tipo de error
			if (err.message.includes("Failed to fetch") || err.message.includes("ERR_FAILED")) {
				message.error("No se pudo conectar con el servidor. Verifica que el backend esté funcionando.");
			} else if (err.message.includes("400")) {
				message.error("Datos inválidos: " + (err?.message || ""));
			} else if (err.message.includes("401")) {
				message.error("No tienes autorización. Inicia sesión nuevamente.");
			} else if (err.message.includes("500")) {
				message.error("Error en el servidor. Contacta al administrador.");
			} else {
				message.error("No se pudo iniciar la compra: " + (err?.message || "Error desconocido"));
			}
		}
	};

	const handlePay = async () => {
		if (!validateCard()) {
			message.error("Por favor, completa correctamente todos los campos de la tarjeta.");
			return;
		}
		if (!codigoPago) {
			message.error("No hay un código de pago generado.");
			return;
		}
		if (precioTotal === null) {
			message.error("No se ha calculado el precio total.");
			return;
		}

		// Mostrar pantalla de carga
		setShowLoadingScreen(true);
		setModalOpen(false);

		try {
			// Generar un ID de transacción único
			const transaccionID = `trx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

			// Preparar datos de confirmación de pago
			const confirmacionData = {
				transaccionID: transaccionID,
				codigoPago: codigoPago,
				estado: "approved",
				proveedor: "MercadoPago",
				montoConfirmado: precioTotal,
			};

			console.log("💳 Confirmando pago:", confirmacionData);

			// Llamar al endpoint de confirmación de pago
			const pagoResp = await pagosService.confirmarPago(confirmacionData);

			// Esperar 5 segundos antes de mostrar el ticket
			await new Promise((resolve) => setTimeout(resolve, 5000));

			if (pagoResp?.success) {
				setShowLoadingScreen(false);
				setShowTicket(true);
			} else {
				setShowLoadingScreen(false);
				message.error(pagoResp?.message || "Error al procesar el pago.");
			}
		} catch (err: any) {
			console.error("❌ Error al confirmar pago:", err);
			setShowLoadingScreen(false);
			message.error("Error al confirmar el pago: " + (err?.message || "Error desconocido"));
		}
	};

	return (
		<div className="min-h-screen w-full flex flex-col items-center justify-start bg-white p-8">
			<h1 className="text-4xl font-bold mb-8 w-full text-center">Eventos disponibles</h1>
			<div className="w-full">
				{loading ? (
					<p className="text-lg">Cargando eventos...</p>
				) : events.length === 0 ? (
					<p className="text-lg">No hay eventos disponibles.</p>
				) : (
					<div className="grid gap-8 w-full max-w-6xl grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
						{events.map((ev) => {
							return (
								<Card
									key={ev.eventoID}
									className="shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer"
									onClick={() => handleCardClick(ev)}
								>
									<CardHeader>
										<CardTitle className="text-xl font-bold mb-1">{ev.nombre}</CardTitle>
										<CardDescription className="mb-2">{ev.fecha}</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="flex flex-col gap-2">
											{ev.urlImagen && (
												<img
													src={ev.urlImagen}
													alt={ev.nombre}
													className="h-48 w-full object-cover rounded mb-2 border"
													onError={(e) => {
														e.currentTarget.style.display = "none";
													}}
												/>
											)}
											<p className="text-base text-muted-foreground line-clamp-3 mb-2">{ev.descripcion}</p>
											<p className="text-sm text-gray-500">Recinto: {ev.recinto}</p>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>
			{/* Modal y pasos de compra */}
			<Modal
				open={modalOpen}
				onCancel={handleCloseModal}
				footer={null}
				title={selectedEvent?.nombre}
				centered
				width={600}
			>
				{selectedEvent && (
					<div className="flex flex-col items-center gap-4 w-full">
						<Steps
							current={step}
							items={[{ title: "Boletos" }, { title: "Nombres" }, { title: "Resumen" }, { title: "Pago" }]}
							className="mb-6 w-full"
						/>

						{/* Paso 0: Selección de viaje, parada y boletos */}
						{step === 0 && (
							<div className="w-full flex flex-col items-center gap-4">
								{selectedEvent.urlImagen && (
									<img
										src={selectedEvent.urlImagen}
										alt={selectedEvent.nombre}
										className="h-40 w-full object-cover rounded border"
										onError={(e) => {
											e.currentTarget.style.display = "none";
										}}
									/>
								)}
								<div className="w-full bg-gray-50 p-4 rounded-lg space-y-2">
									<p className="text-sm">
										<span className="font-semibold">Fecha:</span> {selectedEvent.fecha}
									</p>
									<p className="text-sm">
										<span className="font-semibold">Recinto:</span> {selectedEvent.recinto}
									</p>
									<p className="text-sm">
										<span className="font-semibold">Descripción:</span> {selectedEvent.descripcion}
									</p>
								</div>

								{/* Selección de viaje */}
								{loadingViajes ? (
									<div className="w-full text-center py-4">
										<p className="text-gray-500">Cargando viajes disponibles...</p>
									</div>
								) : viajes.length > 0 ? (
									<div className="flex flex-col gap-2 w-full">
										<span className="font-semibold text-sm">Selecciona el viaje</span>
										<select
											className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
											value={selectedViaje?.viajeID ?? ""}
											onChange={(e) => {
												const viajeId = Number(e.target.value);
												const viaje = viajes.find((v) => v.viajeID === viajeId);
												if (viaje) handleViajeSelect(viaje);
											}}
										>
											{viajes.map((v) => (
												<option key={v.viajeID} value={v.viajeID}>
													{v.tipoViaje} - Salida: {new Date(v.fechaSalida).toLocaleString()} - {v.rutaNombre}
												</option>
											))}
										</select>
										{selectedViaje && (
											<div className="w-full bg-blue-50 p-3 rounded-md text-sm space-y-1">
												<p>
													<strong>Origen:</strong> {selectedViaje.ciudadOrigen}
												</p>
												<p>
													<strong>Destino:</strong> {selectedViaje.ciudadDestino}
												</p>
												<p>
													<strong>Unidad:</strong> {selectedViaje.unidadPlacas}
												</p>
												<p>
													<strong>Chofer:</strong> {selectedViaje.choferNombre}
												</p>
												<p>
													<strong>Asientos disponibles:</strong> {selectedViaje.asientosDisponibles} de{" "}
													{selectedViaje.cupoTotal}
												</p>
											</div>
										)}
									</div>
								) : null}

								{/* Selección de parada */}
								{loadingDetalle ? (
									<div className="w-full text-center py-4">
										<p className="text-gray-500">Cargando paradas y precios...</p>
									</div>
								) : paradas.length > 0 ? (
									<div className="flex flex-col gap-2 w-full">
										<span className="font-semibold text-sm">Selecciona tu parada de abordaje</span>
										<select
											className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
											value={paradaSeleccionada?.paradaViajeID ?? ""}
											onChange={(e) => {
												const paradaId = Number(e.target.value);
												const parada = paradas.find((p) => p.paradaViajeID === paradaId);
												if (parada) {
													setParadaSeleccionada(parada);
													setPrecioTotal(parada.totalAPagar * ticketCount);
												}
											}}
										>
											{paradas.map((p) => {
												// Obtener la dirección o nombre de parada
												const displayText = paradasDirecciones[p.paradaViajeID] || p.nombreParada;
												return (
													<option key={p.paradaViajeID} value={p.paradaViajeID}>
														{displayText} - {p.horaEstimadaLlegada} - ${p.totalAPagar.toFixed(2)}
													</option>
												);
											})}
										</select>
										{paradaSeleccionada && viajeDetalle && (
											<div className="w-full bg-green-50 p-3 rounded-md text-sm space-y-1">
												<p>
													<strong>Dirección:</strong>{" "}
													{paradasDirecciones[paradaSeleccionada.paradaViajeID] || "Cargando..."}
												</p>
												<p>
													<strong>Hora de llegada:</strong> {paradaSeleccionada.horaEstimadaLlegada}
												</p>
												<div className="mt-2 pt-2 border-t border-green-200">
													<p className="text-xs text-gray-600">
														Precio base: ${paradaSeleccionada.precioBase.toFixed(2)}
													</p>
													<p className="text-xs text-gray-600">
														Cargo de servicio: ${paradaSeleccionada.cargoServicio.toFixed(2)}
													</p>
													<p className="text-xs text-gray-600">IVA: ${paradaSeleccionada.iva.toFixed(2)}</p>
													<p className="font-bold text-green-700 mt-1">
														Total por boleto: ${paradaSeleccionada.totalAPagar.toFixed(2)}
													</p>
												</div>
												{viajeDetalle.tieneServicioWifi && <p className="text-xs text-blue-600">✓ WiFi disponible</p>}
												{viajeDetalle.tieneAireAcondicionado && (
													<p className="text-xs text-blue-600">✓ Aire acondicionado</p>
												)}
												{viajeDetalle.tieneBaño && <p className="text-xs text-blue-600">✓ Baño a bordo</p>}
											</div>
										)}
									</div>
								) : null}

								<div className="flex flex-col gap-2 w-full">
									<span className="font-semibold text-sm">¿Cuántos boletos deseas comprar? (máx 5)</span>
									<InputNumber
										min={1}
										max={5}
										value={ticketCount}
										onChange={(v) => {
											const count = Number(v) || 1;
											setTicketCount(count);
											setNames(Array(count).fill(""));
											setEmails(Array(count).fill(""));
											setPhones(Array(count).fill(""));
											if (paradaSeleccionada) {
												setPrecioTotal(paradaSeleccionada.totalAPagar * count);
											}
										}}
										className="w-full"
										size="large"
									/>
									{paradaSeleccionada && (
										<p className="text-center text-lg font-bold text-green-600">
											Total estimado: ${(paradaSeleccionada.totalAPagar * ticketCount).toFixed(2)}
										</p>
									)}
								</div>

								<Button
									type="primary"
									className="mt-2 w-full"
									onClick={() => setStep(1)}
									size="large"
									disabled={Boolean(
										loadingViajes ||
											loadingDetalle ||
											!paradaSeleccionada ||
											(viajeDetalle && viajeDetalle.asientosDisponibles === 0),
									)}
								>
									{viajeDetalle && viajeDetalle.asientosDisponibles === 0 ? "Sin asientos disponibles" : "Continuar"}
								</Button>
							</div>
						)}

						{/* Paso 1: Ingreso de nombres y emails */}
						{step === 1 && (
							<div className="w-full flex flex-col gap-4">
								<p className="font-semibold text-center text-base">Ingresa la información de cada pasajero</p>
								<div className="w-full max-h-96 overflow-y-auto pr-2">
									<Form layout="vertical" className="w-full">
										{Array.from({ length: ticketCount }).map((_, i) => {
											const key = `pasajero-${i}`;
											return (
												<div key={key} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
													<h4 className="font-semibold mb-3 text-blue-600">Pasajero {i + 1}</h4>
													<Form.Item
														label="Nombre completo"
														required
														validateStatus={!names[i] ? "error" : "success"}
														help={!names[i] ? "Requerido" : undefined}
														className="mb-3"
													>
														<Input
															placeholder="Nombre completo"
															value={names[i] || ""}
															onChange={(e) => {
																const arr = [...names];
																arr[i] = e.target.value;
																setNames(arr);
															}}
															size="large"
														/>
													</Form.Item>
													<Form.Item
														label="Email (opcional)"
														className="mb-3"
														validateStatus={emails[i] && !validateEmail(emails[i]) ? "error" : "success"}
														help={emails[i] && !validateEmail(emails[i]) ? "Email inválido" : undefined}
													>
														<Input
															type="email"
															placeholder="correo@ejemplo.com"
															value={emails[i] || ""}
															onChange={(e) => {
																const arr = [...emails];
																arr[i] = e.target.value;
																setEmails(arr);
															}}
															size="large"
														/>
													</Form.Item>
													<Form.Item
														label="Teléfono (opcional)"
														className="mb-0"
														validateStatus={phones[i] && !validatePhone(phones[i]) ? "error" : "success"}
														help={
															phones[i] && !validatePhone(phones[i]) ? "Debe ser exactamente 10 dígitos" : undefined
														}
													>
														<Input
															placeholder="5512345678"
															value={phones[i] || ""}
															onChange={(e) => {
																const value = e.target.value.replace(/\D/g, "").slice(0, 10);
																const arr = [...phones];
																arr[i] = value;
																setPhones(arr);
															}}
															maxLength={10}
															size="large"
														/>
													</Form.Item>
												</div>
											);
										})}

										<div className="w-full p-4 border border-gray-200 rounded-lg bg-blue-50">
											<Form.Item label="¿Tienes un cupón de descuento?" className="mb-0">
												<Input
													placeholder="ID de cupón (opcional)"
													value={cupon}
													onChange={(e) => setCupon(e.target.value)}
													size="large"
												/>
											</Form.Item>
										</div>
									</Form>
								</div>

								<div className="flex w-full justify-between gap-3 mt-2">
									<Button onClick={() => setStep(0)} size="large" className="flex-1">
										Atrás
									</Button>
									<Button
										type="primary"
										onClick={() => {
											if (names.some((n) => !n)) {
												message.error("Todos los nombres de pasajeros son requeridos.");
												return;
											}
											// Validar emails
											for (let i = 0; i < emails.length; i++) {
												if (emails[i] && !validateEmail(emails[i])) {
													message.error(`El email del pasajero ${i + 1} no es válido.`);
													return;
												}
											}
											// Validar teléfonos
											for (let i = 0; i < phones.length; i++) {
												if (phones[i] && !validatePhone(phones[i])) {
													message.error(`El teléfono del pasajero ${i + 1} debe tener exactamente 10 dígitos.`);
													return;
												}
											}
											setStep(2);
										}}
										size="large"
										className="flex-1"
									>
										Continuar
									</Button>
								</div>
							</div>
						)}

						{/* Paso 2: Resumen de compra */}
						{step === 2 && (
							<div className="w-full flex flex-col gap-4">
								<p className="font-semibold text-center text-lg">Resumen de compra</p>

								<div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200 space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium text-gray-700">Evento:</span>
										<span className="font-semibold text-gray-900">{selectedEvent.nombre}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium text-gray-700">Fecha:</span>
										<span className="font-semibold text-gray-900">{selectedEvent.fecha}</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm font-medium text-gray-700">Cantidad de boletos:</span>
										<span className="font-semibold text-gray-900">{ticketCount}</span>
									</div>
								</div>

								<div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200">
									<p className="font-semibold mb-2 text-gray-700">Pasajeros:</p>
									<ul className="list-disc pl-5 space-y-1">
										{names.map((n, i) => (
											<li key={`${i}-${n}`} className="text-sm text-gray-800">
												{n}
											</li>
										))}
									</ul>
								</div>

								<div className="w-full bg-green-50 p-5 rounded-lg border-2 border-green-300">
									<div className="flex justify-between items-center">
										<span className="text-lg font-semibold text-gray-800">Precio total:</span>
										<span className="text-2xl font-bold text-green-600">
											{loadingPrice || precioTotal === null ? (
												<span className="text-base text-gray-400">Calculando...</span>
											) : (
												`$${precioTotal.toFixed(2)}`
											)}
										</span>
									</div>
								</div>

								<div className="flex w-full justify-between gap-3 mt-4">
									<Button onClick={() => setStep(1)} size="large" className="flex-1">
										Atrás
									</Button>
									<Button
										type="primary"
										onClick={handleGoToPayment}
										disabled={loadingPrice || precioTotal === null}
										size="large"
										className="flex-1"
									>
										Continuar al pago
									</Button>
								</div>
							</div>
						)}

						{/* Paso 3: Pago */}
						{step === 3 && (
							<div className="w-full flex flex-col gap-4">
								<p className="font-semibold text-center text-lg">Información de pago</p>

								<div className="w-full bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
									<p className="text-sm text-gray-700 mb-1">Total a pagar</p>
									<p className="text-3xl font-bold text-blue-600">
										{precioTotal !== null ? `$${precioTotal.toFixed(2)}` : "N/A"}
									</p>
								</div>

								<Form layout="vertical" className="w-full">
									<Form.Item
										label="Nombre en la tarjeta"
										required
										validateStatus={cardData.name && cardData.name.trim().length < 3 ? "error" : "success"}
										help={cardData.name && cardData.name.trim().length < 3 ? "Mínimo 3 caracteres" : undefined}
									>
										<Input
											placeholder="Nombre completo"
											value={cardData.name}
											onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
											size="large"
										/>
									</Form.Item>

									<Form.Item
										label="Número de tarjeta"
										required
										validateStatus={cardData.number && cardData.number.length !== 16 ? "error" : "success"}
										help={cardData.number && cardData.number.length !== 16 ? "Debe tener 16 dígitos" : undefined}
									>
										<Input
											placeholder="1234 5678 9012 3456"
											value={cardData.number.replace(/(\d{4})(?=\d)/g, "$1 ")}
											onChange={(e) =>
												setCardData({ ...cardData, number: e.target.value.replace(/\D/g, "").slice(0, 16) })
											}
											maxLength={19}
											size="large"
										/>
									</Form.Item>

									<div className="flex w-full gap-4">
										<Form.Item
											label="Expiración (MM/YY)"
											required
											className="w-1/2"
											validateStatus={cardData.expiry && !/^\d{2}\/\d{2}$/.test(cardData.expiry) ? "error" : "success"}
											help={cardData.expiry && !/^\d{2}\/\d{2}$/.test(cardData.expiry) ? "Formato: MM/YY" : undefined}
										>
											<Input
												placeholder="MM/YY"
												value={cardData.expiry}
												onChange={(e) => {
													let value = e.target.value.replace(/[^0-9]/g, "");
													if (value.length >= 2) {
														value = value.slice(0, 2) + "/" + value.slice(2, 4);
													}
													setCardData({ ...cardData, expiry: value });
												}}
												maxLength={5}
												size="large"
											/>
										</Form.Item>

										<Form.Item
											label="CVC"
											required
											className="w-1/2"
											validateStatus={cardData.cvc && cardData.cvc.length < 3 ? "error" : "success"}
											help={cardData.cvc && cardData.cvc.length < 3 ? "Mínimo 3 dígitos" : undefined}
										>
											<Input
												maxLength={4}
												placeholder="123"
												value={cardData.cvc}
												onChange={(e) =>
													setCardData({
														...cardData,
														cvc: e.target.value.replace(/[^0-9]/g, ""),
													})
												}
												size="large"
											/>
										</Form.Item>
									</div>
								</Form>

								<div className="flex w-full justify-between gap-3 mt-2">
									<Button onClick={() => setStep(2)} size="large" className="flex-1">
										Atrás
									</Button>
									<Button type="primary" onClick={handlePay} size="large" className="flex-1" disabled={!validateCard()}>
										Pagar ahora
									</Button>
								</div>
							</div>
						)}
					</div>
				)}
			</Modal>

			{/* Pantalla de carga */}
			{showLoadingScreen && <LoadingScreen message="Procesando tu pago..." />}

			{/* Ticket de compra */}
			{showTicket && selectedEvent && selectedViaje && paradaSeleccionada && codigoPago && (
				<PurchaseTicket
					codigoPago={codigoPago}
					montoTotal={precioTotal || 0}
					viajeInfo={{
						fecha: new Date(selectedViaje.fechaSalida).toLocaleDateString("es-ES"),
						hora: new Date(selectedViaje.fechaSalida).toLocaleTimeString("es-ES", {
							hour: "2-digit",
							minute: "2-digit",
						}),
						origen: selectedViaje.ciudadOrigen,
						destino: selectedViaje.ciudadDestino,
						numeroViaje: selectedViaje.viajeID.toString(),
					}}
					paradaInfo={{
						nombreParada: paradasDirecciones[paradaSeleccionada.paradaViajeID] || paradaSeleccionada.nombreParada,
						direccion: paradasDirecciones[paradaSeleccionada.paradaViajeID] || "Ubicación no disponible",
					}}
					pasajeros={names.map((nombre, idx) => ({
						nombrePasajero: nombre,
						emailPasajero: emails[idx] || undefined,
						telefonoPasajero: phones[idx] || undefined,
					}))}
					ticketCount={ticketCount}
					onClose={() => {
						setShowTicket(false);
						handleCloseModal();
					}}
				/>
			)}
		</div>
	);
}
