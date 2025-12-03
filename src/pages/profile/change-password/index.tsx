import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import userService from "@/api/services/userService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { handleApiError } from "@/utils/error-handler";

// Schema de validación
const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "La contraseña actual es requerida"),
		newPassword: z
			.string()
			.min(6, "La contraseña debe tener al menos 6 caracteres")
			.regex(/[A-Z]/, "Debe contener al menos una mayúscula")
			.regex(/[a-z]/, "Debe contener al menos una minúscula")
			.regex(/[0-9]/, "Debe contener al menos un número")
			.regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Las contraseñas no coinciden",
		path: ["confirmPassword"],
	});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// 1. Obtener email del usuario actual
	const { data: profile, isLoading: isLoadingProfile } = useQuery({
		queryKey: ["me-profile"],
		queryFn: () => userService.getMeProfile(),
	});

	const form = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	// 2. Mutation para cambiar contraseña
	const changePasswordMutation = useMutation({
		mutationFn: (data: ChangePasswordFormValues) => {
			if (!profile?.email) throw new Error("No se pudo obtener el email del usuario");
			return userService.changePassword({
				email: profile.email,
				currentPassword: data.currentPassword,
				newPassword: data.newPassword,
			});
		},
		onSuccess: () => {
			toast.success("Contraseña actualizada", {
				description: "Tu contraseña ha sido modificada exitosamente",
			});
			form.reset();
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al cambiar contraseña", {
				description: safeError.userMessage,
			});
		},
	});

	const onSubmit = (data: ChangePasswordFormValues) => {
		changePasswordMutation.mutate(data);
	};

	if (isLoadingProfile) {
		return (
			<div className="flex h-[50vh] items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-bold flex items-center gap-2">
					<Lock className="h-8 w-8" />
					Cambiar Contraseña
				</h1>
				<p className="text-muted-foreground mt-2">Actualiza tu contraseña de acceso</p>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Nueva Contraseña</CardTitle>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
								<FormField
									control={form.control}
									name="currentPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Contraseña Actual</FormLabel>
											<div className="relative">
												<FormControl>
													<Input
														type={showCurrentPassword ? "text" : "password"}
														placeholder="Ingresa tu contraseña actual"
														{...field}
													/>
												</FormControl>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
													onClick={() => setShowCurrentPassword(!showCurrentPassword)}
												>
													{showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
												</Button>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="newPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nueva Contraseña</FormLabel>
											<div className="relative">
												<FormControl>
													<Input
														type={showNewPassword ? "text" : "password"}
														placeholder="Ingresa tu nueva contraseña"
														{...field}
													/>
												</FormControl>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
													onClick={() => setShowNewPassword(!showNewPassword)}
												>
													{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
												</Button>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirmar Nueva Contraseña</FormLabel>
											<div className="relative">
												<FormControl>
													<Input
														type={showConfirmPassword ? "text" : "password"}
														placeholder="Confirma tu nueva contraseña"
														{...field}
													/>
												</FormControl>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
													onClick={() => setShowConfirmPassword(!showConfirmPassword)}
												>
													{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
												</Button>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button className="w-full" type="submit" disabled={changePasswordMutation.isPending}>
									{changePasswordMutation.isPending ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<Shield className="mr-2 h-4 w-4" />
									)}
									Cambiar Contraseña
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Requisitos</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								Mínimo 6 caracteres
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								Al menos una letra mayúscula
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								Al menos una letra minúscula
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								Al menos un número
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								Al menos un carácter especial
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
