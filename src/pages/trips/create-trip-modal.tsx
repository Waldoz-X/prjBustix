import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "antd";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import eventosService from "@/api/services/eventosService";
import rutasService from "@/api/services/rutasService";
import unidadService from "@/api/services/unidadService";
import userService from "@/api/services/userService";
import viajesService, { type CreateViajeDto } from "@/api/services/viajesService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Switch } from "@/ui/switch";
import { handleApiError } from "@/utils/error-handler";

interface CreateTripModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateTripModal({ open, onOpenChange }: CreateTripModalProps) {
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState<Partial<CreateViajeDto>>({
		tipoViaje: "Regular",
		ventasAbiertas: true,
		cargoServicio: 0,
	});

	const { data: eventos = [] } = useQuery({
		queryKey: ["eventos", { soloActivos: true }],
		queryFn: () => eventosService.getAllEventos({ soloActivos: true }),
	});

	const { data: rutas = [] } = useQuery({
		queryKey: ["rutas", { soloActivas: true }],
		queryFn: () => rutasService.getAll(true),
	});

	const { data: unidades = [] } = useQuery({
		queryKey: ["unidades", { activos: true }],
		queryFn: () => unidadService.getAll({ activos: true }),
	});

	const { data: users = [] } = useQuery({
		queryKey: ["users"],
		queryFn: userService.getAllUsers,
	});

	const choferes = users.filter((u) => u.roles?.includes("Operator_Chofer"));

	const verifyMutation = useMutation({
		mutationFn: async (data: CreateViajeDto) => {
			const disponibilidad = await viajesService.verificarDisponibilidad({
				fechaInicio: data.fechaSalida,
				fechaFin: data.fechaLlegadaEstimada,
				unidadId: data.unidadID,
				choferId: data.choferID,
			});
			if (!disponibilidad.estaDisponible && disponibilidad.conflictos.length > 0) {
				return { hasConflicts: true, conflicts: disponibilidad.conflictos };
			}
			return { hasConflicts: false, conflicts: [] };
		},
		onSuccess: (result) => {
			if (result.hasConflicts) {
				Modal.confirm({
					title: (
						<div className="flex items-center gap-2">
							<AlertCircle className="h-5 w-5 text-amber-500" />
							<span>Conflictos de Disponibilidad Detectados</span>
						</div>
					),
					content: (
						<div className="space-y-2 mt-4">
							<p>Se encontraron los siguientes conflictos:</p>
							<ul className="list-disc list-inside space-y-1 text-sm">
								{result.conflicts.map((conflicto) => (
									<li key={conflicto.viajeID}>
										<span className="font-medium">{conflicto.codigoViaje}</span> - {conflicto.eventoNombre}
										<br />
										<span className="text-xs text-gray-500 ml-4">
											{new Date(conflicto.fechaSalida).toLocaleString()} -{" "}
											{new Date(conflicto.fechaLlegadaEstimada).toLocaleString()}
										</span>
									</li>
								))}
							</ul>
							<p className="mt-4">¿Deseas crear el viaje de todas formas?</p>
						</div>
					),
					onOk: () => {
						createMutation.mutate(formData as CreateViajeDto);
					},
					okText: "Crear de todas formas",
					cancelText: "Cancelar",
					okButtonProps: { danger: true },
				});
			} else {
				createMutation.mutate(formData as CreateViajeDto);
			}
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al verificar disponibilidad", { description: safe.userMessage });
		},
	});

