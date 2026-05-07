type Segment<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ segments, value, onChange }: Props<T>) {
  return (
    <div className="flex gap-0.5 rounded-lg bg-hover p-0.5">
      {segments.map((seg) => (
        <button
          key={seg.value}
          type="button"
          onClick={() => onChange(seg.value)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-[100ms] ${
            value === seg.value
              ? 'bg-surface text-text shadow-xs'
              : 'text-muted hover:text-text'
          }`}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}
