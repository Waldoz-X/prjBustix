import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CheckCheck, Loader2, Mail, Trash2 } from "lucide-react";
import { type CSSProperties, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import notificacionesService, { type NotificacionDto } from "@/api/services/notificacionesService";
import CyanBlur from "@/assets/images/background/cyan-blur.png";
import RedBlur from "@/assets/images/background/red-blur.png";
import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { ScrollArea } from "@/ui/scroll-area";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Text } from "@/ui/typography";
import { cn } from "@/utils";
import { fToNow } from "@/utils/format-time";

export default function NoticeButton() {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const style: CSSProperties = {
		backdropFilter: "blur(20px)",
		backgroundImage: `url("${CyanBlur}"), url("${RedBlur}")`,
		backgroundRepeat: "no-repeat, no-repeat",
		backgroundPosition: "right top, left bottom",
		backgroundSize: "50%, 50%",
	};

	// --- Queries ---
	const { data: notifications = [], isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: () => notificacionesService.getMisNotificaciones(),
		refetchInterval: 30000, // Refetch every 30 seconds
	});

	// --- Mutations ---
	const markAsReadMutation = useMutation({
		mutationFn: notificacionesService.marcarComoLeida,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});

	const markAllAsReadMutation = useMutation({
		mutationFn: notificacionesService.marcarTodasLeidas,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			toast.success("Todas las notificaciones marcadas como leídas");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: notificacionesService.deleteNotificacion,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			toast.success("Notificación eliminada");
		},
	});

	// --- Derived State ---
	const unreadCount = notifications.filter((n) => !n.fueLeida).length;
	const unreadNotifications = notifications.filter((n) => !n.fueLeida);

	// --- Handlers ---

	return (
		<>
			<div className="relative">
				<Button variant="ghost" size="icon" className="rounded-full" onClick={() => setDrawerOpen(true)}>
					<Icon icon="solar:bell-bing-bold-duotone" size={24} />
				</Button>
				{unreadCount > 0 && (
					<Badge variant="destructive" shape="circle" className="absolute -right-2 -top-2">
						{unreadCount}
					</Badge>
				)}
			</div>
			<Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
				<SheetContent side="right" className="sm:max-w-md p-0 [&>button]:hidden flex flex-col" style={style}>
					<SheetHeader className="flex flex-row items-center justify-between p-4 h-16 shrink-0 border-b bg-background/50 backdrop-blur-sm">
						<SheetTitle>Notificaciones</SheetTitle>
						<div className="flex gap-1">
							<Button
								variant="ghost"
								size="icon"
								className="rounded-full text-primary"
								onClick={() => markAllAsReadMutation.mutate()}
								disabled={unreadCount === 0}
								title="Marcar todas como leídas"
							>
								<CheckCheck className="h-5 w-5" />
							</Button>
						</div>
					</SheetHeader>

					<div className="flex-1 overflow-hidden">
						{isLoading ? (
							<div className="flex h-full items-center justify-center">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</div>
						) : (
							<NoticeTab
								notifications={notifications}
								unreadNotifications={unreadNotifications}
								onRead={(id) => markAsReadMutation.mutate(id)}
								onDelete={(id) => deleteMutation.mutate(id)}
							/>
						)}
					</div>

					<SheetFooter className="flex flex-row h-16 w-full items-center justify-between p-4 shrink-0 border-t bg-background/50 backdrop-blur-sm">
						<Button
							variant="outline"
							className="w-full"
							onClick={() => {
								setDrawerOpen(false);
								navigate("/notifications");
							}}
						>
							Ver todas las notificaciones
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</>
	);
}

interface NoticeTabProps {
	notifications: NotificacionDto[];
	unreadNotifications: NotificacionDto[];
	onRead: (id: number) => void;
	onDelete: (id: number) => void;
}

function NoticeTab({ notifications, unreadNotifications, onRead, onDelete }: NoticeTabProps) {
	const renderNotification = (notification: NotificacionDto) => {
		const isUnread = !notification.fueLeida;

		return (
			<div
				key={notification.notificacionID}
				className={cn(
					"flex items-start gap-3 p-4 border-b hover:bg-muted/50 transition-colors relative group",
					isUnread ? "bg-primary/5" : "bg-transparent",
				)}
			>
				<div
					className={cn(
						"mt-1 h-2 w-2 rounded-full shrink-0",
						notification.tipoNotificacion === "Error"
							? "bg-red-500"
							: notification.tipoNotificacion === "Warning"
								? "bg-orange-500"
								: notification.tipoNotificacion === "Success"
									? "bg-green-500"
									: "bg-blue-500",
					)}
				/>

				<div className="flex-1 min-w-0 space-y-1">
					<div className="flex items-center justify-between gap-2">
						<Text variant="subTitle2" className={cn(isUnread && "font-semibold")}>
							{notification.titulo}
						</Text>
						<Text variant="caption" color="secondary" className="whitespace-nowrap shrink-0">
							{fToNow(notification.fechaCreacion)}
						</Text>
					</div>

					<Text variant="body2" className="text-muted-foreground line-clamp-2 text-sm">
						{notification.mensaje}
					</Text>

					<div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
						{isUnread && (
							<Button
								variant="ghost"
								size="sm"
								className="h-6 px-2 text-xs"
								onClick={() => onRead(notification.notificacionID)}
							>
								<Check className="mr-1 h-3 w-3" />
								Marcar leída
							</Button>
						)}
						<Button
							variant="ghost"
							size="sm"
							className="h-6 px-2 text-xs text-destructive hover:text-destructive"
							onClick={() => onDelete(notification.notificacionID)}
						>
							<Trash2 className="mr-1 h-3 w-3" />
							Eliminar
						</Button>
					</div>
				</div>
			</div>
		);
	};

	return (
		<Tabs defaultValue="all" className="w-full h-full flex flex-col">
			<TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 px-4">
				<TabsTrigger
					value="all"
					className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
				>
					Todas
					<Badge variant="secondary" className="ml-2 h-5 px-1.5 min-w-5">
						{notifications.length}
					</Badge>
				</TabsTrigger>
				<TabsTrigger
					value="unread"
					className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
				>
					No leídas
					<Badge variant="secondary" className="ml-2 h-5 px-1.5 min-w-5">
						{unreadNotifications.length}
					</Badge>
				</TabsTrigger>
			</TabsList>

			<TabsContent value="all" className="flex-1 overflow-hidden mt-0">
				<ScrollArea className="h-full">
					{notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-40 text-muted-foreground p-4">
							<Mail className="h-10 w-10 mb-2 opacity-20" />
							<p>No tienes notificaciones</p>
						</div>
					) : (
						<div className="flex flex-col">{notifications.map(renderNotification)}</div>
					)}
				</ScrollArea>
			</TabsContent>

			<TabsContent value="unread" className="flex-1 overflow-hidden mt-0">
				<ScrollArea className="h-full">
					{unreadNotifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-40 text-muted-foreground p-4">
							<CheckCheck className="h-10 w-10 mb-2 opacity-20" />
							<p>¡Estás al día!</p>
						</div>
					) : (
						<div className="flex flex-col">{unreadNotifications.map(renderNotification)}</div>
					)}
				</ScrollArea>
			</TabsContent>
		</Tabs>
	);
}
