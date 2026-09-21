interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = 'center',
}: SectionHeadingProps) => {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-3xl mb-12 ${alignment}`}>
      {eyebrow && (
        <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider transition-colors">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-2xl md:text-3xl font-bold text-slate-900 dark:text-white transition-colors">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-slate-600 dark:text-slate-400 transition-colors leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
