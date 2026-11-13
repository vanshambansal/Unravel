'use client';

import { useRouter } from 'next/navigation';
import { useTransition, useRef, useState, useEffect, useId } from 'react';
import { reportSearch, type ReportQuery } from './management';

export function ReportSearchForm({ base, query }: { base: string; query: ReportQuery }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(query.q);
  const [statusValue, setStatusValue] = useState(query.status);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editVersion = useRef(0);
  const searchIntent = useRef<{ q: string; status: ReportQuery['status']; version: number } | null>(null);
  const inputId = useId();
  const statusId = useId();

  // A pending search must not undo a later link click or Back navigation.
  useEffect(() => {
    const cancel = () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); debounceTimerRef.current = null; searchIntent.current = null; };
    const onNavigate = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a[href]')) cancel();
    };
    document.addEventListener('click', onNavigate, true);
    window.addEventListener('popstate', cancel);
    return () => { cancel(); document.removeEventListener('click', onNavigate, true); window.removeEventListener('popstate', cancel); };
  }, []);

  // Keep newer typing intact when an earlier server response arrives.
  // External navigation clears the pending intent and restores URL-owned state.
  useEffect(() => {
    const pending = searchIntent.current;
    if (pending && (pending.version !== editVersion.current || pending.q !== query.q || pending.status !== query.status)) return;
    searchIntent.current = null;
    setSearchValue(query.q);
    setStatusValue(query.status);
  }, [query.q, query.status]);

  // Global keyboard shortcut: '/' to focus search input
  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if (
        event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName) &&
        !(event.target as HTMLElement)?.isContentEditable
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  function applySearch(newQ: string, newStatus: ReportQuery['status']) {
    const search = reportSearch({ q: newQ.trim(), status: newStatus, page: 1 }, 1);
    if (location.pathname + location.search === base + search && !searchIntent.current) return;
    searchIntent.current = { q: newQ.trim(), status: newStatus, version: editVersion.current };
    startTransition(() => {
      router.push(`${base}${search}`, { scroll: false });
    });
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    editVersion.current++;
    const val = event.target.value;
    setSearchValue(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      applySearch(val, statusValue);
    }, 220);
  }

  function handleStatusChange(event: React.ChangeEvent<HTMLSelectElement>) {
    editVersion.current++;
    const newStatus = event.target.value as ReportQuery['status'];
    setStatusValue(newStatus);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    applySearch(searchValue, newStatus);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      if (searchValue) {
        handleClearQuery();
      } else {
        inputRef.current?.blur();
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      applySearch(searchValue, statusValue);
    }
  }

  function handleClearQuery() {
    editVersion.current++;
    setSearchValue('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    applySearch('', statusValue);
    inputRef.current?.focus();
  }

  function handleRemoveStatusFilter() {
    editVersion.current++;
    setStatusValue('all');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    applySearch(searchValue, 'all');
  }

  function handleClearAll() {
    editVersion.current++;
    setSearchValue('');
    setStatusValue('all');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    startTransition(() => {
      searchIntent.current = { q: '', status: 'all', version: editVersion.current };
      router.push(base, { scroll: false });
    });
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    applySearch(searchValue, statusValue);
  }

  const hasActiveFilters = Boolean(query.q || query.status !== 'all');

  return (
    <div className={`report-search-container${isPending ? ' is-pending' : ''}`}>
      <form
        role="search"
        onSubmit={onSubmit}
        method="get"
        action={base}
        className="report-search-bar"
        aria-label="Find reports"
      >
        <div className="report-search-input-wrapper">
          <span className="report-search-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <label htmlFor={inputId} className="report-search-visually-hidden">
            Search reports
          </label>
          <input
            ref={inputRef}
            id={inputId}
            className="report-search-input"
            type="search"
            name="q"
            value={searchValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            maxLength={200}
            autoComplete="off"
            spellCheck={false}
            placeholder="Search reports by title or description…"
          />
          <div className="report-search-input-actions">
            {searchValue ? (
              <button
                type="button"
                className="report-search-clear-btn"
                onClick={handleClearQuery}
                title="Clear search query (Esc)"
                aria-label="Clear search query"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ) : (
              <kbd className="report-search-kbd" title="Press / to focus search">
                /
              </kbd>
            )}
            {isPending && (
              <span className="report-search-spinner" aria-label="Searching…">
                <span className="report-search-spinner-dot" />
              </span>
            )}
          </div>
        </div>

        <div className="report-search-filter-wrapper">
          <label htmlFor={statusId} className="report-search-visually-hidden">
            Filter by status
          </label>
          <div className="report-search-select-wrapper">
            <select
              id={statusId}
              aria-label="Filter by status"
              className="report-search-select"
              name="status"
              value={statusValue}
              onChange={handleStatusChange}
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
            <span className="report-search-select-arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="product-button secondary report-search-submit"
          disabled={isPending}
        >
          {isPending ? 'Filtering…' : 'Filter'}
        </button>
      </form>

      {hasActiveFilters && (
        <div className="report-search-active-filters" aria-label="Active filters">
          <span className="report-search-filter-label">Active:</span>
          {query.q && (
            <span className="report-search-chip">
              <span className="report-search-chip-key">Query:</span>
              <span className="report-search-chip-val">"{query.q}"</span>
              <button
                type="button"
                className="report-search-chip-remove"
                onClick={handleClearQuery}
                aria-label={`Remove query filter "${query.q}"`}
              >
                ✕
              </button>
            </span>
          )}
          {query.status !== 'all' && (
            <span className="report-search-chip">
              <span className="report-search-chip-key">Status:</span>
              <span className="report-search-chip-val">{query.status === 'open' ? 'Open' : 'Resolved'}</span>
              <button
                type="button"
                className="report-search-chip-remove"
                onClick={handleRemoveStatusFilter}
                aria-label={`Remove status filter "${query.status}"`}
              >
                ✕
              </button>
            </span>
          )}
          <button
            type="button"
            className="report-search-clear-all"
            onClick={handleClearAll}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
