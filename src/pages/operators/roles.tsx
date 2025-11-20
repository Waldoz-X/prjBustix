// Este archivo es la versión "roles" (gestión completa de roles de operadores)
// Equivalente a index.tsx pero con ruta explícita para /operators/roles
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import roleService, { type RoleDto } from "@/api/services/roleService";
import { useHasRole } from "@/hooks/use-session";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { handleApiError } from "@/utils/error-handler";

const forbiddenPattern = /(--|;|<|>|\/\*|\*\/|\$|\||\\|%|&)/;
const hasForbiddenChars = (s?: string) => !!s && forbiddenPattern.test(s);

export default function OperatorsRolesManagementPage() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const isAdmin = useHasRole("Admin");
	const isManager = useHasRole("Manager");
	const allowed = isAdmin || isManager;

	const [newRoleName, setNewRoleName] = useState("");
	const [newRoleDesc, setNewRoleDesc] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editRole, setEditRole] = useState<RoleDto | null>(null);
	const [isEditOpen, setIsEditOpen] = useState(false);

	// Delete dialog state
	const [roleToDelete, setRoleToDelete] = useState<RoleDto | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const { data: roles = [], isLoading } = useQuery({
		queryKey: ["roles"],
		queryFn: async () => {
			const res = await roleService.getAll();
			if (res && (res as any).data) return (res as any).data;
			return Array.isArray(res) ? res : [];
		},
		retry: 1,
	});

	// Filtrar solo roles de operadores y Staff
	const operatorRoles = roles.filter((r: any) => r.name?.startsWith("Operator_") || r.name === "Staff");

	const createMutation = useMutation({
		mutationFn: (payload: { name: string }) => roleService.create({ name: payload.name }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			toast.success("Rol creado");
			setIsCreateOpen(false);
			setNewRoleName("");
			setNewRoleDesc("");
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al crear rol", { description: safe.userMessage });
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, name }: { id: string; name: string }) => roleService.update(id, { name }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			toast.success("Rol actualizado");
			setIsEditOpen(false);
			setEditRole(null);
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al actualizar rol", { description: safe.userMessage });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => roleService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			toast.success("Rol eliminado");
			setIsDeleteOpen(false);
			setRoleToDelete(null);
		},
		onError: (err: any) => {
			const safe = handleApiError(err);
			toast.error("Error al eliminar rol", { description: safe.userMessage });
		},
	});

	const validateName = (name: string) => {
		if (!name || !name.trim()) return "El nombre del rol es obligatorio";
		if (hasForbiddenChars(name)) return "El nombre contiene caracteres no permitidos";
		if (name.length < 3) return "El nombre debe tener al menos 3 caracteres";
		return null;
	};

	const normalizeName = (rawName: string): string => {
		const trimmed = rawName.trim();
		if (trimmed === "Staff") return trimmed;
		if (trimmed.startsWith("Operator_")) return trimmed;
		return `Operator_${trimmed}`;
	};

	const handleCreate = () => {
		const err = validateName(newRoleName);
		if (err) {
			toast.error(err);
			return;
		}
		const name = normalizeName(newRoleName);
		createMutation.mutate({ name });
	};

	const openEdit = (r: RoleDto) => {
		setEditRole(r);
		setIsEditOpen(true);
	};

	const handleUpdate = () => {
		if (!editRole) return;
		const err = validateName(editRole.name as string);
		if (err) {
			toast.error(err);
			return;
		}
		const name = normalizeName(editRole.name || "");
		updateMutation.mutate({ id: editRole.id, name });
	};

	const handleDeleteClick = (r: RoleDto) => {
		setRoleToDelete(r);
		setIsDeleteOpen(true);
	};

	const confirmDelete = () => {
		if (roleToDelete) {
			deleteMutation.mutate(roleToDelete.id);
		}
	};

	if (!allowed) {
		return (
			<div className="p-6">
				<Card>
					<CardHeader>
						<CardTitle>Acceso denegado</CardTitle>
					</CardHeader>
					<CardContent>
						<p>No tienes permisos para ver esta página. Solo administradores y gerentes pueden acceder.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<Button variant="ghost" size="sm" onClick={() => navigate("/operators/list")} className="mb-2">
						<ArrowLeft className="mr-2 h-4 w-4" /> Volver a Lista
					</Button>
					<h1 className="text-3xl font-bold">Gestión de Roles de Operadores</h1>
					<p className="text-muted-foreground mt-2">Crea, edita y elimina roles relacionados con operaciones</p>
				</div>
				<div>
					<Button onClick={() => setIsCreateOpen(true)}>
						<Plus className="mr-2 h-4 w-4" /> Nuevo Rol
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Roles de Operadores</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center min-h-[200px]">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : (
						<div className="grid gap-3">
							{operatorRoles.length === 0 ? (
								<p className="text-muted-foreground">No hay roles de operadores definidos.</p>
							) : (
								operatorRoles.map((r: any) => (
									<div key={r.id} className="flex items-center justify-between border rounded p-3">
										<div>
											<div className="font-medium">{r.name}</div>
											{r.descripcion ? <div className="text-sm text-muted-foreground">{r.descripcion}</div> : null}
										</div>
										<div className="flex gap-2">
											<Button variant="outline" size="sm" onClick={() => openEdit(r)}>
												<Pencil className="h-4 w-4 mr-1" /> Editar
											</Button>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => handleDeleteClick(r)}
												disabled={deleteMutation.isPending}
											>
												{deleteMutation.isPending ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Trash2 className="h-4 w-4 mr-1" />
												)}
												Eliminar
											</Button>
										</div>
									</div>
								))
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Create dialog */}
			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Crear Rol para Operadores</DialogTitle>
					</DialogHeader>
					<div className="grid gap-3 py-4">
						<div>
							<Label>Nombre del Rol</Label>
							<Input
								value={newRoleName}
								onChange={(e) => setNewRoleName(e.target.value)}
								placeholder="Ej: Field, Dispatch, Maintenance"
							/>
							<p className="text-xs text-muted-foreground mt-1">
								Se añadirá automáticamente el prefijo "Operator_" (excepto si es "Staff")
							</p>
						</div>
						<div>
							<Label>Descripción (opcional)</Label>
							<Input value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} placeholder="Descripción" />
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsCreateOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleCreate} disabled={createMutation.isPending}>
							{createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Crear
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit dialog */}
			<Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Editar Rol</DialogTitle>
					</DialogHeader>
					<div className="grid gap-3 py-4">
						<div>
							<Label>Nombre</Label>
							<Input
								value={editRole?.name ?? ""}
								onChange={(e) => setEditRole((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
							/>
							<p className="text-xs text-muted-foreground mt-1">
								Se normalizará con el prefijo "Operator_" si no lo tiene (excepto "Staff")
							</p>
						</div>
						<div>
							<Label>Descripción</Label>
							<Input
								value={editRole?.descripcion ?? ""}
								onChange={(e) => setEditRole((prev) => (prev ? { ...prev, descripcion: e.target.value } : prev))}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsEditOpen(false);
								setEditRole(null);
							}}
						>
							Cancelar
						</Button>
						<Button onClick={handleUpdate} disabled={updateMutation.isPending}>
							{updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Actualizar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirmar Eliminación</DialogTitle>
						<DialogDescription>
							¿Estás seguro de que deseas eliminar el rol "{roleToDelete?.name}"? Esta acción no se puede deshacer.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
							{deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
							Eliminar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
