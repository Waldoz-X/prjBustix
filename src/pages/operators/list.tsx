import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	BadgeCheck,
	BarChart3,
	Filter,
	Loader2,
	Lock,
	LockKeyhole,
	type LucideIcon,
	Mail,
	Plus,
	Search,
	Settings,
	Shield,
	User,
	UserCheck,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import roleService from "@/api/services/roleService";
import userService, { type UpdateUserStatusDto, type UserDto, UserStatus } from "@/api/services/userService";
import { useHasRole } from "@/hooks/use-session";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { handleApiError } from "@/utils/error-handler";

// import { CreateUserDialog } from "./components/create-user-dialog";

// Improved type safety for status config
interface StatusConfigItem {
	variant: "default" | "secondary" | "destructive" | "outline";
	label: string;
	color: string;
	icon: LucideIcon;
}

const STATUS_CONFIG: Record<number, StatusConfigItem> = {
	[UserStatus.Activo]: { variant: "default", label: "Activo", color: "text-green-600", icon: BadgeCheck },
	[UserStatus.Inactivo]: { variant: "secondary", label: "Inactivo", color: "text-gray-600", icon: User },
	[UserStatus.Bloqueado]: { variant: "destructive", label: "Bloqueado", color: "text-red-600", icon: Lock },
};

