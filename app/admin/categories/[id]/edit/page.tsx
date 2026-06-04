import { CategoryForm } from "@/components/category-form";

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

const EditCategoryPage = async ({ params }: EditCategoryPageProps) => {
  const { id } = await params;
  return <CategoryForm mode="edit" categoryId={id} />;
};

export default EditCategoryPage;
