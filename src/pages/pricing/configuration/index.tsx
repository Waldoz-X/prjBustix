import { Percent, Plus, TagIcon } from "lucide-react";
import { useState } from "react";
import { useHasRole } from "@/hooks/use-session";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";

export default function PricingConfigurationPage() {
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
						<TagIcon className="h-8 w-8" />
						Configuración de Precios
					</h1>
					<p className="text-muted-foreground mt-2">Gestión de precios por parada y ruta</p>
				</div>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Nueva Configuración
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Rutas Configuradas</CardTitle>
						<TagIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">Con precios definidos</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
						<Percent className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">$0.00</div>
						<p className="text-xs text-muted-foreground">Por boleto</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
						<TagIcon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">-</div>
						<p className="text-xs text-muted-foreground">Sin cambios</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Buscar Ruta</CardTitle>
				</CardHeader>
				<CardContent>
					<Input
						placeholder="Buscar ruta para configurar precios..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-6">
					<div className="text-center py-12">
						<TagIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No hay configuraciones de precios</h3>
						<p className="text-muted-foreground mb-4">Comienza configurando precios para tus rutas</p>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Configurar Precios
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
