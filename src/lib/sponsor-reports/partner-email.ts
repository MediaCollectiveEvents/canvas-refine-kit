export const partnerEmailEnabled = import.meta.env.VITE_PARTNER_EMAIL_CODE_ENABLED === 'true';
export function parsePartnerEmails(text:string){
 const values=text.split(/[\s,;]+/).map(s=>s.trim().toLowerCase()).filter(Boolean);
 const emails=[...new Set(values)];
 if(!emails.length)throw new Error('Enter at least one email address.');
 if(emails.length>25)throw new Error('Send up to 25 invitations at a time.');
 const invalid=emails.filter(s=>s.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
 if(invalid.length)throw new Error(`Check these email addresses: ${invalid.join(', ')}`);
 return emails;
}
