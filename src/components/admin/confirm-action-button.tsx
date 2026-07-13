"use client";

export function ConfirmActionButton({
  label,
  message,
  children,
  className,
}: {
  label: string;
  message: string;
  children: React.ReactNode;
  className: string;
}) {
  return (
    <button
      className={className}
      aria-label={label}
      title={label}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
