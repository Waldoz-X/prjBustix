import { clone, concat } from "ramda";
import { Suspense, useMemo } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router";
import { AuthGuard } from "@/components/auth/auth-guard";
import { LineLoading } from "@/components/loading";
import { GLOBAL_CONFIG } from "@/global-config";
import Page403 from "@/pages/sys/error/Page403";
import { useSettings } from "@/store/settingStore";
import { useUserToken } from "@/store/userStore";
import { cn } from "@/utils";
import { filterNavigation } from "@/utils/nav-filter";
import { flattenTrees } from "@/utils/tree";
import { backendNavData } from "./nav/nav-data/nav-data-backend";
import { frontendNavData } from "./nav/nav-data/nav-data-frontend";

const Main = () => {
	const { themeStretch } = useSettings();
	const { pathname } = useLocation();

	// Obtener token del store (reactivo)
	const userToken = useUserToken();
	const token = userToken?.accessToken || localStorage.getItem("token");

	// useMemo: Solo recalcular el menú filtrado cuando el token cambie
	const navData = useMemo(() => {
		const baseNavData = GLOBAL_CONFIG.routerMode === "frontend" ? clone(frontendNavData) : backendNavData;
		return token ? filterNavigation(baseNavData, token) : baseNavData;
	}, [token]); // ⚡ Solo se ejecuta cuando el token cambia

	// useMemo: Solo recalcular allItems cuando navData cambie
	const allItems = useMemo(() => {
		return navData.reduce((acc: any[], group) => {
			const flattenedItems = flattenTrees(group.items);
			return concat(acc, flattenedItems);
		}, []);
	}, [navData]); // ⚡ Solo se ejecuta cuando navData cambia

	// Buscar permisos de la ruta actual
	const currentNavAuth = useMemo(() => {
		const foundItem = allItems.find((item) => item.path === pathname);
		return foundItem?.auth || [];
	}, [allItems, pathname]); // ⚡ Solo se ejecuta cuando cambia la ruta

	return (
		<AuthGuard checkAny={currentNavAuth} fallback={<Page403 />}>
			<main
				data-slot="slash-layout-main"
				className={cn(
					"flex-auto w-full flex flex-col",
					"transition-[max-width] duration-300 ease-in-out",
					"px-4 sm:px-6 py-4 sm:py-6 md:px-8 mx-auto",
					{
						"max-w-full": themeStretch,
						"xl:max-w-screen-xl": !themeStretch,
					},
				)}
				style={{
					willChange: "max-width",
				}}
			>
				<Suspense fallback={<LineLoading />}>
					<Outlet />
					<ScrollRestoration />
				</Suspense>
			</main>
		</AuthGuard>
	);
};

export default Main;
