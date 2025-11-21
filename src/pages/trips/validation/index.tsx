import { CheckCircle2, Scan, TicketCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { useHasRole } from "@/hooks/use-session";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";

export default function ValidationPage() {
	const isOperator = useHasRole("Operator");
	const isStaff = useHasRole("Staff");
	const allowed = isOperator || isStaff;

	const [ticketCode, setTicketCode] = useState("");

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
					<CardTitle>Escanear Boleto</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Input
							placeholder="Código del boleto..."
							value={ticketCode}
							onChange={(e) => setTicketCode(e.target.value)}
							className="flex-1"
						/>
						<Button>
							<Scan className="mr-2 h-4 w-4" />
							Validar
						</Button>
					</div>
					<p className="text-sm text-muted-foreground">Ingresa el código del boleto o usa un escáner de códigos QR</p>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Boletos Validados</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">0</div>
						<p className="text-xs text-muted-foreground">En esta sesión</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Rechazados</CardTitle>
						<XCircle className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">0</div>
						<p className="text-xs text-muted-foreground">En esta sesión</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
