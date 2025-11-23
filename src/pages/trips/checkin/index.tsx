import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Clock, MapPin, Play, StopCircle, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import viajesService from "@/api/services/viajesService";
import { useHasRole } from "@/hooks/use-session";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

export default function CheckInPage() {
	const isOperator = useHasRole("Operator");
	const isStaff = useHasRole("Staff");
	const allowed = isOperator || isStaff;
	const queryClient = useQueryClient();

	const [selectedViajeId, setSelectedViajeId] = useState<string>("");

	// Fetch assigned trips
	const { data: misViajes = [] } = useQuery({
		queryKey: ["mis-viajes"],
		queryFn: () => viajesService.getMisViajes({ soloProximos: true }),
		enabled: allowed,
	});

	// Fetch progress for selected trip
	const { data: progreso } = useQuery({
		queryKey: ["checkin-progreso", selectedViajeId],
		queryFn: () => viajesService.getProgresoCheckin(Number(selectedViajeId)),
		enabled: !!selectedViajeId,
		refetchInterval: 10000, // Poll every 10 seconds
	});

	const confirmarLlegadaMutation = useMutation({
		mutationFn: (paradaId: number) =>
			viajesService.confirmarLlegada(Number(selectedViajeId), {
				paradaViajeID: paradaId,
				latitud: 0, // TODO: Get real location
				longitud: 0,
			}),
		onSuccess: () => {
			toast.success("Llegada confirmada");
			queryClient.invalidateQueries({ queryKey: ["checkin-progreso", selectedViajeId] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al confirmar llegada");
		},
	});

	const iniciarValidacionMutation = useMutation({
		mutationFn: (paradaId: number) =>
			viajesService.iniciarValidacion(Number(selectedViajeId), {
				paradaViajeID: paradaId,
			}),
		onSuccess: () => {
			toast.success("Validación iniciada");
			queryClient.invalidateQueries({ queryKey: ["checkin-progreso", selectedViajeId] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al iniciar validación");
		},
	});

	const finalizarValidacionMutation = useMutation({
		mutationFn: (data: { paradaId: number; abordados: number; noShow: number }) =>
			viajesService.finalizarValidacion(Number(selectedViajeId), {
				paradaViajeID: data.paradaId,
				totalAbordados: data.abordados,
				totalNoShow: data.noShow,
			}),
		onSuccess: () => {
			toast.success("Validación finalizada");
			queryClient.invalidateQueries({ queryKey: ["checkin-progreso", selectedViajeId] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al finalizar validación");
		},
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

	const currentStop = progreso?.paradas.find((p) => p.estado !== "Completada");

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-bold flex items-center gap-2">
					<CheckCircle className="h-8 w-8" />
					Check-In Progresivo
				</h1>
				<p className="text-muted-foreground mt-2">Registro de llegadas por parada</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Seleccionar Viaje Activo</CardTitle>
				</CardHeader>
				<CardContent>
					<Select value={selectedViajeId} onValueChange={setSelectedViajeId}>
						<SelectTrigger>
							<SelectValue placeholder="Selecciona un viaje..." />
						</SelectTrigger>
						<SelectContent>
							{misViajes.map((viaje) => (
								<SelectItem key={viaje.viajeID} value={String(viaje.viajeID)}>
									{viaje.codigoViaje} - {viaje.rutaNombre} ({new Date(viaje.fechaSalida).toLocaleString()})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</CardContent>
			</Card>

			{selectedViajeId && progreso && (
				<>
					<div className="grid gap-4 md:grid-cols-3">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium">Parada Actual</CardTitle>
								<MapPin className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{currentStop?.nombreParada || "Fin del viaje"}</div>
								<p className="text-xs text-muted-foreground">
									{currentStop ? `Orden: ${currentStop.ordenParada}` : "Todas las paradas completadas"}
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium">Progreso</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{progreso.porcentajeAvance}%</div>
								<p className="text-xs text-muted-foreground">
									{progreso.paradasCompletadas} / {progreso.totalParadas} paradas
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardTitle className="text-sm font-medium">Estado</CardTitle>
								<Clock className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{progreso.estadoGeneral}</div>
								<p className="text-xs text-muted-foreground">Estado del viaje</p>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Itinerario de Paradas</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-8">
								{progreso.paradas.map((parada, index) => (
									<div key={parada.paradaViajeID} className="flex items-start relative">
										{/* Line connector */}
										{index < progreso.paradas.length - 1 && (
											<div className="absolute left-2.5 top-8 bottom-0 w-0.5 bg-border h-full -mb-8" />
										)}

										<div
											className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
												parada.estado === "Completada"
													? "bg-primary border-primary text-primary-foreground"
													: "bg-background border-muted-foreground"
											} mt-1 mr-4 z-10`}
										>
											{parada.estado === "Completada" && <CheckCircle className="h-3.5 w-3.5" />}
										</div>

										<div className="flex-1 space-y-1">
											<div className="flex items-center justify-between">
												<p className="font-medium leading-none">{parada.nombreParada}</p>
												<span className="text-sm text-muted-foreground">{parada.horaEstimadaLlegada}</span>
											</div>
											<p className="text-sm text-muted-foreground">{parada.direccion}</p>
											<div className="flex items-center gap-2 mt-2">
												<span className="text-xs bg-secondary px-2 py-1 rounded-md">{parada.estado}</span>
												{parada.estado === "Pendiente" && (
													<Button
														size="sm"
														onClick={() => confirmarLlegadaMutation.mutate(parada.paradaViajeID)}
														disabled={confirmarLlegadaMutation.isPending}
													>
														Confirmar Llegada
													</Button>
												)}
												{parada.estado === "LlegadaConfirmada" && (
													<Button
														size="sm"
														onClick={() => iniciarValidacionMutation.mutate(parada.paradaViajeID)}
														disabled={iniciarValidacionMutation.isPending}
													>
														<Play className="mr-2 h-3 w-3" /> Iniciar Validación
													</Button>
												)}
												{parada.estado === "Validando" && (
													<Dialog>
														<DialogTrigger asChild>
															<Button size="sm" variant="destructive">
																<StopCircle className="mr-2 h-3 w-3" /> Finalizar Validación
															</Button>
														</DialogTrigger>
														<DialogContent>
															<DialogHeader>
																<DialogTitle>Finalizar Validación</DialogTitle>
																<DialogDescription>
																	Confirma los totales de pasajeros para esta parada.
																</DialogDescription>
															</DialogHeader>
															<form
																onSubmit={(e) => {
																	e.preventDefault();
																	const formData = new FormData(e.currentTarget);
																	finalizarValidacionMutation.mutate({
																		paradaId: parada.paradaViajeID,
																		abordados: Number(formData.get("abordados")),
																		noShow: Number(formData.get("noShow")),
																	});
																}}
																className="space-y-4"
															>
																<div className="space-y-2">
																	<label htmlFor="abordados" className="text-sm font-medium">
																		Total Abordados
																	</label>
																	<input
																		id="abordados"
																		name="abordados"
																		type="number"
																		className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
																		required
																		min="0"
																	/>
																</div>
																<div className="space-y-2">
																	<label htmlFor="noShow" className="text-sm font-medium">
																		Total No Show
																	</label>
																	<input
																		id="noShow"
																		name="noShow"
																		type="number"
																		className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
																		required
																		min="0"
																	/>
																</div>
																<DialogFooter>
																	<Button type="submit">Confirmar y Finalizar</Button>
																</DialogFooter>
															</form>
														</DialogContent>
													</Dialog>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
