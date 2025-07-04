import i18n from "@/config/i18n";
import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().min(1, i18n.__("title_required")),
  authorId: z.preprocess(
    (val) => {
      if (typeof val === "string") return Number(val);
      return val;
    },
    z
      .number({
        required_error: i18n.__("author_id_required"),
        invalid_type_error: i18n.__("author_id_must_be_number"),
      })
      .int(i18n.__("author_id_must_be_integer"))
  ),
  price: z.preprocess(
    (val) => {
      if (typeof val === "string") return Number(val);
      return val;
    },
    z
      .number({
        required_error: i18n.__("price_required"),
        invalid_type_error: i18n.__("price_must_be_number"),
      })
      .positive(i18n.__("price_must_be_positive"))
  ),
});

export const getBookByIdSchema = z.object({
  id: z
    .string({
      required_error: i18n.__("book_id_required"),
    })
    .regex(/^\d+$/, i18n.__("book_id_must_be_integer")),
});

export const deleteBookByIdSchema = z.object({
  id: z
    .string({
      required_error: i18n.__("book_id_required"),
    })
    .regex(/^\d+$/, i18n.__("book_id_must_be_integer")),
});

export const updateBookSchema = z.object({
  title: z.string().min(1, i18n.__("title_required")).optional(),
  authorId: z
    .preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z
        .number({
          required_error: i18n.__("author_id_required"),
          invalid_type_error: i18n.__("author_id_must_be_number"),
        })
        .int(i18n.__("author_id_must_be_integer"))
    )
    .optional(),
  price: z
    .preprocess(
      (val) => (typeof val === "string" ? Number(val) : val),
      z
        .number({
          required_error: i18n.__("price_required"),
          invalid_type_error: i18n.__("price_must_be_number"),
        })
        .positive(i18n.__("price_must_be_positive"))
    )
    .optional(),
});

export type updateBookInput = z.infer<typeof updateBookSchema>;
export type createBookInput = z.infer<typeof createBookSchema>;

export const borrowBookSchema = z.object({
  bookId: z
    .number({
      required_error: i18n.__("book_id_required"),
      invalid_type_error: i18n.__("book_id_must_be_number"),
    })
    .int(i18n.__("book_id_must_be_integer")),

  charge: z.number({
    required_error: i18n.__("charge_required"),
    invalid_type_error: i18n.__("charge_must_be_number"),
  }),
});

export type BorrowBookInput = z.infer<typeof borrowBookSchema>;

export const returnBookSchema = z.object({
  id: z
    .string({
      required_error: i18n.__("book_borrow_id_required"),
      invalid_type_error: i18n.__("book_borrow_id_must_be_string"),
    })
    .regex(/^\d+$/, i18n.__("book_borrow_id_must_be_numeric")),
});

export type ReturnBookInput = z.infer<typeof returnBookSchema>;
