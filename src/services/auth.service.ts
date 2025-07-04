import prisma from "@/config/prisma";
import { User, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateToken } from "@/utils/jwt";
import { LoginInput, RegisterInput } from "@/validators/auth.validatior";
import i18n from "@/config/i18n";
import HttpError from "@/utils/HttpError";


export const registerUser = async (
  data: RegisterInput,
  locale: string
): Promise<User> => {
  i18n.setLocale(locale);
  const { name, email, password, role_id, library_id } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new HttpError(i18n.__("email_exists"), 409);
  }

  const totalUsers = await prisma.user.count();
  let finalRoleId = role_id;
  let status: UserStatus = UserStatus.PENDING;

  if (totalUsers === 0) {
    const superAdminRole = await prisma.role.findUnique({
      where: { name: "SUPER_ADMIN" },
    });
    if (!superAdminRole) {
      throw new HttpError(i18n.__("super_admin_missing"), 500);
    }
    finalRoleId = superAdminRole.id;
    status = UserStatus.APPROVED;
  } else {
    if (!role_id) {
      throw new HttpError(i18n.__("role_id_required"), 400);
    }

    const validRole = await prisma.role.findUnique({ where: { id: role_id } });
    if (!validRole) {
      throw new HttpError(i18n.__("role_id_invalid"), 400);
    }

    if (validRole.name === "SUPER_ADMIN") {
      throw new HttpError(i18n.__("super_admin_apply_denied"), 403);
    }

    if (["LIBRARY_ADMIN", "BORROWER"].includes(validRole.name)) {
      if (!library_id) {
        throw new HttpError(i18n.__("library_id_required"), 400);
      }

      const libraryExists = await prisma.library.findUnique({
        where: { id: library_id },
      });
      if (!libraryExists) {
        throw new HttpError(i18n.__("library_id_invalid"), 400);
      }

      if (validRole.name === "LIBRARY_ADMIN") {
        const existingAdmin = await prisma.userRole.findFirst({
          where: {
            roleId: role_id,
            libraryId: library_id,
          },
        });

        if (existingAdmin) {
          throw new HttpError(i18n.__("library_already_has_admin"), 409);
        }
      }
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: finalRoleId!,
      libraryId: library_id || null,
      status,
    },
  });

  const token = generateToken({ userId: user.id });

  await prisma.user.update({
    where: { id: user.id },
    data: { token },
  });

  const userWithRoles = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      userRoles: {
        include: {
          role: true,
          library: true,
        },
      },
    },
  });

  if (!userWithRoles) {
    throw new HttpError(i18n.__("user_not_found_after_registration"), 500);
  }

  return userWithRoles;
};

export const loginUser = async (
  email: LoginInput["email"],
  password: LoginInput["password"],
  locale: string
): Promise<User> => {
  i18n.setLocale(locale);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new HttpError(i18n.__("invalid_email_or_password"), 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new HttpError(i18n.__("invalid_email_or_password"), 401);
  }

  const token = generateToken({ userId: user.id });

  await prisma.user.update({
    where: { id: user.id },
    data: { token },
  });

  const userWithRoles = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      userRoles: {
        include: {
          role: true,
          library: true,
        },
      },
    },
  });

  if (!userWithRoles) {
    throw new HttpError(i18n.__("user_not_found"), 500);
  }

  return userWithRoles;
};

export const logoutUser = async (userId: number): Promise<void> => {
  await prisma.user.update({
    where: { id: userId },
    data: { token: null },
  });
};
