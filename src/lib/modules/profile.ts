import type { Profile } from "@/lib/types";

export type EditableProfileFields = Pick<
  Profile,
  "name" | "companyName" | "phone" | "address" | "gstin"
>;

export function updateProfile(
  profile: Profile,
  patch: Partial<EditableProfileFields>,
): Profile {
  return {
    ...profile,
    ...patch,
  };
}