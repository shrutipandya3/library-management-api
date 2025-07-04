import i18n from "@/config/i18n";
import { z } from "zod";

// Create Library Schema
export const createLibrarySchema = z.object({
  name: z.string().min(1, i18n.__("library_name_required")),
  adminId: z.number().int(i18n.__("admin_id_must_be_integer")).optional(),
});

export type CreateLibraryInput = z.infer<typeof createLibrarySchema>;

// Get Library by ID Schema (Params)
export const getLibraryByIdSchema = z.object({
  id: z.coerce.number().int().positive(i18n.__("library_id_must_be_positive_integer")),
});

export type GetLibraryByIdInput = z.infer<typeof getLibraryByIdSchema>;

// Update Library Schema (Params + Body)
export const updateLibraryParamsSchema = z.object({
  id: z.coerce.number().int(i18n.__("library_id_must_be_integer")),
});

export const updateLibraryBodySchema = z.object({
  name: z.string().min(1, i18n.__("library_name_cannot_be_empty")).optional(),
  adminId: z.number().int(i18n.__("admin_id_must_be_integer")).optional(),
});

export type UpdateLibraryParamsInput = z.infer<typeof updateLibraryParamsSchema>;
export type UpdateLibraryBodyInput = z.infer<typeof updateLibraryBodySchema>;

// Delete Library Schema (Params)
export const deleteLibrarySchema = z.object({
  id: z.coerce.number().int().positive(i18n.__("library_id_must_be_positive_integer")),
});

export type DeleteLibraryInput = z.infer<typeof deleteLibrarySchema>;
