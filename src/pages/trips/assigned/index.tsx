import { useQuery } from "@tanstack/react-query";
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
import viajesService from "@/api/services/viajesService";
import { useHasRole } from "@/hooks/use-session";
import { useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

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

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold flex items-center gap-2">
					<ClipboardList className="h-8 w-8" /> Mis Viajes Asignados
				</h1>
				<p className="text-muted-foreground">Gestiona tus asignaciones y realiza el check-in de pasajeros.</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Asignados</CardTitle>
						<ClipboardList className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
						<p className="text-xs text-muted-foreground">Viajes históricos</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Viajes Hoy</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.hoy}</div>
						<p className="text-xs text-muted-foreground">Programados para hoy</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">En Curso</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.enCurso}</div>
						<p className="text-xs text-muted-foreground">Activos ahora mismo</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completados</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.completados}</div>
						<p className="text-xs text-muted-foreground">Finalizados con éxito</p>
					</CardContent>
				</Card>
			</div>

			{/* Próximo Viaje Highlight */}
			{stats.proximoViaje && (
				<Card className="bg-primary/5 border-primary/20">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-primary">
							<Clock className="h-5 w-5" /> Tu Próximo Viaje
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Badge>Próxima Salida</Badge>
									<span className="text-sm font-mono text-muted-foreground">{stats.proximoViaje.codigoViaje}</span>
								</div>
								<h3 className="text-2xl font-bold">{stats.proximoViaje.eventoNombre}</h3>
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
							<Button size="lg" onClick={() => router.push(`/trips/checkin?viajeId=${stats.proximoViaje.viajeID}`)}>
								Iniciar Check-in
								<ArrowRight className="ml-2 h-5 w-5" />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Filtros */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Filtros</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<Label htmlFor="search">
								<Search className="inline mr-2 h-4 w-4" /> Buscar
							</Label>
							<Input
								id="search"
								placeholder="Código, evento, ruta..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="statusFilter">Estado</Label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger id="statusFilter">
									<SelectValue placeholder="Todos" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="todos">Todos</SelectItem>
									<SelectItem value="hoy">Hoy</SelectItem>
									<SelectItem value="proximos">Próximos</SelectItem>
									<SelectItem value="completados">Completados</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-end">
							<div className="text-sm text-muted-foreground">
								Mostrando <span className="font-bold">{filteredViajes.length}</span> viajes
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Lista de Viajes */}
			<Card>
				<CardHeader>
					<CardTitle>Historial de Asignaciones</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Desktop View */}
					<div className="hidden md:block rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Código</TableHead>
									<TableHead>Evento</TableHead>
									<TableHead>Ruta</TableHead>
									<TableHead>Salida</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead className="text-right">Acción</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center py-10">
											Cargando viajes...
										</TableCell>
									</TableRow>
								) : filteredViajes.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
											No se encontraron viajes
										</TableCell>
									</TableRow>
								) : (
									filteredViajes.map((viaje) => (
										<TableRow
											key={viaje.viajeID}
											className="cursor-pointer hover:bg-muted/50"
											onClick={() => router.push(`/trips/checkin?viajeId=${viaje.viajeID}`)}
										>
											<TableCell className="font-mono font-medium">{viaje.codigoViaje}</TableCell>
											<TableCell>
												<div className="flex flex-col">
													<span className="font-medium">{viaje.eventoNombre}</span>
													<span className="text-xs text-muted-foreground">{viaje.rutaNombre}</span>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center text-sm text-muted-foreground">
													<MapPin className="h-3 w-3 mr-1" />
													{viaje.ciudadOrigen} <ArrowRight className="h-3 w-3 mx-1" /> {viaje.ciudadDestino}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex flex-col">
													<div className="flex items-center gap-1">
														<Calendar className="h-3 w-3 text-muted-foreground" />
														<span className="text-sm">{new Date(viaje.fechaSalida).toLocaleDateString()}</span>
													</div>
													<span className="text-xs text-muted-foreground">
														{new Date(viaje.fechaSalida).toLocaleTimeString([], {
															hour: "2-digit",
															minute: "2-digit",
														})}
													</span>
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant={
														viaje.estatusNombre?.toLowerCase().includes("completado")
															? "secondary" // Changed to secondary for completed
															: viaje.estatusNombre?.toLowerCase().includes("activo") ||
																	viaje.estatusNombre?.toLowerCase().includes("en curso")
																? "default"
																: "outline"
													}
												>
													{viaje.estatusNombre}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<Button size="sm" variant="ghost">
													Gestionar
													<ChevronRight className="h-4 w-4 ml-1" />
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Mobile View (Cards) */}
					<div className="md:hidden space-y-4">
						{isLoading ? (
							<div className="text-center py-10 text-muted-foreground">Cargando viajes...</div>
						) : filteredViajes.length === 0 ? (
							<div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
								No se encontraron viajes
							</div>
						) : (
							filteredViajes.map((viaje) => (
								<Card
									key={viaje.viajeID}
									className="cursor-pointer active:scale-[0.98] transition-transform"
									onClick={() => router.push(`/trips/checkin?viajeId=${viaje.viajeID}`)}
								>
									<CardContent className="p-4">
										<div className="flex justify-between items-start mb-3">
											<Badge variant="outline" className="font-mono">
												{viaje.codigoViaje}
											</Badge>
											<Badge
												variant={
													viaje.estatusNombre?.toLowerCase().includes("completado")
														? "secondary"
														: viaje.estatusNombre?.toLowerCase().includes("activo") ||
																viaje.estatusNombre?.toLowerCase().includes("en curso")
															? "default"
															: "outline"
												}
											>
												{viaje.estatusNombre}
											</Badge>
										</div>
										<h3 className="font-bold text-lg mb-1">{viaje.eventoNombre}</h3>
										<div className="flex items-center text-sm text-muted-foreground mb-3">
											<MapPin className="h-3.5 w-3.5 mr-1" />
											{viaje.ciudadOrigen} <ArrowRight className="h-3 w-3 mx-1" /> {viaje.ciudadDestino}
										</div>
										<div className="flex items-center justify-between pt-3 border-t">
											<div className="flex items-center text-sm font-medium">
												<Calendar className="h-4 w-4 mr-2 text-primary" />
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
									</CardContent>
								</Card>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
