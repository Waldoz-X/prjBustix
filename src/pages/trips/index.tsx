import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Bus, Calendar, Eye, Filter, MapPin, MoreHorizontal, Plus, Trash2, Users, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import viajesService, { type ViajeDto, type ViajesFilterParams } from "@/api/services/viajesService";
import { useHasRole } from "@/hooks/use-session";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
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
import { CreateTripModal } from "./create-trip-modal";

export default function TripsPage() {
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isAdmin || isManager;
	const queryClient = useQueryClient();

	const [searchTerm, setSearchTerm] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [filters, setFilters] = useState<ViajesFilterParams>({});

	const { data: viajes = [], isLoading } = useQuery({
		queryKey: ["viajes", searchTerm, filters],
		queryFn: () => viajesService.getAllViajes(filters),
		enabled: allowed,
	});

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

	const handleDelete = (id: number) => {
		if (window.confirm("¿Estás seguro de que deseas eliminar este viaje?")) {
			deleteMutation.mutate(id);
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
						<DropdownMenuItem onClick={() => {}}>
							<Eye className="mr-2 h-4 w-4" /> Ver detalles
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="text-destructive" onClick={() => handleDelete(record.viajeID)}>
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
		</div>
	);
}
