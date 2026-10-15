import { describe, expect, it } from 'vitest'
import {
  buildings,
  createDemoEvents,
  dayEvents,
  localDate,
  matchLocation,
  mergeEvents,
  parseCalendar,
  walkingEstimate,
  walkingUrl,
} from './data'

const now = new Date('2026-10-15T12:00:00Z')
const wrap = (events: string) =>
  `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//MITRPG//Test//EN\r\n${events}\r\nEND:VCALENDAR`
const basicEvent = `BEGIN:VEVENT\r\nUID:test-1\r\nDTSTART:20261015T130000Z\r\nDTEND:20261015T140000Z\r\nSUMMARY:Physics II\r\nLOCATION:26-100\r\nEND:VEVENT`

describe('calendar import', () => {
  it('imports events and recognizes MIT building-room locations', () => {
    const events = parseCalendar(wrap(basicEvent), now)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      title: 'Physics II',
      building: '26',
      room: '100',
      start: '2026-10-15T13:00:00.000Z',
    })
  })
  it('expands recurring classes and respects exclusions', () => {
    const source = basicEvent.replace(
      'SUMMARY:Physics II',
      'RRULE:FREQ=DAILY;COUNT=4\r\nEXDATE:20261016T130000Z\r\nSUMMARY:Physics II',
    )
    const events = parseCalendar(wrap(source), now)
    expect(events.map((event) => event.start.slice(0, 10))).toEqual([
      '2026-10-15',
      '2026-10-17',
      '2026-10-18',
    ])
  })
  it('applies rescheduled recurrence exceptions', () => {
    const master = basicEvent.replace(
      'SUMMARY:Physics II',
      'RRULE:FREQ=DAILY;COUNT=2\r\nSUMMARY:Physics II',
    )
    const exception = basicEvent
      .replace(
        'DTSTART:20261015T130000Z',
        'RECURRENCE-ID:20261016T130000Z\r\nDTSTART:20261016T150000Z',
      )
      .replace('DTEND:20261015T140000Z', 'DTEND:20261016T160000Z')
    const events = parseCalendar(wrap(`${master}\r\n${exception}`), now)
    expect(events).toHaveLength(2)
    expect(events[1].start).toBe('2026-10-16T15:00:00.000Z')
  })
  it('ignores cancelled events', () => {
    expect(
      parseCalendar(
        wrap(
          basicEvent.replace(
            'SUMMARY:Physics II',
            'STATUS:CANCELLED\r\nSUMMARY:Physics II',
          ),
        ),
        now,
      ),
    ).toEqual([])
  })
  it('ignores cancelled recurrence exceptions', () => {
    const master = basicEvent.replace(
      'SUMMARY:Physics II',
      'RRULE:FREQ=DAILY;COUNT=2\r\nSUMMARY:Physics II',
    )
    const exception = basicEvent
      .replace(
        'DTSTART:20261015T130000Z',
        'RECURRENCE-ID:20261016T130000Z\r\nDTSTART:20261016T130000Z',
      )
      .replace('DTEND:20261015T140000Z', 'DTEND:20261016T140000Z')
      .replace('SUMMARY:Physics II', 'STATUS:CANCELLED\r\nSUMMARY:Physics II')
    expect(parseCalendar(wrap(`${master}\r\n${exception}`), now)).toHaveLength(
      1,
    )
  })
  it('keeps unknown locations for manual correction', () => {
    const [event] = parseCalendar(
      wrap(basicEvent.replace('LOCATION:26-100', 'LOCATION:Somewhere new')),
      now,
    )
    expect(event.building).toBe('')
    expect(event.location).toBe('Somewhere new')
  })
  it('rejects invalid input', () => {
    expect(() => parseCalendar('not a calendar', now)).toThrow('valid .ics')
  })
  it('bounds infinite recurring events', () => {
    const source = basicEvent.replace(
      'SUMMARY:Physics II',
      'RRULE:FREQ=DAILY\r\nSUMMARY:Physics II',
    )
    const events = parseCalendar(wrap(source), now)
    expect(events.length).toBeGreaterThan(100)
    expect(events.length).toBeLessThan(160)
  })
  it('does not duplicate repeated imports', () => {
    const events = parseCalendar(wrap(basicEvent), now)
    expect(mergeEvents(events, events)).toHaveLength(1)
  })
  it('handles all-day events', () => {
    const event = basicEvent
      .replace('DTSTART:20261015T130000Z', 'DTSTART;VALUE=DATE:20261015')
      .replace('DTEND:20261015T140000Z', 'DTEND;VALUE=DATE:20261016')
    expect(parseCalendar(wrap(event), now)).toHaveLength(1)
    expect(parseCalendar(wrap(event), now)[0].allDay).toBe(true)
  })
  it('rejects undefined timezones rather than silently shifting class times', () => {
    const event = basicEvent.replace(
      'DTSTART:20261015T130000Z',
      'DTSTART;TZID=America/New_York:20261015T130000',
    )
    expect(() => parseCalendar(wrap(event), now)).toThrow('timezone')
  })
})

describe('campus and schedule helpers', () => {
  it('recognizes named and prefixed buildings', () => {
    expect(matchLocation('Building 26-100')).toEqual({
      building: '26',
      room: '100',
    })
    expect(matchLocation('Stata Center')).toEqual({ building: '32', room: '' })
    expect(matchLocation('W20-201')).toEqual({ building: 'W20', room: '201' })
    expect(matchLocation('')).toEqual({ building: '', room: '' })
  })
  it('generates a sample schedule for the local date', () => {
    const events = createDemoEvents(now)
    expect(dayEvents(events, now)).toHaveLength(3)
    expect(localDate(new Date(events[0].start))).toBe(localDate(now))
  })
  it('does not show events on another day', () => {
    expect(
      dayEvents(createDemoEvents(now), new Date('2026-10-20T12:00:00Z')),
    ).toEqual([])
  })
  it('provides plausible straight-line estimates, not routing claims', () => {
    const estimate = walkingEstimate(buildings[0], buildings[2])
    expect(estimate.metres).toBeGreaterThan(200)
    expect(estimate.metres).toBeLessThan(500)
    expect(estimate.minutes).toBeGreaterThan(2)
    expect(walkingEstimate(buildings[0], buildings[0]).metres).toBe(0)
  })
  it('links to external walking navigation without calendar details', () => {
    const url = new URL(walkingUrl(buildings[0], buildings[2]))
    expect(url.searchParams.get('travelmode')).toBe('walking')
    expect(url.searchParams.has('origin')).toBe(true)
    expect(url.searchParams.has('destination')).toBe(true)
    expect(url.searchParams.has('title')).toBe(false)
  })
})
