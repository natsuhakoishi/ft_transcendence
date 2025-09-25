import type { Profile } from "./user.ts"

export interface FProfile extends Profile {
	id: number,
	username: string,
}

export interface Friends {
	info: FProfile;
	fstatus: { mutual: boolean, message: string};
}

export type Friend =
  | { status: "No friend hh"; friends: [] }
  | { status: "I have friends WOw"; friends: Friends[] };