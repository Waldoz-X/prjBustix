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
import { Separator } from "@/ui/separator";
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
	const { data: viajeDetalle, isLoading: isLoadingDetalle } = useQuery({
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
		<div className="flex flex-col h-screen bg-gray-50">
			{/* Sticky Header */}
			<div className="sticky top-0 z-50 bg-white border-b shadow-sm px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push("/trips/assigned")}
						className="hover:bg-gray-100 rounded-full"
					>
						<ArrowLeft className="h-5 w-5 text-gray-600" />
					</Button>
					<div>
						{isLoadingDetalle ? (
							<div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
						) : (
							<div className="flex flex-col">
								<h1 className="text-sm font-bold text-gray-900 leading-tight">{viajeDetalle?.eventoNombre}</h1>
								<div className="flex items-center text-xs text-muted-foreground gap-1">
									<Badge variant="outline" className="text-[10px] h-4 px-1 font-mono">
										{viajeDetalle?.codigoViaje}
									</Badge>
									<span>•</span>
									<span className="truncate max-w-[150px]">{viajeDetalle?.rutaNombre}</span>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2">
					{currentUserAssignment && (
						<Badge variant="secondary" className="hidden sm:flex bg-blue-50 text-blue-700 border-blue-100">
							{currentUserAssignment.rolEnViaje}
						</Badge>
					)}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<MoreVertical className="h-5 w-5 text-gray-600" />
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

			<div className="flex-1 overflow-y-auto p-4 md:p-6">
				{isLoadingProgress ? (
					<div className="flex items-center justify-center h-full">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
					</div>
				) : !checkinProgress ? (
					<div className="flex items-center justify-center h-full text-muted-foreground">
						No se pudo cargar la información del viaje
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto pb-20">
						{/* Left Column: Status & Actions */}
						<div className="space-y-6 lg:col-span-2">
							{/* Current Stop Card */}
							<Card className="border-none shadow-md overflow-hidden">
								<div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<MapPin className="h-5 w-5 text-blue-400" />
											<h2 className="font-bold text-lg">
												{currentStop ? currentStop.nombreParada : "Viaje Completado"}
											</h2>
										</div>
										{currentStop && (
											<Badge
												className={cn(
													"text-xs px-2 py-0.5",
													currentStop.estado === "Validando"
														? "bg-green-500 hover:bg-green-600"
														: "bg-blue-500 hover:bg-blue-600",
												)}
											>
												{currentStop.estado}
											</Badge>
										)}
									</div>
									<p className="text-sm text-slate-300 mt-1 ml-7">
										{currentStop?.direccion || "Todas las paradas han sido visitadas"}
									</p>
								</div>

								{currentStop && (
									<CardContent className="p-0">
										<div className="p-4">
											{canConfirmArrival && (
												<div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-300">
													<div className="flex items-start gap-3">
														<div className="bg-blue-100 p-2 rounded-full">
															<MapPin className="h-5 w-5 text-blue-600" />
														</div>
														<div>
															<h3 className="font-semibold text-blue-900">Llegada a Parada</h3>
															<p className="text-sm text-blue-700">Confirma que has llegado a la parada.</p>
														</div>
													</div>
													<Button
														onClick={() => confirmArrivalMutation.mutate(currentStop.paradaViajeID)}
														disabled={confirmArrivalMutation.isPending}
														className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 shadow-sm"
													>
														{confirmArrivalMutation.isPending ? "Confirmando..." : "Confirmar Llegada"}
													</Button>
												</div>
											)}

											{canConfirmArrival && (
												<div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-300">
													<div className="flex items-start gap-3">
														<div className="bg-blue-100 p-2 rounded-full">
															<MapPin className="h-5 w-5 text-blue-600" />
														</div>
														<div>
															<h3 className="font-semibold text-blue-900">Llegada a Parada</h3>
															<p className="text-sm text-blue-700">Confirma que has llegado a la parada.</p>
														</div>
													</div>
													<Button
														onClick={() => confirmArrivalMutation.mutate(currentStop.paradaViajeID)}
														disabled={confirmArrivalMutation.isPending}
														className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 shadow-sm"
													>
														{confirmArrivalMutation.isPending ? "Confirmando..." : "Confirmar Llegada"}
													</Button>
												</div>
											)}

											{canStartValidation && (
												<div className="bg-green-50 border border-green-100 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-300">
													<div className="flex items-start gap-3">
														<div className="bg-green-100 p-2 rounded-full">
															<Bus className="h-5 w-5 text-green-600" />
														</div>
														<div>
															<h3 className="font-semibold text-green-900">Iniciar Abordaje</h3>
															<p className="text-sm text-green-700">Comienza la validación de pasajeros.</p>
														</div>
													</div>
													<Button
														onClick={() => startValidationMutation.mutate(currentStop.paradaViajeID)}
														disabled={startValidationMutation.isPending}
														className="w-full sm:w-auto bg-green-600 hover:bg-green-700 shadow-sm"
													>
														{startValidationMutation.isPending ? "Iniciando..." : "Iniciar Validación"}
													</Button>
												</div>
											)}

											{isStopActive && (
												<Tabs defaultValue="scanner" className="w-full mt-2">
													<TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
														<TabsTrigger
															value="scanner"
															className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
														>
															<QrCode className="h-4 w-4 mr-2" />
															Escáner
														</TabsTrigger>
														<TabsTrigger
															value="manifest"
															className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
														>
															<ClipboardList className="h-4 w-4 mr-2" />
															Lista
														</TabsTrigger>
													</TabsList>

													<TabsContent value="scanner" className="mt-6 space-y-6 focus-visible:ring-0">
														<div className="flex flex-col gap-6">
															{/* Immersive Scanner UI */}
															<div className="relative group">
																<div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
																<div className="relative bg-white rounded-xl p-6 shadow-xl">
																	<div className="flex flex-col items-center justify-center space-y-4">
																		<div className="relative w-full max-w-xs aspect-square bg-gray-900 rounded-lg overflow-hidden border-4 border-gray-800 shadow-inner flex items-center justify-center">
																			{/* Scanning Animation Line */}
																			<div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-[scan_2s_linear_infinite]" />

																			<QrCode className="h-24 w-24 text-gray-700 opacity-20" />
																			<p className="absolute bottom-4 text-xs text-gray-400 font-mono animate-pulse">
																				WAITING FOR SCAN...
																			</p>
																		</div>

																		<div className="w-full max-w-xs space-y-2">
																			<Input
																				placeholder="Haz clic aquí y escanea..."
																				value={qrInput}
																				onChange={(e) => setQrInput(e.target.value)}
																				onKeyDown={(e) => {
																					if (e.key === "Enter" && qrInput) {
																						validateTicketMutation.mutate(qrInput);
																					}
																				}}
																				className="text-center font-mono text-lg h-12 border-2 focus:border-blue-500 transition-all"
																				autoFocus
																			/>
																			<p className="text-xs text-center text-muted-foreground">
																				Presiona Enter para validar manualmente
																			</p>
																		</div>
																	</div>
																</div>
															</div>

															{/* Validation Result Overlay */}
															{validationResult && (
																<button
																	type="button"
																	className={cn(
																		"fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 border-none cursor-default",
																	)}
																	onClick={() => setValidationResult(null)}
																	onKeyDown={(e) => {
																		if (e.key === "Escape") {
																			setValidationResult(null);
																		}
																	}}
																>
																	<div
																		className={cn(
																			"w-full max-w-sm mx-4 p-6 rounded-2xl shadow-2xl transform transition-all scale-100 animate-in zoom-in-95 duration-300 cursor-auto text-left",
																			validationResult.success ? "bg-white" : "bg-white",
																		)}
																		onClick={(e) => e.stopPropagation()}
																		role="dialog"
																		aria-modal="true"
																	>
																		<div className="flex flex-col items-center text-center space-y-4">
																			<div
																				className={cn(
																					"h-20 w-20 rounded-full flex items-center justify-center mb-2",
																					validationResult.success ? "bg-green-100" : "bg-red-100",
																				)}
																			>
																				{validationResult.success ? (
																					<CheckCircle2 className="h-10 w-10 text-green-600" />
																				) : (
																					<XCircle className="h-10 w-10 text-red-600" />
																				)}
																			</div>

																			<h3
																				className={cn(
																					"text-2xl font-bold",
																					validationResult.success ? "text-green-700" : "text-red-700",
																				)}
																			>
																				{validationResult.success ? "¡Acceso Permitido!" : "Acceso Denegado"}
																			</h3>

																			<p className="text-gray-600 text-lg font-medium">{validationResult.message}</p>

																			{validationResult.success && (
																				<div className="bg-gray-50 rounded-xl p-4 w-full border border-gray-100 mt-2">
																					<p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">
																						Pasajero
																					</p>
																					<p className="text-xl font-bold text-gray-900 mb-3">
																						{validationResult.pasajero}
																					</p>

																					<div className="flex justify-center">
																						<Badge
																							variant="outline"
																							className="text-lg px-4 py-1 border-green-200 bg-green-50 text-green-800"
																						>
																							Asiento: {validationResult.asiento}
																						</Badge>
																					</div>
																				</div>
																			)}

																			<Button
																				className="w-full mt-4"
																				variant={validationResult.success ? "default" : "destructive"}
																				onClick={() => setValidationResult(null)}
																			>
																				Continuar Escaneando
																			</Button>
																		</div>
																	</div>
																</button>
															)}
														</div>
													</TabsContent>

													<TabsContent value="manifest" className="mt-4 focus-visible:ring-0">
														<div className="space-y-4">
															{/* Filters */}
															<div className="flex flex-col sm:flex-row gap-3">
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
																	<SelectTrigger className="w-full sm:w-[160px]">
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

															{/* Stats Bar */}
															<div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
																<Badge variant="secondary" className="whitespace-nowrap">
																	Total: {manifesto?.pasajeros.length || 0}
																</Badge>
																<Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 whitespace-nowrap">
																	Abordados: {manifesto?.pasajerosAbordados || 0}
																</Badge>
																<Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 whitespace-nowrap">
																	Pendientes: {manifesto?.pasajerosPendientes || 0}
																</Badge>
															</div>

															{/* Passenger List */}
															<div className="bg-white rounded-lg border shadow-sm overflow-hidden">
																<div className="max-h-[500px] overflow-y-auto divide-y">
																	{filteredPassengers.length === 0 ? (
																		<div className="p-8 text-center text-muted-foreground">
																			No se encontraron pasajeros
																		</div>
																	) : (
																		filteredPassengers.map((pasajero) => (
																			<div
																				key={pasajero.boletoID}
																				className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors active:bg-gray-100"
																			>
																				<div className="flex items-center gap-3 overflow-hidden">
																					<div
																						className={cn(
																							"h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
																							pasajero.estadoAbordaje === "Abordado"
																								? "bg-green-100 text-green-700"
																								: "bg-gray-100 text-gray-600",
																						)}
																					>
																						{pasajero.clienteNombre.charAt(0)}
																					</div>
																					<div className="min-w-0">
																						<p className="font-semibold text-sm truncate">{pasajero.clienteNombre}</p>
																						<div className="flex items-center gap-2 text-xs text-muted-foreground">
																							<Badge variant="outline" className="h-5 px-1.5 font-mono bg-white">
																								{pasajero.asientoAsignado}
																							</Badge>
																							<span className="truncate">{pasajero.clienteEmail}</span>
																						</div>
																					</div>
																				</div>
																				<div className="ml-2 shrink-0">
																					{pasajero.estadoAbordaje === "Abordado" ? (
																						<div className="bg-green-100 text-green-700 p-1.5 rounded-full">
																							<CheckCircle2 className="h-5 w-5" />
																						</div>
																					) : pasajero.estadoAbordaje === "NoShow" ? (
																						<Badge variant="destructive">No Show</Badge>
																					) : (
																						<Button
																							size="sm"
																							variant="outline"
																							className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
																							onClick={() => validateTicketMutation.mutate(pasajero.codigoQR)}
																							disabled={validateTicketMutation.isPending}
																						>
																							Validar
																						</Button>
																					)}
																					{pasajero.estadoAbordaje !== "Abordado" &&
																						pasajero.estadoAbordaje !== "NoShow" && (
																							<Button
																								size="sm"
																								variant="ghost"
																								className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700 ml-2"
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
																						)}
																				</div>
																			</div>
																		))
																	)}
																</div>
															</div>
														</div>
													</TabsContent>

													<Separator className="my-6" />

													<div className="flex justify-end pb-4">
														<Button
															size="lg"
															className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all"
															onClick={() => setIsFinalizeModalOpen(true)}
														>
															Finalizar Validación en Parada
														</Button>
													</div>
												</Tabs>
											)}
										</div>
									</CardContent>
								)}
							</Card>

							{/* Stats Grid */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
								<Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
									<CardContent className="p-4 flex flex-col items-center justify-center text-center">
										<p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
											Esperados
										</p>
										<p className="text-2xl font-bold text-gray-900">{currentStop?.totalPasajerosEsperados || 0}</p>
									</CardContent>
								</Card>
								<Card className="bg-green-50/50 border-green-100 shadow-sm hover:shadow-md transition-shadow">
									<CardContent className="p-4 flex flex-col items-center justify-center text-center">
										<p className="text-xs text-green-600 uppercase tracking-wider font-semibold mb-1">Abordados</p>
										<p className="text-2xl font-bold text-green-700">{currentStop?.totalPasajerosAbordados || 0}</p>
									</CardContent>
								</Card>
								<Card className="bg-orange-50/50 border-orange-100 shadow-sm hover:shadow-md transition-shadow">
									<CardContent className="p-4 flex flex-col items-center justify-center text-center">
										<p className="text-xs text-orange-600 uppercase tracking-wider font-semibold mb-1">Pendientes</p>
										<p className="text-2xl font-bold text-orange-700">{currentStop?.pasajerosPorValidar || 0}</p>
									</CardContent>
								</Card>
								<Card className="bg-red-50/50 border-red-100 shadow-sm hover:shadow-md transition-shadow">
									<CardContent className="p-4 flex flex-col items-center justify-center text-center">
										<p className="text-xs text-red-600 uppercase tracking-wider font-semibold mb-1">No Show</p>
										<p className="text-2xl font-bold text-red-700">{currentStop?.totalPasajerosNoShow || 0}</p>
									</CardContent>
								</Card>
							</div>
						</div>

						{/* Right Column: Trip Info & Timeline */}
						<div className="space-y-6">
							<Card className="border-none shadow-md">
								<CardHeader className="pb-3">
									<CardTitle className="text-base font-semibold flex items-center gap-2">
										<Bus className="h-4 w-4 text-primary" />
										Detalles del Viaje
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4 text-sm">
									<div className="flex justify-between py-2 border-b border-gray-100">
										<span className="text-muted-foreground">Chofer</span>
										<span className="font-medium">{viajeDetalle?.choferNombre || "No asignado"}</span>
									</div>
									<div className="flex justify-between py-2 border-b border-gray-100">
										<span className="text-muted-foreground">Unidad</span>
										<span className="font-medium">{viajeDetalle?.unidadPlacas}</span>
									</div>
									<div className="flex justify-between py-2 border-b border-gray-100">
										<span className="text-muted-foreground">Mi Rol</span>
										<Badge variant="secondary">{currentUserAssignment?.rolEnViaje || "Staff"}</Badge>
									</div>
									<div className="pt-2">
										<div className="flex justify-between items-center mb-2">
											<span className="text-muted-foreground">Progreso Global</span>
											<span className="font-bold text-primary">{checkinProgress.porcentajeAvance}%</span>
										</div>
										<div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
											<div
												className="h-full bg-primary transition-all duration-500 ease-out"
												style={{ width: `${checkinProgress.porcentajeAvance}%` }}
											/>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="flex-1 border-none shadow-md">
								<CardHeader className="pb-3">
									<CardTitle className="text-base font-semibold flex items-center gap-2">
										<Clock className="h-4 w-4 text-primary" />
										Itinerario
									</CardTitle>
								</CardHeader>
								<CardContent className="p-0">
									<div className="flex flex-col">
										{checkinProgress.paradas.map((parada, index) => (
											<div
												key={parada.paradaViajeID}
												className={cn(
													"flex gap-3 p-4 border-b last:border-0 transition-colors relative",
													parada.paradaViajeID === currentStop?.paradaViajeID ? "bg-blue-50/50" : "hover:bg-gray-50",
												)}
											>
												{parada.paradaViajeID === currentStop?.paradaViajeID && (
													<div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
												)}
												<div className="flex flex-col items-center gap-1 pt-1">
													<div
														className={cn(
															"h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm",
															parada.estado === "Completado"
																? "bg-green-500"
																: parada.estado === "Validando"
																	? "bg-blue-500 animate-pulse"
																	: "bg-gray-300",
														)}
													/>
													{index < checkinProgress.paradas.length - 1 && (
														<div className="w-0.5 flex-1 bg-gray-200 my-1" />
													)}
												</div>
												<div className="flex-1 space-y-1">
													<div className="flex items-center justify-between">
														<p
															className={cn(
																"font-medium text-sm",
																parada.paradaViajeID === currentStop?.paradaViajeID && "text-blue-700",
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
															variant="secondary"
															className={cn(
																"text-[10px] h-5 px-1.5",
																parada.estado === "Completado" && "bg-green-100 text-green-700 hover:bg-green-100",
																parada.estado === "Validando" && "bg-blue-100 text-blue-700 hover:bg-blue-100",
															)}
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
			</div>

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
							className="bg-slate-900 hover:bg-slate-800"
						>
							{finalizeValidationMutation.isPending ? "Finalizando..." : "Confirmar y Finalizar"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
