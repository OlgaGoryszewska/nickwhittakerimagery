"use client";

import { useEffect } from "react";
import type { Photo } from "@/app/lib/catalog";
import { recordPhotoView } from "./RecentlyViewed";

export default function RecordPhotoView({ photo }: { photo: Photo }) {
  useEffect(() => {
    recordPhotoView(photo);
  }, [photo]);

  return null;
}
