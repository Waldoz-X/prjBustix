// RutasPage.tsx

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronDown, ChevronUp, Loader2, Map as MapIcon, MapPin, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { toast } from "sonner";
import rutasService, { type CreateRutaDto, type RutaDto } from "@/api/services/rutasService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

// Posición inicial por defecto (Ciudad de México)
const defaultPosition: [number, number] = [19.4326, -99.1332];

// 🌟 Componente para forzar el redibujado del mapa (Solución al "mapa roto")
function MapResizer() {
	const map = useMap();

	useEffect(() => {
		// Forzar recálculo del tamaño del mapa después de renderizar
		const timer = setTimeout(() => {
			map.invalidateSize();
		}, 100);

		return () => clearTimeout(timer);
	}, [map]);

	return null;
}

// Componente para manejar la interacción de selección de puntos en el mapa
interface MapSelectorProps {
	partida: { lat: number; lng: number };
	llegada: { lat: number; lng: number };
	paradas: Array<{ latitud: number; longitud: number; nombreParada: string }>;
	onSelect: (lat: number, lng: number) => void;
}

const ICON_PARTIDA_URL = "https://cdn-icons-png.flaticon.com/512/684/684908.png";
const ICON_LLEGADA_URL = "https://cdn-icons-png.flaticon.com/512/3448/3448339.png";
const ICON_PARADA_URL = "https://cdn-icons-png.flaticon.com/512/3721/3721838.png";

function MapSelector({ partida, llegada, paradas, onSelect }: MapSelectorProps) {
	const map = useMapEvents({
		click(e: L.LeafletMouseEvent) {
			onSelect(e.latlng.lat, e.latlng.lng);
			map.setView(e.latlng, map.getZoom());
		},
	});

	const iconPartida = L.icon({
		iconUrl: ICON_PARTIDA_URL,
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -32],
	});

	const iconLlegada = L.icon({
		iconUrl: ICON_LLEGADA_URL,
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -32],
	});

	const iconParada = L.icon({
		iconUrl: ICON_PARADA_URL,
		iconSize: [24, 24],
		iconAnchor: [12, 24],
		popupAnchor: [0, -24],
	});

	// Mostrar marcadores siempre (incluso en posición por defecto)
	const renderPartidaMarker = true;
	const renderLlegadaMarker = true;

	return (
		<>
			{renderPartidaMarker && (
				<Marker position={[partida.lat, partida.lng] as L.LatLngExpression} icon={iconPartida as L.Icon}>
					<Popup>
						<b>🚌 Punto de Partida</b>
						<br />
						Latitud: {partida.lat.toFixed(6)}
						<br />
						Longitud: {partida.lng.toFixed(6)}
					</Popup>
				</Marker>
			)}
			{renderLlegadaMarker && (
				<Marker position={[llegada.lat, llegada.lng] as L.LatLngExpression} icon={iconLlegada as L.Icon}>
					<Popup>
						<b>🏁 Punto de Llegada</b>
						<br />
						Latitud: {llegada.lat.toFixed(6)}
						<br />
						Longitud: {llegada.lng.toFixed(6)}
					</Popup>
				</Marker>
			)}
			{paradas.map((parada, index) => (
				<Marker
					key={`parada-${parada.latitud}-${parada.longitud}`}
					position={[parada.latitud, parada.longitud] as L.LatLngExpression}
					icon={iconParada as L.Icon}
				>
					<Popup>
						<b>
							🚏 Parada {index + 1}: {parada.nombreParada}
						</b>
						<br />
						Latitud: {parada.latitud.toFixed(6)}
						<br />
						Longitud: {parada.longitud.toFixed(6)}
					</Popup>
				</Marker>
			))}
		</>
	);
}

