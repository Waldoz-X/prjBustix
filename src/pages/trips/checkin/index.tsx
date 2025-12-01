import { useMutation, useQuery } from "@tanstack/react-query";

import {
	AlertTriangle,
	ArrowLeft,
	Bus,
	CheckCircle2,
	ClipboardList,
	Clock,
	Filter,
	MapPin,
	MoreVertical,
	QrCode,
	Search,
	Users,
	XCircle,
} from "lucide-react";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import boletosService from "@/api/services/boletosService";
import incidenciasService from "@/api/services/incidenciasService";
import viajesService from "@/api/services/viajesService";
import { useHasRole } from "@/hooks/use-session";
import { useRouter, useSearchParams } from "@/routes/hooks";
import { useUserInfo } from "@/store/userStore";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Textarea } from "@/ui/textarea";
import { cn } from "@/utils/index";

export default function CheckInPage() {
	const isOperator = useHasRole("Operator");
	const isStaff = useHasRole("Staff");
	const allowed = isOperator || isStaff;
	const router = useRouter();
	const searchParams = useSearchParams();
	const viajeId = searchParams.get("viajeId");
	const userInfo = useUserInfo();
	const currentUserId = userInfo?.id;

	const [qrInput, setQrInput] = useState("");
	const [validationResult, setValidationResult] = useState<{
		success: boolean;
		message: string;
		pasajero?: string;
		asiento?: string;
	} | null>(null);

	// Manifiesto filters
	const [manifestoSearch, setManifiestoSearch] = useState("");
	const [manifestoFilter, setManifiestoFilter] = useState<string>("todos");

	// Incident Form State
	const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
	const [incidentForm, setIncidentForm] = useState({
		tipoIncidenciaID: "",
		titulo: "",
		descripcion: "",
		prioridad: "Media" as "Baja" | "Media" | "Alta" | "Crítica",
	});

	// Finalize Form State
	const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
	const [finalizeForm, setFinalizeForm] = useState({
		observaciones: "",
	});

	// Fetch trip details
	const { data: viajeDetalle } = useQuery({
		queryKey: ["viaje-detalle", viajeId],
		queryFn: () => viajesService.getDetalleCliente(Number(viajeId)),
		enabled: !!viajeId && allowed,
	});

	// Fetch staff assignments to validate access
	const { data: staffAssignments, isLoading: isLoadingStaff } = useQuery({
		queryKey: ["viaje-staff", viajeId],
		queryFn: () => viajesService.getStaff(Number(viajeId)),
		enabled: !!viajeId && allowed,
	});

	// Check if current user is assigned to this trip
	const currentUserAssignment = staffAssignments?.find((s) => s.staffID === currentUserId);
	const isAssigned = !!currentUserAssignment || isOperator; // Operators can always access

	// Fetch check-in progress
	const {
		data: checkinProgress,
		isLoading: isLoadingProgress,
		refetch: refetchProgress,
	} = useQuery({
		queryKey: ["checkin-progress", viajeId],
		queryFn: () => viajesService.getProgresoCheckin(Number(viajeId)),
		enabled: !!viajeId && allowed && isAssigned,
		refetchInterval: 10000,
	});

	// Fetch manifesto
	const { data: manifesto, refetch: refetchManifesto } = useQuery({
		queryKey: ["manifiesto", viajeId],
		queryFn: () => viajesService.getManifiesto(Number(viajeId)),
		enabled: !!viajeId && allowed && isAssigned,
	});

	// Fetch incident types
	const { data: incidentTypes = [] } = useQuery({
		queryKey: ["incident-types"],
		queryFn: incidenciasService.getTipos,
		enabled: isIncidentModalOpen,
	});

	// Filter passengers
	const filteredPassengers = useMemo(() => {
		if (!manifesto?.pasajeros) return [];

		let filtered = manifesto.pasajeros;

		// Filter by search
		if (manifestoSearch) {
			filtered = filtered.filter(
				(p) =>
					p.clienteNombre?.toLowerCase().includes(manifestoSearch.toLowerCase()) ||
					p.asientoAsignado?.toLowerCase().includes(manifestoSearch.toLowerCase()) ||
					p.clienteEmail?.toLowerCase().includes(manifestoSearch.toLowerCase()),
			);
		}

		// Filter by status
		if (manifestoFilter !== "todos") {
			switch (manifestoFilter) {
				case "abordados":
					filtered = filtered.filter((p) => p.estadoAbordaje === "Abordado");
					break;
				case "pendientes":
					filtered = filtered.filter((p) => p.estadoAbordaje !== "Abordado" && p.estadoAbordaje !== "NoShow");
					break;
				case "noshow":
					filtered = filtered.filter((p) => p.estadoAbordaje === "NoShow");
					break;
			}
		}

		return filtered;
	}, [manifesto, manifestoSearch, manifestoFilter]);

	// Mutations
	const startValidationMutation = useMutation({
		mutationFn: (paradaId: number) => viajesService.iniciarValidacion(Number(viajeId), { paradaViajeID: paradaId }),
		onSuccess: () => {
			toast.success("Validación iniciada");
			refetchProgress();
		},
		onError: (error: any) => toast.error(error.message || "Error al iniciar validación"),
	});

	const validateTicketMutation = useMutation({
		mutationFn: (codigoQR: string) =>
			boletosService.validarBoleto({
				viajeID: Number(viajeId),
				codigoQR,
				tipoValidacion: "Abordaje",
				estacionLat: 0,
				estacionLong: 0,
			}),
		onSuccess: (data) => {
			if (data.success) {
				toast.success("Boleto validado correctamente");
				setValidationResult({
					success: true,
					message: data.message,
					pasajero: data.clienteNombre,
					asiento: data.asientoAsignado,
				});
				setQrInput("");
				refetchProgress();
				refetchManifesto();

				// Clear success message after 3 seconds
				setTimeout(() => setValidationResult(null), 3000);
			} else {
				toast.error(data.message);
				setValidationResult({
					success: false,
					message: data.message,
				});
			}
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al validar boleto");
			setValidationResult({
				success: false,
				message: error.message || "Error al validar boleto",
			});
		},
	});

	const finalizeValidationMutation = useMutation({
		mutationFn: (data: { paradaId: number; totalAbordados: number; totalNoShow: number; observaciones: string }) =>
			viajesService.finalizarValidacion(Number(viajeId), {
				paradaViajeID: data.paradaId,
				totalAbordados: data.totalAbordados,
				totalNoShow: data.totalNoShow,
				observaciones: data.observaciones,
			}),
		onSuccess: () => {
			toast.success("Validación finalizada exitosamente");
			setIsFinalizeModalOpen(false);
			refetchProgress();
		},
		onError: (error: any) => toast.error(error.message || "Error al finalizar validación"),
	});

	const createIncidentMutation = useMutation({
		mutationFn: () =>
			incidenciasService.create({
				tipoIncidenciaID: Number(incidentForm.tipoIncidenciaID),
				viajeID: Number(viajeId),
				titulo: incidentForm.titulo,
				descripcion: incidentForm.descripcion,
				prioridad: incidentForm.prioridad,
			}),
		onSuccess: () => {
			toast.success("Incidencia reportada correctamente");
			setIsIncidentModalOpen(false);
			setIncidentForm({
				tipoIncidenciaID: "",
				titulo: "",
				descripcion: "",
				prioridad: "Media",
			});
		},
		onError: (error: any) => toast.error(error.message || "Error al reportar incidencia"),
	});

	const confirmArrivalMutation = useMutation({
		mutationFn: (paradaId: number) =>
			viajesService.confirmarLlegada(Number(viajeId), {
				paradaViajeID: paradaId,
				latitud: 0, // TODO: Get real location
				longitud: 0,
			}),
		onSuccess: () => {
			toast.success("Llegada confirmada");
			refetchProgress();
		},
		onError: (error: any) => toast.error(error.message || "Error al confirmar llegada"),
	});

	const markNoShowMutation = useMutation({
		mutationFn: (data: { boletoId: number; paradaId: number }) =>
			boletosService.marcarNoShow(data.boletoId, {
				paradaViajeID: data.paradaId,
				motivo: "No se presentó a tiempo",
			}),
		onSuccess: () => {
			toast.success("Pasajero marcado como No Show");
			refetchManifesto();
			refetchProgress();
		},
		onError: (error: any) => toast.error(error.message || "Error al marcar No Show"),
	});

	if (!allowed) {
		return (
			<div className="p-6 flex items-center justify-center min-h-screen bg-gray-50">
				<Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
					<CardHeader>
						<CardTitle className="text-destructive flex items-center gap-2">Acceso Denegado</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">No tienes permisos para ver esta página.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!viajeId) {
		return (
			<div className="p-6 flex items-center justify-center min-h-screen bg-gray-50">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Viaje no seleccionado</CardTitle>
					</CardHeader>
					<CardContent>
						<Button onClick={() => router.push("/trips/assigned")} className="w-full">
							Volver a mis viajes
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Validation for staff assignment
	if (!isLoadingStaff && !isAssigned) {
		return (
			<div className="p-6 flex items-center justify-center min-h-screen bg-gray-50">
				<Card className="w-full max-w-md border-destructive/20 shadow-lg">
					<CardHeader>
						<CardTitle className="text-destructive flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Acceso No Autorizado
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertTitle>No asignado</AlertTitle>
							<AlertDescription>Solo el personal asignado puede gestionar este viaje.</AlertDescription>
						</Alert>
						<Button variant="outline" onClick={() => router.push("/trips/assigned")} className="w-full">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Volver a mis viajes
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const currentStop = checkinProgress?.paradas.find(
		(p) => p.estado === "Pendiente" || p.estado === "Llegado" || p.estado === "Validando",
	);

	const isStopActive = currentStop?.estado === "Validando";
	const canConfirmArrival = currentStop?.estado === "Pendiente";
	const canStartValidation = currentStop?.estado === "Llegado";

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="icon" onClick={() => router.push("/trips/assigned")} className="h-8 w-8">
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<ClipboardList className="h-8 w-8" /> Check-in de Viaje
						</h1>
					</div>
					<div className="flex items-center gap-2 text-muted-foreground ml-10">
						<Badge variant="outline" className="font-mono">
							{viajeDetalle?.codigoViaje}
						</Badge>
						<span>•</span>
						<span>{viajeDetalle?.eventoNombre}</span>
					</div>
				</div>
				<div className="flex items-center gap-2 ml-10 md:ml-0">
					{currentUserAssignment && <Badge variant="secondary">{currentUserAssignment.rolEnViaje}</Badge>}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								<MoreVertical className="h-4 w-4 mr-2" /> Opciones
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setIsIncidentModalOpen(true)} className="text-destructive">
								<AlertTriangle className="h-4 w-4 mr-2" />
								Reportar Incidencia
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{isLoadingProgress ? (
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
				</div>
			) : !checkinProgress ? (
				<div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
					No se pudo cargar la información del viaje
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column: Status & Actions */}
					<div className="space-y-6 lg:col-span-2">
						{/* Current Stop Card */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<div className="flex items-center gap-2">
									<MapPin className="h-5 w-5 text-primary" />
									<CardTitle className="text-lg">
										{currentStop ? currentStop.nombreParada : "Viaje Completado"}
									</CardTitle>
								</div>
								{currentStop && (
									<Badge
										variant={
											currentStop.estado === "Validando"
												? "default"
												: currentStop.estado === "Completado"
													? "secondary"
													: "outline"
										}
									>
										{currentStop.estado}
									</Badge>
								)}
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground mb-4">
									{currentStop?.direccion || "Todas las paradas han sido visitadas"}
								</p>

								{currentStop && (
									<div className="space-y-4">
										{canConfirmArrival && (
											<div className="bg-muted/50 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
												<div>
													<h3 className="font-semibold">Llegada a Parada</h3>
													<p className="text-sm text-muted-foreground">Confirma que has llegado a la parada.</p>
												</div>
												<Button
													onClick={() => confirmArrivalMutation.mutate(currentStop.paradaViajeID)}
													disabled={confirmArrivalMutation.isPending}
												>
													{confirmArrivalMutation.isPending ? "Confirmando..." : "Confirmar Llegada"}
												</Button>
											</div>
										)}

										{canStartValidation && (
											<div className="bg-muted/50 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
												<div>
													<h3 className="font-semibold">Iniciar Abordaje</h3>
													<p className="text-sm text-muted-foreground">Comienza la validación de pasajeros.</p>
												</div>
												<Button
													onClick={() => startValidationMutation.mutate(currentStop.paradaViajeID)}
													disabled={startValidationMutation.isPending}
												>
													{startValidationMutation.isPending ? "Iniciando..." : "Iniciar Validación"}
												</Button>
											</div>
										)}

										{isStopActive && (
											<Tabs defaultValue="scanner" className="w-full">
												<TabsList className="grid w-full grid-cols-2">
													<TabsTrigger value="scanner">
														<QrCode className="h-4 w-4 mr-2" />
														Escáner
													</TabsTrigger>
													<TabsTrigger value="manifest">
														<ClipboardList className="h-4 w-4 mr-2" />
														Lista
													</TabsTrigger>
												</TabsList>

												<TabsContent value="scanner" className="mt-6 space-y-6">
													<Card className="border-dashed">
														<CardContent className="flex flex-col items-center justify-center p-10 space-y-6">
															<div className="relative h-40 w-40 flex items-center justify-center bg-muted rounded-xl">
																<QrCode className="h-20 w-20 text-muted-foreground opacity-50" />
																<div className="absolute inset-0 border-2 border-primary/20 rounded-xl animate-pulse" />
															</div>

															<div className="w-full max-w-sm space-y-2">
																<Input
																	placeholder="Haz clic aquí y escanea..."
																	value={qrInput}
																	onChange={(e) => setQrInput(e.target.value)}
																	onKeyDown={(e) => {
																		if (e.key === "Enter" && qrInput) {
																			validateTicketMutation.mutate(qrInput);
																		}
																	}}
																	className="text-center font-mono text-lg h-12"
																	autoFocus
																/>
																<p className="text-xs text-center text-muted-foreground">
																	Presiona Enter para validar manualmente
																</p>
															</div>
														</CardContent>
													</Card>

													{/* Validation Result Overlay */}
													{validationResult && (
														<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
															<Card className="w-full max-w-md mx-4 animate-in zoom-in-95">
																<CardContent className="p-6 flex flex-col items-center text-center space-y-4">
																	<div
																		className={cn(
																			"h-16 w-16 rounded-full flex items-center justify-center",
																			validationResult.success ? "bg-green-100" : "bg-red-100",
																		)}
																	>
																		{validationResult.success ? (
																			<CheckCircle2 className="h-8 w-8 text-green-600" />
																		) : (
																			<XCircle className="h-8 w-8 text-red-600" />
																		)}
																	</div>

																	<h3 className="text-2xl font-bold">
																		{validationResult.success ? "¡Acceso Permitido!" : "Acceso Denegado"}
																	</h3>

																	<p className="text-muted-foreground">{validationResult.message}</p>

																	{validationResult.success && (
																		<div className="bg-muted p-4 rounded-lg w-full">
																			<p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">
																				Pasajero
																			</p>
																			<p className="text-lg font-bold mb-2">{validationResult.pasajero}</p>
																			<Badge variant="outline" className="text-base px-4 py-1">
																				Asiento: {validationResult.asiento}
																			</Badge>
																		</div>
																	)}

																	<Button
																		className="w-full"
																		variant={validationResult.success ? "default" : "destructive"}
																		onClick={() => setValidationResult(null)}
																	>
																		Continuar
																	</Button>
																</CardContent>
															</Card>
														</div>
													)}
												</TabsContent>

												<TabsContent value="manifest" className="mt-6 space-y-4">
													<div className="flex flex-col sm:flex-row gap-4">
														<div className="relative flex-1">
															<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
															<Input
																placeholder="Buscar pasajero..."
																value={manifestoSearch}
																onChange={(e) => setManifiestoSearch(e.target.value)}
																className="pl-9"
															/>
														</div>
														<Select value={manifestoFilter} onValueChange={setManifiestoFilter}>
															<SelectTrigger className="w-full sm:w-[180px]">
																<Filter className="h-4 w-4 mr-2" />
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="todos">Todos</SelectItem>
																<SelectItem value="abordados">Abordados</SelectItem>
																<SelectItem value="pendientes">Pendientes</SelectItem>
																<SelectItem value="noshow">No Show</SelectItem>
															</SelectContent>
														</Select>
													</div>

													<div className="flex gap-2 overflow-x-auto pb-2">
														<Badge variant="secondary">Total: {manifesto?.pasajeros.length || 0}</Badge>
														<Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
															Abordados: {manifesto?.pasajerosAbordados || 0}
														</Badge>
														<Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
															Pendientes: {manifesto?.pasajerosPendientes || 0}
														</Badge>
													</div>

													{/* Desktop Table */}
													<div className="hidden md:block rounded-md border">
														<Table>
															<TableHeader>
																<TableRow>
																	<TableHead>Pasajero</TableHead>
																	<TableHead>Asiento</TableHead>
																	<TableHead>Estado</TableHead>
																	<TableHead className="text-right">Acciones</TableHead>
																</TableRow>
															</TableHeader>
															<TableBody>
																{filteredPassengers.length === 0 ? (
																	<TableRow>
																		<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
																			No se encontraron pasajeros
																		</TableCell>
																	</TableRow>
																) : (
																	filteredPassengers.map((pasajero) => (
																		<TableRow key={pasajero.boletoID}>
																			<TableCell>
																				<div className="flex flex-col">
																					<span className="font-medium">{pasajero.clienteNombre}</span>
																					<span className="text-xs text-muted-foreground">{pasajero.clienteEmail}</span>
																				</div>
																			</TableCell>
																			<TableCell>
																				<Badge variant="outline" className="font-mono">
																					{pasajero.asientoAsignado}
																				</Badge>
																			</TableCell>
																			<TableCell>
																				{pasajero.estadoAbordaje === "Abordado" ? (
																					<Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
																						Abordado
																					</Badge>
																				) : pasajero.estadoAbordaje === "NoShow" ? (
																					<Badge variant="destructive">No Show</Badge>
																				) : (
																					<Badge variant="secondary">Pendiente</Badge>
																				)}
																			</TableCell>
																			<TableCell className="text-right">
																				<div className="flex justify-end gap-2">
																					{pasajero.estadoAbordaje !== "Abordado" &&
																						pasajero.estadoAbordaje !== "NoShow" && (
																							<>
																								<Button
																									size="sm"
																									variant="outline"
																									onClick={() => validateTicketMutation.mutate(pasajero.codigoQR)}
																									disabled={validateTicketMutation.isPending}
																								>
																									Validar
																								</Button>
																								<Button
																									size="sm"
																									variant="ghost"
																									className="text-destructive hover:text-destructive"
																									onClick={() => {
																										if (currentStop) {
																											markNoShowMutation.mutate({
																												boletoId: pasajero.boletoID,
																												paradaId: currentStop.paradaViajeID,
																											});
																										}
																									}}
																									disabled={markNoShowMutation.isPending}
																								>
																									No Show
																								</Button>
																							</>
																						)}
																				</div>
																			</TableCell>
																		</TableRow>
																	))
																)}
															</TableBody>
														</Table>
													</div>

													{/* Mobile List */}
													<div className="md:hidden space-y-4">
														{filteredPassengers.length === 0 ? (
															<div className="text-center py-8 text-muted-foreground border rounded-lg">
																No se encontraron pasajeros
															</div>
														) : (
															filteredPassengers.map((pasajero) => (
																<Card key={pasajero.boletoID}>
																	<CardContent className="p-4">
																		<div className="flex justify-between items-start mb-2">
																			<div>
																				<p className="font-semibold">{pasajero.clienteNombre}</p>
																				<p className="text-xs text-muted-foreground">{pasajero.clienteEmail}</p>
																			</div>
																			<Badge variant="outline" className="font-mono">
																				{pasajero.asientoAsignado}
																			</Badge>
																		</div>
																		<div className="flex items-center justify-between mt-4 border-t pt-4">
																			<div>
																				{pasajero.estadoAbordaje === "Abordado" ? (
																					<Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
																						Abordado
																					</Badge>
																				) : pasajero.estadoAbordaje === "NoShow" ? (
																					<Badge variant="destructive">No Show</Badge>
																				) : (
																					<Badge variant="secondary">Pendiente</Badge>
																				)}
																			</div>
																			<div className="flex gap-2">
																				{pasajero.estadoAbordaje !== "Abordado" &&
																					pasajero.estadoAbordaje !== "NoShow" && (
																						<>
																							<Button
																								size="sm"
																								variant="outline"
																								onClick={() => validateTicketMutation.mutate(pasajero.codigoQR)}
																								disabled={validateTicketMutation.isPending}
																							>
																								Validar
																							</Button>
																							<Button
																								size="sm"
																								variant="ghost"
																								className="text-destructive"
																								onClick={() => {
																									if (currentStop) {
																										markNoShowMutation.mutate({
																											boletoId: pasajero.boletoID,
																											paradaId: currentStop.paradaViajeID,
																										});
																									}
																								}}
																								disabled={markNoShowMutation.isPending}
																							>
																								No Show
																							</Button>
																						</>
																					)}
																			</div>
																		</div>
																	</CardContent>
																</Card>
															))
														)}
													</div>

													<div className="flex justify-end pt-4 border-t">
														<Button size="lg" onClick={() => setIsFinalizeModalOpen(true)}>
															Finalizar Validación en Parada
														</Button>
													</div>
												</TabsContent>
											</Tabs>
										)}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Stats Grid */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<Card>
								<CardHeader className="p-4 pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">Esperados</CardTitle>
								</CardHeader>
								<CardContent className="p-4 pt-0">
									<div className="text-2xl font-bold">{currentStop?.totalPasajerosEsperados || 0}</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="p-4 pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">Abordados</CardTitle>
								</CardHeader>
								<CardContent className="p-4 pt-0">
									<div className="text-2xl font-bold text-green-600">{currentStop?.totalPasajerosAbordados || 0}</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="p-4 pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
								</CardHeader>
								<CardContent className="p-4 pt-0">
									<div className="text-2xl font-bold text-orange-600">{currentStop?.pasajerosPorValidar || 0}</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="p-4 pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">No Show</CardTitle>
								</CardHeader>
								<CardContent className="p-4 pt-0">
									<div className="text-2xl font-bold text-destructive">{currentStop?.totalPasajerosNoShow || 0}</div>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Right Column: Trip Info & Timeline */}
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Bus className="h-5 w-5" /> Detalles del Viaje
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex justify-between py-2 border-b">
									<span className="text-muted-foreground">Chofer</span>
									<span className="font-medium">{viajeDetalle?.choferNombre || "No asignado"}</span>
								</div>
								<div className="flex justify-between py-2 border-b">
									<span className="text-muted-foreground">Unidad</span>
									<span className="font-medium">{viajeDetalle?.unidadPlacas}</span>
								</div>
								<div className="flex justify-between py-2 border-b">
									<span className="text-muted-foreground">Mi Rol</span>
									<Badge variant="secondary">{currentUserAssignment?.rolEnViaje || "Staff"}</Badge>
								</div>
								<div className="pt-2 space-y-2">
									<div className="flex justify-between items-center">
										<span className="text-sm text-muted-foreground">Progreso Global</span>
										<span className="font-bold text-primary">{checkinProgress.porcentajeAvance}%</span>
									</div>
									<div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
										<div
											className="h-full bg-primary transition-all duration-500 ease-out"
											style={{ width: `${checkinProgress.porcentajeAvance}%` }}
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Clock className="h-5 w-5" /> Itinerario
								</CardTitle>
							</CardHeader>
							<CardContent className="p-0">
								<div className="flex flex-col">
									{checkinProgress.paradas.map((parada, index) => (
										<div
											key={parada.paradaViajeID}
											className={cn(
												"flex gap-3 p-4 border-b last:border-0 transition-colors relative",
												parada.paradaViajeID === currentStop?.paradaViajeID ? "bg-muted/50" : "",
											)}
										>
											{parada.paradaViajeID === currentStop?.paradaViajeID && (
												<div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
											)}
											<div className="flex flex-col items-center gap-1 pt-1">
												<div
													className={cn(
														"h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm",
														parada.estado === "Completado"
															? "bg-green-500"
															: parada.estado === "Validando"
																? "bg-primary animate-pulse"
																: "bg-muted-foreground/30",
													)}
												/>
												{index < checkinProgress.paradas.length - 1 && <div className="w-0.5 flex-1 bg-muted my-1" />}
											</div>
											<div className="flex-1 space-y-1">
												<div className="flex items-center justify-between">
													<p
														className={cn(
															"font-medium text-sm",
															parada.paradaViajeID === currentStop?.paradaViajeID && "text-primary",
														)}
													>
														{parada.nombreParada}
													</p>
													<span className="text-xs text-muted-foreground font-mono">
														{new Date(parada.horaEstimadaLlegada).toLocaleTimeString([], {
															hour: "2-digit",
															minute: "2-digit",
														})}
													</span>
												</div>
												<p className="text-xs text-muted-foreground line-clamp-1">{parada.direccion}</p>
												<div className="flex items-center gap-2 mt-2">
													<Badge
														variant={
															parada.estado === "Completado"
																? "secondary"
																: parada.estado === "Validando"
																	? "default"
																	: "outline"
														}
														className="text-[10px] h-5 px-1.5"
													>
														{parada.estado}
													</Badge>
													{parada.totalPasajerosAbordados > 0 && (
														<span className="text-[10px] text-muted-foreground flex items-center gap-1">
															<Users className="h-3 w-3" />
															{parada.totalPasajerosAbordados}
														</span>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			)}

			{/* Incident Modal */}
			<Dialog open={isIncidentModalOpen} onOpenChange={setIsIncidentModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Reportar Incidencia</DialogTitle>
						<DialogDescription>Registra cualquier problema o situación irregular.</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Tipo de Incidencia</Label>
							<Select
								value={incidentForm.tipoIncidenciaID}
								onValueChange={(val) => setIncidentForm({ ...incidentForm, tipoIncidenciaID: val })}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecciona el tipo" />
								</SelectTrigger>
								<SelectContent>
									{incidentTypes.map((tipo) => (
										<SelectItem key={tipo.tipoIncidenciaID} value={String(tipo.tipoIncidenciaID)}>
											{tipo.nombre}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Título</Label>
							<Input
								placeholder="Resumen breve del problema"
								value={incidentForm.titulo}
								onChange={(e) => setIncidentForm({ ...incidentForm, titulo: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label>Descripción</Label>
							<Textarea
								placeholder="Detalles completos de la incidencia..."
								value={incidentForm.descripcion}
								onChange={(e) => setIncidentForm({ ...incidentForm, descripcion: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label>Prioridad</Label>
							<Select
								value={incidentForm.prioridad}
								onValueChange={(val: any) => setIncidentForm({ ...incidentForm, prioridad: val })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Baja">Baja</SelectItem>
									<SelectItem value="Media">Media</SelectItem>
									<SelectItem value="Alta">Alta</SelectItem>
									<SelectItem value="Crítica">Crítica</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsIncidentModalOpen(false)}>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={() => createIncidentMutation.mutate()}
							disabled={createIncidentMutation.isPending}
						>
							{createIncidentMutation.isPending ? "Enviando..." : "Reportar"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Finalize Modal */}
			<Dialog open={isFinalizeModalOpen} onOpenChange={setIsFinalizeModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Finalizar Validación</DialogTitle>
						<DialogDescription>Confirma los totales antes de cerrar la parada.</DialogDescription>
					</DialogHeader>
					<div className="space-y-6 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
								<p className="text-sm text-green-600 font-medium mb-1">Total Abordados</p>
								<div className="text-3xl font-bold text-green-700">{currentStop?.totalPasajerosAbordados || 0}</div>
							</div>
							<div className="bg-red-50 p-4 rounded-lg text-center border border-red-100">
								<p className="text-sm text-red-600 font-medium mb-1">Pendientes / No Show</p>
								<div className="text-3xl font-bold text-red-700">
									{(currentStop?.totalPasajerosEsperados || 0) - (currentStop?.totalPasajerosAbordados || 0)}
								</div>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Observaciones (Opcional)</Label>
							<Textarea
								placeholder="Comentarios finales sobre el abordaje..."
								value={finalizeForm.observaciones}
								onChange={(e) => setFinalizeForm({ ...finalizeForm, observaciones: e.target.value })}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsFinalizeModalOpen(false)}>
							Cancelar
						</Button>
						<Button
							onClick={() =>
								finalizeValidationMutation.mutate({
									paradaId: currentStop?.paradaViajeID || 0,
									totalAbordados: currentStop?.totalPasajerosAbordados || 0,
									totalNoShow:
										(currentStop?.totalPasajerosEsperados || 0) - (currentStop?.totalPasajerosAbordados || 0),
									observaciones: finalizeForm.observaciones,
								})
							}
							disabled={finalizeValidationMutation.isPending}
						>
							{finalizeValidationMutation.isPending ? "Finalizando..." : "Confirmar y Finalizar"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
