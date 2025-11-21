import { ClipboardList } from "lucide-react";
import { useHasRole } from "@/hooks/use-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

export default function AssignedTripsPage() {
	const isOperator = useHasRole("Operator");
	const isStaff = useHasRole("Staff");
	const allowed = isOperator || isStaff;

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
					<ClipboardList className="h-8 w-8" />
					Mis Viajes Asignados
				</h1>
				<p className="text-muted-foreground mt-2">Viajes asignados a tu usuario</p>
			</div>

			<Card>
				<CardContent className="p-6">
					<div className="text-center py-12">
						<ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No tienes viajes asignados</h3>
						<p className="text-muted-foreground">Cuando se te asignen viajes aparecerán aquí</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
