begin;
-- Preserve the deployed validator and change only its biography word boundary.
do $change$
declare definition text;
begin
 definition:=pg_get_functiondef('portal_private.validate_speaker(jsonb)'::regprocedure);
 if position(')>120 then' in definition)>0 then return;end if;
 if position(')>70 then' in definition)=0 then raise exception 'Unexpected speaker validator; no changes applied';end if;
 definition:=replace(definition,')>70 then',')>120 then');
 execute definition;
end $change$;
-- No records are written: validate the exact boundary using a synthetic profile.
do $test$
declare p jsonb;
begin
 p:=jsonb_build_object('name','Boundary test','company','Example','jobTitle','Director','bio',repeat('word ',119)||'word','headshot','data:image/jpeg;base64,/9j/2Q==');
 perform portal_private.validate_speaker(p);
 begin
  perform portal_private.validate_speaker(jsonb_set(p,'{bio}',to_jsonb(repeat('word ',120)||'word')));
  raise exception '121 words unexpectedly accepted';
 exception when others then
  if sqlerrm<>'bio_word_limit' then raise;end if;
 end;
end $test$;
commit;
select 'PASS: 120 words accepted, 121 rejected; no speaker records changed' as result;
