# MITRPG

Campus, leveled up. An independent MIT campus companion with a bold game-dashboard interface, lavender/lime accents, and an illustrated campus map.

## Run locally

Requires Node.js 22.12+ (Node.js 24 recommended).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`.

```sh
npm test
npm run build
```

## First chapter

- Responsive illustrated campus map with selectable buildings, labels, and zoom.
- Calendar `.ics` import, bounded recurring-event expansion, exceptions, duplicate detection, and manual location matching.
- Add, edit, delete, and complete events. Browse the schedule one day at a time.
- Personal quests, reversible completion, XP, and gentle progression without streaks.
- Campus field guide, light/dark modes, local persistence, JSON export, and confirmed reset.

The initial schedule is clearly labeled sample data. Importing or saving a real event replaces the sample schedule.

## Navigation limitations

The campus illustration is schematic, **not to scale and not a route map**. Dashed connections are illustrative, not walking paths. Building coordinates represent approximate geographic building points, not entrances.

Outdoor times are rough estimates derived from straight-line distance, a 1.4 distance multiplier, and 75 metres/minute. They do not account for actual paths, crossings, access, stairs, or weather. Use the external Google Maps walking-directions link and verify with [MIT's official campus map](https://whereis.mit.edu/).

**Indoor routing is not implemented.** No indoor edges, accessibility claims, opening hours, or room-level directions are fabricated. A production routing release needs a licensed, verified pedestrian graph and indoor connections with access conditions and source provenance. MIT Facilities publishes campus mapping resources; some floor plans require MIT access.

## Calendar behavior

Imports events from the past 30 through the next 120 days, including recurrence rules, exclusions, and rescheduled/cancelled exceptions. The import is capped at 2 MB, 1,500 expanded events, and 25,000 recurrence iterations per series. Reimporting the same UID and occurrence replaces the existing occurrence rather than duplicating it. Import is additive, not a live calendar synchronization.

Calendar timezone definitions are registered when provided; floating times use the device timezone. Times display in the device timezone. Export calendars with timezone definitions or UTC for portability. Imported unmatched locations remain visible and can be corrected manually. Hydrant integration and automatic geolocation are not included.

## Privacy

Schedule, quests, and progress stay in `localStorage` in this browser on this device. This is not encrypted storage: do not use a shared device for sensitive calendars. Export downloads JSON containing your schedule; there is no restore/import-JSON feature yet. Clearing browser site data removes saved data.

There is no backend, account system, analytics, calendar upload, or location tracking. Google Fonts receives normal font requests. Selecting external map links sends the selected building coordinates to that provider, not calendar content.

## Later chapters

Verified indoor routing, photography sidequests and a private photo journal, cosmetic theme collections with unlock-all, and academic course-road planning.

Not affiliated with or endorsed by MIT.
