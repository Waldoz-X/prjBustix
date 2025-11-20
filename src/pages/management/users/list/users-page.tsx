import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	BadgeCheck,
	BadgeX,
	Check,
	Edit,
	Eye,
	EyeOff,
	Info,
	Loader2,
	Lock,
	LockKeyhole,
	Mail,
	Plus,
	RefreshCw,
	Send,
	ShieldCheck,
	Unlock,
	User,
	UserCog,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import roleService, { type RoleDto } from "@/api/services/roleService";
import userService, {
	type CreateUserDto,
	type UpdateUserStatusDto,
	type UserDto,
	UserStatus,
} from "@/api/services/userService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Progress } from "@/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { handleApiError } from "@/utils/error-handler";

/**
 * Mapeo de estatus a colores (IDs reales de la BD)
 */
const STATUS_CONFIG = {
	[UserStatus.Activo]: {
		label: "Activo",
		variant: "default" as const,
		icon: BadgeCheck,
		color: "text-green-600",
	},
	[UserStatus.Inactivo]: {
		label: "Inactivo",
		variant: "secondary" as const,
		icon: User,
		color: "text-gray-600",
	},
	[UserStatus.Bloqueado]: {
		label: "Bloqueado",
		variant: "destructive" as const,
		icon: Lock,
		color: "text-red-600",
	},
};

