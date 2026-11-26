import type {SponsorState} from './supabase-connection';

export const mptsTerms=[
 'Use guest information only for communications directly related to MPTS Reception 2027.',
 'Keep guest information within your authorised event partnership team.',
 'Use the event artwork with the event details, branding and partner credits intact.',
 'Keep downloads secure and delete them when they are no longer needed for the agreed purpose.',
 'Contact chris@mediacollective.events about access, corrections or a suspected disclosure.',
];

export type MptsState=SponsorState&{endsAt:string};
export type MptsTeam={id:string;name:string;expiresAt:string|null;approved:boolean|null};
export type MptsSettings={
 revision:number;
 teams:MptsTeam[];
 suggestions:{guest:{firstName:string;lastName:string;company:string};team:string;selectedAt:string}[];
};
export type MptsReportAction='access'|'state'|'accept'|'rows'|'export'|'attendance'|'save_attendance'|
 'selections'|'save_selection'|'owner_settings'|'grant_team'|'revoke_team'|'publish'|'open_attendance'|'import_checkins';
