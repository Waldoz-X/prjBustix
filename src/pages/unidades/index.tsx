import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bus, CheckCircle2, Loader2, Pencil, Plus, Search, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CreateUnidadDto, UnidadDto, UpdateUnidadDto } from "@/api/services/unidadService";
import unidadService from "@/api/services/unidadService";
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
// ...existing code...

export default function FleetPage() {
	const queryClient = useQueryClient();

	// Estados para crear/editar unidad
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [selectedUnidad, setSelectedUnidad] = useState<UnidadDto | null>(null);
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
		año: 0,
		tipoUnidad: "",
		capacidadAsientos: 0,
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

	// Filtrado por buscador
	const unidades = searchTerm.trim()
		? unidadesRaw.filter(
				(u) =>
					u.numeroEconomico.toLowerCase().includes(searchTerm.toLowerCase()) ||
					u.placas.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(u.marca ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
					(u.modelo ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
			)
		: unidadesRaw;

	// Estadísticas
	const totalUnidades = unidadesRaw.length;
	const activas = unidadesRaw.filter((u) => u.estatus === 1).length;
	const inactivas = unidadesRaw.filter((u) => u.estatus !== 1).length;

	// Mutation para crear unidad
	const createMutation = useMutation({
		mutationFn: (data: CreateUnidadDto) => unidadService.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["unidades"] });
			toast.success("Unidad creada correctamente");
			setIsCreateOpen(false);
			setNewUnidad({ ...initialUnidad });
		},
		onError: (err) => {
			toast.error(`Error al crear unidad: ${err.message}`);
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
		onError: (err) => {
			toast.error(`Error al actualizar unidad: ${err.message}`);
		},
	});

	// Mutation para eliminar unidad
	const deleteMutation = useMutation({
		mutationFn: (id: number) => unidadService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["unidades"] });
			toast.success("Unidad eliminada correctamente");
		},
		onError: (err) => {
			toast.error(`Error al eliminar unidad: ${err.message}`);
		},
	});

	// Handlers
	const handleCreate = () => {
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
			año: unidad.año,
			tipoUnidad: unidad.tipoUnidad ?? "",
			capacidadAsientos: unidad.capacidadAsientos ?? 0,
			tieneClimatizacion: unidad.tieneClimatizacion ?? false,
			tieneBaño: unidad.tieneBaño ?? false,
			tieneWifi: unidad.tieneWifi ?? false,
			urlFoto: unidad.urlFoto ?? "",
			estatus: unidad.estatus ?? 1,
		});
		setIsEditOpen(true);
	};

	const handleUpdate = () => {
		if (!selectedUnidad) {
			toast.error("No hay unidad seleccionada");
			return;
		}
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
		if (!ESTATUS_OPTIONS.some((opt) => opt.value === editUnidad.estatus)) {
			toast.error("Selecciona un estatus válido");
			return;
		}
		updateMutation.mutate({ id: selectedUnidad.id, data: editUnidad });
	};

	const handleDelete = (unidad: UnidadDto) => {
		if (window.confirm(`¿Eliminar la unidad "${unidad.numeroEconomico}"?`)) {
			deleteMutation.mutate(unidad.id);
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
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Crear Nueva Unidad</DialogTitle>
							<DialogDescription>Ingresa los datos de la nueva unidad.</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="numeroEconomico">Número Económico</Label>
									<Input
										id="numeroEconomico"
										value={newUnidad.numeroEconomico}
										onChange={(e) => setNewUnidad({ ...newUnidad, numeroEconomico: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="placas">Placas</Label>
									<Input
										id="placas"
										value={newUnidad.placas}
										onChange={(e) => setNewUnidad({ ...newUnidad, placas: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="marca">Marca</Label>
									<Input
										id="marca"
										value={newUnidad.marca ?? ""}
										onChange={(e) => setNewUnidad({ ...newUnidad, marca: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="modelo">Modelo</Label>
									<Input
										id="modelo"
										value={newUnidad.modelo ?? ""}
										onChange={(e) => setNewUnidad({ ...newUnidad, modelo: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="año">Año</Label>
									<Input
										id="año"
										type="number"
										value={newUnidad.año ?? ""}
										onChange={(e) => setNewUnidad({ ...newUnidad, año: e.target.value ? parseInt(e.target.value) : 0 })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="tipoUnidad">Tipo de Unidad</Label>
									<Input
										id="tipoUnidad"
										value={newUnidad.tipoUnidad}
										onChange={(e) => setNewUnidad({ ...newUnidad, tipoUnidad: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="capacidadAsientos">Capacidad de Asientos</Label>
									<Input
										id="capacidadAsientos"
										type="number"
										value={newUnidad.capacidadAsientos}
										onChange={(e) => setNewUnidad({ ...newUnidad, capacidadAsientos: parseInt(e.target.value) })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="urlFoto">URL Foto</Label>
									<Input
										id="urlFoto"
										value={newUnidad.urlFoto ?? ""}
										onChange={(e) => setNewUnidad({ ...newUnidad, urlFoto: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="estatus">Estatus</Label>
									<select
										id="estatus"
										className="w-full border rounded px-2 py-2"
										value={newUnidad.estatus}
										onChange={(e) => setNewUnidad({ ...newUnidad, estatus: Number(e.target.value) })}
									>
										{ESTATUS_OPTIONS.map((opt) => (
											<option key={opt.value} value={opt.value}>
												{opt.label}
											</option>
										))}
									</select>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
								<div className="flex items-center gap-2">
									<Label htmlFor="tieneClimatizacion">Climatización</Label>
									<Input
										id="tieneClimatizacion"
										type="checkbox"
										checked={newUnidad.tieneClimatizacion}
										onChange={(e) => setNewUnidad({ ...newUnidad, tieneClimatizacion: e.target.checked })}
									/>
								</div>
								<div className="flex items-center gap-2">
									<Label htmlFor="tieneBaño">Baño</Label>
									<Input
										id="tieneBaño"
										type="checkbox"
										checked={newUnidad.tieneBaño}
										onChange={(e) => setNewUnidad({ ...newUnidad, tieneBaño: e.target.checked })}
									/>
								</div>
								<div className="flex items-center gap-2">
									<Label htmlFor="tieneWifi">WiFi</Label>
									<Input
										id="tieneWifi"
										type="checkbox"
										checked={newUnidad.tieneWifi}
										onChange={(e) => setNewUnidad({ ...newUnidad, tieneWifi: e.target.checked })}
									/>
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
									<div className="flex items-center gap-3">
										<div>
											<CardTitle className="text-lg leading-none">{unidad.numeroEconomico}</CardTitle>
											<Badge variant="secondary" className="mt-1.5 text-xs">
												{unidad.tipoUnidad}
											</Badge>
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
										<div>
											<span className="font-semibold">Estatus:</span>{" "}
											{ESTATUS_OPTIONS.find((opt) => opt.value === unidad.estatus)?.label ?? unidad.estatus}
										</div>
										<div>
											<span className="font-semibold">Alta:</span>{" "}
											{unidad.fechaAlta ? new Date(unidad.fechaAlta).toLocaleDateString() : "-"}
										</div>
									</div>
									<div className="flex gap-2 pt-2">
										<Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(unidad)}>
											<Pencil className="h-4 w-4" /> Editar
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
											onClick={() => handleDelete(unidad)}
											disabled={deleteMutation.isPending}
										>
											{deleteMutation.isPending ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Trash2 className="h-4 w-4" />
											)}{" "}
											Eliminar
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

			{/* Diálogo para editar unidad */}
			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Editar Unidad</DialogTitle>
						<DialogDescription>
							Modifica los datos de la unidad "{selectedUnidad ? selectedUnidad.numeroEconomico : ""}"
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="editNumeroEconomico">Número Económico</Label>
								<Input
									id="editNumeroEconomico"
									value={editUnidad.numeroEconomico}
									onChange={(e) => setEditUnidad({ ...editUnidad, numeroEconomico: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editPlacas">Placas</Label>
								<Input
									id="editPlacas"
									value={editUnidad.placas}
									onChange={(e) => setEditUnidad({ ...editUnidad, placas: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editMarca">Marca</Label>
								<Input
									id="editMarca"
									value={editUnidad.marca ?? ""}
									onChange={(e) => setEditUnidad({ ...editUnidad, marca: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editModelo">Modelo</Label>
								<Input
									id="editModelo"
									value={editUnidad.modelo ?? ""}
									onChange={(e) => setEditUnidad({ ...editUnidad, modelo: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editAño">Año</Label>
								<Input
									id="editAño"
									type="number"
									value={editUnidad.año ?? ""}
									onChange={(e) => setEditUnidad({ ...editUnidad, año: e.target.value ? parseInt(e.target.value) : 0 })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editTipoUnidad">Tipo de Unidad</Label>
								<Input
									id="editTipoUnidad"
									value={editUnidad.tipoUnidad}
									onChange={(e) => setEditUnidad({ ...editUnidad, tipoUnidad: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editCapacidadAsientos">Capacidad de Asientos</Label>
								<Input
									id="editCapacidadAsientos"
									type="number"
									value={editUnidad.capacidadAsientos}
									onChange={(e) => setEditUnidad({ ...editUnidad, capacidadAsientos: parseInt(e.target.value) })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editUrlFoto">URL Foto</Label>
								<Input
									id="editUrlFoto"
									value={editUnidad.urlFoto ?? ""}
									onChange={(e) => setEditUnidad({ ...editUnidad, urlFoto: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editEstatus">Estatus</Label>
								<select
									id="editEstatus"
									className="w-full border rounded px-2 py-2"
									value={editUnidad.estatus}
									onChange={(e) => setEditUnidad({ ...editUnidad, estatus: Number(e.target.value) })}
								>
									{ESTATUS_OPTIONS.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
							<div className="flex items-center gap-2">
								<Label htmlFor="editTieneClimatizacion">Climatización</Label>
								<Input
									id="editTieneClimatizacion"
									type="checkbox"
									checked={editUnidad.tieneClimatizacion}
									onChange={(e) => setEditUnidad({ ...editUnidad, tieneClimatizacion: e.target.checked })}
								/>
							</div>
							<div className="flex items-center gap-2">
								<Label htmlFor="editTieneBaño">Baño</Label>
								<Input
									id="editTieneBaño"
									type="checkbox"
									checked={editUnidad.tieneBaño}
									onChange={(e) => setEditUnidad({ ...editUnidad, tieneBaño: e.target.checked })}
								/>
							</div>
							<div className="flex items-center gap-2">
								<Label htmlFor="editTieneWifi">WiFi</Label>
								<Input
									id="editTieneWifi"
									type="checkbox"
									checked={editUnidad.tieneWifi}
									onChange={(e) => setEditUnidad({ ...editUnidad, tieneWifi: e.target.checked })}
								/>
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
		</div>
	);
}
