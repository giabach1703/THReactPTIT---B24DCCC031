export type ClubStatus = 'active' | 'inactive';
export type Gender = 'male' | 'female' | 'other';
export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ClubItem {
	id: string;
	avatar: string;
	name: string;
	foundedDate: string;
	description: string; // HTML
	president: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ApplicationHistoryItem {
	id: string;
	applicationId: string;
	action: string;
	note?: string;
	by: string;
	createdAt: string;
}

export interface ApplicationItem {
	id: string;
	fullName: string;
	email: string;
	phone: string;
	gender: Gender;
	address: string;
	talent: string;
	clubId: string;
	reason: string;
	status: ApplicationStatus;
	rejectNote?: string;
	createdAt: string;
	updatedAt: string;
}

export interface ClubDatabase {
	clubs: ClubItem[];
	applications: ApplicationItem[];
	histories: ApplicationHistoryItem[];
}
