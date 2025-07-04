import { PrismaClient, RoleName, ActionType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Seed Roles from Enum
  const roles: RoleName[] = [
    "SUPER_ADMIN",
    "LIBRARY_ADMIN",
    "AUTHOR",
    "BORROWER",
  ];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  // 2. Seed Actions
  const resources = [
    "User",
    "Book",
    "UserRole",
    "BookBorrower",
    "Library",
    "LibraryInventory",
  ];

  const actionTypes: ActionType[] = ["CREATE", "READ", "UPDATE", "DELETE"];

  for (const resource of resources) {
    for (const action of actionTypes) {
      await prisma.action.upsert({
        where: {
          resource_action: {
            resource,
            action,
          },
        },
        update: {},
        create: {
          resource,
          action,
        },
      });
    }
  }

  console.log("Roles and Actions seeded successfully");

  //3. Seed RoleActions for SUPER_ADMIN on Library (CREATE, READ, UPDATE, DELETE)
  const superAdminRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });

  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN role not found");
  }

  const libraryActions = await prisma.action.findMany({
    where: {
      resource: "Library",
      action: {
        in: ["CREATE", "READ", "UPDATE", "DELETE"],
      },
    },
  });

  for (const action of libraryActions) {
    await prisma.roleAction.upsert({
      where: {
        roleId_actionId: {
          roleId: superAdminRole.id,
          actionId: action.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        actionId: action.id,
      },
    });
  }

  // 4. Seed RoleActions for LIBRARY_ADMIN on Book (CREATE, READ, UPDATE, DELETE)
  const libraryAdminRole = await prisma.role.findUnique({
    where: { name: "LIBRARY_ADMIN" },
  });

  if (!libraryAdminRole) {
    throw new Error("LIBRARY_ADMIN role not found");
  }

  const bookActions = await prisma.action.findMany({
    where: {
      resource: "Book",
      action: {
        in: ["CREATE", "READ", "UPDATE", "DELETE"],
      },
    },
  });

  for (const action of bookActions) {
    await prisma.roleAction.upsert({
      where: {
        roleId_actionId: {
          roleId: libraryAdminRole.id,
          actionId: action.id,
        },
      },
      update: {},
      create: {
        roleId: libraryAdminRole.id,
        actionId: action.id,
      },
    });
  }

  console.log("LIBRARY_ADMIN Book permissions seeded successfully");

  // 5. Seed RoleActions for BORROWER on BookBorrower (CREATE, UPDATE)
  const borrowerRole = await prisma.role.findUnique({
    where: { name: "BORROWER" },
  });

  if (!borrowerRole) {
    throw new Error("BORROWER role not found");
  }

  const bookBorrowerActions = await prisma.action.findMany({
    where: {
      resource: "BookBorrower",
      action: {
        in: ["CREATE", "UPDATE"],
      },
    },
  });

  for (const action of bookBorrowerActions) {
    await prisma.roleAction.upsert({
      where: {
        roleId_actionId: {
          roleId: borrowerRole.id,
          actionId: action.id,
        },
      },
      update: {},
      create: {
        roleId: borrowerRole.id,
        actionId: action.id,
      },
    });
  }

  console.log(
    "BORROWER BookBorrower CREATE and UPDATE permissions seeded successfully"
  );

  // 6. Seed RoleActions for LIBRARY_ADMIN on LibraryInventory (CREATE, READ, UPDATE, DELETE)
  const libraryInventoryActions = await prisma.action.findMany({
    where: {
      resource: "LibraryInventory",
      action: {
        in: ["CREATE", "READ", "UPDATE", "DELETE"],
      },
    },
  });

  for (const action of libraryInventoryActions) {
    await prisma.roleAction.upsert({
      where: {
        roleId_actionId: {
          roleId: libraryAdminRole.id,
          actionId: action.id,
        },
      },
      update: {},
      create: {
        roleId: libraryAdminRole.id,
        actionId: action.id,
      },
    });
  }

  console.log("LIBRARY_ADMIN LibraryInventory permissions seeded successfully");

  // 7. Seed RoleAction for SUPER_ADMIN on UserRole (UPDATE)
  const userRoleUpdateAction = await prisma.action.findUnique({
    where: {
      resource_action: {
        resource: "UserRole",
        action: "UPDATE",
      },
    },
  });

  if (!userRoleUpdateAction) {
    throw new Error("UPDATE action for UserRole not found");
  }

  await prisma.roleAction.upsert({
    where: {
      roleId_actionId: {
        roleId: superAdminRole.id,
        actionId: userRoleUpdateAction.id,
      },
    },
    update: {},
    create: {
      roleId: superAdminRole.id,
      actionId: userRoleUpdateAction.id,
    },
  });

  console.log("SUPER_ADMIN UserRole UPDATE permission seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
