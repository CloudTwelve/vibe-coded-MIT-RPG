import ICAL from 'ical.js'

export type CampusEvent = {
  id: string
  title: string
  course: string
  start: string
  end: string
  building: string
  room: string
  location: string
  allDay?: boolean
}
export type Quest = {
  id: string
  title: string
  detail: string
  done: boolean
  xp: number
}
export type Building = {
  id: string
  name: string
  short: string
  category: string
  lat: number
  lng: number
  x: number
  y: number
  description: string
}

// Geographic points identify buildings, not entrances or indoor waypoints.
// Illustration coordinates are deliberately schematic.
export const buildings: Building[] = [
  {
    id: '7',
    name: 'Rogers Building',
    short: 'Lobby 7',
    category: 'The main entrance',
    lat: 42.3591,
    lng: -71.0935,
    x: 323,
    y: 271,
    description:
      'The familiar entrance at 77 Massachusetts Avenue. A good place to begin your campus adventures.',
  },
  {
    id: '10',
    name: 'Maclaurin Building',
    short: 'Great Dome',
    category: 'An MIT classic',
    lat: 42.3598,
    lng: -71.0921,
    x: 420,
    y: 234,
    description:
      'Home of the Great Dome, overlooking Killian Court. Look up once in a while.',
  },
  {
    id: '26',
    name: 'Compton Laboratories',
    short: 'Building 26',
    category: 'Learning & discovery',
    lat: 42.3608,
    lng: -71.0908,
    x: 497,
    y: 151,
    description:
      'Lecture halls, laboratories, and the next chapter in your day. Check your schedule for the exact room.',
  },
  {
    id: '32',
    name: 'Stata Center',
    short: 'Stata Center',
    category: 'A different perspective',
    lat: 42.3617,
    lng: -71.0904,
    x: 539,
    y: 89,
    description:
      'A wonderfully unconventional campus landmark. Home to computer science and plenty of interesting corners.',
  },
  {
    id: '16',
    name: 'Dorrance Building',
    short: 'Building 16',
    category: 'In the heart of campus',
    lat: 42.3606,
    lng: -71.0911,
    x: 462,
    y: 178,
    description:
      'Part of the central campus complex. Indoor access and connections need to be checked on official MIT maps.',
  },
  {
    id: 'W20',
    name: 'Stratton Student Center',
    short: 'Student Center',
    category: 'Your between-class base',
    lat: 42.359,
    lng: -71.0948,
    x: 211,
    y: 246,
    description:
      'A spot for student life, a pause between classes, and a change of scenery.',
  },
  {
    id: 'W16',
    name: 'Kresge Auditorium',
    short: 'Kresge',
    category: 'A little culture',
    lat: 42.3582,
    lng: -71.0958,
    x: 153,
    y: 326,
    description:
      'An iconic curved roof, a green lawn, and room to slow down. A lovely landmark to notice on a walk.',
  },
  {
    id: 'E15',
    name: 'Wiesner Building',
    short: 'Media Lab',
    category: 'Creative possibilities',
    lat: 42.3605,
    lng: -71.0876,
    x: 675,
    y: 202,
    description:
      'At the east side of campus, a place associated with art, technology, and unexpected ideas.',
  },
]

export function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function dayEvents(events: CampusEvent[], day: Date): CampusEvent[] {
  const key = localDate(day)
  return events
    .filter((event) => localDate(new Date(event.start)) === key)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
}

export function createDemoEvents(now = new Date()): CampusEvent[] {
  const day = localDate(now)
  return [
    {
      id: 'demo-1',
      title: 'Introduction to Algorithms',
      course: '6.1210',
      start: `${day}T10:00:00`,
      end: `${day}T11:00:00`,
      building: '32',
      room: '123',
      location: '32-123',
    },
    {
      id: 'demo-2',
      title: 'Physics II',
      course: '8.02',
      start: `${day}T13:00:00`,
      end: `${day}T14:00:00`,
      building: '26',
      room: '100',
      location: '26-100',
    },
    {
      id: 'demo-3',
      title: 'A little room to create',
      course: 'STUDY TIME',
      start: `${day}T15:00:00`,
      end: `${day}T16:30:00`,
      building: '7',
      room: '',
      location: 'Lobby 7',
    },
  ]
}

export const initialQuests: Quest[] = [
  {
    id: 'q1',
    title: 'Make a little headway',
    detail: 'Finish one thing on your problem set.',
    done: false,
    xp: 25,
  },
  {
    id: 'q2',
    title: 'Take the scenic route',
    detail: 'Step outside and take a breather.',
    done: false,
    xp: 15,
  },
  {
    id: 'q3',
    title: 'Something just for you',
    detail: 'Read, sketch, stretch. Your choice.',
    done: false,
    xp: 20,
  },
]

