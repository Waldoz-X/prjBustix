import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import eventosService from "@/api/services/eventosService";
import reportesService from "@/api/services/reportesService";
import { Chart, useChart } from "@/components/chart";
import Icon from "@/components/icon/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Text, Title } from "@/ui/typography";
import { fCurrency, fPercent } from "@/utils/format-number";
import { rgbAlpha } from "@/utils/theme";
import AnalyticsBanner from "./components/analytics-banner";

export default function EventAnalysisPage() {
	// Filtros
	const [timeRange, setTimeRange] = useState("30d");
	const [selectedEvent, setSelectedEvent] = useState<string>("all");

	// Calcular fechas según el rango de tiempo
	const { startDate, endDate } = useMemo(() => {
		const end = new Date();
		const start = new Date();

		const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
		start.setDate(end.getDate() - days);

		return { startDate: start, endDate: end };
	}, [timeRange]);

	// Fetch de eventos para el selector
	const { data: eventsListData } = useQuery({
		queryKey: ["events-list"],
		queryFn: () => eventosService.getAllEventos(),
	});

	// 1. Fetch Data con filtros
	const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
		queryKey: ["analytics-dashboard"],
		queryFn: reportesService.getDashboard,
	});

	const { data: salesData, isLoading: isLoadingSales } = useQuery({
		queryKey: ["analytics-sales", startDate.toISOString(), endDate.toISOString(), selectedEvent],
		queryFn: () =>
			reportesService.getReporteVentas({
				fechaDesde: startDate.toISOString(),
				fechaHasta: endDate.toISOString(),
				eventoId: selectedEvent !== "all" ? parseInt(selectedEvent) : undefined,
			}),
	});

	const { data: occupancyData, isLoading: isLoadingOccupancy } = useQuery({
		queryKey: ["analytics-occupancy", startDate.toISOString(), endDate.toISOString(), selectedEvent],
		queryFn: () =>
			reportesService.getReporteOcupacion({
				fechaDesde: startDate.toISOString(),
				fechaHasta: endDate.toISOString(),
				eventoId: selectedEvent !== "all" ? parseInt(selectedEvent) : undefined,
			}),
	});

	const isLoading = isLoadingDashboard || isLoadingSales || isLoadingOccupancy;

	// 2. Prepare Metrics for Quick Stats
	const metrics = dashboardData?.metricas;
	const totalRevenue = salesData?.ingresoTotal || 0;
	const totalTickets = salesData?.boletosVendidos || 0;
	const activeEvents = metrics?.eventosActivos || 0;
	const avgOccupancy = occupancyData?.promedioOcupacion || 0;

	const quickStats = [
		{
			label: "Ingresos Totales",
			value: fCurrency(totalRevenue),
			icon: "solar:dollar-minimalistic-bold-duotone",
			color: "#3b82f6",
			chart: salesData?.ventasPorDia?.map((v) => v.ingresoTotal) || [0, 0],
			subtext: `${totalTickets} boletos`,
		},
		{
			label: "Boletos Vendidos",
			value: totalTickets.toLocaleString(),
			icon: "solar:ticket-sale-bold-duotone",
			color: "#10b981",
			chart: salesData?.ventasPorDia?.map((v) => v.boletosVendidos) || [0, 0],
			subtext: `de ${salesData?.totalBoletos || 0} total`,
		},
		{
			label: "Eventos Activos",
			value: activeEvents.toString(),
			icon: "solar:calendar-mark-bold-duotone",
			color: "#f59e42",
			chart: [2, 2, 3, 2, 4, 3, 2, 2],
			subtext: dashboardData?.ultimosEventos?.length ? `${dashboardData.ultimosEventos.length} próximos` : "0 próximos",
		},
		{
			label: "Ocupación Promedio",
			value: fPercent(avgOccupancy / 100),
			icon: "solar:users-group-two-rounded-bold-duotone",
			color: "#6366f1",
			chart: occupancyData?.ocupacionPorEvento?.map((e) => e.porcentajeOcupacion) || [0, 0],
			subtext: avgOccupancy > 70 ? "Alta" : avgOccupancy > 40 ? "Media" : "Baja",
		},
	];

	// 3. Chart Configurations

	// Sparklines
	const sparklineOptions = useChart({
		chart: { sparkline: { enabled: true } },
		grid: { show: false },
		yaxis: { show: false },
		tooltip: { enabled: false },
		stroke: { width: 2 },
	});

	// Sales Trend (Bar con gradiente)
	const salesTrendOptions = useChart({
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
					fontSize: "11px",
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
				columnWidth: "50%",
				dataLabels: {
					position: "top",
				},
			},
		},
		dataLabels: {
			enabled: true,
			formatter: (value: number) => (value > 0 ? fCurrency(value) : ""),
			offsetY: -20,
			style: {
				fontSize: "10px",
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
			y: { formatter: (value: number) => fCurrency(value) },
		},
		yaxis: {
			labels: {
				formatter: (value: number) => fCurrency(value),
			},
		},
		colors: ["#3b82f6"],
	});

	const salesTrendSeries = [
		{
			name: "Ingresos",
			data: salesData?.ventasPorDia?.map((v) => v.ingresoTotal) || [],
		},
	];

	// Occupancy by Event (Bar horizontal)
	const occupancyOptions = useChart({
		xaxis: {
			categories: occupancyData?.ocupacionPorEvento?.map((e) => e.eventoNombre) || [],
		},
		plotOptions: {
			bar: {
				horizontal: true,
				barHeight: "60%",
				borderRadius: 6,
				dataLabels: {
					position: "top",
				},
			},
		},
		dataLabels: {
			enabled: true,
			formatter: (value: number) => `${value}%`,
			offsetX: 30,
			style: {
				fontSize: "11px",
				fontWeight: "bold",
				colors: ["#10b981"],
			},
		},
		legend: { show: false },
		tooltip: {
			y: { formatter: (value: number) => `${value}%` },
		},
		colors: ["#10b981"],
	});

	const occupancySeries = [
		{
			name: "Ocupación",
			data: occupancyData?.ocupacionPorEvento?.map((e) => e.porcentajeOcupacion) || [],
		},
	];

	// Ticket Status (Donut)
	const ticketStatusOptions = useChart({
		labels: ["Vendidos", "Cancelados", "Disponibles"],
		colors: ["#10b981", "#ef4444", "#e5e7eb"],
		stroke: { show: false },
		legend: { position: "bottom" },
		tooltip: { fillSeriesColor: false },
		plotOptions: {
			pie: {
				donut: {
					size: "70%",
					labels: {
						show: true,
						total: {
							show: true,
							label: "Total Boletos",
							color: "hsl(var(--foreground))",
							formatter: () => `${salesData?.totalBoletos || 0}`,
							fontSize: "18px",
							fontWeight: 700,
						},
					},
				},
			},
		},
	});

	const ticketStatusSeries = [
		salesData?.boletosVendidos || 0,
		salesData?.boletosCancelados || 0,
		Math.max(
			0,
			(salesData?.totalBoletos || 0) - (salesData?.boletosVendidos || 0) - (salesData?.boletosCancelados || 0),
		),
	];

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[50vh]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			{/* Banner */}
			<AnalyticsBanner />

			{/* Filtros */}
			<Card>
				<CardContent className="flex flex-wrap gap-4 items-center p-4">
					<div className="flex items-center gap-2">
						<Icon icon="solar:filter-bold-duotone" size={20} className="text-primary" />
						<Text variant="body2" className="font-semibold">
							Filtros:
						</Text>
					</div>

					{/* Rango de Tiempo */}
					<div className="flex items-center gap-2">
						<Text variant="caption" className="text-muted-foreground">
							Periodo:
						</Text>
						<Select value={timeRange} onValueChange={setTimeRange}>
							<SelectTrigger className="w-[160px] h-9">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="7d">Últimos 7 días</SelectItem>
								<SelectItem value="30d">Últimos 30 días</SelectItem>
								<SelectItem value="90d">Últimos 90 días</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Selector de Evento */}
					<div className="flex items-center gap-2">
						<Text variant="caption" className="text-muted-foreground">
							Evento:
						</Text>
						<Select value={selectedEvent} onValueChange={setSelectedEvent}>
							<SelectTrigger className="w-[220px] h-9">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los eventos</SelectItem>
								{eventsListData?.map((event) => (
									<SelectItem key={event.eventoID} value={event.eventoID.toString()}>
										{event.nombre}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setTimeRange("30d");
							setSelectedEvent("all");
						}}
					>
						<Icon icon="solar:refresh-linear" size={16} className="mr-1" />
						Limpiar Filtros
					</Button>
				</CardContent>
			</Card>

			{/* Quick Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{quickStats.map((stat) => (
					<Card
						key={stat.label}
						className="flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-shadow"
					>
						<CardContent className="flex flex-col gap-2 p-5">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="rounded-xl p-2.5" style={{ background: rgbAlpha(stat.color, 0.1) }}>
										<Icon icon={stat.icon} size={24} color={stat.color} />
									</div>
									<Text variant="body2" className="font-semibold text-muted-foreground">
										{stat.label}
									</Text>
								</div>
							</div>

							<div className="mt-4">
								<Title as="h3" className="text-2xl font-bold">
									{stat.value}
								</Title>
								<Text variant="caption" className="text-muted-foreground">
									{stat.subtext}
								</Text>
							</div>

							<div className="w-full h-12 mt-2">
								<Chart
									type="area"
									height={50}
									options={{
										...sparklineOptions,
										colors: [stat.color],
										fill: {
											type: "gradient",
											gradient: {
												shadeIntensity: 1,
												opacityFrom: 0.4,
												opacityTo: 0.1,
												stops: [0, 100],
											},
										},
									}}
									series={[{ data: stat.chart }]}
								/>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Main Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Sales Trend - Spans 2 cols */}
				<Card className="lg:col-span-2 shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon icon="solar:graph-new-bold-duotone" className="text-primary" size={24} />
							Tendencia de Ingresos
						</CardTitle>
					</CardHeader>
					<CardContent>
						{salesData?.ventasPorDia && salesData.ventasPorDia.length > 0 ? (
							<Chart type="bar" height={350} options={salesTrendOptions} series={salesTrendSeries} />
						) : (
							<div className="h-[350px] flex items-center justify-center text-muted-foreground">
								No hay datos para el periodo seleccionado
							</div>
						)}
					</CardContent>
				</Card>

				{/* Ticket Status - Spans 1 col */}
				<Card className="shadow-sm flex flex-col">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon icon="solar:pie-chart-2-bold-duotone" className="text-primary" size={24} />
							Distribución de Boletos
						</CardTitle>
					</CardHeader>
					<CardContent className="flex-1 flex items-center justify-center">
						<Chart type="donut" height={300} options={ticketStatusOptions} series={ticketStatusSeries} />
					</CardContent>
				</Card>
			</div>

			{/* Secondary Charts & Tables */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Occupancy Chart */}
				<Card className="lg:col-span-1 shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon icon="solar:users-group-rounded-bold-duotone" className="text-primary" size={24} />
							Ocupación por Evento
						</CardTitle>
					</CardHeader>
					<CardContent>
						{occupancyData?.ocupacionPorEvento && occupancyData.ocupacionPorEvento.length > 0 ? (
							<Chart type="bar" height={300} options={occupancyOptions} series={occupancySeries} />
						) : (
							<div className="h-[300px] flex items-center justify-center text-muted-foreground">
								No hay datos de ocupación
							</div>
						)}
					</CardContent>
				</Card>

				{/* Top Events Table - Spans 2 cols */}
				<Card className="lg:col-span-2 shadow-sm flex flex-col">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Icon icon="solar:cup-star-bold-duotone" className="text-primary" size={24} />
							Eventos con Mejor Desempeño
						</CardTitle>
					</CardHeader>
					<CardContent className="flex-1 overflow-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Evento</TableHead>
									<TableHead className="text-right">Boletos</TableHead>
									<TableHead className="text-right">Ingresos</TableHead>
									<TableHead className="text-right">Estado</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{salesData?.ventasPorEvento?.map((event) => (
									<TableRow key={event.eventoId}>
										<TableCell>
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
													<Icon icon="solar:music-note-bold-duotone" size={20} />
												</div>
												<div>
													<div className="font-semibold">{event.eventoNombre}</div>
													<div className="text-xs text-muted-foreground">ID: #{event.eventoId}</div>
												</div>
											</div>
										</TableCell>
										<TableCell className="text-right font-medium">{event.totalBoletos}</TableCell>
										<TableCell className="text-right font-bold text-emerald-600">
											{fCurrency(event.ingresoTotal)}
										</TableCell>
										<TableCell className="text-right">
											<Badge variant="secondary" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
												Activo
											</Badge>
										</TableCell>
									</TableRow>
								))}
								{(!salesData?.ventasPorEvento || salesData.ventasPorEvento.length === 0) && (
									<TableRow>
										<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
											No hay datos de eventos disponibles
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
