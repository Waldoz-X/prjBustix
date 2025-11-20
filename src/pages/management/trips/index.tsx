import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bus, Edit, Eye, Loader2, MapPin, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import eventosService, { type EventoDto } from "@/api/services/eventosService";
import { type UnidadResponseDto, unidadService } from "@/api/services/unidadService";
import viajesService, {
	type CreateViajeDto,
	type UpdateViajeDto,
	type ViajeDto,
	type ViajesFilterParams,
} from "@/api/services/viajesService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { handleApiError } from "@/utils/error-handler";

type FormDataType = {
	eventoID: number;
	plantillaRutaID: number;
	unidadID: number;
	choferID: string;
	tipoViaje: string;
	fechaSalida: string;
	horaSalida: string;
	fechaLlegadaEstimada: string;
	horaLlegadaEstimada: string;
	cupoTotal: number;
	precioBase: number;
	cargoServicio: number;
	ventasAbiertas: boolean;
	estatus?: number;
};

export default function ViajesPage() {
	const queryClient = useQueryClient();

	// state
	const [filters, setFilters] = useState<ViajesFilterParams>({});
	const [searchTerm, setSearchTerm] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [selectedViaje, setSelectedViaje] = useState<ViajeDto | null>(null);
	const [paradas, setParadas] = useState<any[]>([]);
	const [manifiesto, setManifiesto] = useState<any | null>(null);
	const [assignStaffOpen, setAssignStaffOpen] = useState(false);
	const [staffPayload, setStaffPayload] = useState({ staffID: "", rolEnViaje: "", observaciones: "" });

	// details UI
	const [detailsTab, setDetailsTab] = useState<"paradas" | "manifiesto">("paradas");
	const [detailsPage, setDetailsPage] = useState(1);
	const [detailsPageSize, setDetailsPageSize] = useState(5);
	const [manifiestoSearch, setManifiestoSearch] = useState("");

	// form state
	const [formData, setFormData] = useState<FormDataType>({
		eventoID: 0,
		plantillaRutaID: 0,
		unidadID: 0,
		choferID: "",
		tipoViaje: "Ida",
		fechaSalida: new Date().toISOString().split("T")[0],
		horaSalida: "19:00",
		fechaLlegadaEstimada: new Date().toISOString().split("T")[0],
		horaLlegadaEstimada: "23:00",
		cupoTotal: 50,
		precioBase: 500,
		cargoServicio: 50,
		ventasAbiertas: true,
	});
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	// queries
	const { data: viajes = [], isLoading } = useQuery<ViajeDto[]>({
		queryKey: ["viajes", filters, searchTerm],
		queryFn: () => viajesService.getAllViajes(filters),
	});
	const todayIso = new Date().toISOString().split("T")[0];
	const { data: eventos = [], isLoading: isLoadingEventos } = useQuery<EventoDto[]>({
		queryKey: ["eventos", todayIso],
		queryFn: () => eventosService.getAllEventos({ fechaDesde: todayIso, soloActivos: true }),
		staleTime: 1000 * 60 * 2,
	});
	const { data: unidadesResp, isLoading: isLoadingUnidades } = useQuery<
		{ success: boolean; message: string; data: UnidadResponseDto[] } | UnidadResponseDto[]
	>({ queryKey: ["unidades"], queryFn: () => unidadService.getAll(), staleTime: 1000 * 60 * 2 });
	const unidades: UnidadResponseDto[] = Array.isArray(unidadesResp) ? unidadesResp : (unidadesResp?.data ?? []);

	// Normalizar propiedades posibles devueltas por el API (minúsculas/variantes)
	const normalizedUnidades = (unidades || []).map((u: any) => ({
		Id: u.Id ?? u.id ?? u.unidadID ?? u.Uid ?? 0,
		Placas:
			u.Placas ??
			u.placas ??
			u.Placa ??
			u.placa ??
			u.numeroEconomico ??
			u.NumeroEconomico ??
			String(u.placas ?? u.Placas ?? ""),
		NumeroEconomico: u.NumeroEconomico ?? u.numeroEconomico ?? u.Numero ?? u.numero ?? "",
		Marca: u.Marca ?? u.marca ?? "",
		Modelo: u.Modelo ?? u.modelo ?? "",
		CapacidadAsientos: u.CapacidadAsientos ?? u.capacidadAsientos ?? 0,
		TieneClimatizacion: u.TieneClimatizacion ?? u.tieneClimatizacion ?? false,
		// propiedades con tilde accedidas por corchetes para evitar identifiers con caracteres no ASCII
		TieneBano: u["TieneBa\u00F1o"] ?? u.TieneBano ?? u["tieneBa\u00F1o"] ?? u.tieneBano ?? false,
		TieneWifi: u.TieneWifi ?? u.tieneWifi ?? false,
		UrlFoto: u.UrlFoto ?? u.urlFoto ?? u.photo ?? "",
		Estatus: u.Estatus ?? u.estatus ?? 0,
		FechaAlta: u.FechaAlta ?? u.fechaAlta ?? null,
	}));

	// mutations
	const createMutation = useMutation({
		mutationFn: (data: CreateViajeDto) => viajesService.createViaje(data),
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ["viajes"] });
			toast.success("Viaje creado");
			setIsCreateOpen(false);
			resetForm();
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			applyServerValidationErrors(err);
			toast.error("Error al crear viaje", { description: safe.userMessage });
		},
	});
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateViajeDto }) => viajesService.updateViaje(id, data),
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ["viajes"] });
			toast.success("Viaje actualizado");
			setIsEditOpen(false);
			setSelectedViaje(null);
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			applyServerValidationErrors(err);
			toast.error("Error al actualizar viaje", { description: safe.userMessage });
		},
	});
	const deleteMutation = useMutation({
		mutationFn: (id: number) => viajesService.deleteViaje(id),
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ["viajes"] });
			toast.success("Viaje eliminado");
			setIsDeleteOpen(false);
			setSelectedViaje(null);
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al eliminar viaje", { description: safe.userMessage });
		},
	});

	// helpers
	const forbiddenPattern = /(--|;|<|>|\/\*|\*\/|\$|\||\\|%|&)/;
	const hasForbiddenChars = (s?: string) => !!s && forbiddenPattern.test(s);
	const isDateTimeInPast = (date: string, time: string) => {
		if (!date || !time) return false;
		const timeStr = time.length === 5 ? `${time}:00` : time;
		return new Date(`${date}T${timeStr}Z`).getTime() < Date.now();
	};

	const validateAllFields = (data: FormDataType) => {
		const errors: Record<string, string> = {};
		if (!data.eventoID || data.eventoID <= 0) errors.eventoID = "El evento es requerido.";
		if (!data.plantillaRutaID || data.plantillaRutaID <= 0) errors.plantillaRutaID = "La ruta es requerida.";
		if (!data.unidadID || data.unidadID <= 0) errors.unidadID = "La unidad es requerida.";
		if (!data.choferID || data.choferID.trim() === "") errors.choferID = "El chofer es requerido.";
		else if (hasForbiddenChars(data.choferID)) errors.choferID = "Texto no permitido.";
		if (!data.fechaSalida) errors.fechaSalida = "La fecha de salida es requerida.";
		if (!data.horaSalida) errors.horaSalida = "La hora de salida es requerida.";
		if (data.fechaSalida && data.horaSalida && isDateTimeInPast(data.fechaSalida, data.horaSalida)) {
			errors.fechaSalida = "La fecha/hora no pueden ser pasadas.";
			errors.horaSalida = "La fecha/hora no pueden ser pasadas.";
		}
		if (!data.cupoTotal || data.cupoTotal <= 0 || data.cupoTotal > 100)
			errors.cupoTotal = "El cupo debe estar entre 1 y 100.";
		if (data.precioBase < 0) errors.precioBase = "El precio base no puede ser negativo.";
		if (data.cargoServicio < 0) errors.cargoServicio = "El cargo no puede ser negativo.";
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const applyServerValidationErrors = (err: any) => {
		if (!err || err.status !== 400) return false;
		const serverErrors: Record<string, string> = {};
		if (err.errors && typeof err.errors === "object") {
			for (const key of Object.keys(err.errors)) {
				const messages = err.errors[key];
				serverErrors[key] = Array.isArray(messages) ? String(messages[0]) : String(messages);
			}
		}
		setFormErrors((prev) => ({ ...prev, ...serverErrors }));
		const summary = serverErrors._general || Object.values(serverErrors)[0] || "Errores de validación";
		toast.error("Error de validación", { description: summary });
		return true;
	};

	const resetForm = () =>
		setFormData({
			eventoID: 0,
			plantillaRutaID: 0,
			unidadID: 0,
			choferID: "",
			tipoViaje: "Ida",
			fechaSalida: new Date().toISOString().split("T")[0],
			horaSalida: "19:00",
			fechaLlegadaEstimada: new Date().toISOString().split("T")[0],
			horaLlegadaEstimada: "23:00",
			cupoTotal: 50,
			precioBase: 500,
			cargoServicio: 50,
			ventasAbiertas: true,
		});

	const buildIsoDatetime = (date: string, time: string) => {
		const timeStr = time.length === 5 ? `${time}:00` : time;
		return new Date(`${date}T${timeStr}Z`).toISOString();
	};

	// handlers
	const handleCreate = () => {
		if (!validateAllFields(formData)) {
			toast.error("Corrige los errores");
			return;
		}
		const payload: CreateViajeDto = {
			eventoID: formData.eventoID,
			plantillaRutaID: formData.plantillaRutaID,
			unidadID: formData.unidadID,
			choferID: formData.choferID.trim(),
			tipoViaje: formData.tipoViaje,
			fechaSalida: buildIsoDatetime(formData.fechaSalida, formData.horaSalida),
			fechaLlegadaEstimada: buildIsoDatetime(formData.fechaLlegadaEstimada, formData.horaLlegadaEstimada),
			cupoTotal: formData.cupoTotal,
			precioBase: formData.precioBase,
			cargoServicio: formData.cargoServicio,
			ventasAbiertas: formData.ventasAbiertas,
		};
		createMutation.mutate(payload);
	};

	const handleEditOpen = (viaje: ViajeDto) => {
		setSelectedViaje(viaje);
		const fechaSalida = viaje.fechaSalida ? viaje.fechaSalida.split("T")[0] : new Date().toISOString().split("T")[0];
		const horaSalida = viaje.fechaSalida ? new Date(viaje.fechaSalida).toISOString().slice(11, 16) : "19:00";
		const fechaLleg = viaje.fechaLlegadaEstimada
			? viaje.fechaLlegadaEstimada.split("T")[0]
			: new Date().toISOString().split("T")[0];
		const horaLleg = viaje.fechaLlegadaEstimada
			? new Date(viaje.fechaLlegadaEstimada).toISOString().slice(11, 16)
			: "23:00";
		setFormData({
			eventoID: viaje.eventoID,
			plantillaRutaID: viaje.plantillaRutaID,
			unidadID: viaje.unidadID,
			choferID: viaje.choferID,
			tipoViaje: viaje.tipoViaje,
			fechaSalida,
			horaSalida,
			fechaLlegadaEstimada: fechaLleg,
			horaLlegadaEstimada: horaLleg,
			cupoTotal: viaje.cupoTotal,
			precioBase: viaje.precioBase,
			cargoServicio: viaje.cargoServicio,
			ventasAbiertas: viaje.ventasAbiertas,
			estatus: viaje.estatus,
		});
		setIsEditOpen(true);
	};

	const handleUpdate = () => {
		if (!selectedViaje) return;
		if (!validateAllFields(formData)) {
			toast.error("Corrige los errores");
			return;
		}
		const payload: UpdateViajeDto = {
			unidadID: formData.unidadID,
			choferID: formData.choferID.trim(),
			fechaSalida: buildIsoDatetime(formData.fechaSalida, formData.horaSalida),
			fechaLlegadaEstimada: buildIsoDatetime(formData.fechaLlegadaEstimada, formData.horaLlegadaEstimada),
			precioBase: formData.precioBase,
			cargoServicio: formData.cargoServicio,
			ventasAbiertas: formData.ventasAbiertas,
			estatus: formData.estatus,
		};
		updateMutation.mutate({ id: selectedViaje.viajeID, data: payload });
	};

	const handleDeleteConfirm = (viaje: ViajeDto) => {
		setSelectedViaje(viaje);
		setIsDeleteOpen(true);
	};
	const handleDeleteSubmit = () => {
		if (!selectedViaje) return;
		deleteMutation.mutate(selectedViaje.viajeID);
	};

	const handleOpenParadas = async (viaje: ViajeDto) => {
		setSelectedViaje(viaje);
		setDetailsTab("paradas");
		setDetailsPage(1);
		try {
			const data = await viajesService.getParadasViaje(viaje.viajeID);
			setParadas(Array.isArray(data) ? data : []);
			setIsDetailsOpen(true);
		} catch (e: any) {
			const safe = handleApiError(e);
			toast.error("Error al obtener paradas", { description: safe.userMessage });
		}
	};

	const handleOpenManifiesto = async (viaje: ViajeDto) => {
		setSelectedViaje(viaje);
		setDetailsTab("manifiesto");
		setDetailsPage(1);
		try {
			const m = await viajesService.getManifiesto(viaje.viajeID);
			setManifiesto(m);
			setIsDetailsOpen(true);
		} catch (e: any) {
			const safe = handleApiError(e);
			toast.error("Error al obtener manifiesto", { description: safe.userMessage });
		}
	};

	const handleOpenAssignStaff = (viaje: ViajeDto) => {
		setSelectedViaje(viaje);
		setStaffPayload({ staffID: "", rolEnViaje: "", observaciones: "" });
		setAssignStaffOpen(true);
	};
	const handleAssignStaff = async () => {
		if (!selectedViaje) return;
		try {
			await viajesService.assignStaff(selectedViaje.viajeID, staffPayload);
			toast.success("Staff asignado");
			setAssignStaffOpen(false);
		} catch (e: any) {
			const safe = handleApiError(e);
			toast.error("Error al asignar staff", { description: safe.userMessage });
		}
	};

	const resetDetailsState = () => {
		setParadas([]);
		setManifiesto(null);
		setDetailsPage(1);
		setManifiestoSearch("");
		setDetailsTab("paradas");
	};

	const formatDate = (d?: string) => {
		if (!d) return "";
		try {
			return new Date(d).toLocaleString("es-MX");
		} catch {
			return String(d);
		}
	};
	const formatCurrency = (amt?: number) => {
		if (amt === undefined || amt === null) return "";
		return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amt);
	};

	const filteredViajes = (viajes || []).filter(
		(v) =>
			(v.codigoViaje || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
			(v.eventoNombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
			(v.rutaNombre || "").toLowerCase().includes(searchTerm.toLowerCase()),
	);

	// (formErrors se muestra directamente cuando es necesario)

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Bus className="h-8 w-8" /> Gestión de Viajes
					</h1>
					<p className="text-muted-foreground mt-2">Administra viajes programados y sus paradas</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						onClick={() => {
							setFormErrors({});
							setIsCreateOpen(true);
						}}
					>
						<Plus className="mr-2 h-4 w-4" /> Crear Viaje
					</Button>
					{formErrors && Object.keys(formErrors).length > 0 ? (
						<Badge variant="destructive">{Object.keys(formErrors).length}</Badge>
					) : null}
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Filtros</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<Label htmlFor="search">
								<Search className="inline mr-2 h-4 w-4" /> Buscar
							</Label>
							<Input
								id="search"
								placeholder="Código, evento, ruta..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="estatusFilter">Estado</Label>
							<Select
								value={filters.estatus?.toString() || "all"}
								onValueChange={(val) =>
									setFilters({ ...filters, estatus: val === "all" ? undefined : Number.parseInt(val) })
								}
							>
								<SelectTrigger id="estatusFilter">
									<SelectValue placeholder="Todos" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos</SelectItem>
									<SelectItem value="1">Programado</SelectItem>
									<SelectItem value="2">En curso</SelectItem>
									<SelectItem value="3">Completado</SelectItem>
									<SelectItem value="4">Cancelado</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-end">
							<div className="text-sm text-muted-foreground">
								Mostrando <span className="font-bold">{filteredViajes.length}</span> viajes
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Lista de Viajes</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center min-h-[200px]">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : filteredViajes.length > 0 ? (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Código</TableHead>
										<TableHead>Evento</TableHead>
										<TableHead>Ruta</TableHead>
										<TableHead>Fecha Salida</TableHead>
										<TableHead>Tipo</TableHead>
										<TableHead className="text-center">Disponibles</TableHead>
										<TableHead className="text-right">Precio</TableHead>
										<TableHead className="text-center">Estado</TableHead>
										<TableHead className="text-right">Acciones</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredViajes.map((v) => (
										<TableRow key={v.viajeID}>
											<TableCell className="font-medium">{v.codigoViaje}</TableCell>
											<TableCell>
												<div className="flex flex-col">
													<span className="font-medium">{v.eventoNombre}</span>
													<span className="text-xs text-muted-foreground">{formatDate(v.eventoFecha)}</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<MapPin className="h-3 w-3" />
													<span className="text-sm">
														{v.ciudadOrigen} → {v.ciudadDestino}
													</span>
												</div>
											</TableCell>
											<TableCell>{formatDate(v.fechaSalida)}</TableCell>
											<TableCell>
												<Badge variant="outline">{v.tipoViaje}</Badge>
											</TableCell>
											<TableCell className="text-center">
												<Badge variant="secondary">
													{v.asientosDisponibles}/{v.cupoTotal}
												</Badge>
											</TableCell>
											<TableCell className="text-right">{formatCurrency(v.precioBase)}</TableCell>
											<TableCell className="text-center">
												<Badge variant={v.estatus === 1 ? "default" : v.estatus === 2 ? "default" : "secondary"}>
													{v.estatusNombre}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Acciones</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => {
																setSelectedViaje(v);
																handleOpenParadas(v);
															}}
														>
															<Eye className="mr-2 h-4 w-4" /> Ver paradas
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleOpenManifiesto(v)}>
															<Eye className="mr-2 h-4 w-4" /> Manifiesto
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleEditOpen(v)}>
															<Edit className="mr-2 h-4 w-4" /> Editar
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleOpenAssignStaff(v)}>
															<Edit className="mr-2 h-4 w-4" /> Asignar Staff
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={() => handleDeleteConfirm(v)} className="text-destructive">
															<Trash2 className="mr-2 h-4 w-4" /> Eliminar
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center min-h-[200px] text-center">
							<Bus className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">No hay viajes</h3>
							<p className="text-muted-foreground mb-4">Comienza creando tu primer viaje</p>
							<Button onClick={() => setIsCreateOpen(true)}>
								<Plus className="mr-2 h-4 w-4" /> Crear Viaje
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create dialog */}
			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Crear Viaje</DialogTitle>
						<DialogDescription>Rellena los campos mínimos para crear un viaje</DialogDescription>
					</DialogHeader>

					<div className="grid gap-3 py-4">
						<Label>Evento</Label>
						<Select
							value={formData.eventoID ? String(formData.eventoID) : ""}
							onValueChange={(val) => setFormData((f) => ({ ...f, eventoID: Number(val) }))}
						>
							<SelectTrigger>
								<SelectValue placeholder="Selecciona evento" />
							</SelectTrigger>
							<SelectContent>
								{isLoadingEventos ? (
									<SelectItem value="0" disabled>
										Cargando...
									</SelectItem>
								) : (
									eventos.map((ev) => (
										<SelectItem key={ev.eventoID} value={String(ev.eventoID)}>
											{ev.nombre}
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>

						<div>
							<Label>Ruta (plantillaRutaID)</Label>
							<Input
								type="number"
								value={formData.plantillaRutaID || ""}
								onChange={(e) => setFormData((f) => ({ ...f, plantillaRutaID: Number(e.target.value) }))}
								placeholder="Ingresa el ID de la plantilla de ruta"
							/>
							{formErrors.plantillaRutaID ? (
								<p className="text-sm text-destructive mt-1">{formErrors.plantillaRutaID}</p>
							) : null}
						</div>

						<Label>Unidad</Label>
						<Select
							value={formData.unidadID ? String(formData.unidadID) : ""}
							onValueChange={(val) => setFormData((f) => ({ ...f, unidadID: Number(val) }))}
						>
							<SelectTrigger>
								<SelectValue placeholder="Selecciona unidad" />
							</SelectTrigger>
							<SelectContent>
								{isLoadingUnidades ? (
									<SelectItem value="0" disabled>
										Cargando...
									</SelectItem>
								) : (
									normalizedUnidades.map((u) => (
										<SelectItem key={u.Id} value={String(u.Id)}>
											{u.Placas || u.NumeroEconomico}
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>

						<Label>Fecha salida</Label>
						<div className="flex gap-2">
							<Input
								type="date"
								value={formData.fechaSalida}
								onChange={(e) => setFormData((f) => ({ ...f, fechaSalida: e.target.value }))}
							/>
							<Input
								type="time"
								value={formData.horaSalida}
								onChange={(e) => setFormData((f) => ({ ...f, horaSalida: e.target.value }))}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsCreateOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleCreate} disabled={createMutation.status === "pending"}>
							{createMutation.status === "pending" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Crear
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit dialog */}
			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Editar Viaje</DialogTitle>
						<DialogDescription>Modifica la información del viaje</DialogDescription>
					</DialogHeader>

					<div className="grid gap-3 py-4">
						<Label>Unidad</Label>
						<Select
							value={formData.unidadID ? String(formData.unidadID) : ""}
							onValueChange={(val) => setFormData((f) => ({ ...f, unidadID: Number(val) }))}
						>
							<SelectTrigger>
								<SelectValue placeholder="Selecciona unidad" />
							</SelectTrigger>
							<SelectContent>
								{isLoadingUnidades ? (
									<SelectItem value="0" disabled>
										Cargando...
									</SelectItem>
								) : (
									normalizedUnidades.map((u) => (
										<SelectItem key={u.Id} value={String(u.Id)}>
											{u.Placas || u.NumeroEconomico}
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>

						<Label>Chofer</Label>
						<Input
							value={formData.choferID}
							onChange={(e) => setFormData((f) => ({ ...f, choferID: e.target.value }))}
						/>

						<Label>Fecha salida</Label>
						<div className="flex gap-2">
							<Input
								type="date"
								value={formData.fechaSalida}
								onChange={(e) => setFormData((f) => ({ ...f, fechaSalida: e.target.value }))}
							/>
							<Input
								type="time"
								value={formData.horaSalida}
								onChange={(e) => setFormData((f) => ({ ...f, horaSalida: e.target.value }))}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleUpdate} disabled={updateMutation.status === "pending"}>
							{updateMutation.status === "pending" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Actualizar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete dialog */}
			<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Eliminar Viaje</DialogTitle>
						<DialogDescription>¿Estás seguro?</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={handleDeleteSubmit} disabled={deleteMutation.status === "pending"}>
							{deleteMutation.status === "pending" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Eliminar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Assign staff dialog */}
			<Dialog open={assignStaffOpen} onOpenChange={setAssignStaffOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Asignar Staff</DialogTitle>
						<DialogDescription>Asignar staff al viaje {selectedViaje?.codigoViaje}</DialogDescription>
					</DialogHeader>
					<div className="grid gap-2 py-2">
						<Label>Staff ID</Label>
						<Input
							value={staffPayload.staffID}
							onChange={(e) => setStaffPayload((p) => ({ ...p, staffID: e.target.value }))}
						/>
						<Label>Rol</Label>
						<Input
							value={staffPayload.rolEnViaje}
							onChange={(e) => setStaffPayload((p) => ({ ...p, rolEnViaje: e.target.value }))}
						/>
						<Label>Observaciones</Label>
						<Input
							value={staffPayload.observaciones}
							onChange={(e) => setStaffPayload((p) => ({ ...p, observaciones: e.target.value }))}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setAssignStaffOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleAssignStaff}>Asignar</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Details dialog (paradas / manifiesto) */}
			<Dialog
				open={isDetailsOpen}
				onOpenChange={(open) => {
					if (!open) resetDetailsState();
					setIsDetailsOpen(open);
				}}
			>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>{detailsTab === "manifiesto" ? "Manifiesto" : "Paradas"}</DialogTitle>
						<DialogDescription>{selectedViaje ? selectedViaje.codigoViaje : ""}</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<div className="flex gap-2 mb-3">
							<Button variant={detailsTab === "paradas" ? "default" : "ghost"} onClick={() => setDetailsTab("paradas")}>
								Paradas
							</Button>
							<Button
								variant={detailsTab === "manifiesto" ? "default" : "ghost"}
								onClick={() => setDetailsTab("manifiesto")}
							>
								Manifiesto
							</Button>
						</div>

						{detailsTab === "paradas" ? (
							<div>
								{paradas.length === 0 ? (
									<p className="text-muted-foreground">No se encontraron paradas.</p>
								) : (
									<div>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>#</TableHead>
													<TableHead>Ubicación</TableHead>
													<TableHead>Ciudad</TableHead>
													<TableHead>Hora Estimada</TableHead>
													<TableHead className="text-right">Pasajeros</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{paradas.slice((detailsPage - 1) * detailsPageSize, detailsPage * detailsPageSize).map((p) => (
													<TableRow key={p.paradaID}>
														<TableCell>{p.orden}</TableCell>
														<TableCell>{p.ubicacionNombre}</TableCell>
														<TableCell>{p.ciudad}</TableCell>
														<TableCell>
															{p.horaEstimadaLlegada ? new Date(p.horaEstimadaLlegada).toLocaleString() : "-"}
														</TableCell>
														<TableCell className="text-right">
															{p.pasajerosSuben}/{p.pasajerosBajan}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>

										<div className="flex items-center justify-between pt-3">
											<div className="text-sm text-muted-foreground">
												Mostrando {(detailsPage - 1) * detailsPageSize + 1} -{" "}
												{Math.min(detailsPage * detailsPageSize, paradas.length)} de {paradas.length}
											</div>
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													disabled={detailsPage === 1}
													onClick={() => setDetailsPage((p) => Math.max(1, p - 1))}
												>
													Anterior
												</Button>
												<Button
													variant="outline"
													size="sm"
													disabled={detailsPage * detailsPageSize >= paradas.length}
													onClick={() => setDetailsPage((p) => p + 1)}
												>
													Siguiente
												</Button>
											</div>
										</div>
									</div>
								)}
							</div>
						) : (
							<div>
								<div className="flex items-center justify-between mb-3">
									<Input
										placeholder="Buscar..."
										value={manifiestoSearch}
										onChange={(e) => {
											setManifiestoSearch(e.target.value);
											setDetailsPage(1);
										}}
									/>
									<select
										value={detailsPageSize}
										onChange={(e) => {
											setDetailsPageSize(Number(e.target.value));
											setDetailsPage(1);
										}}
										className="border rounded px-2 py-1"
									>
										<option value={5}>5</option>
										<option value={10}>10</option>
										<option value={20}>20</option>
									</select>
								</div>

								{!manifiesto || !manifiesto.pasajeros || manifiesto.pasajeros.length === 0 ? (
									<p className="text-muted-foreground">No hay pasajeros en el manifiesto.</p>
								) : (
									<div>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Asiento</TableHead>
													<TableHead>Nombre</TableHead>
													<TableHead>Email</TableHead>
													<TableHead>Teléfono</TableHead>
													<TableHead>Estado</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{manifiesto.pasajeros
													.filter((p: any) => {
														if (!manifiestoSearch) return true;
														const q = manifiestoSearch.toLowerCase();
														return (
															String(p.clienteNombre || "")
																.toLowerCase()
																.includes(q) ||
															String(p.asientoAsignado || "")
																.toLowerCase()
																.includes(q)
														);
													})
													.slice((detailsPage - 1) * detailsPageSize, detailsPage * detailsPageSize)
													.map((p: any) => (
														<TableRow key={p.boletoID}>
															<TableCell>{p.asientoAsignado}</TableCell>
															<TableCell>{p.clienteNombre}</TableCell>
															<TableCell>{p.clienteEmail}</TableCell>
															<TableCell>{p.clienteTelefono}</TableCell>
															<TableCell>{p.estadoBoleto}</TableCell>
														</TableRow>
													))}
											</TableBody>
										</Table>

										<div className="flex items-center justify-between pt-3">
											<div className="text-sm text-muted-foreground">
												Mostrando {(detailsPage - 1) * detailsPageSize + 1} -{" "}
												{Math.min(detailsPage * detailsPageSize, manifiesto.pasajeros.length)} de{" "}
												{manifiesto.pasajeros.length}
											</div>
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													disabled={detailsPage === 1}
													onClick={() => setDetailsPage((p) => Math.max(1, p - 1))}
												>
													Anterior
												</Button>
												<Button
													variant="outline"
													size="sm"
													disabled={detailsPage * detailsPageSize >= manifiesto.pasajeros.length}
													onClick={() => setDetailsPage((p) => p + 1)}
												>
													Siguiente
												</Button>
											</div>
										</div>
									</div>
								)}
							</div>
						)}
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsDetailsOpen(false);
								resetDetailsState();
							}}
						>
							Cerrar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
