interface FieldErrorProps {
  id: string;
  message?: string;
}

/** Mensaje de validación asociado a un campo mediante aria-describedby. */
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-primary-700">
      {message}
    </p>
  );
}
