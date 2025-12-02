import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

import { Calendar as CalendarIcon, DollarSign, Download, TrendingUp } from "lucide-react";

import { useState } from "react";
import Chart from "react-apexcharts";

import reportesService from "@/api/services/reportesService";
import { useHasRole } from "@/hooks/use-session";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

export default function RevenuePage() {
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isAdmin || isManager;

	const [dateRange, setDateRange] = useState("30"); // days
	const [groupBy, setGroupBy] = useState("dia");

	const { data: revenueData, isLoading } = useQuery({
		queryKey: ["revenue", dateRange, groupBy],
		queryFn: () => {
			const endDate = new Date();
			const startDate = subDays(endDate, parseInt(dateRange));
			return reportesService.getReporteFinancieroIngresos({
				fechaDesde: startDate.toISOString(),
				fechaHasta: endDate.toISOString(),
				agruparPor: groupBy,
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

	const chartOptions = {
		chart: {
			type: "area" as const,
			fontFamily: "inherit",
			toolbar: { show: false },
			animations: { enabled: true },
		},
		dataLabels: { enabled: false },
		stroke: { curve: "smooth" as const, width: 2 },
		xaxis: {
			categories: revenueData?.agrupado?.map((d) => format(new Date(d.fecha), "dd MMM", { locale: es })) || [],
			axisBorder: { show: false },
			axisTicks: { show: false },
		},
		yaxis: {
			labels: {
				formatter: (value: number) => `$${value.toLocaleString()}`,
			},
		},
		grid: {
			strokeDashArray: 4,
			padding: { top: 0, right: 0, bottom: 0, left: 10 },
		},
		theme: { mode: "light" as const },
		colors: ["#0ea5e9"], // Sky 500
		fill: {
			type: "gradient",
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.4,
				opacityTo: 0.05,
				stops: [0, 100],
			},
		},
		tooltip: {
			y: {
				formatter: (value: number) => `$${value.toLocaleString()}`,
			},
		},
	};

	const chartSeries = [
		{
			name: "Ingresos",
			data: revenueData?.agrupado?.map((d) => d.ingreso) || [],
		},
	];

	return (
		<div className="space-y-8 p-8 animate-in fade-in duration-500">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Reporte de Ingresos</h1>
					<p className="text-muted-foreground mt-1">Análisis detallado del rendimiento financiero.</p>
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
				<Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">Ingreso Total</CardTitle>
						<DollarSign className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${revenueData?.ingresoTotal?.toLocaleString() || "0"}</div>
						<p className="text-xs text-muted-foreground mt-1">Ingresos brutos del periodo</p>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden border-l-4 border-l-emerald-500 shadow-sm transition-all hover:shadow-md">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">Ingreso Base</CardTitle>
						<TrendingUp className="h-4 w-4 text-emerald-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${revenueData?.ingresoBase?.toLocaleString() || "0"}</div>
						<p className="text-xs text-muted-foreground mt-1">Sin cargos ni descuentos</p>
					</CardContent>
				</Card>

				<Card className="relative overflow-hidden border-l-4 border-l-amber-500 shadow-sm transition-all hover:shadow-md">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">Cargos de Servicio</CardTitle>
						<CalendarIcon className="h-4 w-4 text-amber-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${revenueData?.cargos?.toLocaleString() || "0"}</div>
						<p className="text-xs text-muted-foreground mt-1">Total acumulado por servicios</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Chart */}
			<Card className="col-span-4 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Tendencia de Ingresos</CardTitle>
							<CardDescription>Visualización del comportamiento de ventas en el tiempo.</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Button variant={groupBy === "dia" ? "secondary" : "ghost"} size="sm" onClick={() => setGroupBy("dia")}>
								Día
							</Button>
							<Button variant={groupBy === "mes" ? "secondary" : "ghost"} size="sm" onClick={() => setGroupBy("mes")}>
								Mes
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pl-0">
					<div className="h-[350px] w-full">
						{isLoading ? (
							<div className="flex h-full items-center justify-center">
								<div className="animate-pulse text-muted-foreground">Cargando datos...</div>
							</div>
						) : (
							<Chart options={chartOptions} series={chartSeries} type="area" height={350} width="100%" />
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
