import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent 
        transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
        disabled:cursor-not-allowed disabled:opacity-40
        ${checked ? "bg-emerald-500" : "bg-zinc-700"}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 
          transition duration-150 ease-out my-auto ml-[1px]
          ${checked ? "translate-x-4" : "translate-x-0"}
        `}
      />
    </button>
  );
};
