import Link from "next/link";
import AudioButton from "@/components/audio-button";
import { BackIcon } from "@/components/icons";
import { RecipeCard } from "@/components/public-cards";
import TrackCategoryOpen from "@/components/track-category-open";
import { CategoryRepository } from "@/lib/repositories/CategoryRepository";
import { RecipeRepository } from "@/lib/repositories/RecipeRepository";
import { appCopy } from "@/lib/khmer-labels";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { slug } = await params;
  const categories = await CategoryRepository.getAll();
  const category = categories.find((item) => item.slug === slug);
  const recipes = await RecipeRepository.getByCategorySlug(slug);

  if (!category) {
    return (
      <main className="mx-auto min-h-screen max-w-[800px] bg-surface px-4 py-8">
        <Link className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surfaceContainerHighest text-onSurface" href="/" aria-label={appCopy.backHome}>
          <BackIcon />
        </Link>
        <section className="rounded-2xl bg-surfaceContainer p-6 text-center">
          <h1 className="m-0 text-2xl font-bold text-onSurface">រកមិនឃើញប្រភេទម្ហូបទេ</h1>
          <p className="m-0 mt-2 text-base font-medium text-onSurfaceVariant">ប្រភេទនេះត្រូវបានលុប ឬ បិទ</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[800px] bg-surface pb-8">
      <TrackCategoryOpen categoryId={category.id} />

      <header className="sticky top-0 z-10 flex h-16 items-center gap-3 bg-surface/90 px-4 backdrop-blur-md">
        <Link className="inline-flex h-12 w-12 items-center justify-center rounded-full text-primary transition-colors hover:bg-surfaceContainerHigh" aria-label={appCopy.backHome} href="/">
          <BackIcon />
        </Link>
        <h1 className="m-0 min-w-0 flex-1 truncate text-2xl font-bold text-primary">{category.name_km}</h1>
        <AudioButton label="Audio guide" text={category.name_km} />
      </header>

      <div className="grid gap-4 px-5 py-5">
        {recipes.length > 0 ? (
          <section className="grid grid-cols-1 gap-4" aria-label={category.name_km}>
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                categoryName={category.name_km}
                priority={index === 0}
              />
            ))}
          </section>
        ) : (
          <section className="rounded-2xl bg-surfaceContainer p-6 text-center">
            <h2 className="m-0 text-xl font-bold text-onSurface">{appCopy.noRecipes}</h2>
            <p className="m-0 mt-2 text-base font-medium text-onSurfaceVariant">មុខម្ហូបសម្រាប់ប្រភេទនេះនឹងបន្ថែមពេលក្រោយ</p>
          </section>
        )}
      </div>
    </main>
  );
};

export default CategoryPage;
