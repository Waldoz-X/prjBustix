import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import unidadService from "@/api/services/unidadService";
import userService from "@/api/services/userService";
import viajesService, { type UpdateViajeDto, type ViajeDto } from "@/api/services/viajesService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Switch } from "@/ui/switch";
import { handleApiError } from "@/utils/error-handler";

interface EditTripModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	trip: ViajeDto | null;
}

export function EditTripModal({ open, onOpenChange, trip }: EditTripModalProps) {
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState<Partial<UpdateViajeDto>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	// Populate form when trip changes
	useEffect(() => {
		if (trip) {
			// Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
			const formatDateForInput = (dateString: string) => {
				try {
					const date = new Date(dateString);
					// Get local datetime in ISO format and slice to remove seconds and timezone
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, "0");
					const day = String(date.getDate()).padStart(2, "0");
					const hours = String(date.getHours()).padStart(2, "0");
					const minutes = String(date.getMinutes()).padStart(2, "0");
					return `${year}-${month}-${day}T${hours}:${minutes}`;
				} catch (e) {
					console.error("Error formatting date:", e);
					return "";
				}
			};

			setFormData({
				unidadID: trip.unidadID,
				choferID: trip.choferID,
				fechaSalida: formatDateForInput(trip.fechaSalida),
				fechaLlegadaEstimada: formatDateForInput(trip.fechaLlegadaEstimada),
				precioBase: trip.precioBase,
				cargoServicio: trip.cargoServicio,
				ventasAbiertas: trip.ventasAbiertas,
				estatus: trip.estatus,
			});
			setTouched({});
		}
	}, [trip]);

	const handleBlur = (field: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	const { data: unidades = [] } = useQuery({
		queryKey: ["unidades", { activos: true }],
		queryFn: () => unidadService.getAll({ activos: true }),
	});

	const { data: users = [] } = useQuery({
		queryKey: ["users"],
		queryFn: userService.getAllUsers,
	});

	const choferes = users.filter((u) =>
		u.roles?.some(
			(r) =>
				r.startsWith("Operator_") || r.toLowerCase() === "operator" || r.toLowerCase() === "chofer" || r === "Staff",
		),
	);

	const selectedUnit = unidades.find((u) => u.id === formData.unidadID);

	const updateMutation = useMutation({
		mutationFn: async (data: UpdateViajeDto) => {
			if (!trip) throw new Error("No trip selected");
			return viajesService.updateViaje(trip.viajeID, data);
		},
		onSuccess: () => {
			toast.success("Viaje actualizado exitosamente");
			queryClient.invalidateQueries({ queryKey: ["viajes"] });
			onOpenChange(false);
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al actualizar viaje", { description: safe.userMessage });
		},
	});

	const isFieldInvalid = (field: keyof UpdateViajeDto) => {
		if (!touched[field]) return false;
		const value = formData[field];
		return value === undefined || value === null || value === "";
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Mark all as touched
		setTouched({
			unidadID: true,
			choferID: true,
			fechaSalida: true,
			fechaLlegadaEstimada: true,
			precioBase: true,
		});

		if (
			!formData.unidadID ||
			!formData.choferID ||
			!formData.fechaSalida ||
			!formData.fechaLlegadaEstimada ||
			formData.precioBase === undefined
		) {
			toast.error("Por favor completa todos los campos requeridos");
			return;
		}

		updateMutation.mutate(formData as UpdateViajeDto);
	};

	const handleCancel = () => {
		setTouched({});
		onOpenChange(false);
	};

	if (!trip) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="!max-w-5xl h-[85vh] flex flex-col p-0">
				<DialogHeader className="px-6 py-4 border-b">
					<DialogTitle className="flex items-center gap-2">
						<Edit className="h-5 w-5" />
						Editar Viaje: {trip.codigoViaje}
					</DialogTitle>
					<DialogDescription>
						Actualiza la información del viaje. Los campos de evento y ruta no se pueden modificar.
					</DialogDescription>
				</DialogHeader>
				<div className="flex-1 overflow-y-auto p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Información no editable */}
						<div className="bg-muted/50 p-4 rounded-lg space-y-2">
							<h4 className="font-medium text-sm">Información del Viaje (No editable)</h4>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<Label className="text-muted-foreground">Evento</Label>
									<p className="font-medium">{trip.eventoNombre}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Ruta</Label>
									<p className="font-medium">{trip.rutaNombre}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Tipo de Viaje</Label>
									<p className="font-medium">{trip.tipoViaje}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Asientos Vendidos</Label>
									<p className="font-medium">
										{trip.asientosVendidos} / {trip.cupoTotal}
									</p>
								</div>
							</div>
						</div>

						<Separator />

						{/* Asignación de Recursos */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Asignación de Recursos</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="unidad">
										Unidad <span className="text-destructive">*</span>
									</Label>
									<Select
										value={formData.unidadID?.toString()}
										onValueChange={(val) => setFormData({ ...formData, unidadID: Number(val) })}
										onOpenChange={() => handleBlur("unidadID")}
									>
										<SelectTrigger id="unidad" className={isFieldInvalid("unidadID") ? "border-destructive" : ""}>
											<SelectValue placeholder="Selecciona una unidad" />
										</SelectTrigger>
										<SelectContent>
											{unidades.map((unidad) => (
												<SelectItem key={unidad.id} value={unidad.id.toString()}>
													{unidad.placas} - {unidad.modelo} ({unidad.capacidadAsientos} pax)
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isFieldInvalid("unidadID") && <p className="text-xs text-destructive">Selecciona una unidad</p>}
									{selectedUnit && trip.asientosVendidos > selectedUnit.capacidadAsientos && (
										<p className="text-xs text-destructive">
											⚠️ Esta unidad tiene capacidad de {selectedUnit.capacidadAsientos} pero hay {trip.asientosVendidos}{" "}
											asientos vendidos
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="chofer">
										Chofer <span className="text-destructive">*</span>
									</Label>
									<Select
										value={formData.choferID}
										onValueChange={(val) => setFormData({ ...formData, choferID: val })}
										onOpenChange={() => handleBlur("choferID")}
									>
										<SelectTrigger id="chofer" className={isFieldInvalid("choferID") ? "border-destructive" : ""}>
											<SelectValue placeholder="Selecciona un chofer" />
										</SelectTrigger>
										<SelectContent>
											{choferes.map((chofer) => (
												<SelectItem key={chofer.id} value={chofer.id}>
													{chofer.nombreCompleto}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isFieldInvalid("choferID") && <p className="text-xs text-destructive">Selecciona un chofer</p>}
								</div>
							</div>
						</div>

						<Separator />

						{/* Fechas */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Fechas y Horarios</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="fechaSalida">
										Fecha y Hora de Salida <span className="text-destructive">*</span>
									</Label>
									<Input
										id="fechaSalida"
										type="datetime-local"
										value={formData.fechaSalida || ""}
										onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
										onBlur={() => handleBlur("fechaSalida")}
										className={isFieldInvalid("fechaSalida") ? "border-destructive" : ""}
									/>
									{isFieldInvalid("fechaSalida") && (
										<p className="text-xs text-destructive">Selecciona fecha de salida</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="fechaLlegada">
										Fecha y Hora de Llegada Estimada <span className="text-destructive">*</span>
									</Label>
									<Input
										id="fechaLlegada"
										type="datetime-local"
										value={formData.fechaLlegadaEstimada || ""}
										onChange={(e) => setFormData({ ...formData, fechaLlegadaEstimada: e.target.value })}
										onBlur={() => handleBlur("fechaLlegadaEstimada")}
										className={isFieldInvalid("fechaLlegadaEstimada") ? "border-destructive" : ""}
									/>
									{isFieldInvalid("fechaLlegadaEstimada") && (
										<p className="text-xs text-destructive">Selecciona fecha de llegada</p>
									)}
								</div>
							</div>
						</div>

						<Separator />

						{/* Precios */}
						<div className="space-y-4">
							<h3 className="text-lg font-semibold">Configuración Comercial</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="precioBase">
										Precio Base <span className="text-destructive">*</span>
									</Label>
									<Input
										id="precioBase"
										type="number"
										min="0"
										step="0.01"
										value={formData.precioBase || ""}
										onChange={(e) => setFormData({ ...formData, precioBase: Number(e.target.value) })}
										onBlur={() => handleBlur("precioBase")}
										className={isFieldInvalid("precioBase") ? "border-destructive" : ""}
									/>
									{isFieldInvalid("precioBase") && <p className="text-xs text-destructive">Ingresa un precio válido</p>}
								</div>

								<div className="space-y-2">
									<Label htmlFor="cargoServicio">Cargo de Servicio</Label>
									<Input
										id="cargoServicio"
										type="number"
										min="0"
										step="0.01"
										value={formData.cargoServicio || ""}
										onChange={(e) => setFormData({ ...formData, cargoServicio: Number(e.target.value) })}
									/>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-center space-x-2">
									<Switch
										id="ventasAbiertas"
										checked={formData.ventasAbiertas}
										onCheckedChange={(checked) => setFormData({ ...formData, ventasAbiertas: checked })}
									/>
									<Label htmlFor="ventasAbiertas">Ventas Abiertas</Label>
								</div>

								<div className="space-y-2">
									<Label htmlFor="estatus">Estado del Viaje</Label>
									<Select
										value={formData.estatus?.toString()}
										onValueChange={(val) => setFormData({ ...formData, estatus: Number(val) })}
									>
										<SelectTrigger id="estatus">
											<SelectValue placeholder="Selecciona un estado" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="0">Programado</SelectItem>
											<SelectItem value="1">En Curso</SelectItem>
											<SelectItem value="2">Finalizado</SelectItem>
											<SelectItem value="3">Cancelado</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					</form>
				</div>

				<DialogFooter className="px-6 py-4 border-t mt-auto">
					<Button type="button" variant="outline" onClick={handleCancel}>
						Cancelar
					</Button>
					<Button type="submit" onClick={handleSubmit} disabled={updateMutation.isPending}>
						{updateMutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Actualizando...
							</>
						) : (
							"Guardar Cambios"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
