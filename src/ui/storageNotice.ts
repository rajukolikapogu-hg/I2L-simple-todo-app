export const STORAGE_NOTICE =
  'Tasks are saved in this browser only. Clearing your browsing data — or using ' +
  'a private window — will erase them.';

export const NO_STORAGE_NOTICE =
  'This browser is not saving data, so tasks will only last until you close the tab.';

/**
 * A small standing notice about the local-storage limitation.
 *
 * `role="note"` rather than a live region: the text is present from first paint
 * and never changes, so announcing it as an alert would interrupt the user for
 * something that is simply part of the page.
 */
export function createStorageNotice(persistent: boolean): HTMLElement {
  const notice = document.createElement('p');
  notice.className = persistent ? 'notice' : 'notice notice--warning';
  notice.setAttribute('role', 'note');
  notice.textContent = persistent ? STORAGE_NOTICE : NO_STORAGE_NOTICE;
  return notice;
}
