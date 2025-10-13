import React from "react";

const Spinner = ({ text }: { text?: string | null }) => {
	return (
		<div className="flex items-center">
			<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
			{text && text}
		</div>
	);
};

export default Spinner;
