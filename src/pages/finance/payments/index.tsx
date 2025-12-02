import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { AlertCircle, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { useState } from "react";
import Chart from "react-apexcharts";

import reportesService from "@/api/services/reportesService";
import { useHasRole } from "@/hooks/use-session";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

export default function PaymentsPage() {
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isAdmin || isManager;

	const [dateRange, setDateRange] = useState("30");

	const { data: paymentsData, isLoading } = useQuery({
		queryKey: ["payments", dateRange],
		queryFn: () => {
			const endDate = new Date();
			const startDate = subDays(endDate, parseInt(dateRange));
			return reportesService.getReporteFinancieroPagos({
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

	// Chart: Methods
	const methodChartOptions = {
		chart: { type: "donut" as const, fontFamily: "inherit" },
		labels: paymentsData?.porMetodo?.map((m) => m.metodo) || [],
		colors: ["#0ea5e9", "#22c55e", "#eab308", "#ef4444"],
		plotOptions: {
			pie: {
				donut: {
					size: "70%",
					labels: {
						show: true,
						total: {
							show: true,
							label: "Total",
							formatter: () => `$${(paymentsData?.montoTotal || 0).toLocaleString()}`,
						},
					},
				},
			},
		},
		dataLabels: { enabled: false },
		legend: { position: "bottom" as const },
	};
	const methodChartSeries = paymentsData?.porMetodo?.map((m) => m.total) || [];

	// Chart: Providers
	const providerChartOptions = {
		chart: { type: "bar" as const, fontFamily: "inherit", toolbar: { show: false } },
		plotOptions: { bar: { borderRadius: 4, horizontal: true } },
		dataLabels: { enabled: true },
		xaxis: { categories: paymentsData?.porProveedor?.map((p) => p.proveedor) || [] },
		colors: ["#6366f1"],
	};
	const providerChartSeries = [
		{
			name: "Monto",
			data: paymentsData?.porProveedor?.map((p) => p.total) || [],
		},
	];

	// Helper to get status counts
	const getStatusCount = (statusId: number) => {
		return paymentsData?.porEstatus?.find((s) => s.estatus === statusId)?.count || 0;
	};
	const getStatusTotal = (statusId: number) => {
		return paymentsData?.porEstatus?.find((s) => s.estatus === statusId)?.total || 0;
	};

	return (
		<div className="space-y-8 p-8 animate-in fade-in duration-500">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Gestión de Pagos</h1>
					<p className="text-muted-foreground mt-1">Resumen de transacciones por proveedor y método.</p>
				</div>
				<div className="flex items-center gap-2">
					<Select value={dateRange} onValueChange={setDateRange}>
						<SelectTrigger className="w-[180px]">
							<Clock className="mr-2 h-4 w-4" />
							<SelectValue placeholder="Periodo" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7">Últimos 7 días</SelectItem>
							<SelectItem value="30">Últimos 30 días</SelectItem>
							<SelectItem value="90">Últimos 3 meses</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* KPI Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card className="border-l-4 border-l-blue-500 shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total Procesado</CardTitle>
						<DollarSign className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${paymentsData?.montoTotal?.toLocaleString() || "0"}</div>
						<p className="text-xs text-muted-foreground mt-1">{paymentsData?.totalPagos || 0} transacciones</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-green-500 shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">Completados (15)</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${getStatusTotal(15).toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">{getStatusCount(15)} operaciones</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-amber-500 shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">Pendientes (14)</CardTitle>
						<Clock className="h-4 w-4 text-amber-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${getStatusTotal(14).toLocaleString()}</div>
						<p className="text-xs text-muted-foreground mt-1">{getStatusCount(14)} operaciones</p>
					</CardContent>
				</Card>
				<Card className="border-l-4 border-l-red-500 shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-sm font-medium text-muted-foreground">Otros Estados</CardTitle>
						<AlertCircle className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${((paymentsData?.montoTotal || 0) - getStatusTotal(15) - getStatusTotal(14)).toLocaleString()}
						</div>
						<p className="text-xs text-muted-foreground mt-1">Fallidos o cancelados</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-8 md:grid-cols-2">
				{/* Chart: Methods */}
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle>Métodos de Pago</CardTitle>
						<CardDescription>Distribución por tipo</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[300px] flex items-center justify-center">
							{isLoading ? (
								<div className="animate-pulse text-muted-foreground">Cargando...</div>
							) : (
								<Chart options={methodChartOptions} series={methodChartSeries} type="donut" width="100%" />
							)}
						</div>
					</CardContent>
				</Card>

				{/* Chart: Providers */}
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle>Proveedores</CardTitle>
						<CardDescription>Volumen por pasarela de pago</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-[300px] flex items-center justify-center">
							{isLoading ? (
								<div className="animate-pulse text-muted-foreground">Cargando...</div>
							) : (
								<Chart
									options={providerChartOptions}
									series={providerChartSeries}
									type="bar"
									width="100%"
									height={300}
								/>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
