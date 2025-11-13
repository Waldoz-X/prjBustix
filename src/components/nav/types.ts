export type NavItemOptionsProps = {
	depth?: number;
	hasChild?: boolean;
};

export type NavItemStateProps = {
	open?: boolean;
	active?: boolean;
	disabled?: boolean;
	hidden?: boolean;
};

export type NavItemDataProps = {
	path: string;
	title: string;
	icon?: string | React.ReactNode;
	info?: React.ReactNode;
	caption?: string;
	auth?: string[];
	children?: NavItemDataProps[];
	// Allow a generic onClick handler usable by divs and buttons
	onClick?: React.MouseEventHandler<any>;
} & NavItemStateProps;

/**
 * Item
 */
export type NavItemProps = Omit<React.ComponentProps<"div">, "onClick"> & NavItemDataProps & NavItemOptionsProps;

/**
 * List
 */
export type NavListProps = Pick<NavItemProps, "depth"> & {
	data: NavItemDataProps;
	authenticate?: (auth?: NavItemProps["auth"]) => boolean;
};

/**
 * Group
 */
export type NavGroupProps = Omit<NavListProps, "data" | "depth"> & {
	name?: string;
	items: NavItemDataProps[];
};

/**
 * Main
 */
export type NavProps = React.ComponentProps<"nav"> &
	Omit<NavListProps, "data" | "depth"> & {
		data: {
			name?: string;
			items: NavItemDataProps[];
		}[];
	};
