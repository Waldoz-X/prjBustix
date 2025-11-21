import { CheckCircle, Clock, Mail, Send } from "lucide-react";
import { useState } from "react";
import { useHasRole } from "@/hooks/use-session";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";

export default function EmailConfirmationPage() {
	const isAdmin = useHasRole("Admin");
	const [email, setEmail] = useState("");

	if (!isAdmin) {
		return (
			<div className="p-6">
				<Card>
					<CardHeader>
						<CardTitle>Acceso denegado</CardTitle>
					</CardHeader>
					<CardContent>
						<p>Solo los administradores pueden acceder a esta página.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-bold flex items-center gap-2">
					<Mail className="h-8 w-8" />
					Confirmación de Email
				</h1>
				<p className="text-muted-foreground mt-2">Gestión de confirmaciones de correo electrónico</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Confirmados</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">0</div>
						<p className="text-xs text-muted-foreground">Emails verificados</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Pendientes</CardTitle>
						<Clock className="h-4 w-4 text-amber-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-amber-600">0</div>
						<p className="text-xs text-muted-foreground">Sin confirmar</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Enviados Hoy</CardTitle>
						<Send className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">Emails de confirmación</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Reenviar Email de Confirmación</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Input
							type="email"
							placeholder="Email del usuario..."
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="flex-1"
						/>
						<Button>
							<Send className="mr-2 h-4 w-4" />
							Reenviar
						</Button>
					</div>
					<p className="text-sm text-muted-foreground">
						Ingresa el email del usuario para reenviar el correo de confirmación
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Usuarios Pendientes de Confirmación</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-12">
						<Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No hay usuarios pendientes</h3>
						<p className="text-muted-foreground">Todos los usuarios han confirmado su email</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
