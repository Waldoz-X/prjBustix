import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { RoleDto } from "@/api/services/roleService";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";

export type RoleModalProps = {
	formValue: RoleDto;
	title: string;
	show: boolean;
	onOk: (data: RoleDto) => void;
	onCancel: VoidFunction;
};

export function RoleModal({ title, show, formValue, onOk, onCancel }: RoleModalProps) {
	const form = useForm<RoleDto>({
		defaultValues: formValue,
	});

	useEffect(() => {
		form.reset(formValue);
	}, [formValue, form]);

	return (
		<Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onOk)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							rules={{ required: "Role name is required" }}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Name</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input {...field} placeholder="Enter role name" />
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<DialogFooter>
					<Button variant="outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button onClick={form.handleSubmit(onOk)}>Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
