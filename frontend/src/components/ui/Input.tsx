import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, id, className = '', ...rest }, ref) => {
        const inputId = id ?? rest.name;

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label htmlFor={inputId} className="text-sm font-medium text-text">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
            w-full px-4 py-2.5 rounded-sm bg-surface text-text
            border border-border
            placeholder:text-text-subtle
            focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary
            transition-all duration-150
            ${error ? 'border-danger focus:ring-danger-light focus:border-danger' : ''}
            ${className}
          `}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...rest}
                />
                {error && (
                    <span id={`${inputId}-error`} className="text-xs text-danger">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';