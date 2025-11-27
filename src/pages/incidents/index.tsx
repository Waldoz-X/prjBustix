import { useMutation, useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Clock,
	Edit2,
	Eye,
	FileText,
	Filter,
	Plus,
	Search,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import incidenciasService, {
	type CreateIncidenciaDto,
	type IncidenciaDetalleDto,
	type IncidenciasFiltros,
	type UpdateIncidenciaDto,
} from "@/api/services/incidenciasService";
import userService from "@/api/services/userService";
import { useHasRole } from "@/hooks/use-session";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Textarea } from "@/ui/textarea";

export default function IncidentsPage() {
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const isOperator = useHasRole("Operator");
	const isStaff = useHasRole("Staff");
	const allowed = isAdmin || isManager || isOperator || isStaff;
	const canManage = isAdmin || isManager;

	// Filters State
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("todos");
	const [priorityFilter, setPriorityFilter] = useState<string>("todos");
	const [typeFilter, setTypeFilter] = useState<string>("todos");
	const [showFilters, setShowFilters] = useState(false);

	// Pagination
	const [page, setPage] = useState(1);
	const pageSize = 15;

	// Modals
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [selectedIncident, setSelectedIncident] = useState<IncidenciaDetalleDto | null>(null);

	// Form States
	const [createForm, setCreateForm] = useState<CreateIncidenciaDto>({
		tipoIncidenciaID: 0,
		titulo: "",
		descripcion: "",
		prioridad: "Media",
	});

	const [updateForm, setUpdateForm] = useState<UpdateIncidenciaDto>({
		estatus: 0,
		prioridad: "Media",
		notas: "",
		asignadoA: "",
	});

	// Form Validation
	const isCreateFormValid = useMemo(() => {
		return (
			createForm.tipoIncidenciaID > 0 &&
			createForm.titulo.trim().length >= 10 &&
			createForm.descripcion.trim().length >= 10
		);
	}, [createForm]);

	// Build filters for API
	const filters: IncidenciasFiltros = useMemo(() => {
		const f: IncidenciasFiltros = {
			Busqueda: searchTerm || undefined,
			Pagina: page,
			TamanoPagina: pageSize,
		};
		if (statusFilter !== "todos") f.Estatus = Number(statusFilter);
		if (priorityFilter !== "todos") f.Prioridad = priorityFilter;
		if (typeFilter !== "todos") f.TipoIncidenciaID = Number(typeFilter);
		return f;
	}, [searchTerm, statusFilter, priorityFilter, typeFilter, page]);

	// Queries
	const { data: stats, refetch: refetchStats } = useQuery({
		queryKey: ["incidencias-stats"],
		queryFn: incidenciasService.getEstadisticas,
		enabled: allowed,
	});

	const {
		data: incidents = [],
		isLoading,
		refetch: refetchIncidents,
	} = useQuery({
		queryKey: ["incidencias", filters],
		queryFn: () => incidenciasService.getAll(filters),
		enabled: allowed,
	});

	const { data: incidentTypes = [] } = useQuery({
		queryKey: ["incident-types"],
		queryFn: incidenciasService.getTipos,
		enabled: allowed,
	});

	const { data: users = [] } = useQuery({
		queryKey: ["users"],
		queryFn: userService.getAllUsers,
		enabled: allowed,
	});

	// Mutations
	const createMutation = useMutation({
		mutationFn: (data: CreateIncidenciaDto) => incidenciasService.create(data),
		onSuccess: () => {
			toast.success("Incidencia creada correctamente");
			setIsCreateModalOpen(false);
			resetCreateForm();
			refetchIncidents();
			refetchStats();
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al crear incidencia");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateIncidenciaDto }) => incidenciasService.update(id, data),
		onSuccess: () => {
			toast.success("Incidencia actualizada correctamente");
			setIsUpdateModalOpen(false);
			setSelectedIncident(null);
			refetchIncidents();
			refetchStats();
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al actualizar incidencia");
		},
	});

	// Functions
	const resetCreateForm = () => {
		setCreateForm({
			tipoIncidenciaID: 0,
			titulo: "",
			descripcion: "",
			prioridad: "Media",
		});
	};

	const openDetailModal = async (id: number) => {
		try {
			const incident = await incidenciasService.getById(id);
			setSelectedIncident(incident);
			setIsDetailModalOpen(true);
		} catch (error: any) {
			toast.error(error.message || "Error al cargar detalle");
		}
	};

	const openUpdateModal = (incident: IncidenciaDetalleDto) => {
		setSelectedIncident(incident);
		setUpdateForm({
			estatus: incident.estatus,
			prioridad: incident.prioridad as "Baja" | "Media" | "Alta" | "Crítica",
			notas: "",
			asignadoA: incident.asignadoA || "",
		});
		setIsUpdateModalOpen(true);
	};

	const getPriorityBadge = (prioridad: string) => {
		if (prioridad === "Baja")
			return (
				<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
					Baja
				</Badge>
			);
		if (prioridad === "Media")
			return (
				<Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
					Media
				</Badge>
			);
		if (prioridad === "Alta")
			return (
				<Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
					Alta
				</Badge>
			);
		return (
			<Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
				Crítica
			</Badge>
		);
	};

	const getStatusBadge = (estatus: number, estatusNombre: string) => {
		if (estatus === 0)
			return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">{estatusNombre}</Badge>;
		if (estatus === 1) return <Badge className="bg-blue-100 text-blue-700 border-blue-200">{estatusNombre}</Badge>;
		if (estatus === 2) return <Badge className="bg-green-100 text-green-700 border-green-200">{estatusNombre}</Badge>;
		if (estatus === 3) return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{estatusNombre}</Badge>;
		return <Badge className="bg-red-100 text-red-700 border-red-200">{estatusNombre}</Badge>;
	};

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

	return (
		<div className="space-y-6 p-6 bg-gray-50 min-h-screen">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
						<AlertTriangle className="h-8 w-8 text-primary" />
						Gestión de Incidencias
					</h1>
					<p className="text-muted-foreground mt-1">Reporte y seguimiento de incidencias</p>
				</div>
				<Button onClick={() => setIsCreateModalOpen(true)} className="shadow-sm">
					<Plus className="mr-2 h-4 w-4" />
					Reportar Incidencia
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
						<FileText className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalIncidencias || 0}</div>
						<p className="text-xs text-muted-foreground mt-1">Incidencias registradas</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Abiertas</CardTitle>
						<AlertCircle className="h-4 w-4 text-yellow-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.abiertas || 0}</div>
						<p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">En Proceso</CardTitle>
						<Clock className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.enProceso || 0}</div>
						<p className="text-xs text-muted-foreground mt-1">En seguimiento</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Resueltas</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.resueltas || 0}</div>
						<p className="text-xs text-muted-foreground mt-1">Completadas</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters & List */}
			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
						<CardTitle className="text-lg">Listado de Incidencias</CardTitle>
						<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
							<div className="relative flex-1 md:w-[300px]">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Buscar incidencias..."
									value={searchTerm}
									onChange={(e) => {
										setSearchTerm(e.target.value);
										setPage(1);
									}}
									className="pl-9"
								/>
							</div>
							<Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
								<Filter className="mr-2 h-4 w-4" />
								Filtros
								{(statusFilter !== "todos" || priorityFilter !== "todos" || typeFilter !== "todos") && (
									<Badge
										variant="destructive"
										className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
									>
										{
											[statusFilter !== "todos", priorityFilter !== "todos", typeFilter !== "todos"].filter(Boolean)
												.length
										}
									</Badge>
								)}
							</Button>
						</div>
					</div>

					{/* Advanced Filters */}
					{showFilters && (
						<div className="grid gap-4 md:grid-cols-3 mt-4 pt-4 border-t">
							<div className="space-y-2">
								<Label className="text-sm font-medium">Estado</Label>
								<Select
									value={statusFilter}
									onValueChange={(val) => {
										setStatusFilter(val);
										setPage(1);
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="todos">Todos</SelectItem>
										<SelectItem value="0">Abierta</SelectItem>
										<SelectItem value="1">En Proceso</SelectItem>
										<SelectItem value="2">Resuelta</SelectItem>
										<SelectItem value="3">Cerrada</SelectItem>
										<SelectItem value="4">Cancelada</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label className="text-sm font-medium">Prioridad</Label>
								<Select
									value={priorityFilter}
									onValueChange={(val) => {
										setPriorityFilter(val);
										setPage(1);
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="todos">Todas</SelectItem>
										<SelectItem value="Baja">Baja</SelectItem>
										<SelectItem value="Media">Media</SelectItem>
										<SelectItem value="Alta">Alta</SelectItem>
										<SelectItem value="Crítica">Crítica</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label className="text-sm font-medium">Tipo</Label>
								<Select
									value={typeFilter}
									onValueChange={(val) => {
										setTypeFilter(val);
										setPage(1);
									}}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="todos">Todos</SelectItem>
										{incidentTypes.map((type) => (
											<SelectItem key={type.tipoIncidenciaID} value={String(type.tipoIncidenciaID)}>
												{type.nombre}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{(statusFilter !== "todos" || priorityFilter !== "todos" || typeFilter !== "todos") && (
								<div className="md:col-span-3">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setStatusFilter("todos");
											setPriorityFilter("todos");
											setTypeFilter("todos");
											setPage(1);
										}}
										className="w-full md:w-auto"
									>
										<X className="mr-2 h-4 w-4" />
										Limpiar Filtros
									</Button>
								</div>
							)}
						</div>
					)}
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Código</TableHead>
									<TableHead>Título</TableHead>
									<TableHead>Tipo</TableHead>
									<TableHead>Prioridad</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead>Reportador</TableHead>
									<TableHead>Asignado</TableHead>
									<TableHead className="text-right">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={8} className="h-24 text-center">
											<div className="flex items-center justify-center">
												<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
											</div>
										</TableCell>
									</TableRow>
								) : incidents.length === 0 ? (
									<TableRow>
										<TableCell colSpan={8} className="h-32 text-center">
											<div className="flex flex-col items-center justify-center gap-2 py-8">
												<AlertCircle className="h-12 w-12 text-muted-foreground/50" />
												<p className="text-muted-foreground font-medium">No se encontraron incidencias</p>
												<p className="text-sm text-muted-foreground">
													{searchTerm ? "Intenta ajustar tu búsqueda" : "No hay incidencias registradas"}
												</p>
											</div>
										</TableCell>
									</TableRow>
								) : (
									incidents.map((incident) => {
										// DEBUG: Check data
										if (incident.incidenciaID === incidents[0].incidenciaID) {
											console.log("Debug Incident:", incident);
											console.log("Debug Users count:", users.length);
											if (users.length > 0) console.log("Debug First User:", users[0]);
										}
										return (
											<TableRow key={incident.incidenciaID} className="hover:bg-gray-50/50 cursor-pointer">
												<TableCell className="font-mono text-xs">{incident.codigoIncidencia}</TableCell>
												<TableCell className="font-medium max-w-[200px] truncate">{incident.titulo}</TableCell>
												<TableCell>
													<Badge variant="outline">{incident.tipoIncidenciaNombre}</Badge>
												</TableCell>
												<TableCell>{getPriorityBadge(incident.prioridad)}</TableCell>
												<TableCell>{getStatusBadge(incident.estatus, incident.estatusNombre)}</TableCell>
												<TableCell className="text-sm">{incident.reportadorNombre || "-"}</TableCell>
												<TableCell className="text-sm">
													<div>
														{incident.asignadoNombre ||
															users.find((u) => u.id === incident.asignadoA)?.nombreCompleto ||
															"-"}
													</div>
													{(incident.asignadoEmail || users.find((u) => u.id === incident.asignadoA)?.email) && (
														<div className="text-xs text-muted-foreground">
															{incident.asignadoEmail || users.find((u) => u.id === incident.asignadoA)?.email}
														</div>
													)}
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button variant="ghost" size="sm" onClick={() => openDetailModal(incident.incidenciaID)}>
															<Eye className="h-4 w-4" />
														</Button>
														{canManage && (
															<Button
																variant="ghost"
																size="sm"
																onClick={async () => {
																	const full = await incidenciasService.getById(incident.incidenciaID);
																	openUpdateModal(full);
																}}
															>
																<Edit2 className="h-4 w-4" />
															</Button>
														)}
													</div>
												</TableCell>
											</TableRow>
										);
									})
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{incidents.length > 0 && (
						<div className="flex items-center justify-between mt-4">
							<p className="text-sm text-muted-foreground">Mostrando {incidents.length} incidencia(s)</p>
							<div className="flex items-center gap-2">
								<Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<span className="text-sm">Página {page}</span>
								<Button
									variant="outline"
									size="sm"
									disabled={incidents.length < pageSize}
									onClick={() => setPage(page + 1)}
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create Modal */}
			<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Reportar Nueva Incidencia</DialogTitle>
						<DialogDescription>Complete la información para reportar una nueva incidencia.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="tipo">
								Tipo de Incidencia <span className="text-destructive">*</span>
							</Label>
							<Select
								value={createForm.tipoIncidenciaID === 0 ? "" : String(createForm.tipoIncidenciaID)}
								onValueChange={(val) => setCreateForm({ ...createForm, tipoIncidenciaID: Number(val) })}
							>
								<SelectTrigger id="tipo">
									<SelectValue placeholder="Seleccionar tipo..." />
								</SelectTrigger>
								<SelectContent>
									{incidentTypes.map((type) => (
										<SelectItem key={type.tipoIncidenciaID} value={String(type.tipoIncidenciaID)}>
											{type.nombre}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="titulo">
								Título <span className="text-destructive">*</span>
								<span className="text-xs text-muted-foreground ml-2">({createForm.titulo.length}/100)</span>
							</Label>
							<Input
								id="titulo"
								value={createForm.titulo}
								onChange={(e) => setCreateForm({ ...createForm, titulo: e.target.value })}
								placeholder="Resumen breve de la incidencia"
								maxLength={100}
							/>
							{createForm.titulo.length > 0 && createForm.titulo.length < 10 && (
								<p className="text-xs text-destructive">Mínimo 10 caracteres</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="descripcion">
								Descripción <span className="text-destructive">*</span>
								<span className="text-xs text-muted-foreground ml-2">({createForm.descripcion.length}/500)</span>
							</Label>
							<Textarea
								id="descripcion"
								value={createForm.descripcion}
								onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
								placeholder="Describa detalladamente la incidencia"
								maxLength={500}
								rows={4}
							/>
							{createForm.descripcion.length > 0 && createForm.descripcion.length < 10 && (
								<p className="text-xs text-destructive">Mínimo 10 caracteres</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label htmlFor="prioridad">
								Prioridad <span className="text-destructive">*</span>
							</Label>
							<Select
								value={createForm.prioridad}
								onValueChange={(val) =>
									setCreateForm({ ...createForm, prioridad: val as "Baja" | "Media" | "Alta" | "Crítica" })
								}
							>
								<SelectTrigger id="prioridad">
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
						<Button
							variant="outline"
							onClick={() => {
								setIsCreateModalOpen(false);
								resetCreateForm();
							}}
							disabled={createMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							onClick={() => createMutation.mutate(createForm)}
							disabled={!isCreateFormValid || createMutation.isPending}
						>
							{createMutation.isPending ? "Creando..." : "Reportar Incidencia"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Detail Modal */}
			<Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
				<DialogContent className="sm:max-w-[700px]">
					<DialogHeader>
						<DialogTitle>Detalle de Incidencia</DialogTitle>
						<DialogDescription>Información completa de la incidencia</DialogDescription>
					</DialogHeader>
					{selectedIncident ? (
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-xs text-muted-foreground">Código</Label>
									<p className="font-mono text-sm font-medium">{selectedIncident.codigoIncidencia}</p>
								</div>
								<div>
									<Label className="text-xs text-muted-foreground">Estado</Label>
									<div className="mt-1">{getStatusBadge(selectedIncident.estatus, selectedIncident.estatusNombre)}</div>
								</div>
							</div>

							<div>
								<Label className="text-xs text-muted-foreground">Título</Label>
								<p className="font-medium">{selectedIncident.titulo}</p>
							</div>

							<div>
								<Label className="text-xs text-muted-foreground">Descripción</Label>
								<p className="text-sm whitespace-pre-wrap">{selectedIncident.descripcion}</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-xs text-muted-foreground">Tipo</Label>
									<p className="text-sm">{selectedIncident.tipoIncidenciaNombre}</p>
								</div>
								<div>
									<Label className="text-xs text-muted-foreground">Prioridad</Label>
									<div className="mt-1">{getPriorityBadge(selectedIncident.prioridad)}</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-xs text-muted-foreground">Reportado por</Label>
									<p className="text-sm">{selectedIncident.reportadorNombre}</p>
									<p className="text-xs text-muted-foreground">{selectedIncident.reportadorEmail}</p>
								</div>
								{selectedIncident.asignadoNombre && (
									<div>
										<Label className="text-xs text-muted-foreground">Asignado a</Label>
										<p className="text-sm">{selectedIncident.asignadoNombre}</p>
										<p className="text-xs text-muted-foreground">{selectedIncident.asignadoEmail}</p>
									</div>
								)}
							</div>

							{selectedIncident.viajeCodigoViaje && (
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label className="text-xs text-muted-foreground">Viaje</Label>
										<p className="text-sm font-mono">{selectedIncident.viajeCodigoViaje}</p>
									</div>
									{selectedIncident.unidadPlacas && (
										<div>
											<Label className="text-xs text-muted-foreground">Unidad</Label>
											<p className="text-sm font-mono">{selectedIncident.unidadPlacas}</p>
										</div>
									)}
								</div>
							)}

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-xs text-muted-foreground">Fecha de Reporte</Label>
									<p className="text-sm">{new Date(selectedIncident.fechaReporte).toLocaleString()}</p>
								</div>
								{selectedIncident.fechaResolucion && (
									<div>
										<Label className="text-xs text-muted-foreground">Fecha de Resolución</Label>
										<p className="text-sm">{new Date(selectedIncident.fechaResolucion).toLocaleString()}</p>
									</div>
								)}
							</div>
						</div>
					) : null}
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
							Cerrar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Update Modal */}
			<Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Actualizar Incidencia</DialogTitle>
						<DialogDescription>Modificar estado, prioridad o agregar notas</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="update-estatus">Estado</Label>
							<Select
								value={String(updateForm.estatus || 0)}
								onValueChange={(val) => setUpdateForm({ ...updateForm, estatus: Number(val) })}
							>
								<SelectTrigger id="update-estatus">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="0">Abierta</SelectItem>
									<SelectItem value="1">En Proceso</SelectItem>
									<SelectItem value="2">Resuelta</SelectItem>
									<SelectItem value="3">Cerrada</SelectItem>
									<SelectItem value="4">Cancelada</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="update-prioridad">Prioridad</Label>
							<Select
								value={updateForm.prioridad}
								onValueChange={(val) =>
									setUpdateForm({ ...updateForm, prioridad: val as "Baja" | "Media" | "Alta" | "Crítica" })
								}
							>
								<SelectTrigger id="update-prioridad">
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

						<div className="grid gap-2">
							<Label htmlFor="update-asignado">Asignar a</Label>
							<Select
								value={updateForm.asignadoA || "unassigned"}
								onValueChange={(val) => setUpdateForm({ ...updateForm, asignadoA: val === "unassigned" ? "" : val })}
							>
								<SelectTrigger id="update-asignado">
									<SelectValue placeholder="Sin asignar" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="unassigned">Sin asignar</SelectItem>
									{users.map((user) => (
										<SelectItem key={user.id} value={user.id}>
											{user.nombreCompleto} ({user.email})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="update-notas">Notas</Label>
							<Textarea
								id="update-notas"
								value={updateForm.notas}
								onChange={(e) => setUpdateForm({ ...updateForm, notas: e.target.value })}
								placeholder="Agregar notas sobre la actualización (opcional)"
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsUpdateModalOpen(false);
								setSelectedIncident(null);
							}}
							disabled={updateMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							onClick={() => {
								if (selectedIncident) {
									updateMutation.mutate({
										id: selectedIncident.incidenciaID,
										data: updateForm,
									});
								}
							}}
							disabled={updateMutation.isPending}
						>
							{updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