export default function UsersPage() {
	const queryClient = useQueryClient();

	// Estados para crear usuario
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [createForm, setCreateForm] = useState<CreateUserDto>({
		emailAddress: "",
		nombreCompleto: "",
		password: "",
		roles: [],
		tipoDocumento: "",
		numeroDocumento: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Estados para cambiar estatus
	const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const [newStatus, setNewStatus] = useState<UserStatus>(UserStatus.Activo);

	// Estado para bloquear usuario
	const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
	const [lockMinutes, setLockMinutes] = useState(30);

	// Estado para editar usuario
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [editForm, setEditForm] = useState<{
		nombreCompleto: string;
		phoneNumber: string;
		tipoDocumento: string;
		numeroDocumento: string;
	}>({
		nombreCompleto: "",
		phoneNumber: "",
		tipoDocumento: "",
		numeroDocumento: "",
	});

	// Estado para ver detalles de usuario
	const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
	const [userDetails, setUserDetails] = useState<UserDto | null>(null);
	const [lockoutInfo, setLockoutInfo] = useState<any>(null);

	// Tab activo para filtrar por estatus
	const [activeTab, setActiveTab] = useState<string>("all");

	// Query para obtener roles disponibles
	const { data: rolesResponse } = useQuery({
		queryKey: ["roles"],
		queryFn: () => roleService.getAll(),
	});

	const availableRoles: RoleDto[] = rolesResponse?.data ?? [];

	// Query para obtener estadísticas
	const { data: stats } = useQuery({
		queryKey: ["user-stats"],
		queryFn: () => userService.getStats(),
	});

	// Query para obtener usuarios según el tab activo
	const {
		data: users = [],
		isLoading: usersLoading,
		error: usersError,
		refetch: refetchUsers,
	} = useQuery({
		queryKey: ["users", activeTab],
		queryFn: async () => {
			console.log("[UsersPage] Fetching users for tab:", activeTab);

			try {
				let result: UserDto[] = [];

				if (activeTab === "all") {
					// Usar la nueva función que obtiene todos los usuarios correctamente
					result = await userService.getAllUsers();
					console.log("[UsersPage] All users fetched:", result.length, result);
				} else if (activeTab === "locked") {
					result = await userService.getLockedUsers();
					console.log("[UsersPage] Locked users fetched:", result.length, result);
				} else {
					const statusId = Number.parseInt(activeTab);
					result = await userService.getUsersByStatus(statusId);
					console.log(`[UsersPage] Users with status ${statusId} fetched:`, result.length, result);
				}

				return result;
			} catch (error) {
				console.error("[UsersPage] ERROR: Error fetching users:", error);
				throw error;
			}
		},
		staleTime: 0, // Siempre refrescar
		retry: 2,
	});

	// Log para depuración
	console.log("[UsersPage] Current users:", users);
	console.log("[UsersPage] Current stats:", stats);
	console.log("[UsersPage] Active tab:", activeTab);

	// Calcular estadísticas localmente desde los usuarios cargados
	const localStats = {
		totalUsers: users?.length || 0,
		activeUsers: users?.filter((u) => u.estatus === UserStatus.Activo).length || 0,
		inactiveUsers: users?.filter((u) => u.estatus === UserStatus.Inactivo).length || 0,
		lockedUsers: users?.filter((u) => u.estatus === UserStatus.Bloqueado).length || 0,
	};

	console.log("[UsersPage] Local calculated stats:", localStats);

	// Query para obtener usuarios en riesgo
	const { data: usersAtRisk, isLoading: usersAtRiskLoading } = useQuery({
		queryKey: ["users-at-risk"],
		queryFn: () => userService.getUsersAtRisk(),
		refetchInterval: 30000, // Refrescar cada 30 segundos
	});

	// Mutation para crear usuario
	const createMutation = useMutation({
		mutationFn: (data: CreateUserDto) => userService.createUser(data),
		onSuccess: () => {
			// Invalidar todas las queries relacionadas para refrescar automáticamente
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["user-stats"] });
			queryClient.invalidateQueries({ queryKey: ["users-at-risk"] });

			// Refrescar inmediatamente los datos
			refetchUsers();

			toast.success("Usuario creado exitosamente", {
				description: "El nuevo usuario ya aparece en la lista",
			});
			setIsCreateOpen(false);
			setCreateForm({
				emailAddress: "",
				nombreCompleto: "",
				password: "",
				roles: [],
				tipoDocumento: "",
				numeroDocumento: "",
			});
			setConfirmPassword("");
			setShowConfirmPassword(false);
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al crear usuario", {
				description: safeError.userMessage,
			});
		},
	});

	// Mutation para cambiar estatus
	const updateStatusMutation = useMutation({
		mutationFn: ({ userId, data }: { userId: string; data: UpdateUserStatusDto }) =>
			userService.updateStatus(userId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["user-stats"] });
			queryClient.invalidateQueries({ queryKey: ["users-at-risk"] });
			refetchUsers();
			toast.success("Estatus actualizado", {
				description: "El estatus del usuario se ha actualizado correctamente",
			});
			setIsStatusDialogOpen(false);
			setSelectedUser(null);
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al actualizar estatus", {
				description: safeError.userMessage,
			});
		},
	});

	// Mutation para bloquear usuario
	const lockMutation = useMutation({
		mutationFn: ({ userId, minutes }: { userId: string; minutes: number }) => userService.lockUser(userId, minutes),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["user-stats"] });
			queryClient.invalidateQueries({ queryKey: ["users-at-risk"] });
			refetchUsers();
			toast.success("Usuario bloqueado", {
				description: "El usuario ha sido bloqueado temporalmente",
			});
			setIsLockDialogOpen(false);
			setSelectedUser(null);
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al bloquear usuario", {
				description: safeError.userMessage,
			});
		},
	});

	// Mutation para desbloquear usuario
	const unlockMutation = useMutation({
		mutationFn: (userId: string) => userService.unlockUser(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["user-stats"] });
			queryClient.invalidateQueries({ queryKey: ["users-at-risk"] });
			refetchUsers();
			toast.success("Usuario desbloqueado", {
				description: "El usuario ha sido desbloqueado correctamente",
			});
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al desbloquear usuario", {
				description: safeError.userMessage,
			});
		},
	});

	// Mutation para resetear intentos fallidos
	const resetAttemptsMutation = useMutation({
		mutationFn: (userId: string) => userService.resetFailedAttempts(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["users-at-risk"] });
			toast.success("Intentos reseteados", {
				description: "Los intentos fallidos han sido reseteados",
			});
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al resetear intentos", {
				description: safeError.userMessage,
			});
		},
	});

	// Mutation para reenviar email de confirmación
	const resendConfirmationMutation = useMutation({
		mutationFn: (email: string) => userService.resendConfirmationEmail(email),
		onSuccess: () => {
			toast.success("Email de confirmación reenviado", {
				description: "El usuario recibirá un nuevo correo con el enlace de verificación",
			});
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al reenviar email", {
				description: safeError.userMessage,
			});
		},
	});

	// Mutation para verificar email directamente (admin)
	const confirmEmailMutation = useMutation({
		mutationFn: (email: string) => userService.confirmEmailDirect(email),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			refetchUsers();
			toast.success("Email verificado exitosamente", {
				description: "El email del usuario ha sido verificado por el administrador",
			});
		},
		onError: (err: any) => {
			console.error("Error al verificar email:", err);
			const safeError = handleApiError(err);
			toast.error("Error al verificar email", {
				description: safeError.userMessage || "No se pudo verificar el email. Verifica los logs para más detalles.",
			});
		},
	});

	// Mutation para actualizar perfil
	const updateProfileMutation = useMutation({
		mutationFn: (data: {
			nombreCompleto: string;
			phoneNumber?: string;
			tipoDocumento?: string;
			numeroDocumento?: string;
		}) => userService.updateProfile(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["user-stats"] });
			refetchUsers();
			toast.success("Perfil actualizado", {
				description: "Los datos del usuario se han actualizado correctamente",
			});
			setIsEditDialogOpen(false);
			setSelectedUser(null);
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al actualizar perfil", {
				description: safeError.userMessage,
			});
		},
	});

	// Requisitos de contraseña y cálculo de fuerza
	const passwordRequirements = [
		{ label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
		{ label: "Una mayúscula (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
		{ label: "Una minúscula (a-z)", test: (p: string) => /[a-z]/.test(p) },
		{ label: "Un número (0-9)", test: (p: string) => /\d/.test(p) },
		{ label: "Un símbolo (!@#$% etc.)", test: (p: string) => /[!@#$%^&*(),.?":{}|<>_-]/.test(p) },
	];
	const passedCount = passwordRequirements.filter((r) => r.test(createForm.password)).length;
	const passwordStrengthPercent = (passedCount / passwordRequirements.length) * 100;
	const passwordValid = passedCount === passwordRequirements.length;
	const passwordMatch =
		createForm.password.length > 0 && confirmPassword.length > 0 && createForm.password === confirmPassword;

	const handleCreateUser = () => {
		if (!createForm.emailAddress || !createForm.nombreCompleto || !createForm.password) {
			toast.error("Campos requeridos", {
				description: "Por favor completa todos los campos obligatorios",
			});
			return;
		}

		if (!passwordValid) {
			const faltantes = passwordRequirements
				.filter((r) => !r.test(createForm.password))
				.map((r) => r.label)
				.join(", ");
			toast.error("Contraseña débil", { description: `Faltan: ${faltantes}` });
			return;
		}

		if (!passwordMatch) {
			toast.error("Las contraseñas no coinciden", { description: "Revisa la confirmación de contraseña" });
			return;
		}

		if (createForm.roles.length === 0) {
			toast.error("Rol requerido", {
				description: "Por favor selecciona al menos un rol",
			});
			return;
		}

		createMutation.mutate(createForm);
	};

	const handleStatusChange = (user: UserDto) => {
		setSelectedUser(user);
		setNewStatus(user.estatus);
		setIsStatusDialogOpen(true);
	};

	const handleSubmitStatusChange = () => {
		if (!selectedUser) return;

		updateStatusMutation.mutate({
			userId: selectedUser.id,
			data: { estatus: newStatus },
		});
	};

	const handleLockUser = (user: UserDto) => {
		setSelectedUser(user);
		setIsLockDialogOpen(true);
	};

	const handleSubmitLock = () => {
		if (!selectedUser) return;

		lockMutation.mutate({
			userId: selectedUser.id,
			minutes: lockMinutes,
		});
	};

	const toggleRoleSelection = (roleName: string) => {
		setCreateForm((prev) => ({
			...prev,
			roles: prev.roles.includes(roleName) ? prev.roles.filter((r) => r !== roleName) : [...prev.roles, roleName],
		}));
	};

	const handleEditUser = (user: UserDto) => {
		setSelectedUser(user);
		setEditForm({
			nombreCompleto: user.nombreCompleto,
			phoneNumber: user.phoneNumber || "",
			tipoDocumento: user.tipoDocumento || "",
			numeroDocumento: user.numeroDocumento || "",
		});
		setIsEditDialogOpen(true);
	};

	const handleSubmitEdit = () => {
		if (!selectedUser) return;
		if (!editForm.nombreCompleto.trim()) {
			toast.error("El nombre completo es requerido");
			return;
		}
		updateProfileMutation.mutate(editForm);
	};

	const handleViewDetails = async (user: UserDto) => {
		setSelectedUser(user);
		setUserDetails(user);
		setIsDetailsDialogOpen(true);

		// Cargar información de bloqueo si existe
		try {
			const info = await userService.getLockoutInfo(user.id);
			setLockoutInfo(info);
		} catch (error) {
			setLockoutInfo(null);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
					<p className="text-muted-foreground mt-2">
						Administra los usuarios del sistema, asigna roles y gestiona estatus
					</p>
				</div>

				{/* Diálogo para crear usuario */}
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Crear Usuario
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Crear Nuevo Usuario</DialogTitle>
							<DialogDescription>Completa la información del nuevo usuario y asigna roles</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="email">
										Email <span className="text-red-500">*</span>
									</Label>
									<Input
										id="email"
										type="email"
										placeholder="usuario@ejemplo.com"
										value={createForm.emailAddress}
										onChange={(e) => setCreateForm({ ...createForm, emailAddress: e.target.value })}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="nombreCompleto">
										Nombre Completo <span className="text-red-500">*</span>
									</Label>
									<Input
										id="nombreCompleto"
										placeholder="Juan Pérez"
										value={createForm.nombreCompleto}
										onChange={(e) => setCreateForm({ ...createForm, nombreCompleto: e.target.value })}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">
									Contraseña <span className="text-red-500">*</span>
								</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="********"
										value={createForm.password}
										onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
										className={passwordValid ? "border-green-500" : createForm.password ? "border-orange-500" : ""}
									/>
									<Button
										variant="ghost"
										size="icon"
										type="button"
										className="absolute right-1 top-1/2 -translate-y-1/2"
										onClick={() => setShowPassword((p) => !p)}
									>
										{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</Button>
								</div>
								<div className="space-y-2 mt-2">
									<Progress value={passwordStrengthPercent} className="h-2" />
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
										{passwordRequirements.map((req) => {
											const ok = req.test(createForm.password);
											return (
												<div key={req.label} className="flex items-center text-xs gap-1">
													{ok ? (
														<BadgeCheck className="h-3 w-3 text-green-600" />
													) : (
														<BadgeX className="h-3 w-3 text-red-500" />
													)}
													<span className={ok ? "text-green-600" : "text-red-500"}>{req.label}</span>
												</div>
											);
										})}
									</div>
									{createForm.password && (
										<p className="text-xs text-muted-foreground mt-1">
											{passwordValid
												? "Contraseña fuerte"
												: passedCount >= 3
													? "Mejorable, agrega lo que falta"
													: "Contraseña muy débil"}
										</p>
									)}
								</div>
							</div>
							{/* Confirmación de contraseña */}
							<div className="space-y-2">
								<Label htmlFor="confirmPassword">
									Confirmar contraseña <span className="text-red-500">*</span>
								</Label>
								<div className="relative">
									<Input
										id="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="Repite la contraseña"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className={passwordMatch || confirmPassword.length === 0 ? "" : "border-red-500"}
									/>
									<Button
										variant="ghost"
										size="icon"
										type="button"
										className="absolute right-1 top-1/2 -translate-y-1/2"
										onClick={() => setShowConfirmPassword((p) => !p)}
									>
										{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</Button>
								</div>
								{confirmPassword.length > 0 && !passwordMatch && (
									<p className="text-xs text-red-600">Las contraseñas no coinciden</p>
								)}
								{passwordMatch && confirmPassword.length > 0 && (
									<p className="text-xs text-green-600 flex items-center gap-1">
										<BadgeCheck className="h-3 w-3" /> Coinciden
									</p>
								)}
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="tipoDocumento">Tipo de Documento</Label>
									<Select
										value={createForm.tipoDocumento}
										onValueChange={(value) => setCreateForm({ ...createForm, tipoDocumento: value })}
									>
										<SelectTrigger>
											<SelectValue placeholder="Seleccionar" />
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
									<Label htmlFor="numeroDocumento">Número de Documento</Label>
									<Input
										id="numeroDocumento"
										placeholder="12345678"
										value={createForm.numeroDocumento}
										onChange={(e) => setCreateForm({ ...createForm, numeroDocumento: e.target.value })}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label>
									Roles <span className="text-red-500">*</span>
								</Label>
								<div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
									{availableRoles.length > 0 ? (
										availableRoles.map((role) => (
											<div key={role.id} className="flex items-center space-x-2">
												<Button
													type="button"
													variant={createForm.roles.includes(role.name) ? "default" : "outline"}
													size="sm"
													className="w-full justify-start"
													onClick={() => toggleRoleSelection(role.name)}
												>
													{createForm.roles.includes(role.name) && <Check className="mr-2 h-4 w-4" />}
													{role.name}
												</Button>
											</div>
										))
									) : (
										<p className="text-sm text-muted-foreground text-center py-4">No hay roles disponibles</p>
									)}
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsCreateOpen(false)}>
								Cancelar
							</Button>
							<Button
								onClick={handleCreateUser}
								disabled={createMutation.isPending || !passwordValid || !passwordMatch}
							>
								{createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Crear Usuario
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Alerta de Usuarios en Riesgo */}
			{!usersAtRiskLoading && usersAtRisk && usersAtRisk.totalUsersAtRisk > 0 && (
				<Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
					<CardHeader>
						<div className="flex items-center gap-3">
							<div className="rounded-full bg-amber-500 p-2">
								<LockKeyhole className="h-5 w-5 text-white" />
							</div>
							<div className="flex-1">
								<CardTitle className="text-lg flex items-center gap-2">
									<span className="text-amber-700 dark:text-amber-400">Alerta de Seguridad</span>
									<Badge variant="destructive" className="animate-pulse">
										{usersAtRisk.totalUsersAtRisk}
									</Badge>
								</CardTitle>
								<CardDescription className="text-amber-600 dark:text-amber-500">
									{usersAtRisk.totalUsersAtRisk === 1
										? "Hay 1 usuario con múltiples intentos fallidos de inicio de sesión"
										: `Hay ${usersAtRisk.totalUsersAtRisk} usuarios con múltiples intentos fallidos de inicio de sesión`}
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{usersAtRisk.usersAtRisk.slice(0, 3).map((user) => (
								<div
									key={user.userId}
									className="flex items-center justify-between p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-amber-950/30"
								>
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
											<User className="h-5 w-5 text-amber-700 dark:text-amber-400" />
										</div>
										<div>
											<p className="text-sm font-medium text-amber-900 dark:text-amber-100">{user.nombreCompleto}</p>
											<p className="text-xs text-amber-600 dark:text-amber-500">{user.email}</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<Badge variant="destructive" className="flex items-center gap-1">
											<LockKeyhole className="h-3 w-3" />
											{user.accessFailedCount} intentos
										</Badge>
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												const userToReset = users.find((u) => u.id === user.userId);
												if (userToReset) {
													resetAttemptsMutation.mutate(user.userId);
												}
											}}
										>
											<RefreshCw className="h-3 w-3 mr-1" />
											Resetear
										</Button>
									</div>
								</div>
							))}
							{usersAtRisk.totalUsersAtRisk > 3 && (
								<p className="text-xs text-center text-amber-600 dark:text-amber-500 pt-2">
									Y {usersAtRisk.totalUsersAtRisk - 3} usuario(s) más en riesgo...
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Estadísticas */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{usersLoading ? (
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
						) : (
							<div className="text-2xl font-bold">{localStats.totalUsers}</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Activos</CardTitle>
						<BadgeCheck className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						{usersLoading ? (
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
						) : (
							<div className="text-2xl font-bold text-green-600">{localStats.activeUsers}</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Inactivos</CardTitle>
						<User className="h-4 w-4 text-gray-600" />
					</CardHeader>
					<CardContent>
						{usersLoading ? (
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
						) : (
							<div className="text-2xl font-bold text-gray-600">{localStats.inactiveUsers}</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
						<Lock className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						{usersLoading ? (
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
						) : (
							<div className="text-2xl font-bold text-red-600">{localStats.lockedUsers}</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Diálogo para cambiar estatus */}
			<Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Cambiar Estatus de Usuario</DialogTitle>
						<DialogDescription>
							Cambiar el estatus de <span className="font-semibold">{selectedUser?.nombreCompleto}</span>
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="status">Nuevo Estatus</Label>
							<Select value={newStatus.toString()} onValueChange={(value) => setNewStatus(Number.parseInt(value))}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={UserStatus.Activo.toString()}>
										<div className="flex items-center gap-2">
											<BadgeCheck className="h-4 w-4 text-green-600" />
											Activo
										</div>
									</SelectItem>
									<SelectItem value={UserStatus.Inactivo.toString()}>
										<div className="flex items-center gap-2">
											<User className="h-4 w-4 text-gray-600" />
											Inactivo
										</div>
									</SelectItem>
									<SelectItem value={UserStatus.Bloqueado.toString()}>
										<div className="flex items-center gap-2">
											<Lock className="h-4 w-4 text-red-600" />
											Bloqueado
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleSubmitStatusChange} disabled={updateStatusMutation.isPending}>
							{updateStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Actualizar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Diálogo para bloquear usuario */}
			<Dialog open={isLockDialogOpen} onOpenChange={setIsLockDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Bloquear Usuario</DialogTitle>
						<DialogDescription>
							Bloquear temporalmente a <span className="font-semibold">{selectedUser?.nombreCompleto}</span>
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="lockMinutes">Duración del Bloqueo (minutos)</Label>
							<Input
								id="lockMinutes"
								type="number"
								min="1"
								value={lockMinutes}
								onChange={(e) => setLockMinutes(Number.parseInt(e.target.value) || 30)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsLockDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleSubmitLock} disabled={lockMutation.isPending} variant="destructive">
							{lockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Bloquear
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Diálogo para editar usuario */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Editar Usuario</DialogTitle>
						<DialogDescription>Actualiza la información del usuario</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="nombreCompleto">Nombre Completo</Label>
								<Input
									id="nombreCompleto"
									placeholder="Juan Pérez"
									value={editForm.nombreCompleto}
									onChange={(e) => setEditForm({ ...editForm, nombreCompleto: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="phoneNumber">Teléfono</Label>
								<Input
									id="phoneNumber"
									placeholder="123456789"
									value={editForm.phoneNumber}
									onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="tipoDocumento">Tipo de Documento</Label>
								<Select
									value={editForm.tipoDocumento}
									onValueChange={(value) => setEditForm({ ...editForm, tipoDocumento: value })}
								>
									<SelectTrigger>
										<SelectValue placeholder="Seleccionar" />
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
								<Label htmlFor="numeroDocumento">Número de Documento</Label>
								<Input
									id="numeroDocumento"
									placeholder="12345678"
									value={editForm.numeroDocumento}
									onChange={(e) => setEditForm({ ...editForm, numeroDocumento: e.target.value })}
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleSubmitEdit} disabled={updateProfileMutation.isPending}>
							{updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Actualizar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Diálogo para ver detalles de usuario */}
			<Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
				<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Info className="h-5 w-5" />
							Detalles del Usuario
						</DialogTitle>
						<DialogDescription>Información completa y detallada del usuario</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						{/* Información Personal */}
						<div className="space-y-4">
							<div className="flex items-center gap-2 text-sm font-semibold text-primary">
								<User className="h-4 w-4" />
								Información Personal
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">Nombre Completo</Label>
									<p className="text-sm font-medium break-words">{userDetails?.nombreCompleto || "No disponible"}</p>
								</div>
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">Correo Electrónico</Label>
									<p className="text-sm font-medium break-all">{userDetails?.email || "No disponible"}</p>
								</div>
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">Teléfono</Label>
									<p className="text-sm">{userDetails?.phoneNumber || "No disponible"}</p>
								</div>
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">Fecha de Registro</Label>
									<p className="text-sm">
										{userDetails?.fechaRegistro
											? new Date(userDetails.fechaRegistro).toLocaleDateString("es-MX", {
													year: "numeric",
													month: "long",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})
											: "No disponible"}
									</p>
								</div>
							</div>
						</div>

						<div className="border-t pt-4" />

						{/* Documentación */}
						<div className="space-y-4">
							<div className="flex items-center gap-2 text-sm font-semibold text-primary">
								<BadgeCheck className="h-4 w-4" />
								Documentación
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">Tipo de Documento</Label>
									<p className="text-sm">{userDetails?.tipoDocumento || "No especificado"}</p>
								</div>
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">Número de Documento</Label>
									<p className="text-sm font-mono">{userDetails?.numeroDocumento || "No especificado"}</p>
								</div>
							</div>
						</div>

						<div className="border-t pt-4" />

						{/* Estado y Permisos */}
						<div className="space-y-4">
							<div className="flex items-center gap-2 text-sm font-semibold text-primary">
								<ShieldCheck className="h-4 w-4" />
								Estado y Permisos
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">Estatus Actual</Label>
									{userDetails && STATUS_CONFIG[userDetails.estatus] && (
										<Badge
											variant={STATUS_CONFIG[userDetails.estatus].variant}
											className="flex items-center gap-1 w-fit"
										>
											{(() => {
												const StatusIcon = STATUS_CONFIG[userDetails.estatus].icon;
												return <StatusIcon className="h-3 w-3" />;
											})()}
											{STATUS_CONFIG[userDetails.estatus].label}
										</Badge>
									)}
								</div>
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">Email Verificado</Label>
									<div className="flex items-center gap-2">
										{userDetails?.emailConfirmed ? (
											<>
												<BadgeCheck className="h-4 w-4 text-green-600" />
												<span className="text-sm text-green-600">Verificado</span>
											</>
										) : (
											<>
												<BadgeX className="h-4 w-4 text-amber-600" />
												<span className="text-sm text-amber-600">Pendiente</span>
											</>
										)}
									</div>
								</div>
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">Teléfono Confirmado</Label>
									<div className="flex items-center gap-2">
										{userDetails?.phoneNumberConfirmed ? (
											<>
												<BadgeCheck className="h-4 w-4 text-green-600" />
												<span className="text-sm text-green-600">Confirmado</span>
											</>
										) : (
											<>
												<BadgeX className="h-4 w-4 text-gray-400" />
												<span className="text-sm text-gray-600">No confirmado</span>
											</>
										)}
									</div>
								</div>
								<div className="space-y-1">
									<Label className="text-xs text-muted-foreground">Intentos Fallidos</Label>
									<div className="flex items-center gap-2">
										{userDetails?.accessFailedCount && userDetails.accessFailedCount > 0 ? (
											<Badge variant="destructive">{userDetails.accessFailedCount}</Badge>
										) : (
											<span className="text-sm text-muted-foreground">0</span>
										)}
									</div>
								</div>
							</div>
						</div>

						<div className="border-t pt-4" />

						{/* Roles */}
						<div className="space-y-4">
							<div className="flex items-center gap-2 text-sm font-semibold text-primary">
								<ShieldCheck className="h-4 w-4" />
								Roles Asignados
							</div>
							<div className="pl-6">
								<div className="flex gap-2 flex-wrap">
									{userDetails && userDetails.roles && userDetails.roles.length > 0 ? (
										userDetails.roles.map((role) => (
											<Badge key={role} variant="secondary" className="text-xs">
												<ShieldCheck className="h-3 w-3 mr-1" />
												{role}
											</Badge>
										))
									) : (
										<span className="text-sm text-muted-foreground">No tiene roles asignados</span>
									)}
								</div>
							</div>
						</div>

						{/* Información de Bloqueo (si aplica) */}
						{lockoutInfo && lockoutInfo.isLockedOut && (
							<>
								<div className="border-t pt-4" />
								<div className="space-y-4">
									<div className="flex items-center gap-2 text-sm font-semibold text-destructive">
										<Lock className="h-4 w-4" />
										Información de Bloqueo
									</div>
									<div className="pl-6">
										<div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-3">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
												<div>
													<Label className="text-xs text-muted-foreground">Fin del Bloqueo</Label>
													<p className="text-sm font-medium">
														{lockoutInfo.lockoutEnd
															? new Date(lockoutInfo.lockoutEnd).toLocaleString("es-MX", {
																	year: "numeric",
																	month: "short",
																	day: "numeric",
																	hour: "2-digit",
																	minute: "2-digit",
																})
															: "Permanente"}
													</p>
												</div>
												<div>
													<Label className="text-xs text-muted-foreground">Intentos Fallidos</Label>
													<p className="text-sm font-medium">{lockoutInfo.accessFailedCount}</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							</>
						)}
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
							<X className="mr-2 h-4 w-4" />
							Cerrar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Tabs de usuarios */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">
						<Users className="mr-2 h-4 w-4" />
						Todos
					</TabsTrigger>
					<TabsTrigger value={UserStatus.Activo.toString()}>
						<BadgeCheck className="mr-2 h-4 w-4" />
						Activos
					</TabsTrigger>
					<TabsTrigger value={UserStatus.Inactivo.toString()}>
						<User className="mr-2 h-4 w-4" />
						Inactivos
					</TabsTrigger>
					<TabsTrigger value={UserStatus.Bloqueado.toString()}>
						<Lock className="mr-2 h-4 w-4" />
						Bloqueados
					</TabsTrigger>
					<TabsTrigger value="locked">
						<Lock className="mr-2 h-4 w-4" />
						Bloqueados Temp
					</TabsTrigger>
				</TabsList>

				<TabsContent value={activeTab} className="space-y-4">
					{usersLoading ? (
						<div className="flex items-center justify-center min-h-[400px]">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : users.length > 0 ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{users.map((user) => {
								const statusConfig = STATUS_CONFIG[user.estatus];
								const StatusIcon = statusConfig.icon;

								return (
									<Card key={user.id} className="hover:shadow-lg transition-shadow">
										<CardHeader>
											<div className="flex items-start justify-between">
												<div className="flex items-center gap-2">
													<UserCog className="h-5 w-5 text-primary" />
													<div>
														<CardTitle className="text-lg">{user.nombreCompleto}</CardTitle>
														<CardDescription className="text-xs">{user.email}</CardDescription>
													</div>
												</div>
												<Badge variant={statusConfig.variant} className="flex items-center gap-1">
													<StatusIcon className="h-3 w-3" />
													{statusConfig.label}
												</Badge>
											</div>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-muted-foreground">Roles:</span>
													<div className="flex gap-1 flex-wrap justify-end">
														{user.roles.length > 0 ? (
															user.roles.map((role) => (
																<Badge key={role} variant="secondary" className="text-xs">
																	{role}
																</Badge>
															))
														) : (
															<span className="text-xs text-muted-foreground">Sin roles</span>
														)}
													</div>
												</div>
												{user.phoneNumber && (
													<div className="flex justify-between">
														<span className="text-muted-foreground">Teléfono:</span>
														<span>{user.phoneNumber}</span>
													</div>
												)}
												{user.numeroDocumento && (
													<div className="flex justify-between">
														<span className="text-muted-foreground">Documento:</span>
														<span>
															{user.tipoDocumento} - {user.numeroDocumento}
														</span>
													</div>
												)}
												<div className="flex justify-between">
													<span className="text-muted-foreground">Email verificado:</span>
													<span>
														{user.emailConfirmed ? (
															<BadgeCheck className="h-4 w-4 text-green-600" />
														) : (
															<BadgeX className="h-4 w-4 text-red-600" />
														)}
													</span>
												</div>
												{user.accessFailedCount > 0 && (
													<div className="flex justify-between">
														<span className="text-muted-foreground">Intentos fallidos:</span>
														<Badge variant="destructive">{user.accessFailedCount}</Badge>
													</div>
												)}
											</div>

											<div className="flex gap-2 pt-2 flex-wrap">
												<Button variant="outline" size="sm" onClick={() => handleStatusChange(user)} className="flex-1">
													<UserCog className="mr-1 h-3 w-3" />
													Estatus
												</Button>
												<Button variant="outline" size="sm" onClick={() => handleLockUser(user)} className="flex-1">
													<LockKeyhole className="mr-1 h-3 w-3" />
													Bloquear
												</Button>
												{user.accessFailedCount > 0 && (
													<Button
														variant="outline"
														size="sm"
														onClick={() => resetAttemptsMutation.mutate(user.id)}
														disabled={resetAttemptsMutation.isPending}
														className="flex-1"
													>
														{resetAttemptsMutation.isPending ? (
															<Loader2 className="mr-1 h-3 w-3 animate-spin" />
														) : (
															<RefreshCw className="mr-1 h-3 w-3" />
														)}
														Reset
													</Button>
												)}
												{activeTab === "locked" && (
													<Button
														variant="default"
														size="sm"
														onClick={() => unlockMutation.mutate(user.id)}
														disabled={unlockMutation.isPending}
														className="flex-1"
													>
														{unlockMutation.isPending ? (
															<Loader2 className="mr-1 h-3 w-3 animate-spin" />
														) : (
															<Unlock className="mr-1 h-3 w-3" />
														)}
														Desbloquear
													</Button>
												)}

												{/* Botones de verificación de email */}
												{!user.emailConfirmed && (
													<>
														<Button
															variant="outline"
															size="sm"
															onClick={() => resendConfirmationMutation.mutate(user.email)}
															disabled={resendConfirmationMutation.isPending}
															className="flex-1"
															title="Reenviar email de confirmación al usuario"
														>
															{resendConfirmationMutation.isPending ? (
																<Loader2 className="mr-1 h-3 w-3 animate-spin" />
															) : (
																<Send className="mr-1 h-3 w-3" />
															)}
															Reenviar
														</Button>
														<Button
															variant="default"
															size="sm"
															onClick={() => confirmEmailMutation.mutate(user.email)}
															disabled={confirmEmailMutation.isPending}
															className="flex-1 bg-green-600 hover:bg-green-700"
															title="Verificar email manualmente (admin)"
														>
															{confirmEmailMutation.isPending ? (
																<Loader2 className="mr-1 h-3 w-3 animate-spin" />
															) : (
																<Mail className="mr-1 h-3 w-3" />
															)}
															Verificar
														</Button>
													</>
												)}

												<Button variant="outline" size="sm" onClick={() => handleEditUser(user)} className="flex-1">
													<Edit className="mr-1 h-3 w-3" />
													Editar
												</Button>
												<Button variant="outline" size="sm" onClick={() => handleViewDetails(user)} className="flex-1">
													<Info className="mr-1 h-3 w-3" />
													Detalles
												</Button>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</div>
					) : (
						<Card>
							<CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
								<Users className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-semibold mb-2">No hay usuarios en esta categoría</h3>

								{/* Información de depuración */}
								<div className="text-xs text-muted-foreground space-y-1">
									<p>
										Tab activo: <span className="font-mono font-bold">{activeTab}</span>
									</p>
									<p>
										Total en array: <span className="font-mono font-bold">{users?.length || 0}</span>
									</p>
									<p>
										Stats total: <span className="font-mono font-bold">{stats?.totalUsers || 0}</span>
									</p>
									{usersError && <p className="text-red-600">Error: {(usersError as any).message}</p>}
								</div>

								<div className="flex gap-2">
									<Button onClick={() => refetchUsers()} variant="outline">
										<RefreshCw className="mr-2 h-4 w-4" />
										Recargar
									</Button>
									<Button onClick={() => setIsCreateOpen(true)}>
										<Plus className="mr-2 h-4 w-4" />
										Crear Usuario
									</Button>
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
