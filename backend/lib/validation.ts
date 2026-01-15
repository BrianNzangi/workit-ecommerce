import { validationError } from '@/lib/graphql/errors';
import { PrismaClient } from '@prisma/client';

/**
 * Validation utilities for common patterns
 */

/**
 * Validate that required fields are present and not empty
 * @param data - Object containing fields to validate
 * @param requiredFields - Array of field names that are required
 * @throws ValidationError if any required field is missing or empty
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  for (const field of requiredFields) {
    const value = data[field];
    
    // Check if field is missing or undefined
    if (value === undefined || value === null) {
      throw validationError(`${field} is required`, field);
    }
    
    // Check if string field is empty after trimming
    if (typeof value === 'string' && value.trim().length === 0) {
      throw validationError(`${field} cannot be empty`, field);
    }
  }
}

/**
 * Validate email format
 * @param email - Email address to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws ValidationError if email format is invalid
 */
export function validateEmail(email: string, fieldName: string = 'email'): void {
  if (!email || typeof email !== 'string') {
    throw validationError('Email is required', fieldName);
  }
  
  const trimmedEmail = email.trim();
  
  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    throw validationError('Invalid email format', fieldName);
  }
  
  // Check for dot at start of local part
  if (trimmedEmail.startsWith('.')) {
    throw validationError('Invalid email format', fieldName);
  }
  
  // Must have @ symbol
  if (!trimmedEmail.includes('@')) {
    throw validationError('Invalid email format', fieldName);
  }
  
  // Split into local and domain parts
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    throw validationError('Invalid email format', fieldName);
  }
  
  const [localPart, domainPart] = parts;
  
  // Local part must not be empty
  if (!localPart || localPart.length === 0) {
    throw validationError('Invalid email format', fieldName);
  }
  
  // Domain part must not be empty and must contain at least one dot
  if (!domainPart || domainPart.length === 0 || !domainPart.includes('.')) {
    throw validationError('Invalid email format', fieldName);
  }
  
  // RFC 5322 compliant email regex (simplified but robust)
  // Requires at least one dot in domain part
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    throw validationError('Invalid email format', fieldName);
  }
}

/**
 * Validate that a price is a positive number
 * @param price - Price value to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws ValidationError if price is not positive
 */
export function validatePrice(price: number, fieldName: string = 'price'): void {
  if (price === undefined || price === null) {
    throw validationError(`${fieldName} is required`, fieldName);
  }
  
  if (typeof price !== 'number' || isNaN(price)) {
    throw validationError(`${fieldName} must be a number`, fieldName);
  }
  
  if (price <= 0) {
    throw validationError(`${fieldName} must be a positive number`, fieldName);
  }
}

/**
 * Generate a URL-safe slug from a string
 * @param text - Text to convert to slug
 * @returns URL-safe slug
 */
export function generateSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return `slug-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // If slug is empty after sanitization, generate a random slug
  if (!slug || slug.length === 0) {
    return `slug-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  return slug;
}

/**
 * Validate that a slug is URL-safe
 * @param slug - Slug to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws ValidationError if slug is not URL-safe
 */
export function validateSlugFormat(slug: string, fieldName: string = 'slug'): void {
  if (!slug || typeof slug !== 'string') {
    throw validationError(`${fieldName} is required`, fieldName);
  }
  
  // Slug must contain only lowercase letters, numbers, and hyphens
  // Must not start or end with a hyphen
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  
  if (!slugRegex.test(slug)) {
    throw validationError(
      `${fieldName} must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen`,
      fieldName
    );
  }
}

/**
 * Ensure slug is unique within a table
 * @param prisma - Prisma client instance
 * @param tableName - Name of the table to check
 * @param slug - Slug to check for uniqueness
 * @param excludeId - Optional ID to exclude from uniqueness check (for updates)
 * @returns Unique slug (may be modified with a number suffix)
 */
export async function ensureUniqueSlug(
  prisma: PrismaClient,
  tableName: string,
  slug: string,
  excludeId?: string
): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;
  
  // Get the appropriate model from Prisma
  const model = (prisma as any)[tableName];
  
  if (!model) {
    throw new Error(`Invalid table name: ${tableName}`);
  }
  
  while (true) {
    const existing = await model.findUnique({
      where: { slug: uniqueSlug },
    });
    
    if (!existing || (excludeId && existing.id === excludeId)) {
      return uniqueSlug;
    }
    
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
}

/**
 * Validate foreign key referential integrity
 * @param prisma - Prisma client instance
 * @param tableName - Name of the table to check
 * @param id - ID to verify exists
 * @param fieldName - Name of the field (for error messages)
 * @throws ValidationError if referenced record does not exist
 */
export async function validateForeignKey(
  prisma: PrismaClient,
  tableName: string,
  id: string,
  fieldName: string
): Promise<void> {
  if (!id) {
    throw validationError(`${fieldName} is required`, fieldName);
  }
  
  // Get the appropriate model from Prisma
  const model = (prisma as any)[tableName];
  
  if (!model) {
    throw new Error(`Invalid table name: ${tableName}`);
  }
  
  const record = await model.findUnique({
    where: { id },
  });
  
  if (!record) {
    throw validationError(
      `Referenced ${tableName} with id ${id} does not exist`,
      fieldName
    );
  }
}

/**
 * Validate multiple foreign keys at once
 * @param prisma - Prisma client instance
 * @param references - Array of {tableName, id, fieldName} objects
 * @throws ValidationError if any referenced record does not exist
 */
export async function validateForeignKeys(
  prisma: PrismaClient,
  references: Array<{ tableName: string; id: string; fieldName: string }>
): Promise<void> {
  for (const ref of references) {
    await validateForeignKey(prisma, ref.tableName, ref.id, ref.fieldName);
  }
}

/**
 * Validate that a number is non-negative
 * @param value - Number to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws ValidationError if value is negative
 */
export function validateNonNegative(value: number, fieldName: string): void {
  if (value === undefined || value === null) {
    throw validationError(`${fieldName} is required`, fieldName);
  }
  
  if (typeof value !== 'number' || isNaN(value)) {
    throw validationError(`${fieldName} must be a number`, fieldName);
  }
  
  if (value < 0) {
    throw validationError(`${fieldName} cannot be negative`, fieldName);
  }
}

/**
 * Validate that a string is not empty after trimming
 * @param value - String to validate
 * @param fieldName - Name of the field (for error messages)
 * @throws ValidationError if string is empty
 */
export function validateNonEmptyString(value: string, fieldName: string): void {
  if (!value || typeof value !== 'string') {
    throw validationError(`${fieldName} is required`, fieldName);
  }
  
  if (value.trim().length === 0) {
    throw validationError(`${fieldName} cannot be empty`, fieldName);
  }
}
