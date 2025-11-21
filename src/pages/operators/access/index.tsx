import { AlertTriangle, Lock, Shield, Unlock } from "lucide-react";
import { useHasRole } from "@/hooks/use-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

export default function AccessManagementPage() {
	const isAdmin = useHasRole("Admin");

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
					<Shield className="h-8 w-8" />
					Gestión de Accesos
				</h1>
				<p className="text-muted-foreground mt-2">Control de bloqueos y seguridad de usuarios</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Usuarios Bloqueados</CardTitle>
						<Lock className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">0</div>
						<p className="text-xs text-muted-foreground">Actualmente</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">En Riesgo</CardTitle>
						<AlertTriangle className="h-4 w-4 text-amber-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-amber-600">0</div>
						<p className="text-xs text-muted-foreground">Múltiples intentos fallidos</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Activos</CardTitle>
						<Unlock className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">0</div>
						<p className="text-xs text-muted-foreground">Sin restricciones</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Usuarios Bloqueados</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-12">
						<Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No hay usuarios bloqueados</h3>
						<p className="text-muted-foreground">Los usuarios bloqueados aparecerán aquí</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
