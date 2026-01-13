import { XCircleIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { FC } from "react";
import { Button } from "../ui/button";

interface FeatureModalProps {
	attributes: Record<string, any> | null;
	layerId: string | null;
	onClose: () => void;
}

const FeatureModal: FC<FeatureModalProps> = ({ attributes, onClose }) => {
	if (!attributes) return null;

	const profilUrl = attributes["Profil"];

	return (
		<div className="FeatureModal-root fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
			<div className="bg-background flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg shadow-2xl">
				<div className="border-muted flex h-8 min-h-12 w-full items-center justify-between border-b pl-2">
					<h2 className="text-xl font-bold">Bohrprofil</h2>

					<div className="bg-secondary h-12 w-12 text-white">
						<button
							className="flex h-full w-full items-center justify-center"
							onClick={onClose}
						>
							<XCircleIcon />
						</button>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-2">
					<div className="flex flex-col gap-8 lg:flex-row">
						{profilUrl && (
							<div className="flex w-full flex-col gap-2">
								<div className="rounded-md bg-white">
									<Image
										src={profilUrl}
										alt="Bohrprofil"
										className="h-auto min-h-[300px] w-full object-contain"
										layout="responsive"
										objectFit="contain"
										onError={() => null}
										width={300}
										height={100}
									/>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="bg-muted/10 flex justify-end border-t p-4">
					<Button onClick={onClose}>Schließen</Button>
				</div>
			</div>
		</div>
	);
};

export default FeatureModal;
