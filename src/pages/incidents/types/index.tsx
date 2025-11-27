import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Edit2,
	Plus,
	Search,
	Trash2,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import incidenciasService, { type TipoIncidenciaDto } from "@/api/services/incidenciasService";
import { useHasRole } from "@/hooks/use-session";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

type FormData = {
	codigo: string;
	nombre: string;
	categoria: string;
	prioridad: string;
	esActivo: boolean;
};

export default function IncidentTypesPage() {
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isAdmin || isManager;
	const queryClient = useQueryClient();

	// State
	const [searchTerm, setSearchTerm] = useState("");
	const [showInactive, setShowInactive] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	// Modal states
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedType, setSelectedType] = useState<TipoIncidenciaDto | null>(null);

	// Form state
	const [formData, setFormData] = useState<FormData>({
		codigo: "",
		nombre: "",
		categoria: "",
		prioridad: "Media",
		esActivo: true,
	});

	// Queries
	const {
		data: types = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["incident-types-all", showInactive],
		queryFn: () => (showInactive ? incidenciasService.getTodosTipos() : incidenciasService.getTipos()),
		enabled: allowed,
	});

	// Mutations
	const createMutation = useMutation({
		mutationFn: (data: Omit<FormData, "esActivo">) => incidenciasService.createTipo({ ...data, esActivo: true }),
		onSuccess: () => {
			toast.success("Tipo de incidencia creado correctamente");
			setIsCreateModalOpen(false);
			resetForm();
			refetch();
			queryClient.invalidateQueries({ queryKey: ["incident-types-all"] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al crear tipo de incidencia");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: FormData }) => incidenciasService.updateTipo(id, data),
		onSuccess: () => {
			toast.success("Tipo de incidencia actualizado correctamente");
			setIsEditModalOpen(false);
			setSelectedType(null);
			resetForm();
			refetch();
			queryClient.invalidateQueries({ queryKey: ["incident-types-all"] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al actualizar tipo de incidencia");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => incidenciasService.deleteTipo(id),
		onSuccess: () => {
			toast.success("Tipo de incidencia eliminado correctamente");
			setIsDeleteDialogOpen(false);
			setSelectedType(null);
			refetch();
			queryClient.invalidateQueries({ queryKey: ["incident-types-all"] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al eliminar tipo de incidencia");
		},
	});

	// Functions
	const resetForm = () => {
		setFormData({
			codigo: "",
			nombre: "",
			categoria: "",
			prioridad: "Media",
			esActivo: true,
		});
	};

	const openEditModal = (type: TipoIncidenciaDto) => {
		setSelectedType(type);
		setFormData({
			codigo: type.codigo,
			nombre: type.nombre,
			categoria: type.categoria,
			prioridad: type.prioridad,
			esActivo: type.esActivo,
		});
		setIsEditModalOpen(true);
	};

	const openDeleteDialog = (type: TipoIncidenciaDto) => {
		setSelectedType(type);
		setIsDeleteDialogOpen(true);
	};

	const filteredTypes = types.filter(
		(type) =>
			type.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
			type.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
			type.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
	);

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
						<AlertCircle className="h-8 w-8 text-primary" />
						Tipos de Incidencias
					</h1>
					<p className="text-muted-foreground mt-1">Administración de categorías de incidencias</p>
				</div>
				{allowed && (
					<Button onClick={() => setIsCreateModalOpen(true)} className="shadow-sm">
						<Plus className="mr-2 h-4 w-4" />
						Nuevo Tipo
					</Button>
				)}
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
						<AlertCircle className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{types.length}</div>
						<p className="text-xs text-muted-foreground mt-1">Tipos registrados</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Activos</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{types.filter((t) => t.esActivo).length}</div>
						<p className="text-xs text-muted-foreground mt-1">En uso</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Inactivos</CardTitle>
						<XCircle className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{types.filter((t) => !t.esActivo).length}</div>
						<p className="text-xs text-muted-foreground mt-1">Deshabilitados</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters & List */}
			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
						<CardTitle className="text-lg">Listado de Tipos</CardTitle>
						<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
							<div className="relative flex-1 md:w-[300px]">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Buscar tipos..."
									value={searchTerm}
									onChange={(e) => {
										setSearchTerm(e.target.value);
										setCurrentPage(1);
									}}
									className="pl-9"
								/>
							</div>
							<div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-white">
								<Switch
									checked={showInactive}
									onCheckedChange={(val) => {
										setShowInactive(val);
										setCurrentPage(1);
									}}
								/>
								<Label className="text-sm cursor-pointer" onClick={() => setShowInactive(!showInactive)}>
									Mostrar inactivos
								</Label>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Código</TableHead>
									<TableHead>Nombre</TableHead>
									<TableHead>Categoría</TableHead>
									<TableHead>Prioridad</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead className="text-right">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={6} className="h-24 text-center">
											<div className="flex items-center justify-center">
												<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
											</div>
										</TableCell>
									</TableRow>
								) : filteredTypes.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="h-32 text-center">
											<div className="flex flex-col items-center justify-center gap-2 py-8">
												<AlertCircle className="h-12 w-12 text-muted-foreground/50" />
												<p className="text-muted-foreground font-medium">No se encontraron tipos</p>
												<p className="text-sm text-muted-foreground">
													{searchTerm ? "Intenta ajustar tu búsqueda" : "No hay tipos registrados"}
												</p>
											</div>
										</TableCell>
									</TableRow>
								) : (
									filteredTypes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((type) => (
										<TableRow key={type.tipoIncidenciaID} className="hover:bg-gray-50/50">
											<TableCell className="font-mono text-xs">{type.codigo}</TableCell>
											<TableCell className="font-medium">{type.nombre}</TableCell>
											<TableCell>
												<Badge variant="outline">{type.categoria}</Badge>
											</TableCell>
											<TableCell>
												{type.prioridad === "Baja" && (
													<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
														Baja
													</Badge>
												)}
												{type.prioridad === "Media" && (
													<Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
														Media
													</Badge>
												)}
												{type.prioridad === "Alta" && (
													<Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
														Alta
													</Badge>
												)}
												{type.prioridad === "Crítica" && (
													<Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
														Crítica
													</Badge>
												)}
											</TableCell>
											<TableCell>
												{type.esActivo ? (
													<Badge className="bg-green-100 text-green-700 border-green-200">Activo</Badge>
												) : (
													<Badge className="bg-red-100 text-red-700 border-red-200">Inactivo</Badge>
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button variant="ghost" size="sm" onClick={() => openEditModal(type)}>
														<Edit2 className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => openDeleteDialog(type)}
														className="text-destructive hover:text-destructive"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{filteredTypes.length > 0 && (
						<div className="flex items-center justify-between mt-4">
							<p className="text-sm text-muted-foreground">
								Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTypes.length)} a{" "}
								{Math.min(currentPage * itemsPerPage, filteredTypes.length)} de {filteredTypes.length} tipos
							</p>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={currentPage === 1}
									onClick={() => setCurrentPage(currentPage - 1)}
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<span className="text-sm">
									Página {currentPage} de {Math.ceil(filteredTypes.length / itemsPerPage)}
								</span>
								<Button
									variant="outline"
									size="sm"
									disabled={currentPage >= Math.ceil(filteredTypes.length / itemsPerPage)}
									onClick={() => setCurrentPage(currentPage + 1)}
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
			<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Crear Nuevo Tipo de Incidencia</DialogTitle>
						<DialogDescription>Complete la información para crear un nuevo tipo de incidencia.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="codigo">
								Código <span className="text-destructive">*</span>
							</Label>
							<Input
								id="codigo"
								value={formData.codigo}
								onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
								placeholder="ej: INC-001"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="nombre">
								Nombre <span className="text-destructive">*</span>
							</Label>
							<Input
								id="nombre"
								value={formData.nombre}
								onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
								placeholder="ej: Problema Mecánico"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="categoria">
								Categoría <span className="text-destructive">*</span>
							</Label>
							<Input
								id="categoria"
								value={formData.categoria}
								onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
								placeholder="ej: Vehículo, Personal, Ruta"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="prioridad">
								Prioridad por Defecto <span className="text-destructive">*</span>
							</Label>
							<Select value={formData.prioridad} onValueChange={(val) => setFormData({ ...formData, prioridad: val })}>
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
						<Button
							variant="outline"
							onClick={() => {
								setIsCreateModalOpen(false);
								resetForm();
							}}
							disabled={createMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							onClick={() => {
								const { esActivo: _esActivo, ...data } = formData;
								createMutation.mutate(data);
							}}
							disabled={
								createMutation.isPending ||
								!formData.codigo ||
								!formData.nombre ||
								!formData.categoria ||
								!formData.prioridad
							}
						>
							{createMutation.isPending ? "Creando..." : "Crear Tipo"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Modal */}
			<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Editar Tipo de Incidencia</DialogTitle>
						<DialogDescription>Modifique la información del tipo de incidencia.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="edit-codigo">
								Código <span className="text-destructive">*</span>
							</Label>
							<Input
								id="edit-codigo"
								value={formData.codigo}
								onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
								placeholder="ej: INC-001"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-nombre">
								Nombre <span className="text-destructive">*</span>
							</Label>
							<Input
								id="edit-nombre"
								value={formData.nombre}
								onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
								placeholder="ej: Problema Mecánico"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-categoria">
								Categoría <span className="text-destructive">*</span>
							</Label>
							<Input
								id="edit-categoria"
								value={formData.categoria}
								onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
								placeholder="ej: Vehículo, Personal, Ruta"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-prioridad">
								Prioridad por Defecto <span className="text-destructive">*</span>
							</Label>
							<Select value={formData.prioridad} onValueChange={(val) => setFormData({ ...formData, prioridad: val })}>
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
						<div className="flex items-center space-x-2">
							<Switch
								id="edit-activo"
								checked={formData.esActivo}
								onCheckedChange={(checked) => setFormData({ ...formData, esActivo: checked })}
							/>
							<Label htmlFor="edit-activo" className="cursor-pointer">
								Tipo activo
							</Label>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsEditModalOpen(false);
								setSelectedType(null);
								resetForm();
							}}
							disabled={updateMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							onClick={() => {
								if (selectedType) {
									updateMutation.mutate({
										id: selectedType.tipoIncidenciaID,
										data: formData,
									});
								}
							}}
							disabled={
								updateMutation.isPending ||
								!formData.codigo ||
								!formData.nombre ||
								!formData.categoria ||
								!formData.prioridad
							}
						>
							{updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción eliminará permanentemente el tipo de incidencia{" "}
							<span className="font-semibold">{selectedType?.nombre}</span>. Esta acción no se puede deshacer.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => {
								setSelectedType(null);
							}}
						>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (selectedType) {
									deleteMutation.mutate(selectedType.tipoIncidenciaID);
								}
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
