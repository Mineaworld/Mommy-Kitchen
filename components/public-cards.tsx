import Image from "next/image";
import Link from "next/link";
import { PlayIcon } from "@/components/icons";
import AudioButton from "@/components/audio-button";
import { appCopy } from "@/lib/khmer-labels";
import type { Category, Recipe } from "@/lib/types";

type RecipeCardProps = {
  recipe: Recipe;
  categoryName?: string;
  priority?: boolean;
};

export const RecipeCard = ({ recipe, categoryName, priority = false }: RecipeCardProps) => {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-outlineVariant bg-surfaceContainerLowest shadow-[0_4px_14px_rgba(0,0,0,0.1)]">
      <Link href={`/recipe/${recipe.id}`} className="group block">
        <div className="relative h-[220px] overflow-hidden bg-surfaceContainerLow">
          <Image
            src={recipe.thumbnail_url}
            alt={recipe.title_km}
            width={720}
            height={460}
            priority={priority}
            sizes="(max-width: 800px) 100vw, 800px"
            className="h-full w-full object-cover transition-transform duration-200 group-active:scale-[0.98]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="m-0 line-clamp-2 text-3xl font-bold leading-tight text-white">{recipe.title_km}</h3>
            {categoryName ? (
              <p className="m-0 mt-1 text-base font-semibold text-white/85">{categoryName}</p>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="absolute right-3 top-3 z-10">
        <AudioButton
          label={`ស្តាប់ ${recipe.title_km}`}
          text={recipe.title_km}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary shadow-sm !min-h-12 !min-w-12 transition-transform hover:scale-110 active:scale-95"
        />
      </div>
      <div className="grid gap-3 p-4">
        {recipe.duration_minutes ? (
          <p className="m-0 text-base font-semibold text-onSurfaceVariant">{recipe.duration_minutes} នាទី</p>
        ) : null}
        <Link
          href={`/recipe/${recipe.id}`}
          className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-primary px-5 text-lg font-bold text-onPrimary shadow-sm transition-transform active:scale-95"
        >
          <PlayIcon />
          {appCopy.openRecipe}
        </Link>
      </div>
    </article>
  );
};

type CategoryCardProps = {
  category: Category;
};

export const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <div className="relative block h-[200px] overflow-hidden rounded-2xl bg-surfaceContainerLow shadow-[0_4px_14px_rgba(0,0,0,0.1)] transition-transform active:scale-[0.98]">
      <Link
        href={`/category/${category.slug}`}
        className="group absolute inset-0 z-0 block h-full w-full"
      >
        <Image
          src={category.cover_image_url}
          alt={category.name_km}
          width={720}
          height={420}
          sizes="(max-width: 800px) 100vw, 800px"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <h3 className="absolute bottom-4 left-4 right-4 m-0 line-clamp-2 text-3xl font-bold leading-tight text-white">
          {category.name_km}
        </h3>
      </Link>
      <div className="absolute right-3 top-3 z-10">
        <AudioButton
          label={`ស្តាប់ ${category.name_km}`}
          text={category.name_km}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary shadow-sm !min-h-12 !min-w-12 transition-transform hover:scale-110 active:scale-95"
        />
      </div>
    </div>
  );
};
