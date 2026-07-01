"use client";

import { useCallback, useState } from "react";
import ImageLightbox, { type ImageRef } from "@/components/image-lightbox";
import { RecipeCard } from "@/components/public-cards";
import type { Recipe } from "@/lib/types";

type RecipeCardWithLightboxProps = {
  recipe: Recipe;
  categoryName?: string;
  priority?: boolean;
};

const RecipeCardWithLightbox = ({
  recipe,
  categoryName,
  priority,
}: RecipeCardWithLightboxProps) => {
  const [selectedImage, setSelectedImage] = useState<ImageRef | null>(null);

  const handleViewImage = useCallback(() => {
    setSelectedImage({
      url: recipe.thumbnail_url,
      alt: recipe.title_km,
      title: recipe.title_km,
    });
  }, [recipe]);

  const handleLightboxOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedImage(null);
  }, []);

  return (
    <>
      <RecipeCard
        recipe={recipe}
        categoryName={categoryName}
        priority={priority}
        onViewImage={handleViewImage}
      />
      <ImageLightbox
        image={selectedImage}
        open={selectedImage !== null}
        onOpenChange={handleLightboxOpenChange}
      />
    </>
  );
};

export default RecipeCardWithLightbox;
