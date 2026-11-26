// Never echo server details or submitted values into user-facing errors.
export function speakerError(message:string){
 const errors:Record<string,string>={
  invalid_company_url:'Check the company website. Use a full HTTPS address, for example https://example.com/.',
  invalid_linkedin_url:'Check the LinkedIn link. Use a personal profile URL, for example https://www.linkedin.com/in/your-name/.',
  invalid_linkedin:'Check the LinkedIn link. Use a personal profile URL, for example https://www.linkedin.com/in/your-name/.',
  invalid_url:'Check the company website and LinkedIn link. Use full HTTPS addresses.',
  invalid_draft:'A draft field is too long or has an unsupported format. Shorten it before saving.',
  invalid_profile:'Complete the name, company, job title and bio. Names and job details must be 200 characters or fewer.',
  invalid_headshot:'The headshot could not be saved. Upload it again as a JPEG, PNG or WebP.',
  bio_word_limit:'The biography must be 120 words or fewer.',
  permission_required:'Tick the permission checkbox before saving the bio.',
  invalid_submission:'Tick the publication permission checkbox before submitting.',
  invalid_events:'Choose at least one event before saving.',
  invalid_details:'Choose an event and keep hidden keywords below 2,000 characters.',
  submission_required:'Save the bio for review before approving it.',
  invalid_talking_points:'Add a date and talking points (up to 6,000 characters).',
  feedback_required:'Add a short explanation before returning the bio for changes.',
  invalid_link:'This speaker edit link is invalid or has expired. Ask Chris for a new link.',
  stale_version:'A newer change was saved. Your form has been kept; review the latest speaker record before retrying.',
  please_wait:'Please wait ten seconds before submitting another update.',
  speaker_not_found:'This speaker could not be found. Refresh the speaker list.',
 };
 return errors[message]??'The speaker details could not be saved. Your form has been kept. Please try again.';
}
