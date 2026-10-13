import "server-only";

import { ApiError } from "@/lib/api/errors";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isStaleSessionError, staleSessionError } from "@/lib/db/errors";
import { prisma } from "@/lib/db/prisma";
import { type UserDTO, toUserDTO } from "@/lib/dto";

/** Visitor accounts. Passwords are stored as bcrypt hashes only. */

export async function registerUser(email: string, password: string): Promise<UserDTO> {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw ApiError.conflict("An account with that email already exists");
  }

  const passwordHash = await hashPassword(password);
  try {
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, favoriteCategories: true, createdAt: true },
    });
    return toUserDTO(user);
  } catch (error) {
    // Unique constraint race between the check above and the insert.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      throw ApiError.conflict("An account with that email already exists");
    }
    throw error;
  }
}

export async function authenticateUser(email: string, password: string): Promise<UserDTO> {
  const user = await prisma.user.findUnique({ where: { email } });
  // Same generic message for "unknown email" and "wrong password".
  if (!user) throw ApiError.unauthorized("Incorrect email or password");

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Incorrect email or password");

  return toUserDTO(user);
}

export async function findUserById(id: string): Promise<UserDTO | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, favoriteCategories: true, createdAt: true },
  });
  return user ? toUserDTO(user) : null;
}

export async function updateFavoriteCategories(
  userId: string,
  categories: UserDTO["favoriteCategories"],
): Promise<UserDTO> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { favoriteCategories: { set: categories } },
      select: { id: true, email: true, favoriteCategories: true, createdAt: true },
    });
    return toUserDTO(user);
  } catch (error) {
    // The account was deleted while the token was still valid.
    if (isStaleSessionError(error)) throw staleSessionError();
    throw error;
  }
}
