import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Icon } from "@/components/icon";
import { GLOBAL_CONFIG } from "@/global-config";
import { type SignInReq, useSignIn } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { cn } from "@/utils";
import { logger } from "@/utils/logger";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

export function LoginForm({ className }: { className?: string }) {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [remember, setRemember] = useState(true);
	const navigate = useNavigate();

	const { loginState, setLoginState } = useLoginStateContext();
	const signIn = useSignIn();

	const form = useForm<SignInReq>({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	if (loginState !== LoginStateEnum.LOGIN) return null;

	const handleFinish = async (values: SignInReq) => {
		setLoading(true);
		try {
			await signIn(values);
			// Pequeño delay para que el usuario vea la notificación de éxito
			setTimeout(() => {
				// Redirigir al dashboard después del login exitoso
				navigate(GLOBAL_CONFIG.defaultRoute, { replace: true });
			}, 500);
		} catch (error) {
			// El error ya es manejado en el store con mensajes del backend
			logger.error("Login failed:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={cn("flex w-full flex-col gap-6", className)}>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleFinish)} className="space-y-4">
					<FormField
						control={form.control}
						name="email"
						rules={{
							required: "El email es requerido",
							pattern: {
								value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
								message: "Email inválido",
							},
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type="email" placeholder="usuario@ejemplo.com" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						rules={{ required: "La contraseña es requerida" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("sys.login.password")}</FormLabel>
								<FormControl>
									<Input type="password" placeholder="********" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* 记住我/忘记密码 */}
					<div className="flex flex-row justify-between">
						<div className="flex items-center space-x-2">
							<Checkbox
								id="remember"
								checked={remember}
								onCheckedChange={(checked) => setRemember(checked === "indeterminate" ? false : checked)}
							/>
							<label
								htmlFor="remember"
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								{t("sys.login.rememberMe")}
							</label>
						</div>
						<Button variant="link" onClick={() => setLoginState(LoginStateEnum.RESET_PASSWORD)} size="sm">
							{t("sys.login.forgetPassword")}
						</Button>
					</div>

					{/* 登录按钮 */}
					<Button type="submit" className="w-full" disabled={loading}>
						{loading && <Loader2 className="animate-spin mr-2" />}
						{t("sys.login.loginButton")}
					</Button>

					{/* 其他登录方式 */}
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">{t("sys.login.otherSignInWay")}</span>
						</div>
					</div>

					<div className="flex justify-center gap-4">
						<Button variant="ghost" size="icon">
							<Icon icon="ant-design:google-circle-filled" size={24} />
						</Button>
					</div>

					<div className="text-center text-sm">
						{t("sys.login.noAccount")}
						<Button variant="link" onClick={() => setLoginState(LoginStateEnum.REGISTER)} className="px-1">
							{t("sys.login.signUpFormTitle")}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

export default LoginForm;
