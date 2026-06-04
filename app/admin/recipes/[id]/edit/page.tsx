import { RecipeForm } from "@/components/recipe-form";

type EditRecipePageProps = {
  params: Promise<{ id: string }>;
};

const EditRecipePage = async ({ params }: EditRecipePageProps) => {
  const { id } = await params;

  return <RecipeForm mode="edit" recipeId={id} />;
};

export default EditRecipePage;
