import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import userService, { type CreateUserDto } from "@/api/services/userService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { handleApiError } from "@/utils/error-handler";

interface CreateUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	allowedRoles: any[];
}

export function CreateUserDialog({ open, onOpenChange, allowedRoles }: CreateUserDialogProps) {
	const queryClient = useQueryClient();
	const [emailAddress, setEmailAddress] = useState("");
	const [password, setPassword] = useState("");
	const [nombreCompleto, setNombreCompleto] = useState("");
	const [tipoDocumento, setTipoDocumento] = useState("DNI");
	const [numeroDocumento, setNumeroDocumento] = useState("");
	const [selectedRoleId, setSelectedRoleId] = useState("");

	const createUserMutation = useMutation({
		mutationFn: userService.createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["user-stats"] });
			toast.success("Usuario creado exitosamente");
			onOpenChange(false);
			resetForm();
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al crear usuario", { description: safe.userMessage });
		},
	});

	const resetForm = () => {
		setEmailAddress("");
		setPassword("");
		setNombreCompleto("");
		setTipoDocumento("DNI");
		setNumeroDocumento("");
		setSelectedRoleId("");
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validaciones básicas
		if (!emailAddress || !password || !nombreCompleto) {
			toast.error("Por favor completa todos los campos requeridos");
			return;
		}

		if (!selectedRoleId) {
			toast.error("Por favor selecciona un rol");
			return;
		}

		const formData: CreateUserDto = {
			emailAddress,
			password,
			nombreCompleto,
			tipoDocumento,
			numeroDocumento,
			roles: [selectedRoleId],
		};

		createUserMutation.mutate(formData);
	};
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Crear Nuevo Usuario</DialogTitle>
					<DialogDescription>Crear un nuevo operador o miembro del staff</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="nombreCompleto">
								Nombre Completo <span className="text-red-500">*</span>
							</Label>
							<Input
								id="nombreCompleto"
								value={nombreCompleto}
								onChange={(e) => setNombreCompleto(e.target.value)}
								placeholder="Juan Pérez García"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">
								Email <span className="text-red-500">*</span>
							</Label>
							<Input
								id="email"
								type="email"
								value={emailAddress}
								onChange={(e) => setEmailAddress(e.target.value)}
								placeholder="usuario@ejemplo.com"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">
								Contraseña <span className="text-red-500">*</span>
							</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
							/>
							<p className="text-xs text-muted-foreground">
								Mínimo 8 caracteres, incluye mayúsculas, números y símbolos
							</p>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="tipoDocumento">Tipo Documento</Label>
								<Select value={tipoDocumento} onValueChange={setTipoDocumento}>
									<SelectTrigger id="tipoDocumento">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="DNI">DNI</SelectItem>
										<SelectItem value="Pasaporte">Pasaporte</SelectItem>
										<SelectItem value="Licencia">Licencia</SelectItem>
										<SelectItem value="Otro">Otro</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="numeroDocumento">N° Documento</Label>
								<Input
									id="numeroDocumento"
									value={numeroDocumento}
									onChange={(e) => setNumeroDocumento(e.target.value)}
									placeholder="12345678"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="roleId">
								Rol <span className="text-red-500">*</span>
							</Label>
							<Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
								<SelectTrigger id="roleId">
									<SelectValue placeholder="Selecciona un rol" />
								</SelectTrigger>
								<SelectContent>
									{allowedRoles.map((role: any) => (
										<SelectItem key={role.id} value={role.id}>
											{role.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								onOpenChange(false);
								resetForm();
							}}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={createUserMutation.isPending}>
							{createUserMutation.isPending ? "Creando..." : "Crear Usuario"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
