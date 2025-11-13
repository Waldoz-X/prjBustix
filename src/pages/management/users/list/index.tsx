import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";

export default function UsersListPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Lista de Usuarios</h1>
				<p className="text-muted-foreground">Gestiona los usuarios del sistema (Próximamente)</p>
			</div>

			{/* Coming Soon Card */}
			<Card className="border-2 border-dashed">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-6 w-6" />
						Módulo en Desarrollo
					</CardTitle>
					<CardDescription>
						Este módulo estará disponible próximamente. Podrás gestionar usuarios, ver detalles, asignar roles y más.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">Funcionalidades planeadas:</p>
						<div className="grid gap-2 sm:grid-cols-2">
							{[
								"Crear y editar usuarios",
								"Asignar roles y permisos",
								"Búsqueda y filtrado avanzado",
								"Gestión de estados (activo/inactivo)",
								"Ver historial de actividad",
								"Exportar datos",
							].map((feature) => (
								<div key={feature} className="flex items-center gap-2">
									<Badge variant="secondary" className="text-xs">
										📋
									</Badge>
									<span className="text-sm">{feature}</span>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Info Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">-</div>
						<p className="text-xs text-muted-foreground">Próximamente disponible</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">-</div>
						<p className="text-xs text-muted-foreground">Próximamente disponible</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium">Nuevos este mes</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">-</div>
						<p className="text-xs text-muted-foreground">Próximamente disponible</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