export function matchLocation(location: string): {
  building: string
  room: string
} {
  const match = location
    .trim()
    .match(
      /(?:^|\b)(?:building\s*)?([A-Z]?\d{1,3})(?:[-–]([A-Z0-9]+))?(?:\b|$)/i,
    )
  if (match) {
    const building = buildings.find((b) => b.id === match[1].toUpperCase())
    if (building) return { building: building.id, room: match[2] || '' }
  }
  const named = buildings.find(
    (b) =>
      `${b.name} ${b.short}`
        .toLowerCase()
        .includes(location.trim().toLowerCase()) && location.trim().length > 3,
  )
  return { building: named?.id || '', room: '' }
}

export function walkingEstimate(
  start: Building,
  end: Building,
): { metres: number; minutes: number } {
  const rad = Math.PI / 180
  const a =
    Math.sin(((end.lat - start.lat) * rad) / 2) ** 2 +
    Math.cos(start.lat * rad) *
      Math.cos(end.lat * rad) *
      Math.sin(((end.lng - start.lng) * rad) / 2) ** 2
  const metres = Math.round(
    6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
  )
  return { metres, minutes: Math.max(1, Math.ceil((metres * 1.4) / 75)) }
}

export function walkingUrl(start: Building, end: Building): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&travelmode=walking`
}

export function mergeEvents(
  existing: CampusEvent[],
  incoming: CampusEvent[],
): CampusEvent[] {
  const combined = new Map(existing.map((event) => [event.id, event]))
  incoming.forEach((event) => combined.set(event.id, event))
  return [...combined.values()].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )
}

// Expand a bounded date range rather than trusting unbounded RRULEs.
export function parseCalendar(text: string, now = new Date()): CampusEvent[] {
  if (!text.includes('BEGIN:VCALENDAR'))
    throw new Error('Please choose a valid .ics calendar file.')
  const root = new ICAL.Component(ICAL.parse(text))
  if (root.name !== 'vcalendar')
    throw new Error('This file is not an iCalendar calendar.')
  root.getAllSubcomponents('vtimezone').forEach((component) => {
    const tzid = component.getFirstPropertyValue('tzid')
    if (typeof tzid === 'string')
      ICAL.TimezoneService.register(new ICAL.Timezone({ component, tzid }))
  })
  const startWindow = new Date(now)
  startWindow.setDate(startWindow.getDate() - 30)
  startWindow.setHours(0, 0, 0, 0)
  const endWindow = new Date(now)
  endWindow.setDate(endWindow.getDate() + 120)
  const components = root.getAllSubcomponents('vevent')
  const masters = components.filter(
    (component) => !component.hasProperty('recurrence-id'),
  )
  const results: CampusEvent[] = []
  for (const component of masters) {
    if (component.getFirstPropertyValue('status') === 'CANCELLED') continue
    const tzid = component.getFirstProperty('dtstart')?.getParameter('tzid')
    if (
      typeof tzid === 'string' &&
      tzid !== 'UTC' &&
      !ICAL.TimezoneService.has(tzid)
    ) {
      throw new Error(
        `The calendar timezone "${tzid}" is not defined. Export your calendar with timezone definitions or in UTC.`,
      )
    }
    const event = new ICAL.Event(component)
    if (!event.startDate) continue
    const eventZone = event.startDate.zone
    if (
      eventZone.tzid !== 'floating' &&
      eventZone.tzid !== 'UTC' &&
      !ICAL.TimezoneService.has(eventZone.tzid)
    ) {
      throw new Error(
        `The calendar timezone "${eventZone.tzid}" is not defined. Export your calendar with timezone definitions or in UTC.`,
      )
    }
    for (const exception of components.filter(
      (item) =>
        item.hasProperty('recurrence-id') &&
        item.getFirstPropertyValue('uid') === event.uid,
    )) {
      event.relateException(new ICAL.Event(exception))
    }
    const addOccurrence = (
      start: ICAL.Time,
      end: ICAL.Time,
      actual: ICAL.Event,
    ) => {
      if (actual.component.getFirstPropertyValue('status') === 'CANCELLED')
        return
      const startDate = start.toJSDate()
      if (
        Number.isNaN(startDate.getTime()) ||
        startDate < startWindow ||
        startDate > endWindow
      )
        return
      const location = actual.location || ''
      results.push({
        id: `ical:${event.uid || actual.summary}:${startDate.toISOString()}`,
        title: actual.summary || 'Untitled event',
        course: '',
        start: startDate.toISOString(),
        end: end.toJSDate().toISOString(),
        ...matchLocation(location),
        location,
        allDay: start.isDate,
      })
      if (results.length > 1500)
        throw new Error(
          'This calendar has too many events. Please export a smaller calendar.',
        )
    }
    if (event.isRecurring()) {
      const iterator = event.iterator()
      let occurrence: ICAL.Time | null
      let iterations = 0
      while ((occurrence = iterator.next())) {
        if (++iterations > 25000)
          throw new Error(
            'This calendar has a recurrence that is too large to import safely.',
          )
        if (occurrence.toJSDate() > endWindow) break
        if (occurrence.toJSDate() < startWindow) continue
        const details = event.getOccurrenceDetails(occurrence)
        addOccurrence(details.startDate, details.endDate, details.item)
      }
    } else {
      addOccurrence(event.startDate, event.endDate, event)
    }
  }
  return results.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )
}
