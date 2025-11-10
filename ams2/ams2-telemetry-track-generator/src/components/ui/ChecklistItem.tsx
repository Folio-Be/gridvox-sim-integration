interface ChecklistItemProps {
  text: string;
  checked?: boolean;
}

export default function ChecklistItem({ text, checked = true }: ChecklistItemProps) {
  return (
    <label className="flex gap-x-4 items-center">
      <div className="flex size-5 items-center justify-center rounded-full bg-primary text-[#131f15]">
        {checked && <span className="material-symbols-outlined text-base">check</span>}
      </div>
      <p className="text-base font-normal leading-normal text-text-light">{text}</p>
    </label>
  );
}
