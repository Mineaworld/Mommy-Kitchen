import Link from "next/link";
import AudioButton from "@/components/audio-button";
import FavoritesSection from "@/components/favorites-section";
import MealPicker from "@/components/meal-picker-wrapper";
import { UserIcon } from "@/components/icons";
import { CategoryCard } from "@/components/public-cards";
import TodaysPicks from "@/components/todays-picks";
import { CategoryRepository } from "@/lib/repositories/CategoryRepository";
import { RecipeRepository } from "@/lib/repositories/RecipeRepository";
import { appCopy } from "@/lib/khmer-labels";

const HomePage = async () => {
  const [categories, recipes] = await Promise.all([CategoryRepository.getAll(), RecipeRepository.getAll()]);

  return (
    <main className="mx-auto min-h-screen max-w-[800px] bg-surface pb-10">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-surface/90 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full p-2 text-primary transition-colors hover:bg-surfaceContainerHigh"
            aria-label="Admin Login"
          >
            <UserIcon />
          </Link>
          <h1 className="m-0 text-2xl font-bold text-primary">{appCopy.appName}</h1>
        </div>
        <AudioButton label="Audio guide" text={appCopy.homePrompt} />
      </header>

      <div className="grid gap-8 px-5 py-5">
        <MealPicker categories={categories} recipes={recipes} />

        <FavoritesSection categories={categories} recipes={recipes} />

        <TodaysPicks recipes={recipes} categories={categories} />

        <section id="categories" className="grid grid-cols-1 gap-4 scroll-mt-20" aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="m-0 text-2xl font-bold text-onSurface">
            {appCopy.categories}
          </h2>
          {categories.map((category) => (
            <CategoryCard category={category} key={category.id} />
          ))}
          {categories.length === 0 ? (
            <div className="rounded-2xl bg-surfaceContainer p-6 text-center">
              <p className="m-0 text-lg font-bold text-onSurfaceVariant">{appCopy.noCategories}</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
};

export default HomePage;