export default function RutasPage() {
	const queryClient = useQueryClient();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);

	// Inicializar Partida y Llegada con la posición por defecto
	const [rutaForm, setRutaForm] = useState<CreateRutaDto>({
		codigoRuta: "",
		nombreRuta: "",
		ciudadOrigen: "",
		ciudadDestino: "",
		puntoPartidaLat: defaultPosition[0],
		puntoPartidaLong: defaultPosition[1],
		puntoPartidaNombre: "",
		puntoLlegadaLat: defaultPosition[0],
		puntoLlegadaLong: defaultPosition[1],
		puntoLlegadaNombre: "",
		distanciaKm: 0,
		tiempoEstimadoMinutos: 0,
		paradas: [],
	});

	const [mapCenter, setMapCenter] = useState<[number, number]>(defaultPosition);
	const [mapMode, setMapMode] = useState<"partida" | "llegada" | "parada">("partida");
	const [expandedCards, setExpandedCards] = useState<number[]>([]);

	// Estado para la nueva parada que se está creando
	const [newParada, setNewParada] = useState({
		nombreParada: "",
		latitud: 0,
		longitud: 0,
		direccion: "",
		tiempoEsperaMinutos: 0,
	});

	// Los datos llegan en PascalCase gracias al servicio
	const { data: rutas = [], isLoading } = useQuery({
		queryKey: ["rutas"],
		queryFn: () => rutasService.getAll(),
	});

	const handleMapSelect = (lat: number, lng: number) => {
		if (mapMode === "partida") {
			setRutaForm((prevForm) => ({
				...prevForm,
				puntoPartidaLat: lat,
				puntoPartidaLong: lng,
				puntoPartidaNombre: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
			}));
		} else if (mapMode === "llegada") {
			setRutaForm((prevForm) => ({
				...prevForm,
				puntoLlegadaLat: lat,
				puntoLlegadaLong: lng,
				puntoLlegadaNombre: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
			}));
		} else if (mapMode === "parada") {
			setNewParada((prev) => ({
				...prev,
				latitud: lat,
				longitud: lng,
				direccion: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
			}));
			toast.success("Ubicación de parada seleccionada");
		}
	};

	const handleAddParada = () => {
		if (!newParada.nombreParada.trim()) {
			toast.error("El nombre de la parada es requerido");
			return;
		}
		if (newParada.latitud === 0 || newParada.longitud === 0) {
			toast.error("Debes seleccionar una ubicación en el mapa para la parada");
			return;
		}

		const paradaToAdd = {
			...newParada,
			ordenParada: 0, // Se recalcula abajo
		};

		setRutaForm((prev) => {
			const updatedParadas = [...(prev.paradas || []), paradaToAdd].map((p, index) => ({
				...p,
				ordenParada: index + 1,
			}));
			return {
				...prev,
				paradas: updatedParadas,
			};
		});

		setNewParada({
			nombreParada: "",
			latitud: 0,
			longitud: 0,
			direccion: "",
			tiempoEsperaMinutos: 0,
		});
		toast.success("Parada agregada");
	};

	const handleRemoveParada = (index: number) => {
		setRutaForm((prev) => {
			const updatedParadas = (prev.paradas || [])
				.filter((_, i) => i !== index)
				.map((p, idx) => ({
					...p,
					ordenParada: idx + 1,
				}));
			return {
				...prev,
				paradas: updatedParadas,
			};
		});
	};

	const handleCityBlur = async (city: string, type: "origen" | "destino") => {
		if (!city || city.length < 3) return;
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`,
			);
			const data = await response.json();
			if (data && data.length > 0) {
				const { lat, lon } = data[0];
				const latNum = Number.parseFloat(lat);
				const lngNum = Number.parseFloat(lon);
				if (type === "origen") {
					setRutaForm((prev) => ({
						...prev,
						puntoPartidaLat: latNum,
						puntoPartidaLong: lngNum,
						puntoPartidaNombre: city,
					}));
					setMapCenter([latNum, lngNum]);
				} else {
					setRutaForm((prev) => ({
						...prev,
						puntoLlegadaLat: latNum,
						puntoLlegadaLong: lngNum,
						puntoLlegadaNombre: city,
					}));
				}
				toast.success(`Ubicación encontrada para ${city}`);
			}
		} catch (error) {
			console.error("Error geocoding city:", error);
		}
	};

	const handleEdit = async (ruta: RutaDto) => {
		setEditingId(ruta.rutaID);
		try {
			const paradas = await rutasService.getParadas(ruta.rutaID);
			setRutaForm({
				codigoRuta: ruta.codigoRuta,
				nombreRuta: ruta.nombreRuta,
				ciudadOrigen: ruta.ciudadOrigen,
				ciudadDestino: ruta.ciudadDestino,
				puntoPartidaLat: ruta.puntoPartidaLat,
				puntoPartidaLong: ruta.puntoPartidaLong,
				puntoPartidaNombre: ruta.puntoPartidaNombre,
				puntoLlegadaLat: ruta.puntoLlegadaLat,
				puntoLlegadaLong: ruta.puntoLlegadaLong,
				puntoLlegadaNombre: ruta.puntoLlegadaNombre,
				distanciaKm: ruta.distanciaKm,
				tiempoEstimadoMinutos: ruta.tiempoEstimadoMinutos,
				paradas: paradas || [],
			});
			setMapCenter([ruta.puntoPartidaLat, ruta.puntoPartidaLong]);
			setIsCreateOpen(true);
		} catch (error) {
			toast.error("Error al cargar los detalles de la ruta");
			console.error(error);
		}
	};

	const resetForm = () => {
		setEditingId(null);
		setRutaForm({
			codigoRuta: "",
			nombreRuta: "",
			ciudadOrigen: "",
			ciudadDestino: "",
			puntoPartidaLat: defaultPosition[0],
			puntoPartidaLong: defaultPosition[1],
			puntoPartidaNombre: "",
			puntoLlegadaLat: defaultPosition[0],
			puntoLlegadaLong: defaultPosition[1],
			puntoLlegadaNombre: "",
			distanciaKm: 0,
			tiempoEstimadoMinutos: 0,
			paradas: [],
		});
		setMapCenter(defaultPosition);
		setIsCreateOpen(false);
	};

	const isFormValid = () => {
		// Verificar que los puntos hayan sido seleccionados (deben ser diferentes entre sí)
		const puntosSeleccionados =
			rutaForm.puntoPartidaLat !== rutaForm.puntoLlegadaLat || rutaForm.puntoPartidaLong !== rutaForm.puntoLlegadaLong;

		// Verificar que los campos de texto y numéricos sean válidos
		const camposValidos =
			rutaForm.codigoRuta.trim().length >= 3 &&
			rutaForm.nombreRuta.trim().length >= 3 &&
			rutaForm.ciudadOrigen.trim().length >= 3 &&
			rutaForm.ciudadDestino.trim().length >= 3 &&
			rutaForm.distanciaKm > 0 &&
			rutaForm.tiempoEstimadoMinutos > 0;

		return puntosSeleccionados && camposValidos;
	};

	const toggleMutation = useMutation({
		mutationFn: (id: number) => rutasService.toggle(id),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["rutas"] });
			toast.success((data as any).message);
		},
		onError: (err: any) => {
			toast.error(`Error al cambiar estado: ${err.message}`);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => rutasService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["rutas"] });
			toast.success("Ruta eliminada correctamente");
		},
		onError: (err: any) => {
			toast.error(`Error al eliminar ruta: ${err.message}`);
		},
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateRutaDto) => rutasService.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["rutas"] });
			toast.success("Ruta creada correctamente");
			resetForm();
		},
		onError: (err: any) => {
			handleMutationError(err, "crear");
		},
	});

	const updateMutation = useMutation({
		mutationFn: (data: CreateRutaDto) => {
			if (editingId === null) throw new Error("No se ha seleccionado una ruta para editar");
			return rutasService.update(editingId, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["rutas"] });
			toast.success("Ruta actualizada correctamente");
			resetForm();
		},
		onError: (err: any) => {
			handleMutationError(err, "actualizar");
		},
	});

	const handleMutationError = (err: any, action: string) => {
		let errorMessage: string;
		if (err.response) {
			errorMessage = err.response.data?.message || err.response.data?.error || err.message;
		} else if (err.request) {
			errorMessage = "No se pudo conectar con el servidor";
		} else {
			errorMessage = err.message;
		}
		toast.error(`Error al ${action} ruta: ${errorMessage}`);
		console.error(`Error ${action} ruta:`, err);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Gestión de Rutas</h1>
					<p className="text-muted-foreground mt-2">
						Administra las rutas del sistema, define puntos de partida y llegada en el mapa
					</p>
				</div>
				<Button
					onClick={() => {
						setEditingId(null);
						setRutaForm({
							codigoRuta: "",
							nombreRuta: "",
							ciudadOrigen: "",
							ciudadDestino: "",
							puntoPartidaLat: defaultPosition[0],
							puntoPartidaLong: defaultPosition[1],
							puntoPartidaNombre: "",
							puntoLlegadaLat: defaultPosition[0],
							puntoLlegadaLong: defaultPosition[1],
							puntoLlegadaNombre: "",
							distanciaKm: 0,
							tiempoEstimadoMinutos: 0,
							paradas: [],
						});
						setIsCreateOpen(true);
					}}
				>
					<Plus className="mr-2 h-4 w-4" />
					Crear Ruta
				</Button>
			</div>

			{/* Lista de Rutas */}
			{isLoading ? (
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{rutas && rutas.length > 0 ? (
						rutas.map((ruta: RutaDto) => {
							const expanded = expandedCards.includes(ruta.rutaID);
							return (
								<Card key={ruta.rutaID} className="hover:shadow-lg transition-shadow">
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-2">
												<MapIcon className="h-5 w-5 text-primary" />
												<CardTitle className="text-lg">{ruta.nombreRuta}</CardTitle>
											</div>
											<div className="flex gap-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => {
														setExpandedCards((prev) =>
															expanded ? prev.filter((id) => id !== ruta.rutaID) : [...prev, ruta.rutaID],
														);
													}}
													title={expanded ? "Ocultar detalles" : "Ver detalles"}
													className="h-8 w-8"
												>
													{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleEdit(ruta)}
													title="Editar ruta"
													className="h-8 w-8"
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant={ruta.activa ? "default" : "outline"}
													size="icon"
													onClick={() => {
														const action = ruta.activa ? "desactivar" : "activar";
														if (
															window.confirm(
																`¿${action.charAt(0).toUpperCase() + action.slice(1)} la ruta "${ruta.nombreRuta}"?`,
															)
														) {
															toggleMutation.mutate(ruta.rutaID);
														}
													}}
													disabled={toggleMutation.isPending}
													className="h-8 w-8"
													title={ruta.activa ? "Desactivar ruta" : "Activar ruta"}
												>
													{toggleMutation.isPending ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<Power className="h-4 w-4" />
													)}
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => {
														if (window.confirm(`¿Eliminar la ruta "${ruta.nombreRuta}"?`)) {
															deleteMutation.mutate(ruta.rutaID);
														}
													}}
													disabled={deleteMutation.isPending}
													className="h-8 w-8 text-destructive hover:text-destructive"
													title="Eliminar ruta"
												>
													{deleteMutation.isPending ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<Trash2 className="h-4 w-4" />
													)}
												</Button>
											</div>
										</div>
										<CardDescription>
											<Badge variant="secondary" className="mr-2">
												{ruta.codigoRuta}
											</Badge>
											<Badge variant={ruta.activa ? "default" : "outline"}>{ruta.activa ? "Activa" : "Inactiva"}</Badge>
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="space-y-2">
											<div className="flex items-center gap-2 text-sm">
												<MapPin className="h-4 w-4 text-green-600" />
												<span className="font-medium">Origen:</span>
												<span className="text-muted-foreground">{ruta.ciudadOrigen}</span>
											</div>
											<div className="flex items-center gap-2 text-sm">
												<MapPin className="h-4 w-4 text-red-600" />
												<span className="font-medium">Destino:</span>
												<span className="text-muted-foreground">{ruta.ciudadDestino}</span>
											</div>
										</div>
										<div className="pt-2 border-t space-y-2">
											<div className="grid grid-cols-2 gap-2 text-sm">
												<div>
													<span className="text-muted-foreground">Distancia:</span>
													<p className="font-semibold">{ruta.distanciaKm} km</p>
												</div>
												<div>
													<span className="text-muted-foreground">Tiempo:</span>
													<p className="font-semibold">{ruta.tiempoEstimadoMinutos} min</p>
												</div>
											</div>
										</div>
										{expanded && (
											<div className="pt-2 border-t space-y-2">
												{ruta.puntoPartidaLat != null &&
													ruta.puntoPartidaLong != null &&
													ruta.puntoLlegadaLat != null &&
													ruta.puntoLlegadaLong != null && (
														<div className="space-y-1 pt-2 border-t">
															<p className="text-xs text-muted-foreground">
																<strong>Partida:</strong> {ruta.puntoPartidaLat.toFixed(6)},{" "}
																{ruta.puntoPartidaLong.toFixed(6)}
															</p>
															<p className="text-xs text-muted-foreground">
																<strong>Llegada:</strong> {ruta.puntoLlegadaLat.toFixed(6)},{" "}
																{ruta.puntoLlegadaLong.toFixed(6)}
															</p>
														</div>
													)}
												<div className="grid grid-cols-2 gap-4 pt-2 border-t">
													<div className="text-center">
														<p className="text-xs text-muted-foreground">Paradas</p>
														<p className="text-lg font-semibold">{ruta.totalParadas ?? 0}</p>
													</div>
													<div className="text-center">
														<p className="text-xs text-muted-foreground">Viajes</p>
														<p className="text-lg font-semibold">{ruta.totalViajes ?? 0}</p>
													</div>
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							);
						})
					) : (
						<div className="col-span-full">
							<Card>
								<CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
									<MapIcon className="h-12 w-12 text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">No hay rutas disponibles</h3>
									<p className="text-muted-foreground mb-4">
										Comienza creando tu primera ruta haciendo clic en "Crear Ruta"
									</p>
									<Button
										onClick={() => {
											setEditingId(null);
											setRutaForm({
												codigoRuta: "",
												nombreRuta: "",
												ciudadOrigen: "",
												ciudadDestino: "",
												puntoPartidaLat: defaultPosition[0],
												puntoPartidaLong: defaultPosition[1],
												puntoPartidaNombre: "",
												puntoLlegadaLat: defaultPosition[0],
												puntoLlegadaLong: defaultPosition[1],
												puntoLlegadaNombre: "",
												distanciaKm: 0,
												tiempoEstimadoMinutos: 0,
												paradas: [],
											});
											setIsCreateOpen(true);
										}}
									>
										<Plus className="mr-2 h-4 w-4" />
										Crear Primera Ruta
									</Button>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			)}

			{/* Diálogo para crear ruta */}
			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent className="!max-w-5xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{editingId ? "Editar Ruta" : "Crear Nueva Ruta"}</DialogTitle>
						<DialogDescription>
							{editingId
								? "Modifica la información de la ruta y sus paradas"
								: "Completa la información de la ruta y selecciona los puntos en el mapa"}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-6 py-4">
						{/* Información básica */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="codigoRuta">Código de Ruta *</Label>
								<Input
									id="codigoRuta"
									placeholder="Ej: RUT-001"
									value={rutaForm.codigoRuta}
									onChange={(e) => setRutaForm({ ...rutaForm, codigoRuta: e.target.value.toUpperCase() })}
								/>
								{rutaForm.codigoRuta.trim().length < 3 && (
									<p className="text-xs text-destructive">Mínimo 3 caracteres</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="nombreRuta">Nombre de Ruta *</Label>
								<Input
									id="nombreRuta"
									placeholder="Ej: Ciudad de México - Guadalajara"
									value={rutaForm.nombreRuta}
									onChange={(e) => setRutaForm({ ...rutaForm, nombreRuta: e.target.value })}
								/>
								{rutaForm.nombreRuta.trim().length < 3 && (
									<p className="text-xs text-destructive">Mínimo 3 caracteres</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="ciudadOrigen">Ciudad Origen *</Label>
								<Input
									id="ciudadOrigen"
									placeholder="Ej: Ciudad de México"
									value={rutaForm.ciudadOrigen}
									onChange={(e) => setRutaForm({ ...rutaForm, ciudadOrigen: e.target.value })}
									onBlur={(e) => handleCityBlur(e.target.value, "origen")}
								/>
								{rutaForm.ciudadOrigen.trim().length < 3 && (
									<p className="text-xs text-destructive">Mínimo 3 caracteres</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="ciudadDestino">Ciudad Destino *</Label>
								<Input
									id="ciudadDestino"
									placeholder="Ej: Guadalajara"
									value={rutaForm.ciudadDestino}
									onChange={(e) => setRutaForm({ ...rutaForm, ciudadDestino: e.target.value })}
									onBlur={(e) => handleCityBlur(e.target.value, "destino")}
								/>
								{rutaForm.ciudadDestino.trim().length < 3 && (
									<p className="text-xs text-destructive">Mínimo 3 caracteres</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="distancia">Distancia (km) *</Label>
								<Input
									id="distancia"
									type="number"
									placeholder="0"
									value={rutaForm.distanciaKm || ""}
									onChange={(e) => setRutaForm({ ...rutaForm, distanciaKm: Number(e.target.value) })}
									min={1}
								/>
								{(!rutaForm.distanciaKm || rutaForm.distanciaKm < 1) && (
									<p className="text-xs text-destructive">Debe ser mayor a 0</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="tiempo">Tiempo Estimado (min) *</Label>
								<Input
									id="tiempo"
									type="number"
									placeholder="0"
									value={rutaForm.tiempoEstimadoMinutos || ""}
									onChange={(e) => setRutaForm({ ...rutaForm, tiempoEstimadoMinutos: Number(e.target.value) })}
									min={1}
								/>
								{(!rutaForm.tiempoEstimadoMinutos || rutaForm.tiempoEstimadoMinutos < 1) && (
									<p className="text-xs text-destructive">Debe ser mayor a 0</p>
								)}
							</div>
						</div>

						{/* Selector de Mapa */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Label>Selecciona los puntos en el mapa</Label>
								<div className="flex gap-2">
									<Button
										size="sm"
										variant={mapMode === "partida" ? "default" : "outline"}
										onClick={() => setMapMode("partida")}
									>
										🚌 Punto de Partida
									</Button>
									<Button
										size="sm"
										variant={mapMode === "llegada" ? "default" : "outline"}
										onClick={() => setMapMode("llegada")}
									>
										🏁 Punto de Llegada
									</Button>
									<Button
										size="sm"
										variant={mapMode === "parada" ? "default" : "outline"}
										onClick={() => setMapMode("parada")}
									>
										🚏 Agregar Parada
									</Button>
								</div>
							</div>
							<div className="border rounded-lg overflow-hidden">
								<MapContainer
									key={`map-${isCreateOpen}`}
									center={mapCenter as L.LatLngExpression}
									zoom={6}
									style={{ height: "400px", width: "100%" }}
									scrollWheelZoom={true}
								>
									<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
									{/* 🎯 La solución al mapa roto */}
									<MapResizer />{" "}
									<MapSelector
										partida={{ lat: rutaForm.puntoPartidaLat, lng: rutaForm.puntoPartidaLong }}
										llegada={{ lat: rutaForm.puntoLlegadaLat, lng: rutaForm.puntoLlegadaLong }}
										paradas={rutaForm.paradas || []}
										onSelect={handleMapSelect}
									/>
								</MapContainer>
							</div>
							<div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
								<div>
									<b>Punto de Partida:</b>
									<div className="text-sm">
										Lat: {rutaForm.puntoPartidaLat.toFixed(6)} | Lng: {rutaForm.puntoPartidaLong.toFixed(6)}
									</div>
									<Input
										placeholder="Nombre del punto (opcional)"
										value={rutaForm.puntoPartidaNombre}
										onChange={(e) => setRutaForm({ ...rutaForm, puntoPartidaNombre: e.target.value })}
										className="mt-1"
									/>
								</div>
								<div>
									<b>Punto de Llegada:</b>
									<div className="text-sm">
										Lat: {rutaForm.puntoLlegadaLat.toFixed(6)} | Lng: {rutaForm.puntoLlegadaLong.toFixed(6)}
									</div>
									<Input
										placeholder="Nombre del punto (opcional)"
										value={rutaForm.puntoLlegadaNombre}
										onChange={(e) => setRutaForm({ ...rutaForm, puntoLlegadaNombre: e.target.value })}
										className="mt-1"
									/>
								</div>
							</div>
						</div>

						{/* Sección de Paradas */}
						<div className="space-y-4 pt-4 border-t">
							<h3 className="text-lg font-semibold">Paradas Intermedias</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
								<div className="space-y-2">
									<Label>Nombre de Parada</Label>
									<Input
										placeholder="Ej: Centro Comercial"
										value={newParada.nombreParada}
										onChange={(e) => setNewParada({ ...newParada, nombreParada: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label>Tiempo de Espera (min)</Label>
									<Input
										type="number"
										min={0}
										placeholder="0"
										value={newParada.tiempoEsperaMinutos}
										onChange={(e) => setNewParada({ ...newParada, tiempoEsperaMinutos: Number(e.target.value) })}
									/>
								</div>
								<Button
									type="button"
									onClick={handleAddParada}
									disabled={!newParada.nombreParada || newParada.latitud === 0}
								>
									<Plus className="mr-2 h-4 w-4" />
									Agregar Parada
								</Button>
							</div>

							{/* Lista de paradas agregadas */}
							{rutaForm.paradas && rutaForm.paradas.length > 0 ? (
								<div className="border rounded-md divide-y">
									{rutaForm.paradas.map((parada, index) => (
										<div
											key={`list-parada-${parada.latitud}-${parada.longitud}`}
											className="p-3 flex items-center justify-between hover:bg-accent/50"
										>
											<div className="flex items-center gap-3">
												<Badge variant="outline" className="h-6 w-6 flex items-center justify-center rounded-full p-0">
													{index + 1}
												</Badge>
												<div>
													<p className="font-medium">{parada.nombreParada}</p>
													<p className="text-xs text-muted-foreground">
														Espera: {parada.tiempoEsperaMinutos} min | Lat: {parada.latitud.toFixed(4)}, Lng:{" "}
														{parada.longitud.toFixed(4)}
													</p>
												</div>
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="text-destructive hover:text-destructive"
												onClick={() => handleRemoveParada(index)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							) : (
								<div className="text-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
									No hay paradas agregadas. Usa el mapa y el formulario de arriba para agregar paradas intermedias.
								</div>
							)}
						</div>

						{!isFormValid() && (
							<span className="text-xs text-red-500 mt-2">
								Asegúrate de rellenar todos los campos correctamente y de seleccionar los puntos en el mapa.
							</span>
						)}

						<div className="flex justify-end gap-2 pt-4">
							<Button variant="outline" onClick={resetForm}>
								Cancelar
							</Button>
							<Button
								onClick={() => {
									if (editingId) {
										updateMutation.mutate(rutaForm);
									} else {
										createMutation.mutate(rutaForm);
									}
								}}
								disabled={createMutation.isPending || updateMutation.isPending || !isFormValid()}
							>
								{createMutation.isPending || updateMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{editingId ? "Actualizando..." : "Creando..."}
									</>
								) : editingId ? (
									"Actualizar Ruta"
								) : (
									"Guardar Ruta"
								)}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
