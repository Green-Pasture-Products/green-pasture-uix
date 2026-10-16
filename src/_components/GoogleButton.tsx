import React, { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

const GoogleG = () => (
	<svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
		<path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.5 17.7 9.5 24 9.5z" />
		<path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.4-4 6.9-10 6.9-17.1z" />
		<path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z" />
		<path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.9 2.3-8.5 2.3-6.3 0-11.6-4-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
	</svg>
);

// Themed button underneath; Google's real (ID-token) button sits on top, invisible but clickable.
const GoogleButton: React.FC<{ onSuccess: (r: any) => void; onError: () => void; label?: string }> = ({
	onSuccess,
	onError,
	label = "Continue with Google",
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(320); // Google's iframe needs a pixel width (max 400)
	useEffect(() => {
		if (ref.current) setWidth(Math.min(400, Math.round(ref.current.offsetWidth)));
	}, []);

	return (
		<div ref={ref} className="relative h-12 group">
			<div
				className="absolute inset-0 flex items-center justify-center gap-3 rounded-xl text-sm font-semibold transition group-hover:-translate-y-px group-hover:shadow-md"
				style={{ background: "var(--surface-paper)", border: "1px solid var(--border-medium)", color: "var(--text-primary)" }}
			>
				<GoogleG />
				{label}
			</div>
			<div className="absolute inset-0 overflow-hidden rounded-xl opacity-[0.01] [&_iframe]:!h-12">
				<GoogleLogin onSuccess={onSuccess} onError={onError} type="standard" size="large" width={String(width)} useOneTap={false} />
			</div>
		</div>
	);
};

export default GoogleButton;
