// filepath: c:\Users\sierr\WebstormProjects\prjbustix\src\pages\functions\token-expired\index.tsx

import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, CheckCircle2, Database, Lock, LogOut, ShieldCheck, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import userService from "@/api/services/userService";
import { useUserActions } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { logger } from "@/utils/logger";

export default function TokenExpired() {
	const navigate = useNavigate();
	const { clearUserInfoAndToken } = useUserActions();

	const logoutMutation = useMutation<{ message?: string }, Error>({
		mutationFn: userService.logout,
		onSuccess: (data) => {
			// Limpiar storage local
			clearUserInfoAndToken();
			localStorage.removeItem("token");
			localStorage.removeItem("refreshToken");
			localStorage.removeItem("userEmail");

			toast.success(data.message || "Sesión cerrada exitosamente");

			// Redirigir al login después de 1 segundo
			setTimeout(() => {
				navigate("/auth/login", { replace: true });
			}, 1000);
		},
		onError: (error: any) => {
			logger.error("Error al cerrar sesión:", error);

			// Aunque falle, limpiar local storage y redirigir
			clearUserInfoAndToken();
			localStorage.removeItem("token");
			localStorage.removeItem("refreshToken");
			localStorage.removeItem("userEmail");

			toast.error(error.message || "Error al cerrar sesión, pero se limpió la sesión local");

			setTimeout(() => {
				navigate("/auth/login", { replace: true });
			}, 1000);
		},
	});

	const handleLogout = () => {
		logoutMutation.mutate();
	};

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<LogOut className="h-8 w-8" />
						Cerrar Sesión
					</h1>
					<p className="text-muted-foreground mt-2">Finaliza tu sesión de forma segura en el sistema</p>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				{/* Main Card - Información */}
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>¿Qué sucede al cerrar sesión?</CardTitle>
						<CardDescription>
							Al confirmar el cierre de sesión, se realizarán las siguientes acciones de seguridad
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
								<div className="rounded-full bg-green-100 dark:bg-green-900/20 p-2">
									<ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-500" />
								</div>
								<div>
									<p className="font-medium">Token Invalidado</p>
									<p className="text-sm text-muted-foreground">Tu RefreshToken será invalidado en el servidor</p>
								</div>
							</div>

							<div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
								<div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-2">
									<Trash2 className="h-5 w-5 text-orange-600 dark:text-orange-500" />
								</div>
								<div>
									<p className="font-medium">Datos Locales Eliminados</p>
									<p className="text-sm text-muted-foreground">Se eliminará tu token de acceso del navegador</p>
								</div>
							</div>

							<div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
								<div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-2">
									<Lock className="h-5 w-5 text-blue-600 dark:text-blue-500" />
								</div>
								<div>
									<p className="font-medium">Reautenticación Requerida</p>
									<p className="text-sm text-muted-foreground">Deberás iniciar sesión nuevamente para acceder</p>
								</div>
							</div>

							<div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
								<div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-2">
									<Database className="h-5 w-5 text-purple-600 dark:text-purple-500" />
								</div>
								<div>
									<p className="font-medium">Datos Protegidos</p>
									<p className="text-sm text-muted-foreground">Tus datos permanecen seguros en el sistema</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Sidebar Card - Acciones */}
				<Card>
					<CardHeader>
						<CardTitle>Acciones</CardTitle>
						<CardDescription>Confirma o cancela el cierre de sesión</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button onClick={handleLogout} disabled={logoutMutation.isPending} className="w-full justify-start">
							{logoutMutation.isPending ? (
								<>
									<CheckCircle2 className="mr-2 h-4 w-4 animate-spin" />
									Cerrando sesión...
								</>
							) : (
								<>
									<LogOut className="mr-2 h-4 w-4" />
									Cerrar Sesión
								</>
							)}
						</Button>

						<Button
							onClick={() => navigate(-1)}
							variant="outline"
							className="w-full justify-start"
							disabled={logoutMutation.isPending}
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Security Warning Card */}
			<Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
				<CardHeader>
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-amber-500 p-2">
							<AlertTriangle className="h-5 w-5 text-white" />
						</div>
						<div>
							<CardTitle className="text-lg text-amber-700 dark:text-amber-400">Consejo de Seguridad</CardTitle>
							<CardDescription className="text-amber-600 dark:text-amber-500">
								Siempre cierra sesión cuando uses una computadora compartida o pública
							</CardDescription>
						</div>
					</div>
				</CardHeader>
			</Card>
		</div>
	);
}
