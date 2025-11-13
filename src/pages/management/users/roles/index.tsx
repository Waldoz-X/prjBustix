import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Edit, Plus, Search, Shield, Trash2, Users, UserPlus, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import roleService, { type CreateRoleDto, type RoleDto, type UpdateRoleDto } from "@/api/services/roleService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Skeleton } from "@/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";

export default function RolesPage() {
	const queryClient = useQueryClient();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
	const [formData, setFormData] = useState<CreateRoleDto>({ name: "" });

	// Estados para paginación y búsqueda
	const [currentPage, setCurrentPage] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");
	const [pageSize] = useState(12); // 12 para mejor grid 3x4

	// Query para obtener todos los roles con paginación
	const {
		data: rolesResponse,
		isLoading,
		error,
		isRefetching,
	} = useQuery({
		queryKey: ["roles", currentPage, pageSize, searchTerm],
		queryFn: () =>
			roleService.getAll({
				page: currentPage,
				pageSize,
				search: searchTerm || undefined,
			}),
		staleTime: 30000, // Cache por 30 segundos
	});

	const roles = rolesResponse?.data || [];
	const pagination = rolesResponse?.pagination;

	// Stats computados
	const stats = useMemo(() => {
		return {
			total: pagination?.totalRecords || roles.length,
			active: roles.filter((r) => r.activo !== false).length,
			withUsers: roles.filter((r) => (r.usuariosAsignados || 0) > 0).length,
			totalUsers: roles.reduce((sum, r) => sum + (r.usuariosAsignados || 0), 0),
		};
	}, [roles, pagination]);

	// Mutation para crear rol
	const createMutation = useMutation({
		mutationFn: (data: CreateRoleDto) => {
			// Validar antes de enviar
			if (!data.name || data.name.trim() === "") {
				throw new Error("El nombre del rol es requerido");
			}
			return roleService.create(data);
		},
		onSuccess: () => {
			toast.success("Rol creado exitosamente", {
				description: `El rol "${formData.name}" ha sido creado.`,
				icon: <CheckCircle2 className="h-4 w-4" />,
			});
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			setIsCreateDialogOpen(false);
			setFormData({ name: "" });
		},
		onError: (error: any) => {
			const errorMessage = error.message || "Error al crear el rol";
			toast.error("Error al crear el rol", {
				description: errorMessage,
				duration: 5000,
			});
		},
	});

	// Mutation para actualizar rol
	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) => {
			// Validar antes de enviar
			if (!data.name || data.name.trim() === "") {
				throw new Error("El nombre del rol es requerido");
			}
			return roleService.update(id, data);
		},
		onSuccess: () => {
			toast.success("Rol actualizado exitosamente", {
				description: `El rol "${formData.name}" ha sido actualizado.`,
				icon: <CheckCircle2 className="h-4 w-4" />,
			});
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			setIsEditDialogOpen(false);
			setSelectedRole(null);
		},
		onError: (error: any) => {
			const errorMessage = error.message || "Error al actualizar el rol";
			toast.error("Error al actualizar el rol", {
				description: errorMessage,
				duration: 5000,
			});
		},
	});

	// Mutation para eliminar rol
	const deleteMutation = useMutation({
		mutationFn: (id: string) => roleService.delete(id),
		onSuccess: () => {
			toast.success("Rol eliminado exitosamente", {
				description: `El rol "${selectedRole?.name}" ha sido eliminado.`,
				icon: <CheckCircle2 className="h-4 w-4" />,
			});
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			setIsDeleteDialogOpen(false);
			setSelectedRole(null);
		},
		onError: (error: any) => {
			const errorMessage = error.message || "Error al eliminar el rol";
			toast.error("Error al eliminar el rol", {
				description: errorMessage,
				duration: 5000,
			});
		},
	});

	const handleCreate = () => {
		if (!formData.name || formData.name.trim() === "") {
			toast.error("Por favor ingresa un nombre para el rol");
			return;
		}
		createMutation.mutate(formData);
	};

	const handleEdit = () => {
		if (!selectedRole) return;
		if (!formData.name || formData.name.trim() === "") {
			toast.error("Por favor ingresa un nombre para el rol");
			return;
		}
		updateMutation.mutate({ id: selectedRole.id, data: formData });
	};

	const handleDelete = () => {
		if (!selectedRole) return;
		deleteMutation.mutate(selectedRole.id);
	};

	const openEditDialog = (role: RoleDto) => {
		setSelectedRole(role);
		setFormData({ name: role.name });
		setIsEditDialogOpen(true);
	};

	const openDeleteDialog = (role: RoleDto) => {
		setSelectedRole(role);
		setIsDeleteDialogOpen(true);
	};

	const handleSearch = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1); // Reset a primera página al buscar
	};

	// Roles del sistema que no se pueden eliminar
	const systemRoles = ["Admin", "User", "Manager", "Operator"];
	const isSystemRole = (roleName: string) => systemRoles.includes(roleName);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Gestión de Roles</h1>
					<p className="text-muted-foreground">Administra los roles y permisos del sistema</p>
				</div>
				<Button onClick={() => setIsCreateDialogOpen(true)} size="lg" className="gap-2 w-full md:w-auto">
					<Plus className="h-5 w-5" />
					Crear Rol
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Roles</CardTitle>
						<Shield className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
						<p className="text-xs text-muted-foreground">{stats.active} activos</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Roles Asignados</CardTitle>
						<UserPlus className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.withUsers}</div>
						<p className="text-xs text-muted-foreground">Con usuarios activos</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalUsers}</div>
						<p className="text-xs text-muted-foreground">Usuarios con roles</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Roles del Sistema</CardTitle>
						<AlertCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{systemRoles.length}</div>
						<p className="text-xs text-muted-foreground">No eliminables</p>
					</CardContent>
				</Card>
			</div>

			{/* Search Bar */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Buscar roles..."
								value={searchTerm}
								onChange={(e) => handleSearch(e.target.value)}
								className="pl-10"
								disabled={isLoading}
							/>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							{isRefetching && <span className="animate-pulse">Actualizando...</span>}
							{!isLoading && !isRefetching && (
								<span>
									{roles.length} {roles.length === 1 ? "rol" : "roles"}
								</span>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Loading State con skeleton mejorado */}
			{isLoading && (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
						<Card key={i} className="overflow-hidden">
							<CardHeader className="pb-4">
								<div className="flex items-center gap-3">
									<Skeleton className="h-10 w-10 rounded-lg" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-5 w-24" />
										<Skeleton className="h-4 w-16" />
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<Skeleton className="h-4 w-full" />
								<div className="flex gap-2">
									<Skeleton className="h-9 flex-1" />
									<Skeleton className="h-9 w-9" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Error State mejorado */}
			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error al cargar roles</AlertTitle>
					<AlertDescription>
						No se pudieron cargar los roles. Por favor, verifica tu conexión e intenta nuevamente.
						<Button
							variant="outline"
							size="sm"
							className="mt-2"
							onClick={() => queryClient.invalidateQueries({ queryKey: ["roles"] })}
						>
							Reintentar
						</Button>
					</AlertDescription>
				</Alert>
			)}

			{/* Roles Grid mejorado */}
			{!isLoading && !error && roles.length > 0 && (
				<>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{roles.map((role) => (
							<Card key={role.id} className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<div className="rounded-lg bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors">
												<Shield className="h-5 w-5 text-primary" />
											</div>
											<div>
												<CardTitle className="text-lg leading-none">{role.name}</CardTitle>
												{isSystemRole(role.name) && (
													<Badge variant="secondary" className="mt-1.5 text-xs">
														Sistema
													</Badge>
												)}
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
									{/* Stats */}
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Users className="h-4 w-4" />
										<span className="font-medium">{role.usuariosAsignados || 0}</span>
										<span>usuario{(role.usuariosAsignados || 0) !== 1 ? "s" : ""}</span>
									</div>

									{/* Actions */}
									<div className="flex gap-2 pt-2">
										<Button variant="outline" size="sm" onClick={() => openEditDialog(role)} className="flex-1 gap-2">
											<Edit className="h-4 w-4" />
											Editar
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => openDeleteDialog(role)}
											disabled={isSystemRole(role.name)}
											className="text-destructive hover:text-destructive hover:bg-destructive/10"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Paginación mejorada */}
					{pagination && pagination.totalPages > 1 && (
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
							<p className="text-sm text-muted-foreground">
								Mostrando <span className="font-medium">{roles.length}</span> de{" "}
								<span className="font-medium">{pagination.totalRecords}</span> roles
							</p>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
									disabled={currentPage === 1 || isRefetching}
								>
									Anterior
								</Button>
								<div className="flex items-center gap-1 px-3">
									<span className="text-sm font-medium">{currentPage}</span>
									<span className="text-sm text-muted-foreground">de</span>
									<span className="text-sm font-medium">{pagination.totalPages}</span>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
									disabled={currentPage === pagination.totalPages || isRefetching}
								>
									Siguiente
								</Button>
							</div>
						</div>
					)}
				</>
			)}

			{/* Empty State mejorado */}
			{!isLoading && !error && roles.length === 0 && (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-16 text-center">
						<div className="rounded-full bg-muted p-4 mb-4">
							<Shield className="h-10 w-10 text-muted-foreground" />
						</div>
						<h3 className="text-xl font-semibold mb-2">
							{searchTerm ? "No se encontraron roles" : "Aún no hay roles"}
						</h3>
						<p className="text-muted-foreground mb-6 max-w-sm">
							{searchTerm
								? `No hay roles que coincidan con "${searchTerm}". Intenta con otro término.`
								: "Crea tu primer rol para comenzar a gestionar permisos en el sistema."}
						</p>
						{!searchTerm ? (
							<Button onClick={() => setIsCreateDialogOpen(true)} size="lg" className="gap-2">
								<Plus className="h-5 w-5" />
								Crear Primer Rol
							</Button>
						) : (
							<Button variant="outline" onClick={() => handleSearch("")}>
								Limpiar Búsqueda
							</Button>
						)}
					</CardContent>
				</Card>
			)}

			{/* Create Dialog */}
			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<div className="rounded-lg bg-primary/10 p-2">
								<Shield className="h-5 w-5 text-primary" />
							</div>
							Crear Nuevo Rol
						</DialogTitle>
						<DialogDescription>
							Crea un nuevo rol para el sistema. Podrás asignar permisos específicos más adelante.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name" className="flex items-center gap-2">
								Nombre del Rol <span className="text-destructive">*</span>
							</Label>
							<Input
								id="name"
								placeholder="Ej: Supervisor, Gerente, Vendedor..."
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								maxLength={50}
								autoFocus
							/>
							<p className="text-xs text-muted-foreground">El nombre debe ser único y descriptivo</p>
						</div>
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							variant="outline"
							onClick={() => {
								setIsCreateDialogOpen(false);
								setFormData({ name: "" });
							}}
							disabled={createMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							onClick={handleCreate}
							disabled={createMutation.isPending || !formData.name.trim()}
							className="gap-2"
						>
							{createMutation.isPending ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									Creando...
								</>
							) : (
								<>
									<CheckCircle2 className="h-4 w-4" />
									Crear Rol
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<div className="rounded-lg bg-primary/10 p-2">
								<Edit className="h-5 w-5 text-primary" />
							</div>
							Editar Rol
						</DialogTitle>
						<DialogDescription>
							Actualiza el nombre del rol. Los cambios se aplicarán a todos los usuarios con este rol.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="edit-name" className="flex items-center gap-2">
								Nombre del Rol <span className="text-destructive">*</span>
							</Label>
							<Input
								id="edit-name"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								maxLength={50}
								autoFocus
							/>
							{isSystemRole(selectedRole?.name || "") && (
								<Alert>
									<AlertCircle className="h-4 w-4" />
									<AlertDescription className="text-xs">
										Este es un rol del sistema. Puedes cambiar su nombre pero no eliminarlo.
									</AlertDescription>
								</Alert>
							)}
						</div>
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							variant="outline"
							onClick={() => {
								setIsEditDialogOpen(false);
								setSelectedRole(null);
								setFormData({ name: "" });
							}}
							disabled={updateMutation.isPending}
						>
							Cancelar
						</Button>
						<Button onClick={handleEdit} disabled={updateMutation.isPending || !formData.name.trim()} className="gap-2">
							{updateMutation.isPending ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									Guardando...
								</>
							) : (
								<>
									<CheckCircle2 className="h-4 w-4" />
									Guardar Cambios
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<div className="rounded-lg bg-destructive/10 p-2">
								<Trash2 className="h-5 w-5" />
							</div>
							Eliminar Rol
						</DialogTitle>
						<DialogDescription>
							Esta acción no se puede deshacer. El rol será eliminado permanentemente del sistema.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4 space-y-4">
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>¿Estás seguro?</AlertTitle>
							<AlertDescription>
								Vas a eliminar el rol <span className="font-semibold">"{selectedRole?.name}"</span>.
								{selectedRole?.usuariosAsignados && selectedRole.usuariosAsignados > 0 && (
									<span className="block mt-2">
										⚠️ Este rol tiene {selectedRole.usuariosAsignados} usuario(s) asignado(s).
									</span>
								)}
							</AlertDescription>
						</Alert>
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							variant="outline"
							onClick={() => {
								setIsDeleteDialogOpen(false);
								setSelectedRole(null);
							}}
							disabled={deleteMutation.isPending}
						>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending} className="gap-2">
							{deleteMutation.isPending ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									Eliminando...
								</>
							) : (
								<>
									<Trash2 className="h-4 w-4" />
									Eliminar
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
