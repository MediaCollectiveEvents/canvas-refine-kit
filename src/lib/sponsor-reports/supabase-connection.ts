import type {MptsReportAction} from './mpts';
import type {AttendanceReport,AttendanceStatus} from './attendance';
import {speakerError} from '@/lib/speakers/errors';
import {validateGalleryImage,type GalleryImage} from './gallery';
import type { Guest } from './enriched-review';
import type { Version } from '@/pages/SponsorReportUploadPreview';
import {isEventHubRehearsalReady,projectUrl,publishableKey} from '../event-hub-backend';
export {isEventHubRehearsalReady,projectUrl,publishableKey};
export type OwnerState={current:number;versions:Version[];introductions:{guestName:string;sponsor:string;requester:string;requestedAt:number;status:string}[]};
export class FrankfurtOwnerClient {
  async panelRecordings(sponsor?: string): Promise<string[]> {
    const result = await this.call('/rest/v1/rpc/portal_offair_panel_recordings', { p_partner: sponsor ?? null });
    if (!Array.isArray(result)) throw new Error('Panel recordings unavailable.');
    return result.filter((item): item is string => typeof item === 'string');
  }

  async panelFile(slug: string, format: 'm4a' | 'docx'): Promise<string> {
    const path = `/object/sign/offair-panel-recordings/${encodeURIComponent(slug)}.${format}`;
    const result = await this.call(`/storage/v1${path}`, { expiresIn: format === 'm4a' ? 3600 : 300 });
    if (typeof result.signedURL !== 'string' || !result.signedURL.startsWith(`${path}?`)) {
      throw new Error('Panel file unavailable.');
    }
    return `${projectUrl}/storage/v1${result.signedURL}${format === 'docx' ? '&download' : ''}`;
  }

