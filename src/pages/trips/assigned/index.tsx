import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
	ArrowRight,
	Calendar,
	CheckCircle,
	ChevronRight,
	ClipboardList,
	Clock,
	MapPin,
	Search,
	TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import viajesService, { type ViajeDto } from "@/api/services/viajesService";
import { useHasRole } from "@/hooks/use-session";
import { useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { cn } from "@/utils/index";

export default function AssignedTripsPage() {
	const isOperator = useHasRole("Operator");
	const isStaff = useHasRole("Staff");
	const allowed = isOperator || isStaff;
	const router = useRouter();

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("todos");

	const { data: viajes = [], isLoading } = useQuery({
		queryKey: ["mis-viajes"],
		queryFn: () => viajesService.getMisViajes({ soloProximos: false }),
		enabled: allowed,
	});

	// Calcular estadísticas
	const stats = useMemo(() => {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const viajesHoy = viajes.filter((v) => {
			const fecha = new Date(v.fechaSalida);
			return fecha >= today && fecha < tomorrow;
		});

		const proximoViaje = viajes
			.filter((v) => new Date(v.fechaSalida) > now)
			.sort((a, b) => new Date(a.fechaSalida).getTime() - new Date(b.fechaSalida).getTime())[0];

		const enCurso = viajes.filter(
			(v) => v.estatusNombre?.toLowerCase().includes("en curso") || v.estatusNombre?.toLowerCase().includes("activo"),
		);

		const completados = viajes.filter((v) => v.estatusNombre?.toLowerCase().includes("completado"));

		return {
			total: viajes.length,
			hoy: viajesHoy.length,
			enCurso: enCurso.length,
			completados: completados.length,
			proximoViaje,
		};
	}, [viajes]);

	// Filtrar viajes
	const filteredViajes = useMemo(() => {
		let filtered = viajes;

		// Filtro por búsqueda
		if (searchTerm) {
			filtered = filtered.filter(
				(v) =>
					v.codigoViaje?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					v.eventoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					v.rutaNombre?.toLowerCase().includes(searchTerm.toLowerCase()),
			);
		}

		// Filtro por estado
		if (statusFilter !== "todos") {
			const now = new Date();
			switch (statusFilter) {
				case "proximos":
					filtered = filtered.filter((v) => new Date(v.fechaSalida) > now);
					break;
				case "hoy": {
					const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
					const tomorrow = new Date(today);
					tomorrow.setDate(tomorrow.getDate() + 1);
					filtered = filtered.filter((v) => {
						const fecha = new Date(v.fechaSalida);
						return fecha >= today && fecha < tomorrow;
					});
					break;
				}
				case "completados":
					filtered = filtered.filter((v) => v.estatusNombre?.toLowerCase().includes("completado"));
					break;
			}
		}

		return filtered;
	}, [viajes, searchTerm, statusFilter]);

	if (!allowed) {
		return (
			<div className="p-6 flex items-center justify-center min-h-[60vh]">
				<Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
					<CardHeader>
						<CardTitle className="text-destructive flex items-center gap-2">Acceso Denegado</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							No tienes permisos para ver esta página. Contacta a tu administrador.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const columns: ColumnsType<ViajeDto> = [
		{
			title: "Código",
			dataIndex: "codigoViaje",
			key: "codigoViaje",
			render: (text) => <span className="font-mono font-bold text-primary">{text}</span>,
		},
		{
			title: "Evento",
			dataIndex: "eventoNombre",
			key: "eventoNombre",
			render: (text, record) => (
				<div className="flex flex-col">
					<span className="font-medium text-base">{text}</span>
					<span className="text-xs text-muted-foreground">{record.rutaNombre}</span>
				</div>
			),
		},
		{
			title: "Ruta",
			dataIndex: "rutaNombre",
			key: "rutaNombre",
			render: (_, record) => (
				<div className="flex items-center text-sm text-muted-foreground">
					<MapPin className="h-3 w-3 mr-1 text-primary/70" />
					{record.ciudadOrigen} <ArrowRight className="h-3 w-3 mx-1" /> {record.ciudadDestino}
				</div>
			),
		},
		{
			title: "Salida",
			dataIndex: "fechaSalida",
			key: "fechaSalida",
			render: (date) => {
				const fecha = new Date(date);
				const now = new Date();
				const isToday =
					fecha.getDate() === now.getDate() &&
					fecha.getMonth() === now.getMonth() &&
					fecha.getFullYear() === now.getFullYear();

				return (
					<div className="flex flex-col">
						<div className="flex items-center gap-1">
							<Calendar className="h-3 w-3 text-muted-foreground" />
							<span className={cn("text-sm", isToday && "font-bold text-blue-600")}>{fecha.toLocaleDateString()}</span>
						</div>
						<span className="text-xs text-muted-foreground">
							{fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
						</span>
					</div>
				);
			},
		},
		{
			title: "Estado",
			dataIndex: "estatusNombre",
			key: "estatus",
			render: (status) => {
				const variant = status?.toLowerCase().includes("completado")
					? "default"
					: status?.toLowerCase().includes("activo") || status?.toLowerCase().includes("en curso")
						? "default"
						: "outline";

				const className = status?.toLowerCase().includes("completado")
					? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
					: status?.toLowerCase().includes("activo") || status?.toLowerCase().includes("en curso")
						? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
						: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200";

				return (
					<Badge variant={variant} className={cn("font-medium", className)}>
						{status}
					</Badge>
				);
			},
		},
		{
			title: "Acción",
			key: "action",
			render: (_, record) => (
				<Button
					size="sm"
					onClick={() => router.push(`/trips/checkin?viajeId=${record.viajeID}`)}
					className="group transition-all hover:pr-4"
				>
					Gestionar
					<ChevronRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
				</Button>
			),
		},
	];

	return (
		<div className="min-h-screen bg-gray-50/50 pb-10">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-20 pt-10 px-6 shadow-lg">
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
						<div>
							<h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
								<ClipboardList className="h-8 w-8 md:h-10 md:w-10 opacity-90" />
								Mis Viajes Asignados
							</h1>
							<p className="text-blue-100 mt-2 text-lg">
								Gestiona tus asignaciones y realiza el check-in de pasajeros.
							</p>
						</div>
						<div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
							<p className="text-sm font-medium text-blue-100 uppercase tracking-wider">Fecha Actual</p>
							<p className="text-xl font-bold">
								{new Date().toLocaleDateString(undefined, {
									weekday: "long",
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 space-y-8">
				{/* Stats Cards */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
					<Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-none">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">Total Asignados</CardTitle>
							<div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
								<ClipboardList className="h-4 w-4 text-gray-600" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-gray-900">{stats.total}</div>
							<p className="text-xs text-muted-foreground mt-1">Viajes históricos</p>
						</CardContent>
					</Card>

					<Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-none">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">Viajes Hoy</CardTitle>
							<div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
								<Calendar className="h-4 w-4 text-blue-600" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-blue-600">{stats.hoy}</div>
							<p className="text-xs text-muted-foreground mt-1">Programados para hoy</p>
						</CardContent>
					</Card>

					<Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-none">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">En Curso</CardTitle>
							<div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
								<TrendingUp className="h-4 w-4 text-orange-600" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-orange-600">{stats.enCurso}</div>
							<p className="text-xs text-muted-foreground mt-1">Activos ahora mismo</p>
						</CardContent>
					</Card>

					<Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-none">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">Completados</CardTitle>
							<div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
								<CheckCircle className="h-4 w-4 text-green-600" />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-green-600">{stats.completados}</div>
							<p className="text-xs text-muted-foreground mt-1">Finalizados con éxito</p>
						</CardContent>
					</Card>
				</div>

				{/* Próximo Viaje Highlight */}
				{stats.proximoViaje && (
					<div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
						<h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
							<Clock className="h-5 w-5 text-primary" />
							Tu Próximo Viaje
						</h2>
						<Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50/50 overflow-hidden relative group">
							<div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20" />
							<CardContent className="p-6 sm:p-8 relative z-10">
								<div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none">Próxima Salida</Badge>
											<span className="text-sm font-mono text-muted-foreground">{stats.proximoViaje.codigoViaje}</span>
										</div>
										<h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.proximoViaje.eventoNombre}</h3>
										<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
											<div className="flex items-center gap-1">
												<Calendar className="h-4 w-4" />
												{new Date(stats.proximoViaje.fechaSalida).toLocaleDateString(undefined, {
													weekday: "long",
													day: "numeric",
													month: "long",
												})}
											</div>
											<div className="flex items-center gap-1">
												<Clock className="h-4 w-4" />
												{new Date(stats.proximoViaje.fechaSalida).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</div>
											<div className="flex items-center gap-1">
												<MapPin className="h-4 w-4" />
												{stats.proximoViaje.rutaNombre}
											</div>
										</div>
									</div>
									<Button
										size="lg"
										onClick={() => router.push(`/trips/checkin?viajeId=${stats.proximoViaje.viajeID}`)}
										className="w-full md:w-auto shadow-md hover:shadow-lg transition-all hover:scale-105 bg-blue-600 hover:bg-blue-700 text-white"
									>
										Iniciar Check-in
										<ArrowRight className="ml-2 h-5 w-5" />
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Lista de Viajes */}
				<Card className="border-none shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
					<CardHeader className="px-6 pt-6 pb-4 border-b">
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
							<div>
								<CardTitle className="text-xl">Historial de Asignaciones</CardTitle>
								<p className="text-sm text-muted-foreground mt-1">Gestiona y consulta todos tus viajes asignados</p>
							</div>
							<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
								<div className="relative w-full sm:w-64">
									<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Buscar viaje..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
									/>
								</div>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
							<div className="px-6 pt-4">
								<TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex p-1 bg-gray-100/80">
									<TabsTrigger value="todos" className="flex-1 sm:flex-none">
										Todos
									</TabsTrigger>
									<TabsTrigger value="hoy" className="flex-1 sm:flex-none">
										Hoy
									</TabsTrigger>
									<TabsTrigger value="proximos" className="flex-1 sm:flex-none">
										Próximos
									</TabsTrigger>
									<TabsTrigger value="completados" className="flex-1 sm:flex-none">
										Completados
									</TabsTrigger>
								</TabsList>
							</div>

							<TabsContent value={statusFilter} className="mt-0">
								{/* Desktop View */}
								<div className="hidden md:block">
									<Table
										dataSource={filteredViajes}
										columns={columns}
										rowKey="viajeID"
										pagination={{
											pageSize: 10,
											showSizeChanger: false,
											className: "px-6 pb-4",
										}}
										loading={isLoading}
										className="custom-table"
										rowClassName="hover:bg-gray-50/50 transition-colors cursor-pointer"
										onRow={(record) => ({
											onClick: () => router.push(`/trips/checkin?viajeId=${record.viajeID}`),
										})}
									/>
								</div>

								{/* Mobile View (Cards) */}
								<div className="md:hidden p-4 space-y-4 bg-gray-50/50 min-h-[300px]">
									{isLoading ? (
										<div className="text-center py-10 text-muted-foreground">Cargando viajes...</div>
									) : filteredViajes.length === 0 ? (
										<div className="text-center py-10 text-muted-foreground bg-white rounded-lg border border-dashed">
											No se encontraron viajes
										</div>
									) : (
										filteredViajes.map((viaje) => (
											<button
												key={viaje.viajeID}
												type="button"
												className="w-full text-left bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
												onClick={() => router.push(`/trips/checkin?viajeId=${viaje.viajeID}`)}
											>
												<div className="flex justify-between items-start mb-3">
													<Badge variant="outline" className="font-mono bg-gray-50">
														{viaje.codigoViaje}
													</Badge>
													<Badge
														className={cn(
															"capitalize",
															viaje.estatusNombre?.toLowerCase().includes("completado")
																? "bg-green-100 text-green-700 hover:bg-green-100"
																: viaje.estatusNombre?.toLowerCase().includes("activo")
																	? "bg-blue-100 text-blue-700 hover:bg-blue-100"
																	: "bg-gray-100 text-gray-700 hover:bg-gray-100",
														)}
													>
														{viaje.estatusNombre}
													</Badge>
												</div>
												<h3 className="font-bold text-lg mb-1">{viaje.eventoNombre}</h3>
												<div className="flex items-center text-sm text-muted-foreground mb-3">
													<MapPin className="h-3.5 w-3.5 mr-1" />
													{viaje.ciudadOrigen} <ArrowRight className="h-3 w-3 mx-1" /> {viaje.ciudadDestino}
												</div>
												<div className="flex items-center justify-between pt-3 border-t border-gray-100">
													<div className="flex items-center text-sm font-medium">
														<Calendar className="h-4 w-4 mr-2 text-blue-600" />
														{new Date(viaje.fechaSalida).toLocaleDateString()}
													</div>
													<div className="flex items-center text-sm text-muted-foreground">
														<Clock className="h-4 w-4 mr-1" />
														{new Date(viaje.fechaSalida).toLocaleTimeString([], {
															hour: "2-digit",
															minute: "2-digit",
														})}
													</div>
												</div>
											</button>
										))
									)}
								</div>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
