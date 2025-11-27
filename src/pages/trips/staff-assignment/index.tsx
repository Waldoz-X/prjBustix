import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Bus,
	Calendar,
	Clock,
	MapPin,
	MoreVertical,
	Pencil,
	Search,
	Shield,
	Trash2,
	UserPlus,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import userService from "@/api/services/userService";
import viajesService, { type ViajeDto } from "@/api/services/viajesService";
import { useHasRole } from "@/hooks/use-session";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { ScrollArea } from "@/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { cn } from "@/utils/index";

export default function StaffAssignmentPage() {
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isAdmin || isManager;
	const queryClient = useQueryClient();

	const [searchTerm, setSearchTerm] = useState("");
	const [selectedViaje, setSelectedViaje] = useState<ViajeDto | null>(null);
	const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
	const [editingAssignment, setEditingAssignment] = useState<any>(null);

	// Fetch trips for search
	const { data: viajes = [] } = useQuery({
		queryKey: ["viajes", searchTerm],
		queryFn: () => viajesService.getAllViajes({}), // TODO: Add search param
		enabled: allowed,
	});

	// Fetch staff for selected trip
	const { data: staffAssignments = [], isLoading: isLoadingStaff } = useQuery({
		queryKey: ["staff", selectedViaje?.viajeID],
		queryFn: () => viajesService.getStaff(selectedViaje?.viajeID ?? 0),
		enabled: !!selectedViaje,
	});

	// Fetch users for staff assignment
	const { data: users = [], isLoading: isLoadingUsers } = useQuery({
		queryKey: ["users"],
		queryFn: userService.getAllUsers,
		enabled: isAssignModalOpen,
	});

	// Filter users with "Staff" role
	const staffUsers = useMemo(() => users.filter((u) => u.roles?.includes("Staff")), [users]);

	// Filter trips client-side for now
	const filteredViajes = useMemo(() => {
		if (!searchTerm) return viajes;
		const lower = searchTerm.toLowerCase();
		return viajes.filter(
			(v) =>
				v.codigoViaje.toLowerCase().includes(lower) ||
				v.eventoNombre.toLowerCase().includes(lower) ||
				v.rutaNombre.toLowerCase().includes(lower),
		);
	}, [viajes, searchTerm]);

	const assignStaffMutation = useMutation({
		mutationFn: (data: { viajeId: number; staffId: string; rol: string; observaciones?: string }) =>
			viajesService.assignStaff(data.viajeId, {
				staffID: data.staffId,
				rolEnViaje: data.rol,
				observaciones: data.observaciones,
			}),
		onSuccess: () => {
			toast.success("Staff asignado exitosamente");
			queryClient.invalidateQueries({ queryKey: ["staff", selectedViaje?.viajeID] });
			setIsAssignModalOpen(false);
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al asignar staff");
		},
	});

	const updateStaffMutation = useMutation({
		mutationFn: (data: { viajeId: number; asignacionId: number; rol: string; observaciones?: string }) =>
			viajesService.updateStaff(data.viajeId, data.asignacionId, {
				rolEnViaje: data.rol,
				observaciones: data.observaciones,
			}),
		onSuccess: () => {
			toast.success("Asignación actualizada exitosamente");
			queryClient.invalidateQueries({ queryKey: ["staff", selectedViaje?.viajeID] });
			setIsAssignModalOpen(false);
			setEditingAssignment(null);
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al actualizar asignación");
		},
	});

	const removeStaffMutation = useMutation({
		mutationFn: (data: { viajeId: number; asignacionId: number }) =>
			viajesService.removeStaff(data.viajeId, data.asignacionId),
		onSuccess: () => {
			toast.success("Asignación eliminada exitosamente");
			queryClient.invalidateQueries({ queryKey: ["staff", selectedViaje?.viajeID] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al eliminar asignación");
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

	const handleEditStaff = (staff: any) => {
		setEditingAssignment(staff);
		setIsAssignModalOpen(true);
	};

	const handleRemoveStaff = (asignacionId: number) => {
		if (selectedViaje && window.confirm("¿Estás seguro de eliminar esta asignación?")) {
			removeStaffMutation.mutate({ viajeId: selectedViaje.viajeID, asignacionId });
		}
	};

	const handleOpenChange = (open: boolean) => {
		setIsAssignModalOpen(open);
		if (!open) {
			setEditingAssignment(null);
		}
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case "Coordinador":
				return "bg-purple-100 text-purple-700 border-purple-200";
			case "Paramédico":
				return "bg-red-100 text-red-700 border-red-200";
			case "Seguridad":
				return "bg-slate-100 text-slate-700 border-slate-200";
			case "Guía Turístico":
				return "bg-orange-100 text-orange-700 border-orange-200";
			default:
				return "bg-blue-100 text-blue-700 border-blue-200";
		}
	};

	return (
		<div className="flex h-[calc(100vh-100px)] flex-col overflow-hidden rounded-lg border bg-background shadow-sm">
			{/* Header */}
			<div className="flex items-center justify-between border-b px-6 py-4 bg-card">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-primary/10 rounded-lg">
						<Users className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h1 className="text-xl font-bold">Asignación de Staff</h1>
						<p className="text-sm text-muted-foreground">Gestión de personal operativo por viaje</p>
					</div>
				</div>
			</div>

			<div className="flex flex-1 overflow-hidden">
				{/* Sidebar - Trip List */}
				<div className="w-full max-w-sm border-r flex flex-col bg-muted/10">
					<div className="p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Buscar viaje, ruta o evento..."
								className="pl-9 bg-background"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
					<ScrollArea className="flex-1">
						<div className="flex flex-col gap-1 p-2">
							{filteredViajes.length === 0 ? (
								<div className="p-8 text-center text-muted-foreground">
									<p>No se encontraron viajes</p>
								</div>
							) : (
								filteredViajes.map((viaje) => (
									<button
										type="button"
										key={viaje.viajeID}
										onClick={() => setSelectedViaje(viaje)}
										className={cn(
											"flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all hover:bg-accent group",
											selectedViaje?.viajeID === viaje.viajeID
												? "bg-accent border-primary/50 shadow-sm"
												: "bg-card border-transparent hover:border-border",
										)}
									>
										<div className="flex w-full items-center justify-between">
											<span className="font-mono font-bold text-xs text-primary">{viaje.codigoViaje}</span>
											<Badge variant="secondary" className="text-[10px] h-5">
												{viaje.estatusNombre}
											</Badge>
										</div>
										<div className="w-full">
											<p className="font-medium text-sm line-clamp-1">{viaje.eventoNombre}</p>
											<div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
												<MapPin className="h-3 w-3" />
												<span className="line-clamp-1">{viaje.rutaNombre}</span>
											</div>
											<div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
												<Calendar className="h-3 w-3" />
												<span>{new Date(viaje.fechaSalida).toLocaleDateString()}</span>
											</div>
										</div>
									</button>
								))
							)}
						</div>
					</ScrollArea>
				</div>

				{/* Main Content */}
				<div className="flex-1 flex flex-col bg-background overflow-hidden">
					{selectedViaje ? (
						<div className="flex flex-col h-full">
							{/* Trip Details Header */}
							<div className="border-b p-6 bg-card/50">
								<div className="flex items-start justify-between mb-6">
									<div>
										<div className="flex items-center gap-2 mb-1">
											<Badge variant="outline" className="font-mono">
												{selectedViaje.codigoViaje}
											</Badge>
											<span className="text-sm text-muted-foreground">
												{new Date(selectedViaje.fechaSalida).toLocaleString()}
											</span>
										</div>
										<h2 className="text-2xl font-bold">{selectedViaje.eventoNombre}</h2>
										<div className="flex items-center gap-2 text-muted-foreground mt-1">
											<MapPin className="h-4 w-4" />
											<span>
												{selectedViaje.ciudadOrigen} ➝ {selectedViaje.ciudadDestino}
											</span>
										</div>
									</div>
									<Dialog open={isAssignModalOpen} onOpenChange={handleOpenChange}>
										<DialogTrigger asChild>
											<Button>
												<UserPlus className="mr-2 h-4 w-4" />
												Asignar Staff
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>
													{editingAssignment ? "Actualizar Asignación" : "Asignar Staff al Viaje"}
												</DialogTitle>
												<DialogDescription>
													{editingAssignment
														? "Modifica el rol y observaciones de este miembro del staff."
														: "Selecciona un miembro del staff y su rol para este viaje."}
												</DialogDescription>
											</DialogHeader>
											<form
												onSubmit={(e) => {
													e.preventDefault();
													const formData = new FormData(e.currentTarget);
													if (editingAssignment) {
														updateStaffMutation.mutate({
															viajeId: selectedViaje.viajeID,
															asignacionId: editingAssignment.asignacionID,
															rol: formData.get("rol") as string,
															observaciones: formData.get("observaciones") as string,
														});
													} else {
														assignStaffMutation.mutate({
															viajeId: selectedViaje.viajeID,
															staffId: formData.get("staffId") as string,
															rol: formData.get("rol") as string,
															observaciones: formData.get("observaciones") as string,
														});
													}
												}}
												className="space-y-4"
											>
												{!editingAssignment && (
													<div className="space-y-2">
														<Label htmlFor="staffId">Staff / Usuario</Label>
														<Select name="staffId" required>
															<SelectTrigger>
																<SelectValue placeholder="Selecciona un miembro del staff" />
															</SelectTrigger>
															<SelectContent>
																{isLoadingUsers ? (
																	<div className="p-2 text-center text-sm text-muted-foreground">
																		Cargando usuarios...
																	</div>
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
													</div>
												)}
												{editingAssignment && (
													<div className="space-y-2">
														<Label>Staff / Usuario</Label>
														<div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
															<Avatar className="h-10 w-10 border">
																<AvatarImage
																	src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${editingAssignment.staffNombre}`}
																/>
																<AvatarFallback>
																	{editingAssignment.staffNombre.substring(0, 2).toUpperCase()}
																</AvatarFallback>
															</Avatar>
															<div>
																<p className="font-medium text-sm">{editingAssignment.staffNombre}</p>
																<p className="text-xs text-muted-foreground">{editingAssignment.staffEmail}</p>
															</div>
														</div>
													</div>
												)}
												<div className="space-y-2">
													<Label htmlFor="rol">Rol en Viaje</Label>
													<Select name="rol" required defaultValue={editingAssignment?.rolEnViaje}>
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
													<Label htmlFor="observaciones">Observaciones</Label>
													<Input
														id="observaciones"
														name="observaciones"
														placeholder="Opcional"
														defaultValue={editingAssignment?.observaciones || ""}
													/>
												</div>
												<DialogFooter>
													<Button
														type="submit"
														disabled={editingAssignment ? updateStaffMutation.isPending : assignStaffMutation.isPending}
													>
														{editingAssignment
															? updateStaffMutation.isPending
																? "Actualizando..."
																: "Actualizar"
															: assignStaffMutation.isPending
																? "Asignando..."
																: "Asignar"}
													</Button>
												</DialogFooter>
											</form>
										</DialogContent>
									</Dialog>
								</div>

								{/* Stats Cards */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<Card className="bg-muted/50 border-none shadow-none">
										<CardContent className="p-4 flex items-center gap-4">
											<div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
												<Bus className="h-5 w-5" />
											</div>
											<div>
												<p className="text-xs text-muted-foreground font-medium uppercase">Unidad</p>
												<p className="font-semibold">{selectedViaje.unidadPlacas}</p>
											</div>
										</CardContent>
									</Card>
									<Card className="bg-muted/50 border-none shadow-none">
										<CardContent className="p-4 flex items-center gap-4">
											<div className="p-2 bg-green-100 text-green-600 rounded-lg">
												<Users className="h-5 w-5" />
											</div>
											<div>
												<p className="text-xs text-muted-foreground font-medium uppercase">Ocupación</p>
												<p className="font-semibold">
													{selectedViaje.asientosVendidos} / {selectedViaje.cupoTotal}
												</p>
											</div>
										</CardContent>
									</Card>
									<Card className="bg-muted/50 border-none shadow-none">
										<CardContent className="p-4 flex items-center gap-4">
											<div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
												<Shield className="h-5 w-5" />
											</div>
											<div>
												<p className="text-xs text-muted-foreground font-medium uppercase">Staff Total</p>
												<p className="font-semibold">{staffAssignments.length} asignados</p>
											</div>
										</CardContent>
									</Card>
								</div>
							</div>

							{/* Staff Grid */}
							<ScrollArea className="flex-1 p-6 bg-muted/10">
								{isLoadingStaff ? (
									<div className="flex items-center justify-center h-full text-muted-foreground">Cargando staff...</div>
								) : staffAssignments.length === 0 ? (
									<div className="flex flex-col items-center justify-center h-full text-muted-foreground border-2 border-dashed rounded-xl p-12 bg-background/50">
										<div className="p-4 bg-muted rounded-full mb-4">
											<UserPlus className="h-8 w-8 opacity-50" />
										</div>
										<h3 className="text-lg font-semibold">Sin personal asignado</h3>
										<p className="text-sm max-w-xs text-center mt-2 mb-6">
											Este viaje aún no tiene staff asignado. Comienza agregando un coordinador o personal de apoyo.
										</p>
										<Button variant="outline" onClick={() => setIsAssignModalOpen(true)}>
											Asignar Staff Ahora
										</Button>
									</div>
								) : (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
										{staffAssignments.map((staff) => (
											<Card key={staff.asignacionID} className="group hover:shadow-md transition-all">
												<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
													<div className="flex items-center gap-3">
														<Avatar className="h-10 w-10 border">
															<AvatarImage
																src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.staffNombre}`}
															/>
															<AvatarFallback>{staff.staffNombre.substring(0, 2).toUpperCase()}</AvatarFallback>
														</Avatar>
														<div>
															<CardTitle className="text-base font-semibold leading-none">
																{staff.staffNombre}
															</CardTitle>
															<p className="text-xs text-muted-foreground mt-1">{staff.staffEmail}</p>
														</div>
													</div>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant="ghost" size="icon" className="h-8 w-8">
																<MoreVertical className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem onClick={() => handleEditStaff(staff)}>
																<Pencil className="mr-2 h-4 w-4" />
																Editar
															</DropdownMenuItem>
															<DropdownMenuItem
																className="text-destructive"
																onClick={() => handleRemoveStaff(staff.asignacionID)}
															>
																<Trash2 className="mr-2 h-4 w-4" />
																Remover
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</CardHeader>
												<CardContent>
													<div className="mt-2 flex flex-wrap gap-2">
														<Badge variant="outline" className={cn("font-normal", getRoleColor(staff.rolEnViaje))}>
															{staff.rolEnViaje}
														</Badge>
													</div>
													{staff.observaciones && (
														<div className="mt-4 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
															"{staff.observaciones}"
														</div>
													)}
													<div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
														<Clock className="h-3 w-3" />
														<span>Asignado: {new Date(staff.fechaAsignacion).toLocaleDateString()}</span>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								)}
							</ScrollArea>
						</div>
					) : (
						<div className="flex flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/5">
							<div className="p-6 bg-background rounded-full shadow-sm mb-6">
								<Bus className="h-12 w-12 text-primary/20" />
							</div>
							<h3 className="text-xl font-semibold text-foreground">Selecciona un viaje</h3>
							<p className="text-sm max-w-md text-center mt-2">
								Selecciona un viaje de la lista para ver y gestionar el personal asignado, coordinadores y staff de
								apoyo.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
