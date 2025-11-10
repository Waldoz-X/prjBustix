import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Key, Loader2, Pencil, Plus, ShieldCheck, Trash2, UserMinus, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import roleService, {
	type AssignRoleDto,
	type CreateRoleDto,
	type RoleDto,
	type UpdateRoleDto,
} from "@/api/services/roleService";
import { useUserToken } from "@/store/userStore";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { handleApiError } from "@/utils/error-handler";
import { getPermissionsFromToken, getRolesFromToken } from "@/utils/jwt";

/**
 * Mapping estático de roles a permisos según tu API
 * Basado en AppPermissions.RolePermissions de tu backend
 */
const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
	Admin: ["*"], // Wildcard - acceso total
	Manager: [
		"users:view",
		"users:create",
		"users:edit",
		"roles:view",
		"tickets:view",
		"tickets:create",
		"tickets:edit",
		"reports:view",
		"reports:generate",
	],
	User: ["tickets:view", "tickets:create", "reports:view"],
	// Puedes agregar más roles según tu backend
};

/**
 * Lista completa de permisos disponibles en el sistema
 */
const ALL_PERMISSIONS = [
	{ code: "users:view", name: "Ver Usuarios", category: "Usuarios" },
	{ code: "users:create", name: "Crear Usuarios", category: "Usuarios" },
	{ code: "users:edit", name: "Editar Usuarios", category: "Usuarios" },
	{ code: "users:delete", name: "Eliminar Usuarios", category: "Usuarios" },
	{ code: "roles:view", name: "Ver Roles", category: "Roles" },
	{ code: "roles:create", name: "Crear Roles", category: "Roles" },
	{ code: "roles:edit", name: "Editar Roles", category: "Roles" },
	{ code: "roles:delete", name: "Eliminar Roles", category: "Roles" },
	{ code: "tickets:view", name: "Ver Tickets", category: "Tickets" },
	{ code: "tickets:create", name: "Crear Tickets", category: "Tickets" },
	{ code: "tickets:edit", name: "Editar Tickets", category: "Tickets" },
	{ code: "tickets:delete", name: "Eliminar Tickets", category: "Tickets" },
	{ code: "reports:view", name: "Ver Reportes", category: "Reportes" },
	{ code: "reports:generate", name: "Generar Reportes", category: "Reportes" },
];

