import { useState, useCallback, useId } from 'react';
import { Search, X } from 'lucide-react';
import clsx from 'clsx';

export default function SearchBar({
  placeholder = 'Search tools...',
  value,
  onChange,
  onClear,
  className = '',
  autoFocus = false,
  suggestions = [],
}) {
  const inputId = useId();
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback(
    (e) => onChange?.(e.target.value),
    [onChange]
  );

  return (
    <div className={clsx('relative w-full', className)}>
      <div
        className="relative flex items-center rounded-xl transition-all"
        style={{
          background: 'var(--bg-secondary)',
          border: `1px solid ${focused ? 'var(--accent-electric)' : 'var(--border-medium)'}`,
          boxShadow: focused ? '0 0 0 3px var(--accent-lime-glow)' : 'none',
        }}
      >
        <Search
          className="absolute left-4 w-4 h-4 pointer-events-none transition-colors"
          style={{ color: focused ? 'var(--accent-electric)' : 'var(--text-muted)' }}
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-transparent py-3 pl-11 pr-10 text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
          aria-label={placeholder}
          aria-autocomplete="list"
          role="searchbox"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 p-1 rounded-md transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && !value && (
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Popular:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange?.(s)}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-lime)';
                e.currentTarget.style.color = 'var(--accent-lime)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
