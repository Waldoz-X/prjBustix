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
import { Text, Title } from "@/ui/typography";
import { fCurrency } from "@/utils/format-number";
import { rgbAlpha } from "@/utils/theme";
import TicketsBanner from "./components/tickets-banner";

export default function TicketsPage() {
	// Filtros
	const [timeRange, setTimeRange] = useState("30d");
	const [selectedEventId, setSelectedEventId] = useState<string>("all");

	// Calcular fechas
	const { startDate, endDate } = useMemo(() => {
		const end = new Date();
		const start = new Date();
		const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
		start.setDate(end.getDate() - days);
		return { startDate: start, endDate: end };
	}, [timeRange]);

	// Fetch Eventos
	const { data: events, isLoading: isLoadingEvents } = useQuery({
		queryKey: ["events-filter"],
		queryFn: () => eventosService.getAllEventos(),
	});

	// Fetch Reporte Ventas
	const { data: salesData, isLoading: isLoadingReport } = useQuery({
		queryKey: ["tickets-report", selectedEventId, startDate.toISOString(), endDate.toISOString()],
		queryFn: () =>
			reportesService.getReporteVentas({
				eventoId: selectedEventId === "all" ? undefined : Number(selectedEventId),
				fechaDesde: startDate.toISOString(),
				fechaHasta: endDate.toISOString(),
			}),
	});

	const isLoading = isLoadingEvents || isLoadingReport;

	// --- Métricas ---
	const totalRevenue = salesData?.ingresoTotal || 0;
	const totalTickets = salesData?.boletosVendidos || 0;
	const cancelledTickets = salesData?.boletosCancelados || 0;
	const avgTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;

	// Mock sparkline data (placeholder hasta tener histórico real por día en API para cada métrica)
	const sparklineData = [10, 15, 12, 18, 20, 15, 22, 25];

	const quickStats = [
		{
			label: "Ingresos Totales",
			value: fCurrency(totalRevenue),
			icon: "solar:wallet-money-bold-duotone",
			color: "#3b82f6", // Blue
			chart: salesData?.ventasPorDia?.map((v) => v.ingresoTotal) || sparklineData,
			trend: "+12.5%",
			trendUp: true,
		},
		{
			label: "Boletos Vendidos",
			value: totalTickets.toLocaleString(),
			icon: "solar:ticket-sale-bold-duotone",
			color: "#10b981", // Emerald
			chart: salesData?.ventasPorDia?.map((v) => v.boletosVendidos) || sparklineData,
			trend: "+5.2%",
			trendUp: true,
		},
		{
			label: "Boletos Cancelados",
			value: cancelledTickets.toLocaleString(),
			icon: "solar:ticket-broken-bold-duotone",
			color: "#ef4444", // Red
			chart: [2, 1, 0, 1, 2, 1, 0, 1],
			trend: "-2.1%",
			trendUp: false, // Es bueno que baje
		},
		{
			label: "Precio Promedio",
			value: fCurrency(avgTicketPrice),
			icon: "solar:tag-price-bold-duotone",
			color: "#f59e42", // Orange
			chart: sparklineData,
			trend: "Estable",
			trendUp: true,
		},
	];

	// --- Configuración Gráficos ---

	// Sparklines
	const sparklineOptions = useChart({
		chart: { sparkline: { enabled: true } },
		grid: { show: false },
		yaxis: { show: false },
		tooltip: { enabled: false },
		stroke: { width: 2 },
	});

	// Tendencia de Ventas (Area)
	const salesTrendOptions = useChart({
		xaxis: {
			categories:
				salesData?.ventasPorDia?.map((v) =>
					new Date(v.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
				) || [],
			labels: {
				style: { fontSize: "11px", fontWeight: 600 },
			},
		},
		tooltip: {
			y: { formatter: (value: number) => fCurrency(value) },
		},
		colors: ["#3b82f6"],
		fill: {
			type: "gradient",
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0.05,
				stops: [0, 100],
			},
		},
		dataLabels: { enabled: false },
	});

	const salesTrendSeries = [
		{
			name: "Ingresos",
			data: salesData?.ventasPorDia?.map((v) => v.ingresoTotal) || [],
		},
	];

	// Estado de Boletos (Donut)
	const availableTickets = Math.max(
		0,
		(salesData?.totalBoletos || 0) - (salesData?.boletosVendidos || 0) - (salesData?.boletosCancelados || 0),
	);

	const ticketStatusOptions = useChart({
		labels: ["Vendidos", "Cancelados", "Disponibles"],
		colors: ["#10b981", "#ef4444", "#e5e7eb"],
		stroke: { show: false },
		legend: { position: "bottom" },
		tooltip: { fillSeriesColor: false },
		plotOptions: {
			pie: {
				donut: {
					size: "75%",
					labels: {
						show: true,
						total: {
							show: true,
							label: "Total",
							formatter: () => `${salesData?.totalBoletos || 0}`,
							fontSize: "18px",
							fontWeight: 700,
						},
					},
				},
			},
		},
	});

	const ticketStatusSeries = [salesData?.boletosVendidos || 0, salesData?.boletosCancelados || 0, availableTickets];

	// Desglose de Ingresos (Donut)
	const revenueBreakdownOptions = useChart({
		labels: ["Ingreso Base", "Cargos Servicio", "IVA", "Descuentos"],
		colors: ["#3b82f6", "#f59e42", "#8b5cf6", "#ef4444"],
		stroke: { show: false },
		legend: { position: "bottom" },
		tooltip: {
			y: { formatter: (value: number) => fCurrency(value) },
		},
		plotOptions: {
			pie: {
				donut: {
					size: "75%",
					labels: {
						show: true,
						total: {
							show: true,
							label: "Total",
							formatter: () => fCurrency(salesData?.ingresoTotal || 0),
							fontSize: "16px",
							fontWeight: 700,
						},
					},
				},
			},
		},
	});

	const revenueBreakdownSeries = [
		salesData?.ingresoBase || 0,
		salesData?.cargosServicio || 0,
		salesData?.iva || 0,
		salesData?.descuentosAplicados || 0,
	];

	// Ventas por Evento (Bar)
	const salesByEventOptions = useChart({
		xaxis: {
			categories: salesData?.ventasPorEvento?.map((e) => e.eventoNombre) || [],
			labels: {
				style: { fontSize: "11px" },
			},
		},
		plotOptions: {
			bar: {
				borderRadius: 4,
				columnWidth: "50%",
				distributed: true,
				horizontal: true,
				dataLabels: {
					position: "bottom",
				},
			},
		},
		dataLabels: {
			enabled: true,
			textAnchor: "start",
			style: {
				colors: ["#fff"],
			},
			formatter: (val, opt) => `${opt.w.globals.labels[opt.dataPointIndex]}:  ${fCurrency(val as number)}`,
			offsetX: 0,
			dropShadow: { enabled: true },
		},
		legend: { show: false },
		tooltip: {
			y: { formatter: (value: number) => fCurrency(value) },
		},
		colors: ["#3b82f6", "#10b981", "#f59e42", "#8b5cf6", "#ef4444"],
	});

	const salesByEventSeries = [
		{
			name: "Ingresos",
			data: salesData?.ventasPorEvento?.map((e) => e.ingresoTotal) || [],
		},
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
			<TicketsBanner />

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
						<Select value={selectedEventId} onValueChange={setSelectedEventId}>
							<SelectTrigger className="w-[220px] h-9">
								<SelectValue placeholder="Todos los eventos" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los eventos</SelectItem>
								{events?.map((event) => (
									<SelectItem key={event.eventoID} value={String(event.eventoID)}>
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
							setSelectedEventId("all");
						}}
					>
						<Icon icon="solar:refresh-linear" size={16} className="mr-1" />
						Limpiar
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
								<Badge
									variant="outline"
									className={`${
										stat.trendUp
											? "text-emerald-500 border-emerald-200 bg-emerald-50"
											: "text-red-500 border-red-200 bg-red-50"
									}`}
								>
									{stat.trend}
								</Badge>
							</div>

							<div className="mt-4">
								<Title as="h3" className="text-2xl font-bold">
									{stat.value}
								</Title>
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
							Tendencia de Ventas
						</CardTitle>
					</CardHeader>
					<CardContent>
						{salesData?.ventasPorDia && salesData.ventasPorDia.length > 0 ? (
							<Chart type="area" height={350} options={salesTrendOptions} series={salesTrendSeries} />
						) : (
							<div className="h-[350px] flex items-center justify-center text-muted-foreground">
								No hay datos de ventas para el periodo seleccionado
							</div>
						)}
					</CardContent>
				</Card>

				{/* Ticket Status - Spans 1 col */}
				<Card className="shadow-sm flex flex-col">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon icon="solar:pie-chart-2-bold-duotone" className="text-primary" size={24} />
							Estado de Boletos
						</CardTitle>
					</CardHeader>
					<CardContent className="flex-1 flex items-center justify-center">
						<Chart type="donut" height={300} options={ticketStatusOptions} series={ticketStatusSeries} />
					</CardContent>
				</Card>
			</div>

			{/* Secondary Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Revenue Breakdown */}
				<Card className="lg:col-span-1 shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon icon="solar:wallet-money-bold-duotone" className="text-primary" size={24} />
							Desglose de Ingresos
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Chart type="donut" height={300} options={revenueBreakdownOptions} series={revenueBreakdownSeries} />
					</CardContent>
				</Card>

				{/* Sales by Event - Spans 2 cols */}
				<Card className="lg:col-span-2 shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon icon="solar:ranking-bold-duotone" className="text-primary" size={24} />
							Ingresos por Evento
						</CardTitle>
					</CardHeader>
					<CardContent>
						{salesData?.ventasPorEvento && salesData.ventasPorEvento.length > 0 ? (
							<Chart type="bar" height={300} options={salesByEventOptions} series={salesByEventSeries} />
						) : (
							<div className="h-[300px] flex items-center justify-center text-muted-foreground">
								No hay datos de eventos
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