export default function RolesPage() {
	const queryClient = useQueryClient();
	const userToken = useUserToken();

	// Estados para crear/editar roles
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
	const [newRoleName, setNewRoleName] = useState("");
	const [editRoleName, setEditRoleName] = useState("");

	// Estados para asignar/remover roles
	const [isAssignOpen, setIsAssignOpen] = useState(false);
	const [assignRoleName, setAssignRoleName] = useState("");
	const [assignEmail, setAssignEmail] = useState("");
	const [assignUserId, setAssignUserId] = useState("");
	const [isRemoveMode, setIsRemoveMode] = useState(false);

	// Obtener permisos del usuario actual desde el token
	const currentUserPermissions = useMemo(() => {
		if (userToken.accessToken) {
			return getPermissionsFromToken(userToken.accessToken);
		}
		return [];
	}, [userToken.accessToken]);

	const currentUserRoles = useMemo(() => {
		if (userToken.accessToken) {
			return getRolesFromToken(userToken.accessToken);
		}
		return [];
	}, [userToken.accessToken]);

	const isAdmin = currentUserPermissions.includes("*") || currentUserRoles.includes("Admin");

	// Query para obtener todos los roles
	const {
		data: roles,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["roles"],
		queryFn: roleService.getAll,
		retry: 1,
	});

	// Mutation para crear rol
	const createMutation = useMutation({
		mutationFn: (data: CreateRoleDto) => roleService.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			toast.success("Rol creado", {
				description: "El rol se ha creado correctamente",
			});
			setIsCreateOpen(false);
			setNewRoleName("");
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al crear rol", {
				description: safeError.userMessage,
			});
		},
	});

	// Mutation para actualizar rol
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) => roleService.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			toast.success("Rol actualizado", {
				description: "El rol se ha actualizado correctamente",
			});
			setIsEditOpen(false);
			setSelectedRole(null);
			setEditRoleName("");
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al actualizar rol", {
				description: safeError.userMessage,
			});
		},
	});

	// Mutation para eliminar rol
	const deleteMutation = useMutation({
		mutationFn: (id: string) => roleService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			toast.success("Rol eliminado", {
				description: "El rol se ha eliminado correctamente",
			});
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al eliminar rol", {
				description: safeError.userMessage,
			});
		},
	});

	// Mutation para asignar rol a usuario
	const assignMutation = useMutation({
		mutationFn: ({ roleName, data }: { roleName: string; data: AssignRoleDto }) =>
			roleService.assignToUser(roleName, data),
		onSuccess: () => {
			toast.success("Rol asignado", {
				description: "El rol se ha asignado correctamente al usuario",
			});
			setIsAssignOpen(false);
			setAssignEmail("");
			setAssignUserId("");
			setAssignRoleName("");
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al asignar rol", {
				description: safeError.userMessage,
			});
		},
	});

	// Mutation para remover rol de usuario
	const removeMutation = useMutation({
		mutationFn: ({ roleName, data }: { roleName: string; data: AssignRoleDto }) =>
			roleService.removeFromUser(roleName, data),
		onSuccess: () => {
			toast.success("Rol removido", {
				description: "El rol se ha removido correctamente del usuario",
			});
			setIsAssignOpen(false);
			setAssignEmail("");
			setAssignUserId("");
			setAssignRoleName("");
		},
		onError: (err: any) => {
			const safeError = handleApiError(err);
			toast.error("Error al remover rol", {
				description: safeError.userMessage,
			});
		},
	});

	const handleCreate = () => {
		if (!newRoleName.trim()) {
			toast.error("Nombre requerido", {
				description: "Por favor ingresa un nombre para el rol",
			});
			return;
		}
		createMutation.mutate({ name: newRoleName.trim() });
	};

	const handleEdit = (role: RoleDto) => {
		setSelectedRole(role);
		setEditRoleName(role.name);
		setIsEditOpen(true);
	};

	const handleUpdate = () => {
		if (!selectedRole || !editRoleName.trim()) {
			toast.error("Nombre requerido", {
				description: "Por favor ingresa un nombre para el rol",
			});
			return;
		}
		updateMutation.mutate({ id: selectedRole.id, data: { name: editRoleName.trim() } });
	};

	const handleDelete = (role: RoleDto) => {
		if (window.confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) {
			deleteMutation.mutate(role.id);
		}
	};

	const handleAssignRole = (roleName: string, isRemove: boolean = false) => {
		setAssignRoleName(roleName);
		setIsRemoveMode(isRemove);
		setIsAssignOpen(true);
	};

	const handleSubmitAssignRemove = () => {
		if (!assignRoleName) {
			toast.error("Rol requerido", {
				description: "Por favor selecciona un rol",
			});
			return;
		}

		if (!assignEmail.trim() && !assignUserId.trim()) {
			toast.error("Usuario requerido", {
				description: "Por favor ingresa un email o ID de usuario",
			});
			return;
		}

		const data: AssignRoleDto = {
			email: assignEmail.trim() || undefined,
			userId: assignUserId.trim() || undefined,
		};

		if (isRemoveMode) {
			removeMutation.mutate({ roleName: assignRoleName, data });
		} else {
			assignMutation.mutate({ roleName: assignRoleName, data });
		}
	};

	// Obtener permisos de un rol específico
	const getRolePermissions = (roleName: string): string[] => {
		return ROLE_PERMISSIONS_MAP[roleName] || [];
	};

	// Agrupar permisos por categoría
	const groupedPermissions = useMemo(() => {
		const groups: Record<string, typeof ALL_PERMISSIONS> = {};
		ALL_PERMISSIONS.forEach((perm) => {
			if (!groups[perm.category]) {
				groups[perm.category] = [];
			}
			groups[perm.category].push(perm);
		});
		return groups;
	}, []);

	if (error) {
		const safeError = handleApiError(error);
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-red-600">Error al cargar roles</CardTitle>
						<CardDescription>{safeError.userMessage}</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Gestión de Roles</h1>
					<p className="text-muted-foreground mt-2">
						Administra los roles del sistema, asigna a usuarios y visualiza permisos
					</p>
				</div>

				{/* Diálogo para crear rol */}
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Crear Rol
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Crear Nuevo Rol</DialogTitle>
							<DialogDescription>Ingresa el nombre del nuevo rol. Asegúrate de que sea descriptivo.</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="roleName">Nombre del Rol</Label>
								<Input
									id="roleName"
									placeholder="Ej: Manager, Supervisor, etc."
									value={newRoleName}
									onChange={(e) => setNewRoleName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleCreate();
										}
									}}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsCreateOpen(false)}>
								Cancelar
							</Button>
							<Button onClick={handleCreate} disabled={createMutation.isPending}>
								{createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Crear
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Tabs principales */}
			<Tabs defaultValue="roles" className="space-y-6">
				<TabsList>
					<TabsTrigger value="roles">
						<ShieldCheck className="mr-2 h-4 w-4" />
						Roles
					</TabsTrigger>
					<TabsTrigger value="assign">
						<UserPlus className="mr-2 h-4 w-4" />
						Asignar a Usuarios
					</TabsTrigger>
					<TabsTrigger value="permissions">
						<Key className="mr-2 h-4 w-4" />
						Permisos
					</TabsTrigger>
				</TabsList>

				{/* Tab 1: Lista de Roles */}
				<TabsContent value="roles" className="space-y-4">
					{/* Diálogo para editar rol */}
					<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Editar Rol</DialogTitle>
								<DialogDescription>Modifica el nombre del rol "{selectedRole?.name}"</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="editRoleName">Nombre del Rol</Label>
									<Input
										id="editRoleName"
										placeholder="Nombre del rol"
										value={editRoleName}
										onChange={(e) => setEditRoleName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleUpdate();
											}
										}}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setIsEditOpen(false)}>
									Cancelar
								</Button>
								<Button onClick={handleUpdate} disabled={updateMutation.isPending}>
									{updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Actualizar
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{isLoading ? (
						<div className="flex items-center justify-center min-h-[400px]">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{roles && roles.length > 0 ? (
								roles.map((role) => {
									const permissions = getRolePermissions(role.name);
									const isWildcard = permissions.includes("*");

									return (
										<Card key={role.id} className="hover:shadow-lg transition-shadow">
											<CardHeader>
												<div className="flex items-start justify-between">
													<div className="flex items-center gap-2">
														<ShieldCheck className="h-5 w-5 text-primary" />
														<CardTitle className="text-lg">{role.name}</CardTitle>
													</div>
													<div className="flex gap-1">
														<Button variant="ghost" size="icon" onClick={() => handleEdit(role)} className="h-8 w-8">
															<Pencil className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleDelete(role)}
															disabled={deleteMutation.isPending}
															className="h-8 w-8 text-destructive hover:text-destructive"
														>
															{deleteMutation.isPending ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																<Trash2 className="h-4 w-4" />
															)}
														</Button>
													</div>
												</div>
												<CardDescription>ID: {role.id}</CardDescription>
											</CardHeader>
											<CardContent className="space-y-3">
												<div>
													<p className="text-sm font-semibold mb-2">Permisos:</p>
													{isWildcard ? (
														<Badge variant="default" className="mb-1">
															<CheckCircle2 className="mr-1 h-3 w-3" />
															Acceso Total (Admin)
														</Badge>
													) : permissions.length > 0 ? (
														<div className="flex flex-wrap gap-1">
															{permissions.slice(0, 3).map((perm) => (
																<Badge key={perm} variant="secondary" className="text-xs">
																	{perm.split(":")[1]}
																</Badge>
															))}
															{permissions.length > 3 && (
																<Badge variant="outline" className="text-xs">
																	+{permissions.length - 3} más
																</Badge>
															)}
														</div>
													) : (
														<p className="text-xs text-muted-foreground">Sin permisos asignados</p>
													)}
												</div>
												<div className="flex gap-2 pt-2">
													<Button
														variant="outline"
														size="sm"
														className="flex-1"
														onClick={() => handleAssignRole(role.name, false)}
													>
														<UserPlus className="mr-1 h-3 w-3" />
														Asignar
													</Button>
													<Button
														variant="outline"
														size="sm"
														className="flex-1"
														onClick={() => handleAssignRole(role.name, true)}
													>
														<UserMinus className="mr-1 h-3 w-3" />
														Remover
													</Button>
												</div>
											</CardContent>
										</Card>
									);
								})
							) : (
								<div className="col-span-full">
									<Card>
										<CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
											<ShieldCheck className="h-12 w-12 text-muted-foreground mb-4" />
											<h3 className="text-lg font-semibold mb-2">No hay roles disponibles</h3>
											<p className="text-muted-foreground mb-4">
												Comienza creando tu primer rol haciendo clic en "Crear Rol"
											</p>
											<Button onClick={() => setIsCreateOpen(true)}>
												<Plus className="mr-2 h-4 w-4" />
												Crear Primer Rol
											</Button>
										</CardContent>
									</Card>
								</div>
							)}
						</div>
					)}
				</TabsContent>

				{/* Tab 2: Asignar/Remover Roles a Usuarios */}
				<TabsContent value="assign" className="space-y-4">
					<Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>{isRemoveMode ? "Remover Rol de Usuario" : "Asignar Rol a Usuario"}</DialogTitle>
								<DialogDescription>
									{isRemoveMode
										? `Remover el rol "${assignRoleName}" del usuario`
										: `Asignar el rol "${assignRoleName}" al usuario`}
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="userEmail">Email del Usuario</Label>
									<Input
										id="userEmail"
										type="email"
										placeholder="usuario@ejemplo.com"
										value={assignEmail}
										onChange={(e) => setAssignEmail(e.target.value)}
									/>
								</div>
								<div className="text-center text-sm text-muted-foreground">O</div>
								<div className="space-y-2">
									<Label htmlFor="userId">ID del Usuario</Label>
									<Input
										id="userId"
										placeholder="user-id-123"
										value={assignUserId}
										onChange={(e) => setAssignUserId(e.target.value)}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setIsAssignOpen(false)}>
									Cancelar
								</Button>
								<Button
									onClick={handleSubmitAssignRemove}
									disabled={assignMutation.isPending || removeMutation.isPending}
									variant={isRemoveMode ? "destructive" : "default"}
								>
									{(assignMutation.isPending || removeMutation.isPending) && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									{isRemoveMode ? "Remover" : "Asignar"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<Card>
						<CardHeader>
							<CardTitle>Asignar o Remover Roles</CardTitle>
							<CardDescription>
								Selecciona un rol de la lista y haz clic en "Asignar" o "Remover" para gestionar los usuarios
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex items-center justify-center min-h-[200px]">
									<Loader2 className="h-8 w-8 animate-spin text-primary" />
								</div>
							) : roles && roles.length > 0 ? (
								<div className="grid gap-3">
									{roles.map((role) => (
										<div
											key={role.id}
											className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
										>
											<div className="flex items-center gap-3">
												<ShieldCheck className="h-5 w-5 text-primary" />
												<div>
													<p className="font-semibold">{role.name}</p>
													<p className="text-sm text-muted-foreground">{role.id}</p>
												</div>
											</div>
											<div className="flex gap-2">
												<Button variant="default" size="sm" onClick={() => handleAssignRole(role.name, false)}>
													<UserPlus className="mr-1 h-4 w-4" />
													Asignar
												</Button>
												<Button variant="destructive" size="sm" onClick={() => handleAssignRole(role.name, true)}>
													<UserMinus className="mr-1 h-4 w-4" />
													Remover
												</Button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">No hay roles disponibles para asignar</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Tab 3: Vista de Permisos */}
				<TabsContent value="permissions" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Permisos del Sistema</CardTitle>
							<CardDescription>
								Vista general de todos los permisos disponibles y qué roles los tienen asignados
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{Object.entries(groupedPermissions).map(([category, perms]) => (
									<div key={category}>
										<h3 className="text-lg font-semibold mb-3">{category}</h3>
										<div className="grid gap-2">
											{perms.map((perm) => {
												// Encontrar qué roles tienen este permiso
												const rolesWithPermission =
													roles?.filter((role) => {
														const permissions = getRolePermissions(role.name);
														return permissions.includes("*") || permissions.includes(perm.code);
													}) || [];

												return (
													<div key={perm.code} className="flex items-center justify-between p-3 border rounded-lg">
														<div>
															<p className="font-medium">{perm.name}</p>
															<code className="text-xs text-muted-foreground">{perm.code}</code>
														</div>
														<div className="flex gap-1 flex-wrap justify-end">
															{rolesWithPermission.length > 0 ? (
																rolesWithPermission.map((role) => (
																	<Badge key={role.id} variant="secondary">
																		{role.name}
																	</Badge>
																))
															) : (
																<Badge variant="outline">Sin asignar</Badge>
															)}
														</div>
													</div>
												);
											})}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Card de info del usuario actual */}
					{isAdmin && (
						<Card className="border-primary">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CheckCircle2 className="h-5 w-5 text-primary" />
									Tu Acceso Actual
								</CardTitle>
								<CardDescription>Tienes acceso de administrador con permisos completos</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div>
										<p className="text-sm font-semibold">Tus Roles:</p>
										<div className="flex gap-1 flex-wrap mt-1">
											{currentUserRoles.map((role) => (
												<Badge key={role} variant="default">
													{role}
												</Badge>
											))}
										</div>
									</div>
									<div>
										<p className="text-sm font-semibold">Tus Permisos:</p>
										{currentUserPermissions.includes("*") ? (
											<Badge variant="default" className="mt-1">
												<CheckCircle2 className="mr-1 h-3 w-3" />
												Acceso Total
											</Badge>
										) : (
											<div className="flex gap-1 flex-wrap mt-1">
												{currentUserPermissions.slice(0, 10).map((perm) => (
													<Badge key={perm} variant="secondary" className="text-xs">
														{perm}
													</Badge>
												))}
												{currentUserPermissions.length > 10 && (
													<Badge variant="outline" className="text-xs">
														+{currentUserPermissions.length - 10} más
													</Badge>
												)}
											</div>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
