import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import eventosService from "@/api/services/eventosService";
import reportesService from "@/api/services/reportesService";
import { Chart, useChart } from "@/components/chart";
import Icon from "@/components/icon/icon";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Text, Title } from "@/ui/typography";
import { fCurrency } from "@/utils/format-number";
import { rgbAlpha } from "@/utils/theme";
import TicketsBanner from "./components/tickets-banner";

export default function TicketsPage() {
	const [selectedEventId, setSelectedEventId] = useState<string>("all");

	// Fetch Events for Filter
	const { data: events, isLoading: isLoadingEvents } = useQuery({
		queryKey: ["events-filter"],
		queryFn: () => eventosService.getAllEventos(),
	});

	// Fetch Sales Report with optional filter
	const { data: salesData, isLoading: isLoadingReport } = useQuery({
		queryKey: ["tickets-report", selectedEventId],
		queryFn: () =>
			reportesService.getReporteVentas({
				eventoId: selectedEventId === "all" ? undefined : Number(selectedEventId),
			}),
	});

	const isLoading = isLoadingEvents || isLoadingReport;

	// --- Metrics Calculation ---
	const totalRevenue = salesData?.ingresoTotal || 0;
	const totalTickets = salesData?.boletosVendidos || 0;
	const cancelledTickets = salesData?.boletosCancelados || 0;
	const avgTicketPrice = totalTickets > 0 ? totalRevenue / totalTickets : 0;

	// Mock sparkline data
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
			chart: sparklineData,
			trend: "+5.2%",
			trendUp: true,
		},
		{
			label: "Cancelled Tickets",
			value: cancelledTickets.toLocaleString(),
			icon: "solar:ticket-broken-bold-duotone",
			color: "#ef4444", // Red
			chart: [2, 1, 0, 1, 2, 1, 0, 1],
			trend: "-2.1%",
			trendUp: false, // Good thing
		},
		{
			label: "Avg. Ticket Price",
			value: fCurrency(avgTicketPrice),
			icon: "solar:tag-price-bold-duotone",
			color: "#f59e42", // Orange
			chart: sparklineData,
			trend: "Stable",
			trendUp: true,
		},
	];

	// --- Chart Configuration ---

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

	// Ticket Status (Donut)
	const availableTickets = Math.max(
		0,
		(salesData?.totalBoletos || 0) - (salesData?.boletosVendidos || 0) - (salesData?.boletosCancelados || 0),
	);

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

	const ticketStatusSeries = [salesData?.boletosVendidos || 0, salesData?.boletosCancelados || 0, availableTickets];

	// Revenue Breakdown (Donut)
	const revenueBreakdownOptions = useChart({
		labels: ["Base Revenue", "Service Charges"],
		colors: ["#3b82f6", "#f59e42"],
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
							formatter: () => fCurrency((salesData?.ingresoBase || 0) + (salesData?.cargosServicio || 0)),
						},
					},
				},
			},
		},
	});

	const revenueBreakdownSeries = [salesData?.ingresoBase || 0, salesData?.cargosServicio || 0];

	// Sales by Event (Bar)
	const salesByEventOptions = useChart({
		xaxis: {
			categories: salesData?.ventasPorEvento?.map((e) => e.eventoNombre) || [],
		},
		plotOptions: {
			bar: {
				borderRadius: 4,
				columnWidth: "45%",
				distributed: true,
				horizontal: true,
			},
		},
		legend: { show: false },
		tooltip: {
			y: { formatter: (value: number) => fCurrency(value) },
		},
	});

	const salesByEventSeries = [
		{
			name: "Revenue",
			data: salesData?.ventasPorEvento?.map((e) => e.totalVenta) || [],
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

			{/* Filter Section */}
			<div className="flex justify-end">
				<div className="w-full md:w-[250px]">
					<Select value={selectedEventId} onValueChange={setSelectedEventId}>
						<SelectTrigger className="bg-background">
							<SelectValue placeholder="Filter by event" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Events</SelectItem>
							{events?.map((event) => (
								<SelectItem key={event.eventoID} value={String(event.eventoID)}>
									{event.nombre}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

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
							Sales Trend
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
							Ticket Status
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
							Revenue Breakdown
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
							Revenue by Event
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Chart type="bar" height={300} options={salesByEventOptions} series={salesByEventSeries} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
