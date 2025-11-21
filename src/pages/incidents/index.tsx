import { AlertTriangle, Filter, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useHasRole } from "@/hooks/use-session";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";

export default function IncidentsPage() {
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const isOperator = useHasRole("Operator");
	const isStaff = useHasRole("Staff");
	const allowed = isAdmin || isManager || isOperator || isStaff;

	const [searchTerm, setSearchTerm] = useState("");

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

	const canCreate = isOperator || isStaff;
	const canViewAll = isAdmin || isManager;

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<AlertTriangle className="h-8 w-8" />
						Incidencias
					</h1>
					<p className="text-muted-foreground mt-2">
						{canViewAll ? "Gestión de incidencias del sistema" : "Mis reportes de incidencias"}
					</p>
				</div>
				{canCreate && (
					<Button>
						<Plus className="mr-2 h-4 w-4" />
						Reportar Incidencia
					</Button>
				)}
			</div>

			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">Incidencias registradas</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Pendientes</CardTitle>
						<AlertTriangle className="h-4 w-4 text-amber-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-amber-600">0</div>
						<p className="text-xs text-muted-foreground">Por resolver</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Resueltas</CardTitle>
						<AlertTriangle className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">0</div>
						<p className="text-xs text-muted-foreground">Completadas</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Este Mes</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">Nuevas incidencias</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Filtros</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4">
						<Input
							placeholder="Buscar incidencias..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="flex-1"
						/>
						<Button variant="outline">
							<Filter className="mr-2 h-4 w-4" />
							Filtros
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-6">
					<div className="text-center py-12">
						<AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No hay incidencias registradas</h3>
						<p className="text-muted-foreground mb-4">
							{canCreate
								? "Reporta una incidencia cuando sea necesario"
								: "Las incidencias aparecerán aquí cuando se reporten"}
						</p>
						{canCreate && (
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Reportar Incidencia
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
