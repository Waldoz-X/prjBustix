import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import userService from "@/api/services/userService";
import { Icon } from "@/components/icon";
import Logo from "@/components/logo";
import { GLOBAL_CONFIG } from "@/global-config";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";

export default function ConfirmEmail() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [message, setMessage] = useState("");

	const confirmMutation = useMutation<{ message?: string }, Error, { email: string; token: string }>({
		mutationFn: ({ email, token }: { email: string; token: string }) => userService.confirmEmail(email, token),
		onSuccess: (data) => {
			setStatus("success");
			setMessage(data.message || "Email confirmado exitosamente");
		},
		onError: (error: any) => {
			setStatus("error");
			setMessage(error.message || "Error al confirmar el email. El token puede haber expirado.");
		},
	});

	useEffect(() => {
		const email = searchParams.get("email");
		const token = searchParams.get("token");

		if (!email || !token) {
			setStatus("error");
			setMessage("Faltan parámetros requeridos (email o token).");
			return;
		}

		// Confirmar automáticamente al cargar la página
		confirmMutation.mutate({ email, token });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		searchParams, // Confirmar automáticamente al cargar la página
		confirmMutation.mutate,
	]);

	const handleGoToLogin = () => {
		navigate("/auth/login");
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#F0EBE3] to-white p-4">
			<div className="absolute left-4 top-4 flex items-center gap-2 font-medium">
				<Logo size={28} />
				<span className="text-[#1A1A1A]">{GLOBAL_CONFIG.appName}</span>
			</div>

			<Card className="w-full max-w-md border-[#A9A9A9]/20 shadow-2xl">
				<CardHeader className="space-y-4 text-center">
					{/* Ícono de estado */}
					<div className="flex justify-center">
						{status === "loading" && (
							<div className="rounded-full bg-gradient-to-r from-[#A6402C] to-[#803549] p-4">
								<Icon icon="solar:refresh-bold" className="animate-spin text-white" size={48} />
							</div>
						)}
						{status === "success" && (
							<div className="rounded-full bg-gradient-to-r from-green-500 to-green-600 p-4">
								<Icon icon="solar:check-circle-bold" className="text-white" size={48} />
							</div>
						)}
						{status === "error" && (
							<div className="rounded-full bg-gradient-to-r from-red-500 to-red-600 p-4">
								<Icon icon="solar:close-circle-bold" className="text-white" size={48} />
							</div>
						)}
					</div>

					<div>
						<CardTitle className="text-2xl font-bold text-[#1A1A1A]">
							{status === "loading" && "Confirmando tu email..."}
							{status === "success" && "¡Email Confirmado!"}
							{status === "error" && "Error de Confirmación"}
						</CardTitle>
						<CardDescription className="mt-2 text-[#4A4A4A]">
							{status === "loading" && "Por favor espera mientras verificamos tu cuenta"}
							{status === "success" && "Tu cuenta ha sido activada correctamente"}
							{status === "error" && "Hubo un problema al confirmar tu email"}
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Mensaje detallado */}
					<div
						className={`rounded-lg border p-4 ${
							status === "success"
								? "border-green-200 bg-green-50"
								: status === "error"
									? "border-red-200 bg-red-50"
									: "border-[#A9A9A9]/20 bg-[#F0EBE3]"
						}`}
					>
						<p
							className={`text-sm ${
								status === "success" ? "text-green-700" : status === "error" ? "text-red-700" : "text-[#4A4A4A]"
							}`}
						>
							{message || "Procesando..."}
						</p>
					</div>

					{/* Instrucciones adicionales */}
					{status === "success" && (
						<div className="space-y-2 text-sm text-[#4A4A4A]">
							<p className="font-semibold">¿Qué sigue?</p>
							<ul className="space-y-1 pl-5">
								<li className="flex items-start gap-2">
									<Icon icon="solar:check-circle-bold" size={16} className="mt-0.5 text-green-600" />
									<span>Ya puedes iniciar sesión con tu cuenta</span>
								</li>
								<li className="flex items-start gap-2">
									<Icon icon="solar:check-circle-bold" size={16} className="mt-0.5 text-green-600" />
									<span>Podrás reservar tus viajes a conciertos</span>
								</li>
								<li className="flex items-start gap-2">
									<Icon icon="solar:check-circle-bold" size={16} className="mt-0.5 text-green-600" />
									<span>Accederás a ofertas exclusivas</span>
								</li>
							</ul>
						</div>
					)}

					{status === "error" && (
						<div className="space-y-2 text-sm text-[#4A4A4A]">
							<p className="font-semibold">¿Qué puedes hacer?</p>
							<ul className="space-y-1 pl-5">
								<li className="flex items-start gap-2">
									<Icon icon="solar:info-circle-bold" size={16} className="mt-0.5 text-[#A6402C]" />
									<span>Verifica que el link sea el correcto</span>
								</li>
								<li className="flex items-start gap-2">
									<Icon icon="solar:info-circle-bold" size={16} className="mt-0.5 text-[#A6402C]" />
									<span>El token de confirmación expira en 24 horas</span>
								</li>
								<li className="flex items-start gap-2">
									<Icon icon="solar:info-circle-bold" size={16} className="mt-0.5 text-[#A6402C]" />
									<span>Solicita un nuevo email de confirmación</span>
								</li>
							</ul>
						</div>
					)}

					{/* Botones */}
					<div className="flex flex-col gap-2 pt-4">
						{status === "success" && (
							<Button
								onClick={handleGoToLogin}
								className="w-full bg-gradient-to-r from-[#A6402C] to-[#803549] text-white shadow-lg hover:shadow-xl"
								size="lg"
							>
								<Icon icon="solar:login-2-bold" className="mr-2" size={20} />
								Ir a Iniciar Sesión
							</Button>
						)}

						{status === "error" && (
							<>
								<Button
									onClick={() => window.location.reload()}
									className="w-full bg-gradient-to-r from-[#A6402C] to-[#803549] text-white"
								>
									<Icon icon="solar:refresh-bold" className="mr-2" size={16} />
									Intentar Nuevamente
								</Button>
								<Button
									onClick={handleGoToLogin}
									variant="outline"
									className="w-full border-[#A9A9A9]/30 text-[#4A4A4A]"
								>
									Volver al Login
								</Button>
							</>
						)}

						{status === "loading" && (
							<Button disabled className="w-full">
								<Icon icon="solar:refresh-bold" className="mr-2 animate-spin" size={16} />
								Confirmando...
							</Button>
						)}
					</div>

					{/* Nota de ayuda */}
					<div className="rounded-lg border border-[#A6402C]/20 bg-[#A6402C]/5 p-3 text-xs text-[#803549]">
						<p className="flex items-start gap-2">
							<Icon icon="solar:info-circle-bold" size={14} className="mt-0.5" />
							<span>Si necesitas ayuda, contáctanos a soporte@bustix.com</span>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
