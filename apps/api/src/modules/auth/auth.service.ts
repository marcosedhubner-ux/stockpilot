import jwt from "jsonwebtoken";
import { prisma } from "../../db/client.js";
import { env } from "../../config/env.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../domain/errors.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { toPublicStaff } from "../../utils/userMapper.js";
import type { LoginInput, RegisterStaffInput } from "./auth.schema.js";

export interface AuthTokenPayload {
  staffId: string;
  role: "ADMIN" | "STAFF";
}

export async function login(input: LoginInput) {
  const staff = await prisma.staff.findUnique({ where: { email: input.email } });
  if (!staff) {
    throw new UnauthorizedError();
  }

  const passwordMatches = await comparePassword(input.password, staff.passwordHash);
  if (!passwordMatches) {
    throw new UnauthorizedError();
  }

  const token = signToken({ staffId: staff.id, role: staff.role });
  return { token, staff: toPublicStaff(staff) };
}

export async function registerStaff(input: RegisterStaffInput) {
  const existing = await prisma.staff.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("A staff member with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const staff = await prisma.staff.create({
    data: { fullName: input.fullName, email: input.email, passwordHash, role: input.role },
  });

  return toPublicStaff(staff);
}

export async function getStaffById(staffId: string) {
  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) {
    throw new NotFoundError("Staff member");
  }
  return toPublicStaff(staff);
}

export function signToken(payload: AuthTokenPayload): string {
  const options = { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions;
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
}
