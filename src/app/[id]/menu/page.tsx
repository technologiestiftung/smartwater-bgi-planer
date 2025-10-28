import MenuModal from "@/components/MenuModal/MenuModal";

interface MenuPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function MenuPage({ params }: MenuPageProps) {
	const { id } = await params;
	return <MenuModal projectId={id} />;
}
