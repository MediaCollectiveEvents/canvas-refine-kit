-- Version new submissions after owner-requested event-partner notice update. Existing records unchanged.
update portal_private.walk_in_settings set privacy_version='off-air-walk-in-v2',updated_at=now() where event_id='off-air';
