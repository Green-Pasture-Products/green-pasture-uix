import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import { useAppDispatch } from "@/_redux/store";
import { tagAction } from "@/_redux/actions/tag.action";
import Modal from "@/_UI/Modal";
import { FormInput, FormTextarea, FormActions } from "@/_UI/FormField";
import type { Tag } from "@/types";

const schema = z.object({
	name: z.string().min(1, "Name is required").max(60, "Keep it under 60 characters"),
	description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AddTagProps {
	tag?: Tag | null;
	children?: React.ReactNode;
	className?: string;
	title?: string;
	/** Opens on mount — used when the table drives an edit. */
	openInitially?: boolean;
	onClose?: () => void;
	onSaved?: () => void;
}

/**
 * Tags are plain labels, so the description stays a plain textarea — the rich
 * editor is for product and category copy that shoppers actually read.
 */
const AddTag: React.FC<AddTagProps> = ({ tag, children, className, title = "add tag", openInitially, onClose, onSaved }) => {
	const dispatch = useAppDispatch();
	const [isOpen, setIsOpen] = useState(!!openInitially);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: { name: tag?.name ?? "", description: tag?.description ?? "" },
	});

	useEffect(() => {
		reset({ name: tag?.name ?? "", description: tag?.description ?? "" });
	}, [tag, reset]);

	const handleClose = () => {
		setIsOpen(false);
		reset({ name: tag?.name ?? "", description: tag?.description ?? "" });
		onClose?.();
	};

	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true);
		try {
			if (tag) {
				await dispatch(tagAction.updateTag({ id: tag.id, name: data.name, description: data.description || "" })).unwrap();
				toast.success("Tag updated");
			} else {
				await dispatch(tagAction.createTag({ name: data.name, description: data.description || "" })).unwrap();
				toast.success("Tag created");
			}
			// Refresh the assign control's list too, not just the table.
			dispatch(tagAction.fetchTags());
			onSaved?.();
			handleClose();
		} catch (error: any) {
			toast.error(error || "Something went wrong");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			{!openInitially && (
				<button title={title} onClick={() => setIsOpen(true)} className={className} type="button">
					{children}
				</button>
			)}

			<Modal
				isOpen={isOpen}
				onClose={handleClose}
				title={tag ? "Edit Tag" : "Add New Tag"}
				subtitle={tag ? "Update the tag details" : "Tags describe who a product is for"}
			>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<FormInput
						label="Tag Name"
						placeholder="e.g. Children"
						required
						{...register("name")}
						error={errors.name?.message}
					/>

					<FormTextarea
						label="Description"
						rows={3}
						placeholder="What this tag means, e.g. Safe for children"
						{...register("description")}
						error={errors.description?.message}
					/>

					<FormActions
						onCancel={handleClose}
						submitLabel={tag ? "Update Tag" : "Create Tag"}
						isSubmitting={isSubmitting}
					/>
				</form>
			</Modal>
		</>
	);
};

export default AddTag;
