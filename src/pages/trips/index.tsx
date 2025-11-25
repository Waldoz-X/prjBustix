import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
	Bus,
	Calendar,
	Copy,
	Edit,
	Eye,
	Filter,
	MapPin,
	MoreHorizontal,
	Plus,
	Tag,
	Trash2,
	User,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import userService from "@/api/services/userService";
import viajesService, { type ViajeDto, type ViajesFilterParams } from "@/api/services/viajesService";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { CreateTripModal } from "./create-trip-modal";
import { EditTripModal } from "./edit-trip-modal";
import { PricingModal } from "./pricing-modal";

export default function TripsPage() {
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isAdmin || isManager;
	const queryClient = useQueryClient();

	const [searchTerm, setSearchTerm] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [filters, setFilters] = useState<ViajesFilterParams>({});
	const [selectedTrip, setSelectedTrip] = useState<ViajeDto | null>(null);
	const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
	const [tripToDelete, setTripToDelete] = useState<ViajeDto | null>(null);
	const [tripToEdit, setTripToEdit] = useState<ViajeDto | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [tripToAssignStaff, setTripToAssignStaff] = useState<ViajeDto | null>(null);
	const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);
	const [tripToConfigurePrices, setTripToConfigurePrices] = useState<ViajeDto | null>(null);
	const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

	const { data: viajes = [], isLoading } = useQuery({
		queryKey: ["viajes", searchTerm, filters],
		queryFn: () => viajesService.getAllViajes(filters),
		enabled: allowed,
	});

	// Fetch users for staff assignment
	const { data: users = [], isLoading: isLoadingUsers } = useQuery({
		queryKey: ["users"],
		queryFn: userService.getAllUsers,
		enabled: isAssignStaffModalOpen,
	});

	// Filter users with "Staff" role
	const staffUsers = useMemo(() => users.filter((u) => u.roles?.includes("Staff")), [users]);

	const deleteMutation = useMutation({
		mutationFn: viajesService.deleteViaje,
		onSuccess: () => {
			toast.success("Viaje eliminado exitosamente");
			queryClient.invalidateQueries({ queryKey: ["viajes"] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al eliminar el viaje");
		},
	});

	const assignStaffMutation = useMutation({
		mutationFn: (data: { viajeId: number; staffId: string; rol: string; observaciones?: string }) =>
			viajesService.assignStaff(data.viajeId, {
				staffID: data.staffId,
				rolEnViaje: data.rol,
				observaciones: data.observaciones,
			}),
		onSuccess: () => {
			toast.success("Staff asignado exitosamente");
			queryClient.invalidateQueries({ queryKey: ["viajes"] });
			setIsAssignStaffModalOpen(false);
		},
		onError: (error: any) => {
			console.error("Error asignando staff:", error);
			if (error.errors) {
				const errorMessages = Object.values(error.errors).flat().join("\n");
				toast.error("Error de validación", { description: errorMessages });
			} else {
				toast.error(error.message || "Error al asignar staff");
			}
		},
	});

	const copyBasePricesMutation = useMutation({
		mutationFn: (viajeId: number) => viajesService.copiarPreciosBase(viajeId),
		onSuccess: () => {
			toast.success("Precios base copiados exitosamente");
			queryClient.invalidateQueries({ queryKey: ["viajes"] });
		},
		onError: (error: any) => {
			console.error("Error copiando precios base:", error);
			toast.error("No se pudieron copiar los precios base", {
				description: "Verifica que el viaje tenga una ruta con precios configurados.",
			});
		},
	});

	if (!allowed) {
		return (
			<div className="p-6">
				<Card>
					<CardHeader>
						<CardTitle>Acceso denegado</CardTitle>
					</CardHeader>
					<CardContent>
						<p>No tienes permisos para ver esta página.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const handleViewDetails = (trip: ViajeDto) => {
		setSelectedTrip(trip);
		setIsViewDetailsOpen(true);
	};

	const handleEditClick = (trip: ViajeDto) => {
		setTripToEdit(trip);
		setIsEditModalOpen(true);
	};

	const handleDeleteClick = (trip: ViajeDto) => {
		setTripToDelete(trip);
	};

	const handleAssignStaffClick = (trip: ViajeDto) => {
		setTripToAssignStaff(trip);
		setIsAssignStaffModalOpen(true);
	};

	const handleConfigurePricesClick = (trip: ViajeDto) => {
		setTripToConfigurePrices(trip);
		setIsPricingModalOpen(true);
	};

	const confirmDelete = () => {
		if (tripToDelete) {
			deleteMutation.mutate(tripToDelete.viajeID);
			setTripToDelete(null);
		}
	};

	const handleFilterChange = (key: keyof ViajesFilterParams, value: any) => {
		setFilters((prev) => {
			const newFilters = { ...prev, [key]: value };
			// Remove undefined/empty values
			if (!value) delete newFilters[key];
			return newFilters;
		});
	};

	const clearFilters = () => {
		setFilters({});
		setSearchTerm("");
	};

	const columns: ColumnsType<ViajeDto> = [
		{
			title: "Código",
			dataIndex: "codigoViaje",
			key: "codigoViaje",
			render: (text) => <span className="font-mono font-bold">{text}</span>,
		},
		{
			title: "Evento",
			dataIndex: "eventoNombre",
			key: "eventoNombre",
		},
		{
			title: "Ruta",
			dataIndex: "rutaNombre",
			key: "rutaNombre",
			render: (text, record) => (
				<div className="flex flex-col">
					<span className="font-medium">{text}</span>
					<div className="flex items-center text-xs text-muted-foreground">
						<MapPin className="h-3 w-3 mr-1" />
						{record.ciudadOrigen} - {record.ciudadDestino}
					</div>
				</div>
			),
		},
		{
			title: "Salida",
			dataIndex: "fechaSalida",
			key: "fechaSalida",
			render: (date) => (
				<div className="flex items-center">
					<Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
					{new Date(date).toLocaleString()}
				</div>
			),
		},
		{
			title: "Unidad / Chofer",
			key: "unidad",
			render: (_, record) => (
				<div className="flex flex-col text-sm">
					<span className="font-medium">{record.unidadPlacas}</span>
					<span className="text-xs text-muted-foreground">{record.choferNombre}</span>
				</div>
			),
		},
		{
			title: "Ocupación",
			key: "ocupacion",
			render: (_, record) => (
				<div className="flex items-center gap-2">
					<Users className="h-4 w-4 text-muted-foreground" />
					<span>
						{record.asientosVendidos} / {record.cupoTotal}
					</span>
					<Badge variant={record.asientosDisponibles === 0 ? "destructive" : "secondary"}>
						{record.asientosDisponibles === 0 ? "Lleno" : "Disp"}
					</Badge>
				</div>
			),
		},
		{
			title: "Estado",
			dataIndex: "estatusNombre",
			key: "estatus",
			render: (status) => <Badge variant="outline">{status}</Badge>,
		},
		{
			title: "Acciones",
			key: "actions",
			render: (_, record) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Acciones</DropdownMenuLabel>
						<DropdownMenuItem onClick={() => handleViewDetails(record)}>
							<Eye className="mr-2 h-4 w-4" /> Ver detalles
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleEditClick(record)}>
							<Edit className="mr-2 h-4 w-4" /> Editar
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleAssignStaffClick(record)}>
							<UserPlus className="mr-2 h-4 w-4" /> Asignar Staff
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleConfigurePricesClick(record)}>
							<Tag className="mr-2 h-4 w-4" /> Configurar Precios
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => copyBasePricesMutation.mutate(record.viajeID)}
							disabled={copyBasePricesMutation.isPending}
						>
							<Copy className="mr-2 h-4 w-4" /> Copiar Precios Base
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(record)}>
							<Trash2 className="mr-2 h-4 w-4" /> Eliminar
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	// Client-side filtering for search term if API doesn't support it directly in the same way
	// But we are passing filters to API now. If search term is separate, we can keep client side filter or add it to API params if supported.
	// The API has specific fields. Let's keep client side search for quick text search on top of API filters.
	const filteredViajes = viajes.filter(
		(v) =>
			!searchTerm ||
			v.codigoViaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
			v.eventoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
			v.rutaNombre.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Bus className="h-8 w-8" />
						Gestión de Viajes
					</h1>
					<p className="text-muted-foreground mt-2">Administración de viajes y rutas</p>
				</div>
				<Button onClick={() => setIsCreateModalOpen(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Nuevo Viaje
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Filtros</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4 items-end">
						<div className="flex-1">
							<Input
								placeholder="Buscar por código, evento o ruta..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full"
							/>
						</div>
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline">
									<Filter className="mr-2 h-4 w-4" />
									Filtros Avanzados
									{Object.keys(filters).length > 0 && (
										<Badge variant="secondary" className="ml-2">
											{Object.keys(filters).length}
										</Badge>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80">
								<div className="space-y-4">
									<h4 className="font-medium leading-none">Filtros de Viaje</h4>
									<div className="space-y-2">
										<Label htmlFor="estatus">Estatus</Label>
										<Select
											value={filters.estatus?.toString()}
											onValueChange={(val) => handleFilterChange("estatus", Number(val))}
										>
											<SelectTrigger id="estatus">
												<SelectValue placeholder="Todos" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="0">Programado</SelectItem>
												<SelectItem value="1">En Curso</SelectItem>
												<SelectItem value="2">Finalizado</SelectItem>
												<SelectItem value="3">Cancelado</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="ciudadOrigen">Ciudad Origen</Label>
										<Input
											id="ciudadOrigen"
											value={filters.ciudadOrigen || ""}
											onChange={(e) => handleFilterChange("ciudadOrigen", e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="ciudadDestino">Ciudad Destino</Label>
										<Input
											id="ciudadDestino"
											value={filters.ciudadDestino || ""}
											onChange={(e) => handleFilterChange("ciudadDestino", e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="fechaDesde">Fecha Desde</Label>
										<Input
											id="fechaDesde"
											type="date"
											value={filters.fechaDesde || ""}
											onChange={(e) => handleFilterChange("fechaDesde", e.target.value)}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="fechaHasta">Fecha Hasta</Label>
										<Input
											id="fechaHasta"
											type="date"
											value={filters.fechaHasta || ""}
											onChange={(e) => handleFilterChange("fechaHasta", e.target.value)}
										/>
									</div>
									<Button variant="ghost" className="w-full" onClick={() => setFilters({})}>
										Limpiar Filtros
									</Button>
								</div>
							</PopoverContent>
						</Popover>
						{(searchTerm || Object.keys(filters).length > 0) && (
							<Button variant="ghost" onClick={clearFilters}>
								<X className="mr-2 h-4 w-4" />
								Limpiar
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-0">
					<Table
						dataSource={filteredViajes}
						columns={columns}
						rowKey="viajeID"
						pagination={{ pageSize: 10 }}
						loading={isLoading}
						scroll={{ x: "max-content" }}
					/>
				</CardContent>
			</Card>

			<CreateTripModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />

			{/* Edit Trip Modal */}
			<EditTripModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} trip={tripToEdit} />

			{/* Pricing Configuration Modal */}
			{isPricingModalOpen && tripToConfigurePrices && (
				<PricingModal open={isPricingModalOpen} onOpenChange={setIsPricingModalOpen} trip={tripToConfigurePrices} />
			)}

			{/* View Details Dialog */}
			<Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
				<DialogContent className="!max-w-5xl h-[85vh] flex flex-col p-0">
					<DialogHeader className="px-6 py-4 border-b">
						<DialogTitle className="flex items-center gap-2">
							<Bus className="h-5 w-5" />
							Detalles del Viaje
						</DialogTitle>
					</DialogHeader>
					{selectedTrip && (
						<div className="flex-1 overflow-y-auto p-6">
							<div className="space-y-6">
								{/* Header Info */}
								<div className="flex items-start justify-between pb-4 border-b">
									<div>
										<h3 className="text-3xl font-bold font-mono">{selectedTrip.codigoViaje}</h3>
										<p className="text-lg text-muted-foreground mt-1">{selectedTrip.eventoNombre}</p>
										<p className="text-sm text-muted-foreground">
											Creado: {new Date(selectedTrip.fechaCreacion).toLocaleString()}
										</p>
									</div>
									<Badge variant="outline" className="text-base px-3 py-1">
										{selectedTrip.estatusNombre}
									</Badge>
								</div>

								{/* Main Grid */}
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									<Card>
										<CardHeader>
											<CardTitle className="text-lg flex items-center gap-2">
												<MapPin className="h-4 w-4" />
												Ruta
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div>
												<Label className="text-muted-foreground">Nombre de Ruta</Label>
												<p className="font-medium">{selectedTrip.rutaNombre}</p>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div>
													<Label className="text-muted-foreground">Origen</Label>
													<p className="font-medium">{selectedTrip.ciudadOrigen}</p>
												</div>
												<div>
													<Label className="text-muted-foreground">Destino</Label>
													<p className="font-medium">{selectedTrip.ciudadDestino}</p>
												</div>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div>
													<Label className="text-muted-foreground">Fecha de Salida</Label>
													<p className="font-medium flex items-center gap-2">
														<Calendar className="h-4 w-4" />
														{new Date(selectedTrip.fechaSalida).toLocaleString()}
													</p>
												</div>
												<div>
													<Label className="text-muted-foreground">Llegada Estimada</Label>
													<p className="font-medium flex items-center gap-2">
														<Calendar className="h-4 w-4" />
														{new Date(selectedTrip.fechaLlegadaEstimada).toLocaleString()}
													</p>
												</div>
											</div>
										</CardContent>
									</Card>

									{/* Unit and Driver */}
									<Card>
										<CardHeader>
											<CardTitle className="text-lg flex items-center gap-2">
												<Bus className="h-5 w-5" />
												Unidad y Chofer
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											<div>
												<Label className="text-muted-foreground text-xs">Unidad</Label>
												<p className="font-medium text-base">{selectedTrip.unidadModelo}</p>
												<p className="text-sm text-muted-foreground font-mono">{selectedTrip.unidadPlacas}</p>
											</div>
											<div>
												<Label className="text-muted-foreground text-xs">Chofer Asignado</Label>
												<p className="font-medium flex items-center gap-2">
													<User className="h-4 w-4" />
													{selectedTrip.choferNombre}
												</p>
											</div>
											<div>
												<Label className="text-muted-foreground text-xs">Tipo de Viaje</Label>
												<Badge variant="secondary">{selectedTrip.tipoViaje}</Badge>
											</div>
										</CardContent>
									</Card>

									{/* Capacity */}
									<Card>
										<CardHeader>
											<CardTitle className="text-lg flex items-center gap-2">
												<Users className="h-5 w-5" />
												Ocupación
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-muted-foreground">Cupo Total:</span>
												<span className="font-bold text-lg">{selectedTrip.cupoTotal}</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-muted-foreground">Asientos Vendidos:</span>
												<span className="font-bold text-lg text-green-600">{selectedTrip.asientosVendidos}</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-muted-foreground">Asientos Disponibles:</span>
												<span className="font-bold text-lg text-blue-600">{selectedTrip.asientosDisponibles}</span>
											</div>
											<div className="pt-2">
												<Badge
													variant={selectedTrip.asientosDisponibles === 0 ? "destructive" : "default"}
													className="w-full justify-center text-sm py-2"
												>
													{selectedTrip.asientosDisponibles === 0 ? "🚫 Lleno" : "✓ Disponible"}
												</Badge>
											</div>
										</CardContent>
									</Card>

									{/* Pricing */}
									<Card>
										<CardHeader>
											<CardTitle className="text-lg">Información de Precios</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-muted-foreground">Precio Base:</span>
												<span className="font-medium text-lg">${selectedTrip.precioBase.toFixed(2)}</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-muted-foreground">Cargo de Servicio:</span>
												<span className="font-medium text-lg">${selectedTrip.cargoServicio.toFixed(2)}</span>
											</div>
											<Separator />
											<div className="flex justify-between items-center">
												<span className="font-semibold">Total por Boleto:</span>
												<span className="font-bold text-xl text-primary">
													${(selectedTrip.precioBase + selectedTrip.cargoServicio).toFixed(2)}
												</span>
											</div>
											<div className="pt-2">
												<Badge
													variant={selectedTrip.ventasAbiertas ? "default" : "secondary"}
													className="w-full justify-center text-sm py-2"
												>
													{selectedTrip.ventasAbiertas ? "🎫 Ventas Abiertas" : "🔒 Ventas Cerradas"}
												</Badge>
											</div>
										</CardContent>
									</Card>
								</div>

								{/* Additional Info - Full Width */}
								<Card>
									<CardHeader>
										<CardTitle className="text-lg">Información Adicional</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-3 gap-6">
											<div className="text-center p-4 bg-muted/50 rounded-lg">
												<Label className="text-muted-foreground text-xs">Total Paradas</Label>
												<p className="font-bold text-2xl mt-1">{selectedTrip.totalParadas}</p>
											</div>
											<div className="text-center p-4 bg-muted/50 rounded-lg">
												<Label className="text-muted-foreground text-xs">Staff Asignado</Label>
												<p className="font-bold text-2xl mt-1">{selectedTrip.totalStaff}</p>
											</div>
											<div className="text-center p-4 bg-muted/50 rounded-lg">
												<Label className="text-muted-foreground text-xs">Incidencias</Label>
												<p
													className={`font-bold text-2xl mt-1 ${selectedTrip.totalIncidencias > 0 ? "text-destructive" : ""}`}
												>
													{selectedTrip.totalIncidencias}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Assign Staff Modal */}
			<Dialog open={isAssignStaffModalOpen} onOpenChange={setIsAssignStaffModalOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<UserPlus className="h-5 w-5" />
							Asignar Staff al Viaje
						</DialogTitle>
						<DialogDescription>
							{tripToAssignStaff && (
								<>
									Asignar personal al viaje <strong>{tripToAssignStaff.codigoViaje}</strong> (
									{tripToAssignStaff.eventoNombre})
								</>
							)}
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (!tripToAssignStaff) return;
							const formData = new FormData(e.currentTarget);
							assignStaffMutation.mutate({
								viajeId: tripToAssignStaff.viajeID,
								staffId: formData.get("staffId") as string,
								rol: formData.get("rol") as string,
								observaciones: formData.get("observaciones") as string,
							});
						}}
						className="space-y-4"
					>
						<div className="space-y-2">
							<Label htmlFor="staffId">Staff / Usuario</Label>
							<Select name="staffId" required>
								<SelectTrigger>
									<SelectValue placeholder="Selecciona un miembro del staff" />
								</SelectTrigger>
								<SelectContent>
									{isLoadingUsers ? (
										<div className="p-2 text-center text-sm text-muted-foreground">Cargando usuarios...</div>
									) : staffUsers.length === 0 ? (
										<div className="p-2 text-center text-sm text-muted-foreground">
											No hay usuarios con rol Staff disponibles
										</div>
									) : (
										staffUsers.map((user) => (
											<SelectItem key={user.id} value={user.id}>
												{user.nombreCompleto} ({user.email})
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">Selecciona el usuario que deseas asignar al viaje</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="rol">Rol en Viaje</Label>
							<Select name="rol" required>
								<SelectTrigger>
									<SelectValue placeholder="Selecciona un rol" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Coordinador">Coordinador</SelectItem>
									<SelectItem value="Staff de Apoyo">Staff de Apoyo</SelectItem>
									<SelectItem value="Paramédico">Paramédico</SelectItem>
									<SelectItem value="Seguridad">Seguridad</SelectItem>
									<SelectItem value="Guía Turístico">Guía Turístico</SelectItem>
									<SelectItem value="Asistente">Asistente</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="observaciones">Observaciones (Opcional)</Label>
							<Input id="observaciones" name="observaciones" placeholder="Notas adicionales" />
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsAssignStaffModalOpen(false)}
								disabled={assignStaffMutation.isPending}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={assignStaffMutation.isPending}>
								{assignStaffMutation.isPending ? "Asignando..." : "Asignar Staff"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!tripToDelete} onOpenChange={(open) => !open && setTripToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
						<AlertDialogDescription>
							{tripToDelete && (
								<>
									Estás a punto de eliminar el viaje <strong>{tripToDelete.codigoViaje}</strong> (
									{tripToDelete.eventoNombre}).
									<br />
									<br />
									{tripToDelete.asientosVendidos > 0 && (
										<span className="text-destructive font-medium">
											⚠️ Este viaje tiene {tripToDelete.asientosVendidos} asiento(s) vendido(s). Eliminar este viaje
											afectará a los pasajeros.
										</span>
									)}
									<br />
									Esta acción no se puede deshacer.
								</>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
