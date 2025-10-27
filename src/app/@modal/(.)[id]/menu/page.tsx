import MenuModalWrapper from "@/components/MenuModal/MenuModalWrapper";

interface MenuModalPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function MenuModalPage({ params }: MenuModalPageProps) {
	const { id } = await params;
	return <MenuModalWrapper projectId={id} />;
}
