import { Bus, Filter, Plus } from "lucide-react";
import { useState } from "react";
import { useHasRole } from "@/hooks/use-session";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";

export default function TripsPage() {
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isAdmin || isManager;

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

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Bus className="h-8 w-8" />
						Gestión de Viajes
					</h1>
					<p className="text-muted-foreground mt-2">Administración de viajes y rutas</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Nuevo Viaje
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Filtros</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4">
						<div className="flex-1">
							<Input
								placeholder="Buscar viajes..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full"
							/>
						</div>
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
						<Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No hay viajes registrados</h3>
						<p className="text-muted-foreground mb-4">Comienza creando tu primer viaje</p>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Crear Viaje
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
