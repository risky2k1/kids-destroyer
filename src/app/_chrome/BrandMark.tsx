const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

type SizeKey = 5 | 7 | 12;

const SIZE_STYLES: Record<SizeKey, { img: string; letter: string }> = {
  5: {
    img: 'size-5',
    letter: 'size-5 text-xs',
  },
  7: {
    img: 'size-7',
    letter: 'size-7 text-sm',
  },
  12: {
    img: 'size-12',
    letter: 'size-12 text-2xl',
  },
};

export function BrandMark({
  logoUrl,
  siteName,
  size = 5,
  className,
}: {
  logoUrl?: string | null;
  siteName?: string;
  size?: SizeKey;
  className?: string;
}) {
  const styles = SIZE_STYLES[size];
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote storage URL, size-5 icon
      <img
        src={logoUrl}
        alt=""
        className={`shrink-0 rounded-sm border-2 border-border object-cover ${styles.img} ${hardShadow} ${className ?? ''}`}
      />
    );
  }
  const letter = siteName?.trim().charAt(0).toUpperCase() || 'T';
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-sm border-2 border-border bg-main font-bold ${styles.letter} ${hardShadow} ${className ?? ''}`}
    >
      {letter}
    </span>
  );
}
