import ProjectModalWrapper from "@/components/ProjectModal/ProjectModalWrapper";

interface EditProjectModalPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function EditProjectModalPage({
	params,
}: EditProjectModalPageProps) {
	const { id } = await params;
	return <ProjectModalWrapper mode="edit" projectId={id} />;
}
