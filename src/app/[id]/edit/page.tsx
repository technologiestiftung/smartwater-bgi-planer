import ProjectModal from "@/components/ProjectModal/ProjectModal";

interface EditProjectPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function EditProjectPage({
	params,
}: EditProjectPageProps) {
	const { id } = await params;
	return <ProjectModal mode="edit" projectId={id} />;
}
