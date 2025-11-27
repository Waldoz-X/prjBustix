import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { toast } from "sonner";
import roleService, { type RoleDto } from "@/api/services/roleService";
import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { RoleModal, type RoleModalProps } from "./role-modal";

export default function RolePage() {
	const queryClient = useQueryClient();
	const [roleModalProps, setRoleModalProps] = useState<RoleModalProps>({
		formValue: { name: "", id: "" } as RoleDto,
		title: "New",
		show: false,
		onOk: () => {},
		onCancel: () => {
			setRoleModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	const { data: rolesResponse, isLoading } = useQuery({
		queryKey: ["roles"],
		queryFn: () => roleService.getAll(),
	});

	const roles = rolesResponse?.data || [];

	const createMutation = useMutation({
		mutationFn: roleService.create,
		onSuccess: () => {
			toast.success("Role created successfully");
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			setRoleModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to create role");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: { name: string } }) => roleService.update(id, data),
		onSuccess: () => {
			toast.success("Role updated successfully");
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			setRoleModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to update role");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: roleService.delete,
		onSuccess: () => {
			toast.success("Role deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["roles"] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to delete role");
		},
	});

	const columns: ColumnsType<RoleDto> = [
		{
			title: "Name",
			dataIndex: "name",
			width: 300,
		},
		{
			title: "Description",
			dataIndex: "descripcion",
		},
		{
			title: "Users",
			dataIndex: "usuariosAsignados",
			width: 100,
			align: "center",
		},
		{
			title: "Status",
			dataIndex: "activo",
			align: "center",
			width: 120,
			render: (activo) => <Badge variant={activo ? "success" : "error"}>{activo ? "Active" : "Inactive"}</Badge>,
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray-500">
					<Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => deleteMutation.mutate(record.id)}
						disabled={deleteMutation.isPending}
					>
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
					</Button>
				</div>
			),
		},
	];

	const onCreate = () => {
		setRoleModalProps({
			show: true,
			title: "Create New Role",
			formValue: { name: "", id: "" } as RoleDto,
			onOk: (data: RoleDto) => {
				createMutation.mutate({ name: data.name });
			},
			onCancel: () => {
				setRoleModalProps((prev) => ({ ...prev, show: false }));
			},
		});
	};

	const onEdit = (record: RoleDto) => {
		setRoleModalProps({
			show: true,
			title: "Edit Role",
			formValue: record,
			onOk: (data: RoleDto) => {
				updateMutation.mutate({ id: record.id, data: { name: data.name } });
			},
			onCancel: () => {
				setRoleModalProps((prev) => ({ ...prev, show: false }));
			},
		});
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>Role List</div>
					<Button onClick={onCreate}>New</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table
					rowKey="id"
					size="small"
					scroll={{ x: "max-content" }}
					pagination={false}
					columns={columns}
					dataSource={roles}
					loading={isLoading}
				/>
			</CardContent>
			<RoleModal {...roleModalProps} />
		</Card>
	);
}
