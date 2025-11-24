import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "antd";
import { AlertCircle, Bus, Calendar, Clock, Info, Loader2, MapPin, Navigation, User, Wifi, Wind } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import eventosService from "@/api/services/eventosService";
import rutasService from "@/api/services/rutasService";
import unidadService from "@/api/services/unidadService";
import userService from "@/api/services/userService";
import viajesService, { type CreateViajeDto } from "@/api/services/viajesService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Switch } from "@/ui/switch";
import { handleApiError } from "@/utils/error-handler";

interface CreateTripModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateTripModal({ open, onOpenChange }: CreateTripModalProps) {
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState<Partial<CreateViajeDto>>({
		tipoViaje: "Ida",
		ventasAbiertas: true,
		cargoServicio: 0,
	});

	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const handleBlur = (field: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	const { data: eventos = [] } = useQuery({
		queryKey: ["eventos", { soloActivos: true }],
		queryFn: () => eventosService.getAllEventos({ soloActivos: true }),
	});

	const { data: rutas = [] } = useQuery({
		queryKey: ["rutas", { soloActivas: true }],
		queryFn: () => rutasService.getAll(true),
	});

	const { data: unidades = [] } = useQuery({
		queryKey: ["unidades", { activos: true }],
		queryFn: () => unidadService.getAll({ activos: true }),
	});

	const { data: users = [] } = useQuery({
		queryKey: ["users"],
		queryFn: userService.getAllUsers,
	});

	const choferes = users.filter((u) =>
		u.roles?.some(
			(r) =>
				r.startsWith("Operator_") || r.toLowerCase() === "operator" || r.toLowerCase() === "chofer" || r === "Staff",
		),
	);

	// Computed selections
	const selectedEvent = eventos.find((e) => e.eventoID === formData.eventoID);
	const selectedRoute = rutas.find((r) => r.rutaID === formData.plantillaRutaID);
	const selectedUnit = unidades.find((u) => u.id === formData.unidadID);
	const selectedDriver = choferes.find((c) => c.id === formData.choferID);

	const verifyMutation = useMutation({
		mutationFn: async (data: CreateViajeDto) => {
			const disponibilidad = await viajesService.verificarDisponibilidad({
				fechaInicio: data.fechaSalida,
				fechaFin: data.fechaLlegadaEstimada,
				unidadId: data.unidadID,
				choferId: data.choferID,
			});
			if (!disponibilidad.estaDisponible && disponibilidad.conflictos.length > 0) {
				return { hasConflicts: true, conflicts: disponibilidad.conflictos };
			}
			return { hasConflicts: false, conflicts: [] };
		},
		onSuccess: (result) => {
			if (result.hasConflicts) {
				Modal.confirm({
					title: (
						<div className="flex items-center gap-2">
							<AlertCircle className="h-5 w-5 text-amber-500" />
							<span>Conflictos de Disponibilidad Detectados</span>
						</div>
					),
					content: (
						<div className="space-y-2 mt-4">
							<p>Se encontraron los siguientes conflictos:</p>
							<ul className="list-disc list-inside space-y-1 text-sm">
								{result.conflicts.map((conflicto) => (
									<li key={conflicto.viajeID}>
										<span className="font-medium">{conflicto.codigoViaje}</span> - {conflicto.eventoNombre}
										<br />
										<span className="text-xs text-gray-500 ml-4">
											{new Date(conflicto.fechaSalida).toLocaleString()} -{" "}
											{new Date(conflicto.fechaLlegadaEstimada).toLocaleString()}
										</span>
									</li>
								))}
							</ul>
							<p className="mt-4">¿Deseas crear el viaje de todas formas?</p>
						</div>
					),
					onOk: () => {
						createMutation.mutate(formData as CreateViajeDto);
					},
					okText: "Crear de todas formas",
					cancelText: "Cancelar",
					okButtonProps: { danger: true },
				});
			} else {
				createMutation.mutate(formData as CreateViajeDto);
			}
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al verificar disponibilidad", { description: safe.userMessage });
		},
	});

	const createMutation = useMutation({
		mutationFn: viajesService.createViaje,
		onSuccess: () => {
			toast.success("Viaje creado exitosamente");
			queryClient.invalidateQueries({ queryKey: ["viajes"] });
			onOpenChange(false);
			resetForm();
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al crear viaje", { description: safe.userMessage });
		},
	});

	const isFieldInvalid = (field: keyof CreateViajeDto) => {
		if (!touched[field]) return false;
		const value = formData[field];
		return value === undefined || value === null || value === "";
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Marcar todos como tocados
		setTouched({
			eventoID: true,
			plantillaRutaID: true,
			unidadID: true,
			choferID: true,
			fechaSalida: true,
			fechaLlegadaEstimada: true,
			cupoTotal: true,
			precioBase: true,
			tipoViaje: true,
		});

		if (
			!formData.eventoID ||
			!formData.plantillaRutaID ||
			!formData.unidadID ||
			!formData.choferID ||
			!formData.fechaSalida ||
			!formData.fechaLlegadaEstimada ||
			!formData.cupoTotal ||
			formData.precioBase === undefined
		) {
			toast.error("Por favor completa todos los campos requeridos");
			return;
		}
		verifyMutation.mutate(formData as CreateViajeDto);
	};

	const resetForm = () => {
		setFormData({
			tipoViaje: "Ida",
			ventasAbiertas: true,
			cargoServicio: 0,
		});
		setTouched({});
	};

	const handleCancel = () => {
		resetForm();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="!max-w-5xl h-[85vh] flex flex-col p-0">
				<DialogHeader className="px-6 py-4 border-b">
					<DialogTitle>Crear Nuevo Viaje</DialogTitle>
					<DialogDescription>
						Completa la información del viaje. Se verificará la disponibilidad antes de crear.
					</DialogDescription>
				</DialogHeader>
				<div className="flex-1 overflow-y-auto p-6">
					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Sección 1: Información del Viaje */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<Navigation className="h-5 w-5" />
								Información del Viaje
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Columna Izquierda: Evento y Ruta */}
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="evento">
											Evento <span className="text-destructive">*</span>
										</Label>
										<Select
											value={formData.eventoID?.toString()}
											onValueChange={(val) => setFormData({ ...formData, eventoID: Number(val) })}
											onOpenChange={() => handleBlur("eventoID")}
										>
											<SelectTrigger id="evento" className={isFieldInvalid("eventoID") ? "border-destructive" : ""}>
												<SelectValue placeholder="Selecciona un evento" />
											</SelectTrigger>
											<SelectContent>
												{eventos.map((evento) => (
													<SelectItem key={evento.eventoID} value={evento.eventoID.toString()}>
														{evento.nombre}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{isFieldInvalid("eventoID") && <p className="text-xs text-destructive">Selecciona un evento</p>}

										{selectedEvent && (
											<Card className="bg-muted/50 border-dashed">
												<CardContent className="p-3 space-y-2 text-sm">
													<div className="flex items-start gap-2">
														<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div>
															<p className="font-medium">Ubicación</p>
															<p className="text-muted-foreground text-xs">
																{selectedEvent.recinto}, {selectedEvent.ciudad}
															</p>
														</div>
													</div>
													<div className="flex items-start gap-2">
														<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div>
															<p className="font-medium">Fecha del Evento</p>
															<p className="text-muted-foreground text-xs">
																{new Date(selectedEvent.fecha).toLocaleDateString()}
																{/* Si hay hora, mostrarla */}
																{selectedEvent.horaInicio &&
																	typeof selectedEvent.horaInicio === "string" &&
																	` - ${selectedEvent.horaInicio}`}
															</p>
														</div>
													</div>
													{selectedEvent.descripcion && (
														<div className="flex items-start gap-2">
															<Info className="h-4 w-4 text-muted-foreground mt-0.5" />
															<div>
																<p className="font-medium">Descripción</p>
																<p className="text-muted-foreground text-xs line-clamp-2">
																	{selectedEvent.descripcion}
																</p>
															</div>
														</div>
													)}
												</CardContent>
											</Card>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="ruta">
											Ruta <span className="text-destructive">*</span>
										</Label>
										<Select
											value={formData.plantillaRutaID?.toString()}
											onValueChange={(val) => setFormData({ ...formData, plantillaRutaID: Number(val) })}
											onOpenChange={() => handleBlur("plantillaRutaID")}
										>
											<SelectTrigger
												id="ruta"
												className={isFieldInvalid("plantillaRutaID") ? "border-destructive" : ""}
											>
												<SelectValue placeholder="Selecciona una ruta" />
											</SelectTrigger>
											<SelectContent>
												{rutas.map((ruta) => (
													<SelectItem key={ruta.rutaID} value={ruta.rutaID.toString()}>
														{ruta.nombreRuta} ({ruta.codigoRuta})
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{isFieldInvalid("plantillaRutaID") && (
											<p className="text-xs text-destructive">Selecciona una ruta</p>
										)}

										{selectedRoute && (
											<Card className="bg-muted/50 border-dashed">
												<CardContent className="p-3 space-y-2 text-sm">
													<div className="flex items-start gap-2">
														<Navigation className="h-4 w-4 text-muted-foreground mt-0.5" />
														<div>
															<p className="font-medium">Trayecto</p>
															<p className="text-muted-foreground text-xs">
																{selectedRoute.ciudadOrigen} ➝ {selectedRoute.ciudadDestino}
															</p>
														</div>
													</div>
													<div className="grid grid-cols-2 gap-2 mt-1">
														<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
															<MapPin className="h-3 w-3" />
															{selectedRoute.distanciaKm} km
														</div>
														<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
															<Clock className="h-3 w-3" />
															{selectedRoute.tiempoEstimadoMinutos} min
														</div>
													</div>
												</CardContent>
											</Card>
										)}
									</div>
								</div>

								{/* Columna Derecha: Fechas y Tipo */}
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="tipoViaje">
											Tipo de Viaje <span className="text-destructive">*</span>
										</Label>
										<Select
											value={formData.tipoViaje}
											onValueChange={(val) => setFormData({ ...formData, tipoViaje: val })}
											onOpenChange={() => handleBlur("tipoViaje")}
										>
											<SelectTrigger id="tipoViaje" className={isFieldInvalid("tipoViaje") ? "border-destructive" : ""}>
												<SelectValue placeholder="Selecciona el tipo" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Ida">Ida</SelectItem>
												<SelectItem value="Redondo">Redondo</SelectItem>
											</SelectContent>
										</Select>
										{isFieldInvalid("tipoViaje") && <p className="text-xs text-destructive">Este campo es requerido</p>}
									</div>

									<div className="space-y-2">
										<Label htmlFor="fechaSalida">
											Fecha y Hora de Salida <span className="text-destructive">*</span>
										</Label>
										<Input
											id="fechaSalida"
											type="datetime-local"
											value={formData.fechaSalida?.slice(0, 16) || ""}
											onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
											onBlur={() => handleBlur("fechaSalida")}
											className={isFieldInvalid("fechaSalida") ? "border-destructive" : ""}
										/>
										{isFieldInvalid("fechaSalida") && (
											<p className="text-xs text-destructive">Selecciona fecha de salida</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="fechaLlegada">
											Fecha y Hora de Llegada Estimada <span className="text-destructive">*</span>
										</Label>
										<Input
											id="fechaLlegada"
											type="datetime-local"
											value={formData.fechaLlegadaEstimada?.slice(0, 16) || ""}
											onChange={(e) => setFormData({ ...formData, fechaLlegadaEstimada: e.target.value })}
											onBlur={() => handleBlur("fechaLlegadaEstimada")}
											className={isFieldInvalid("fechaLlegadaEstimada") ? "border-destructive" : ""}
										/>
										{isFieldInvalid("fechaLlegadaEstimada") && (
											<p className="text-xs text-destructive">Selecciona fecha de llegada</p>
										)}
									</div>
								</div>
							</div>
						</div>

						<Separator />

						{/* Sección 2: Asignación de Recursos */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<Bus className="h-5 w-5" />
								Asignación de Recursos
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="unidad">
										Unidad <span className="text-destructive">*</span>
									</Label>
									<Select
										value={formData.unidadID?.toString()}
										onValueChange={(val) => {
											const unitId = Number(val);
											const unit = unidades.find((u) => u.id === unitId);
											setFormData({
												...formData,
												unidadID: unitId,
												cupoTotal: unit?.capacidadAsientos || 0,
											});
										}}
										onOpenChange={() => handleBlur("unidadID")}
									>
										<SelectTrigger id="unidad" className={isFieldInvalid("unidadID") ? "border-destructive" : ""}>
											<SelectValue placeholder="Selecciona una unidad" />
										</SelectTrigger>
										<SelectContent>
											{unidades.map((unidad) => (
												<SelectItem key={unidad.id} value={unidad.id.toString()}>
													{unidad.placas} - {unidad.modelo}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isFieldInvalid("unidadID") && <p className="text-xs text-destructive">Selecciona una unidad</p>}

									{selectedUnit && (
										<Card className="bg-muted/50 border-dashed">
											<CardContent className="p-3 space-y-2 text-sm">
												<div className="flex items-start gap-2">
													<Bus className="h-4 w-4 text-muted-foreground mt-0.5" />
													<div>
														<p className="font-medium">
															{selectedUnit.marca} {selectedUnit.modelo}
														</p>
														<p className="text-muted-foreground text-xs">
															Placas: {selectedUnit.placas} • Eco: {selectedUnit.numeroEconomico}
														</p>
													</div>
												</div>
												<div className="flex gap-2 mt-1">
													{selectedUnit.tieneClimatizacion && (
														<Badge variant="outline" className="text-[10px] px-1 py-0 h-5 gap-1">
															<Wind className="h-3 w-3" /> A/C
														</Badge>
													)}
													{selectedUnit.tieneWifi && (
														<Badge variant="outline" className="text-[10px] px-1 py-0 h-5 gap-1">
															<Wifi className="h-3 w-3" /> Wifi
														</Badge>
													)}
													<Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">
														{selectedUnit.capacidadAsientos} pax
													</Badge>
												</div>
											</CardContent>
										</Card>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="chofer">
										Chofer <span className="text-destructive">*</span>
									</Label>
									<Select
										value={formData.choferID}
										onValueChange={(val) => setFormData({ ...formData, choferID: val })}
										onOpenChange={() => handleBlur("choferID")}
									>
										<SelectTrigger id="chofer" className={isFieldInvalid("choferID") ? "border-destructive" : ""}>
											<SelectValue placeholder="Selecciona un chofer" />
										</SelectTrigger>
										<SelectContent>
											{choferes.map((chofer) => (
												<SelectItem key={chofer.id} value={chofer.id}>
													{chofer.nombreCompleto}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isFieldInvalid("choferID") && <p className="text-xs text-destructive">Selecciona un chofer</p>}

									{selectedDriver && (
										<Card className="bg-muted/50 border-dashed">
											<CardContent className="p-3 space-y-2 text-sm">
												<div className="flex items-start gap-2">
													<User className="h-4 w-4 text-muted-foreground mt-0.5" />
													<div>
														<p className="font-medium">{selectedDriver.nombreCompleto}</p>
														<p className="text-muted-foreground text-xs">{selectedDriver.email}</p>
														{selectedDriver.phoneNumber && (
															<p className="text-muted-foreground text-xs">Tel: {selectedDriver.phoneNumber}</p>
														)}
													</div>
												</div>
											</CardContent>
										</Card>
									)}
								</div>
							</div>
						</div>

						<Separator />

						{/* Sección 3: Configuración Comercial */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold flex items-center gap-2">
								<Info className="h-5 w-5" />
								Configuración Comercial
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="space-y-2">
									<Label htmlFor="cupo">
										Cupo Total <span className="text-destructive">*</span>
									</Label>
									<Input
										id="cupo"
										type="number"
										min="1"
										max={selectedUnit?.capacidadAsientos}
										value={formData.cupoTotal || ""}
										onChange={(e) => {
											const val = Number(e.target.value);
											if (selectedUnit && val > selectedUnit.capacidadAsientos) {
												toast.error(
													`El cupo no puede exceder la capacidad de la unidad (${selectedUnit.capacidadAsientos})`,
												);
												return;
											}
											setFormData({ ...formData, cupoTotal: val });
										}}
										onBlur={() => handleBlur("cupoTotal")}
										className={isFieldInvalid("cupoTotal") ? "border-destructive" : ""}
									/>
									{isFieldInvalid("cupoTotal") && <p className="text-xs text-destructive">Ingresa un cupo válido</p>}
									{selectedUnit && (
										<p className="text-xs text-muted-foreground">Máximo: {selectedUnit.capacidadAsientos} pasajeros</p>
									)}
								</div>
								<div className="space-y-2">
									<Label htmlFor="precioBase">
										Precio Base <span className="text-destructive">*</span>
									</Label>
									<Input
										id="precioBase"
										type="number"
										min="0"
										step="0.01"
										value={formData.precioBase || ""}
										onChange={(e) => setFormData({ ...formData, precioBase: Number(e.target.value) })}
										onBlur={() => handleBlur("precioBase")}
										className={isFieldInvalid("precioBase") ? "border-destructive" : ""}
									/>
									{isFieldInvalid("precioBase") && <p className="text-xs text-destructive">Ingresa un precio válido</p>}
								</div>
								<div className="space-y-2">
									<Label htmlFor="cargoServicio">Cargo de Servicio</Label>
									<Input
										id="cargoServicio"
										type="number"
										min="0"
										step="0.01"
										value={formData.cargoServicio || ""}
										onChange={(e) => setFormData({ ...formData, cargoServicio: Number(e.target.value) })}
									/>
								</div>
							</div>
							<div className="flex items-center space-x-2 pt-2">
								<Switch
									id="ventasAbiertas"
									checked={formData.ventasAbiertas}
									onCheckedChange={(checked) => setFormData({ ...formData, ventasAbiertas: checked })}
								/>
								<Label htmlFor="ventasAbiertas">Ventas Abiertas</Label>
							</div>
						</div>
					</form>
				</div>
				<DialogFooter className="px-6 py-4 border-t mt-auto">
					<Button type="button" variant="outline" onClick={handleCancel}>
						Cancelar
					</Button>
					<Button type="submit" onClick={handleSubmit} disabled={verifyMutation.isPending || createMutation.isPending}>
						{verifyMutation.isPending || createMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Procesando...
							</>
						) : (
							"Crear Viaje"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
