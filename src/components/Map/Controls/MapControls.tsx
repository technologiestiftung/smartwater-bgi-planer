import { FC } from "react";

interface MapControlsProps {
	children: React.ReactNode;
}

const MapControls: FC<MapControlsProps> = ({ children }) => {
	return <>{children}</>;
};

export default MapControls;
