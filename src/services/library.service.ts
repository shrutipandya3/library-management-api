import i18n from "@/config/i18n";
import prisma from "@/config/prisma";
import HttpError from "@/utils/HttpError";
import {
  CreateLibraryInput,
  DeleteLibraryInput,
  GetLibraryByIdInput,
  UpdateLibraryBodyInput,
  UpdateLibraryParamsInput,
} from "@/validators/library.validator";

export const createLibrary = async (
  { name, adminId }: CreateLibraryInput,
  locale: string
) => {
  i18n.setLocale(locale);
  if (adminId) {
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!adminUser) {
      throw new HttpError(i18n.__("admin_user_not_found"), 404);
    }

    // Check if this admin is already managing another library
    const existingLibrary = await prisma.library.findUnique({
      where: { adminId },
    });

    if (existingLibrary) {
      throw new HttpError(i18n.__("user_already_library_admin"), 409);
    }
  }

  // Create the library
  const library = await prisma.library.create({
    data: {
      name,
      adminId: adminId ?? null,
    },
  });

  return library;
};

export const getAllLibrariesDropdown = async () => {
  return prisma.library.findMany({
    select: {
      id: true,
      name: true,
    },
  });
};

export const getAllLibraries = async () => {
  return prisma.library.findMany();
};

export const getLibraryById = async (
  id: GetLibraryByIdInput["id"],
  locale: string
) => {
  i18n.setLocale(locale);
  const library = await prisma.library.findUnique({
    where: { id },
    include: {
      admin: {
        select: { id: true, name: true, email: true },
      },
      inventory: {
        include: {
          book: {
            include: {
              author: {
                select: { id: true, name: true, email: true },
              },
              bookBorrowers: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!library) {
    throw new HttpError(i18n.__("library_not_found"), 404);
  }

  return library;
};

export const updateLibrary = async (
  id: UpdateLibraryParamsInput["id"],
  { name, adminId }: UpdateLibraryBodyInput,
  locale: string
) => {
  i18n.setLocale(locale);
  const library = await prisma.library.findUnique({
    where: { id },
  });

  if (!library) {
    throw new HttpError(i18n.__("library_not_found"), 404);
  }

  if (adminId) {
    const adminUser = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!adminUser) {
      throw new HttpError(i18n.__("admin_user_not_found"), 404);
    }

    const existingLibrary = await prisma.library.findFirst({
      where: {
        adminId,
        NOT: { id },
      },
    });

    if (existingLibrary) {
      throw new HttpError(i18n.__("user_already_library_admin"), 409);
    }
  }

  const updatedLibrary = await prisma.library.update({
    where: { id },
    data: {
      name: name ?? library.name,
      adminId: adminId ?? library.adminId,
    },
  });

  return updatedLibrary;
};

export const deleteLibraryById = async (
  id: DeleteLibraryInput["id"],
  locale: string
) => {
  i18n.setLocale(locale);
  const library = await prisma.library.findUnique({
    where: { id },
  });

  if (!library) {
    throw new HttpError(i18n.__("library_not_found"), 404);
  }

  // Perform both deletions in a transaction
  await prisma.$transaction([
    prisma.libraryInventory.deleteMany({
      where: { libraryId: id },
    }),
    prisma.library.delete({
      where: { id },
    }),
  ]);
};
