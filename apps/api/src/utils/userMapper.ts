export interface PublicStaff {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export function toPublicStaff(staff: { id: string; fullName: string; email: string; role: string }): PublicStaff {
  return { id: staff.id, fullName: staff.fullName, email: staff.email, role: staff.role };
}
