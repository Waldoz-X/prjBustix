## Features

- Built using React 19 hooks.
- Powered by Vite for rapid development and hot module replacement.
- Integrates shadcn/ui, providing a rich set of UI components and design patterns.
- Written in TypeScript, offering type safety and an improved development experience.
- Responsive design, adapting to various screen sizes and devices.
- Flexible routing configuration, supporting nested routes.
- Integrated access control based on user roles.
- Supports internationalization for easy language switching.
- Includes common admin features like user management, role management, and permission management.
- Customizable themes and styles to meet your branding needs.
- Mocking solution based on MSW and Faker.js.
- State management using Zustand.
- Data fetching using React-Query.

## Quick Start

### Get the Project Code

```bash
git clone https://github.com/d3george/slash-admin.git
```

### Install Dependencies

In the project's root directory, run the following command to install project dependencies:

```bash
pnpm install
```

### Start the Development Server

Run the following command to start the development server:

```bash
pnpm dev
```

Visit [http://localhost:3001](http://localhost:3001) to view your application.

### Build for Production

Run the following command to build the production version:

```bash
pnpm build
```

## Git Contribution submission specification
- `feat` new features
- `fix`  fix the
- `docs` documentation or comments
- `style` code format (changes that do not affect code execution)
- `refactor` refactor
- `perf` performance optimization
- `revert` revert commit
- `test` test related
- `chore` changes in the construction process or auxiliary tools
- `ci` modify CI configuration and scripts
- `types` type definition file changes
- `wip` in development

## Cómo agregar rutas a la Navbar y personalizar el Header

### Estructura de la Navbar (barra lateral)

La barra lateral (navbar) se construye a partir de un arreglo de secciones, donde cada sección tiene un nombre (`name`) y un arreglo de items (`items`). Cada item puede ser una ruta, un grupo de rutas (con `children`), o un enlace especial. Esta estructura se encuentra en:

`src/layouts/dashboard/nav/nav-data/nav-data-frontend.tsx`

- **Sección:**
  - `name`: Nombre de la sección (puede ser string o key de traducción)
  - `items`: Array de rutas o grupos de rutas
- **Item (ruta):**
  - `title`: Nombre visible o key de traducción
  - `path`: Ruta a la que navega
  - `icon`: (opcional) Icono a mostrar
  - `info`: (opcional) Badge o información extra
  - `children`: (opcional) Submenús o rutas anidadas
  - Otros: `disabled`, `hidden`, `auth`, `caption`, etc.

La navbar se renderiza automáticamente recorriendo este arreglo, por lo que solo necesitas agregar o modificar secciones/items en este archivo para que aparezcan en la barra lateral.

---

### Agregar una ruta a la Navbar (barra lateral)

Las rutas de la barra lateral se definen en el archivo:
`src/layouts/dashboard/nav/nav-data/nav-data-frontend.tsx`

Cada sección es un objeto con un nombre (`name`) y un arreglo de items (`items`). Cada item representa una ruta o grupo de rutas. Ejemplo básico:

```typescript
{
  name: "BusTix",
  items: [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <Icon icon="solar:home-2-bold-duotone" size="24" />,
    },
    {
      title: "Notificaciones",
      path: "/notifications",
      icon: <Icon icon="solar:bell-bing-bold-duotone" size="24" />,
      info: <Badge variant="destructive">5</Badge>,
    },
  ],
}
```

Puedes agregar más rutas siguiendo la misma estructura. Los campos más usados son:
- `title`: Nombre visible o key de traducción
- `path`: Ruta a la que navega
- `icon`: (opcional) Icono a mostrar
- `info`: (opcional) Badge o información extra
- `children`: (opcional) Submenús o rutas anidadas

---

### Personalizar el Header (cabecera)

El header principal del dashboard se encuentra en:
`src/layouts/dashboard/header.tsx`

Puedes personalizarlo usando la prop `leftSlot` para mostrar un elemento a la izquierda (por ejemplo, un botón de menú o un logo):

```typescriptreact
<Header leftSlot={<MiBotonMenu />} />
```

El header también muestra el breadcrumb (si está habilitado en settings) y los botones de notificación y configuración a la derecha. Es sticky, siempre visible en la parte superior.

---
