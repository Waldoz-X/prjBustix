import { lazy, Suspense } from "react";
import { LineLoading } from "@/components/loading";
import { logger } from "@/utils/logger";

const Pages = import.meta.glob("/src/pages/**/*.tsx");
const lazyComponentCache = new Map<string, React.LazyExoticComponent<any>>();
const elementCache = new Map<string, React.ReactNode>();

export const loadComponentFromPath = (path: string) => {
	const pathArr = path.split("/");
	pathArr.unshift("/src");

	if (!pathArr.includes(".tsx")) {
		return pathArr.push("index.tsx");
	}
	return Pages[pathArr.join("/")];
};

export const Component = (path = "", props?: any): React.ReactNode => {
	if (!path) return null;

	// Crear clave única que incluya props para cache
	const cacheKey = path + JSON.stringify(props || {});

	// Si ya existe en cache, devolverlo
	if (elementCache.has(cacheKey)) {
		return elementCache.get(cacheKey);
	}

	let importFn = Pages[`/src${path}.tsx`];
	if (!importFn) importFn = Pages[`/src${path}/index.tsx`];
	if (!importFn) {
		logger.warn("Component not found for path:", path);
		return null;
	}

	let Element = lazyComponentCache.get(path);
	if (!Element) {
		Element = lazy(importFn as any);
		lazyComponentCache.set(path, Element);
	}

	// Crear elemento con Suspense
	const element = (
		<Suspense fallback={<LineLoading />}>
			<Element {...props} />
		</Suspense>
	);

	// Guardar en cache para evitar recrear
	elementCache.set(cacheKey, element);

	return element;
};
