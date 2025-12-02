import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { Calendar as CalendarIcon, DollarSign, Download, Ticket, TrendingUp } from "lucide-react";
import { useState } from "react";
import Chart from "react-apexcharts";

import reportesService from "@/api/services/reportesService";
import { useHasRole } from "@/hooks/use-session";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

export default function FinancialReportsPage() {
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isAdmin || isManager;

	const [dateRange, setDateRange] = useState("30");

	const { data: salesData, isLoading } = useQuery({
		queryKey: ["financial-sales", dateRange],
		queryFn: () => {
			const endDate = new Date();
			const startDate = subDays(endDate, parseInt(dateRange));
			return reportesService.getReporteFinancieroVentas({
				fechaDesde: startDate.toISOString(),
				fechaHasta: endDate.toISOString(),
			});
		},
		enabled: allowed,
	});

	if (!allowed) {
		return (
			<div className="flex h-[50vh] items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-red-500">Acceso Denegado</CardTitle>
						<CardDescription>No tienes permisos para ver esta sección.</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	const routeChartOptions = {
		chart: {
			type: "bar" as const,
			fontFamily: "inherit",
			toolbar: { show: false },
		},
		plotOptions: {
			bar: {
				borderRadius: 4,
				horizontal: true,
				distributed: true,
			},
		},
		dataLabels: { enabled: true },
		xaxis: {
			categories: salesData?.ventasPorRuta?.map((d) => `Ruta ${d.rutaId}`) || [],
		},
		colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
		theme: { mode: "light" as const },
		legend: { show: false },
	};

	const routeChartSeries = [
		{
			name: "Ventas",
			data: salesData?.ventasPorRuta?.map((d) => d.ingresos) || [],
		},
	];

	return (
		<div className="space-y-8 p-8 animate-in fade-in duration-500">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Reportes Financieros</h1>
					<p className="text-muted-foreground mt-1">Resumen de ventas y rendimiento comercial.</p>
				</div>
				<div className="flex items-center gap-2">
					<Select value={dateRange} onValueChange={setDateRange}>
						<SelectTrigger className="w-[180px]">
							<CalendarIcon className="mr-2 h-4 w-4" />
							<SelectValue placeholder="Periodo" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7">Últimos 7 días</SelectItem>
							<SelectItem value="30">Últimos 30 días</SelectItem>
							<SelectItem value="90">Últimos 3 meses</SelectItem>
							<SelectItem value="365">Último año</SelectItem>
						</SelectContent>
					</Select>
					<Button variant="outline" size="icon">
						<Download className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* KPI Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background border-blue-100 dark:border-blue-900 shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Ingreso Total</CardTitle>
						<DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
							${salesData?.ingresoTotal?.toLocaleString() || "0"}
						</div>
						<p className="text-xs text-muted-foreground mt-1">Ingresos brutos por ventas</p>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950 dark:to-background border-emerald-100 dark:border-emerald-900 shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
							Boletos Vendidos
						</CardTitle>
						<Ticket className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
							{salesData?.totalBoletos?.toLocaleString() || "0"}
						</div>
						<p className="text-xs text-muted-foreground mt-1">Total de tickets emitidos</p>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-violet-50 to-white dark:from-violet-950 dark:to-background border-violet-100 dark:border-violet-900 shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-violet-600 dark:text-violet-400">Ticket Promedio</CardTitle>
						<TrendingUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-violet-700 dark:text-violet-300">
							${salesData?.ticketPromedio?.toLocaleString() || "0"}
						</div>
						<p className="text-xs text-muted-foreground mt-1">Valor promedio por venta</p>
					</CardContent>
				</Card>
			</div>

			{/* Content Tabs */}
			<Tabs defaultValue="routes" className="space-y-4">
				<TabsList>
					<TabsTrigger value="routes">Ventas por Ruta</TabsTrigger>
					<TabsTrigger value="summary">Resumen Ejecutivo</TabsTrigger>
				</TabsList>

				<TabsContent value="routes" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Ventas por Ruta</CardTitle>
								<CardDescription>Distribución de ingresos según la ruta.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[350px]">
									{isLoading ? (
										<div className="flex h-full items-center justify-center text-muted-foreground">Cargando...</div>
									) : (
										<Chart options={routeChartOptions} series={routeChartSeries} type="bar" height={350} width="100%" />
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Detalle por Ruta</CardTitle>
								<CardDescription>Desglose numérico de operaciones.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{salesData?.ventasPorRuta?.map((ruta, index) => (
										<div
											key={ruta.rutaId}
											className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
										>
											<div className="flex items-center gap-4">
												<div
													className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800`}
												>
													<span className="font-bold text-gray-600 dark:text-gray-300">{index + 1}</span>
												</div>
												<div>
													<p className="font-medium">Ruta {ruta.rutaId}</p>
													<p className="text-sm text-muted-foreground">{ruta.boletos} boletos</p>
												</div>
											</div>
											<div className="text-right">
												<p className="font-bold">${ruta.ingresos.toLocaleString()}</p>
												<p className="text-xs text-muted-foreground">
													{salesData.ingresoTotal > 0 ? ((ruta.ingresos / salesData.ingresoTotal) * 100).toFixed(1) : 0}
													%
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="summary">
					<Card>
						<CardHeader>
							<CardTitle>Resumen Financiero</CardTitle>
							<CardDescription>Visión general del rendimiento del periodo seleccionado.</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
								<div className="space-y-2">
									<h4 className="font-medium text-muted-foreground">Ingresos Netos</h4>
									<p className="text-2xl font-bold">${salesData?.ingresoTotal?.toLocaleString()}</p>
								</div>
								<div className="space-y-2">
									<h4 className="font-medium text-muted-foreground">Ingreso Base</h4>
									<p className="text-2xl font-bold">${salesData?.ingresoBase?.toLocaleString()}</p>
								</div>
								<div className="space-y-2">
									<h4 className="font-medium text-muted-foreground">Descuentos</h4>
									<p className="text-2xl font-bold text-red-500">-${salesData?.descuentos?.toLocaleString()}</p>
								</div>
								<div className="space-y-2">
									<h4 className="font-medium text-muted-foreground">Cargos</h4>
									<p className="text-2xl font-bold text-green-500">+${salesData?.cargos?.toLocaleString()}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
