import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Scan, TicketCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import validacionService, { type ValidacionResultDto } from "@/api/services/validacionService";
import viajesService from "@/api/services/viajesService";
import { useHasRole } from "@/hooks/use-session";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

export default function ValidationPage() {
	const isOperator = useHasRole("Operator");
	const isStaff = useHasRole("Staff");
	const allowed = isOperator || isStaff;

	const [ticketCode, setTicketCode] = useState("");
	const [selectedViajeId, setSelectedViajeId] = useState<string>("");
	const [lastResult, setLastResult] = useState<ValidacionResultDto | null>(null);
	const [stats, setStats] = useState({ valid: 0, invalid: 0 });

	// Fetch assigned trips
	const { data: misViajes = [] } = useQuery({
		queryKey: ["mis-viajes"],
		queryFn: () => viajesService.getMisViajes({ soloProximos: true }),
		enabled: allowed,
	});

	const validateMutation = useMutation({
		mutationFn: (code: string) =>
			validacionService.validarBoleto({
				viajeID: Number(selectedViajeId),
				codigoQR: code,
				tipoValidacion: "Abordaje", // Default type
				estacionLat: 0, // TODO: Get real location
				estacionLong: 0,
			}),
		onSuccess: (data) => {
			setLastResult(data);
			if (data.esValido) {
				toast.success(`Boleto válido: ${data.nombrePasajero}`);
				setStats((prev) => ({ ...prev, valid: prev.valid + 1 }));
				setTicketCode(""); // Clear input on success
			} else {
				toast.error(`Boleto inválido: ${data.mensaje}`);
				setStats((prev) => ({ ...prev, invalid: prev.invalid + 1 }));
			}
		},
		onError: (error: any) => {
			toast.error(error.message || "Error al validar boleto");
			setStats((prev) => ({ ...prev, invalid: prev.invalid + 1 }));
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

	const handleValidate = () => {
		if (!selectedViajeId) {
			toast.error("Selecciona un viaje primero");
			return;
		}
		if (!ticketCode) {
			toast.error("Ingresa un código de boleto");
			return;
		}
		validateMutation.mutate(ticketCode);
	};

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-bold flex items-center gap-2">
					<TicketCheck className="h-8 w-8" />
					Validación de Boletos
				</h1>
				<p className="text-muted-foreground mt-2">Escanear y validar boletos de pasajeros</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Seleccionar Viaje</CardTitle>
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

			<Card>
				<CardHeader>
					<CardTitle>Escanear Boleto</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Input
							placeholder="Código del boleto..."
							value={ticketCode}
							onChange={(e) => setTicketCode(e.target.value)}
							className="flex-1"
							onKeyDown={(e) => e.key === "Enter" && handleValidate()}
							disabled={!selectedViajeId || validateMutation.isPending}
						/>
						<Button onClick={handleValidate} disabled={!selectedViajeId || validateMutation.isPending}>
							<Scan className="mr-2 h-4 w-4" />
							{validateMutation.isPending ? "Validando..." : "Validar"}
						</Button>
					</div>
					<p className="text-sm text-muted-foreground">Ingresa el código del boleto o usa un escáner de códigos QR</p>
				</CardContent>
			</Card>

			{lastResult && (
				<Card className={lastResult.esValido ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
					<CardHeader>
						<CardTitle className={lastResult.esValido ? "text-green-700" : "text-red-700"}>
							{lastResult.esValido ? "Boleto Válido" : "Boleto Inválido"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="font-medium">Pasajero</p>
								<p>{lastResult.nombrePasajero || "-"}</p>
							</div>
							<div>
								<p className="font-medium">Asiento</p>
								<p>{lastResult.numeroAsiento || "-"}</p>
							</div>
							<div>
								<p className="font-medium">Mensaje</p>
								<p>{lastResult.mensaje}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Boletos Validados</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{stats.valid}</div>
						<p className="text-xs text-muted-foreground">En esta sesión</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Rechazados</CardTitle>
						<XCircle className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{stats.invalid}</div>
						<p className="text-xs text-muted-foreground">En esta sesión</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
