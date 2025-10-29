import React from "react";

interface LoaderProps {
	text?: string;
}

const Loader = ({ text }: LoaderProps) => {
	return (
		<div className="flex items-center justify-center">
			<div
				className={`animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-2`}
			></div>
			{text}
		</div>
	);
};

export default Loader;
