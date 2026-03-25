import type { UserRole } from "../types";

export const isAdmin = (role?: UserRole) => role === "admin";
export const isUser = (role?: UserRole) => role === "user";
