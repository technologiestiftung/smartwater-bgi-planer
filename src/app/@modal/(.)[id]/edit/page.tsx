import ProjectModal from "@/components/ProjectModal/ProjectModal";

interface EditProjectModalPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function EditProjectModalPage({
	params,
}: EditProjectModalPageProps) {
	const { id } = await params;
	return <ProjectModal mode="edit" projectId={id} />;
}
