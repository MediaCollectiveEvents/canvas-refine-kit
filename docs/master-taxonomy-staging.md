# Staging taxonomy management

The staging owner Event Hub is the editing source for the vocabulary. The source inventory in master-taxonomy.review.json and the historical keyword files are retained for provenance. The recovered report titles are unidentified.

## Release and selection

The initial seed retains the existing 7 functional areas and 13 existing themes as active. The 3 additional themes and 36 proposed keywords are proposed. The 30 recovered keywords are under review. Approving a term does not activate it. Editing an active term creates a pending revision and keeps the last activated version selectable. Retirement removes the term from new selections and preserves its history and any replacement.

The contributor form uses active terms live. Keyword suggestions match words and phrases in the headline, standfirst and article against term labels and aliases. Suggestions submitted by contributors enter the editorial queue. Articles store theme IDs and keyword IDs separately. Older articles retain their existing topic IDs.

The staging deployment builds a CMS and website snapshot from the database. Run the existing Deploy staging workflow after activating or retiring terms to refresh CMS options. CMS editors can retain or clear historical tags already present on a record. They can choose only active terms for new tags. The CMS taxonomy file is read-only in the editor.

The relational assignment model distinguishes professional areas, verified expertise, declared interests and editorial tags. Published Insights writes article assignments. CMS events, panels, contributors and sponsor profiles store their approved IDs in their existing records. The community interest model is available for future integration. This release does not collect or expose individual community interests.

## Staging verification

Run the rolled-back workflow in tests/taxonomy/staging-workflow.sql on the staging project only after the three taxonomy migrations. It requires the existing Insights migration and checks seed counts, aliases, access, approval, activation, conflict handling, editorial drafts and retirement.
