import React from "react";

interface LoaderProps {
	text?: string;
	width?: string;
}

const Loader = ({ text, width = "1.25rem" }: LoaderProps) => {
	return (
		<div className="flex items-center justify-center">
			<div
				style={{ height: `${width}`, width: `${width}` }}
				className={`animate-spin rounded-full border-b-2 border-green-600 mr-2`}
			></div>
			{text}
		</div>
	);
};

export default Loader;
