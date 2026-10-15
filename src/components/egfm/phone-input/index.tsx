import * as React from "react";
import { cn } from "../lib/utils";
import { Combobox } from "../combobox";
import { COUNTRIES, countryByCode, type Country } from "../countries";
import { formatNational, nationalDigits, parsePhone, toE164 } from "./phone";

export { formatNational, parsePhone, phoneField, phoneProblem, toE164 } from "./phone";

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  /** E.164, e.g. "+233241234567"; "" while empty. */
  value?: string;
  onChange?: (e164: string, country: Country) => void;
  /** ISO code whose dial code an empty number starts on; following it while no digits are typed. */
  defaultCountry?: string;
  error?: boolean;
}

const DIAL_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name, hint: c.dial }));
const fallback = (code?: string) => countryByCode(code) ?? countryByCode("NG")!;

function stateFor(value: string | undefined, defaultCountry?: string) {
  return parsePhone(value, defaultCountry) ?? { country: fallback(defaultCountry), national: "" };
}

/** A dial-code picker plus the national number; emits E.164. Pasting "+234 803…" switches the dial code. */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, defaultCountry, disabled, error, placeholder, ...props }, ref) => {
    const [state, setState] = React.useState(() => stateFor(value, defaultCountry));
    // "+23" typed so far: shown as typed until it names a dial code.
    const [draft, setDraft] = React.useState<string | null>(null);
    const [seen, setSeen] = React.useState({ value, defaultCountry });
    const { country, national } = state;

    if (seen.value !== value || seen.defaultCountry !== defaultCountry) {
      setSeen({ value, defaultCountry });
      if (seen.value !== value && (value ?? "") !== toE164(country, national)) {
        setState(stateFor(value, defaultCountry));
        setDraft(null);
      } else if (seen.defaultCountry !== defaultCountry && !national && !draft && countryByCode(defaultCountry)) {
        setState({ country: fallback(defaultCountry), national: "" });
      }
    }

    const emit = (next: { country: Country; national: string }) => {
      setState(next);
      onChange?.(toE164(next.country, next.national), next.country);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value.trimStart();
      if (/^(\+|00\d)/.test(text)) {
        const parsed = parsePhone(text, country.code);
        setDraft(parsed ? null : text.replace(/[^\d+]/g, ""));
        if (parsed) emit(parsed);
        else if (national) emit({ country, national: "" });
        return;
      }
      setDraft(null);
      emit({ country, national: nationalDigits(text, country) });
    };

    return (
      <div
        className={cn(
          "flex h-9 pointer-coarse:h-12 w-full items-center rounded-lg border border-input bg-card shadow-xs transition-all duration-200 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring",
          (error || props["aria-invalid"] === true) && "border-destructive",
          disabled && "opacity-50",
          className,
        )}
      >
        <Combobox
          aria-label="Country code"
          value={country.code}
          onValueChange={(code) => {
            setDraft(null);
            emit({ country: fallback(code), national: nationalDigits(national, fallback(code)) });
          }}
          options={DIAL_OPTIONS}
          searchPlaceholder="Search country or code"
          disabled={disabled}
          renderValue={() => (
            <span className="flex items-center gap-1.5">
              <span aria-hidden>{country.flag}</span>
              <span className="font-mono">{country.dial}</span>
            </span>
          )}
          className="h-full pointer-coarse:min-h-0 w-auto shrink-0 rounded-r-none border-0 border-r border-border/80 bg-secondary/40 shadow-none focus:ring-0"
          contentClassName="w-72"
        />
        <input
          ref={ref}
          type="tel"
          inputMode="tel"
          disabled={disabled}
          value={draft ?? formatNational(national)}
          onChange={handleChange}
          placeholder={placeholder ?? formatNational("1234567890".slice(0, country.max))}
          className="h-full min-w-0 flex-1 bg-transparent px-3 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed"
          {...props}
        />
      </div>
    );
  },
);
PhoneInput.displayName = "PhoneInput";
