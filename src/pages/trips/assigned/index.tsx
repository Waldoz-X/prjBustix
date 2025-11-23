import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Calendar, ClipboardList, MapPin, Users } from "lucide-react";
import viajesService, { type ViajeDto } from "@/api/services/viajesService";
import { useHasRole } from "@/hooks/use-session";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

export default function AssignedTripsPage() {
	const isOperator = useHasRole("Operator");
	const isStaff = useHasRole("Staff");
	const allowed = isOperator || isStaff;

	const { data: viajes = [], isLoading } = useQuery({
		queryKey: ["mis-viajes"],
		queryFn: () => viajesService.getMisViajes({ soloProximos: false }),
		enabled: allowed,
	});

	if (!allowed) {
		return (
			<div className="p-6">
				<Card>
					<CardHeader>
						<CardTitle>Acceso denegado</CardTitle>
					</CardHeader>
					<CardContent>
						<p>No tienes permisos para ver esta página.</p>
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
			render: (text) => <span className="font-mono font-bold">{text}</span>,
		},
		{
			title: "Evento",
			dataIndex: "eventoNombre",
			key: "eventoNombre",
		},
		{
			title: "Ruta",
			dataIndex: "rutaNombre",
			key: "rutaNombre",
			render: (text, record) => (
				<div className="flex flex-col">
					<span className="font-medium">{text}</span>
					<div className="flex items-center text-xs text-muted-foreground">
						<MapPin className="h-3 w-3 mr-1" />
						{record.ciudadOrigen} - {record.ciudadDestino}
					</div>
				</div>
			),
		},
		{
			title: "Salida",
			dataIndex: "fechaSalida",
			key: "fechaSalida",
			render: (date) => (
				<div className="flex items-center">
					<Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
					{new Date(date).toLocaleString()}
				</div>
			),
		},
		{
			title: "Unidad",
			key: "unidad",
			render: (_, record) => (
				<div className="flex flex-col text-sm">
					<span className="font-medium">{record.unidadPlacas}</span>
					<span className="text-xs text-muted-foreground">{record.unidadModelo}</span>
				</div>
			),
		},
		{
			title: "Pasajeros",
			key: "ocupacion",
			render: (_, record) => (
				<div className="flex items-center gap-2">
					<Users className="h-4 w-4 text-muted-foreground" />
					<span>
						{record.asientosVendidos} / {record.cupoTotal}
					</span>
				</div>
			),
		},
		{
			title: "Estado",
			dataIndex: "estatusNombre",
			key: "estatus",
			render: (status) => <Badge variant="outline">{status}</Badge>,
		},
	];

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-bold flex items-center gap-2">
					<ClipboardList className="h-8 w-8" />
					Mis Viajes Asignados
				</h1>
				<p className="text-muted-foreground mt-2">Viajes asignados a tu usuario</p>
			</div>

			<Card>
				<CardContent className="p-0">
					<Table
						dataSource={viajes}
						columns={columns}
						rowKey="viajeID"
						pagination={{ pageSize: 10 }}
						loading={isLoading}
						scroll={{ x: "max-content" }}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
