import prisma from "@/config/prisma";

export const getAllRolesDropdown = async () => {
  return prisma.role.findMany({
    where: {
      name: {
        not: "SUPER_ADMIN",
      },
    },
    select: {
      id: true,
      name: true,
    },
  });
};
