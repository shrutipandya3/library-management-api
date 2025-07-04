import { supabase } from "@/config/supabase";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/config/prisma";
import {
  BorrowBookInput,
  createBookInput,
  updateBookInput,
} from "@/validators/book.validator";
import i18n from "@/config/i18n";
import HttpError from "@/utils/HttpError";
import { extractPathFromUrl } from "@/utils/supabaseUtils";
import { Prisma } from "@prisma/client";

const bucketName = process.env.SUPABASE_BUCKET_NAME!;

export const createBook = async (
  file: Express.Multer.File,
  bookData: createBookInput,
  locale: string
) => {
  i18n.setLocale(locale);
  if (!file) {
    throw new HttpError(i18n.__("No file provided"), 400);
  }

  const fileExt = file.originalname.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;

  // 1. Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });

  if (uploadError) {
    console.error("Error uploading to Supabase:", uploadError.message);
    throw new HttpError(i18n.__("image_upload_failed"), 500, uploadError);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);

  const publicUrl = data.publicUrl;

  try {
    // 2. Prisma DB Transaction (if needed for multiple operations)
    const book = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const createdBook = await tx.book.create({
          data: {
            title: bookData.title,
            authorId: bookData.authorId,
            price: bookData.price,
            coverUrl: publicUrl,
          },
        });

        return createdBook;
      }
    );

    return book;
  } catch (dbError) {
    console.error("DB error, rolling back image upload:", dbError);

    // 3. Cleanup: Delete image from Supabase if DB insert fails
    await supabase.storage.from(bucketName).remove([fileName]);

    throw new HttpError(i18n.__("book_creation_failed"), 500, dbError);
  }
};

export const getAllBooks = async () => {
  return prisma.book.findMany({
    select: {
      id: true,
      title: true,
      price: true,
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const getBookById = async (id: number, locale: string) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        author: true,
        bookBorrowers: {
          include: {
            user: true,
          },
        },
        libraryInventory: {
          include: {
            library: true,
          },
        },
      },
    });

    if (!book) {
      throw new HttpError(i18n.__({ phrase: "book_not_found", locale }), 404);
    }

    const relativeFilePath = extractPathFromUrl(book.coverUrl, bucketName);
    if (!relativeFilePath) {
      throw new HttpError(
        i18n.__({ phrase: "image_fetch_failed", locale }),
        500
      );
    }

    // Create a signed URL valid for 1 hour (3600 seconds)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(relativeFilePath, 3600);

    console.log("Relative File Path:", relativeFilePath);
    console.log("Signed URL Data:", signedUrlData);
    console.log("URL Error:", urlError);

    if (urlError) {
      console.log(urlError);
      throw new HttpError(
        i18n.__({ phrase: "image_fetch_failed", locale }),
        500
      );
    }

    const imageUrl = signedUrlData?.signedUrl || "";

    return {
      id: book.id,
      title: book.title,
      price: book.price,
      image: {
        url: imageUrl,
      },
      author: {
        id: book.author.id,
        name: book.author.name,
      },
      borrowers: book.bookBorrowers.map((borrower: any) => ({
        id: borrower.user.id,
        name: borrower.user.name,
        status: borrower.status,
      })),
      libraries: book.libraryInventory.map((inventory: any) => ({
        id: inventory.library.id,
        name: inventory.library.name,
      })),
    };
  } catch (error) {
    console.log(error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(
      i18n.__({ phrase: "internal_server_error", locale }),
      500
    );
  }
};

export const deleteBookById = async (id: number, locale: string) => {
  try {
    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      throw new HttpError(i18n.__({ phrase: "book_not_found", locale }), 404);
    }

    // Extract relative file path from coverUrl
    const relativeFilePath = extractPathFromUrl(
      existingBook.coverUrl,
      bucketName
    );
    if (!relativeFilePath) {
      throw new HttpError(
        i18n.__({ phrase: "image_delete_failed", locale }),
        500
      );
    }

    // Delete image from Supabase storage
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([relativeFilePath]);

    if (deleteError) {
      console.log(deleteError);
      throw new HttpError(
        i18n.__({ phrase: "image_delete_failed", locale }),
        500
      );
    }

    // Delete book record from DB
    await prisma.book.delete({
      where: { id },
    });

    return {
      id: existingBook.id,
      title: existingBook.title,
    };
  } catch (error) {
    console.log(error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(
      i18n.__({ phrase: "internal_server_error", locale }),
      500
    );
  }
};

export const updateBook = async (
  id: number,
  file: Express.Multer.File | undefined,
  bookData: updateBookInput,
  locale: string
) => {
  i18n.setLocale(locale);

  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) throw new HttpError(i18n.__("book_not_found"), 404);

  let newCoverPath: string | undefined;

  if (file) {
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, { contentType: file.mimetype });

    if (error) throw new HttpError(i18n.__("image_upload_failed"), 500, error);

    newCoverPath = fileName;

    // After successful upload, delete old file if exists
    const oldFilePath = book.coverUrl
      ? extractPathFromUrl(book.coverUrl, bucketName) || book.coverUrl
      : null;

    if (oldFilePath) {
      await supabase.storage.from(bucketName).remove([oldFilePath]);
    }
  }

  const updatedBook = await prisma.book.update({
    where: { id },
    data: {
      title: bookData.title,
      authorId: bookData.authorId,
      price: bookData.price,
      ...(newCoverPath && { coverUrl: newCoverPath }),
    },
  });

  return updatedBook;
};

export const borrowBook = async (
  { bookId, charge }: BorrowBookInput,
  userId: number,
  locale: string
) => {
  i18n.setLocale(locale);

  // Fetch user's approved BORROWER role to get libraryId (RBAC ensures they're valid)
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: { name: "BORROWER" },
      status: "APPROVED",
    },
  });

  if (!userRole) {
    throw new HttpError(i18n.__("unauthorized_borrower_access"), 403);
  }

  // Get book's library from LibraryInventory
  const libraryInventory = await prisma.libraryInventory.findFirst({
    where: { bookId },
  });

  if (!libraryInventory) {
    throw new HttpError(i18n.__("book_not_found_or_not_in_library"), 404);
  }

  // Validate that borrower belongs to same library
  if (userRole.libraryId !== libraryInventory.libraryId) {
    throw new HttpError(i18n.__("borrower_not_in_same_library"), 403);
  }

  // Check if book is already borrowed by this user and not returned
  const existingBorrow = await prisma.bookBorrower.findFirst({
    where: {
      bookId,
      userId,
      status: "BORROWED",
    },
  });

  if (existingBorrow) {
    throw new HttpError(i18n.__("book_already_borrowed"), 409);
  }

  // Create borrow record
  const borrowEntry = await prisma.bookBorrower.create({
    data: {
      userId,
      bookId,
      borrowDate: new Date(),
      status: "BORROWED",
      charge,
    },
  });

  return borrowEntry;
};

export const returnBook = async (
  id: number,
  userId: number,
  locale: string
) => {
  i18n.setLocale(locale);


  // Fetch borrow record
  const borrowRecord = await prisma.bookBorrower.findFirst({
    where: {
      id,
      userId,
      status: "BORROWED",
    },
  });


  if (!borrowRecord) {
    throw new HttpError(i18n.__("borrow_record_not_found_or_already_returned"), 404);
  }

  // Update the record to mark as returned
  const updatedRecord = await prisma.bookBorrower.update({
    where: { id },
    data: {
      returnDate: new Date(),
      status: "RETURNED",
    },
  });

  return updatedRecord;
};

