import { Plus } from 'lucide-react';

type Props = {
  onClick: () => void;
  text?: string;
  label?: string;
};

export function FAB({ onClick, text, label = 'New' }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="fixed gap-1 bottom-6 right-6 z-40 flex p-3 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-colors duration-[100ms] hover:bg-brand-hover active:bg-brand-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <Plus size={18} aria-hidden="true" /> 
      {text && <span className='text-sm'>{text}</span>}
    </button>
  );
}
