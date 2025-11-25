import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import reportesService from "@/api/services/reportesService";
import { Chart, useChart } from "@/components/chart";
import Icon from "@/components/icon/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Text, Title } from "@/ui/typography";
import { fCurrency, fPercent } from "@/utils/format-number";
import { rgbAlpha } from "@/utils/theme";
import AnalyticsBanner from "./components/analytics-banner";

export default function EventAnalysisPage() {
	// 1. Fetch Data
	const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
		queryKey: ["analytics-dashboard"],
		queryFn: reportesService.getDashboard,
	});

	const { data: salesData, isLoading: isLoadingSales } = useQuery({
		queryKey: ["analytics-sales"],
		queryFn: () => reportesService.getReporteVentas(),
	});

	const { data: occupancyData, isLoading: isLoadingOccupancy } = useQuery({
		queryKey: ["analytics-occupancy"],
		queryFn: () => reportesService.getReporteOcupacion(),
	});

	const isLoading = isLoadingDashboard || isLoadingSales || isLoadingOccupancy;

	// 2. Prepare Metrics for Quick Stats
	const metrics = dashboardData?.metricas;
	const totalRevenue = salesData?.ingresoTotal || 0;
	const totalTickets = salesData?.boletosVendidos || 0;
	const activeEvents = metrics?.eventosActivos || 0;
	const avgOccupancy = occupancyData?.promedioOcupacion || 0;

	// Mock sparkline data (since API doesn't provide history for all metrics yet)
	const sparklineData = [10, 15, 12, 18, 20, 15, 22, 25];

	const quickStats = [
		{
			label: "Total Revenue",
			value: fCurrency(totalRevenue),
			icon: "solar:dollar-minimalistic-bold-duotone",
			color: "#3b82f6", // Blue
			chart: salesData?.ventasPorDia?.map((v) => v.totalVenta) || sparklineData,
			trend: "+12.5%",
			trendUp: true,
		},
		{
			label: "Tickets Sold",
			value: totalTickets.toLocaleString(),
			icon: "solar:ticket-sale-bold-duotone",
			color: "#10b981", // Emerald
			chart: sparklineData, // Placeholder
			trend: "+5.2%",
			trendUp: true,
		},
		{
			label: "Active Events",
			value: activeEvents.toString(),
			icon: "solar:calendar-mark-bold-duotone",
			color: "#f59e42", // Orange
			chart: [2, 2, 3, 2, 4, 3, 2, 2], // Placeholder
			trend: "Stable",
			trendUp: true,
		},
		{
			label: "Avg. Occupancy",
			value: fPercent(avgOccupancy / 100),
			icon: "solar:users-group-two-rounded-bold-duotone",
			color: "#6366f1", // Indigo
			chart: occupancyData?.ocupacionPorEvento?.map((e) => e.porcentajeOcupacion) || sparklineData,
			trend: avgOccupancy > 80 ? "High" : "Normal",
			trendUp: avgOccupancy > 50,
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

	// Sales Trend (Area)
	const salesTrendOptions = useChart({
		xaxis: {
			categories: salesData?.ventasPorDia?.map((v) => new Date(v.fecha).toLocaleDateString()) || [],
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
	});

	const salesTrendSeries = [
		{
			name: "Revenue",
			data: salesData?.ventasPorDia?.map((v) => v.totalVenta) || [],
		},
	];

	// Occupancy by Event (Bar)
	const occupancyOptions = useChart({
		xaxis: {
			categories: occupancyData?.ocupacionPorEvento?.map((e) => e.eventoNombre) || [],
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
			y: { formatter: (value: number) => `${value}%` },
		},
	});

	const occupancySeries = [
		{
			name: "Occupancy",
			data: occupancyData?.ocupacionPorEvento?.map((e) => e.porcentajeOcupacion) || [],
		},
	];

	// Ticket Status (Donut)
	const ticketStatusOptions = useChart({
		labels: ["Sold", "Cancelled", "Available"],
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
								{/* Trend Indicator */}
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
							Revenue Trend
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Chart type="area" height={350} options={salesTrendOptions} series={salesTrendSeries} />
					</CardContent>
				</Card>

				{/* Ticket Status - Spans 1 col */}
				<Card className="shadow-sm flex flex-col">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Icon icon="solar:pie-chart-2-bold-duotone" className="text-primary" size={24} />
							Ticket Distribution
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
							Occupancy by Event
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Chart type="bar" height={300} options={occupancyOptions} series={occupancySeries} />
					</CardContent>
				</Card>

				{/* Top Events Table - Spans 2 cols */}
				<Card className="lg:col-span-2 shadow-sm flex flex-col">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Icon icon="solar:cup-star-bold-duotone" className="text-primary" size={24} />
							Top Performing Events
						</CardTitle>
						<Button variant="outline" size="sm">
							View All
						</Button>
					</CardHeader>
					<CardContent className="flex-1 overflow-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Event</TableHead>
									<TableHead className="text-right">Tickets</TableHead>
									<TableHead className="text-right">Revenue</TableHead>
									<TableHead className="text-right">Status</TableHead>
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
										<TableCell className="text-right font-medium">{event.cantidadBoletos}</TableCell>
										<TableCell className="text-right font-bold text-emerald-600">
											{fCurrency(event.totalVenta)}
										</TableCell>
										<TableCell className="text-right">
											<Badge variant="secondary" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
												Active
											</Badge>
										</TableCell>
									</TableRow>
								))}
								{(!salesData?.ventasPorEvento || salesData.ventasPorEvento.length === 0) && (
									<TableRow>
										<TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
											No event data available
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
