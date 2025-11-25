import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bus, Loader2, Mail, MailOpen, MoreVertical, Search, Send, Ticket, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import notificacionesService, {
	type CrearNotificacionDto,
	type NotificacionDto,
} from "@/api/services/notificacionesService";

import userService from "@/api/services/userService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { ScrollArea } from "@/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";
import { Text, Title } from "@/ui/typography";
import { fDateTime, fToNow } from "@/utils/format-time";
import { cn } from "@/utils/index";

export default function NotificationsPage() {
	const queryClient = useQueryClient();
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

	// --- Queries ---
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: () => notificacionesService.getMisNotificaciones(),
	});

	const { data: users } = useQuery({
		queryKey: ["users"],
		queryFn: () => userService.getAllUsers(),
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
			toast.success("All notifications marked as read");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: notificacionesService.deleteNotificacion,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			toast.success("Notification deleted");
			if (selectedId) setSelectedId(null);
		},
	});

	const createNotificationMutation = useMutation({
		mutationFn: notificacionesService.crearNotificacion,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			toast.success("Notification sent successfully");
			setIsSendDialogOpen(false);
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to send notification");
		},
	});

	// --- Derived State ---
	const filteredNotifications =
		notifications?.filter(
			(n) =>
				n.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
				n.mensaje.toLowerCase().includes(searchQuery.toLowerCase()),
		) || [];

	const selectedNotification = notifications?.find((n) => n.notificacionID === selectedId);
	const unreadCount = notifications?.filter((n) => !n.fueLeida).length || 0;

	// --- Handlers ---
	const handleSelectNotification = (notification: NotificacionDto) => {
		setSelectedId(notification.notificacionID);
		if (!notification.fueLeida) {
			markAsReadMutation.mutate(notification.notificacionID);
		}
	};

	const handleDelete = (id: number) => {
		if (confirm("Are you sure you want to delete this notification?")) {
			deleteMutation.mutate(id);
		}
	};

	// --- Form ---
	const form = useForm<CrearNotificacionDto>({
		defaultValues: {
			titulo: "",
			mensaje: "",
			tipoNotificacion: "Info",
			usuarioID: "",
			enviarPush: true,
			enviarEmail: true,
		},
	});

	const onSubmit = (data: CrearNotificacionDto) => {
		createNotificationMutation.mutate(data);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-100px)]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="flex h-[calc(100vh-100px)] flex-col overflow-hidden rounded-lg border bg-background shadow-sm">
			{/* Top Bar */}
			<div className="flex items-center justify-between border-b px-4 py-3">
				<div className="flex items-center gap-2">
					<Title as="h2" className="text-xl font-bold">
						Inbox
					</Title>
					<Badge variant="secondary" className="ml-2">
						{unreadCount} unread
					</Badge>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => markAllAsReadMutation.mutate()}
						disabled={unreadCount === 0}
						title="Mark all as read"
					>
						<MailOpen className="mr-2 h-4 w-4" />
						Mark all read
					</Button>
					<Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
						<DialogTrigger asChild>
							<Button size="sm">
								<Send className="mr-2 h-4 w-4" />
								New Notification
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[600px]">
							<DialogHeader>
								<DialogTitle>Send Notification</DialogTitle>
								<DialogDescription>Send a new notification to a specific user.</DialogDescription>
							</DialogHeader>
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="usuarioID"
											rules={{ required: "User is required" }}
											render={({ field }) => (
												<FormItem className="col-span-2">
													<FormLabel>User</FormLabel>
													<Select onValueChange={field.onChange} defaultValue={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select a user" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{users?.map((user) => (
																<SelectItem key={user.id} value={user.id}>
																	{user.nombreCompleto} ({user.email})
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="tipoNotificacion"
											render={({ field }) => (
												<FormItem className="col-span-2 md:col-span-1">
													<FormLabel>Type</FormLabel>
													<Select onValueChange={field.onChange} defaultValue={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select type" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="Info">Info</SelectItem>
															<SelectItem value="Warning">Warning</SelectItem>
															<SelectItem value="Error">Error</SelectItem>
															<SelectItem value="Success">Success</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="titulo"
											rules={{ required: "Title is required" }}
											render={({ field }) => (
												<FormItem className="col-span-2 md:col-span-1">
													<FormLabel>Title</FormLabel>
													<FormControl>
														<Input placeholder="Notification title" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="mensaje"
											rules={{ required: "Message is required" }}
											render={({ field }) => (
												<FormItem className="col-span-2">
													<FormLabel>Message</FormLabel>
													<FormControl>
														<Textarea placeholder="Notification message" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<div className="col-span-2 flex gap-6">
											<FormField
												control={form.control}
												name="enviarPush"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
														<div className="space-y-0.5">
															<FormLabel>Push Notification</FormLabel>
														</div>
														<FormControl>
															<Switch checked={field.value} onCheckedChange={field.onChange} />
														</FormControl>
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="enviarEmail"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
														<div className="space-y-0.5">
															<FormLabel>Email</FormLabel>
														</div>
														<FormControl>
															<Switch checked={field.value} onCheckedChange={field.onChange} />
														</FormControl>
													</FormItem>
												)}
											/>
										</div>
									</div>
									<DialogFooter>
										<Button type="submit" disabled={createNotificationMutation.isPending}>
											{createNotificationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
											Send
										</Button>
									</DialogFooter>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex flex-1 overflow-hidden">
				{/* Sidebar List */}
				<div className="w-full max-w-sm border-r flex flex-col bg-muted/10">
					<div className="p-4 border-b">
						<div className="relative">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search notifications..."
								className="pl-8"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>
					<ScrollArea className="flex-1">
						<div className="flex flex-col gap-1 p-2">
							{filteredNotifications.length === 0 ? (
								<div className="p-8 text-center text-muted-foreground">
									<Text>No notifications found</Text>
								</div>
							) : (
								filteredNotifications.map((notification) => (
									<button
										type="button"
										key={notification.notificacionID}
										onClick={() => handleSelectNotification(notification)}
										className={cn(
											"flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
											selectedId === notification.notificacionID
												? "bg-accent text-accent-foreground border-primary/50"
												: "bg-card",
											!notification.fueLeida && "font-semibold border-l-4 border-l-primary",
										)}
									>
										<div className="flex w-full flex-col gap-1">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<div
														className={cn(
															"h-2 w-2 rounded-full",
															notification.tipoNotificacion === "Error"
																? "bg-red-500"
																: notification.tipoNotificacion === "Warning"
																	? "bg-orange-500"
																	: notification.tipoNotificacion === "Success"
																		? "bg-green-500"
																		: "bg-blue-500",
														)}
													/>
													<span className="font-medium">{notification.titulo}</span>
												</div>
												<span className="text-xs text-muted-foreground whitespace-nowrap">
													{fToNow(notification.fechaCreacion)}
												</span>
											</div>
											<span className="line-clamp-2 text-xs text-muted-foreground">
												{notification.mensaje.substring(0, 100)}
											</span>
										</div>
									</button>
								))
							)}
						</div>
					</ScrollArea>
				</div>

				{/* Detail View */}
				<div className="flex-1 flex flex-col bg-background">
					{selectedNotification ? (
						<div className="flex flex-col h-full">
							<div className="flex items-start justify-between border-b p-6">
								<div className="grid gap-1">
									<Title as="h3" className="text-2xl font-bold">
										{selectedNotification.titulo}
									</Title>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Badge
											variant="outline"
											className={cn(
												selectedNotification.tipoNotificacion === "Error"
													? "text-red-600 border-red-200 bg-red-50"
													: selectedNotification.tipoNotificacion === "Warning"
														? "text-orange-600 border-orange-200 bg-orange-50"
														: selectedNotification.tipoNotificacion === "Success"
															? "text-green-600 border-green-200 bg-green-50"
															: "text-blue-600 border-blue-200 bg-blue-50",
											)}
										>
											{selectedNotification.tipoNotificacion}
										</Badge>
										<span>•</span>
										<span>{fDateTime(selectedNotification.fechaCreacion)}</span>
									</div>
									<div className="flex flex-col gap-1 mt-4 text-sm text-muted-foreground border-t pt-4 w-full">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-foreground">From:</span> System
										</div>
										<div className="flex items-center gap-2">
											<span className="font-semibold text-foreground">To:</span> Me
										</div>
									</div>
								</div>
								<div className="flex items-center gap-2 self-start">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleDelete(selectedNotification.notificacionID)}
										title="Delete"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => markAsReadMutation.mutate(selectedNotification.notificacionID)}>
												Mark as read
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-destructive"
												onClick={() => handleDelete(selectedNotification.notificacionID)}
											>
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
							<ScrollArea className="flex-1 p-6">
								<div className="text-sm leading-relaxed whitespace-pre-wrap">{selectedNotification.mensaje}</div>
								{selectedNotification.viajeID > 0 && (
									<div className="mt-8 rounded-lg border bg-muted/50 p-4">
										<div className="flex items-center gap-2 mb-3">
											<Bus className="h-4 w-4 text-primary" />
											<span className="font-semibold">Trip Details</span>
										</div>
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-muted-foreground block text-xs">Trip ID</span>
												<span className="font-medium">{selectedNotification.viajeID}</span>
											</div>
											{selectedNotification.codigoViaje && (
												<div>
													<span className="text-muted-foreground block text-xs">Trip Code</span>
													<span className="font-medium">{selectedNotification.codigoViaje}</span>
												</div>
											)}
										</div>
									</div>
								)}

								{selectedNotification.boletoID > 0 && (
									<div className="mt-4 rounded-lg border bg-muted/50 p-4">
										<div className="flex items-center gap-2 mb-3">
											<Ticket className="h-4 w-4 text-primary" />
											<span className="font-semibold">Ticket Details</span>
										</div>
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<span className="text-muted-foreground block text-xs">Ticket ID</span>
												<span className="font-medium">{selectedNotification.boletoID}</span>
											</div>
											{selectedNotification.codigoBoleto && (
												<div>
													<span className="text-muted-foreground block text-xs">Ticket Code</span>
													<span className="font-medium">{selectedNotification.codigoBoleto}</span>
												</div>
											)}
										</div>
									</div>
								)}
							</ScrollArea>
						</div>
					) : (
						<div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
							<Mail className="h-16 w-16 mb-4 opacity-20" />
							<Title as="h3" className="text-lg font-medium">
								No notification selected
							</Title>
							<Text>Select a notification from the list to view details</Text>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