  private accessToken:string|null=null;
  private expiresAt=0;
  private email='';
  isSignedIn(){return !!this.accessToken&&Date.now()<this.expiresAt;}
  getEmail(){return this.email;}
  private forget(){this.accessToken=null;this.expiresAt=0;this.email='';}
  protected async call(path:string,body?:object,authenticated=true,method:'GET'|'POST'='POST'){
    if(authenticated&&!this.isSignedIn()){this.forget();throw new Error('Please sign in again.');}
    const response=await fetch(`${projectUrl}${path}`,{method,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers:{apikey:publishableKey,'Content-Type':'application/json',...(authenticated?{Authorization:`Bearer ${this.accessToken}`}:{})},body:method==='GET'?undefined:JSON.stringify(body??{})});
    const text=await response.text();let value:Record<string,unknown>={};try{value=text?JSON.parse(text):{};}catch{throw new Error('The connection returned an unexpected response.');}
    if(!response.ok){
      if(response.status===401)this.forget();
      const message=String(value.message??value.msg??value.error_description??'');
      const code=String(value.error_code??value.code??value.error??'');
      // An unconfirmed invitee already has a code in their invitation email.
      if(path.startsWith('/auth/v1/otp')&&response.status===422&&code==='signup_disabled')return {invitationRequired:true};
      if(path.startsWith('/auth/v1/otp')&&response.status===400)return {};
      if(path.endsWith('/insights_owner') && message==='inactive_or_unknown_insights_term') throw new Error('Remove inactive taxonomy selections and save again before publication.');
      if(path.endsWith('/taxonomy_owner') && ['stale_taxonomy_revision','duplicate_term_or_alias','duplicate_or_invalid_id','invalid_keyword_themes','invalid_taxonomy_transition','active_theme_required','invalid_replacement','duplicate_or_invalid_alias','invalid_term','reactivate_before_editing'].includes(message)){
        throw new Error(message.replaceAll('_',' '));
      }
      let friendly='The request was rejected. Nothing was published.';
      if(message.includes('stale_version'))friendly='A newer version exists. Sign out and back in to review against it.';
      else if(message==='stale_website_invitation')friendly='This request changed. Refresh the list before recording a decision.';
      else if(path.includes('/functions/v1/partner-code-request'))friendly='Your request could not be completed. Please wait a moment and try again, or contact us.';
      else if(path.includes('portal_owner_walk_in'))friendly=response.status===404?'Walk-in setup has not been installed yet. Existing reports are unchanged.':message.includes('stale_walk_in')?'This registration changed. Refresh the walk-in list before editing.':code==='23505'?'This email is already on the walk-in list. Refresh and check the existing record.':'Walk-in changes could not be saved. Check your owner session and the fields, then refresh.';
      else if(path.includes('/functions/v1/offair-owner-update'))friendly=({
        owner_access_required:'Sign in again as the Event Hub owner.',
        owner_email_unavailable:'Your owner account needs a confirmed email address.',
        recipient_access_changed:'A selected recipient no longer has access. Refresh the recipient list.',
        delivery_unavailable:'Email delivery is unavailable.',
        invalid_message:'Check the subject, message and selected recipients.',
      }[code]??'Email acceptance could not be confirmed. Retry this same message to avoid duplicate sends.');
      else if(path.includes('/functions/v1/sponsor-management'))friendly=code==='email_delivery_not_ready'?'Email invitations are not enabled yet. The sender and code email templates must be configured first.':code==='email_send_rate_limited'?'Access is saved. The email service has limited sending temporarily. Wait before trying again; repeated retries will not help.':code==='email_send_failed'?'Access is saved, but the invitation email could not be sent. Contact Chris if this persists.':code==='owner_access_required'?'Please sign in again as the portal owner.':code==='owner_account_protected'?'Owner accounts cannot be changed here.':code==='existing_company_mapping_protected'?'This email already belongs to another sponsor company. Its existing mapping was preserved.':code==='active_sponsor_required'?'Enable this sponsor account before creating a setup link.':code==='invitation_failed'?'The setup link could not be created. No email was sent.':code==='admin_not_configured'?'Account setup is not configured on the server yet.':'Sponsor access could not be saved. Check the company, email and future expiry date.';
      else if(path.includes('/functions/v1/eventbrite-sync'))friendly=code==='eventbrite_not_configured'?'Eventbrite needs its private token added to backend secrets.':code==='eventbrite_authorisation_required'?'The Eventbrite account does not have access to OFF AIR, or its token has expired.':'Eventbrite sync failed. The last saved registration report is unchanged.';
      else if(path==='/rest/v1/rpc/speaker_owner'&&!['owner_access_required','owner_mfa_required','session_expired'].includes(message))friendly=speakerError(message);
      else if(message.includes('report_download_not_open'))friendly='Report downloads open on 25 November 2026.';
      else if(message.includes('report_download_closed')||message.includes('event_access_closed'))friendly='The 21-day report access period has ended.';
      else if(message==='duplicate_registrant')friendly='A registrant with this email already exists in the MPTS report.';
      else if(message==='mpts_download_unavailable')friendly='The MPTS download opens after the reception and stays available for 21 days.';
      else if(message==='mpts_attendance_before_event')friendly='Attendance editing can open after the reception.';
      else if(message==='attendance_editing_closed')friendly='The 72-hour attendance editing window has closed.';
      else if(message==='guest_selection_unavailable')friendly='This registrant changed or needs identity review. Refresh the report before selecting them.';
      else if(message==='terms_required')friendly='Please sign in again and review the event terms before continuing.';
      else if(message==='owner_account_protected')friendly='Owner accounts cannot be deleted from partner management.';
      else if(message==='multi_event_company_requires_review')friendly='This partner also has access to another event. Their access was preserved; review it separately before deleting.';
      else if(message.includes('owner_mfa_required'))friendly='Complete two-step verification to access owner tools.';
      else if(message.includes('sponsor_access_required'))friendly='This account does not have current access to this sponsor event.';
      else if(message.includes('owner_access_required'))friendly='This account has not been enabled as the portal owner yet.';
      else if(message.includes('session_expired'))friendly='Your session has expired. Sign out and sign in again.';
      else if(response.status===429)friendly='Too many attempts. Try again later.';
      else if(path.startsWith('/auth/v1/otp'))friendly='The code could not be sent. Please wait a moment and try again, or contact Chris.';
      else if(path==='/auth/v1/verify')friendly='The code is invalid or has expired. Request a new code and use the most recent email.';
      else if(path.startsWith('/auth/v1/factors'))friendly=response.status===429?'Too many verification attempts. Wait and try again.':path.endsWith('/verify')?'The authenticator code was not accepted. Try the current code from your app.':'Authenticator setup could not be completed. Please try again.';
      else if(path.startsWith('/auth/v1/token')) {
        friendly=code==='invalid_credentials'?'The email or password was not recognised. Use the email and password created for this portal account.':code==='email_not_confirmed'?'Your portal email needs confirmation.':code==='email_provider_disabled'?'Email/password sign-in is disabled in the project.':code==='captcha_failed'?'Supabase requires a CAPTCHA check for sign-in.':'The sign-in service rejected the request. This may be a configuration problem; your password has not been changed.';
      }
      throw new Error(friendly);
    }
    return value;
  }
  async signIn(email:string,password:string){this.forget();const value=await this.call('/auth/v1/token?grant_type=password',{email:email.trim(),password},false);if(typeof value.access_token!=='string'||typeof value.expires_in!=='number')throw new Error('Sign-in did not return a session.');this.accessToken=value.access_token;this.expiresAt=Date.now()+value.expires_in*1000;this.email=email;}
  async requestEmailCode(email:string){
    const address=email.trim().toLowerCase();
    if(address.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))throw new Error('Enter your partner email address.');
    return await this.call('/functions/v1/partner-code-request',{email:address},false);
  }
  async signInWithEmailCode(email:string,code:string){
    this.forget();
    if(!/^\d{6,8}$/.test(code))throw new Error('Enter the verification code from your email.');
    const value=await this.call('/auth/v1/verify',{email:email.trim().toLowerCase(),token:code,type:'email'},false);
    if(typeof value.access_token!=='string'||typeof value.expires_in!=='number')throw new Error('Sign-in did not return a session.');
    this.accessToken=value.access_token;this.expiresAt=Date.now()+value.expires_in*1000;this.email=email.trim().toLowerCase();
  }
  async signOut(){try{if(this.isSignedIn())await this.call('/auth/v1/logout?scope=local');}finally{this.forget();}}
  async marketingImages(partner?:string){return await this.call('/rest/v1/rpc/portal_marketing_list',{p_partner:partner??null}) as unknown as {images:GalleryImage[]};}
  async archiveGallery(id:string,remove=true){await this.call('/rest/v1/rpc/portal_gallery_archive',{p_id:id,p_remove:remove});}
  async gallery(partner?:string){return await this.call('/rest/v1/rpc/portal_gallery_list',{p_partner:partner??null}) as unknown as {images:GalleryImage[]};}
  async galleryFile(file:GalleryImage,event:'off-air'|'mpts-reception-2027'='off-air'){
    const value=await this.call(`/storage/v1/object/sign/event-gallery-private/${file.path}`,{expiresIn:300});
    if(typeof value.signedURL!=='string'||!value.signedURL.startsWith(`/object/sign/event-gallery-private/${event}/gallery/`))throw new Error('Image download unavailable.');
    return `${projectUrl}/storage/v1${value.signedURL}&download=${encodeURIComponent(file.filename)}`;
  }
  async uploadGallery(file:File,caption:string,partner?:string,marketing=false){
    const type=await validateGalleryImage(file);
    if(!this.isSignedIn())throw new Error('Please sign in again.');
    const reserved=await this.call(marketing?'/rest/v1/rpc/portal_marketing_reserve':partner?'/rest/v1/rpc/portal_gallery_reserve_partner':'/rest/v1/rpc/portal_gallery_reserve',{...(partner?{p_partner:partner}:{}),p_filename:file.name,p_caption:caption.trim(),p_type:type,p_size:file.size});
    if(typeof reserved.path!=='string'||!/^off-air\/gallery\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(reserved.path))throw new Error('Upload could not be prepared.');
    await this.storeGalleryImage(reserved.path,file,type);
    await this.call('/rest/v1/rpc/portal_gallery_publish',{p_id:reserved.id});
  }
  private async storeGalleryImage(path:string,file:File,type:string){
    const response=await fetch(`${projectUrl}/storage/v1/object/event-gallery-private/${path}`,{method:'POST',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',headers:{apikey:publishableKey,Authorization:`Bearer ${this.accessToken}`,'Content-Type':type,'x-upsert':'false'},body:file});
    if(!response.ok)throw new Error('Image upload failed. Check your connection and sign in again if needed.');
  }
  async attendance(sponsor:string|null=null){
    return await this.call('/rest/v1/rpc/portal_sponsor_attendance',{p_sponsor:sponsor}) as unknown as AttendanceReport;
  }
  async addMptsRegistrant(guest:Guest){
    await this.call('/rest/v1/rpc/portal_mpts_add_registrant',{p_guest:guest});
  }
  async mptsReport<T>(action:MptsReportAction,sponsor:string|null=null,data:object={}):Promise<T>{
    return await this.call('/rest/v1/rpc/portal_mpts_report',{p_action:action,p_sponsor:sponsor,p_data:data}) as unknown as T;
  }
  async mptsMedia<T>(action:'list'|'reserve'|'publish'|'archive',sponsor:string|null,data:object):Promise<T>{
    return await this.call('/rest/v1/rpc/portal_mpts_media',{p_action:action,p_sponsor:sponsor,p_data:data}) as unknown as T;
  }
  async uploadMptsImage(file:File,caption:string,sponsor:string|null,kind:'gallery'|'marketing'){
    const mime=await validateGalleryImage(file);
    const reserved=await this.mptsMedia<{id:string;path:string}>('reserve',sponsor,{kind,mime,size:file.size,filename:file.name,caption:caption.trim()});
    if(typeof reserved.path!=='string'||!/^mpts-reception-2027\/gallery\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(reserved.path))throw new Error('Upload could not be prepared.');
    await this.storeGalleryImage(reserved.path,file,mime);
    await this.mptsMedia('publish',sponsor,{id:reserved.id});
  }
  async taxonomy(action:string,data:object={}){if(!isEventHubRehearsalReady)throw Error('Staging backend not ready.');return this.call('/rest/v1/rpc/taxonomy_owner',{p_action:action,p_data:data});}
  async insights(body:object){if(!isEventHubRehearsalReady)throw Error('Staging backend not ready.');return this.call('/rest/v1/rpc/insights_owner',body);}
  async speakers(body:object){return this.call('/rest/v1/rpc/speaker_owner',body);}
  async recoveryExport(){return this.call('/rest/v1/rpc/portal_owner_recovery_export');}
  async ownerMfaFactors(){const user=await this.call('/auth/v1/user',undefined,true,'GET');return (Array.isArray(user.factors)?user.factors:[]) as {id:string;status:string;factor_type:string}[];}
  async enrollOwnerMfa(){
    const value=await this.call('/auth/v1/factors',{factor_type:'totp',friendly_name:`Media Collective owner ${crypto.randomUUID().slice(0,8)}`,issuer:'The Media Collective'});
    const totp=value.totp as {qr_code?:string}|undefined;
    if(typeof value.id!=='string'||typeof totp?.qr_code!=='string')throw new Error('Authenticator setup is unavailable.');
    return {id:value.id,qr:totp.qr_code.startsWith('data:image/svg+xml')?totp.qr_code:`data:image/svg+xml;charset=utf-8,${encodeURIComponent(totp.qr_code)}`};
  }
  async verifyOwnerMfa(factor:string,code:string){
    if(!/^[a-f0-9-]{36}$/i.test(factor)||!/^\d{6}$/.test(code))throw new Error('Enter the six-digit authenticator code.');
    const challenge=await this.call(`/auth/v1/factors/${encodeURIComponent(factor)}/challenge`,{});
    const value=await this.call(`/auth/v1/factors/${encodeURIComponent(factor)}/verify`,{challenge_id:challenge.id,code});
    if(typeof value.access_token!=='string'||typeof value.expires_in!=='number')throw new Error('Authenticator verification did not return a session.');
    this.accessToken=value.access_token;this.expiresAt=Date.now()+value.expires_in*1000;
  }
  async marketingFile(file:{path:string;filename:string}){
    const result=await this.call(`/storage/v1/object/sign/sponsor-reports-private/${file.path}`,{expiresIn:300,download:file.filename});
    if(typeof result.signedURL!=='string'||!result.signedURL.startsWith('/object/sign/sponsor-reports-private/off-air/marketing/'))throw new Error('Marketing download unavailable.');
    return `${projectUrl}/storage/v1${result.signedURL}&download=${encodeURIComponent(file.filename)}`;
  }
  async exportRegistrants(partner?:string){return await this.call('/rest/v1/rpc/portal_registrants_export',{p_partner:partner??null}) as unknown as {rows:EventbriteReport['rows']};}
  async sponsorPreview(){return await this.call('/rest/v1/rpc/portal_owner_sponsor_preview') as unknown as {report:SponsorState;raw:EventbriteReport};}
  async invitationStatus(ref:string,added:boolean,expected:string){return await this.call('/rest/v1/rpc/portal_owner_invitation_status',{p_ref:ref,p_added:added,p_expected:expected}) as unknown as InvitationRequests;}
  async websiteInvitationStatus(ref: string, status: WebsiteInvitationStatus, expectedVersion: number) {
    return await this.call('/rest/v1/rpc/portal_owner_website_invitation_status', {
      p_ref: ref, p_status: status, p_expected_version: expectedVersion,
    }) as unknown as InvitationRequests;
  }
  async invitations(){return await this.call('/rest/v1/rpc/portal_owner_invitations') as unknown as InvitationRequests;}
  async invitationKey(){return await this.call('/rest/v1/rpc/portal_owner_invitation_key') as unknown as {key:string};}
  async walkIns(){return await this.call('/rest/v1/rpc/portal_owner_walk_ins') as unknown as import('@/lib/walk-in/model').WalkInState;}
  async saveWalkInSettings(enabled:boolean,opensAt:string,closesAt:string){return await this.call('/rest/v1/rpc/portal_owner_walk_in_settings',{p_enabled:enabled,p_opens:opensAt,p_closes:closesAt}) as unknown as import('@/lib/walk-in/model').WalkInState;}
  async updateWalkIn(row:import('@/lib/walk-in/model').WalkInRow,fields:import('@/lib/walk-in/model').WalkInFields,deleted:boolean){return await this.call('/rest/v1/rpc/portal_owner_walk_in_update',{p_id:row.id,p_fields:fields,p_deleted:deleted,p_revision:row.revision}) as unknown as import('@/lib/walk-in/model').WalkInState;}
  async sendOffAirUpdate(input:{action:'test'|'send';subject:string;message:string;recipients:string[];requestId:string}){
    const result=await this.call('/functions/v1/offair-owner-update',input);
    if(typeof result.accepted!=='number')throw new Error('Email acceptance could not be confirmed.');
    return result.accepted;
  }

  async sponsors(){return await this.call('/rest/v1/rpc/portal_owner_sponsors') as unknown as SponsorLogin[];}
  async meetingInterests(){return await this.call('/rest/v1/rpc/portal_owner_meeting_interests') as unknown as MeetingInterest[];}
  async saveSponsor(details:{email:string;company:string;expiresAt:string;agreed:boolean}){return await this.call('/functions/v1/sponsor-management',{action:'create',...details}) as unknown as SponsorSetup;}
  async inviteSponsor(details:{email:string;company:string;expiresAt:string;agreed:boolean}){return await this.call('/functions/v1/sponsor-management',{action:'invite',...details}) as unknown as SponsorSetup;}
  async sponsorLink(email:string){return await this.call('/functions/v1/sponsor-management',{action:'link',email,agreed:true}) as unknown as SponsorSetup;}
  async deleteSponsor(userId:string,sponsorId:string,deleted=true){return await this.call('/rest/v1/rpc/portal_owner_sponsor_delete',{p_user:userId,p_sponsor:sponsorId,p_deleted:deleted}) as unknown as SponsorLogin[];}
  async revokeSponsor(userId:string,sponsorId:string){await this.call('/rest/v1/rpc/portal_owner_sponsor_revoke',{p_user:userId,p_sponsor:sponsorId});return this.sponsors();}
  async linkRegistration(registration:string,guest:{email:string;attendeeId:string},remove=false){await this.call('/rest/v1/rpc/portal_owner_link_registration',{p_registration:registration,p_email:guest.email,p_reference:guest.attendeeId,p_remove:remove});}
  async deleteRegistration(registration:string,deleted:boolean){await this.call('/rest/v1/rpc/portal_owner_registration_delete',{p_registration:registration,p_deleted:deleted});}
  async unenriched(){return await this.call('/rest/v1/rpc/portal_owner_unenriched') as unknown as {syncedAt:string|null;rawCount:number;enrichedCount:number;deletedRows?:(EventbriteReport['rows'][number]&{attendeeId:string;deletedAt:string})[];rows:(EventbriteReport['rows'][number]&{attendeeId:string})[]};}
  async syncEventbrite(){return await this.call('/functions/v1/eventbrite-sync') as unknown as {count:number;revision:number;unchanged:boolean};}
  async state(){return await this.call('/rest/v1/rpc/portal_owner_state',{p_event:'off-air'}) as unknown as OwnerState;}
  async publish(rows:Guest[],name:string,base:number){return await this.call('/rest/v1/rpc/portal_owner_publish',{p_event:'off-air',p_rows:rows,p_name:name,p_base:base,p_agreed:true}) as unknown as OwnerState;}
  async restore(version:number,base:number){return await this.call('/rest/v1/rpc/portal_owner_restore',{p_event:'off-air',p_revision:version,p_base:base}) as unknown as OwnerState;}
}

export type SponsorState={sponsor:string;event:string;accepted:boolean;termsVersion:string;canViewEmail:boolean;rows:(Pick<Guest,'firstName'|'lastName'|'company'|'jobTitle'|'linkedin'>&{email?:string})[]};
export class FrankfurtSponsorClient extends FrankfurtOwnerClient {

 async setAttendance(sponsor:string,guest:string,status:AttendanceStatus){
  return await this.call('/rest/v1/rpc/portal_sponsor_attendance_set',{p_sponsor:sponsor,p_guest:guest,p_status:status}) as unknown as AttendanceReport;
 }
 async myMeetingInterests(sponsor:string){return await this.call('/rest/v1/rpc/portal_meeting_interests',{p_sponsor:sponsor}) as unknown as string[];}
 async setMeetingInterest(sponsor:string,guest:string,selected:boolean){return await this.call('/rest/v1/rpc/portal_meeting_interest_set',{p_sponsor:sponsor,p_guest:guest,p_selected:selected}) as unknown as string[];}
 async partnerAccess(){return await this.call('/rest/v1/rpc/portal_partner_access') as unknown as {sponsorId:string;company:string}[];}
 async eventbrite(sponsor:string){return await this.call('/rest/v1/rpc/portal_sponsor_guests',{p_event:'off-air',p_sponsor:sponsor}) as unknown as EventbriteReport;}
 async sponsorState(sponsor:string){return await this.call('/rest/v1/rpc/portal_sponsor_state',{p_event:'off-air',p_sponsor:sponsor}) as unknown as SponsorState;}
 async accept(sponsor:string,version:string,agreed:boolean){return await this.call('/rest/v1/rpc/portal_sponsor_accept',{p_event:'off-air',p_sponsor:sponsor,p_version:version,p_agreed:agreed}) as unknown as SponsorState;}
}

export type EventbriteReport={syncedAt:string|null;canViewEmail:boolean;rows:{firstName:string;lastName:string;company:string;jobTitle:string;ticketType:string;status:string;registeredAt:string;linkedin?:string;email?:string;guestRef?:string|null}[]};
export type MeetingInterest={guestRef:string;guest:import('./guest-list').SponsorGuest;current:boolean;partner:string;requester:string;selectedAt:string};

export type SponsorLogin={sponsorId:string;userId:string;company:string;email:string;active:boolean;confirmed:boolean;expiresAt:string;canViewEmail:boolean;deletedAt?:string|null;firstSignInAt?:string|null;lastSignInAt?:string|null;termsAcceptedAt?:string|null;termsVersion?:string};
export type SponsorSetup={sponsors:SponsorLogin[];signInUrl:string;setupUrl:string|null;localOnly:boolean;emailSent:boolean};

type InvitationRow = { sourceRef: string; fullName: string; company: string; email: string; requestedAt: string };
export const websiteInvitationStatuses = ['Requested', 'Reviewed', 'Invited', 'Declined'] as const;
export type WebsiteInvitationStatus = typeof websiteInvitationStatuses[number];
export type WebsiteInvitation = InvitationRow & {
  eventLabel: string;
  status: WebsiteInvitationStatus;
  decisionVersion: number;
};
export type InvitationRequests = {
  configured: boolean;
  rows: (InvitationRow & { status: string })[];
  websiteRows?: WebsiteInvitation[];
};
