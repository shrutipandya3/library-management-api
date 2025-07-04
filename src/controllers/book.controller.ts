import i18n from "@/config/i18n";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";
import { borrowBook, createBook, deleteBookById, getAllBooks, getBookById, returnBook, updateBook } from "@/services/book.service";
import HttpError from "@/utils/HttpError";
import { sendResponse } from "@/utils/sendResponse";
import { BorrowBookInput, createBookInput, ReturnBookInput } from "@/validators/book.validator";
import { Request, Response, NextFunction } from "express";

export const createBookHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      const error: any = new Error(i18n.__("image_required"));
      error.statusCode = 400;
      throw error;
    }

    const { title, authorId, price }: createBookInput = req.body;

    // No need to parse since zod already coerced
    const book = await createBook(file, { title, authorId, price }, req.getLocale());

    sendResponse({
      res,
      statusCode: 201,
      message: i18n.__("book_created"),
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBooksHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const books = await getAllBooks();

    sendResponse({
      res,
      message: req.__("books_fetched"),
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    // Service returns formatted book with image as JSON
    const book = await getBookById(id, req.getLocale());

    sendResponse({
      res,
      message: i18n.__("book_fetched"),
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBookByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("Deleting book with ID:", req.params.id);
    const id = Number(req.params.id);

    const deletedBook = await deleteBookById(id, req.getLocale());

    sendResponse({
      res,
      message: i18n.__("book_deleted"),
      data: deletedBook,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new HttpError(i18n.__("invalid_book_id"), 400);

    const { title, authorId, price } = req.body;
    const file = req.file;

    const book = await updateBook(id, file, { title, authorId, price }, req.getLocale());

    sendResponse({
      res,
      statusCode: 200,
      message: i18n.__("book_updated"),
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

export const borrowBookHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookId, charge }: BorrowBookInput = req.body;

    if (!req.user?.id) {
      throw new Error(i18n.__("unauthenticated_access"));
    }

    const borrowEntry = await borrowBook(
      { bookId, charge },
      req.user.id,
      req.getLocale()
    );

    sendResponse({
      res,
      statusCode: 201,
      message: i18n.__("book_borrowed_successfully"),
      data: borrowEntry,
    });
  } catch (error: any) {
    console.error(error);
    next(error);
  }
};

export const returnBookHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!req.user?.id) {
      throw new Error(i18n.__("unauthenticated_access"));
    }

    const updatedRecord = await returnBook(
      Number(id),
      req.user.id,
      req.getLocale()
    );

    sendResponse({
      res,
      statusCode: 200,
      message: i18n.__("book_returned_successfully"),
      data: updatedRecord,
    });
  } catch (error: any) {
    console.error(error);
    next(error);
  }
};