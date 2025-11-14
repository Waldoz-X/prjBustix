import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Calendar,
	Check,
	Edit,
	Eye,
	Loader2,
	MoreHorizontal,
	Percent,
	Plus,
	Search,
	Tag,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import cuponesService, { type CreateCuponDto, type CuponDto, type UpdateCuponDto } from "@/api/services/cuponesService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
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
import { Switch } from "@/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { handleApiError } from "@/utils/error-handler";

export default function CuponesPage() {
	const queryClient = useQueryClient();

	// Estados de UI
	const [searchTerm, setSearchTerm] = useState("");
	const [activosFilter, setActivosFilter] = useState<boolean | undefined>(undefined);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
	const [selectedCupon, setSelectedCupon] = useState<CuponDto | null>(null);

	// Estados del formulario
	const [formData, setFormData] = useState<Partial<CreateCuponDto>>({
		codigo: "",
		descripcion: "",
		tipoDescuento: "Porcentaje",
		valorDescuento: 0,
		usosMaximos: 1,
		fechaInicio: new Date().toISOString().split("T")[0],
		fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
		esActivo: true,
	});

	// Query para obtener cupones
	const { data: cupones = [], isLoading } = useQuery({
		queryKey: ["cupones", activosFilter, searchTerm],
		queryFn: () => cuponesService.getAllCupones(activosFilter, searchTerm),
	});

	// Mutations
	const createMutation = useMutation({
		mutationFn: (data: CreateCuponDto) => cuponesService.createCupon(data),
		onSuccess: async () => {
			// Forzar refetch inmediato
			await queryClient.refetchQueries({ queryKey: ["cupones"] });

			toast.success("Cupón creado exitosamente", {
				description: "El cupón se ha agregado correctamente a la lista",
			});
			setIsCreateDialogOpen(false);
			resetForm();
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al crear cupón", { description: safeError.userMessage });
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateCuponDto }) => cuponesService.updateCupon(id, data),
		onSuccess: async () => {
			// Forzar refetch inmediato
			await queryClient.refetchQueries({ queryKey: ["cupones"] });

			toast.success("Cupón actualizado exitosamente", {
				description: "Los cambios se han guardado correctamente",
			});
			setIsEditDialogOpen(false);
			setSelectedCupon(null);
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al actualizar cupón", { description: safeError.userMessage });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => cuponesService.deleteCupon(id),
		onSuccess: async () => {
			// Forzar refetch inmediato
			await queryClient.refetchQueries({ queryKey: ["cupones"] });

			toast.success("Cupón eliminado exitosamente", {
				description: "El cupón ha sido eliminado de la lista",
			});
			setIsDeleteDialogOpen(false);
			setSelectedCupon(null);
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al eliminar cupón", { description: safeError.userMessage });
		},
	});

	// Handlers
	const resetForm = () => {
		setFormData({
			codigo: "",
			descripcion: "",
			tipoDescuento: "Porcentaje",
			valorDescuento: 0,
			usosMaximos: 1,
			fechaInicio: new Date().toISOString().split("T")[0],
			fechaExpiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
			esActivo: true,
		});
	};

	const handleCreate = () => {
		// Validación de código
		if (!formData.codigo || formData.codigo.trim() === "") {
			toast.error("Código requerido", {
				description: "Debes ingresar un código para el cupón",
			});
			return;
		}

		// Validación de descripción
		if (!formData.descripcion || formData.descripcion.trim() === "") {
			toast.error("Descripción requerida", {
				description: "Debes ingresar una descripción para el cupón",
			});
			return;
		}

		// Validación de valor de descuento
		if (!formData.valorDescuento || formData.valorDescuento <= 0) {
			toast.error("Valor de descuento inválido", {
				description: "El valor del descuento debe ser mayor a 0",
			});
			return;
		}

		// Validación específica para porcentaje
		if (formData.tipoDescuento === "Porcentaje" && formData.valorDescuento > 100) {
			toast.error("Porcentaje inválido", {
				description: "El porcentaje no puede ser mayor a 100%",
			});
			return;
		}

		// Validación de usos máximos
		if (!formData.usosMaximos || formData.usosMaximos < 1) {
			toast.error("Usos máximos inválido", {
				description: "Los usos máximos deben ser al menos 1",
			});
			return;
		}

		// Validación de fechas
		if (!formData.fechaInicio || !formData.fechaExpiracion) {
			toast.error("Fechas requeridas", {
				description: "Debes seleccionar fecha de inicio y expiración",
			});
			return;
		}

		const fechaInicio = new Date(formData.fechaInicio);
		const fechaExpiracion = new Date(formData.fechaExpiracion);

		// Validar que fecha de expiración sea posterior a fecha de inicio
		if (fechaExpiracion <= fechaInicio) {
			toast.error("Fechas inválidas", {
				description: "La fecha de expiración debe ser posterior a la fecha de inicio",
			});
			return;
		}

		// Convertir fechas de YYYY-MM-DD a formato ISO completo
		const dataToSend: CreateCuponDto = {
			...formData,
			codigo: formData.codigo.trim().toUpperCase(),
			descripcion: formData.descripcion.trim(),
			fechaInicio: new Date(formData.fechaInicio + "T00:00:00").toISOString(),
			fechaExpiracion: new Date(formData.fechaExpiracion + "T23:59:59").toISOString(),
		} as CreateCuponDto;

		createMutation.mutate(dataToSend);
	};

	const handleEdit = (cupon: CuponDto) => {
		setSelectedCupon(cupon);
		setFormData({
			descripcion: cupon.descripcion,
			tipoDescuento: cupon.tipoDescuento,
			valorDescuento: cupon.valorDescuento,
			usosMaximos: cupon.usosMaximos,
			fechaInicio: cupon.fechaInicio.split("T")[0],
			fechaExpiracion: cupon.fechaExpiracion.split("T")[0],
			esActivo: cupon.esActivo,
		});
		setIsEditDialogOpen(true);
	};

	const handleUpdate = () => {
		if (!selectedCupon) return;

		// Validación de descripción
		if (!formData.descripcion || formData.descripcion.trim() === "") {
			toast.error("Descripción requerida", {
				description: "Debes ingresar una descripción para el cupón",
			});
			return;
		}

		// Validación de valor de descuento
		if (!formData.valorDescuento || formData.valorDescuento <= 0) {
			toast.error("Valor de descuento inválido", {
				description: "El valor del descuento debe ser mayor a 0",
			});
			return;
		}

		// Validación específica para porcentaje
		if (formData.tipoDescuento === "Porcentaje" && formData.valorDescuento > 100) {
			toast.error("Porcentaje inválido", {
				description: "El porcentaje no puede ser mayor a 100%",
			});
			return;
		}

		// Validación de usos máximos
		if (!formData.usosMaximos || formData.usosMaximos < 1) {
			toast.error("Usos máximos inválido", {
				description: "Los usos máximos deben ser al menos 1",
			});
			return;
		}

		// Validación de fechas
		if (!formData.fechaInicio || !formData.fechaExpiracion) {
			toast.error("Fechas requeridas", {
				description: "Debes seleccionar fecha de inicio y expiración",
			});
			return;
		}

		const fechaInicio = new Date(formData.fechaInicio);
		const fechaExpiracion = new Date(formData.fechaExpiracion);

		// Validar que fecha de expiración sea posterior a fecha de inicio
		if (fechaExpiracion <= fechaInicio) {
			toast.error("Fechas inválidas", {
				description: "La fecha de expiración debe ser posterior a la fecha de inicio",
			});
			return;
		}

		// Convertir fechas de YYYY-MM-DD a formato ISO completo
		const dataToSend: UpdateCuponDto = {
			...formData,
			descripcion: formData.descripcion.trim(),
			fechaInicio: new Date(formData.fechaInicio + "T00:00:00").toISOString(),
			fechaExpiracion: new Date(formData.fechaExpiracion + "T23:59:59").toISOString(),
		} as UpdateCuponDto;

		updateMutation.mutate({
			id: selectedCupon.cuponID,
			data: dataToSend,
		});
	};

	const handleDelete = (cupon: CuponDto) => {
		setSelectedCupon(cupon);
		setIsDeleteDialogOpen(true);
	};

	const handleViewDetails = (cupon: CuponDto) => {
		setSelectedCupon(cupon);
		setIsDetailsDialogOpen(true);
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("es-MX", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Tag className="h-8 w-8" />
						Gestión de Cupones
					</h1>
					<p className="text-muted-foreground mt-2">Administra cupones de descuento y promociones</p>
				</div>
				<Button onClick={() => setIsCreateDialogOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Crear Cupón
				</Button>
			</div>

			{/* Filtros */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Filtros</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<Label htmlFor="search">
								<Search className="inline mr-2 h-4 w-4" />
								Buscar
							</Label>
							<Input
								id="search"
								placeholder="Código o descripción..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="statusFilter">Estado</Label>
							<Select
								value={activosFilter === undefined ? "all" : activosFilter.toString()}
								onValueChange={(val) => setActivosFilter(val === "all" ? undefined : val === "true")}
							>
								<SelectTrigger id="statusFilter">
									<SelectValue placeholder="Todos" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos</SelectItem>
									<SelectItem value="true">Activos</SelectItem>
									<SelectItem value="false">Inactivos</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-end">
							<div className="text-sm text-muted-foreground">
								Mostrando <span className="font-bold">{cupones.length}</span> cupones
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabla de Cupones */}
			<Card>
				<CardHeader>
					<CardTitle>Lista de Cupones</CardTitle>
					<CardDescription>Todos los cupones de descuento disponibles en el sistema</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center min-h-[400px]">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : cupones.length > 0 ? (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Código</TableHead>
										<TableHead>Descripción</TableHead>
										<TableHead>Tipo</TableHead>
										<TableHead className="text-right">Descuento</TableHead>
										<TableHead className="text-center">Usos</TableHead>
										<TableHead>Vigencia</TableHead>
										<TableHead className="text-center">Estado</TableHead>
										<TableHead className="text-right">Acciones</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{cupones.map((cupon) => (
										<TableRow key={cupon.cuponID}>
											<TableCell className="font-mono font-bold">{cupon.codigo}</TableCell>
											<TableCell className="max-w-xs truncate">{cupon.descripcion}</TableCell>
											<TableCell>
												<Badge variant="outline">{cupon.tipoDescuento}</Badge>
											</TableCell>
											<TableCell className="text-right font-semibold">
												{cupon.tipoDescuento === "Porcentaje" ? (
													<span className="text-green-600">{cupon.valorDescuento}%</span>
												) : (
													<span className="text-green-600">{formatCurrency(cupon.valorDescuento)}</span>
												)}
											</TableCell>
											<TableCell className="text-center">
												<div className="text-sm">
													<span className="font-bold">{cupon.usosRealizados}</span>
													<span className="text-muted-foreground"> / {cupon.usosMaximos}</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="text-xs space-y-1">
													<div className="flex items-center gap-1">
														<Calendar className="h-3 w-3" />
														{formatDate(cupon.fechaInicio)}
													</div>
													<div className="flex items-center gap-1">
														<Calendar className="h-3 w-3" />
														{formatDate(cupon.fechaExpiracion)}
													</div>
												</div>
											</TableCell>
											<TableCell className="text-center">
												{cupon.estaVigente ? (
													<Badge variant="default" className="bg-green-600">
														<Check className="h-3 w-3 mr-1" />
														Vigente
													</Badge>
												) : (
													<Badge variant="secondary">
														<X className="h-3 w-3 mr-1" />
														Expirado
													</Badge>
												)}
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
														<DropdownMenuItem onClick={() => handleViewDetails(cupon)}>
															<Eye className="mr-2 h-4 w-4" />
															Ver detalles
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleEdit(cupon)}>
															<Edit className="mr-2 h-4 w-4" />
															Editar
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={() => handleDelete(cupon)} className="text-destructive">
															<Trash2 className="mr-2 h-4 w-4" />
															Eliminar
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
						<div className="flex flex-col items-center justify-center min-h-[400px] text-center">
							<Tag className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">No hay cupones</h3>
							<p className="text-muted-foreground mb-4">Comienza creando tu primer cupón de descuento</p>
							<Button onClick={() => setIsCreateDialogOpen(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Crear Cupón
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Dialog: Crear Cupón */}
			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Crear Nuevo Cupón</DialogTitle>
						<DialogDescription>Completa la información del cupón de descuento</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="codigo">
									Código <span className="text-destructive">*</span>
								</Label>
								<Input
									id="codigo"
									placeholder="VERANO2024"
									value={formData.codigo}
									onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="tipoDescuento">Tipo de Descuento</Label>
								<Select
									value={formData.tipoDescuento}
									onValueChange={(val) => setFormData({ ...formData, tipoDescuento: val })}
								>
									<SelectTrigger id="tipoDescuento">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Porcentaje">
											<div className="flex items-center gap-2">
												<Percent className="h-4 w-4" />
												Porcentaje
											</div>
										</SelectItem>
										<SelectItem value="MontoFijo">Monto Fijo</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="descripcion">
								Descripción <span className="text-destructive">*</span>
							</Label>
							<Input
								id="descripcion"
								placeholder="Ej: Descuento de verano 2024"
								value={formData.descripcion}
								onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="valorDescuento">
									Valor Descuento {formData.tipoDescuento === "Porcentaje" ? "(%)" : "($)"}
								</Label>
								<Input
									id="valorDescuento"
									type="number"
									min="0"
									max={formData.tipoDescuento === "Porcentaje" ? "100" : undefined}
									value={formData.valorDescuento}
									onChange={(e) => setFormData({ ...formData, valorDescuento: Number(e.target.value) })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="usosMaximos">Usos Máximos</Label>
								<Input
									id="usosMaximos"
									type="number"
									min="1"
									value={formData.usosMaximos}
									onChange={(e) => setFormData({ ...formData, usosMaximos: Number(e.target.value) })}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="fechaInicio">Fecha Inicio</Label>
								<Input
									id="fechaInicio"
									type="date"
									value={formData.fechaInicio}
									onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="fechaExpiracion">Fecha Expiración</Label>
								<Input
									id="fechaExpiracion"
									type="date"
									value={formData.fechaExpiracion}
									onChange={(e) => setFormData({ ...formData, fechaExpiracion: e.target.value })}
								/>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<Switch
								id="esActivo"
								checked={formData.esActivo}
								onCheckedChange={(checked) => setFormData({ ...formData, esActivo: checked })}
							/>
							<Label htmlFor="esActivo">Cupón activo</Label>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleCreate} disabled={createMutation.isPending}>
							{createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Crear Cupón
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Dialog: Editar Cupón */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Editar Cupón</DialogTitle>
						<DialogDescription>Código: {selectedCupon?.codigo}</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						{/* Similar al crear pero sin código */}
						<div className="space-y-2">
							<Label htmlFor="edit-descripcion">Descripción</Label>
							<Input
								id="edit-descripcion"
								value={formData.descripcion}
								onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="edit-tipoDescuento">Tipo de Descuento</Label>
								<Select
									value={formData.tipoDescuento}
									onValueChange={(val) => setFormData({ ...formData, tipoDescuento: val })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Porcentaje">Porcentaje</SelectItem>
										<SelectItem value="MontoFijo">Monto Fijo</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-valorDescuento">Valor Descuento</Label>
								<Input
									id="edit-valorDescuento"
									type="number"
									value={formData.valorDescuento}
									onChange={(e) => setFormData({ ...formData, valorDescuento: Number(e.target.value) })}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="edit-usosMaximos">Usos Máximos</Label>
								<Input
									id="edit-usosMaximos"
									type="number"
									value={formData.usosMaximos}
									onChange={(e) => setFormData({ ...formData, usosMaximos: Number(e.target.value) })}
								/>
							</div>
							<div className="flex items-center space-x-2 pt-8">
								<Switch
									id="edit-esActivo"
									checked={formData.esActivo}
									onCheckedChange={(checked) => setFormData({ ...formData, esActivo: checked })}
								/>
								<Label htmlFor="edit-esActivo">Cupón activo</Label>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="edit-fechaInicio">Fecha Inicio</Label>
								<Input
									id="edit-fechaInicio"
									type="date"
									value={formData.fechaInicio}
									onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="edit-fechaExpiracion">Fecha Expiración</Label>
								<Input
									id="edit-fechaExpiracion"
									type="date"
									value={formData.fechaExpiracion}
									onChange={(e) => setFormData({ ...formData, fechaExpiracion: e.target.value })}
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleUpdate} disabled={updateMutation.isPending}>
							{updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Guardar Cambios
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Dialog: Eliminar Cupón */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Eliminar Cupón</DialogTitle>
						<DialogDescription>Esta acción no se puede deshacer</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm">
							¿Estás seguro de eliminar el cupón <span className="font-bold">{selectedCupon?.codigo}</span>?
						</p>
						{selectedCupon && selectedCupon.usosRealizados > 0 && (
							<p className="text-sm text-amber-600 mt-2">
								⚠️ Este cupón tiene {selectedCupon.usosRealizados} usos registrados.
							</p>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={() => selectedCupon && deleteMutation.mutate(selectedCupon.cuponID)}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Eliminar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Dialog: Ver Detalles */}
			<Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Detalles del Cupón</DialogTitle>
					</DialogHeader>
					{selectedCupon && (
						<div className="space-y-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-muted-foreground text-xs">Código</Label>
									<p className="font-mono font-bold text-lg">{selectedCupon.codigo}</p>
								</div>
								<div>
									<Label className="text-muted-foreground text-xs">Estado</Label>
									<div>
										{selectedCupon.estaVigente ? (
											<Badge variant="default" className="bg-green-600">
												Vigente
											</Badge>
										) : (
											<Badge variant="secondary">Expirado</Badge>
										)}
										{selectedCupon.esActivo && <Badge variant="outline">Activo</Badge>}
									</div>
								</div>
							</div>

							<div>
								<Label className="text-muted-foreground text-xs">Descripción</Label>
								<p>{selectedCupon.descripcion}</p>
							</div>

							<div className="grid grid-cols-3 gap-4">
								<div>
									<Label className="text-muted-foreground text-xs">Tipo</Label>
									<p className="font-medium">{selectedCupon.tipoDescuento}</p>
								</div>
								<div>
									<Label className="text-muted-foreground text-xs">Descuento</Label>
									<p className="font-bold text-green-600">
										{selectedCupon.tipoDescuento === "Porcentaje"
											? `${selectedCupon.valorDescuento}%`
											: formatCurrency(selectedCupon.valorDescuento)}
									</p>
								</div>
								<div>
									<Label className="text-muted-foreground text-xs">Usos</Label>
									<p className="font-medium">
										{selectedCupon.usosRealizados} / {selectedCupon.usosMaximos}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label className="text-muted-foreground text-xs">Fecha Inicio</Label>
									<p>{formatDate(selectedCupon.fechaInicio)}</p>
								</div>
								<div>
									<Label className="text-muted-foreground text-xs">Fecha Expiración</Label>
									<p>{formatDate(selectedCupon.fechaExpiracion)}</p>
								</div>
							</div>

							<div>
								<Label className="text-muted-foreground text-xs">Fecha Creación</Label>
								<p className="text-sm">{new Date(selectedCupon.fechaCreacion).toLocaleString("es-MX")}</p>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
							Cerrar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
