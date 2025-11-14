import { useMutation } from "@tanstack/react-query";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import userService from "@/api/services/userService";
import type { RegisterDto } from "@/types/user";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { handleApiError } from "@/utils/error-handler";

/**
 * Tipos de documento válidos
 */
const DOCUMENT_TYPES = [
	{ value: "INE", label: "INE (Credencial para Votar)" },
	{ value: "Pasaporte", label: "Pasaporte" },
	{ value: "Licencia", label: "Licencia de Conducir" },
	{ value: "CURP", label: "CURP" },
	{ value: "RFC", label: "RFC" },
	{ value: "Otro", label: "Otro" },
];

interface RegisterFormProps {
	onSuccess?: () => void;
	showRoleSelector?: boolean;
	defaultRole?: string;
}

export function RegisterForm({ onSuccess, showRoleSelector = false, defaultRole = "User" }: RegisterFormProps) {
	const [selectedDocType, setSelectedDocType] = useState("INE");

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<RegisterDto>({
		defaultValues: {
			roles: [defaultRole],
			tipoDocumento: "INE",
		},
	});

	const registerMutation = useMutation<{ message?: string }, Error, RegisterDto>({
		mutationFn: (data: RegisterDto) => userService.register(data),
		onSuccess: (response) => {
			toast.success("Registro exitoso", {
				description: response.message || "Usuario creado correctamente",
			});
			reset();
			onSuccess?.();
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al registrar", {
				description: safeError.userMessage,
			});
		},
	});

	const onSubmit = (data: RegisterDto) => {
		// Agregar tipo de documento seleccionado
		const payload: RegisterDto = {
			...data,
			tipoDocumento: selectedDocType,
			roles: showRoleSelector ? data.roles : [defaultRole],
		};

		registerMutation.mutate(payload);
	};

	return (
		<Card className="w-full max-w-2xl">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<UserPlus className="h-5 w-5" />
					Registro de Usuario
				</CardTitle>
				<CardDescription>Completa los datos para crear una nueva cuenta</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{/* Nombre Completo */}
					<div className="space-y-2">
						<Label htmlFor="nombreCompleto">
							Nombre Completo <span className="text-red-500">*</span>
						</Label>
						<Input
							id="nombreCompleto"
							placeholder="Juan Pérez García"
							{...register("nombreCompleto", {
								required: "El nombre completo es requerido",
								minLength: { value: 3, message: "Mínimo 3 caracteres" },
							})}
						/>
						{errors.nombreCompleto && <p className="text-sm text-red-600">{errors.nombreCompleto.message}</p>}
					</div>

					{/* Email */}
					<div className="space-y-2">
						<Label htmlFor="emailAddress">
							Correo Electrónico <span className="text-red-500">*</span>
						</Label>
						<Input
							id="emailAddress"
							type="email"
							placeholder="usuario@ejemplo.com"
							{...register("emailAddress", {
								required: "El email es requerido",
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: "Email inválido",
								},
							})}
						/>
						{errors.emailAddress && <p className="text-sm text-red-600">{errors.emailAddress.message}</p>}
					</div>

					{/* Contraseña */}
					<div className="space-y-2">
						<Label htmlFor="password">
							Contraseña <span className="text-red-500">*</span>
						</Label>
						<Input
							id="password"
							type="password"
							placeholder="Mínimo 8 caracteres"
							{...register("password", {
								required: "La contraseña es requerida",
								minLength: { value: 8, message: "Mínimo 8 caracteres" },
								pattern: {
									value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
									message: "Debe contener mayúscula, minúscula, número y símbolo",
								},
							})}
						/>
						{errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
						<p className="text-xs text-muted-foreground">
							Debe incluir mayúsculas, minúsculas, números y símbolos (@$!%*?&)
						</p>
					</div>

					{/* Tipo de Documento */}
					<div className="space-y-2">
						<Label htmlFor="tipoDocumento">
							Tipo de Documento <span className="text-red-500">*</span>
						</Label>
						<Select value={selectedDocType} onValueChange={setSelectedDocType}>
							<SelectTrigger id="tipoDocumento">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{DOCUMENT_TYPES.map((type) => (
									<SelectItem key={type.value} value={type.value}>
										{type.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Número de Documento */}
					<div className="space-y-2">
						<Label htmlFor="numeroDocumento">
							Número de Documento <span className="text-red-500">*</span>
						</Label>
						<Input
							id="numeroDocumento"
							placeholder="1234567890"
							{...register("numeroDocumento", {
								required: "El número de documento es requerido",
								minLength: { value: 5, message: "Mínimo 5 caracteres" },
							})}
						/>
						{errors.numeroDocumento && <p className="text-sm text-red-600">{errors.numeroDocumento.message}</p>}
						<p className="text-xs text-muted-foreground">Ingresa el número de tu {selectedDocType}</p>
					</div>

					{/* Selector de Rol (solo si está habilitado) */}
					{showRoleSelector && (
						<div className="space-y-2">
							<Label htmlFor="roles" className="flex items-center gap-2">
								<ShieldCheck className="h-4 w-4" />
								Roles
							</Label>
							<Select
								defaultValue={defaultRole}
								onValueChange={(value) => register("roles").onChange({ target: { value: [value] } })}
							>
								<SelectTrigger id="roles">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="User">Usuario</SelectItem>
									<SelectItem value="Manager">Manager</SelectItem>
									<SelectItem value="Admin">Administrador</SelectItem>
								</SelectContent>
							</Select>
						</div>
					)}

					{/* Botón de Registro */}
					<Button type="submit" className="w-full" disabled={registerMutation.isPending}>
						{registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Registrar Usuario
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
