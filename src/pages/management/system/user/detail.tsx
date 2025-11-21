import { useQuery } from "@tanstack/react-query";
import { Descriptions, Spin } from "antd";
import userService from "@/api/services/userService";
import { useParams } from "@/routes/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

export default function UserDetail() {
	const { id } = useParams();

	const { data: user, isLoading } = useQuery({
		queryKey: ["user", id],
		queryFn: () => userService.getUserById(id!),
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<Spin size="large" />
			</div>
		);
	}

	if (!user) {
		return <div>User not found</div>;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>User Details</CardTitle>
			</CardHeader>
			<CardContent>
				<Descriptions bordered column={1}>
					<Descriptions.Item label="ID">{user.id}</Descriptions.Item>
					<Descriptions.Item label="Name">{user.nombreCompleto}</Descriptions.Item>
					<Descriptions.Item label="Email">{user.email}</Descriptions.Item>
					<Descriptions.Item label="Phone">{user.phoneNumber}</Descriptions.Item>
					<Descriptions.Item label="Roles">{user.roles.join(", ")}</Descriptions.Item>
					<Descriptions.Item label="Status">{user.estatusNombre}</Descriptions.Item>
					<Descriptions.Item label="Registered At">{new Date(user.fechaRegistro).toLocaleString()}</Descriptions.Item>
				</Descriptions>
			</CardContent>
		</Card>
	);
}
