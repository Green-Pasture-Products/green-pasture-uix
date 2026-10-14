import React from "react";
import { Switch } from "@/components/egfm/switch";
import Button from "@/_UI/Button";

/** What a panel is, in one line, above its sections. */
export const PanelHeading: React.FC<{ title: string; description: string }> = ({ title, description }) => (
	<div>
		<h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
			{title}
		</h2>
		<p className="text-sm" style={{ color: "var(--text-hint)" }}>
			{description}
		</p>
	</div>
);

/** Stays in view at the bottom of a long form, so saving never means scrolling back down. */
export const SettingsSaveBar: React.FC<{
	hint?: string;
	resetLabel?: string;
	submitLabel: string;
	onReset: () => void;
	saving?: boolean;
	/** Shown instead of the buttons when the user may look but not save. */
	readOnlyNote?: string;
	/** Nothing to save yet (e.g. the form is unchanged). */
	submitDisabled?: boolean;
}> = ({ hint, resetLabel = "Reset", submitLabel, onReset, saving, readOnlyNote, submitDisabled }) => (
	<div className="border-border bg-card/95 sticky bottom-2 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-md backdrop-blur">
		<p className="min-w-0 truncate text-xs" style={{ color: "var(--text-hint)" }}>
			{readOnlyNote ?? hint ?? ""}
		</p>
		{!readOnlyNote && (
			<div className="ml-auto flex items-center gap-2">
				<Button type="button" variant="outlined" color="secondary" size="sm" onClick={onReset}>
					{resetLabel}
				</Button>
				<Button type="submit" variant="filled" size="sm" loading={saving} disabled={submitDisabled}>
					{submitLabel}
				</Button>
			</div>
		)}
	</div>
);

/** One setting with an on/off switch: its name, what it does, and the switch. */
export const ToggleRow: React.FC<{ id: string; title: string; description: React.ReactNode; checked: boolean; onChange: (next: boolean) => void; testId?: string; disabled?: boolean }> = ({
	id,
	title,
	description,
	checked,
	onChange,
	testId,
	disabled,
}) => (
	<div className="flex items-start justify-between gap-6 py-4">
		<div className="min-w-0">
			<label htmlFor={id} className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
				{title}
			</label>
			<p className="mt-1 max-w-2xl text-xs leading-relaxed" style={{ color: "var(--text-hint)" }}>
				{description}
			</p>
		</div>
		<Switch id={id} checked={checked} onCheckedChange={onChange} data-testid={testId} disabled={disabled} className="mt-0.5" />
	</div>
);
