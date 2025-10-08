import type { Profile } from "./user.ts"

export interface FProfile extends Profile {
	id: number,
	username: string,
}

export interface Friends {
	info: FProfile;
	fstatus: { mutual: boolean };
}

// export interface Friend {
// 	friends: Friends[];
// } 