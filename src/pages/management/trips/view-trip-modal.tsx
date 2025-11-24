import {
	Bus,
	Calendar,
	Clock,
	DollarSign,
	Edit,
	MapPin,
	Navigation,
	Settings,
	TrendingUp,
	User,
	Users,
} from "lucide-react";
import type { ViajeDto } from "@/api/services/viajesService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Separator } from "@/ui/separator";

interface ViewTripModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	viaje: ViajeDto | null;
	onEdit?: () => void;
	onConfigurePrices?: () => void;
	onViewStops?: () => void;
}

export function ViewTripModal({
	open,
	onOpenChange,
	viaje,
	onEdit,
	onConfigurePrices,
	onViewStops,
}: ViewTripModalProps) {
	if (!viaje) return null;

	const formatDate = (d?: string) => {
		if (!d) return "N/A";
		try {
			return new Date(d).toLocaleString("es-MX", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return String(d);
		}
	};

	const formatCurrency = (amt?: number) => {
		if (amt === undefined || amt === null) return "N/A";
		return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amt);
	};

	const getStatusVariant = (estatus: number): "default" | "secondary" | "destructive" | "outline" => {
		switch (estatus) {
			case 1:
				return "default"; // Programado
			case 2:
				return "default"; // En curso
			case 3:
				return "secondary"; // Completado
			case 4:
				return "destructive"; // Cancelado
			default:
				return "outline";
		}
	};

	const ocupacionPorcentaje = viaje.cupoTotal > 0 ? ((viaje.asientosVendidos / viaje.cupoTotal) * 100).toFixed(1) : "0";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="!max-w-5xl h-[85vh] flex flex-col p-0">
				<DialogHeader className="px-6 py-4 border-b">
					<DialogTitle className="flex items-center gap-2">
						<Bus className="h-5 w-5" />
						Detalles del Viaje
					</DialogTitle>
					<DialogDescription>Información completa del viaje {viaje.codigoViaje}</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto p-6">
					<div className="space-y-6">
						{/* Información General */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Navigation className="h-5 w-5" />
									Información General
								</CardTitle>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">Código de Viaje</p>
									<p className="font-semibold text-lg">{viaje.codigoViaje}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Tipo de Viaje</p>
									<Badge variant="outline" className="mt-1">
										{viaje.tipoViaje}
									</Badge>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Estado</p>
									<Badge variant={getStatusVariant(viaje.estatus)} className="mt-1">
										{viaje.estatusNombre}
									</Badge>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Fecha de Creación</p>
									<p className="font-medium">{formatDate(viaje.fechaCreacion)}</p>
								</div>
							</CardContent>
						</Card>

						{/* Evento */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Calendar className="h-5 w-5" />
									Evento
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<p className="text-sm text-muted-foreground">Nombre del Evento</p>
									<p className="font-semibold text-lg">{viaje.eventoNombre}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Fecha del Evento</p>
									<p className="font-medium">{formatDate(viaje.eventoFecha)}</p>
								</div>
							</CardContent>
						</Card>

						{/* Ruta */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<MapPin className="h-5 w-5" />
									Ruta
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<p className="text-sm text-muted-foreground">Nombre de la Ruta</p>
									<p className="font-semibold">{viaje.rutaNombre}</p>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-muted-foreground">Origen</p>
										<p className="font-medium">{viaje.ciudadOrigen}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Destino</p>
										<p className="font-medium">{viaje.ciudadDestino}</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Recursos Asignados */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Bus className="h-5 w-5" />
										Recursos Asignados
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<p className="text-sm text-muted-foreground mb-1">Unidad</p>
										<div className="flex items-center gap-2">
											<Bus className="h-4 w-4 text-muted-foreground" />
											<div>
												<p className="font-semibold">{viaje.unidadModelo}</p>
												<p className="text-sm text-muted-foreground">Placas: {viaje.unidadPlacas}</p>
											</div>
										</div>
									</div>
									<Separator />
									<div>
										<p className="text-sm text-muted-foreground mb-1">Chofer</p>
										<div className="flex items-center gap-2">
											<User className="h-4 w-4 text-muted-foreground" />
											<p className="font-semibold">{viaje.choferNombre}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Fechas */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<Clock className="h-5 w-5" />
										Fechas y Horarios
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<p className="text-sm text-muted-foreground">Fecha de Salida</p>
										<p className="font-medium">{formatDate(viaje.fechaSalida)}</p>
									</div>
									<Separator />
									<div>
										<p className="text-sm text-muted-foreground">Llegada Estimada</p>
										<p className="font-medium">{formatDate(viaje.fechaLlegadaEstimada)}</p>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Capacidad y Ventas */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Users className="h-5 w-5" />
									Capacidad y Ventas
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									<div>
										<p className="text-sm text-muted-foreground">Cupo Total</p>
										<p className="font-semibold text-2xl">{viaje.cupoTotal}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Asientos Vendidos</p>
										<p className="font-semibold text-2xl text-green-600">{viaje.asientosVendidos}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Disponibles</p>
										<p className="font-semibold text-2xl text-blue-600">{viaje.asientosDisponibles}</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Ocupación</p>
										<div className="flex items-baseline gap-1">
											<p className="font-semibold text-2xl">{ocupacionPorcentaje}</p>
											<p className="text-sm text-muted-foreground">%</p>
										</div>
									</div>
								</div>
								<div className="mt-4">
									<div className="w-full bg-secondary rounded-full h-2">
										<div
											className="bg-primary h-2 rounded-full transition-all"
											style={{ width: `${ocupacionPorcentaje}%` }}
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Precios */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<DollarSign className="h-5 w-5" />
									Información de Precios
								</CardTitle>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">Precio Base</p>
									<p className="font-semibold text-xl">{formatCurrency(viaje.precioBase)}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Cargo de Servicio</p>
									<p className="font-semibold text-xl">{formatCurrency(viaje.cargoServicio)}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Total</p>
									<p className="font-semibold text-xl text-primary">
										{formatCurrency((viaje.precioBase || 0) + (viaje.cargoServicio || 0))}
									</p>
								</div>
								<div className="md:col-span-3">
									<p className="text-sm text-muted-foreground">Ventas</p>
									<Badge variant={viaje.ventasAbiertas ? "default" : "secondary"} className="mt-1">
										{viaje.ventasAbiertas ? "Abiertas" : "Cerradas"}
									</Badge>
								</div>
							</CardContent>
						</Card>

						{/* Estadísticas */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<TrendingUp className="h-5 w-5" />
									Estadísticas
								</CardTitle>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">Total de Paradas</p>
									<p className="font-semibold text-2xl">{viaje.totalParadas || 0}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Staff Asignado</p>
									<p className="font-semibold text-2xl">{viaje.totalStaff || 0}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Incidencias</p>
									<p className="font-semibold text-2xl text-destructive">{viaje.totalIncidencias || 0}</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				<DialogFooter className="px-6 py-4 border-t mt-auto">
					<div className="flex gap-2 w-full justify-between">
						<div className="flex gap-2">
							{onViewStops && (
								<Button variant="outline" onClick={onViewStops}>
									<MapPin className="mr-2 h-4 w-4" />
									Ver Paradas
								</Button>
							)}
							{onConfigurePrices && (
								<Button variant="outline" onClick={onConfigurePrices}>
									<Settings className="mr-2 h-4 w-4" />
									Configurar Precios
								</Button>
							)}
						</div>
						<div className="flex gap-2">
							<Button variant="outline" onClick={() => onOpenChange(false)}>
								Cerrar
							</Button>
							{onEdit && (
								<Button onClick={onEdit}>
									<Edit className="mr-2 h-4 w-4" />
									Editar
								</Button>
							)}
						</div>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
