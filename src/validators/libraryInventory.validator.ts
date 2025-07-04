import i18n from "@/config/i18n";
import { z } from "zod";

export const addBookToInventorySchema = z.object({
  bookId: z.number({
    required_error: i18n.__("book_id_required"),
    invalid_type_error: i18n.__("book_id_must_be_number"),
  }).int(i18n.__("book_id_must_be_integer")),
});

export type AddBookToInventoryInput = z.infer<typeof addBookToInventorySchema>;

export const getLibraryInventorySchema = z.object({
  id: z.coerce.number().int().positive(i18n.__("library_id_must_be_positive_integer")),
});

export type GetLibraryInventoryInput = z.infer<typeof getLibraryInventorySchema>;

export const removeBookFromInventorySchema = z.object({
  id: z.coerce.number().int().positive(i18n.__("library_id_must_be_positive_integer")),
  bookId: z.coerce.number().int().positive(i18n.__("book_id_must_be_positive_integer")),
});

export type RemoveBookFromInventoryInput = z.infer<typeof removeBookFromInventorySchema>;