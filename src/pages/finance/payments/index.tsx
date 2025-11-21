import { Calendar, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { useHasRole } from "@/hooks/use-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

export default function PaymentsPage() {
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isAdmin || isManager;

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
					<CreditCard className="h-8 w-8" />
					Pagos
				</h1>
				<p className="text-muted-foreground mt-2">Gestión de pagos y transacciones</p>
			</div>

			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Hoy</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$0.00</div>
						<p className="text-xs text-muted-foreground">0 transacciones</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Pendientes</CardTitle>
						<Calendar className="h-4 w-4 text-amber-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-amber-600">$0.00</div>
						<p className="text-xs text-muted-foreground">Por confirmar</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Completados</CardTitle>
						<TrendingUp className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">$0.00</div>
						<p className="text-xs text-muted-foreground">Este mes</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Promedio</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$0.00</div>
						<p className="text-xs text-muted-foreground">Por transacción</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Transacciones Recientes</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-12">
						<CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No hay transacciones</h3>
						<p className="text-muted-foreground">Las transacciones de pago aparecerán aquí</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
