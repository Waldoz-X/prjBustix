import { useMutation, useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	AlertTriangle,
	Calendar,
	CheckCircle2,
	Clock,
	Edit2,
	Eye,
	FileText,
	Filter,
	Plus,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import incidenciasService, {
	type CreateIncidenciaDto,
	type IncidenciaDetalleDto,
} from "@/api/services/incidenciasService";
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

export default function MyReportsPage() {
	const isOperator = useHasRole("Operator");
	const isStaff = useHasRole("Staff");
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isOperator || isStaff || isAdmin || isManager;

	// State
	const [statusFilter, setStatusFilter] = useState<string>("todos");
	const [showFilters, setShowFilters] = useState(false);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedIncident, setSelectedIncident] = useState<IncidenciaDetalleDto | null>(null);

	// Create Form State
	const [createForm, setCreateForm] = useState<CreateIncidenciaDto>({
		tipoIncidenciaID: 0,
		titulo: "",
		descripcion: "",
		prioridad: "Media",
	});

	// Form Validation
	const isCreateFormValid = useMemo(() => {
		return (
			createForm.tipoIncidenciaID > 0 &&
			createForm.titulo.trim().length >= 10 &&
			createForm.descripcion.trim().length >= 10
		);
	}, [createForm]);

	// Queries
	const {
		data: myReports = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["mis-reportes"],
		queryFn: incidenciasService.getMisReportes,
		enabled: allowed,
	});

	const { data: incidentTypes = [] } = useQuery({
		queryKey: ["incident-types"],
		queryFn: incidenciasService.getTipos,
		enabled: allowed,
	});

	// Mutations
	const createMutation = useMutation({
		mutationFn: (data: CreateIncidenciaDto) => incidenciasService.create(data),
		onSuccess: () => {
			toast.success("Incidencia reportada correctamente");
			setIsCreateModalOpen(false);
			resetCreateForm();
			refetch();
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al reportar incidencia");
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

	// Filter reports by status
	const filteredReports = useMemo(() => {
		if (statusFilter === "todos") return myReports;
		return myReports.filter((r) => r.estatus === Number(statusFilter));
	}, [myReports, statusFilter]);

	// Stats
	const stats = {
		total: myReports.length,
		abiertas: myReports.filter((r) => r.estatus === 0).length,
		enProceso: myReports.filter((r) => r.estatus === 1).length,
		resueltas: myReports.filter((r) => r.estatus === 2).length,
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
						<FileText className="h-8 w-8 text-primary" />
						Mis Reportes
					</h1>
					<p className="text-muted-foreground mt-1">Incidencias que he reportado</p>
				</div>
				<Button onClick={() => setIsCreateModalOpen(true)} className="shadow-sm">
					<Plus className="mr-2 h-4 w-4" />
					Reportar Incidencia
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter("todos")}>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total Reportadas</CardTitle>
						<FileText className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
						<p className="text-xs text-muted-foreground mt-1">Todas mis incidencias</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter("0")}>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Abiertas</CardTitle>
						<AlertCircle className="h-4 w-4 text-yellow-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.abiertas}</div>
						<p className="text-xs text-muted-foreground mt-1">Pendientes de atención</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter("1")}>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">En Proceso</CardTitle>
						<Clock className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.enProceso}</div>
						<p className="text-xs text-muted-foreground mt-1">Siendo atendidas</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setStatusFilter("2")}>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Resueltas</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.resueltas}</div>
						<p className="text-xs text-muted-foreground mt-1">Completadas</p>
					</CardContent>
				</Card>
			</div>

			{/* List */}
			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
						<CardTitle className="text-lg">
							Historial de Reportes
							{statusFilter !== "todos" && (
								<Badge variant="secondary" className="ml-2">
									Filtrado
								</Badge>
							)}
						</CardTitle>
						<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
							<Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
								<Filter className="mr-2 h-4 w-4" />
								Filtros
								{statusFilter !== "todos" && (
									<Badge
										variant="destructive"
										className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
									>
										1
									</Badge>
								)}
							</Button>
						</div>
					</div>

					{/* Filters */}
					{showFilters && (
						<div className="grid gap-4 md:grid-cols-2 mt-4 pt-4 border-t">
							<div className="space-y-2">
								<Label className="text-sm font-medium">Estado</Label>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
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

							{statusFilter !== "todos" && (
								<div className="md:col-span-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setStatusFilter("todos")}
										className="w-full md:w-auto"
									>
										<X className="mr-2 h-4 w-4" />
										Limpiar Filtro
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
									<TableHead>Fecha Reporte</TableHead>
									<TableHead>Asignado</TableHead>
									<TableHead>Tiempo</TableHead>
									<TableHead className="text-right">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={9} className="h-24 text-center">
											<div className="flex items-center justify-center">
												<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
											</div>
										</TableCell>
									</TableRow>
								) : filteredReports.length === 0 ? (
									<TableRow>
										<TableCell colSpan={9} className="h-32 text-center">
											<div className="flex flex-col items-center justify-center gap-2 py-8">
												<AlertTriangle className="h-12 w-12 text-muted-foreground/50" />
												<p className="text-muted-foreground font-medium">
													{statusFilter === "todos"
														? "No has reportado incidencias"
														: "No hay incidencias con este estado"}
												</p>
												<p className="text-sm text-muted-foreground">
													{statusFilter === "todos" ? (
														<>
															Haz clic en{" "}
															<Button
																variant="link"
																className="h-auto p-0 text-primary"
																onClick={() => setIsCreateModalOpen(true)}
															>
																Reportar Incidencia
															</Button>{" "}
															para crear tu primera incidencia
														</>
													) : (
														"Intenta con otro filtro"
													)}
												</p>
											</div>
										</TableCell>
									</TableRow>
								) : (
									filteredReports.map((incident) => (
										<TableRow key={incident.incidenciaID} className="hover:bg-gray-50/50">
											<TableCell className="font-mono text-xs">{incident.codigoIncidencia}</TableCell>
											<TableCell className="font-medium max-w-[200px] truncate">{incident.titulo}</TableCell>
											<TableCell>
												<Badge variant="outline">{incident.tipoIncidenciaNombre}</Badge>
											</TableCell>
											<TableCell>{getPriorityBadge(incident.prioridad)}</TableCell>
											<TableCell>{getStatusBadge(incident.estatus, incident.estatusNombre)}</TableCell>
											<TableCell className="text-sm">
												<div className="flex items-center gap-1 text-muted-foreground">
													<Calendar className="h-3 w-3" />
													{new Date(incident.fechaReporte).toLocaleDateString()}
												</div>
											</TableCell>
											<TableCell className="text-sm">{incident.asignadoNombre || "-"}</TableCell>
											<TableCell className="text-sm">
												{incident.diasDesdeReporte !== undefined && (
													<span className="text-muted-foreground">{incident.diasDesdeReporte}d</span>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button variant="ghost" size="sm" onClick={() => openDetailModal(incident.incidenciaID)}>
														<Eye className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Summary */}
					{filteredReports.length > 0 && (
						<div className="mt-4 text-sm text-muted-foreground">
							Mostrando {filteredReports.length} de {myReports.length} incidencias
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
							{createMutation.isPending ? "Reportando..." : "Reportar Incidencia"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Detail Modal */}
			<Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
				<DialogContent className="sm:max-w-[700px]">
					<DialogHeader>
						<DialogTitle>Detalle de Incidencia</DialogTitle>
						<DialogDescription>Información completa de la incidencia reportada</DialogDescription>
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
								<p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{selectedIncident.descripcion}</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-xs text-muted-foreground">Tipo</Label>
									<p className="text-sm">{selectedIncident.tipoIncidenciaNombre}</p>
									<p className="text-xs text-muted-foreground">{selectedIncident.tipoIncidenciaCategoria}</p>
								</div>
								<div>
									<Label className="text-xs text-muted-foreground">Prioridad</Label>
									<div className="mt-1">{getPriorityBadge(selectedIncident.prioridad)}</div>
								</div>
							</div>

							{selectedIncident.asignadoNombre && (
								<div className="p-3 bg-blue-50 rounded-md">
									<Label className="text-xs text-muted-foreground flex items-center gap-1">
										<Edit2 className="h-3 w-3" />
										Asignado a
									</Label>
									<p className="text-sm font-medium mt-1">{selectedIncident.asignadoNombre}</p>
									<p className="text-xs text-muted-foreground">{selectedIncident.asignadoEmail}</p>
								</div>
							)}

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
									{selectedIncident.diasDesdeReporte !== undefined && (
										<p className="text-xs text-muted-foreground">Hace {selectedIncident.diasDesdeReporte} días</p>
									)}
								</div>
								{selectedIncident.fechaResolucion && (
									<div>
										<Label className="text-xs text-muted-foreground">Fecha de Resolución</Label>
										<p className="text-sm">{new Date(selectedIncident.fechaResolucion).toLocaleString()}</p>
									</div>
								)}
							</div>

							{selectedIncident.tiempoTranscurrido && (
								<div className="p-3 bg-gray-50 rounded-md">
									<Label className="text-xs text-muted-foreground flex items-center gap-1">
										<Clock className="h-3 w-3" />
										Tiempo Transcurrido
									</Label>
									<p className="text-sm font-medium mt-1">{selectedIncident.tiempoTranscurrido}</p>
								</div>
							)}
						</div>
					) : null}
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
							Cerrar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
