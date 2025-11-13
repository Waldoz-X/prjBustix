import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import userService from "@/api/services/userService";
import type { RegisterDto } from "@/types/user";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { cn } from "@/utils";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";
import { logger } from "@/utils/logger";

function RegisterForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin, setLoginState } = useLoginStateContext();
	const [loading, setLoading] = useState(false);

	const signUpMutation = useMutation({
		mutationFn: userService.register,
		onSuccess: (data) => {
			toast.success(data.message || "Cuenta creada exitosamente. Por favor revisa tu email para confirmar tu cuenta.");
			setLoading(false);
			// Esperar 2 segundos para que el usuario lea el mensaje
			setTimeout(() => {
				backToLogin();
			}, 2000);
		},
		onError: (error: any) => {
			logger.error("Error en registro:", error);
			setLoading(false);

			// Manejar diferentes tipos de errores
			if (error.status === 400) {
				// Errores de validación o usuario duplicado
				if (error.message.includes("already taken")) {
					toast.error("Este email ya está registrado. Por favor usa otro.");
				} else if (error.message.includes("Password")) {
					toast.error("La contraseña no cumple con los requisitos de seguridad.");
				} else if (error.message.includes("rol")) {
					toast.error(error.message);
				} else {
					toast.error(error.message || "Error al registrar. Verifica los datos.");
				}
			} else {
				toast.error("Error al crear la cuenta. Intenta nuevamente.");
			}
		},
	});

	const form = useForm<RegisterDto>({
		defaultValues: {
			emailAddress: "",
			nombreCompleto: "",
			password: "",
			roles: ["User"], // Por defecto User
		},
	});

	const onFinish = async (values: RegisterDto) => {
		logger.debug("RegisterForm values:", values);

		// Validar que las contraseñas coincidan
		const confirmPassword = (form.getValues() as any).confirmPassword;
		if (values.password !== confirmPassword) {
			toast.error("Las contraseñas no coinciden");
			return;
		}

		setLoading(true);

		// Preparar datos para enviar
		const registerData: RegisterDto = {
			emailAddress: values.emailAddress,
			nombreCompleto: values.nombreCompleto,
			password: values.password,
			roles: ["User"],
		};

		await signUpMutation.mutateAsync(registerData);
	};

	if (loginState !== LoginStateEnum.REGISTER) return null;

	return (
		<div className={cn("flex w-full flex-col gap-6")}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
					{/* Email */}
					<FormField
						control={form.control}
						name="emailAddress"
						rules={{
							required: "El email es requerido",
							pattern: {
								value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
								message: "Email inválido",
							},
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" placeholder="tu-email@example.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Nombre Completo */}
					<FormField
						control={form.control}
						name="nombreCompleto"
						rules={{
							required: "El nombre completo es requerido",
							minLength: {
								value: 3,
								message: "Debe tener al menos 3 caracteres",
							},
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nombre Completo</FormLabel>
								<FormControl>
									<Input placeholder="Juan Pérez García" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Contraseña */}
					<FormField
						control={form.control}
						name="password"
						rules={{
							required: "La contraseña es requerida",
							minLength: {
								value: 8,
								message: "Mínimo 8 caracteres",
							},
							pattern: {
								value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
								message: "Debe incluir mayúscula, minúscula, número y símbolo",
							},
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Contraseña</FormLabel>
								<FormControl>
									<Input type="password" placeholder="********" {...field} />
								</FormControl>
								<FormMessage />
								<p className="text-xs text-muted-foreground">
									Incluye mayúscula, minúscula, número y símbolo (@, #, $, %)
								</p>
							</FormItem>
						)}
					/>

					{/* Confirmar Contraseña */}
					<FormField
						control={form.control}
						name={"confirmPassword" as any}
						rules={{
							required: "Confirma tu contraseña",
							validate: (value) => value === form.getValues("password") || "Las contraseñas no coinciden",
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirmar Contraseña</FormLabel>
								<FormControl>
									<Input type="password" placeholder="********" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Botón de Registro */}
					<Button type="submit" className="w-full" disabled={loading}>
						{loading && <Loader2 className="animate-spin mr-2" />}
						{t("sys.login.registerButton")}
					</Button>

					{/* Términos y Condiciones */}
					<div className="text-center text-xs text-muted-foreground">
						<span>Al registrarte, aceptas nuestros </span>
						<Button
							variant="link"
							className="h-auto p-0 text-xs"
							onClick={(e) => {
								e.preventDefault();
								// Aquí podrías abrir un modal con los términos
							}}
						>
							Términos de Servicio
						</Button>
						<span> y </span>
						<Button
							variant="link"
							className="h-auto p-0 text-xs"
							onClick={(e) => {
								e.preventDefault();
								// Aquí podrías abrir un modal con la política
							}}
						>
							Política de Privacidad
						</Button>
					</div>

					{/* Ya tienes cuenta */}
					<div className="text-center text-sm">
						¿Ya tienes cuenta?
						<Button variant="link" onClick={() => setLoginState(LoginStateEnum.LOGIN)} className="px-1">
							{t("sys.login.loginButton")}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

export default RegisterForm;
