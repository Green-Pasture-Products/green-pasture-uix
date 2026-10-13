"use client";

import React from "react";
import { RichTextEditor as EgfmRichTextEditor } from "@/components/egfm/rich-text";

interface RichTextEditorProps {
	value: string;
	onChange: (html: string) => void;
	placeholder?: string;
	error?: string;
	minHeight?: number;
}

/** Rich text on the egfm editor (bold/italic/lists/alignment), emitting sanitisable HTML. */
const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, error, minHeight = 220 }) => (
	<div className="space-y-1.5">
		<EgfmRichTextEditor value={value} onChange={onChange} placeholder={placeholder} minHeight={minHeight} aria-invalid={!!error} />
		{error && (
			<p role="alert" className="text-destructive text-xs">
				{error}
			</p>
		)}
	</div>
);

export default RichTextEditor;
