import ProjectModalWrapper from "@/components/ProjectModal/ProjectModalWrapper";

interface EditProjectPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function EditProjectPage({
	params,
}: EditProjectPageProps) {
	const { id } = await params;
	return <ProjectModalWrapper mode="edit" projectId={id} />;
}
