import { useCallback, useEffect, useState } from "react";
import { type BookStatus, loadStatusMap, saveStatusMap } from "../utils/library";

export interface LibraryStatus {
  statusMap: Record<number, BookStatus>;
  getStatus: (bookId: number) => BookStatus | undefined;
  setStatus: (bookId: number, status: BookStatus | null) => void;
}

export function useLibraryStatus(): LibraryStatus {
  const [statusMap, setStatusMap] = useState<Record<number, BookStatus>>(() =>
    loadStatusMap()
  );

  useEffect(() => {
    saveStatusMap(statusMap);
  }, [statusMap]);

  const getStatus = useCallback(
    (bookId: number) => statusMap[bookId],
    [statusMap]
  );

  const setStatus = useCallback(
    (bookId: number, status: BookStatus | null) => {
      setStatusMap((prev) => {
        const next = { ...prev };
        if (status === null) {
          delete next[bookId];
        } else {
          next[bookId] = status;
        }
        return next;
      });
    },
    []
  );

  return { statusMap, getStatus, setStatus };
}
