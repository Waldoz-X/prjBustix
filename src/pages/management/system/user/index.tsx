import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import userService, { type UserDto, UserStatus } from "@/api/services/userService";
import { Icon } from "@/components/icon";
import { usePathname, useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";

export default function UserPage() {
	const { push } = useRouter();
	const pathname = usePathname();

	const { data: users = [], isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: userService.getAllUsers,
	});

	const columns: ColumnsType<UserDto> = [
		{
			title: "Name",
			dataIndex: "nombreCompleto",
			width: 300,
			render: (_, record) => {
				return (
					<div className="flex">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500">
							<Icon icon="solar:user-bold-duotone" size={24} />
						</div>
						<div className="ml-2 flex flex-col">
							<span className="text-sm">{record.nombreCompleto}</span>
							<span className="text-xs text-text-secondary">{record.email}</span>
						</div>
					</div>
				);
			},
		},
		{
			title: "Role",
			dataIndex: "roles",
			align: "center",
			width: 200,
			render: (roles: string[]) => (
				<div className="flex flex-wrap justify-center gap-1">
					{roles.map((role) => (
						<Badge key={role} variant="info">
							{role}
						</Badge>
					))}
				</div>
			),
		},
		{
			title: "Status",
			dataIndex: "estatus",
			align: "center",
			width: 120,
			render: (status: UserStatus) => {
				let variant: "success" | "error" | "warning" | "info" = "info";
				let label = "Unknown";

				switch (status) {
					case UserStatus.Activo:
						variant = "success";
						label = "Activo";
						break;
					case UserStatus.Inactivo:
						variant = "warning";
						label = "Inactivo";
						break;
					case UserStatus.Bloqueado:
						variant = "error";
						label = "Bloqueado";
						break;
				}

				return <Badge variant={variant}>{label}</Badge>;
			},
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray-500">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							push(`${pathname}/${record.id}`);
						}}
					>
						<Icon icon="mdi:card-account-details" size={18} />
					</Button>
					<Button variant="ghost" size="icon" onClick={() => {}}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon">
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
					</Button>
				</div>
			),
		},
	];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>User List</div>
					<Button onClick={() => {}}>New</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table
					rowKey="id"
					size="small"
					scroll={{ x: "max-content" }}
					pagination={false}
					columns={columns}
					dataSource={users}
					loading={isLoading}
				/>
			</CardContent>
		</Card>
	);
}
