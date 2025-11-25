import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, Save, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import viajesService, { type ConfigurarPrecioParadaDto, type ViajeDto } from "@/api/services/viajesService";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";

interface PricingModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	trip: ViajeDto | null;
}

export function PricingModal({ open, onOpenChange, trip }: PricingModalProps) {
	const queryClient = useQueryClient();
	const [prices, setPrices] = useState<ConfigurarPrecioParadaDto[]>([]);

	// Fetch existing prices or stops to configure
	const {
		data: existingPrices = [],
		isLoading,
		error: pricesError,
	} = useQuery({
		queryKey: ["trip-prices", trip?.viajeID],
		queryFn: () => viajesService.getPreciosParadas(trip?.viajeID || 0),
		enabled: !!trip && open,
		retry: 1,
	});

	// Fetch stops if no prices exist yet (to initialize the form)
	const {
		data: paradas = [],
		error: paradasError,
		isLoading: isLoadingParadas,
	} = useQuery({
		queryKey: ["trip-stops", trip?.viajeID],
		queryFn: () => viajesService.getParadasViaje(trip?.viajeID || 0),
		enabled: !!trip && open && existingPrices.length === 0 && !pricesError,
		retry: 1,
	});

	// Initialize state when data loads
	useEffect(() => {
		if (existingPrices.length > 0) {
			setPrices(
				existingPrices.map((p) => ({
					paradaViajeID: p.paradaViajeID,
					precioBase: p.precioBase,
					cargoServicio: p.cargoServicio,
					observaciones: p.observaciones,
					nombreParada: p.nombreParada, // Helper property for display
				})),
			);
		} else if (paradas.length > 0) {
			// Initialize with default values from stops
			setPrices(
				paradas.map((p) => ({
					paradaViajeID: p.paradaViajeID,
					precioBase: 0,
					cargoServicio: 0,
					nombreParada: p.nombreParada, // Helper property for display
				})),
			);
		}
	}, [existingPrices, paradas]);

	const saveMutation = useMutation({
		mutationFn: (data: ConfigurarPrecioParadaDto[]) => {
			if (!trip) throw new Error("No trip selected");
			return viajesService.configurarPrecios(
				trip.viajeID,
				data.map(({ nombreParada, ...rest }: any) => rest), // Remove helper property before sending
			);
		},
		onSuccess: () => {
			toast.success("Precios actualizados exitosamente");
			queryClient.invalidateQueries({ queryKey: ["trip-prices", trip?.viajeID] });
			onOpenChange(false);
		},
		onError: (error: any) => {
			console.error("Error saving prices:", error);
			const message = error?.message || "Error al guardar precios";
			toast.error("No se pudieron guardar los precios", { description: message });
		},
	});

	const copyBasePricesMutation = useMutation({
		mutationFn: () => {
			if (!trip) throw new Error("No trip selected");
			return viajesService.copiarPreciosBase(trip.viajeID);
		},
		onSuccess: () => {
			toast.success("Precios base copiados exitosamente");
			queryClient.invalidateQueries({ queryKey: ["trip-prices", trip?.viajeID] });
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!trip) return;

		// Validate that all prices have valid IDs
		const invalidPrices = prices.filter((p) => !p.paradaViajeID || p.paradaViajeID === 0);
		if (invalidPrices.length > 0) {
			console.error("[PricingModal] Prices with invalid IDs:", invalidPrices);
			toast.error("Error en los datos de paradas", {
				description:
					"Las paradas no tienen IDs válidos. Esto indica un problema con los datos del viaje. Por favor, contacta a soporte técnico.",
			});
			return;
		}

		console.log("[PricingModal] Submitting prices:", prices);
		saveMutation.mutate(prices);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Tag className="h-5 w-5" />
						Configurar Precios del Viaje
					</DialogTitle>
					<DialogDescription>
						{trip && (
							<>
								Configura los precios por parada para el viaje <strong>{trip.codigoViaje}</strong> ({trip.eventoNombre})
							</>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto py-4">
					{isLoading || isLoadingParadas ? (
						<div className="flex justify-center p-8">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : pricesError || paradasError ? (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Error al cargar precios</AlertTitle>
							<AlertDescription>
								{pricesError
									? "No se pudieron cargar los precios del viaje. Esto puede ocurrir si el viaje no tiene una ruta asociada o si la ruta no tiene paradas configuradas."
									: "No se pudieron cargar las paradas del viaje. Verifica que el viaje tenga una ruta válida con paradas configuradas."}
								<div className="mt-2">
									<Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
										Cerrar
									</Button>
								</div>
							</AlertDescription>
						</Alert>
					) : (
						<div className="space-y-6">
							{prices.length === 0 && (
								<Alert>
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>No hay precios configurados</AlertTitle>
									<AlertDescription className="space-y-3">
										<p>
											Este viaje aún no tiene precios configurados. Puedes copiar los precios base de la ruta original o
											configurarlos manualmente.
										</p>
										<Button
											variant="outline"
											onClick={() => copyBasePricesMutation.mutate()}
											disabled={copyBasePricesMutation.isPending}
										>
											{copyBasePricesMutation.isPending ? (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<Save className="mr-2 h-4 w-4" />
											)}
											Copiar Precios Base
										</Button>
									</AlertDescription>
								</Alert>
							)}

							{prices.length > 0 && (
								<form id="pricing-form" onSubmit={handleSubmit}>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Parada</TableHead>
												<TableHead className="w-[150px]">Precio Base ($)</TableHead>
												<TableHead className="w-[150px]">Cargo Servicio ($)</TableHead>
												<TableHead className="w-[100px] text-right">Total ($)</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{prices.map((price, index) => (
												<TableRow key={price.paradaViajeID}>
													<TableCell className="font-medium">
														{(price as any).nombreParada || `Parada ID: ${price.paradaViajeID}`}
													</TableCell>
													<TableCell>
														<Input
															type="number"
															min="0"
															step="0.01"
															value={price.precioBase}
															onChange={(e) => handlePriceChange(index, "precioBase", e.target.value)}
															className="w-full"
														/>
													</TableCell>
													<TableCell>
														<Input
															type="number"
															min="0"
															step="0.01"
															value={price.cargoServicio}
															onChange={(e) => handlePriceChange(index, "cargoServicio", e.target.value)}
															className="w-full"
														/>
													</TableCell>
													<TableCell className="text-right font-bold">
														${(price.precioBase + price.cargoServicio).toFixed(2)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</form>
							)}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					{prices.length > 0 && (
						<Button type="submit" form="pricing-form" disabled={saveMutation.isPending || isLoading}>
							{saveMutation.isPending ? "Guardando..." : "Guardar Cambios"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
