import { useQuery } from "@tanstack/react-query";
import { Activity, Bell, Calendar, CreditCard, Loader2, Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import userService from "@/api/services/userService";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

export default function ProfilePage() {
	const {
		data: profile,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["me-profile"],
		queryFn: () => userService.getMeProfile(),
	});

	if (isLoading) {
		return (
			<div className="flex h-[50vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 text-center text-red-500">
				<p>Error al cargar el perfil. Por favor intenta de nuevo.</p>
				<p className="text-sm text-muted-foreground mt-2">{(error as any).message}</p>
			</div>
		);
	}

	if (!profile) return null;

	return (
		<div className="space-y-6 p-6">
			{/* Header con Resumen */}
			<div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-muted/30 p-6 rounded-xl border">
				<div className="flex items-center gap-4">
					<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
						<User className="h-8 w-8 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold">{profile.nombreCompleto}</h1>
						<div className="flex items-center gap-2 text-muted-foreground mt-1">
							<Mail className="h-4 w-4" />
							<span className="text-sm">{profile.email}</span>
						</div>
						<div className="flex gap-2 mt-3">
							<Badge variant={profile.estatus === "Activo" ? "default" : "destructive"} className="px-3 py-0.5">
								{profile.estatus}
							</Badge>
							<Badge variant="outline" className="text-xs">
								Registrado el {new Date(profile.fechaRegistro).toLocaleDateString()}
							</Badge>
						</div>
					</div>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				{/* Columna Principal (2/3) */}
				<div className="md:col-span-2 space-y-6">
					{/* Información de Contacto y Personal */}
					<Card className="overflow-hidden">
						<CardHeader className="bg-muted/30 pb-4">
							<CardTitle className="flex items-center gap-2 text-lg">
								<User className="h-5 w-5 text-primary" />
								Detalles Personales
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6">
							<div className="grid gap-y-6 gap-x-8 sm:grid-cols-2">
								<div className="space-y-1.5">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Teléfono</p>
									<div className="flex items-center gap-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<span className="text-base font-medium">{profile.telefono || "No registrado"}</span>
									</div>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										Fecha de Nacimiento
									</p>
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span className="text-base font-medium">
											{profile.fechaNacimiento
												? new Date(profile.fechaNacimiento).toLocaleDateString()
												: "No registrada"}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Dirección */}
					<Card className="overflow-hidden">
						<CardHeader className="bg-muted/30 pb-4">
							<CardTitle className="flex items-center gap-2 text-lg">
								<MapPin className="h-5 w-5 text-primary" />
								Dirección
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6">
							<div className="grid gap-y-6 gap-x-8 sm:grid-cols-2">
								<div className="space-y-1.5">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Calle y Número</p>
									<p className="text-base font-medium">{profile.direccion || "No registrada"}</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ciudad</p>
									<p className="text-base font-medium">{profile.ciudad || "No registrada"}</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</p>
									<p className="text-base font-medium">{profile.estado || "No registrado"}</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Código Postal</p>
									<p className="text-base font-medium">{profile.codigoPostal || "No registrado"}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Documentación */}
					<Card className="overflow-hidden">
						<CardHeader className="bg-muted/30 pb-4">
							<CardTitle className="flex items-center gap-2 text-lg">
								<CreditCard className="h-5 w-5 text-primary" />
								Documentación Legal
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6">
							<div className="grid gap-y-6 gap-x-8 sm:grid-cols-2">
								<div className="space-y-1.5">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										Tipo de Documento
									</p>
									<p className="text-base font-medium">{profile.tipoDocumento || "No especificado"}</p>
								</div>
								<div className="space-y-1.5">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										Número de Documento
									</p>
									<div className="flex items-center gap-2">
										<ShieldCheck className="h-4 w-4 text-muted-foreground" />
										<p className="text-base font-mono font-medium bg-muted/50 px-2 py-0.5 rounded">
											{profile.numeroDocumento || "No especificado"}
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Columna Lateral (1/3) */}
				<div className="space-y-6">
					{/* Actividad */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base">
								<Activity className="h-4 w-4 text-primary" />
								Actividad Reciente
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-between items-center py-2 border-b last:border-0">
								<span className="text-sm text-muted-foreground">Última Conexión</span>
								<span className="text-sm font-medium text-right">
									{new Date(profile.ultimaConexion).toLocaleString()}
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Configuración */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base">
								<Activity className="h-4 w-4 text-primary" />
								Preferencias
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-1">
							<div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-primary/10 rounded-full">
										<Bell className="h-4 w-4 text-primary" />
									</div>
									<div className="flex flex-col">
										<span className="text-sm font-medium">Notificaciones Push</span>
										<span className="text-xs text-muted-foreground">Alertas en dispositivo</span>
									</div>
								</div>
								<Badge variant={profile.notificacionesPush ? "default" : "secondary"}>
									{profile.notificacionesPush ? "On" : "Off"}
								</Badge>
							</div>
							<div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
								<div className="flex items-center gap-3">
									<div className="p-2 bg-primary/10 rounded-full">
										<Mail className="h-4 w-4 text-primary" />
									</div>
									<div className="flex flex-col">
										<span className="text-sm font-medium">Emails</span>
										<span className="text-xs text-muted-foreground">Boletines y avisos</span>
									</div>
								</div>
								<Badge variant={profile.notificacionesEmail ? "default" : "secondary"}>
									{profile.notificacionesEmail ? "On" : "Off"}
								</Badge>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
