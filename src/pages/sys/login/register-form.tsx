import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Eye, EyeOff, Loader2, Mail, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import userService from "@/api/services/userService";
import type { RegisterDto } from "@/types/user";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Progress } from "@/ui/progress";
import { cn } from "@/utils";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";
import { logger } from "@/utils/logger";

function RegisterForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin, setLoginState } = useLoginStateContext();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const signUpMutation = useMutation<{ message?: string }, Error, RegisterDto>({
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

	// Requisitos de contraseña
	const password = form.watch("password") || "";
	const confirmPassword = form.watch("confirmPassword" as any) || "";

	const passwordRequirements = [
		{ label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
		{ label: "Una mayúscula (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
		{ label: "Una minúscula (a-z)", test: (p: string) => /[a-z]/.test(p) },
		{ label: "Un número (0-9)", test: (p: string) => /\d/.test(p) },
		{ label: "Un símbolo (@#$%)", test: (p: string) => /[@$!%*?&#]/.test(p) },
	];

	const passedCount = passwordRequirements.filter((r) => r.test(password)).length;
	const passwordStrength = (passedCount / passwordRequirements.length) * 100;
	const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

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
								<FormLabel className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-primary" />
									Email
								</FormLabel>
								<FormControl>
									<div className="relative">
										<Input type="email" placeholder="tu-email@example.com" className="pl-10" {...field} />
										<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									</div>
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
								<FormLabel className="flex items-center gap-2">
									<User className="h-4 w-4 text-primary" />
									Nombre Completo
								</FormLabel>
								<FormControl>
									<div className="relative">
										<Input placeholder="Juan Pérez García" className="pl-10" {...field} />
										<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									</div>
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
								<FormLabel className="flex items-center gap-2">
									<ShieldCheck className="h-4 w-4 text-primary" />
									Contraseña
								</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											type={showPassword ? "text" : "password"}
											placeholder="********"
											className="pr-10"
											{...field}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4 text-muted-foreground" />
											) : (
												<Eye className="h-4 w-4 text-muted-foreground" />
											)}
										</Button>
									</div>
								</FormControl>

								{/* Barra de progreso de fuerza */}
								{password && (
									<div className="space-y-2 mt-2">
										<div className="flex items-center gap-2">
											<Progress
												value={passwordStrength}
												className={cn(
													"h-2",
													passwordStrength < 40 && "[&>div]:bg-red-500",
													passwordStrength >= 40 && passwordStrength < 80 && "[&>div]:bg-yellow-500",
													passwordStrength >= 80 && "[&>div]:bg-green-500",
												)}
											/>
											<span className="text-xs text-muted-foreground whitespace-nowrap">
												{passwordStrength < 40 && "Débil"}
												{passwordStrength >= 40 && passwordStrength < 80 && "Media"}
												{passwordStrength >= 80 && "Fuerte"}
											</span>
										</div>

										{/* Requisitos */}
										<div className="grid grid-cols-1 gap-1">
											{passwordRequirements.map((req) => {
												const passed = req.test(password);
												return (
													<div key={req.label} className="flex items-center gap-2 text-xs">
														{passed ? (
															<CheckCircle2 className="h-3 w-3 text-green-600" />
														) : (
															<div className="h-3 w-3 rounded-full border border-muted-foreground" />
														)}
														<span
															className={cn("transition-colors", passed ? "text-green-600" : "text-muted-foreground")}
														>
															{req.label}
														</span>
													</div>
												);
											})}
										</div>
									</div>
								)}
								<FormMessage />
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
								<FormLabel className="flex items-center gap-2">
									<ShieldCheck className="h-4 w-4 text-primary" />
									Confirmar Contraseña
								</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											type={showConfirmPassword ? "text" : "password"}
											placeholder="********"
											className="pr-10"
											{...field}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										>
											{showConfirmPassword ? (
												<EyeOff className="h-4 w-4 text-muted-foreground" />
											) : (
												<Eye className="h-4 w-4 text-muted-foreground" />
											)}
										</Button>
									</div>
								</FormControl>

								{/* Indicador de coincidencia */}
								{confirmPassword && (
									<div className="flex items-center gap-2 mt-2">
										{passwordsMatch ? (
											<>
												<CheckCircle2 className="h-4 w-4 text-green-600" />
												<span className="text-xs text-green-600">Las contraseñas coinciden</span>
											</>
										) : (
											<>
												<div className="h-4 w-4 rounded-full border-2 border-red-500" />
												<span className="text-xs text-red-600">Las contraseñas no coinciden</span>
											</>
										)}
									</div>
								)}
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Botón de Registro */}
					<Button type="submit" className="w-full" disabled={loading || !passwordsMatch || passwordStrength < 80}>
						{loading ? (
							<>
								<Loader2 className="animate-spin mr-2 h-4 w-4" />
								Creando cuenta...
							</>
						) : (
							<>
								<CheckCircle2 className="mr-2 h-4 w-4" />
								{t("sys.login.registerButton")}
							</>
						)}
					</Button>

					{/* Términos y Condiciones */}
					<div className="text-center text-xs text-muted-foreground">
						<span>Al registrarte, aceptas nuestros </span>
						<Button
							variant="link"
							className="h-auto p-0 text-xs"
							onClick={(e) => {
								e.preventDefault();
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
