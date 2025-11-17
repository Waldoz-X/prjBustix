import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bus, CheckCircle2, Loader2, Pencil, Plus, Search, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CreateUnidadDto, UnidadResponseDto, UpdateUnidadDto } from "@/api/services/unidadService";
import { unidadService } from "@/api/services/unidadService";
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
	const [selectedUnidad, setSelectedUnidad] = useState<UnidadResponseDto | null>(null);
	const ESTATUS_OPTIONS = [
		{ value: 1, label: "Activo" },
		{ value: 2, label: "Inactivo" },
		{ value: 3, label: "Bloqueado" },
	];

	const initialUnidad: CreateUnidadDto = {
		NumeroEconomico: "",
		Placas: "",
		Marca: "",
		Modelo: "",
		Año: undefined,
		TipoUnidad: "",
		CapacidadAsientos: 0,
		TieneClimatizacion: false,
		TieneBaño: false,
		TieneWifi: false,
		UrlFoto: "",
		Estatus: 1,
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
	const unidadesRaw = (unidadesResponse?.data ?? []).map((unidad: any) => ({
		Id: unidad.id ?? unidad.Id,
		NumeroEconomico: unidad.numeroEconomico ?? unidad.NumeroEconomico,
		Placas: unidad.placas ?? unidad.Placas,
		Marca: unidad.marca ?? unidad.Marca,
		Modelo: unidad.modelo ?? unidad.Modelo,
		Año: unidad.año ?? unidad.Año,
		TipoUnidad: unidad.tipoUnidad ?? unidad.TipoUnidad,
		CapacidadAsientos: unidad.capacidadAsientos ?? unidad.CapacidadAsientos,
		TieneClimatizacion: unidad.tieneClimatizacion ?? unidad.TieneClimatizacion,
		TieneBaño: unidad.tieneBaño ?? unidad.TieneBaño,
		TieneWifi: unidad.tieneWifi ?? unidad.TieneWifi,
		UrlFoto: unidad.urlFoto ?? unidad.UrlFoto,
		Estatus: unidad.estatus ?? unidad.Estatus,
		FechaAlta: unidad.fechaAlta ?? unidad.FechaAlta,
	}));

	// Filtrado por buscador
	const unidades = searchTerm.trim()
		? unidadesRaw.filter(
				(u) =>
					u.NumeroEconomico.toLowerCase().includes(searchTerm.toLowerCase()) ||
					u.Placas.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(u.Marca ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
					(u.Modelo ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
			)
		: unidadesRaw;

	// Estadísticas
	const totalUnidades = unidadesRaw.length;
	const activas = unidadesRaw.filter((u) => u.Estatus === 1).length;
	const inactivas = unidadesRaw.filter((u) => u.Estatus !== 1).length;

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
		if (!newUnidad.NumeroEconomico.trim()) {
			toast.error("El número económico es obligatorio");
			return;
		}
		if (!newUnidad.Placas.trim()) {
			toast.error("Las placas son obligatorias");
			return;
		}
		if (!newUnidad.TipoUnidad.trim()) {
			toast.error("El tipo de unidad es obligatorio");
			return;
		}
		if (!newUnidad.CapacidadAsientos || newUnidad.CapacidadAsientos <= 0) {
			toast.error("La capacidad de asientos debe ser mayor a 0");
			return;
		}
		if (!ESTATUS_OPTIONS.some((opt) => opt.value === newUnidad.Estatus)) {
			toast.error("Selecciona un estatus válido");
			return;
		}
		createMutation.mutate(newUnidad);
	};

	const handleEdit = (unidad: any) => {
		setSelectedUnidad(unidad);
		setEditUnidad({
			NumeroEconomico: unidad.NumeroEconomico ?? "",
			Placas: unidad.Placas ?? "",
			Marca: unidad.Marca ?? "",
			Modelo: unidad.Modelo ?? "",
			Año: unidad.Año,
			TipoUnidad: unidad.TipoUnidad ?? "",
			CapacidadAsientos: unidad.CapacidadAsientos ?? 0,
			TieneClimatizacion: unidad.TieneClimatizacion ?? false,
			TieneBaño: unidad.TieneBaño ?? false,
			TieneWifi: unidad.TieneWifi ?? false,
			UrlFoto: unidad.UrlFoto ?? "",
			Estatus: unidad.Estatus ?? 1,
		});
		setIsEditOpen(true);
	};

	const handleUpdate = () => {
		if (!selectedUnidad) {
			toast.error("No hay unidad seleccionada");
			return;
		}
		if (!editUnidad.NumeroEconomico.trim()) {
			toast.error("El número económico es obligatorio");
			return;
		}
		if (!editUnidad.Placas.trim()) {
			toast.error("Las placas son obligatorias");
			return;
		}
		if (!editUnidad.TipoUnidad.trim()) {
			toast.error("El tipo de unidad es obligatorio");
			return;
		}
		if (!editUnidad.CapacidadAsientos || editUnidad.CapacidadAsientos <= 0) {
			toast.error("La capacidad de asientos debe ser mayor a 0");
			return;
		}
		if (!ESTATUS_OPTIONS.some((opt) => opt.value === editUnidad.Estatus)) {
			toast.error("Selecciona un estatus válido");
			return;
		}
		updateMutation.mutate({ id: selectedUnidad.Id, data: editUnidad });
	};

	const handleDelete = (unidad: UnidadResponseDto) => {
		if (window.confirm(`¿Eliminar la unidad "${unidad.NumeroEconomico}"?`)) {
			deleteMutation.mutate(unidad.Id);
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
									<Label htmlFor="NumeroEconomico">Número Económico</Label>
									<Input
										id="NumeroEconomico"
										value={newUnidad.NumeroEconomico}
										onChange={(e) => setNewUnidad({ ...newUnidad, NumeroEconomico: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="Placas">Placas</Label>
									<Input
										id="Placas"
										value={newUnidad.Placas}
										onChange={(e) => setNewUnidad({ ...newUnidad, Placas: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="Marca">Marca</Label>
									<Input
										id="Marca"
										value={newUnidad.Marca ?? ""}
										onChange={(e) => setNewUnidad({ ...newUnidad, Marca: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="Modelo">Modelo</Label>
									<Input
										id="Modelo"
										value={newUnidad.Modelo ?? ""}
										onChange={(e) => setNewUnidad({ ...newUnidad, Modelo: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="Año">Año</Label>
									<Input
										id="Año"
										type="number"
										value={newUnidad.Año ?? ""}
										onChange={(e) =>
											setNewUnidad({ ...newUnidad, Año: e.target.value ? parseInt(e.target.value) : undefined })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="TipoUnidad">Tipo de Unidad</Label>
									<Input
										id="TipoUnidad"
										value={newUnidad.TipoUnidad}
										onChange={(e) => setNewUnidad({ ...newUnidad, TipoUnidad: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="CapacidadAsientos">Capacidad de Asientos</Label>
									<Input
										id="CapacidadAsientos"
										type="number"
										value={newUnidad.CapacidadAsientos}
										onChange={(e) => setNewUnidad({ ...newUnidad, CapacidadAsientos: parseInt(e.target.value) })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="UrlFoto">URL Foto</Label>
									<Input
										id="UrlFoto"
										value={newUnidad.UrlFoto ?? ""}
										onChange={(e) => setNewUnidad({ ...newUnidad, UrlFoto: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="Estatus">Estatus</Label>
									<select
										id="Estatus"
										className="w-full border rounded px-2 py-2"
										value={newUnidad.Estatus}
										onChange={(e) => setNewUnidad({ ...newUnidad, Estatus: Number(e.target.value) })}
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
									<Label htmlFor="TieneClimatizacion">Climatización</Label>
									<Input
										id="TieneClimatizacion"
										type="checkbox"
										checked={newUnidad.TieneClimatizacion}
										onChange={(e) => setNewUnidad({ ...newUnidad, TieneClimatizacion: e.target.checked })}
									/>
								</div>
								<div className="flex items-center gap-2">
									<Label htmlFor="TieneBaño">Baño</Label>
									<Input
										id="TieneBaño"
										type="checkbox"
										checked={newUnidad.TieneBaño}
										onChange={(e) => setNewUnidad({ ...newUnidad, TieneBaño: e.target.checked })}
									/>
								</div>
								<div className="flex items-center gap-2">
									<Label htmlFor="TieneWifi">WiFi</Label>
									<Input
										id="TieneWifi"
										type="checkbox"
										checked={newUnidad.TieneWifi}
										onChange={(e) => setNewUnidad({ ...newUnidad, TieneWifi: e.target.checked })}
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
								key={unidad.Id}
								className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50"
							>
								{/* Imagen del camión */}
								<div className="w-full flex justify-center items-center pt-4">
									{unidad.UrlFoto ? (
										<img
											src={unidad.UrlFoto}
											alt={`Foto de ${unidad.NumeroEconomico}`}
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
											<CardTitle className="text-lg leading-none">{unidad.NumeroEconomico}</CardTitle>
											<Badge variant="secondary" className="mt-1.5 text-xs">
												{unidad.TipoUnidad}
											</Badge>
										</div>
									</div>
									<CardDescription>ID: {unidad.Id}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
										<div className="flex gap-2">
											<span className="font-semibold">Placas:</span> <Badge variant="secondary">{unidad.Placas}</Badge>
										</div>
										<div>
											<span className="font-semibold">Marca:</span> {unidad.Marca ?? "-"}
										</div>
										<div>
											<span className="font-semibold">Modelo:</span> {unidad.Modelo ?? "-"}
										</div>
										<div>
											<span className="font-semibold">Año:</span> {unidad.Año ?? "-"}
										</div>
										<div>
											<span className="font-semibold">Asientos:</span> {unidad.CapacidadAsientos}
										</div>
										<div>
											<span className="font-semibold">Clima:</span> {unidad.TieneClimatizacion ? "Sí" : "No"}
										</div>
										<div>
											<span className="font-semibold">Baño:</span> {unidad.TieneBaño ? "Sí" : "No"}
										</div>
										<div>
											<span className="font-semibold">WiFi:</span> {unidad.TieneWifi ? "Sí" : "No"}
										</div>
										<div>
											<span className="font-semibold">Estatus:</span>{" "}
											{ESTATUS_OPTIONS.find((opt) => opt.value === unidad.Estatus)?.label ?? unidad.Estatus}
										</div>
										<div>
											<span className="font-semibold">Alta:</span>{" "}
											{unidad.FechaAlta ? new Date(unidad.FechaAlta).toLocaleDateString() : "-"}
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
							Modifica los datos de la unidad "{selectedUnidad ? selectedUnidad.NumeroEconomico : ""}"
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="editNumeroEconomico">Número Económico</Label>
								<Input
									id="editNumeroEconomico"
									value={editUnidad.NumeroEconomico}
									onChange={(e) => setEditUnidad({ ...editUnidad, NumeroEconomico: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editPlacas">Placas</Label>
								<Input
									id="editPlacas"
									value={editUnidad.Placas}
									onChange={(e) => setEditUnidad({ ...editUnidad, Placas: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editMarca">Marca</Label>
								<Input
									id="editMarca"
									value={editUnidad.Marca ?? ""}
									onChange={(e) => setEditUnidad({ ...editUnidad, Marca: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editModelo">Modelo</Label>
								<Input
									id="editModelo"
									value={editUnidad.Modelo ?? ""}
									onChange={(e) => setEditUnidad({ ...editUnidad, Modelo: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editAño">Año</Label>
								<Input
									id="editAño"
									type="number"
									value={editUnidad.Año ?? ""}
									onChange={(e) =>
										setEditUnidad({ ...editUnidad, Año: e.target.value ? parseInt(e.target.value) : undefined })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editTipoUnidad">Tipo de Unidad</Label>
								<Input
									id="editTipoUnidad"
									value={editUnidad.TipoUnidad}
									onChange={(e) => setEditUnidad({ ...editUnidad, TipoUnidad: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editCapacidadAsientos">Capacidad de Asientos</Label>
								<Input
									id="editCapacidadAsientos"
									type="number"
									value={editUnidad.CapacidadAsientos}
									onChange={(e) => setEditUnidad({ ...editUnidad, CapacidadAsientos: parseInt(e.target.value) })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editUrlFoto">URL Foto</Label>
								<Input
									id="editUrlFoto"
									value={editUnidad.UrlFoto ?? ""}
									onChange={(e) => setEditUnidad({ ...editUnidad, UrlFoto: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="editEstatus">Estatus</Label>
								<select
									id="editEstatus"
									className="w-full border rounded px-2 py-2"
									value={editUnidad.Estatus}
									onChange={(e) => setEditUnidad({ ...editUnidad, Estatus: Number(e.target.value) })}
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
									checked={editUnidad.TieneClimatizacion}
									onChange={(e) => setEditUnidad({ ...editUnidad, TieneClimatizacion: e.target.checked })}
								/>
							</div>
							<div className="flex items-center gap-2">
								<Label htmlFor="editTieneBaño">Baño</Label>
								<Input
									id="editTieneBaño"
									type="checkbox"
									checked={editUnidad.TieneBaño}
									onChange={(e) => setEditUnidad({ ...editUnidad, TieneBaño: e.target.checked })}
								/>
							</div>
							<div className="flex items-center gap-2">
								<Label htmlFor="editTieneWifi">WiFi</Label>
								<Input
									id="editTieneWifi"
									type="checkbox"
									checked={editUnidad.TieneWifi}
									onChange={(e) => setEditUnidad({ ...editUnidad, TieneWifi: e.target.checked })}
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
