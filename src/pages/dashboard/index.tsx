import { useQuery } from "@tanstack/react-query";
import { Bus, Calendar, Loader2, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";
import reportesService from "@/api/services/reportesService";
import unidadService from "@/api/services/unidadService";
import { Chart, useChart } from "@/components/chart";
import Icon from "@/components/icon/icon";
import { Badge } from "@/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Text, Title } from "@/ui/typography";
import { fCurrency } from "@/utils/format-number";
import { rgbAlpha } from "@/utils/theme";
import DashboardBanner from "./components/dashboard-banner";

export default function DashboardPage() {
	// Fetch Dashboard Metrics
	const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
		queryKey: ["dashboard-stats"],
		queryFn: reportesService.getDashboard,
	});

	// Time Range State
	const [timeRange, setTimeRange] = useState("30d");

	// Fetch Sales Report (for charts)
	const { startDate, endDate } = useMemo(() => {
		const end = new Date();
		const start = new Date();

		const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
		start.setDate(end.getDate() - days);

		return { startDate: start, endDate: end };
	}, [timeRange]);

	const { data: salesData, isLoading: isLoadingSales } = useQuery({
		queryKey: ["dashboard-sales", startDate.toISOString(), endDate.toISOString()],
		queryFn: () =>
			reportesService.getReporteVentas({
				fechaDesde: startDate.toISOString(),
				fechaHasta: endDate.toISOString(),
			}),
	});

	// Fetch Occupancy Report (for charts)
	const { data: occupancyData, isLoading: isLoadingOccupancy } = useQuery({
		queryKey: ["dashboard-occupancy"],
		queryFn: () => reportesService.getReporteOcupacion(),
	});

	// Fetch Units (for stats)
	const { data: unitsData, isLoading: isLoadingUnits } = useQuery({
		queryKey: ["dashboard-units"],
		queryFn: () => unidadService.getAll(),
	});

	const isLoading = isLoadingDashboard || isLoadingSales || isLoadingOccupancy || isLoadingUnits;

	// --- Chart Configuration ---

	// Sales Chart (Bar)
	const salesSeries = useMemo(
		() => [
			{
				name: "Ventas Totales",
				data: salesData?.ventasPorDia?.map((v) => v.ingresoTotal) || [],
			},
		],
		[salesData],
	);

	const salesChartOptions = useChart({
		colors: ["#3b82f6"],
		chart: {
			toolbar: { show: false },
		},
		xaxis: {
			categories:
				salesData?.ventasPorDia?.map((v) =>
					new Date(v.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
				) || [],
			labels: {
				style: {
					fontSize: "12px",
					fontWeight: 600,
				},
			},
		},
		stroke: {
			show: true,
			width: 2,
			colors: ["transparent"],
		},
		plotOptions: {
			bar: {
				borderRadius: 8,
				columnWidth: "48%",
				dataLabels: {
					position: "top",
				},
			},
		},
		dataLabels: {
			enabled: true,
			formatter: (value: number) => fCurrency(value),
			offsetY: -20,
			style: {
				fontSize: "11px",
				fontWeight: "bold",
				colors: ["#3b82f6"],
			},
		},
		fill: {
			type: "gradient",
			gradient: {
				shade: "light",
				type: "vertical",
				shadeIntensity: 0.5,
				gradientToColors: ["#60a5fa"],
				inverseColors: false,
				opacityFrom: 0.95,
				opacityTo: 0.85,
				stops: [0, 100],
			},
		},
		tooltip: {
			y: {
				formatter: (value: number) => fCurrency(value),
			},
		},
		yaxis: {
			labels: {
				formatter: (value: number) => fCurrency(value),
			},
		},
	});

	// Occupancy Chart (Bar)
	const occupancySeries = useMemo(
		() => [
			{
				name: "Ocupación",
				data: occupancyData?.ocupacionPorEvento?.map((e) => e.porcentajeOcupacion) || [],
			},
		],
		[occupancyData],
	);

	const occupancyChartOptions = useChart({
		colors: ["#10b981"],
		xaxis: {
			categories: occupancyData?.ocupacionPorEvento?.map((e) => e.eventoNombre) || [],
		},
		plotOptions: {
			bar: {
				horizontal: true,
				barHeight: "50%",
				borderRadius: 4,
			},
		},
		tooltip: {
			y: {
				formatter: (value: number) => `${value}%`,
			},
		},
	});

	// --- Unit Analytics Configuration ---

	// 1. Unit Status (Donut)
	const activeUnitsCount = unitsData?.filter((u) => u.estatus === 1).length || 0;
	const inactiveUnitsCount = (unitsData?.length || 0) - activeUnitsCount;

	const unitStatusChartOptions = useChart({
		labels: ["Activas", "Inactivas"],
		colors: ["#10b981", "#ef4444"], // Green for active, Red for inactive
		stroke: { show: false },
		legend: { show: false }, // Hide default legend, will create custom one
		tooltip: { fillSeriesColor: false },
		plotOptions: {
			pie: {
				donut: {
					size: "70%",
					labels: {
						show: true,
						total: {
							show: true,
							label: "Total",
							color: "hsl(var(--foreground))",
							formatter: () => `${unitsData?.length || 0}`,
						},
					},
				},
			},
		},
	});

	const unitStatusSeries = [activeUnitsCount, inactiveUnitsCount];

	// 2. Unit Types (Bar)
	// Group units by type
	const unitsByType = unitsData?.reduce(
		(acc, unit) => {
			const type = unit.tipoUnidad || "Desconocido";
			acc[type] = (acc[type] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	const unitTypesLabels = Object.keys(unitsByType || {});
	const unitTypesData = Object.values(unitsByType || {});

	const unitTypesChartOptions = useChart({
		xaxis: {
			categories: unitTypesLabels,
		},
		plotOptions: {
			bar: {
				borderRadius: 4,
				columnWidth: "45%",
				distributed: true,
			},
		},
		legend: { show: false },
		tooltip: {
			y: {
				formatter: (value: number) => `${value} unidades`,
			},
		},
	});

	const unitTypesSeries = [
		{
			name: "Unidades",
			data: unitTypesData,
		},
	];

	// --- Sparkline Options ---
	const sparklineOptions = useChart({
		chart: { sparkline: { enabled: true } },
		grid: { show: false },
		yaxis: { show: false },
		tooltip: { enabled: false },
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[50vh]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	const metrics = dashboardData?.metricas;

	// Recent units (top 5)
	const recentUnits = [...(unitsData || [])]
		.sort((a, b) => new Date(b.fechaAlta).getTime() - new Date(a.fechaAlta).getTime())
		.slice(0, 5);

	// Quick Stats Data Construction
	const quickStats = [
		{
			icon: "solar:wallet-outline",
			label: "Ventas del Mes",
			value: fCurrency(metrics?.ingresosMes || 0),
			subtext: `${metrics?.boletosMes} boletos`,
			color: "#3b82f6",
			chart: salesData?.ventasPorDia?.map((v) => v.ingresoTotal) || [],
		},
		{
			icon: "solar:bus-outline",
			label: "Viajes Próximos",
			value: `${metrics?.viajesProximos || 0}`,
			subtext: `${metrics?.viajesHoy} hoy`,
			color: "#f59e42",
			chart: [5, 8, 6, 9, 12, 10, 14, 10], // Placeholder trend
		},
		{
			icon: "solar:users-group-rounded-outline",
			label: "Usuarios Activos",
			value: `${metrics?.usuariosActivos || 0}`,
			subtext: `+${metrics?.usuariosNuevosMes} nuevos`,
			color: "#10b981",
			chart: [2, 4, 3, 5, 4, 6, 8, 9], // Placeholder trend
		},
		{
			icon: "solar:danger-circle-outline",
			label: "Incidencias",
			value: `${metrics?.incidenciasAbiertas || 0}`,
			subtext: "Pendientes",
			color: "#ef4444",
			chart: [1, 0, 2, 1, 3, 1, 0, 0], // Placeholder trend
		},
	];

	return (
		<div className="space-y-6 p-6">
			{/* Banner Section */}
			<DashboardBanner />

			{/* Quick Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{quickStats.map((stat) => (
					<Card key={stat.label} className="flex flex-col justify-between h-full">
						<CardContent className="flex flex-col gap-2 p-4">
							<div className="flex items-center gap-2">
								<div className="rounded-lg p-2" style={{ background: rgbAlpha(stat.color, 0.1) }}>
									<Icon icon={stat.icon} size={24} color={stat.color} />
								</div>
								<Text variant="body2" className="font-semibold">
									{stat.label}
								</Text>
							</div>
							<div className="flex items-center gap-2 mt-2">
								<Title as="h3" className="text-2xl font-bold">
									{stat.value}
								</Title>
								<span className="text-xs text-muted-foreground font-medium">{stat.subtext}</span>
							</div>
							<div className="w-full h-10 mt-2">
								<Chart
									type="bar"
									height={40}
									options={{
										...sparklineOptions,
										colors: [stat.color],
									}}
									series={[{ data: stat.chart }]}
								/>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				{/* Left Column: Sales & Occupancy Charts */}
				<div className="lg:col-span-2 space-y-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="flex items-center gap-2 text-base font-medium">
								<TrendingUp className="h-5 w-5 text-muted-foreground" />
								Tendencia de Ventas
							</CardTitle>
							<Select value={timeRange} onValueChange={setTimeRange}>
								<SelectTrigger className="w-[140px] h-8">
									<SelectValue placeholder="Periodo" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="7d">Últimos 7 días</SelectItem>
									<SelectItem value="30d">Últimos 30 días</SelectItem>
									<SelectItem value="90d">Últimos 90 días</SelectItem>
								</SelectContent>
							</Select>
						</CardHeader>
						<CardContent>
							{salesData?.ventasPorDia && salesData.ventasPorDia.length > 0 ? (
								<Chart type="bar" height={300} options={salesChartOptions} series={salesSeries} />
							) : (
								<div className="h-[300px] flex items-center justify-center text-muted-foreground">
									No hay datos de ventas recientes
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5" />
								Ocupación por Evento
							</CardTitle>
						</CardHeader>
						<CardContent>
							{occupancyData?.ocupacionPorEvento && occupancyData.ocupacionPorEvento.length > 0 ? (
								<Chart type="bar" height={300} options={occupancyChartOptions} series={occupancySeries} />
							) : (
								<div className="h-[300px] flex items-center justify-center text-muted-foreground">
									No hay datos de ocupación disponibles
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right Column: Ventas por Evento & Unit Stats */}
				<div className="space-y-4">
					{/* Ventas por Evento List */}
					<Card className="flex flex-col p-6">
						<div className="flex items-center justify-between mb-4">
							<Text variant="body2" className="font-semibold">
								Ventas por Evento
							</Text>
						</div>
						<div className="flex-1 overflow-x-auto">
							<table className="w-full text-sm">
								<tbody>
									{salesData?.ventasPorEvento && salesData.ventasPorEvento.length > 0 ? (
										salesData.ventasPorEvento.map((evento) => (
											<tr key={evento.eventoId} className="border-b last:border-0">
												<td className="py-2 w-10">
													<span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
														<Icon icon="mdi:calendar-star" size={16} className="text-primary" />
													</span>
												</td>
												<td className="py-2">
													<div className="font-semibold truncate max-w-[120px]">{evento.eventoNombre}</div>
													<div className="text-xs text-muted-foreground">{evento.totalBoletos} boletos</div>
												</td>
												<td className="py-2 text-right font-bold">{fCurrency(evento.ingresoTotal)}</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan={3} className="text-center py-4 text-muted-foreground">
												No hay ventas por evento
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</Card>

					{/* Unit Status Chart */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Estado de la Flota</CardTitle>
						</CardHeader>
						<CardContent>
							<Chart type="donut" height={200} options={unitStatusChartOptions} series={unitStatusSeries} />
							<div className="mt-4 flex justify-between text-sm">
								<div className="flex items-center gap-2">
									<span className="w-3 h-3 rounded-full bg-emerald-500" />
									<span>Activas: {activeUnitsCount}</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="w-3 h-3 rounded-full bg-red-500" />
									<span>Inactivas: {inactiveUnitsCount}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Unit Types Chart */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Tipos de Unidad</CardTitle>
						</CardHeader>
						<CardContent>
							<Chart type="bar" height={200} options={unitTypesChartOptions} series={unitTypesSeries} />
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Bottom Tables */}
			<div className="grid gap-4 md:grid-cols-2">
				{/* Upcoming Trips */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							Próximos Viajes
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Código</TableHead>
									<TableHead>Ruta</TableHead>
									<TableHead>Salida</TableHead>
									<TableHead className="text-right">Ocupación</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{dashboardData?.proximosViajes && dashboardData.proximosViajes.length > 0 ? (
									dashboardData.proximosViajes.map((viaje) => (
										<TableRow key={viaje.viajeID}>
											<TableCell className="font-mono font-medium">{viaje.codigoViaje}</TableCell>
											<TableCell>
												<div className="flex flex-col">
													<span className="text-sm font-medium">{viaje.rutaNombre}</span>
													<span className="text-xs text-muted-foreground">{viaje.eventoNombre}</span>
												</div>
											</TableCell>
											<TableCell>{new Date(viaje.fechaSalida).toLocaleString()}</TableCell>
											<TableCell className="text-right">
												<Badge variant={viaje.porcentajeOcupacion > 80 ? "destructive" : "secondary"}>
													{viaje.asientosVendidos}/{viaje.cupoTotal}
												</Badge>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={4} className="text-center text-muted-foreground">
											No hay viajes próximos programados
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				{/* Recent Units Table (Moved here) */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Bus className="h-5 w-5" />
							Unidades Recientes
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Económico</TableHead>
									<TableHead>Placas</TableHead>
									<TableHead className="text-right">Estatus</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{recentUnits.length > 0 ? (
									recentUnits.map((unit) => (
										<TableRow key={unit.id}>
											<TableCell className="font-medium">{unit.numeroEconomico}</TableCell>
											<TableCell className="text-xs text-muted-foreground">{unit.placas}</TableCell>
											<TableCell className="text-right">
												<Badge variant={unit.estatus === 1 ? "secondary" : "destructive"} className="text-[10px]">
													{unit.estatus === 1 ? "Activo" : "Inactivo"}
												</Badge>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={3} className="text-center text-muted-foreground">
											No hay unidades recientes
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
