import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import viajesService, { type ConfigurarPrecioParadaDto, type ViajeDto } from "@/api/services/viajesService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table";
import { handleApiError } from "@/utils/error-handler";

interface ConfigurePricesModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	viaje: ViajeDto | null;
}

interface PriceRow {
	paradaViajeID: number;
	nombreParada: string;
	precioBase: number;
	cargoServicio: number;
	observaciones: string;
}

export function ConfigurePricesModal({ open, onOpenChange, viaje }: ConfigurePricesModalProps) {
	const queryClient = useQueryClient();
	const [prices, setPrices] = useState<PriceRow[]>([]);

	// Fetch stops for the trip
	const { data: paradas = [], isLoading: isLoadingParadas } = useQuery({
		queryKey: ["viaje-paradas", viaje?.viajeID],
		queryFn: () => (viaje ? viajesService.getParadasViaje(viaje.viajeID) : Promise.resolve([])),
		enabled: !!viaje && open,
	});

	// Fetch existing prices to pre-fill (optional but good UX)
	const { data: existingPrices = [] } = useQuery({
		queryKey: ["viaje-precios", viaje?.viajeID],
		queryFn: () => (viaje ? viajesService.getPreciosParadas(viaje.viajeID) : Promise.resolve([])),
		enabled: !!viaje && open,
	});

	// Initialize state when data is ready
	useEffect(() => {
		if (paradas.length > 0) {
			const initialPrices: PriceRow[] = paradas.map((p) => {
				// Check if we have an existing price config for this stop
				const existing = existingPrices.find((ep) => ep.paradaViajeID === p.paradaID);
				return {
					paradaViajeID: p.paradaID,
					nombreParada: p.ubicacionNombre,
					precioBase: existing ? existing.precioBase : viaje?.precioBase || 0,
					cargoServicio: existing ? existing.cargoServicio : viaje?.cargoServicio || 0,
					observaciones: existing ? existing.observaciones : "",
				};
			});
			setPrices(initialPrices);
		}
	}, [paradas, existingPrices, viaje]);

	const mutation = useMutation({
		mutationFn: (data: ConfigurarPrecioParadaDto[]) => {
			if (!viaje) throw new Error("No viaje selected");
			return viajesService.configurarPrecios(viaje.viajeID, data);
		},
		onSuccess: () => {
			toast.success("Precios configurados exitosamente");
			queryClient.invalidateQueries({ queryKey: ["viaje-precios", viaje?.viajeID] });
			onOpenChange(false);
		},
		onError: (error: any) => {
			const safe = handleApiError(error);
			toast.error("Error al guardar precios", { description: safe.userMessage });
		},
	});

	const handlePriceChange = (index: number, field: keyof PriceRow, value: any) => {
		const newPrices = [...prices];
		newPrices[index] = { ...newPrices[index], [field]: value };
		setPrices(newPrices);
	};

	const handleSave = () => {
		const payload: ConfigurarPrecioParadaDto[] = prices.map((p) => ({
			paradaViajeID: p.paradaViajeID,
			precioBase: Number(p.precioBase),
			cargoServicio: Number(p.cargoServicio),
			observaciones: p.observaciones,
		}));
		mutation.mutate(payload);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						Configurar Precios por Parada
					</DialogTitle>
					<DialogDescription>
						Establece precios diferenciados para cada parada del viaje <strong>{viaje?.codigoViaje}</strong>.
					</DialogDescription>
				</DialogHeader>

				{isLoadingParadas ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : prices.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">No hay paradas registradas para este viaje.</div>
				) : (
					<div className="border rounded-md">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Parada</TableHead>
									<TableHead className="w-[150px]">Precio Base</TableHead>
									<TableHead className="w-[150px]">Cargo Servicio</TableHead>
									<TableHead className="w-[100px] text-right">Total</TableHead>
									<TableHead>Observaciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{prices.map((row, index) => (
									<TableRow key={row.paradaViajeID}>
										<TableCell className="font-medium">{row.nombreParada}</TableCell>
										<TableCell>
											<div className="relative">
												<span className="absolute left-2 top-2.5 text-muted-foreground">$</span>
												<Input
													type="number"
													className="pl-6"
													value={row.precioBase}
													onChange={(e) => handlePriceChange(index, "precioBase", Number(e.target.value))}
												/>
											</div>
										</TableCell>
										<TableCell>
											<div className="relative">
												<span className="absolute left-2 top-2.5 text-muted-foreground">$</span>
												<Input
													type="number"
													className="pl-6"
													value={row.cargoServicio}
													onChange={(e) => handlePriceChange(index, "cargoServicio", Number(e.target.value))}
												/>
											</div>
										</TableCell>
										<TableCell className="text-right font-bold">
											${(Number(row.precioBase) + Number(row.cargoServicio)).toFixed(2)}
										</TableCell>
										<TableCell>
											<Input
												placeholder="Ej. Zona Centro"
												value={row.observaciones}
												onChange={(e) => handlePriceChange(index, "observaciones", e.target.value)}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}

				<DialogFooter className="mt-4">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancelar
					</Button>
					<Button onClick={handleSave} disabled={mutation.isPending || prices.length === 0}>
						{mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
						Guardar Cambios
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