	const createMutation = useMutation({
		mutationFn: viajesService.createViaje,
		onSuccess: () => {
			toast.success("Viaje creado exitosamente");
			queryClient.invalidateQueries({ queryKey: ["viajes"] });
			onOpenChange(false);
			resetForm();
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al crear viaje", { description: safe.userMessage });
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!formData.eventoID ||
			!formData.plantillaRutaID ||
			!formData.unidadID ||
			!formData.choferID ||
			!formData.fechaSalida ||
			!formData.fechaLlegadaEstimada ||
			!formData.cupoTotal ||
			formData.precioBase === undefined
		) {
			toast.error("Por favor completa todos los campos requeridos");
			return;
		}
		verifyMutation.mutate(formData as CreateViajeDto);
	};

	const resetForm = () => {
		setFormData({
			tipoViaje: "Regular",
			ventasAbiertas: true,
			cargoServicio: 0,
		});
	};

	const handleCancel = () => {
		resetForm();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Crear Nuevo Viaje</DialogTitle>
					<DialogDescription>
						Completa la información del viaje. Se verificará la disponibilidad antes de crear.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="evento">
								Evento <span className="text-destructive">*</span>
							</Label>
							<Select
								value={formData.eventoID?.toString()}
								onValueChange={(val) => setFormData({ ...formData, eventoID: Number(val) })}
							>
								<SelectTrigger id="evento">
									<SelectValue placeholder="Selecciona un evento" />
								</SelectTrigger>
								<SelectContent>
									{eventos.map((evento) => (
										<SelectItem key={evento.eventoID} value={evento.eventoID.toString()}>
											{evento.nombre}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ruta">
								Ruta <span className="text-destructive">*</span>
							</Label>
							<Select
								value={formData.plantillaRutaID?.toString()}
								onValueChange={(val) => setFormData({ ...formData, plantillaRutaID: Number(val) })}
							>
								<SelectTrigger id="ruta">
									<SelectValue placeholder="Selecciona una ruta" />
								</SelectTrigger>
								<SelectContent>
									{rutas.map((ruta) => (
										<SelectItem key={ruta.rutaID} value={ruta.rutaID.toString()}>
											{ruta.nombreRuta} ({ruta.codigoRuta})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="unidad">
								Unidad <span className="text-destructive">*</span>
							</Label>
							<Select
								value={formData.unidadID?.toString()}
								onValueChange={(val) => setFormData({ ...formData, unidadID: Number(val) })}
							>
								<SelectTrigger id="unidad">
									<SelectValue placeholder="Selecciona una unidad" />
								</SelectTrigger>
								<SelectContent>
									{unidades.map((unidad) => (
										<SelectItem key={unidad.id} value={unidad.id.toString()}>
											{unidad.placas} - {unidad.modelo}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="chofer">
								Chofer <span className="text-destructive">*</span>
							</Label>
							<Select value={formData.choferID} onValueChange={(val) => setFormData({ ...formData, choferID: val })}>
								<SelectTrigger id="chofer">
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
						</div>
						<div className="space-y-2">
							<Label htmlFor="tipoViaje">
								Tipo de Viaje <span className="text-destructive">*</span>
							</Label>
							<Input
								id="tipoViaje"
								value={formData.tipoViaje || ""}
								onChange={(e) => setFormData({ ...formData, tipoViaje: e.target.value })}
								placeholder="Ej: Regular, Especial"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="cupo">
								Cupo Total <span className="text-destructive">*</span>
							</Label>
							<Input
								id="cupo"
								type="number"
								min="1"
								value={formData.cupoTotal || ""}
								onChange={(e) => setFormData({ ...formData, cupoTotal: Number(e.target.value) })}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="fechaSalida">
								Fecha y Hora de Salida <span className="text-destructive">*</span>
							</Label>
							<Input
								id="fechaSalida"
								type="datetime-local"
								value={formData.fechaSalida?.slice(0, 16) || ""}
								onChange={(e) => setFormData({ ...formData, fechaSalida: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="fechaLlegada">
								Fecha y Hora de Llegada Estimada <span className="text-destructive">*</span>
							</Label>
							<Input
								id="fechaLlegada"
								type="datetime-local"
								value={formData.fechaLlegadaEstimada?.slice(0, 16) || ""}
								onChange={(e) => setFormData({ ...formData, fechaLlegadaEstimada: e.target.value })}
							/>
						</div>
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
							/>
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
					<div className="flex items-center space-x-2">
						<Switch
							id="ventasAbiertas"
							checked={formData.ventasAbiertas}
							onCheckedChange={(checked) => setFormData({ ...formData, ventasAbiertas: checked })}
						/>
						<Label htmlFor="ventasAbiertas">Ventas Abiertas</Label>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleCancel}>
							Cancelar
						</Button>
						<Button type="submit" disabled={verifyMutation.isPending || createMutation.isPending}>
							{verifyMutation.isPending || createMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Procesando...
								</>
							) : (
								"Crear Viaje"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
