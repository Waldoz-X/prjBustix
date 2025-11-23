// noinspection NonAsciiCharacters
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bus, CheckCircle2, Eye, Loader2, Pencil, Plus, Search, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CreateUnidadDto, UnidadDto, UpdateUnidadDto } from "@/api/services/unidadService";
import unidadService from "@/api/services/unidadService";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/ui/alert-dialog";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1900;
const MAX_SEATS = 40;

export default function FleetPage() {
	const queryClient = useQueryClient();

	// Estados para crear/editar unidad
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isViewOpen, setIsViewOpen] = useState(false);
	const [selectedUnidad, setSelectedUnidad] = useState<UnidadDto | null>(null);
	const [viewUnidad, setViewUnidad] = useState<UnidadDto | null>(null);

	// Estados para confirmación de eliminación
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [unidadToDelete, setUnidadToDelete] = useState<UnidadDto | null>(null);

	// Estados para manejo de errores
	const [errorDialogOpen, setErrorDialogOpen] = useState(false);
	const [errorDetails, setErrorDetails] = useState<{
		title: string;
		message: string;
		details?: string;
	} | null>(null);

	const ESTATUS_OPTIONS = [
		{ value: 1, label: "Activo" },
		{ value: 2, label: "Inactivo" },
		{ value: 3, label: "Bloqueado" },
	];

	const initialUnidad: CreateUnidadDto = {
		numeroEconomico: "",
		placas: "",
		marca: "",
		modelo: "",
		año: CURRENT_YEAR,
		tipoUnidad: "",
		capacidadAsientos: 40,
		tieneClimatizacion: false,
		tieneBaño: false,
		tieneWifi: false,
		urlFoto: "",
		estatus: 1,
	};
	const [newUnidad, setNewUnidad] = useState<CreateUnidadDto>({ ...initialUnidad });
	const [editUnidad, setEditUnidad] = useState<UpdateUnidadDto>({ ...initialUnidad });

	// Buscador
	const [searchTerm, setSearchTerm] = useState("");

	// Query para obtener todas las unidades
	const { data: unidadesResponse, isLoading } = useQuery({
		queryKey: ["unidades"],
		queryFn: () => unidadService.getAll(),
		retry: 1,
	});

	// Normaliza los datos para compatibilidad con backend (propiedades minúsculas)
	const unidadesRaw = Array.isArray(unidadesResponse) ? unidadesResponse : [];

	// Filtrado por buscador con manejo de null
	const unidades = searchTerm.trim()
		? unidadesRaw.filter((u) => {
				const search = searchTerm.toLowerCase();
				return (
					(u.numeroEconomico?.toLowerCase() ?? "").includes(search) ||
					(u.placas?.toLowerCase() ?? "").includes(search) ||
					(u.marca?.toLowerCase() ?? "").includes(search) ||
					(u.modelo?.toLowerCase() ?? "").includes(search)
				);
			})
		: unidadesRaw;

	// Estadísticas
	const totalUnidades = unidadesRaw.length;
	const activas = unidadesRaw.filter((u) => u.estatus === 1).length;
	const inactivas = unidadesRaw.filter((u) => u.estatus !== 1).length;

	// Helper para validar URL
	const isValidUrl = (url: string): boolean => {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	};

	// Mutation para crear unidad
	const createMutation = useMutation({
		mutationFn: (data: CreateUnidadDto) => unidadService.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["unidades"] });
			toast.success("Unidad creada correctamente");
			setIsCreateOpen(false);
			setNewUnidad({ ...initialUnidad });
		},
		onError: (err: any) => {
			console.error("Error creating unidad:", err);
			setErrorDetails({
				title: "Error al Crear Unidad",
				message: err.message || "No se pudo crear la unidad",
				details: err.details ? JSON.stringify(err.details, null, 2) : undefined,
			});
			setErrorDialogOpen(true);
		},
	});

	// Mutation para actualizar unidad
	const updateMutation = useMutation({
		mutationFn: (data: { id: number; data: UpdateUnidadDto }) => unidadService.update(data.id, data.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["unidades"] });
			toast.success("Unidad actualizada correctamente");
			setIsEditOpen(false);
			setSelectedUnidad(null);
			setEditUnidad({ ...initialUnidad });
		},
		onError: (err: any) => {
			console.error("Error updating unidad:", err);
			setErrorDetails({
				title: "Error al Actualizar Unidad",
				message: err.message || "No se pudo actualizar la unidad",
				details: err.details ? JSON.stringify(err.details, null, 2) : undefined,
			});
			setErrorDialogOpen(true);
		},
	});

	// Mutation para eliminar unidad
	const deleteMutation = useMutation({
		mutationFn: (id: number) => unidadService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["unidades"] });
			toast.success("Unidad eliminada correctamente");
			setDeleteConfirmOpen(false);
			setUnidadToDelete(null);
		},
		onError: (err: any) => {
			console.error("Error deleting unidad:", err);
			setErrorDetails({
				title: "Error al Eliminar Unidad",
				message: err.message || "No se pudo eliminar la unidad",
				details: err.details ? JSON.stringify(err.details, null, 2) : undefined,
			});
			setErrorDialogOpen(true);
			setDeleteConfirmOpen(false);
			setUnidadToDelete(null);
		},
	});

	// Handlers
	const handleCreate = () => {
		// Validaciones
		if (!newUnidad.numeroEconomico.trim()) {
			toast.error("El número económico es obligatorio");
			return;
		}
		if (!newUnidad.placas.trim()) {
			toast.error("Las placas son obligatorias");
			return;
		}
		if (!newUnidad.tipoUnidad.trim()) {
			toast.error("El tipo de unidad es obligatorio");
			return;
		}
		if (!newUnidad.capacidadAsientos || newUnidad.capacidadAsientos <= 0) {
			toast.error("La capacidad de asientos debe ser mayor a 0");
			return;
		}
		if (newUnidad.capacidadAsientos > MAX_SEATS) {
			toast.error(`La capacidad máxima es de ${MAX_SEATS} asientos`);
			return;
		}
		if (newUnidad.año && (newUnidad.año < MIN_YEAR || newUnidad.año > CURRENT_YEAR)) {
			toast.error(`El año debe estar entre ${MIN_YEAR} y ${CURRENT_YEAR}`);
			return;
		}
		if (newUnidad.urlFoto?.trim() && !isValidUrl(newUnidad.urlFoto)) {
			toast.error("La URL de la foto no es válida");
			return;
		}
		if (!ESTATUS_OPTIONS.some((opt) => opt.value === newUnidad.estatus)) {
			toast.error("Selecciona un estatus válido");
			return;
		}
		createMutation.mutate(newUnidad);
	};

	const handleEdit = (unidad: UnidadDto) => {
		setSelectedUnidad(unidad);
		setEditUnidad({
			numeroEconomico: unidad.numeroEconomico ?? "",
			placas: unidad.placas ?? "",
			marca: unidad.marca ?? "",
			modelo: unidad.modelo ?? "",
			año: unidad.año ?? CURRENT_YEAR,
			tipoUnidad: unidad.tipoUnidad ?? "",
			capacidadAsientos: unidad.capacidadAsientos ?? 40,
			tieneClimatizacion: unidad.tieneClimatizacion ?? false,
			tieneBaño: unidad.tieneBaño ?? false,
			tieneWifi: unidad.tieneWifi ?? false,
			urlFoto: unidad.urlFoto ?? "",
			estatus: unidad.estatus ?? 1,
		});
		setIsEditOpen(true);
	};

	const handleView = (unidad: UnidadDto) => {
		setViewUnidad(unidad);
		setIsViewOpen(true);
	};

	const handleUpdate = () => {
		if (!selectedUnidad) {
			toast.error("No hay unidad seleccionada");
			return;
		}
		// Validaciones
		if (!editUnidad.numeroEconomico.trim()) {
			toast.error("El número económico es obligatorio");
			return;
		}
		if (!editUnidad.placas.trim()) {
			toast.error("Las placas son obligatorias");
			return;
		}
		if (!editUnidad.tipoUnidad.trim()) {
			toast.error("El tipo de unidad es obligatorio");
			return;
		}
		if (!editUnidad.capacidadAsientos || editUnidad.capacidadAsientos <= 0) {
			toast.error("La capacidad de asientos debe ser mayor a 0");
			return;
		}
		if (editUnidad.capacidadAsientos > MAX_SEATS) {
			toast.error(`La capacidad máxima es de ${MAX_SEATS} asientos`);
			return;
		}
		if (editUnidad.año && (editUnidad.año < MIN_YEAR || editUnidad.año > CURRENT_YEAR)) {
			toast.error(`El año debe estar entre ${MIN_YEAR} y ${CURRENT_YEAR}`);
			return;
		}
		if (editUnidad.urlFoto?.trim() && !isValidUrl(editUnidad.urlFoto)) {
			toast.error("La URL de la foto no es válida");
			return;
		}
		if (!ESTATUS_OPTIONS.some((opt) => opt.value === editUnidad.estatus)) {
			toast.error("Selecciona un estatus válido");
			return;
		}
		updateMutation.mutate({ id: selectedUnidad.id, data: editUnidad });
	};

	const handleDeleteClick = (unidad: UnidadDto) => {
		setUnidadToDelete(unidad);
		setDeleteConfirmOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (unidadToDelete) {
			deleteMutation.mutate(unidadToDelete.id);
		}
	};

	const getStatusBadge = (estatus: number) => {
		switch (estatus) {
			case 1:
				return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>;
			case 2:
				return <Badge variant="secondary">Inactivo</Badge>;
			case 3:
				return <Badge variant="destructive">Bloqueado</Badge>;
			default:
				return <Badge variant="outline">{estatus}</Badge>;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header y stats */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold">Flota de Vehículos</h1>
					<p className="text-muted-foreground mt-2">
						Administra las unidades de tu flota, crea, edita y elimina vehículos.
					</p>
				</div>
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button size="lg" className="gap-2 w-full md:w-auto">
							<Plus className="h-5 w-5" />
							Crear Unidad
						</Button>
					</DialogTrigger>
					<DialogContent className="max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Crear Nueva Unidad</DialogTitle>
							<DialogDescription>Ingresa los datos de la nueva unidad.</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="numeroEconomico">
										Número Económico <span className="text-destructive">*</span>
									</Label>
									<Input
										id="numeroEconomico"
										placeholder="Ej: ECO-001"
										value={newUnidad.numeroEconomico}
										onChange={(e) => setNewUnidad({ ...newUnidad, numeroEconomico: e.target.value })}
									/>
									<p className="text-xs text-muted-foreground">Identificador único de la unidad</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="placas">
										Placas <span className="text-destructive">*</span>
									</Label>
									<Input
										id="placas"
										placeholder="Ej: ABC-123-XYZ"
										value={newUnidad.placas}
										onChange={(e) => setNewUnidad({ ...newUnidad, placas: e.target.value })}
									/>
									<p className="text-xs text-muted-foreground">Placas de circulación del vehículo</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="marca">Marca</Label>
									<Input
										id="marca"
										placeholder="Ej: Mercedes-Benz"
										value={newUnidad.marca ?? ""}
										onChange={(e) => setNewUnidad({ ...newUnidad, marca: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="modelo">Modelo</Label>
									<Input
										id="modelo"
										placeholder="Ej: Sprinter"
										value={newUnidad.modelo ?? ""}
										onChange={(e) => setNewUnidad({ ...newUnidad, modelo: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="año">Año</Label>
									<Input
										id="año"
										type="number"
										min={MIN_YEAR}
										max={CURRENT_YEAR}
										placeholder={`${MIN_YEAR} - ${CURRENT_YEAR}`}
										value={newUnidad.año ?? ""}
										onChange={(e) =>
											setNewUnidad({ ...newUnidad, año: e.target.value ? parseInt(e.target.value) : CURRENT_YEAR })
										}
									/>
									<p className="text-xs text-muted-foreground">
										Año de fabricación ({MIN_YEAR}-{CURRENT_YEAR})
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="tipoUnidad">
										Tipo de Unidad <span className="text-destructive">*</span>
									</Label>
									<Input
										id="tipoUnidad"
										placeholder="Ej: Autobús, Van, Minibús"
										value={newUnidad.tipoUnidad}
										onChange={(e) => setNewUnidad({ ...newUnidad, tipoUnidad: e.target.value })}
									/>
									<p className="text-xs text-muted-foreground">Categoría del vehículo</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="capacidadAsientos">
										Capacidad de Asientos <span className="text-destructive">*</span>
									</Label>
									<Input
										id="capacidadAsientos"
										type="number"
										min={1}
										max={MAX_SEATS}
										placeholder={`1 - ${MAX_SEATS}`}
										value={newUnidad.capacidadAsientos}
										onChange={(e) => setNewUnidad({ ...newUnidad, capacidadAsientos: parseInt(e.target.value) || 0 })}
									/>
									<p className="text-xs text-muted-foreground">Máximo {MAX_SEATS} asientos</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="urlFoto">URL Foto</Label>
									<Input
										id="urlFoto"
										type="url"
										placeholder="https://i.ibb.co/DfRPtz35/ca.png"
										value={newUnidad.urlFoto ?? ""}
										onChange={(e) => setNewUnidad({ ...newUnidad, urlFoto: e.target.value })}
									/>
									<p className="text-xs text-muted-foreground">URL de la imagen del vehículo</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="estatus">
										Estatus <span className="text-destructive">*</span>
									</Label>
									<Select
										value={String(newUnidad.estatus)}
										onValueChange={(value) => setNewUnidad({ ...newUnidad, estatus: Number(value) })}
									>
										<SelectTrigger id="estatus">
											<SelectValue placeholder="Selecciona un estatus" />
										</SelectTrigger>
										<SelectContent>
											{ESTATUS_OPTIONS.map((opt) => (
												<SelectItem key={opt.value} value={String(opt.value)}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
								<div className="flex items-center gap-2">
									<Input
										id="tieneClimatizacion"
										type="checkbox"
										className="w-4 h-4"
										checked={newUnidad.tieneClimatizacion}
										onChange={(e) => setNewUnidad({ ...newUnidad, tieneClimatizacion: e.target.checked })}
									/>
									<Label htmlFor="tieneClimatizacion" className="cursor-pointer">
										Climatización
									</Label>
								</div>
								<div className="flex items-center gap-2">
									<Input
										id="tieneBaño"
										type="checkbox"
										className="w-4 h-4"
										checked={newUnidad.tieneBaño}
										onChange={(e) => setNewUnidad({ ...newUnidad, tieneBaño: e.target.checked })}
									/>
									<Label htmlFor="tieneBaño" className="cursor-pointer">
										Baño
									</Label>
								</div>
								<div className="flex items-center gap-2">
									<Input
										id="tieneWifi"
										type="checkbox"
										className="w-4 h-4"
										checked={newUnidad.tieneWifi}
										onChange={(e) => setNewUnidad({ ...newUnidad, tieneWifi: e.target.checked })}
									/>
									<Label htmlFor="tieneWifi" className="cursor-pointer">
										WiFi
									</Label>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsCreateOpen(false)}>
								Cancelar
							</Button>
							<Button onClick={handleCreate} disabled={createMutation.isPending}>
								{createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Crear
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Cards de estadísticas */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Unidades</CardTitle>
						<Bus className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalUnidades}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Unidades Activas</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activas}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Unidades Inactivas</CardTitle>
						<XCircle className="h-4 w-4 text-destructive" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{inactivas}</div>
					</CardContent>
				</Card>
			</div>

			{/* Buscador */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Buscar unidades..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
								disabled={isLoading}
							/>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							{!isLoading && (
								<span>
									{unidades.length} {unidades.length === 1 ? "unidad" : "unidades"}
								</span>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Lista de Unidades */}
			{isLoading ? (
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{unidades && unidades.length > 0 ? (
						unidades.map((unidad) => (
							<Card
								key={unidad.id}
								className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50"
							>
								{/* Imagen del camión */}
								<div className="w-full flex justify-center items-center pt-4">
									{unidad.urlFoto ? (
										<img
											src={unidad.urlFoto}
											alt={`Foto de ${unidad.numeroEconomico}`}
											className="h-32 w-auto object-contain rounded-md border"
											onError={(e) => {
												e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/2928/2928889.png";
											}}
										/>
									) : (
										<Bus className="h-20 w-20 text-primary/40" />
									)}
								</div>
								{/* Información debajo de la imagen */}
								<CardHeader className="pb-3 pt-2">
									<div className="flex items-start justify-between gap-3">
										<div className="flex-1">
											<CardTitle className="text-lg leading-none">{unidad.numeroEconomico}</CardTitle>
											<div className="flex gap-2 mt-1.5">
												<Badge variant="secondary" className="text-xs">
													{unidad.tipoUnidad}
												</Badge>
												{getStatusBadge(unidad.estatus)}
											</div>
										</div>
									</div>
									<CardDescription>ID: {unidad.id}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
										<div className="flex gap-2">
											<span className="font-semibold">Placas:</span> <Badge variant="secondary">{unidad.placas}</Badge>
										</div>
										<div>
											<span className="font-semibold">Marca:</span> {unidad.marca ?? "-"}
										</div>
										<div>
											<span className="font-semibold">Modelo:</span> {unidad.modelo ?? "-"}
										</div>
										<div>
											<span className="font-semibold">Año:</span> {unidad.año ?? "-"}
										</div>
										<div>
											<span className="font-semibold">Asientos:</span> {unidad.capacidadAsientos}
										</div>
										<div>
											<span className="font-semibold">Clima:</span> {unidad.tieneClimatizacion ? "Sí" : "No"}
										</div>
										<div>
											<span className="font-semibold">Baño:</span> {unidad.tieneBaño ? "Sí" : "No"}
										</div>
										<div>
											<span className="font-semibold">WiFi:</span> {unidad.tieneWifi ? "Sí" : "No"}
										</div>
										<div className="col-span-2">
											<span className="font-semibold">Alta:</span>{" "}
											{unidad.fechaAlta ? new Date(unidad.fechaAlta).toLocaleDateString() : "-"}
										</div>
									</div>
									<div className="flex gap-2 pt-2">
										<Button variant="outline" size="sm" className="flex-1" onClick={() => handleView(unidad)}>
											<Eye className="h-4 w-4 mr-1" /> Ver
										</Button>
										<Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(unidad)}>
											<Pencil className="h-4 w-4 mr-1" /> Editar
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
											onClick={() => handleDeleteClick(unidad)}
											disabled={deleteMutation.isPending}
										>
											{deleteMutation.isPending ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Trash2 className="h-4 w-4" />
											)}
										</Button>
									</div>
								</CardContent>
							</Card>
						))
					) : (
						<div className="col-span-full">
							<Card>
								<CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
									<Bus className="h-12 w-12 text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">No hay unidades disponibles</h3>
									<p className="text-muted-foreground mb-4">
										Comienza creando tu primera unidad haciendo clic en "Crear Unidad"
									</p>
									<Button onClick={() => setIsCreateOpen(true)}>
										<Plus className="mr-2 h-4 w-4" />
										Crear Unidad
									</Button>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			)}

			{/* Diálogo para ver detalles de unidad */}
			<Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Detalles de la Unidad</DialogTitle>
						<DialogDescription>
							Información completa de la unidad "{viewUnidad ? viewUnidad.numeroEconomico : ""}"
						</DialogDescription>
					</DialogHeader>
					{viewUnidad && (
						<div className="space-y-4 py-4">
							{viewUnidad.urlFoto && (
								<div className="flex justify-center">
									<img
										src={viewUnidad.urlFoto}
										alt={`Foto de ${viewUnidad.numeroEconomico}`}
										className="h-48 w-auto object-contain rounded-md border"
										onError={(e) => {
											e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/2928/2928889.png";
										}}
									/>
								</div>
							)}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-muted-foreground">Número Económico</Label>
									<p className="font-semibold">{viewUnidad.numeroEconomico}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Placas</Label>
									<p className="font-semibold">{viewUnidad.placas}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Marca</Label>
									<p className="font-semibold">{viewUnidad.marca ?? "-"}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Modelo</Label>
									<p className="font-semibold">{viewUnidad.modelo ?? "-"}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Año</Label>
									<p className="font-semibold">{viewUnidad.año ?? "-"}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Tipo de Unidad</Label>
									<p className="font-semibold">{viewUnidad.tipoUnidad}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Capacidad de Asientos</Label>
									<p className="font-semibold">{viewUnidad.capacidadAsientos}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Estatus</Label>
									<div className="mt-1">{getStatusBadge(viewUnidad.estatus)}</div>
								</div>
								<div>
									<Label className="text-muted-foreground">Climatización</Label>
									<p className="font-semibold">{viewUnidad.tieneClimatizacion ? "Sí" : "No"}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Baño</Label>
									<p className="font-semibold">{viewUnidad.tieneBaño ? "Sí" : "No"}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">WiFi</Label>
									<p className="font-semibold">{viewUnidad.tieneWifi ? "Sí" : "No"}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Fecha de Alta</Label>
									<p className="font-semibold">
										{viewUnidad.fechaAlta ? new Date(viewUnidad.fechaAlta).toLocaleDateString() : "-"}
									</p>
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button onClick={() => setIsViewOpen(false)}>Cerrar</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Diálogo para editar unidad */}
			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<DialogContent className="max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Editar Unidad</DialogTitle>
						<DialogDescription>
							Modifica los datos de la unidad "{selectedUnidad ? selectedUnidad.numeroEconomico : ""}"
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="editNumeroEconomico">
									Número Económico <span className="text-destructive">*</span>
								</Label>
								<Input
									id="editNumeroEconomico"
									placeholder="Ej: ECO-001"
									value={editUnidad.numeroEconomico}
									onChange={(e) => setEditUnidad({ ...editUnidad, numeroEconomico: e.target.value })}
								/>
								<p className="text-xs text-muted-foreground">Identificador único de la unidad</p>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editPlacas">
									Placas <span className="text-destructive">*</span>
								</Label>
								<Input
									id="editPlacas"
									placeholder="Ej: ABC-123-XYZ"
									value={editUnidad.placas}
									onChange={(e) => setEditUnidad({ ...editUnidad, placas: e.target.value })}
								/>
								<p className="text-xs text-muted-foreground">Placas de circulación del vehículo</p>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editMarca">Marca</Label>
								<Input
									id="editMarca"
									placeholder="Ej: Mercedes-Benz"
									value={editUnidad.marca ?? ""}
									onChange={(e) => setEditUnidad({ ...editUnidad, marca: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editModelo">Modelo</Label>
								<Input
									id="editModelo"
									placeholder="Ej: Sprinter"
									value={editUnidad.modelo ?? ""}
									onChange={(e) => setEditUnidad({ ...editUnidad, modelo: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editAño">Año</Label>
								<Input
									id="editAño"
									type="number"
									min={MIN_YEAR}
									max={CURRENT_YEAR}
									placeholder={`${MIN_YEAR} - ${CURRENT_YEAR}`}
									value={editUnidad.año ?? ""}
									onChange={(e) =>
										setEditUnidad({ ...editUnidad, año: e.target.value ? parseInt(e.target.value) : CURRENT_YEAR })
									}
								/>
								<p className="text-xs text-muted-foreground">
									Año de fabricación ({MIN_YEAR}-{CURRENT_YEAR})
								</p>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editTipoUnidad">
									Tipo de Unidad <span className="text-destructive">*</span>
								</Label>
								<Input
									id="editTipoUnidad"
									placeholder="Ej: Autobús, Van, Minibús"
									value={editUnidad.tipoUnidad}
									onChange={(e) => setEditUnidad({ ...editUnidad, tipoUnidad: e.target.value })}
								/>
								<p className="text-xs text-muted-foreground">Categoría del vehículo</p>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editCapacidadAsientos">
									Capacidad de Asientos <span className="text-destructive">*</span>
								</Label>
								<Input
									id="editCapacidadAsientos"
									type="number"
									min={1}
									max={MAX_SEATS}
									placeholder={`1 - ${MAX_SEATS}`}
									value={editUnidad.capacidadAsientos}
									onChange={(e) => setEditUnidad({ ...editUnidad, capacidadAsientos: parseInt(e.target.value) || 0 })}
								/>
								<p className="text-xs text-muted-foreground">Máximo {MAX_SEATS} asientos</p>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editUrlFoto">URL Foto</Label>
								<Input
									id="editUrlFoto"
									type="url"
									placeholder="https://i.ibb.co/DfRPtz35/ca.png"
									value={editUnidad.urlFoto ?? ""}
									onChange={(e) => setEditUnidad({ ...editUnidad, urlFoto: e.target.value })}
								/>
								<p className="text-xs text-muted-foreground">URL de la imagen del vehículo</p>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editEstatus">
									Estatus <span className="text-destructive">*</span>
								</Label>
								<Select
									value={String(editUnidad.estatus)}
									onValueChange={(value) => setEditUnidad({ ...editUnidad, estatus: Number(value) })}
								>
									<SelectTrigger id="editEstatus">
										<SelectValue placeholder="Selecciona un estatus" />
									</SelectTrigger>
									<SelectContent>
										{ESTATUS_OPTIONS.map((opt) => (
											<SelectItem key={opt.value} value={String(opt.value)}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
							<div className="flex items-center gap-2">
								<Input
									id="editTieneClimatizacion"
									type="checkbox"
									className="w-4 h-4"
									checked={editUnidad.tieneClimatizacion}
									onChange={(e) => setEditUnidad({ ...editUnidad, tieneClimatizacion: e.target.checked })}
								/>
								<Label htmlFor="editTieneClimatizacion" className="cursor-pointer">
									Climatización
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<Input
									id="editTieneBaño"
									type="checkbox"
									className="w-4 h-4"
									checked={editUnidad.tieneBaño}
									onChange={(e) => setEditUnidad({ ...editUnidad, tieneBaño: e.target.checked })}
								/>
								<Label htmlFor="editTieneBaño" className="cursor-pointer">
									Baño
								</Label>
							</div>
							<div className="flex items-center gap-2">
								<Input
									id="editTieneWifi"
									type="checkbox"
									className="w-4 h-4"
									checked={editUnidad.tieneWifi}
									onChange={(e) => setEditUnidad({ ...editUnidad, tieneWifi: e.target.checked })}
								/>
								<Label htmlFor="editTieneWifi" className="cursor-pointer">
									WiFi
								</Label>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleUpdate} disabled={updateMutation.isPending}>
							{updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Actualizar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* AlertDialog para confirmación de eliminación */}
			<AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción eliminará permanentemente la unidad "{unidadToDelete?.numeroEconomico}" (
							{unidadToDelete?.placas}). Esta acción no se puede deshacer.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setUnidadToDelete(null)}>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteConfirm}
							className="bg-destructive hover:bg-destructive/90"
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* AlertDialog para mostrar errores */}
			<AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-destructive">
							<XCircle className="h-5 w-5" />
							{errorDetails?.title}
						</AlertDialogTitle>
						<AlertDialogDescription className="space-y-2">
							<p>{errorDetails?.message}</p>
							{errorDetails?.details && (
								<div className="mt-4">
									<p className="text-sm font-semibold mb-2">Detalles técnicos:</p>
									<pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">{errorDetails.details}</pre>
								</div>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={() => setErrorDialogOpen(false)}>Entendido</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
