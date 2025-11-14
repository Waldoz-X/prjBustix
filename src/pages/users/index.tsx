import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Calendar, Filter, Loader2, Search, TrendingUp, UserCheck, UserCog, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import userService, { type UserDto, UserStatus } from "@/api/services/userService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { handleApiError } from "@/utils/error-handler";

/**
 * Mapping de estatus a colores y variantes de badge
 * IDs reales de la BD: 1=Activo, 2=Inactivo, 3=Bloqueado
 */
const STATUS_CONFIG: Record<number, { variant: any; label: string; color: string }> = {
	1: { variant: "default", label: "Activo", color: "text-green-600" },
	2: { variant: "secondary", label: "Inactivo", color: "text-gray-600" },
	3: { variant: "destructive", label: "Bloqueado", color: "text-red-600" },
};

export default function UsersManagementPage() {
	const queryClient = useQueryClient();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<number | "all">("all");
	const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const [newStatus, setNewStatus] = useState<number>(UserStatus.Activo);

	// Queries
	const { data: users = [], isLoading: usersLoading } = useQuery({
		queryKey: ["users"],
		queryFn: async () => {
			// Usar getAllUsers en lugar de múltiples llamadas
			return await userService.getAllUsers();
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

	// Mutation para cambiar estatus
	const updateStatusMutation = useMutation({
		mutationFn: ({ userId, data }: { userId: string; data: { estatus: UserStatus } }) =>
			userService.updateStatus(userId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			queryClient.invalidateQueries({ queryKey: ["user-stats"] });
			toast.success("Estatus actualizado", {
				description: "El estatus del usuario se actualizó correctamente",
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

	// Filtrar usuarios
	const filteredUsers = useMemo(() => {
		if (!users) return [];

		let filtered = users;

		// Filtro por estatus
		if (statusFilter !== "all") {
			filtered = filtered.filter((u) => u.estatus === statusFilter);
		}

		// Filtro por búsqueda
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
	}, [users, statusFilter, searchTerm]);

	const handleChangeStatus = (user: UserDto) => {
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

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
				<p className="text-muted-foreground mt-2">Administra usuarios, estatus y visualiza estadísticas del sistema</p>
			</div>

			{/* Tabs principales */}
			<Tabs defaultValue="users" className="space-y-6">
				<TabsList>
					<TabsTrigger value="users">
						<Users className="mr-2 h-4 w-4" />
						Usuarios
					</TabsTrigger>
					<TabsTrigger value="stats">
						<BarChart3 className="mr-2 h-4 w-4" />
						Estadísticas
					</TabsTrigger>
				</TabsList>

				{/* Tab: Usuarios */}
				<TabsContent value="users" className="space-y-4">
					{/* Filtros y búsqueda */}
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
										Filtrar por Estatus
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
								Mostrando {filteredUsers.length} de {users?.length || 0} usuarios
							</div>
						</CardContent>
					</Card>

					{/* Lista de usuarios */}
					{usersLoading ? (
						<div className="flex items-center justify-center min-h-[400px]">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : (
						<div className="grid gap-4">
							{filteredUsers.length > 0 ? (
								filteredUsers.map((user) => (
									<Card key={user.id} className="hover:shadow-md transition-shadow">
										<CardContent className="p-6">
											<div className="flex items-start justify-between">
												<div className="flex-1 space-y-3">
													{/* Nombre y email */}
													<div>
														<h3 className="text-lg font-semibold">{user.nombreCompleto}</h3>
														<p className="text-sm text-muted-foreground">{user.email}</p>
													</div>

													{/* Info en grid */}
													<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
														<div>
															<p className="text-muted-foreground">Estatus</p>
															<Badge variant={STATUS_CONFIG[user.estatus]?.variant || "secondary"}>
																{user.estatusNombre}
															</Badge>
														</div>
														<div>
															<p className="text-muted-foreground">Documento</p>
															<p className="font-medium">{user.tipoDocumento}</p>
															<p className="text-xs">{user.numeroDocumento}</p>
														</div>
														<div>
															<p className="text-muted-foreground">Roles</p>
															<div className="flex gap-1 flex-wrap">
																{user.roles.map((role) => (
																	<Badge key={role} variant="outline" className="text-xs">
																		{role}
																	</Badge>
																))}
															</div>
														</div>
														<div>
															<p className="text-muted-foreground">Registro</p>
															<p className="text-xs">{new Date(user.fechaRegistro).toLocaleDateString()}</p>
														</div>
													</div>

													{/* Indicadores adicionales */}
													<div className="flex gap-2 text-xs">
														{user.emailConfirmed && (
															<Badge variant="default" className="text-xs">
																<UserCheck className="mr-1 h-3 w-3" />
																Email Verificado
															</Badge>
														)}
														{user.phoneNumberConfirmed && (
															<Badge variant="default" className="text-xs">
																Teléfono Verificado
															</Badge>
														)}
														{user.accessFailedCount > 0 && (
															<Badge variant="destructive" className="text-xs">
																{user.accessFailedCount} intentos fallidos
															</Badge>
														)}
													</div>
												</div>

												{/* Acciones */}
												<div className="flex flex-col gap-2 ml-4">
													<Button variant="outline" size="sm" onClick={() => handleChangeStatus(user)}>
														<UserCog className="mr-1 h-4 w-4" />
														Cambiar Estatus
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								))
							) : (
								<Card>
									<CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
										<Users className="h-12 w-12 text-muted-foreground mb-4" />
										<h3 className="text-lg font-semibold mb-2">No se encontraron usuarios</h3>
										<p className="text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
									</CardContent>
								</Card>
							)}
						</div>
					)}
				</TabsContent>

				{/* Tab: Estadísticas */}
				<TabsContent value="stats" className="space-y-4">
					{stats ? (
						<>
							{/* Cards de resumen */}
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								<Card>
									<CardHeader className="flex flex-row items-center justify-between pb-2">
										<CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
										<Users className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{stats.totalUsers}</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between pb-2">
										<CardTitle className="text-sm font-medium">Activos</CardTitle>
										<UserCheck className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{stats.activeUsers}</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between pb-2">
										<CardTitle className="text-sm font-medium">Inactivos</CardTitle>
										<Calendar className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{stats.inactiveUsers || 0}</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between pb-2">
										<CardTitle className="text-sm font-medium">Bloqueados</CardTitle>
										<TrendingUp className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{stats.lockedUsers}</div>
									</CardContent>
								</Card>
							</div>

							{/* Distribución por estatus */}
							<Card>
								<CardHeader>
									<CardTitle>Distribución por Estatus</CardTitle>
									<CardDescription>Usuarios agrupados por su estatus actual</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{statuses?.map((status) => (
											<div key={status.id} className="space-y-2">
												<div className="flex items-center justify-between text-sm">
													<div className="flex items-center gap-2">
														<Badge variant={STATUS_CONFIG[status.id]?.variant || "secondary"}>{status.name}</Badge>
														<span className="text-muted-foreground">Ver usuarios</span>
													</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</>
					) : (
						<div className="flex items-center justify-center min-h-[400px]">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Dialog para cambiar estatus */}
			<Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Cambiar Estatus de Usuario</DialogTitle>
						<DialogDescription>
							Usuario: {selectedUser?.nombreCompleto} ({selectedUser?.email})
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Estatus Actual</Label>
							<div>
								<Badge variant={STATUS_CONFIG[selectedUser?.estatus || 1]?.variant}>
									{selectedUser?.estatusNombre}
								</Badge>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="newStatus">Nuevo Estatus</Label>
							<Select value={newStatus.toString()} onValueChange={(val) => setNewStatus(Number(val))}>
								<SelectTrigger id="newStatus">
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
		</div>
	);
}
