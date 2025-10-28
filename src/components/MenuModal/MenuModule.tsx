import { FC, ReactNode } from "react";

interface MenuModuleProps {
	title: string;
	description: string;
	sideElements?: ReactNode;
	additionalInfo?: string;
	buttonBottom?: ReactNode;
}

const MenuModule: FC<MenuModuleProps> = ({
	title,
	description,
	sideElements,
	additionalInfo,
	buttonBottom,
}) => {
	const showFooter = additionalInfo && buttonBottom;

	return (
		<div className="MenuModule-root border-muted flex flex-col border p-6">
			<div className="mb-4 flex gap-4">
				<div className="flex flex-grow flex-col">
					<h4 className="text-primary font-bold">{title}</h4>
					<p className="">{description}</p>
				</div>
				{sideElements && <div className="flex-shrink">{sideElements}</div>}
			</div>

			{showFooter && (
				<div className="mt-4 flex items-center justify-between">
					<span className="text-primary italic">{additionalInfo}</span>
					{buttonBottom}
				</div>
			)}
		</div>
	);
};

export default MenuModule;
