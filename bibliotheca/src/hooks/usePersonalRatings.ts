import { useCallback, useEffect, useState } from "react";
import { loadRatings, saveRatings } from "../utils/personalRatings";

export interface PersonalRatings {
  ratings: Record<number, number>;
  getRating: (bookId: number) => number | undefined;
  setRating: (bookId: number, rating: number | null) => void;
}

export function usePersonalRatings(): PersonalRatings {
  const [ratings, setRatings] = useState<Record<number, number>>(() =>
    loadRatings()
  );

  useEffect(() => {
    saveRatings(ratings);
  }, [ratings]);

  const getRating = useCallback(
    (bookId: number) => ratings[bookId],
    [ratings]
  );

  const setRating = useCallback((bookId: number, rating: number | null) => {
    setRatings((prev) => {
      const next = { ...prev };
      if (rating === null) {
        delete next[bookId];
      } else {
        next[bookId] = Math.max(0, Math.min(5, rating));
      }
      return next;
    });
  }, []);

  return { ratings, getRating, setRating };
}
