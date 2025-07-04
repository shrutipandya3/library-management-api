import { Request, Response, NextFunction } from "express";
import { AddBookToInventoryInput, GetLibraryInventoryInput, RemoveBookFromInventoryInput } from "@/validators/libraryInventory.validator";
import i18n from "@/config/i18n";
import { addBookToInventory, getLibraryInventory, removeBookFromInventory } from "@/services/libraryInventory.service";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";
import { sendResponse } from "@/utils/sendResponse";

export const addBookToInventoryHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const libraryId = Number(req.params.id);
    const { bookId }: AddBookToInventoryInput = req.body;

    if (!req.user?.id) {
        throw new Error(i18n.__("unauthenticated_access"));
      }

    const inventoryEntry = await addBookToInventory(
      libraryId,
      { bookId },
      req.user.id,
      req.getLocale()
    );

    sendResponse({
      res,
      statusCode: 201,
      message: i18n.__("book_added_to_inventory"),
      data: inventoryEntry,
    });
  } catch (error: any) {
    console.error(error);
    next(error);
  }
};

export const getLibraryInventoryHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id }: GetLibraryInventoryInput = {
      id: Number(req.params.id),
    };

    if (!req.user?.id) {
      throw new Error(i18n.__("unauthenticated_access"));
    }

    const inventory = await getLibraryInventory(id,req.user.id,  req.getLocale());

    sendResponse({
      res,
      message: i18n.__("library_inventory_fetched"),
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};

export const removeBookFromInventoryHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, bookId }: RemoveBookFromInventoryInput = {
      id: Number(req.params.id),
      bookId: Number(req.params.bookId),
    };

    if (!req.user?.id) {
      throw new Error(i18n.__("unauthenticated_access"));
    }

    await removeBookFromInventory(id, bookId, req.user.id, req.getLocale());

    sendResponse({
      res,
      message: i18n.__("book_removed_from_inventory"),
    });
  } catch (error) {
    next(error);
  }
};