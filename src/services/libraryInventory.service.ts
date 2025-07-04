import { AddBookToInventoryInput, GetLibraryInventoryInput, RemoveBookFromInventoryInput } from "@/validators/libraryInventory.validator";
import i18n from "@/config/i18n";
import HttpError from "@/utils/HttpError";
import prisma from "@/config/prisma";

export const addBookToInventory = async (
  libraryId: number,
  {  bookId }: AddBookToInventoryInput,
  userId: number,
  locale: string
) => {
  i18n.setLocale(locale);

  // Get libraryId of the logged-in user (assuming LIBRARY_ADMIN role)
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: {
        name: "LIBRARY_ADMIN",
      },
      status: "APPROVED",
    },
    select: {
      libraryId: true,
    },
  });


  if (!userRole || userRole.libraryId === null) {
    throw new HttpError(i18n.__("unauthorized_library_access"), 403);
  }

  // Check if the provided libraryId matches user's libraryId
  if (libraryId !== userRole.libraryId) {
    throw new HttpError(i18n.__("unauthorized_library_access"), 403);
  }

  // Check if the library exists
  const library = await prisma.library.findUnique({
    where: { id: libraryId },
  });

  if (!library) {
    throw new HttpError(i18n.__("library_not_found"), 404);
  }

  // Check if the book exists
  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book) {
    throw new HttpError(i18n.__("book_not_found"), 404);
  }

  // Check if the book is already in the library inventory
  const existingEntry = await prisma.libraryInventory.findFirst({
    where: { libraryId, bookId },
  });

  if (existingEntry) {
    throw new HttpError(i18n.__("book_already_in_inventory"), 409);
  }

  // Add book to inventory
  const inventoryEntry = await prisma.libraryInventory.create({
    data: {
      libraryId,
      bookId,
      addedDate: new Date(),
    },
  });

  return inventoryEntry;
};

export const getLibraryInventory = async (
  id: GetLibraryInventoryInput["id"],
  userId: number,
  locale: string
) => {
  i18n.setLocale(locale);

  // Validate if the logged-in user is LIBRARY_ADMIN for this library
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: {
        name: "LIBRARY_ADMIN",
      },
      status: "APPROVED",
    },
    select: {
      libraryId: true,
    },
  });

  if (!userRole || userRole.libraryId === null) {
    throw new HttpError(i18n.__("unauthorized_library_access"), 403);
  }

  if (id !== userRole.libraryId) {
    throw new HttpError(i18n.__("unauthorized_library_access"), 403);
  }

  // Fetch inventory with details
  const inventory = await prisma.library.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      inventory: {
        select: {
          id: true,
          addedDate: true,
          book: {
            select: {
              id: true,
              title: true,
              coverUrl: true,
              price: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              bookBorrowers: {
                select: {
                  id: true,
                  borrowDate: true,
                  returnDate: true,
                  status: true,
                  charge: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!inventory) {
    throw new HttpError(i18n.__("library_not_found"), 404);
  }

  return inventory;
};

export const removeBookFromInventory = async (
  id: RemoveBookFromInventoryInput["id"],
  bookId: RemoveBookFromInventoryInput["bookId"],
  userId: number,
  locale: string
) => {
  i18n.setLocale(locale);

  // Validate if user is an APPROVED LIBRARY_ADMIN for this library
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: {
        name: "LIBRARY_ADMIN",
      },
      status: "APPROVED",
    },
    select: {
      libraryId: true,
    },
  });

  if (!userRole || userRole.libraryId === null || userRole.libraryId !== id) {
    throw new HttpError(i18n.__("unauthorized_library_access"), 403);
  }

  // Check if the book exists in the inventory
  const inventoryEntry = await prisma.libraryInventory.findFirst({
    where: {
      libraryId: id,
      bookId: bookId,
    },
  });

  if (!inventoryEntry) {
    throw new HttpError(i18n.__("book_not_found_in_inventory"), 404);
  }

  // Delete the book from inventory
  await prisma.libraryInventory.delete({
    where: {
      id: inventoryEntry.id,
    },
  });

  return { success: true };
};

