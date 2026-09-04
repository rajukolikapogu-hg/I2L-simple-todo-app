import { isIsoDate, type NewTaskInput } from './task';

export interface ValidationResult {
  valid: boolean;
  /** Field name -> message, for the fields that failed. */
  errors: Partial<Record<keyof NewTaskInput, string>>;
}

export const BLANK_TITLE_MESSAGE = 'Please enter a task title.';
export const INVALID_DATE_MESSAGE = 'Please choose a valid due date.';

/**
 * Validates a task before it is created. A title of only whitespace counts as
 * blank, so " " cannot slip through as an empty-looking task.
 */
export function validateNewTask(input: NewTaskInput): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  if (input.title.trim().length === 0) errors.title = BLANK_TITLE_MESSAGE;
  if (!isIsoDate(input.dueDate)) errors.dueDate = INVALID_DATE_MESSAGE;

  return { valid: Object.keys(errors).length === 0, errors };
}
