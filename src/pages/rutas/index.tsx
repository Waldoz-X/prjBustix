// RutasPage.tsx

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronDown, ChevronUp, Loader2, Map as MapIcon, MapPin, Plus, Power, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { toast } from "sonner";
import { type CrearPlantillaRutaDto, type PlantillaRutaResponseDto, rutasService } from "@/api/services/rutasService";
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
	onSelect: (lat: number, lng: number) => void;
}

function MapSelector({ partida, llegada, onSelect }: MapSelectorProps) {
	const map = useMapEvents({
		click(e: L.LeafletMouseEvent) {
			onSelect(e.latlng.lat, e.latlng.lng);
			map.setView(e.latlng, map.getZoom());
		},
	});

	const iconPartida = L.icon({
		iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -32],
	});

	const iconLlegada = L.icon({
		iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
		iconSize: [32, 32],
		iconAnchor: [16, 32],
		popupAnchor: [0, -32],
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
		</>
	);
}

export default function RutasPage() {
	const queryClient = useQueryClient();
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	// Inicializar Partida y Llegada con la posición por defecto
	const [rutaForm, setRutaForm] = useState<CrearPlantillaRutaDto>({
		CodigoRuta: "",
		NombreRuta: "",
		CiudadOrigen: "",
		CiudadDestino: "",
		PuntoPartidaLat: defaultPosition[0],
		PuntoPartidaLong: defaultPosition[1],
		PuntoPartidaNombre: "",
		PuntoLlegadaLat: defaultPosition[0],
		PuntoLlegadaLong: defaultPosition[1],
		PuntoLlegadaNombre: "",
		DistanciaKm: 0,
		TiempoEstimadoMinutos: 0,
		Paradas: [],
	});

	const [mapCenter, setMapCenter] = useState<[number, number]>(defaultPosition);
	const [mapMode, setMapMode] = useState<"partida" | "llegada">("partida");
	const [expandedCards, setExpandedCards] = useState<number[]>([]);

	// Los datos llegan en PascalCase gracias al servicio
	const { data: rutas = [], isLoading } = useQuery({
		queryKey: ["rutas"],
		queryFn: () => rutasService.getAll(),
	});

	const handleMapSelect = (lat: number, lng: number) => {
		if (mapMode === "partida") {
			setRutaForm((prevForm) => ({
				...prevForm,
				PuntoPartidaLat: lat,
				PuntoPartidaLong: lng,
				PuntoPartidaNombre: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
			}));
		} else {
			setRutaForm((prevForm) => ({
				...prevForm,
				PuntoLlegadaLat: lat,
				PuntoLlegadaLong: lng,
				PuntoLlegadaNombre: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
			}));
		}
	};

	const isFormValid = () => {
		// Verificar que los puntos hayan sido seleccionados (deben ser diferentes entre sí)
		const puntosSeleccionados =
			rutaForm.PuntoPartidaLat !== rutaForm.PuntoLlegadaLat || rutaForm.PuntoPartidaLong !== rutaForm.PuntoLlegadaLong;

		// Verificar que los campos de texto y numéricos sean válidos
		const camposValidos =
			rutaForm.CodigoRuta.trim().length >= 3 &&
			rutaForm.NombreRuta.trim().length >= 3 &&
			rutaForm.CiudadOrigen.trim().length >= 3 &&
			rutaForm.CiudadDestino.trim().length >= 3 &&
			rutaForm.DistanciaKm > 0 &&
			rutaForm.TiempoEstimadoMinutos > 0;

		return puntosSeleccionados && camposValidos;
	};

	const toggleMutation = useMutation({
		mutationFn: (id: number) => rutasService.toggle(id),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["rutas"] });
			toast.success(data.message);
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
		mutationFn: (data: CrearPlantillaRutaDto) => rutasService.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["rutas"] });
			toast.success("Ruta creada correctamente");
			setIsCreateOpen(false);
			setRutaForm({
				CodigoRuta: "",
				NombreRuta: "",
				CiudadOrigen: "",
				CiudadDestino: "",
				PuntoPartidaLat: defaultPosition[0],
				PuntoPartidaLong: defaultPosition[1],
				PuntoPartidaNombre: "",
				PuntoLlegadaLat: defaultPosition[0],
				PuntoLlegadaLong: defaultPosition[1],
				PuntoLlegadaNombre: "",
				DistanciaKm: 0,
				TiempoEstimadoMinutos: 0,
				Paradas: [],
			});
			setMapCenter(defaultPosition);
		},
		onError: (err: any) => {
			// Manejo de errores del backend
			let errorMessage = "Error desconocido al crear ruta";

			if (err.response) {
				// Error del servidor (400, 500, etc.)
				errorMessage = err.response.data?.message || err.response.data?.error || err.message;
			} else if (err.request) {
				// La petición se envió pero no hubo respuesta
				errorMessage = "No se pudo conectar con el servidor";
			} else {
				// Error al configurar la petición
				errorMessage = err.message;
			}

			toast.error(`Error al crear ruta: ${errorMessage}`);
			console.error("Error creando ruta:", err);
		},
	});

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
				<Button onClick={() => setIsCreateOpen(true)}>
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
						rutas.map((ruta: PlantillaRutaResponseDto) => {
							const expanded = expandedCards.includes(ruta.RutaID);
							return (
								<Card key={ruta.RutaID} className="hover:shadow-lg transition-shadow">
									<CardHeader>
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-2">
												<MapIcon className="h-5 w-5 text-primary" />
												<CardTitle className="text-lg">{ruta.NombreRuta}</CardTitle>
											</div>
											<div className="flex gap-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => {
														setExpandedCards((prev) =>
															expanded ? prev.filter((id) => id !== ruta.RutaID) : [...prev, ruta.RutaID],
														);
													}}
													title={expanded ? "Ocultar detalles" : "Ver detalles"}
													className="h-8 w-8"
												>
													{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
												</Button>
												<Button
													variant={ruta.Activa ? "default" : "outline"}
													size="icon"
													onClick={() => {
														const action = ruta.Activa ? "desactivar" : "activar";
														if (
															window.confirm(
																`¿${action.charAt(0).toUpperCase() + action.slice(1)} la ruta "${ruta.NombreRuta}"?`,
															)
														) {
															toggleMutation.mutate(ruta.RutaID);
														}
													}}
													disabled={toggleMutation.isPending}
													className="h-8 w-8"
													title={ruta.Activa ? "Desactivar ruta" : "Activar ruta"}
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
														if (window.confirm(`¿Eliminar la ruta "${ruta.NombreRuta}"?`)) {
															deleteMutation.mutate(ruta.RutaID);
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
												{ruta.CodigoRuta}
											</Badge>
											<Badge variant={ruta.Activa ? "default" : "outline"}>{ruta.Activa ? "Activa" : "Inactiva"}</Badge>
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="space-y-2">
											<div className="flex items-center gap-2 text-sm">
												<MapPin className="h-4 w-4 text-green-600" />
												<span className="font-medium">Origen:</span>
												<span className="text-muted-foreground">{ruta.CiudadOrigen}</span>
											</div>
											<div className="flex items-center gap-2 text-sm">
												<MapPin className="h-4 w-4 text-red-600" />
												<span className="font-medium">Destino:</span>
												<span className="text-muted-foreground">{ruta.CiudadDestino}</span>
											</div>
										</div>
										<div className="pt-2 border-t space-y-2">
											<div className="grid grid-cols-2 gap-2 text-sm">
												<div>
													<span className="text-muted-foreground">Distancia:</span>
													<p className="font-semibold">{ruta.DistanciaKm} km</p>
												</div>
												<div>
													<span className="text-muted-foreground">Tiempo:</span>
													<p className="font-semibold">{ruta.TiempoEstimadoMinutos} min</p>
												</div>
											</div>
										</div>
										{expanded && (
											<div className="pt-2 border-t space-y-2">
												{ruta.PuntoPartidaLat != null &&
													ruta.PuntoPartidaLong != null &&
													ruta.PuntoLlegadaLat != null &&
													ruta.PuntoLlegadaLong != null && (
														<div className="space-y-1 pt-2 border-t">
															<p className="text-xs text-muted-foreground">
																<strong>Partida:</strong> {ruta.PuntoPartidaLat.toFixed(6)},{" "}
																{ruta.PuntoPartidaLong.toFixed(6)}
															</p>
															<p className="text-xs text-muted-foreground">
																<strong>Llegada:</strong> {ruta.PuntoLlegadaLat.toFixed(6)},{" "}
																{ruta.PuntoLlegadaLong.toFixed(6)}
															</p>
														</div>
													)}
												<div className="grid grid-cols-2 gap-4 pt-2 border-t">
													<div className="text-center">
														<p className="text-xs text-muted-foreground">Paradas</p>
														<p className="text-lg font-semibold">{ruta.TotalParadas ?? 0}</p>
													</div>
													<div className="text-center">
														<p className="text-xs text-muted-foreground">Viajes</p>
														<p className="text-lg font-semibold">{ruta.TotalViajes ?? 0}</p>
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
									<Button onClick={() => setIsCreateOpen(true)}>
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
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Crear Nueva Ruta</DialogTitle>
						<DialogDescription>Completa la información de la ruta y selecciona los puntos en el mapa</DialogDescription>
					</DialogHeader>
					<div className="space-y-6 py-4">
						{/* Información básica */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="codigoRuta">Código de Ruta *</Label>
								<Input
									id="codigoRuta"
									placeholder="Ej: RUT-001"
									value={rutaForm.CodigoRuta}
									onChange={(e) => setRutaForm({ ...rutaForm, CodigoRuta: e.target.value.toUpperCase() })}
								/>
								{rutaForm.CodigoRuta.trim().length < 3 && (
									<p className="text-xs text-destructive">Mínimo 3 caracteres</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="nombreRuta">Nombre de Ruta *</Label>
								<Input
									id="nombreRuta"
									placeholder="Ej: Ciudad de México - Guadalajara"
									value={rutaForm.NombreRuta}
									onChange={(e) => setRutaForm({ ...rutaForm, NombreRuta: e.target.value })}
								/>
								{rutaForm.NombreRuta.trim().length < 3 && (
									<p className="text-xs text-destructive">Mínimo 3 caracteres</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="ciudadOrigen">Ciudad Origen *</Label>
								<Input
									id="ciudadOrigen"
									placeholder="Ej: Ciudad de México"
									value={rutaForm.CiudadOrigen}
									onChange={(e) => setRutaForm({ ...rutaForm, CiudadOrigen: e.target.value })}
								/>
								{rutaForm.CiudadOrigen.trim().length < 3 && (
									<p className="text-xs text-destructive">Mínimo 3 caracteres</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="ciudadDestino">Ciudad Destino *</Label>
								<Input
									id="ciudadDestino"
									placeholder="Ej: Guadalajara"
									value={rutaForm.CiudadDestino}
									onChange={(e) => setRutaForm({ ...rutaForm, CiudadDestino: e.target.value })}
								/>
								{rutaForm.CiudadDestino.trim().length < 3 && (
									<p className="text-xs text-destructive">Mínimo 3 caracteres</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="distancia">Distancia (km) *</Label>
								<Input
									id="distancia"
									type="number"
									placeholder="0"
									value={rutaForm.DistanciaKm || ""}
									onChange={(e) => setRutaForm({ ...rutaForm, DistanciaKm: Number(e.target.value) })}
									min={1}
								/>
								{(!rutaForm.DistanciaKm || rutaForm.DistanciaKm < 1) && (
									<p className="text-xs text-destructive">Debe ser mayor a 0</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="tiempo">Tiempo Estimado (min) *</Label>
								<Input
									id="tiempo"
									type="number"
									placeholder="0"
									value={rutaForm.TiempoEstimadoMinutos || ""}
									onChange={(e) => setRutaForm({ ...rutaForm, TiempoEstimadoMinutos: Number(e.target.value) })}
									min={1}
								/>
								{(!rutaForm.TiempoEstimadoMinutos || rutaForm.TiempoEstimadoMinutos < 1) && (
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
										partida={{ lat: rutaForm.PuntoPartidaLat, lng: rutaForm.PuntoPartidaLong }}
										llegada={{ lat: rutaForm.PuntoLlegadaLat, lng: rutaForm.PuntoLlegadaLong }}
										onSelect={handleMapSelect}
									/>
								</MapContainer>
							</div>
							<div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
								<div>
									<b>Punto de Partida:</b>
									<div className="text-sm">
										Lat: {rutaForm.PuntoPartidaLat.toFixed(6)} | Lng: {rutaForm.PuntoPartidaLong.toFixed(6)}
									</div>
									<Input
										placeholder="Nombre del punto (opcional)"
										value={rutaForm.PuntoPartidaNombre}
										onChange={(e) => setRutaForm({ ...rutaForm, PuntoPartidaNombre: e.target.value })}
										className="mt-1"
									/>
								</div>
								<div>
									<b>Punto de Llegada:</b>
									<div className="text-sm">
										Lat: {rutaForm.PuntoLlegadaLat.toFixed(6)} | Lng: {rutaForm.PuntoLlegadaLong.toFixed(6)}
									</div>
									<Input
										placeholder="Nombre del punto (opcional)"
										value={rutaForm.PuntoLlegadaNombre}
										onChange={(e) => setRutaForm({ ...rutaForm, PuntoLlegadaNombre: e.target.value })}
										className="mt-1"
									/>
								</div>
							</div>
						</div>

						{!isFormValid() && (
							<span className="text-xs text-red-500 mt-2">
								Asegúrate de rellenar todos los campos correctamente y de seleccionar los puntos en el mapa.
							</span>
						)}

						<div className="flex justify-end gap-2 pt-4">
							<Button variant="outline" onClick={() => setIsCreateOpen(false)}>
								Cancelar
							</Button>
							<Button
								onClick={() => {
									createMutation.mutate(rutaForm);
								}}
								disabled={createMutation.isPending || !isFormValid()}
							>
								{createMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creando...
									</>
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
