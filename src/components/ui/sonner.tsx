import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="light"
    className="toaster group"
    toastOptions={{
      classNames: {
        toast: "group toast bg-background text-foreground border-border shadow-lg",
      },
    }}
    {...props}
  />
)

export { Toaster }
