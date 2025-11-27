import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Bus, Calendar, Copy, DollarSign, Loader2, MapPin, Save, Search, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import viajesService, { type ConfigurarPrecioParadaDto, type ViajeDto } from "@/api/services/viajesService";
import { useHasRole } from "@/hooks/use-session";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { ScrollArea } from "@/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { cn } from "@/utils/index";

export default function PricingConfigurationPage() {
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isAdmin || isManager;
	const queryClient = useQueryClient();

	const [searchTerm, setSearchTerm] = useState("");
	const [selectedViaje, setSelectedViaje] = useState<ViajeDto | null>(null);
	const [prices, setPrices] = useState<ConfigurarPrecioParadaDto[]>([]);

	// Fetch trips for search
	const { data: viajes } = useQuery({
		queryKey: ["viajes", searchTerm],
		queryFn: () => viajesService.getAllViajes({}), // TODO: Add search param support if needed
		enabled: allowed,
	});

	// Filter trips client-side
	const filteredViajes = useMemo(() => {
		const safeViajes = viajes || [];
		if (!searchTerm) return safeViajes;
		const lower = searchTerm.toLowerCase();
		return safeViajes.filter(
			(v) =>
				v.codigoViaje.toLowerCase().includes(lower) ||
				v.eventoNombre.toLowerCase().includes(lower) ||
				v.rutaNombre.toLowerCase().includes(lower),
		);
	}, [viajes, searchTerm]);

	// Fetch existing prices or stops to configure
	const {
		data: existingPrices,
		isLoading: isLoadingPrices,
		error: pricesError,
	} = useQuery({
		queryKey: ["trip-prices", selectedViaje?.viajeID],
		queryFn: () => viajesService.getPreciosParadas(selectedViaje?.viajeID || 0),
		enabled: !!selectedViaje,
		retry: 1,
	});

	// Fetch stops if no prices exist yet (to initialize the form)
	const {
		data: paradas,
		error: paradasError,
		isLoading: isLoadingParadas,
	} = useQuery({
		queryKey: ["trip-stops", selectedViaje?.viajeID],
		queryFn: () => viajesService.getParadasViaje(selectedViaje?.viajeID || 0),
		enabled: !!selectedViaje && (!existingPrices || existingPrices.length === 0) && !pricesError,
		retry: 1,
	});

	// Initialize state when data loads
	useEffect(() => {
		if (existingPrices && existingPrices.length > 0) {
			setPrices(
				existingPrices.map((p) => ({
					paradaViajeID: p.paradaViajeID,
					precioBase: p.precioBase,
					cargoServicio: p.cargoServicio,
					observaciones: p.observaciones,
					nombreParada: p.nombreParada, // Helper property for display
				})),
			);
		} else if (paradas && paradas.length > 0) {
			// Initialize with default values from stops
			setPrices(
				paradas.map((p) => ({
					paradaViajeID: p.paradaViajeID,
					precioBase: 0,
					cargoServicio: 0,
					nombreParada: p.nombreParada, // Helper property for display
				})),
			);
		} else {
			setPrices([]);
		}
	}, [existingPrices, paradas]);

	const saveMutation = useMutation({
		mutationFn: (data: ConfigurarPrecioParadaDto[]) => {
			if (!selectedViaje) throw new Error("No trip selected");
			return viajesService.configurarPrecios(
				selectedViaje.viajeID,
				data.map(({ nombreParada, ...rest }: any) => rest), // Remove helper property before sending
			);
		},
		onSuccess: () => {
			toast.success("Precios actualizados exitosamente");
			queryClient.invalidateQueries({ queryKey: ["trip-prices", selectedViaje?.viajeID] });
		},
		onError: (error: any) => {
			console.error("Error saving prices:", error);
			const message = error?.message || "Error al guardar precios";
			toast.error("No se pudieron guardar los precios", { description: message });
		},
	});

	const copyBasePricesMutation = useMutation({
		mutationFn: () => {
			if (!selectedViaje) throw new Error("No trip selected");
			return viajesService.copiarPreciosBase(selectedViaje.viajeID);
		},
		onSuccess: () => {
			toast.success("Precios base copiados exitosamente");
			queryClient.invalidateQueries({ queryKey: ["trip-prices", selectedViaje?.viajeID] });
		},
		onError: (error: any) => {
			console.error("Error copying base prices:", error);
			toast.error("No se pudieron copiar los precios base", {
				description: "Verifica que la ruta tenga precios configurados.",
			});
		},
	});

	const handlePriceChange = (index: number, field: keyof ConfigurarPrecioParadaDto, value: string) => {
		const numValue = parseFloat(value) || 0;
		setPrices((prev) => {
			const newPrices = [...prev];
			newPrices[index] = { ...newPrices[index], [field]: numValue };
			return newPrices;
		});
	};

	const handleSubmit = () => {
		if (!selectedViaje) return;

		// Validate that all prices have valid IDs
		const invalidPrices = prices.filter((p) => !p.paradaViajeID || p.paradaViajeID === 0);
		if (invalidPrices.length > 0) {
			toast.error("Error en los datos de paradas", {
				description: "Las paradas no tienen IDs válidos. Contacta a soporte.",
			});
			return;
		}

		saveMutation.mutate(prices);
	};

	const totalPotentialRevenue = useMemo(() => {
		if (!selectedViaje || prices.length === 0) return 0;
		// This is a rough estimate, assuming all seats sold at average price?
		// Or maybe just sum of base prices? Let's just show average price per stop for now.
		const totalBase = prices.reduce((acc, curr) => acc + curr.precioBase + curr.cargoServicio, 0);
		return totalBase / prices.length;
	}, [prices, selectedViaje]);

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

	return (
		<div className="flex h-[calc(100vh-100px)] flex-col overflow-hidden rounded-lg border bg-background shadow-sm">
			{/* Header */}
			<div className="flex items-center justify-between border-b px-6 py-4 bg-card">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-primary/10 rounded-lg">
						<Tag className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h1 className="text-xl font-bold">Configuración de Precios</h1>
						<p className="text-sm text-muted-foreground">Gestión de tarifas por parada y ruta</p>
					</div>
				</div>
			</div>

			<div className="flex flex-1 overflow-hidden">
				{/* Sidebar - Trip List */}
				<div className="w-full max-w-sm border-r flex flex-col bg-muted/10">
					<div className="p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Buscar viaje, ruta..."
								className="pl-9 bg-background"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
					</div>
					<ScrollArea className="flex-1">
						<div className="flex flex-col gap-1 p-2">
							{filteredViajes.length === 0 ? (
								<div className="p-8 text-center text-muted-foreground">
									<p>No se encontraron viajes</p>
								</div>
							) : (
								filteredViajes.map((viaje) => (
									<button
										type="button"
										key={viaje.viajeID}
										onClick={() => setSelectedViaje(viaje)}
										className={cn(
											"flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all hover:bg-accent group",
											selectedViaje?.viajeID === viaje.viajeID
												? "bg-accent border-primary/50 shadow-sm"
												: "bg-card border-transparent hover:border-border",
										)}
									>
										<div className="flex w-full items-center justify-between">
											<span className="font-mono font-bold text-xs text-primary">{viaje.codigoViaje}</span>
											<Badge variant="secondary" className="text-[10px] h-5">
												{viaje.estatusNombre}
											</Badge>
										</div>
										<div className="w-full">
											<p className="font-medium text-sm line-clamp-1">{viaje.eventoNombre}</p>
											<div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
												<MapPin className="h-3 w-3" />
												<span className="line-clamp-1">{viaje.rutaNombre}</span>
											</div>
											<div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
												<Calendar className="h-3 w-3" />
												<span>{new Date(viaje.fechaSalida).toLocaleDateString()}</span>
											</div>
										</div>
									</button>
								))
							)}
						</div>
					</ScrollArea>
				</div>

				{/* Main Content */}
				<div className="flex-1 flex flex-col bg-background overflow-hidden">
					{selectedViaje ? (
						<div className="flex flex-col h-full">
							{/* Trip Details Header */}
							<div className="border-b p-6 bg-card/50">
								<div className="flex items-start justify-between mb-6">
									<div>
										<div className="flex items-center gap-2 mb-1">
											<Badge variant="outline" className="font-mono">
												{selectedViaje.codigoViaje}
											</Badge>
											<span className="text-sm text-muted-foreground">
												{new Date(selectedViaje.fechaSalida).toLocaleString()}
											</span>
										</div>
										<h2 className="text-2xl font-bold">{selectedViaje.eventoNombre}</h2>
										<div className="flex items-center gap-2 text-muted-foreground mt-1">
											<MapPin className="h-4 w-4" />
											<span>
												{selectedViaje.ciudadOrigen} ➝ {selectedViaje.ciudadDestino}
											</span>
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											onClick={() => copyBasePricesMutation.mutate()}
											disabled={copyBasePricesMutation.isPending || isLoadingPrices}
										>
											{copyBasePricesMutation.isPending ? (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<Copy className="mr-2 h-4 w-4" />
											)}
											Copiar Precios Base
										</Button>
										<Button onClick={handleSubmit} disabled={saveMutation.isPending || prices.length === 0}>
											{saveMutation.isPending ? (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<Save className="mr-2 h-4 w-4" />
											)}
											Guardar Cambios
										</Button>
									</div>
								</div>

								{/* Stats Cards */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<Card className="bg-muted/50 border-none shadow-none">
										<CardContent className="p-4 flex items-center gap-4">
											<div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
												<MapPin className="h-5 w-5" />
											</div>
											<div>
												<p className="text-xs text-muted-foreground font-medium uppercase">Paradas</p>
												<p className="font-semibold">{prices.length} configuradas</p>
											</div>
										</CardContent>
									</Card>
									<Card className="bg-muted/50 border-none shadow-none">
										<CardContent className="p-4 flex items-center gap-4">
											<div className="p-2 bg-green-100 text-green-600 rounded-lg">
												<DollarSign className="h-5 w-5" />
											</div>
											<div>
												<p className="text-xs text-muted-foreground font-medium uppercase">Precio Promedio</p>
												<p className="font-semibold">${totalPotentialRevenue.toFixed(2)}</p>
											</div>
										</CardContent>
									</Card>
									<Card className="bg-muted/50 border-none shadow-none">
										<CardContent className="p-4 flex items-center gap-4">
											<div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
												<Bus className="h-5 w-5" />
											</div>
											<div>
												<p className="text-xs text-muted-foreground font-medium uppercase">Unidad</p>
												<p className="font-semibold">{selectedViaje.unidadPlacas}</p>
											</div>
										</CardContent>
									</Card>
								</div>
							</div>

							{/* Pricing Grid */}
							<ScrollArea className="flex-1 p-6 bg-muted/10">
								{isLoadingPrices || isLoadingParadas ? (
									<div className="flex items-center justify-center h-full text-muted-foreground">
										<Loader2 className="h-8 w-8 animate-spin mr-2" />
										Cargando precios...
									</div>
								) : pricesError || paradasError ? (
									<Alert variant="destructive">
										<AlertCircle className="h-4 w-4" />
										<AlertTitle>Error al cargar datos</AlertTitle>
										<AlertDescription>
											No se pudieron cargar los precios o paradas del viaje. Verifica que la ruta tenga paradas
											configuradas.
										</AlertDescription>
									</Alert>
								) : prices.length === 0 ? (
									<div className="flex flex-col items-center justify-center h-full text-muted-foreground border-2 border-dashed rounded-xl p-12 bg-background/50">
										<div className="p-4 bg-muted rounded-full mb-4">
											<Tag className="h-8 w-8 opacity-50" />
										</div>
										<h3 className="text-lg font-semibold">Sin precios configurados</h3>
										<p className="text-sm max-w-xs text-center mt-2 mb-6">
											Este viaje no tiene precios. Copia los precios base o configúralos manualmente.
										</p>
										<Button variant="outline" onClick={() => copyBasePricesMutation.mutate()}>
											Copiar Precios Base
										</Button>
									</div>
								) : (
									<Card>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Parada</TableHead>
													<TableHead className="w-[200px]">Precio Base ($)</TableHead>
													<TableHead className="w-[200px]">Cargo Servicio ($)</TableHead>
													<TableHead className="w-[150px] text-right">Total ($)</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{prices.map((price, index) => (
													<TableRow key={price.paradaViajeID}>
														<TableCell className="font-medium">
															{(price as any).nombreParada || `Parada ID: ${price.paradaViajeID}`}
															{price.observaciones && (
																<p className="text-xs text-muted-foreground mt-1">{price.observaciones}</p>
															)}
														</TableCell>
														<TableCell>
															<div className="relative">
																<span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
																<Input
																	type="number"
																	min="0"
																	step="0.01"
																	value={price.precioBase}
																	onChange={(e) => handlePriceChange(index, "precioBase", e.target.value)}
																	className="pl-7"
																/>
															</div>
														</TableCell>
														<TableCell>
															<div className="relative">
																<span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
																<Input
																	type="number"
																	min="0"
																	step="0.01"
																	value={price.cargoServicio}
																	onChange={(e) => handlePriceChange(index, "cargoServicio", e.target.value)}
																	className="pl-7"
																/>
															</div>
														</TableCell>
														<TableCell className="text-right font-bold text-lg">
															${(price.precioBase + price.cargoServicio).toFixed(2)}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</Card>
								)}
							</ScrollArea>
						</div>
					) : (
						<div className="flex flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/5">
							<div className="p-6 bg-background rounded-full shadow-sm mb-6">
								<Tag className="h-12 w-12 text-primary/20" />
							</div>
							<h3 className="text-xl font-semibold text-foreground">Selecciona un viaje</h3>
							<p className="text-sm max-w-md text-center mt-2">
								Selecciona un viaje de la lista para configurar los precios de sus paradas.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
