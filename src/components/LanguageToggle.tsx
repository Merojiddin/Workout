import { Languages } from 'lucide-react'
import { useLanguage } from '../i18n'

interface LanguageToggleProps {
  /**
   * `segmented` is the full row of language names, used in Settings and on the
   * first-run screens. `compact` is the icon-sized control for the top bar,
   * showing only the two-letter code.
   */
  variant?: 'segmented' | 'compact'
  className?: string
}

/**
 * The language picker.
 *
 * Renders one button per language in the registry rather than toggling between
 * two, so adding a third language needs no change here.
 */
export function LanguageToggle({
  variant = 'segmented',
  className = '',
}: LanguageToggleProps) {
  const { language, languages, setLanguage, t } = useLanguage()

  return (
    <div
      aria-label={t('language.picker')}
      className={`language-toggle language-toggle--${variant} ${className}`.trim()}
      role="group"
    >
      {variant === 'compact' ? (
        <Languages
          size={15}
          strokeWidth={2.4}
          aria-hidden="true"
          className="language-toggle__icon"
        />
      ) : null}
      {languages.map((option) => {
        const selected = option.code === language

        return (
          <button
            aria-pressed={selected}
            className="language-toggle__option"
            key={option.code}
            // The label names the target language in that language, so someone
            // who cannot read the current one can still find their way out.
            title={t('language.switchTo', { language: option.nativeLabel })}
            onClick={() => setLanguage(option.code)}
            type="button"
          >
            {variant === 'compact' ? option.shortLabel : option.nativeLabel}
          </button>
        )
      })}
    </div>
  )
}
