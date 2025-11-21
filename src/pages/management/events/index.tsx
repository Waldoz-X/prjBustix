import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Edit, Eye, Loader2, MapPin, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import eventosService, {
	type CreateEventoDto,
	type EventoDto,
	type EventoPayloadDto,
	type EventosFilterParams,
	type UpdateEventoDto,
} from "@/api/services/eventosService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { Textarea } from "@/ui/textarea";
import { handleApiError } from "@/utils/error-handler";

// Definimos un tipo local para el estado del formulario para evitar conflictos con los DTOs
type FormDataType = {
	nombre: string;
	descripcion: string;
	tipoEvento: string;
	fecha: string;
	hora: string;
	recinto: string;
	direccion: string;
	ciudad: string;
	estado: string;
	ubicacionLat: number;
	ubicacionLong: number;
	urlImagen: string;
};

export default function EventosPage() {
	const queryClient = useQueryClient();

	// Estados de UI
	const [filters, setFilters] = useState<EventosFilterParams>({});
	const [searchTerm, setSearchTerm] = useState("");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
	const [selectedEvento, setSelectedEvento] = useState<EventoDto | null>(null);

	// Estado del formulario
	const [formData, setFormData] = useState<FormDataType>({
		nombre: "",
		descripcion: "",
		tipoEvento: "Concierto",
		fecha: new Date().toISOString().split("T")[0],
		hora: "19:00",
		recinto: "",
		direccion: "",
		ciudad: "",
		estado: "",
		ubicacionLat: 0,
		ubicacionLong: 0,
		urlImagen: "",
	});

	// Errores inline por campo
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	// Validadores simples reutilizables
	const isValidUrl = (u: string) => {
		try {
			new URL(u);
			return true;
		} catch {
			return false;
		}
	};

	const isDateTimeInPast = (date: string, time: string) => {
		if (!date || !time) return false;
		const timeStr = time.length === 5 ? `${time}:00` : time;
		// construimos como ISO UTC (coherente con buildIsoDatetime)
		const iso = `${date}T${timeStr}Z`;
		const dt = new Date(iso);
		return dt.getTime() < Date.now();
	};

	// Caracteres/protocolos no permitidos en texto libre (por seguridad/consistencia)
	const forbiddenPattern = /(--|;|<|>|\/\*|\*\/|\$|\||\\|%|&)/;
	const hasForbiddenChars = (s?: string) => {
		if (!s) return false;
		return forbiddenPattern.test(s);
	};
	const forbiddenMsg = "El texto contiene caracteres no permitidos (p.ej. $, &, <, >, ;, --, /*, */ , \ , |, %).";

	const validateField = (field: string, value?: any) => {
		const errors = { ...formErrors };

		switch (field) {
			case "nombre": {
				const v = value ?? formData.nombre;
				if (!v || v.trim().length < 3) errors.nombre = "El nombre es requerido (mínimo 3 caracteres).";
				else if (hasForbiddenChars(v)) errors.nombre = forbiddenMsg;
				else delete errors.nombre;
				break;
			}
			case "descripcion": {
				const v = value ?? formData.descripcion;
				if (v && v.trim().length > 0 && v.trim().length < 10)
					errors.descripcion = "La descripción debe tener al menos 10 caracteres si se proporciona.";
				else if (v && hasForbiddenChars(v)) errors.descripcion = forbiddenMsg;
				else delete errors.descripcion;
				break;
			}
			case "recinto": {
				const v = value ?? formData.recinto;
				if (!v || v.trim().length < 3) errors.recinto = "El recinto es requerido (mínimo 3 caracteres).";
				else if (hasForbiddenChars(v)) errors.recinto = forbiddenMsg;
				else delete errors.recinto;
				break;
			}
			case "ciudad": {
				const v = value ?? formData.ciudad;
				if (!v || v.trim().length < 2) errors.ciudad = "La ciudad es requerida.";
				else if (hasForbiddenChars(v)) errors.ciudad = forbiddenMsg;
				else delete errors.ciudad;
				break;
			}
			case "fecha": {
				const v = value ?? formData.fecha;
				if (!v) errors.fecha = "La fecha es requerida.";
				else delete errors.fecha;
				// también validar combinación fecha+hora no en pasado
				if ((v || formData.fecha) && formData.hora) {
					const dateToCheck = v ?? formData.fecha;
					const timeToCheck = formData.hora;
					if (isDateTimeInPast(dateToCheck, timeToCheck)) {
						errors.fecha = "La fecha y hora no pueden estar en el pasado.";
						errors.hora = "La fecha y hora no pueden estar en el pasado.";
					}
				}
				break;
			}
			case "hora": {
				const v = value ?? formData.hora;
				if (!v) errors.hora = "La hora es requerida.";
				else delete errors.hora;
				// validar no en pasado
				if (formData.fecha && (v || formData.hora)) {
					const dateToCheck = formData.fecha;
					const timeToCheck = v ?? formData.hora;
					if (isDateTimeInPast(dateToCheck, timeToCheck)) {
						errors.fecha = "La fecha y hora no pueden estar en el pasado.";
						errors.hora = "La fecha y hora no pueden estar en el pasado.";
					}
				}
				break;
			}
			case "fechaHora": {
				const date = value?.date ? value.date : formData.fecha;
				const time = value?.time ? value.time : formData.hora;
				if (!date) errors.fecha = "La fecha es requerida.";
				else delete errors.fecha;
				if (!time) errors.hora = "La hora es requerida.";
				else delete errors.hora;
				if (date && time && isDateTimeInPast(date, time)) {
					errors.fecha = "La fecha y hora no pueden estar en el pasado.";
					errors.hora = "La fecha y hora no pueden estar en el pasado.";
				}
				break;
			}
			case "ubicacionLat": {
				const v = value ?? formData.ubicacionLat;
				if (v === null || v === undefined || Number.isNaN(Number(v)) || Number(v) < -90 || Number(v) > 90)
					errors.ubicacionLat = "Latitud debe estar entre -90 y 90.";
				else delete errors.ubicacionLat;
				break;
			}
			case "ubicacionLong": {
				const v = value ?? formData.ubicacionLong;
				if (v === null || v === undefined || Number.isNaN(Number(v)) || Number(v) < -180 || Number(v) > 180)
					errors.ubicacionLong = "Longitud debe estar entre -180 y 180.";
				else delete errors.ubicacionLong;
				break;
			}
			case "urlImagen": {
				const v = value ?? formData.urlImagen;
				if (v && !isValidUrl(v)) errors.urlImagen = "La URL de la imagen no es válida.";
				else if (v && hasForbiddenChars(v)) errors.urlImagen = forbiddenMsg;
				else delete errors.urlImagen;
				break;
			}
			default:
				break;
		}

		setFormErrors(errors);
		return !errors[field];
	};

	// Helper que actualiza el formulario y valida el campo al escribir (inline validation)
	const handleChange = (field: keyof FormDataType, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		validateField(field as string, value);
		if (field === "fecha") validateField("hora");
		if (field === "hora") validateField("fecha");
	};

	const validateAllFields = (data: FormDataType) => {
		const errors: Record<string, string> = {};

		if (!data.nombre || data.nombre.trim().length < 3) {
			errors.nombre = "El nombre es requerido (mínimo 3 caracteres).";
		} else if (hasForbiddenChars(data.nombre)) {
			errors.nombre = forbiddenMsg;
		}
		if (data.descripcion && data.descripcion.trim().length > 0 && data.descripcion.trim().length < 10) {
			errors.descripcion = "La descripción debe tener al menos 10 caracteres si se proporciona.";
		} else if (data.descripcion && hasForbiddenChars(data.descripcion)) {
			errors.descripcion = forbiddenMsg;
		}
		if (!data.recinto || data.recinto.trim().length < 3) {
			errors.recinto = "El recinto es requerido (mínimo 3 caracteres).";
		} else if (hasForbiddenChars(data.recinto)) {
			errors.recinto = forbiddenMsg;
		}
		if (!data.ciudad || data.ciudad.trim().length < 2) {
			errors.ciudad = "La ciudad es requerida.";
		} else if (hasForbiddenChars(data.ciudad)) {
			errors.ciudad = forbiddenMsg;
		}
		if (!data.fecha) {
			errors.fecha = "La fecha es requerida.";
		}
		if (!data.hora) {
			errors.hora = "La hora de inicio es requerida.";
		}
		if (data.ubicacionLat < -90 || data.ubicacionLat > 90) {
			errors.ubicacionLat = "Latitud debe estar entre -90 y 90.";
		}
		if (data.ubicacionLong < -180 || data.ubicacionLong > 180) {
			errors.ubicacionLong = "Longitud debe estar entre -180 y 180.";
		}
		if (data.urlImagen && !isValidUrl(data.urlImagen)) {
			errors.urlImagen = "La URL de la imagen no es válida.";
		} else if (data.urlImagen && hasForbiddenChars(data.urlImagen)) {
			errors.urlImagen = forbiddenMsg;
		}

		// Fecha+hora no puede ser en el pasado
		if (data.fecha && data.hora && isDateTimeInPast(data.fecha, data.hora)) {
			errors.fecha = "La fecha y hora no pueden estar en el pasado.";
			errors.hora = "La fecha y hora no pueden estar en el pasado.";
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// Mapea claves de error del servidor a campos del formulario
	const mapServerKeyToField = (key: string) => {
		if (!key) return "_";
		key = key.replace(/^\$\./, "");
		key = key.replace(/^dto\./i, "");
		const k = key.toLowerCase();
		if (k.includes("horainicio") || k.includes("hora")) return "hora";
		if (k.includes("nombre")) return "nombre";
		if (k.includes("recinto")) return "recinto";
		if (k.includes("direccion")) return "direccion";
		if (k.includes("ciudad")) return "ciudad";
		if (k.includes("estado")) return "estado";
		if (k.includes("ubicacionlat") || k.includes("lat")) return "ubicacionLat";
		if (k.includes("ubicacionlong") || k.includes("long")) return "ubicacionLong";
		if (k.includes("url") || k.includes("imagen")) return "urlImagen";
		if (k.includes("fecha")) return "fecha";
		return "_";
	};

	const applyServerValidationErrors = (err: any) => {
		if (!err || err.status !== 400) return false;
		const serverErrors: Record<string, string> = {};
		if (err.errors && typeof err.errors === "object") {
			for (const key of Object.keys(err.errors)) {
				const messages = err.errors[key];
				const first = Array.isArray(messages) ? messages[0] : String(messages);
				const field = mapServerKeyToField(key);
				if (field === "_") serverErrors._general = first;
				else serverErrors[field] = first;
			}
		} else if (err.title) {
			serverErrors._general = err.title;
		} else if (err.message) {
			serverErrors._general = err.message;
		}
		setFormErrors((prev) => ({ ...prev, ...serverErrors }));
		const summary = serverErrors._general || Object.values(serverErrors)[0] || "Errores de validación";
		toast.error("Error de validación", { description: summary });
		return true;
	};

	// Query para obtener eventos
	const { data: eventos = [], isLoading } = useQuery({
		queryKey: ["eventos", filters, searchTerm],
		queryFn: () => eventosService.getAllEventos(filters),
		refetchOnWindowFocus: true,
	});

	// Mutations (las versiones antiguas fueron removidas para usar las funciones Raw que envían el body plano)
	const createMutation = useMutation({
		mutationFn: (data: any) => eventosService.createEvento(data),
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ["eventos"] });
			toast.success("Evento creado exitosamente", {
				description: "El evento se ha agregado correctamente",
			});
			setIsCreateDialogOpen(false);
			resetForm();
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			applyServerValidationErrors(err);
			toast.error("Error al crear evento", { description: safeError.userMessage });
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: any }) => eventosService.updateEvento(id, data),
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ["eventos"] });
			toast.success("Evento actualizado exitosamente", {
				description: "Los cambios se han guardado correctamente",
			});
			setIsEditDialogOpen(false);
			setSelectedEvento(null);
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			applyServerValidationErrors(err);
			toast.error("Error al actualizar evento", { description: safeError.userMessage });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => eventosService.deleteEvento(id),
		onSuccess: async () => {
			await queryClient.refetchQueries({ queryKey: ["eventos"] });
			toast.success("Evento eliminado exitosamente", {
				description: "El evento ha sido eliminado",
			});
			setIsDeleteDialogOpen(false);
			setSelectedEvento(null);
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al eliminar evento", { description: safeError.userMessage });
		},
	});

	// Handlers
	const resetForm = () => {
		setFormData({
			nombre: "",
			descripcion: "",
			tipoEvento: "Concierto",
			fecha: new Date().toISOString().split("T")[0],
			hora: "19:00",
			recinto: "",
			direccion: "",
			ciudad: "",
			estado: "",
			ubicacionLat: 0,
			ubicacionLong: 0,
			urlImagen: "",
		});
	};

	// Helper local: convertir ticks (.NET) a "HH:mm:ss"
	const ticksToTimeStringLocal = (ticks: number): string => {
		if (!Number.isFinite(ticks)) return "19:00:00";
		const totalSeconds = Math.floor(ticks / 10000000);
		const hours = Math.floor(totalSeconds / 3600) % 24;
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
	};

	const buildIsoDatetime = (date: string, time: string) => {
		const timeStr = time.length === 5 ? `${time}:00` : time;
		// Construimos como UTC (agregamos Z) para que coincida con la API que espera "...Z"
		return new Date(`${date}T${timeStr}Z`).toISOString();
	};

	const handleCreate = () => {
		// validación completa en UI
		if (!validateAllFields(formData)) {
			// Mostrar resumen en toast y no enviar
			toast.error("Corrige los errores del formulario", { description: "Revisa los campos marcados en rojo" });
			return;
		}

		const dto: EventoPayloadDto = {
			Nombre: formData.nombre.trim(),
			Descripcion: formData.descripcion.trim(),
			TipoEvento: formData.tipoEvento,
			// Fecha ahora incluye la hora seleccionada en el formulario
			Fecha: buildIsoDatetime(formData.fecha, formData.hora),
			Recinto: formData.recinto.trim(),
			Direccion: formData.direccion.trim(),
			Ciudad: formData.ciudad.trim(),
			Estado: formData.estado.trim(),
			UbicacionLat: formData.ubicacionLat,
			UbicacionLong: formData.ubicacionLong,
			UrlImagen: formData.urlImagen.trim(),
		};

		const timeStr = formData.hora.length === 5 ? `${formData.hora}:00` : formData.hora;

		const payload: CreateEventoDto = {
			dto,
			horaInicio: timeStr,
		};

		console.log("[EventosPage] create payload (api format):", payload);
		createMutation.mutate(payload);
	};

	const handleEdit = (evento: EventoDto) => {
		setSelectedEvento(evento);
		setFormErrors({});
		let horaStr = "19:00";
		try {
			if (evento.horaInicio) {
				// intenta usar hours/minutes si vienen, si no usa ticks o string
				const anyHora: any = evento.horaInicio as any;
				if (typeof anyHora.hours === "number" && typeof anyHora.minutes === "number") {
					const h = anyHora.hours;
					const m = anyHora.minutes;
					horaStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
				} else if (typeof anyHora.ticks === "number") {
					const ts = ticksToTimeStringLocal(anyHora.ticks);
					// ts es "HH:mm:ss" -> dejamos en formato "HH:mm" para el input tipo=time
					horaStr = ts.slice(0, 5);
				} else if (typeof anyHora === "string") {
					// si el backend devuelve "20:00:00" o "20:00"
					const s = anyHora as string;
					horaStr = s.length >= 5 ? s.slice(0, 5) : s.padEnd(5, "0");
				}
			}
		} catch (_e) {
			horaStr = "19:00";
		}

		setFormData({
			// Si la fecha viene con hora, extraemos la parte de fecha
			fecha: evento.fecha ? evento.fecha.split("T")[0] : new Date().toISOString().split("T")[0],
			hora: horaStr,
			nombre: evento.nombre,
			descripcion: evento.descripcion,
			tipoEvento: evento.tipoEvento,
			recinto: evento.recinto,
			direccion: evento.direccion,
			ciudad: evento.ciudad,
			estado: evento.estado,
			ubicacionLat: evento.ubicacionLat,
			ubicacionLong: evento.ubicacionLong,
			urlImagen: evento.urlImagen,
		});
		setIsEditDialogOpen(true);
	};

	const handleUpdate = () => {
		if (!selectedEvento) return;

		if (!validateAllFields(formData)) {
			toast.error("Corrige los errores del formulario", { description: "Revisa los campos marcados en rojo" });
			return;
		}

		const dto: EventoPayloadDto = {
			Nombre: formData.nombre.trim(),
			Descripcion: formData.descripcion.trim(),
			TipoEvento: formData.tipoEvento,
			// Fecha incluye la hora seleccionada
			Fecha: buildIsoDatetime(formData.fecha, formData.hora),
			Recinto: formData.recinto.trim(),
			Direccion: formData.direccion.trim(),
			Ciudad: formData.ciudad.trim(),
			Estado: formData.estado.trim(),
			UbicacionLat: formData.ubicacionLat,
			UbicacionLong: formData.ubicacionLong,
			UrlImagen: formData.urlImagen.trim(),
		};

		const timeStr = formData.hora.length === 5 ? `${formData.hora}:00` : formData.hora;

		const payload: UpdateEventoDto = {
			dto,
			horaInicio: timeStr,
		};

		console.log("[EventosPage] update payload (api format):", payload);

		updateMutation.mutate({
			id: selectedEvento.eventoID,
			data: payload,
		});
	};

	const handleDelete = (evento: EventoDto) => {
		setSelectedEvento(evento);
		setIsDeleteDialogOpen(true);
	};

	const handleViewDetails = (evento: EventoDto) => {
		setSelectedEvento(evento);
		setIsDetailsDialogOpen(true);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("es-MX", {
			year: "numeric",
			month: "short",
			day: "numeric",
			timeZone: "UTC",
		});
	};

	const filteredEventos = eventos.filter(
		(evento) =>
			evento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
			evento.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
			evento.tipoEvento.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Calendar className="h-8 w-8" />
						Gestión de Eventos
					</h1>
					<p className="text-muted-foreground mt-2">Administra eventos masivos y viajes programados</p>
				</div>
				<Button
					onClick={() => {
						setFormErrors({});
						setIsCreateDialogOpen(true);
					}}
				>
					<Plus className="mr-2 h-4 w-4" />
					Crear Evento
				</Button>
			</div>

			{/* Filtros */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Filtros</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-4">
						<div className="space-y-2">
							<Label htmlFor="search">
								<Search className="inline mr-2 h-4 w-4" />
								Buscar
							</Label>
							<Input
								id="search"
								placeholder="Nombre, ciudad, tipo..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ciudad">Ciudad</Label>
							<Input
								id="ciudad"
								placeholder="Filtrar por ciudad"
								value={filters.ciudad || ""}
								onChange={(e) => setFilters({ ...filters, ciudad: e.target.value || undefined })}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="soloActivos">Estado</Label>
							<Select
								value={filters.soloActivos?.toString() || "all"}
								onValueChange={(val) =>
									setFilters({ ...filters, soloActivos: val === "all" ? undefined : val === "true" })
								}
							>
								<SelectTrigger id="soloActivos">
									<SelectValue placeholder="Todos" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos</SelectItem>
									<SelectItem value="true">Solo Activos</SelectItem>
									<SelectItem value="false">Inactivos</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-end">
							<div className="text-sm text-muted-foreground">
								Mostrando <span className="font-bold">{filteredEventos.length}</span> eventos
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabla de Eventos */}
			<Card>
				<CardHeader>
					<CardTitle>Lista de Eventos</CardTitle>
					<CardDescription>Todos los eventos masivos registrados en el sistema</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center min-h-[400px]">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : filteredEventos.length > 0 ? (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Nombre</TableHead>
										<TableHead>Tipo</TableHead>
										<TableHead>Fecha</TableHead>
										<TableHead>Recinto</TableHead>
										<TableHead>Ciudad</TableHead>
										<TableHead className="text-center">Viajes</TableHead>
										<TableHead className="text-center">Estado</TableHead>
										<TableHead className="text-right">Acciones</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredEventos.map((evento) => (
										<TableRow key={evento.eventoID}>
											<TableCell className="font-medium">{evento.nombre}</TableCell>
											<TableCell>
												<Badge variant="outline">{evento.tipoEvento}</Badge>
											</TableCell>
											<TableCell>{formatDate(evento.fecha)}</TableCell>
											<TableCell>{evento.recinto}</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<MapPin className="h-3 w-3" />
													{evento.ciudad}
												</div>
											</TableCell>
											<TableCell className="text-center">
												<Badge variant="secondary">{evento.totalViajes || 0}</Badge>
											</TableCell>
											<TableCell className="text-center">
												<Badge variant={evento.estatus === 1 ? "default" : "secondary"}>{evento.estatusNombre}</Badge>
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Acciones</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={() => handleViewDetails(evento)}>
															<Eye className="mr-2 h-4 w-4" />
															Ver detalles
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => handleEdit(evento)}>
															<Edit className="mr-2 h-4 w-4" />
															Editar
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem onClick={() => handleDelete(evento)} className="text-destructive">
															<Trash2 className="mr-2 h-4 w-4" />
															Eliminar
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center min-h-[400px] text-center">
							<Calendar className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">No hay eventos</h3>
							<p className="text-muted-foreground mb-4">Comienza creando tu primer evento</p>
							<Button onClick={() => setIsCreateDialogOpen(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Crear Evento
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Dialog: Crear Evento */}
			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Crear Nuevo Evento</DialogTitle>
						<DialogDescription>Completa la información del evento masivo</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="nombre">
								Nombre del Evento <span className="text-destructive">*</span>
							</Label>
							<Input
								id="nombre"
								placeholder="Ej: Concierto Soda Stereo"
								value={formData.nombre}
								onChange={(e) => handleChange("nombre", e.target.value)}
								onBlur={() => validateField("nombre")}
							/>
							{formErrors.nombre && <p className="text-sm text-destructive mt-1">{formErrors.nombre}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="descripcion">Descripción</Label>
							<Textarea
								id="descripcion"
								placeholder="Describe el evento..."
								value={formData.descripcion}
								onChange={(e) => handleChange("descripcion", e.target.value)}
								rows={3}
								onBlur={() => validateField("descripcion")}
							/>
							{formErrors.descripcion && <p className="text-sm text-destructive mt-1">{formErrors.descripcion}</p>}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="tipoEvento">Tipo de Evento</Label>
								<Select value={formData.tipoEvento} onValueChange={(val) => handleChange("tipoEvento", val)}>
									<SelectTrigger id="tipoEvento">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Concierto">Concierto</SelectItem>
										<SelectItem value="Deportivo">Deportivo</SelectItem>
										<SelectItem value="Festival">Festival</SelectItem>
										<SelectItem value="Teatro">Teatro</SelectItem>
										<SelectItem value="Otro">Otro</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="fecha">
									Fecha del Evento <span className="text-destructive">*</span>
								</Label>
								<Input
									id="fecha"
									type="date"
									value={formData.fecha}
									onChange={(e) => handleChange("fecha", e.target.value)}
									onBlur={() => validateField("fecha")}
								/>
								{formErrors.fecha && <p className="text-sm text-destructive mt-1">{formErrors.fecha}</p>}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="recinto">
									Recinto <span className="text-destructive">*</span>
								</Label>
								<Input
									id="recinto"
									placeholder="Ej: Estadio Azteca"
									value={formData.recinto}
									onChange={(e) => handleChange("recinto", e.target.value)}
									onBlur={() => validateField("recinto")}
								/>
								{formErrors.recinto && <p className="text-sm text-destructive mt-1">{formErrors.recinto}</p>}
							</div>
							<div className="space-y-2">
								<Label htmlFor="direccion">Dirección</Label>
								<Input
									id="direccion"
									placeholder="Calle, número, colonia"
									value={formData.direccion}
									onChange={(e) => handleChange("direccion", e.target.value)}
									onBlur={() => validateField("direccion")}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="ciudad">
									Ciudad <span className="text-destructive">*</span>
								</Label>
								<Input
									id="ciudad"
									placeholder="Ej: Ciudad de México"
									value={formData.ciudad}
									onChange={(e) => handleChange("ciudad", e.target.value)}
									onBlur={() => validateField("ciudad")}
								/>
								{formErrors.ciudad && <p className="text-sm text-destructive mt-1">{formErrors.ciudad}</p>}
							</div>
							<div className="space-y-2">
								<Label htmlFor="estado">Estado</Label>
								<Input
									id="estado"
									placeholder="Ej: CDMX"
									value={formData.estado}
									onChange={(e) => handleChange("estado", e.target.value)}
									onBlur={() => validateField("estado")}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="ubicacionLat">
									Latitud <span className="text-destructive">*</span>
								</Label>
								<Input
									id="ubicacionLat"
									type="number"
									step="any"
									placeholder="-99.9999"
									value={formData.ubicacionLat}
									onChange={(e) => handleChange("ubicacionLat", e.target.value)}
									onBlur={() => validateField("ubicacionLat")}
								/>
								{formErrors.ubicacionLat && <p className="text-sm text-destructive mt-1">{formErrors.ubicacionLat}</p>}
							</div>
							<div className="space-y-2">
								<Label htmlFor="ubicacionLong">
									Longitud <span className="text-destructive">*</span>
								</Label>
								<Input
									id="ubicacionLong"
									type="number"
									step="any"
									placeholder="-99.9999"
									value={formData.ubicacionLong}
									onChange={(e) => handleChange("ubicacionLong", e.target.value)}
									onBlur={() => validateField("ubicacionLong")}
								/>
								{formErrors.ubicacionLong && (
									<p className="text-sm text-destructive mt-1">{formErrors.ubicacionLong}</p>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="urlImagen">URL de la Imagen</Label>
							<Input
								id="urlImagen"
								placeholder="https://ejemplo.com/imagen.jpg"
								value={formData.urlImagen}
								onChange={(e) => handleChange("urlImagen", e.target.value)}
								onBlur={() => validateField("urlImagen")}
							/>
							{formErrors.urlImagen && <p className="text-sm text-destructive mt-1">{formErrors.urlImagen}</p>}
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleCreate} disabled={createMutation.isPending}>
							{createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Crear Evento
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Dialog: Editar Evento */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Editar Evento</DialogTitle>
						<DialogDescription>Actualiza la información del evento masivo</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="nombre">
								Nombre del Evento <span className="text-destructive">*</span>
							</Label>
							<Input
								id="nombre"
								placeholder="Ej: Concierto Soda Stereo"
								value={formData.nombre}
								onChange={(e) => handleChange("nombre", e.target.value)}
								onBlur={() => validateField("nombre")}
							/>
							{formErrors.nombre && <p className="text-sm text-destructive mt-1">{formErrors.nombre}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="descripcion">Descripción</Label>
							<Textarea
								id="descripcion"
								placeholder="Describe el evento..."
								value={formData.descripcion}
								onChange={(e) => handleChange("descripcion", e.target.value)}
								rows={3}
								onBlur={() => validateField("descripcion")}
							/>
							{formErrors.descripcion && <p className="text-sm text-destructive mt-1">{formErrors.descripcion}</p>}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="tipoEvento">Tipo de Evento</Label>
								<Select value={formData.tipoEvento} onValueChange={(val) => handleChange("tipoEvento", val)}>
									<SelectTrigger id="tipoEvento">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Concierto">Concierto</SelectItem>
										<SelectItem value="Deportivo">Deportivo</SelectItem>
										<SelectItem value="Festival">Festival</SelectItem>
										<SelectItem value="Teatro">Teatro</SelectItem>
										<SelectItem value="Otro">Otro</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="fecha">
									Fecha del Evento <span className="text-destructive">*</span>
								</Label>
								<Input
									id="fecha"
									type="date"
									value={formData.fecha}
									onChange={(e) => handleChange("fecha", e.target.value)}
									onBlur={() => validateField("fecha")}
								/>
								{formErrors.fecha && <p className="text-sm text-destructive mt-1">{formErrors.fecha}</p>}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="recinto">
									Recinto <span className="text-destructive">*</span>
								</Label>
								<Input
									id="recinto"
									placeholder="Ej: Estadio Azteca"
									value={formData.recinto}
									onChange={(e) => handleChange("recinto", e.target.value)}
									onBlur={() => validateField("recinto")}
								/>
								{formErrors.recinto && <p className="text-sm text-destructive mt-1">{formErrors.recinto}</p>}
							</div>
							<div className="space-y-2">
								<Label htmlFor="direccion">Dirección</Label>
								<Input
									id="direccion"
									placeholder="Calle, número, colonia"
									value={formData.direccion}
									onChange={(e) => handleChange("direccion", e.target.value)}
									onBlur={() => validateField("direccion")}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="ciudad">
									Ciudad <span className="text-destructive">*</span>
								</Label>
								<Input
									id="ciudad"
									placeholder="Ej: Ciudad de México"
									value={formData.ciudad}
									onChange={(e) => handleChange("ciudad", e.target.value)}
									onBlur={() => validateField("ciudad")}
								/>
								{formErrors.ciudad && <p className="text-sm text-destructive mt-1">{formErrors.ciudad}</p>}
							</div>
							<div className="space-y-2">
								<Label htmlFor="estado">Estado</Label>
								<Input
									id="estado"
									placeholder="Ej: CDMX"
									value={formData.estado}
									onChange={(e) => handleChange("estado", e.target.value)}
									onBlur={() => validateField("estado")}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="ubicacionLat">
									Latitud <span className="text-destructive">*</span>
								</Label>
								<Input
									id="ubicacionLat"
									type="number"
									step="any"
									placeholder="-99.9999"
									value={formData.ubicacionLat}
									onChange={(e) => handleChange("ubicacionLat", e.target.value)}
									onBlur={() => validateField("ubicacionLat")}
								/>
								{formErrors.ubicacionLat && <p className="text-sm text-destructive mt-1">{formErrors.ubicacionLat}</p>}
							</div>
							<div className="space-y-2">
								<Label htmlFor="ubicacionLong">
									Longitud <span className="text-destructive">*</span>
								</Label>
								<Input
									id="ubicacionLong"
									type="number"
									step="any"
									placeholder="-99.9999"
									value={formData.ubicacionLong}
									onChange={(e) => handleChange("ubicacionLong", e.target.value)}
									onBlur={() => validateField("ubicacionLong")}
								/>
								{formErrors.ubicacionLong && (
									<p className="text-sm text-destructive mt-1">{formErrors.ubicacionLong}</p>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="urlImagen">URL de la Imagen</Label>
							<Input
								id="urlImagen"
								placeholder="https://ejemplo.com/imagen.jpg"
								value={formData.urlImagen}
								onChange={(e) => handleChange("urlImagen", e.target.value)}
								onBlur={() => validateField("urlImagen")}
							/>
							{formErrors.urlImagen && <p className="text-sm text-destructive mt-1">{formErrors.urlImagen}</p>}
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleUpdate} disabled={updateMutation.isPending}>
							{updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Guardar Cambios
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Dialog: Detalles del Evento */}
			<Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Detalles del Evento</DialogTitle>
						<DialogDescription>Información completa del evento masivo</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<div className="grid gap-4">
							<div className="space-y-2">
								<Label>Nombre del Evento</Label>
								<p className="text-muted-foreground">{selectedEvento?.nombre}</p>
							</div>

							<div className="space-y-2">
								<Label>Descripción</Label>
								<p className="text-muted-foreground">{selectedEvento?.descripcion}</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Tipo de Evento</Label>
									<p className="text-muted-foreground">{selectedEvento?.tipoEvento}</p>
								</div>
								<div className="space-y-2">
									<Label>Fecha del Evento</Label>
									<p className="text-muted-foreground">
										{selectedEvento?.fecha &&
											new Date(selectedEvento.fecha).toLocaleDateString("es-MX", {
												year: "numeric",
												month: "short",
												day: "numeric",
												timeZone: "UTC",
											})}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Recinto</Label>
									<p className="text-muted-foreground">{selectedEvento?.recinto}</p>
								</div>
								<div className="space-y-2">
									<Label>Dirección</Label>
									<p className="text-muted-foreground">{selectedEvento?.direccion}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Ciudad</Label>
									<p className="text-muted-foreground">{selectedEvento?.ciudad}</p>
								</div>
								<div className="space-y-2">
									<Label>Estado</Label>
									<p className="text-muted-foreground">{selectedEvento?.estado}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Latitud</Label>
									<p className="text-muted-foreground">{selectedEvento?.ubicacionLat}</p>
								</div>
								<div className="space-y-2">
									<Label>Longitud</Label>
									<p className="text-muted-foreground">{selectedEvento?.ubicacionLong}</p>
								</div>
							</div>

							<div className="space-y-2">
								<Label>URL de la Imagen</Label>
								<p className="text-muted-foreground">{selectedEvento?.urlImagen}</p>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
							Cerrar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Dialog: Eliminar Evento */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Eliminar Evento</DialogTitle>
						<DialogDescription>
							¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (selectedEvento) {
									deleteMutation.mutate(selectedEvento.eventoID);
								}
							}}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Eliminar Evento
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
