import { UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { useHasRole } from "@/hooks/use-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";

export default function StaffAssignmentPage() {
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
						<Users className="h-8 w-8" />
						Asignación de Staff
					</h1>
					<p className="text-muted-foreground mt-2">Asignar operadores y staff a viajes</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Buscar Viaje</CardTitle>
				</CardHeader>
				<CardContent>
					<Input
						placeholder="Buscar viaje para asignar staff..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-6">
					<div className="text-center py-12">
						<UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">Selecciona un viaje</h3>
						<p className="text-muted-foreground">Busca un viaje para asignar operadores y staff</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
