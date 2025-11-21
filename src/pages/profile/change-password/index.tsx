import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

export default function ChangePasswordPage() {
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-bold flex items-center gap-2">
					<Lock className="h-8 w-8" />
					Cambiar Contraseña
				</h1>
				<p className="text-muted-foreground mt-2">Actualiza tu contraseña de acceso</p>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>Nueva Contraseña</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="current-password">Contraseña Actual</Label>
							<div className="relative">
								<Input
									id="current-password"
									type={showCurrentPassword ? "text" : "password"}
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									placeholder="Ingresa tu contraseña actual"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowCurrentPassword(!showCurrentPassword)}
								>
									{showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</Button>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="new-password">Nueva Contraseña</Label>
							<div className="relative">
								<Input
									id="new-password"
									type={showNewPassword ? "text" : "password"}
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="Ingresa tu nueva contraseña"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowNewPassword(!showNewPassword)}
								>
									{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</Button>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
							<div className="relative">
								<Input
									id="confirm-password"
									type={showConfirmPassword ? "text" : "password"}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									placeholder="Confirma tu nueva contraseña"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								>
									{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</Button>
							</div>
						</div>

						<Button className="w-full">
							<Shield className="mr-2 h-4 w-4" />
							Cambiar Contraseña
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Requisitos</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								Mínimo 8 caracteres
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								Al menos una letra mayúscula
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								Al menos una letra minúscula
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								Al menos un número
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								Al menos un carácter especial
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
