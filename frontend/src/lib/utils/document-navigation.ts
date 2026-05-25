import type React from 'react';

export function handleDocumentNavigation(
  event: React.MouseEvent<HTMLElement>,
  href: string,
  onBeforeNavigate?: () => void,
) {
  onBeforeNavigate?.();

  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  window.location.assign(href);
}
