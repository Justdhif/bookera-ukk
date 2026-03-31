import * as React from "react"
import { cn } from "@/lib/utils"

export type InputValidationType = 'letters-only' | 'numbers-only' | 'alphanumeric';

interface InputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
  validationType?: InputValidationType;
  onValidationChange?: (isValid: boolean) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function Input({ 
  className, 
  type, 
  validationType,
  onValidationChange,
  onChange,
  ...props 
}: InputProps) {
  const [isValid, setIsValid] = React.useState(true);
  const [shake, setShake] = React.useState(false);
  const [showError, setShowError] = React.useState(false);

  const validateInput = (value: string): boolean => {
    if (!validationType || value === '') return true;

    const hasSpecialChars = /[^a-zA-Z0-9\s]/.test(value);

    switch (validationType) {
      case 'letters-only':
        return /^[a-zA-Z\s]*$/.test(value) && !hasSpecialChars;
      case 'numbers-only':
        return /^[0-9]*$/.test(value) && !hasSpecialChars;
      case 'alphanumeric':
        return /^[a-zA-Z0-9\s]*$/.test(value) && !hasSpecialChars;
      default:
        return true;
    }
  };

  const getErrorMessage = (): string => {
    switch (validationType) {
      case 'letters-only':
        return 'Input can only contain letters';
      case 'numbers-only':
        return 'Input can only contain numbers';
      case 'alphanumeric':
        return 'Input can only contain letters and numbers';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const valid = validateInput(value);
    
    setIsValid(valid);
    setShowError(!valid && value !== '');
    
    if (!valid && value !== '') {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    onValidationChange?.(valid);
    onChange?.(e);
  };

  return (
    <div className="w-full">
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          shake && "animate-shake",
          !isValid && showError && "border-destructive",
          className
        )}
        onChange={handleChange}
        {...props}
      />
      {showError && !isValid && (
        <p className="text-destructive text-xs mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {getErrorMessage()}
        </p>
      )}
    </div>
  )
}

export { Input }