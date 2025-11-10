// -----------------------------------------------------------------------------
// routes/sections/public.tsx
// Rutas públicas para la landing page
// -----------------------------------------------------------------------------
import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router";
import { LineLoading } from "@/components/loading";

// Layouts
const PublicLayout = lazy(() => import("@/layouts/public"));

// Páginas
const LandingPage = lazy(() => import("@/pages/landing"));
const SobreNosotros = lazy(() => import("@/pages/landing/sobre-nosotros"));
const Servicios = lazy(() => import("@/pages/landing/servicios"));
const Tours = lazy(() => import("@/pages/landing/tours"));
const Galeria = lazy(() => import("@/pages/landing/galeria"));
const ComoFunciona = lazy(() => import("@/pages/landing/como-funciona"));
const Contacto = lazy(() => import("@/pages/landing/contacto"));
const Terminos = lazy(() => import("@/pages/landing/terminos"));
const Privacidad = lazy(() => import("@/pages/landing/privacidad"));

export const publicRoutes: RouteObject[] = [
	{
		element: (
			<Suspense fallback={<LineLoading />}>
				<PublicLayout />
			</Suspense>
		),
		children: [
			{
				index: true,
				element: <LandingPage />,
			},
			{
				path: "sobre-nosotros",
				element: <SobreNosotros />,
			},
			{
				path: "servicios",
				element: <Servicios />,
			},
			{
				path: "tours",
				element: <Tours />,
			},
			{
				path: "galeria",
				element: <Galeria />,
			},
			{
				path: "como-funciona",
				element: <ComoFunciona />,
			},
			{
				path: "contacto",
				element: <Contacto />,
			},
			{
				path: "terminos",
				element: <Terminos />,
			},
			{
				path: "privacidad",
				element: <Privacidad />,
			},
			{
				path: "politicas",
				element: <Terminos />, // Reutilizamos la misma página
			},
			{
				path: "cookies",
				element: <Privacidad />, // Reutilizamos la misma página
			},
			{
				path: "preguntas-frecuentes",
				element: <ComoFunciona />, // Reutilizamos la misma página
			},
		],
	},
];
