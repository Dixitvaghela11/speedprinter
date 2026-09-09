import { useEffect, useMemo, useRef, useState, type HTMLAttributes } from "react"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ComboboxInputProps {
  id?: string
  value: string
  options: string[]
  placeholder?: string
  autoComplete?: string
  type?: string
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"]
  onChange: (value: string) => void
  className?: string
}

export function ComboboxInput({
  id,
  value,
  options,
  placeholder,
  autoComplete = "off",
  type = "text",
  inputMode,
  onChange,
  className,
}: ComboboxInputProps) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const matched = useMemo(() => {
    const query = value.trim().toLowerCase()
    const list = query
      ? options.filter((option) => option.toLowerCase().includes(query))
      : options
    return list.slice(0, 12)
  }, [options, value])

  const exactMatch = options.some(
    (option) => option.toLowerCase() === value.trim().toLowerCase(),
  )
  const showCreateHint = Boolean(value.trim()) && !exactMatch

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div className={cn("relative", className)} ref={wrapRef}>
      <Input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        className="pr-10"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false)
        }}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"
        aria-label="Show options"
        onClick={() => setOpen((current) => !current)}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (matched.length > 0 || showCreateHint) && (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border bg-popover p-1 shadow-lg">
          {matched.map((option) => (
            <button
              key={option}
              type="button"
              className="flex w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
            >
              {option}
            </button>
          ))}
          {showCreateHint && (
            <div className="border-t px-3 py-2 text-xs text-muted-foreground">
              Press save to create new: <span className="font-medium text-foreground">{value.trim()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
