import MenuModal from "@/components/MenuModal/MenuModal";

interface MenuModalPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function MenuModalPage({ params }: MenuModalPageProps) {
	const { id } = await params;
	return <MenuModal projectId={id} />;
}
