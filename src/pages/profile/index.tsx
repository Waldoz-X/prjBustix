import { Calendar, Edit, Mail, Phone, User } from "lucide-react";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

export default function ProfilePage() {
	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<User className="h-8 w-8" />
						Mi Perfil
					</h1>
					<p className="text-muted-foreground mt-2">Información personal y configuración de cuenta</p>
				</div>
				<Button>
					<Edit className="mr-2 h-4 w-4" />
					Editar Perfil
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Información Personal</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
								<p className="text-lg font-semibold">Usuario Demo</p>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">Email</p>
								<p className="text-lg font-semibold flex items-center gap-2">
									<Mail className="h-4 w-4" />
									usuario@example.com
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">Teléfono</p>
								<p className="text-lg font-semibold flex items-center gap-2">
									<Phone className="h-4 w-4" />
									+52 123 456 7890
								</p>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">Fecha de Registro</p>
								<p className="text-lg font-semibold flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									{new Date().toLocaleDateString()}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Roles y Permisos</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Badge variant="default">Usuario</Badge>
							<p className="text-sm text-muted-foreground mt-4">
								Tus roles determinan a qué módulos del sistema puedes acceder
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Acciones de Cuenta</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Button variant="outline" className="w-full justify-start">
						Cambiar Contraseña
					</Button>
					<Button variant="outline" className="w-full justify-start">
						Configurar Notificaciones
					</Button>
					<Button variant="destructive" className="w-full justify-start">
						Eliminar Cuenta
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
