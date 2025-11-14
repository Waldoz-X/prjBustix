// filepath: c:\Users\sierr\WebstormProjects\prjbustix\src\pages\functions\token-expired\index.tsx

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import userService from "@/api/services/userService";
import { Icon } from "@/components/icon";
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
		<div className="container mx-auto max-w-2xl py-8">
			<Card className="border-[#A9A9A9]/20 shadow-lg">
				<CardHeader className="space-y-4">
					<div className="flex items-center justify-center">
						<div className="rounded-full bg-gradient-to-r from-[#A6402C] to-[#803549] p-4">
							<Icon icon="solar:shield-warning-bold" className="text-white" size={48} />
						</div>
					</div>
					<CardTitle className="text-center text-2xl font-bold text-[#1A1A1A]">Cerrar Sesión</CardTitle>
					<CardDescription className="text-center text-[#4A4A4A]">
						Utiliza este botón para cerrar tu sesión de forma segura. Tu token de acceso será invalidado en el servidor.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Información */}
					<div className="rounded-lg border border-[#A9A9A9]/20 bg-[#F0EBE3] p-4">
						<h3 className="mb-3 flex items-center gap-2 font-semibold text-[#1A1A1A]">
							<Icon icon="solar:info-circle-bold" size={20} className="text-[#A6402C]" />
							¿Qué sucede al cerrar sesión?
						</h3>
						<ul className="space-y-2 text-sm text-[#4A4A4A]">
							<li className="flex items-start gap-2">
								<Icon icon="solar:check-circle-bold" size={16} className="mt-0.5 text-green-600" />
								<span>
									Se invalida tu <strong>RefreshToken</strong> en el servidor
								</span>
							</li>
							<li className="flex items-start gap-2">
								<Icon icon="solar:check-circle-bold" size={16} className="mt-0.5 text-green-600" />
								<span>Se elimina tu token de acceso del navegador</span>
							</li>
							<li className="flex items-start gap-2">
								<Icon icon="solar:check-circle-bold" size={16} className="mt-0.5 text-green-600" />
								<span>Deberás iniciar sesión nuevamente para acceder</span>
							</li>
							<li className="flex items-start gap-2">
								<Icon icon="solar:check-circle-bold" size={16} className="mt-0.5 text-green-600" />
								<span>Tus datos permanecen seguros en el sistema</span>
							</li>
						</ul>
					</div>

					{/* Botón de Logout */}
					<div className="flex flex-col gap-3">
						<Button
							onClick={handleLogout}
							disabled={logoutMutation.isPending}
							className="w-full bg-gradient-to-r from-[#A6402C] to-[#803549] text-white shadow-lg hover:shadow-xl disabled:opacity-50"
							size="lg"
						>
							{logoutMutation.isPending ? (
								<>
									<Icon icon="solar:refresh-bold" className="mr-2 animate-spin" size={20} />
									Cerrando sesión...
								</>
							) : (
								<>
									<Icon icon="solar:logout-2-bold" className="mr-2" size={20} />
									Cerrar Sesión
								</>
							)}
						</Button>

						<Button
							onClick={() => navigate(-1)}
							variant="outline"
							className="w-full border-[#A9A9A9]/30 text-[#4A4A4A] hover:border-[#A6402C]"
						>
							<Icon icon="solar:arrow-left-bold" className="mr-2" size={16} />
							Volver
						</Button>
					</div>

					{/* Nota de Seguridad */}
					<div className="rounded-lg border border-[#803549]/20 bg-[#803549]/5 p-3">
						<p className="flex items-start gap-2 text-xs text-[#803549]">
							<Icon icon="solar:shield-check-bold" size={16} className="mt-0.5" />
							<span>
								<strong>Nota de Seguridad:</strong> Siempre cierra sesión cuando uses una computadora compartida o
								pública.
							</span>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
