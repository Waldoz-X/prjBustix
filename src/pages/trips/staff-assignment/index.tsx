import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Search, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import viajesService, { type AsignacionStaffDto, type ViajeDto } from "@/api/services/viajesService";
import { useHasRole } from "@/hooks/use-session";
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
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

export default function StaffAssignmentPage() {
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isAdmin || isManager;
	const queryClient = useQueryClient();

	const [searchTerm, setSearchTerm] = useState("");
	const [selectedViaje, setSelectedViaje] = useState<ViajeDto | null>(null);
	const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

	// Fetch trips for search
	const { data: viajes = [] } = useQuery({
		queryKey: ["viajes", searchTerm],
		queryFn: () => viajesService.getAllViajes({}), // TODO: Add search param
		enabled: allowed && searchTerm.length > 0,
	});

	// Fetch staff for selected trip
	const { data: staffAssignments = [], isLoading: isLoadingStaff } = useQuery({
		queryKey: ["staff", selectedViaje?.viajeID],
		queryFn: () => viajesService.getStaff(selectedViaje?.viajeID ?? 0),
		enabled: !!selectedViaje,
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
			queryClient.invalidateQueries({ queryKey: ["staff", selectedViaje?.viajeID] });
			setIsAssignModalOpen(false);
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al asignar staff");
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

	const handleSearch = () => {
		// In a real app, this would trigger the query or filter the list
		// For now, we rely on the useQuery hook updating when searchTerm changes
	};

	const handleSelectViaje = (viaje: ViajeDto) => {
		setSelectedViaje(viaje);
		setSearchTerm(""); // Clear search to show selection view
	};

	const handleRemoveStaff = (asignacionId: number) => {
		if (selectedViaje && window.confirm("¿Estás seguro de eliminar esta asignación?")) {
			removeStaffMutation.mutate({ viajeId: selectedViaje.viajeID, asignacionId });
		}
	};

	const columns: ColumnsType<AsignacionStaffDto> = [
		{
			title: "Nombre",
			dataIndex: "staffNombre",
			key: "staffNombre",
		},
		{
			title: "Rol",
			dataIndex: "rolEnViaje",
			key: "rolEnViaje",
		},
		{
			title: "Email",
			dataIndex: "staffEmail",
			key: "staffEmail",
		},
		{
			title: "Teléfono",
			dataIndex: "staffTelefono",
			key: "staffTelefono",
		},
		{
			title: "Observaciones",
			dataIndex: "observaciones",
			key: "observaciones",
		},
		{
			title: "Acciones",
			key: "actions",
			render: (_, record) => (
				<Button
					variant="ghost"
					size="icon"
					className="text-destructive"
					onClick={() => handleRemoveStaff(record.asignacionID)}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			),
		},
	];

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Users className="h-8 w-8" />
						Asignación de Staff
					</h1>
					<p className="text-muted-foreground mt-2">Asignar operadores y staff a viajes</p>
				</div>
			</div>

			{!selectedViaje ? (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Buscar Viaje</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-2">
							<Input
								placeholder="Buscar por código, evento..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<Button onClick={handleSearch}>
								<Search className="mr-2 h-4 w-4" />
								Buscar
							</Button>
						</div>

						{searchTerm && (
							<div className="border rounded-md divide-y">
								{viajes.length === 0 ? (
									<div className="p-4 text-center text-muted-foreground">No se encontraron viajes</div>
								) : (
									viajes.map((viaje) => (
										<button
											type="button"
											key={viaje.viajeID}
											className="w-full text-left p-4 hover:bg-accent flex justify-between items-center transition-colors cursor-pointer"
											onClick={() => handleSelectViaje(viaje)}
										>
											<div>
												<p className="font-medium">
													{viaje.codigoViaje} - {viaje.eventoNombre}
												</p>
												<p className="text-sm text-muted-foreground">
													{viaje.rutaNombre} | {new Date(viaje.fechaSalida).toLocaleString()}
												</p>
											</div>
											<Button variant="ghost" size="sm" asChild>
												<span>Seleccionar</span>
											</Button>
										</button>
									))
								)}
							</div>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="space-y-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Viaje: {selectedViaje.codigoViaje}</CardTitle>
								<p className="text-muted-foreground">{selectedViaje.eventoNombre}</p>
							</div>
							<Button variant="outline" onClick={() => setSelectedViaje(null)}>
								Cambiar Viaje
							</Button>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Ruta</p>
									<p>{selectedViaje.rutaNombre}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Salida</p>
									<p>{new Date(selectedViaje.fechaSalida).toLocaleString()}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Unidad</p>
									<p>{selectedViaje.unidadPlacas}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Personal Asignado</CardTitle>
							<Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
								<DialogTrigger asChild>
									<Button>
										<UserPlus className="mr-2 h-4 w-4" />
										Asignar Staff
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Asignar Staff al Viaje</DialogTitle>
										<DialogDescription>Selecciona un miembro del staff y su rol para este viaje.</DialogDescription>
									</DialogHeader>
									<form
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(e.currentTarget);
											assignStaffMutation.mutate({
												viajeId: selectedViaje.viajeID,
												staffId: formData.get("staffId") as string,
												rol: formData.get("rol") as string,
												observaciones: formData.get("observaciones") as string,
											});
										}}
										className="space-y-4"
									>
										<div className="space-y-2">
											<Label htmlFor="staffId">ID Staff / Usuario</Label>
											<Input id="staffId" name="staffId" required placeholder="ID del usuario" />
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
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="observaciones">Observaciones</Label>
											<Input id="observaciones" name="observaciones" />
										</div>
										<DialogFooter>
											<Button type="submit" disabled={assignStaffMutation.isPending}>
												{assignStaffMutation.isPending ? "Asignando..." : "Asignar"}
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						</CardHeader>
						<CardContent className="p-0">
							<Table
								dataSource={staffAssignments}
								columns={columns}
								rowKey="asignacionID"
								pagination={false}
								loading={isLoadingStaff}
							/>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
