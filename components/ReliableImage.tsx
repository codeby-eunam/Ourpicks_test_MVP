'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const FALLBACK_IMAGE = '/restaurant-placeholder.svg';

interface ReliableImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

/** 원격 이미지가 제한되거나 실패하면 배포물에 포함된 이미지를 즉시 표시한다. */
export default function ReliableImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: ReliableImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => setResolvedSrc(src), [src]);

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={resolvedSrc === FALLBACK_IMAGE}
      onError={() => {
        if (resolvedSrc !== FALLBACK_IMAGE) setResolvedSrc(FALLBACK_IMAGE);
      }}
    />
  );
}
