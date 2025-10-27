import MenuModalWrapper from "@/components/MenuModal/MenuModalWrapper";

interface MenuPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function MenuPage({ params }: MenuPageProps) {
	const { id } = await params;
	return <MenuModalWrapper projectId={id} />;
}