export default function OperatorsListPage() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isAdmin || isManager;

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<number | "all">("all");
	// const [isCreateOpen, setIsCreateOpen] = useState(false);

	// Estados para acciones de usuario
	const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
	const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
	const [selectedRoleId, setSelectedRoleId] = useState<string>("");

	// Estado para bloquear usuario
	const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
	const [lockMinutes, setLockMinutes] = useState(30);

	// Queries
	const { data: users = [], isLoading: usersLoading } = useQuery({
		queryKey: ["users"],
		queryFn: userService.getAllUsers,
		retry: 1,
	});

	const { data: rolesResp } = useQuery({
		queryKey: ["roles"],
		queryFn: async () => {
			const res = await roleService.getAll();
			if (res && (res as any).data) return (res as any).data;
			return Array.isArray(res) ? res : [];
		},
		retry: 1,
	});

	const { data: statuses = [] } = useQuery({
		queryKey: ["user-statuses"],
		queryFn: userService.getStatuses,
		retry: 1,
	});

	const { data: stats } = useQuery({
		queryKey: ["user-stats"],
		queryFn: userService.getStats,
		retry: 1,
	});

	// Filtrar roles permitidos (Operator_* y Staff)
	const allowedRoles = useMemo(() => {
		if (!rolesResp) return [];
		return rolesResp.filter((r: any) => r.name?.startsWith("Operator_") || r.name === "Staff");
	}, [rolesResp]);

	// Filtrar usuarios que tengan al menos un rol permitido
	const targetUsers = useMemo(() => {
		return users.filter((u) => u.roles?.some((r) => r.startsWith("Operator_") || r === "Staff"));
	}, [users]);

	// Aplicar filtros de búsqueda y estatus
	const filteredUsers = useMemo(() => {
		let filtered = targetUsers;

		if (statusFilter !== "all") {
			filtered = filtered.filter((u) => u.estatus === statusFilter);
		}

		if (searchTerm) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(u) =>
					u.nombreCompleto.toLowerCase().includes(term) ||
					u.email.toLowerCase().includes(term) ||
					u.numeroDocumento?.toLowerCase().includes(term),
			);
		}

		return filtered;
	}, [targetUsers, statusFilter, searchTerm]);

	// Mutations
	const assignRoleMutation = useMutation({
		mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
			roleService.assignToUser({ userId, roleId }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("Rol asignado exitosamente");
			setIsAssignRoleOpen(false);
			setSelectedUser(null);
			setSelectedRoleId("");
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al asignar rol", { description: safe.userMessage });
		},
	});

	const removeRoleMutation = useMutation({
		mutationFn: ({ roleId, userId }: { roleId: string; userId: string }) => roleService.removeFromUser(roleId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("Rol removido exitosamente");
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al remover rol", { description: safe.userMessage });
		},
	});

	const updateStatusMutation = useMutation({
		mutationFn: ({ userId, data }: { userId: string; data: UpdateUserStatusDto }) =>
			userService.updateStatus(userId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["user-stats"] });
			toast.success("Estatus actualizado");
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al actualizar estatus", { description: safe.userMessage });
		},
	});

	const lockMutation = useMutation({
		mutationFn: ({ userId, minutes }: { userId: string; minutes: number }) => userService.lockUser(userId, minutes),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("Usuario bloqueado temporalmente");
			setIsLockDialogOpen(false);
			setSelectedUser(null);
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al bloquear usuario", { description: safe.userMessage });
		},
	});

	const unlockMutation = useMutation({
		mutationFn: (userId: string) => userService.unlockUser(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("Usuario desbloqueado");
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al desbloquear usuario", { description: safe.userMessage });
		},
	});

	const resetAttemptsMutation = useMutation({
		mutationFn: (userId: string) => userService.resetFailedAttempts(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("Intentos reseteados");
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al resetear intentos", { description: safe.userMessage });
		},
	});

	const resendConfirmationMutation = useMutation({
		mutationFn: (email: string) => userService.resendConfirmationEmail(email),
		onSuccess: () => {
			toast.success("Email de confirmación reenviado");
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al reenviar email", { description: safe.userMessage });
		},
	});

	const handleOpenAssignRole = (user: UserDto) => {
		setSelectedUser(user);
		setSelectedRoleId("");
		setIsAssignRoleOpen(true);
	};

	const handleAssignRole = () => {
		if (!selectedUser || !selectedRoleId) {
			toast.error("Selecciona un rol");
			return;
		}
		assignRoleMutation.mutate({ userId: selectedUser.id, roleId: selectedRoleId });
	};

	const handleRemoveRole = (user: UserDto, roleName: string) => {
		if (!confirm(`¿Remover rol "${roleName}" del usuario ${user.nombreCompleto}?`)) return;

		// Buscar el roleId correspondiente
		const role = allowedRoles.find((r: any) => r.name === roleName);
		// Si no está en allowedRoles, buscar en todos los roles (por si tiene roles antiguos)
		const roleId = role?.id || rolesResp?.find((r: any) => r.name === roleName)?.id;

		if (!roleId) {
			toast.error("No se encontró el ID del rol");
			return;
		}

		removeRoleMutation.mutate({ roleId, userId: user.id });
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

	if (!allowed) {
		return (
			<div className="p-6">
				<Card>
					<CardHeader>
						<CardTitle>Acceso denegado</CardTitle>
					</CardHeader>
					<CardContent>
						<p>No tienes permisos para ver esta página.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Users className="h-8 w-8" />
						Staff y Operadores
					</h1>
					<p className="text-muted-foreground mt-2">Gestión de personal operativo y staff</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => navigate("/operators/roles")}>
						<Settings className="mr-2 h-4 w-4" />
						Gestionar Roles
					</Button>
					{/* TODO: Crear componente CreateUserDialog */}
					{/* <Button onClick={() => setIsCreateOpen(true)}>
						<Plus className="mr-2 h-4 w-4" />
						Nuevo Usuario
					</Button> */}
				</div>
			</div>

			{/* Tabs principales */}
			<Tabs defaultValue="list" className="space-y-6">
				<TabsList>
					<TabsTrigger value="list">
						<Users className="mr-2 h-4 w-4" />
						Lista de Personal
					</TabsTrigger>
					<TabsTrigger value="stats">
						<BarChart3 className="mr-2 h-4 w-4" />
						Estadísticas
					</TabsTrigger>
				</TabsList>

				{/* Tab: Lista */}
				<TabsContent value="list" className="space-y-4">
					{/* Filtros */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Filtros</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="search">
										<Search className="inline mr-2 h-4 w-4" />
										Buscar
									</Label>
									<Input
										id="search"
										placeholder="Nombre, email o documento..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="statusFilter">
										<Filter className="inline mr-2 h-4 w-4" />
										Estatus
									</Label>
									<Select
										value={statusFilter.toString()}
										onValueChange={(val) => setStatusFilter(val === "all" ? "all" : Number(val))}
									>
										<SelectTrigger id="statusFilter">
											<SelectValue placeholder="Todos" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Todos</SelectItem>
											{statuses?.map((status) => (
												<SelectItem key={status.id} value={status.id.toString()}>
													{status.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="mt-4 text-sm text-muted-foreground">
								Mostrando {filteredUsers.length} de {targetUsers.length} usuarios
							</div>
						</CardContent>
					</Card>

					{/* Lista de usuarios */}
					<Card>
						<CardContent className="p-0">
							{usersLoading ? (
								<div className="flex items-center justify-center min-h-[200px]">
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
								</div>
							) : filteredUsers.length > 0 ? (
								<div className="divide-y">
									{filteredUsers.map((user) => (
										<div key={user.id} className="p-6 hover:bg-muted/50 transition-colors">
											<div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
												<div className="flex-1 space-y-3">
													{/* Header Usuario */}
													<div className="flex items-start gap-3">
														<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
															<Shield className="h-5 w-5 text-primary" />
														</div>
														<div>
															<h3 className="text-lg font-semibold">{user.nombreCompleto}</h3>
															<p className="text-sm text-muted-foreground flex items-center gap-2">
																<Mail className="h-3 w-3" /> {user.email}
																{user.emailConfirmed && <BadgeCheck className="h-3 w-3 text-green-500" />}
															</p>
														</div>
													</div>

													{/* Info Grid */}
													<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
														<div>
															<p className="text-muted-foreground text-xs uppercase tracking-wider">Estatus</p>
															<div className="flex items-center gap-2 mt-1">
																<Badge variant={STATUS_CONFIG[user.estatus]?.variant || "secondary"}>
																	{STATUS_CONFIG[user.estatus]?.icon && (
																		<span className="mr-1">
																			{/* Render icon component */}
																			{(() => {
																				const Icon = STATUS_CONFIG[user.estatus].icon;
																				return <Icon className="h-3 w-3" />;
																			})()}
																		</span>
																	)}
																	{user.estatusNombre}
																</Badge>
															</div>
														</div>
														<div>
															<p className="text-muted-foreground text-xs uppercase tracking-wider">Documento</p>
															<p className="font-medium mt-1">{user.tipoDocumento}</p>
															<p className="text-xs text-muted-foreground">{user.numeroDocumento || "N/A"}</p>
														</div>
														<div className="col-span-2">
															<p className="text-muted-foreground text-xs uppercase tracking-wider">Roles</p>
															<div className="flex gap-1 flex-wrap mt-1">
																{user.roles.map((role) => (
																	<Badge
																		key={role}
																		variant="outline"
																		className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors group"
																		onClick={() => handleRemoveRole(user, role)}
																		title="Click para remover rol"
																	>
																		{role.replace("Operator_", "")}
																		<span className="hidden group-hover:inline ml-1">×</span>
																	</Badge>
																))}
																<Button
																	variant="ghost"
																	size="sm"
																	className="h-5 px-2 text-xs"
																	onClick={() => handleOpenAssignRole(user)}
																>
																	<Plus className="h-3 w-3" />
																</Button>
															</div>
														</div>
													</div>

													{/* Alertas de seguridad */}
													{user.accessFailedCount > 0 && (
														<div className="flex items-center gap-2 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded text-xs text-red-600 dark:text-red-400">
															<LockKeyhole className="h-3 w-3" />
															<span>{user.accessFailedCount} intentos fallidos de acceso</span>
															<Button
																variant="link"
																size="sm"
																className="h-auto p-0 text-xs text-red-600 underline"
																onClick={() => resetAttemptsMutation.mutate(user.id)}
															>
																Resetear
															</Button>
														</div>
													)}
												</div>

												{/* Acciones */}
												<div className="flex flex-col gap-2 min-w-[140px]">
													<Select
														value={user.estatus.toString()}
														onValueChange={(val) =>
															updateStatusMutation.mutate({
																userId: user.id,
																data: { estatus: Number(val) },
															})
														}
													>
														<SelectTrigger className="h-8">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{statuses?.map((status) => (
																<SelectItem key={status.id} value={status.id.toString()}>
																	{status.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>

													{user.estatus !== UserStatus.Bloqueado ? (
														<Button
															variant="outline"
															size="sm"
															className="h-8 justify-start text-amber-600 hover:text-amber-700 hover:bg-amber-50"
															onClick={() => handleLockUser(user)}
														>
															<Lock className="mr-2 h-3 w-3" />
															Bloquear
														</Button>
													) : (
														<Button
															variant="outline"
															size="sm"
															className="h-8 justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
															onClick={() => unlockMutation.mutate(user.id)}
														>
															<Shield className="mr-2 h-3 w-3" />
															Desbloquear
														</Button>
													)}

													{!user.emailConfirmed && (
														<Button
															variant="ghost"
															size="sm"
															className="h-8 justify-start"
															onClick={() => resendConfirmationMutation.mutate(user.email)}
														>
															<Mail className="mr-2 h-3 w-3" />
															Reenviar Email
														</Button>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<Users className="h-12 w-12 text-muted-foreground mb-4" />
									<h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
									<p className="text-muted-foreground mb-4 max-w-sm">
										{searchTerm || statusFilter !== "all"
											? "Intenta ajustar los filtros de búsqueda"
											: "Comienza creando tu primer operador o miembro del staff"}
									</p>
									{/* TODO: Crear componente CreateUserDialog */}
									{/* <Button onClick={() => setIsCreateOpen(true)}>
										<Plus className="mr-2 h-4 w-4" />
										Nuevo Usuario
									</Button> */}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Tab: Estadísticas */}
				<TabsContent value="stats" className="space-y-4">
					{stats ? (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">Total Personal</CardTitle>
									<Shield className="h-4 w-4 text-muted-foreground" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{targetUsers.length}</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">Activos</CardTitle>
									<UserCheck className="h-4 w-4 text-green-600" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-green-600">
										{targetUsers.filter((u) => u.estatus === UserStatus.Activo).length}
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader className="flex flex-row items-center justify-between pb-2">
									<CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
									<Lock className="h-4 w-4 text-red-600" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold text-red-600">
										{targetUsers.filter((u) => u.estatus === UserStatus.Bloqueado).length}
									</div>
								</CardContent>
							</Card>
						</div>
					) : null}
				</TabsContent>
			</Tabs>

			{/* Create User Dialog Component */}
			{/* <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} allowedRoles={allowedRoles} /> */}

			{/* Dialog asignar rol */}
			<Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Asignar Rol</DialogTitle>
						<DialogDescription>Asignar un nuevo rol a {selectedUser?.nombreCompleto}</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Label>Seleccionar Rol</Label>
						<Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
							<SelectTrigger className="mt-2">
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
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsAssignRoleOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleAssignRole} disabled={assignRoleMutation.isPending || !selectedRoleId}>
							Asignar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Dialog bloquear usuario */}
			<Dialog open={isLockDialogOpen} onOpenChange={setIsLockDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Bloquear Usuario</DialogTitle>
						<DialogDescription>Bloquear acceso temporalmente a {selectedUser?.nombreCompleto}</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Label>Duración del bloqueo (minutos)</Label>
						<Input
							type="number"
							min="1"
							value={lockMinutes}
							onChange={(e) => setLockMinutes(parseInt(e.target.value) || 0)}
							className="mt-2"
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsLockDialogOpen(false)}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={handleSubmitLock} disabled={lockMutation.isPending}>
							Bloquear
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
