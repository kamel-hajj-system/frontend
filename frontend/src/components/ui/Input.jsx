import React from 'react';

export function Input({
  label,
  error,
  type = 'text',
  className = '',
  id,
  required,
  dir,
  ...props
}) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-text)] mb-1">
          {label}
          {required && <span className="text-[var(--color-danger)] ms-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        dir={dir}
        className={`
          w-full px-3 py-2 rounded-lg border bg-[var(--color-surface)] text-[var(--color-text)]
          placeholder-[var(--color-muted-foreground)]
          border-[var(--color-border)] focus:border-[var(--color-primary)]
          focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-[var(--color-danger)]' : ''}
          ${className}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
