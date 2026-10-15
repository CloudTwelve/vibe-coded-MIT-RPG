import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  ExternalLink,
  Flag,
  Footprints,
  GraduationCap,
  Map,
  MapPin,
  Menu,
  Moon,
  MoreHorizontal,
  Navigation,
  Plus,
  Route,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import CampusMap from './CampusMap'
import CampusHero from './CampusHero'
import {
  buildings,
  createDemoEvents,
  dayEvents,
  initialQuests,
  localDate,
  mergeEvents,
  parseCalendar,
  walkingEstimate,
  walkingUrl,
} from './data'
import type { CampusEvent, Quest } from './data'

type Page = 'today' | 'quests' | 'map' | 'guide'
type Saved = {
  events: CampusEvent[]
  quests: Quest[]
  demo: boolean
  completedClasses: string[]
}
const STORAGE_KEY = 'mitrpg-journal-v1'

function loadSaved(): Saved {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      if (
        Array.isArray(saved.events) &&
        saved.events.every(
          (event: CampusEvent) =>
            typeof event.id === 'string' &&
            typeof event.title === 'string' &&
            typeof event.start === 'string' &&
            typeof event.end === 'string' &&
            !Number.isNaN(Date.parse(event.start)) &&
            !Number.isNaN(Date.parse(event.end)),
        ) &&
        Array.isArray(saved.quests) &&
        saved.quests.every(
          (quest: Quest) =>
            typeof quest.id === 'string' &&
            typeof quest.title === 'string' &&
            typeof quest.done === 'boolean' &&
            Number.isFinite(quest.xp),
        ) &&
        Array.isArray(saved.completedClasses) &&
        saved.completedClasses.every((id: unknown) => typeof id === 'string')
      ) {
        return {
          ...saved,
          events: saved.demo ? createDemoEvents() : saved.events,
        }
      }
    }
  } catch {
    /* Keep the app usable if storage is unavailable or damaged. */
  }
  return {
    events: createDemoEvents(),
    quests: initialQuests,
    demo: true,
    completedClasses: [],
  }
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  return (
    <dialog
      ref={dialog}
      className="modal"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-heading">
        <h2 id="modal-title">{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  )
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}
function inputDateTime(value: string): string {
  const date = new Date(value)
  return `${localDate(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export default function App() {
  const [saved, setSaved] = useState<Saved>(loadSaved)
  const [page, setPage] = useState<Page>('today')
  const [date, setDate] = useState(new Date())
  const [now, setNow] = useState(new Date())
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('mitrpg-theme') !== 'light'
    } catch {
      return true
    }
  })
  const [start, setStart] = useState('7')
  const [destination, setDestination] = useState('26')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [notice, setNotice] = useState('')
  const [storageError, setStorageError] = useState(false)
  const [modal, setModal] = useState<
    'import' | 'event' | 'quest' | 'settings' | 'help' | null
  >(null)
  const [editing, setEditing] = useState<CampusEvent | null>(null)
  const [importing, setImporting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all')
  const [guideSearch, setGuideSearch] = useState('')
  const [resetConfirm, setResetConfirm] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const daily = dayEvents(saved.events, date)
  const upcoming = daily.find(
    (event) =>
      new Date(event.end) > now && !saved.completedClasses.includes(event.id),
  )
  const focusEvent =
    upcoming ||
    (saved.demo
      ? daily.find((event) => !saved.completedClasses.includes(event.id))
      : undefined)
  const origin = buildings.find((building) => building.id === start)!
  const target = buildings.find((building) => building.id === destination)!
  const estimate = walkingEstimate(origin, target)
  const xp =
    saved.quests
      .filter((quest) => quest.done)
      .reduce((sum, quest) => sum + quest.xp, 0) +
    saved.completedClasses.length * 10
  const level = Math.floor(xp / 100) + 1
  const completed = saved.quests.filter((quest) => quest.done).length
  const selectedIsToday = localDate(date) === localDate(now)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [saved])
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    try {
      localStorage.setItem('mitrpg-theme', dark ? 'dark' : 'light')
    } catch {
      /* Theme still works for this session. */
    }
  }, [dark])
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 6500)
    return () => clearTimeout(timer)
  }, [notice])
  useEffect(() => {
    setResetConfirm(false)
  }, [modal])

  function navigate(next: Page) {
    setPage(next)
    setMobileMenu(false)
  }
  function shiftDay(amount: number) {
    const next = new Date(date)
    next.setDate(next.getDate() + amount)
    setDate(next)
  }
  function openEvent(event?: CampusEvent) {
    setEditing(event || null)
    setModal('event')
  }
  function selectEvent(event: CampusEvent) {
    if (!buildings.some((building) => building.id === event.building)) {
      setNotice('Choose a campus building for this event.')
      openEvent(event)
      return
    }
    setDestination(event.building)
    if (page !== 'today') navigate('map')
    setNotice(
      `${event.title} · ${event.location || `Building ${event.building}`}`,
    )
  }
  function toggleQuest(id: string) {
    setSaved((previous) => ({
      ...previous,
      quests: previous.quests.map((quest) =>
        quest.id === id ? { ...quest, done: !quest.done } : quest,
      ),
    }))
  }
  function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const eventStart = new Date(String(form.get('start')))
    const eventEnd = new Date(String(form.get('end')))
    if (
      Number.isNaN(eventStart.getTime()) ||
      Number.isNaN(eventEnd.getTime()) ||
      eventEnd <= eventStart
    ) {
      setNotice('Choose an end time after the start time.')
      return
    }
    const building = String(form.get('building') || '')
    const room = String(form.get('room') || '').trim()
    const title = String(form.get('title') || '').trim()
    if (!title) {
      setNotice('Give your event a name.')
      return
    }
    const entry: CampusEvent = {
      id: editing?.id || crypto.randomUUID(),
      title,
      course: String(form.get('course') || '').trim(),
      start: eventStart.toISOString(),
      end: eventEnd.toISOString(),
      building,
      room,
      location: building
        ? `${building}${room ? `-${room}` : ''}`
        : String(form.get('location') || '').trim(),
    }
    // Saving a real event replaces demonstration events, never mixes them in.
    setSaved((previous) => ({
      ...previous,
      demo: false,
      events: mergeEvents(
        previous.demo
          ? []
          : previous.events.filter((item) => item.id !== entry.id),
        [entry],
      ),
      completedClasses: previous.demo ? [] : previous.completedClasses,
    }))
    setDate(eventStart)
    setModal(null)
    setNotice(editing ? 'Event updated.' : 'Event added.')
  }
  async function importFile(file?: File) {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setNotice('Please choose a calendar smaller than 2 MB.')
      return
    }
    setImporting(true)
    try {
      const events = parseCalendar(await file.text())
      if (!events.length) {
        setNotice(
          'No events found in the import window: the past 30 days through the next 120 days.',
        )
        return
      }
      setSaved((previous) => ({
        ...previous,
        demo: false,
        events: mergeEvents(previous.demo ? [] : previous.events, events),
        completedClasses: previous.demo ? [] : previous.completedClasses,
      }))
      const next =
        events.find((event) => new Date(event.end) >= new Date()) || events[0]
      setDate(new Date(next.start))
      setModal(null)
      setNotice(
        `Imported ${events.length} events. ${events.filter((event) => !event.building).length} locations need matching. Times use your device’s timezone.`,
      )
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'That calendar could not be read. Try exporting a new .ics file.',
      )
    } finally {
      setImporting(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }
  function exportJournal() {
    const blob = new Blob([JSON.stringify(saved, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mitrpg-journal-${localDate(new Date())}.json`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('Data exported. This file contains your private schedule.')
  }

  const navItems: {
    id: Page
    label: string
    icon: typeof Compass
    tag?: string
  }[] = [
    { id: 'today', label: 'Dashboard', icon: Compass },
    { id: 'map', label: 'Campus map', icon: Map },
    {
      id: 'quests',
      label: 'Quest log',
      icon: Flag,
      tag: String(saved.quests.filter((quest) => !quest.done).length),
    },
    { id: 'guide', label: 'Discover', icon: BookOpen },
  ]
  const questList = (limit?: number) =>
    saved.quests
      .filter(
        (quest) =>
          page !== 'quests' ||
          filter === 'all' ||
          (filter === 'done' ? quest.done : !quest.done),
      )
      .slice(0, limit)
      .map((quest) => (
        <div
          className={`quest-item ${quest.done ? 'quest-done' : ''}`}
          key={quest.id}
        >
          <button
            className="quest-checkbox"
            aria-label={`${quest.done ? 'Reopen' : 'Complete'} ${quest.title}`}
            aria-pressed={quest.done}
            onClick={() => toggleQuest(quest.id)}
          >
            {quest.done && <Check size={13} strokeWidth={3} />}
          </button>
          <div>
            <span className="quest-title">{quest.title}</span>
            <p>{quest.detail}</p>
          </div>
          <span className="xp-pill">+{quest.xp} XP</span>
          {page === 'quests' && (
            <button
              className="icon-button delete-quest"
              aria-label={`Delete ${quest.title}`}
              onClick={() =>
                setSaved((previous) => ({
                  ...previous,
                  quests: previous.quests.filter(
                    (item) => item.id !== quest.id,
                  ),
                }))
              }
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))

  const mapCard = (
    <section className="card map-card" aria-labelledby="map-heading">
      <div className="card-heading">
        <div>
          <span className="eyebrow">CAMBRIDGE, MA · 42.3601° N</span>
          <h2 id="map-heading">Your playing field.</h2>
        </div>
        <button
          className="text-button map-expand"
          onClick={() => navigate(page === 'map' ? 'today' : 'map')}
        >
          {page === 'map' ? 'Dashboard' : 'Expand map'}{' '}
          <ArrowUpRight size={15} />
        </button>
      </div>
      <CampusMap
        start={start}
        destination={destination}
        onSelect={setDestination}
        expanded={page === 'map'}
      />
      <div className="map-key">
        <span>
          <i className="key-dot start-dot" /> Start
        </span>
        <span>
          <i className="key-dot destination-dot" /> Destination
        </span>
        <span>
          <i className="key-line" /> Preview, not a route
        </span>
      </div>
    </section>
  )

  const routeCard = (
    <section className="card route-card">
      <div className="route-intro">
        <div className="soft-icon">
          <Footprints size={19} />
        </div>
        <div>
          <h3>Next stop.</h3>
        </div>
      </div>
      <div className="route-fields">
        <label>
          <span className="route-dot hollow" />
          <span className="sr-only">Starting building</span>
          <select
            value={start}
            onChange={(event) => setStart(event.target.value)}
          >
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.short} · {building.id}
              </option>
            ))}
          </select>
        </label>
        <ArrowRight className="route-arrow" size={17} />
        <label>
          <MapPin size={16} />
          <span className="sr-only">Destination building</span>
          <select
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          >
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.short} · {building.id}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="route-summary">
        <span>
          <Clock3 size={14} />{' '}
          {start === destination ? 'Same building' : `~${estimate.minutes} min`}
          <span className="route-distance">
            {estimate.metres} m straight-line
          </span>
        </span>
        <a
          className="button button-primary route-button"
          href={walkingUrl(origin, target)}
          target="_blank"
          rel="noreferrer"
        >
          Get directions <ArrowUpRight size={14} />
        </a>
      </div>
      <p className="route-note">
        <CircleHelp size={12} /> Estimated only. Indoor routes unverified.
      </p>
    </section>
  )

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {mobileMenu && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <button
          className="brand"
          onClick={() => navigate('today')}
          aria-label="MITRPG home"
        >
          <span className="brand-symbol">
            <Navigation size={24} strokeWidth={2} />
            <Sparkles size={10} className="brand-spark" />
          </span>
          <span>
            MIT<span className="brand-light">RPG</span>
            <span className="brand-period">.</span>
            <small>CAMPUS, LEVELED UP.</small>
          </span>
        </button>
        <div className="sidebar-divider" />
        <span className="nav-label">PLAYER MENU</span>
        <nav aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'nav-active' : ''}`}
              onClick={() => navigate(item.id)}
              aria-current={page === item.id ? 'page' : undefined}
            >
              <item.icon size={19} strokeWidth={1.6} />
              <span>{item.label}</span>
              {item.tag && <span className="nav-count">{item.tag}</span>}
              {page === item.id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-signal" aria-hidden="true">
          <div className="signal-orbit">
            <Navigation size={34} strokeWidth={1.2} />
            <span />
            <i />
          </div>
          <span>LESS IHTFP.</span>
          <strong>MORE RPG.</strong>
          <small>EST. 42.3601° N / 71.0942° W</small>
        </div>
        <div className="sidebar-bottom">
          <div className="player-card">
            <div className="player-avatar">
              <Navigation size={21} />
            </div>
            <div>
              <strong>Campus explorer</strong>
              <span>LEVEL {String(level).padStart(2, '0')}</span>
            </div>
            <button
              className="icon-button"
              aria-label="Open settings"
              onClick={() => setModal('settings')}
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
          <div className="player-progress">
            <span style={{ width: `${xp % 100}%` }} />
          </div>
          <div className="xp-caption">
            <span>{xp % 100} / 100 XP</span>
            <span>NEXT LEVEL ↗</span>
          </div>
          <div className="sidebar-tools">
            <button onClick={() => setModal('settings')}>
              <Settings2 size={16} /> Settings
            </button>
            <button
              onClick={() => setDark(!dark)}
              aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu-button"
              aria-label="Open navigation"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
            </button>
            <Compass size={15} />
            <span>MITRPG</span>
            <ChevronRight size={12} />
            <strong>{navItems.find((item) => item.id === page)?.label}</strong>
          </div>
          <div className="topbar-right">
            <span>
              <span className="live-dot" /> CAMPUS MODE
            </span>
            <button
              className="icon-button"
              aria-label="About MITRPG"
              onClick={() => setModal('help')}
            >
              <CircleHelp size={17} />
            </button>
          </div>
        </header>
        <main id="main-content">
          <div className={`page-intro ${page === 'today' ? 'hero-intro' : ''}`}>
            <div>
              <div className="date-eyebrow">
                <span className="little-star">
                  <Sparkles size={13} />
                </span>
                {date
                  .toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                  .toUpperCase()}
                <span className="semester-badge">PLAYER ONE</span>
              </div>
              <h1>
                {page === 'today' ? (
                  <>
                    Same campus.
                    <br />
                    <em>New game.</em>
                  </>
                ) : page === 'map' ? (
                  <>
                    Know your <em>terrain.</em>
                  </>
                ) : page === 'quests' ? (
                  <>
                    Side quests.
                    <br />
                    <em>Main character.</em>
                  </>
                ) : (
                  <>
                    Go <em>off-script.</em>
                  </>
                )}
              </h1>
              {page === 'today' && (
                <p>Get to class. Get things done. Get a little lost.</p>
              )}
            </div>
            {page === 'today' && <CampusHero />}
            <button
              className="button button-outline import-top"
              onClick={() => setModal('import')}
            >
              <Upload size={15} /> Import schedule
            </button>
          </div>
          {storageError && (
            <div className="storage-warning" role="alert">
              Browser storage is unavailable or full. Your changes will not
              survive a reload. Export your data in Settings.
            </div>
          )}
          {saved.demo && (
            <div className="demo-banner">
              <span>
                <span className="demo-dot" />
                <strong>DEMO MODE</strong> Sample schedule
              </span>
              <button onClick={() => setModal('import')}>
                Import yours <ArrowRight size={13} />
              </button>
            </div>
          )}

          {page === 'today' && (
            <div className="stats-strip">
              <div className="stat-cell">
                <span className="stat-icon">
                  <CalendarDays size={19} />
                </span>
                <strong>{String(daily.length).padStart(2, '0')}</strong>
                <span>ON THE SCHEDULE</span>
                <span className="stat-mini-bars" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <button className="stat-cell" onClick={() => navigate('quests')}>
                <span className="stat-icon stat-lime">
                  <Flag size={19} />
                </span>
                <strong>
                  {String(saved.quests.length - completed).padStart(2, '0')}
                </strong>
                <span>ACTIVE QUESTS</span>
                <ArrowUpRight size={17} />
              </button>
              <div className="stat-cell">
                <span className="stat-icon stat-orange">
                  <Sparkles size={19} />
                </span>
                <strong>{String(xp).padStart(2, '0')}</strong>
                <span>TOTAL XP</span>
                <span className="stat-level">
                  LVL {String(level).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}
          {(page === 'today' || page === 'map') && (
            <div
              className={`dashboard-grid ${page === 'map' ? 'map-page-grid' : ''}`}
            >
              <div className="main-column">
                {mapCard}
                {routeCard}
                {page === 'map' && (
                  <section className="card map-details">
                    <span className="eyebrow">YOUR DESTINATION</span>
                    <h2>{target.name}</h2>
                    <p>{target.description}</p>
                    <div className="info-callout">
                      <ShieldCheck size={20} />
                      <p>
                        Schematic map. Indoor connections, entrances, hours, and
                        accessibility are unverified. Use official MIT maps.
                      </p>
                    </div>
                    <a
                      className="text-button"
                      href={`https://whereis.mit.edu/?go=${target.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Check the official campus map <ExternalLink size={14} />
                    </a>
                  </section>
                )}
              </div>
              <div className="right-column">
                <section className="card schedule-card">
                  <div className="section-heading">
                    <h2>
                      The main quest<span className="heading-period">.</span>
                    </h2>
                    <button
                      className="icon-button"
                      aria-label="Add an event"
                      onClick={() => openEvent()}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="schedule-date">
                    <button
                      className="icon-button"
                      aria-label="Previous day"
                      onClick={() => shiftDay(-1)}
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      className="today-date-button"
                      onClick={() => setDate(new Date())}
                    >
                      {selectedIsToday
                        ? 'Today'
                        : date.toLocaleDateString([], { weekday: 'short' })}
                      <span>
                        {' '}
                        {date.toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Next day"
                      onClick={() => shiftDay(1)}
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                  {daily.length ? (
                    <div className="timeline">
                      {daily.map((event, index) => {
                        const done = saved.completedClasses.includes(event.id)
                        const active = focusEvent?.id === event.id && !done
                        return (
                          <div
                            className={`timeline-item ${active ? 'timeline-active' : ''} ${done ? 'timeline-complete' : ''}`}
                            key={event.id}
                          >
                            <div className="timeline-track">
                              <span className="timeline-dot">
                                {done ? <Check size={9} /> : ''}
                              </span>
                              {index < daily.length - 1 && (
                                <span className="timeline-line" />
                              )}
                            </div>
                            <div className="timeline-content">
                              <div className="event-time">
                                {event.allDay ? (
                                  'All day'
                                ) : (
                                  <>
                                    {formatTime(event.start)}{' '}
                                    <span>– {formatTime(event.end)}</span>
                                  </>
                                )}
                                {active && (
                                  <span className="next-tag">
                                    {saved.demo
                                      ? 'PREVIEW'
                                      : new Date(event.start) <= now &&
                                          selectedIsToday
                                        ? 'NOW'
                                        : 'UP NEXT'}
                                  </span>
                                )}
                              </div>
                              <div
                                className={`event-card ${active ? 'event-card-active' : ''}`}
                              >
                                <div className="event-course">
                                  {event.course || 'EVENT'}
                                  <button
                                    className="event-edit"
                                    aria-label={`Edit ${event.title}`}
                                    onClick={() => openEvent(event)}
                                  >
                                    <MoreHorizontal size={15} />
                                  </button>
                                </div>
                                <h3>{event.title}</h3>
                                <button
                                  className="event-location"
                                  onClick={() => selectEvent(event)}
                                >
                                  <MapPin size={12} />
                                  {event.location || 'Match a location'}
                                  <ArrowUpRight size={11} />
                                </button>
                                {active && (
                                  <button
                                    className="event-route"
                                    onClick={() => selectEvent(event)}
                                  >
                                    <Navigation size={12} /> Locate{' '}
                                    <ArrowRight size={12} />
                                  </button>
                                )}
                              </div>
                              <button
                                className="class-complete"
                                onClick={() =>
                                  setSaved((previous) => ({
                                    ...previous,
                                    completedClasses: done
                                      ? previous.completedClasses.filter(
                                          (id) => id !== event.id,
                                        )
                                      : [
                                          ...previous.completedClasses,
                                          event.id,
                                        ],
                                  }))
                                }
                              >
                                {done ? (
                                  <CheckCheck size={11} />
                                ) : (
                                  <Check size={11} />
                                )}
                                {done ? 'Done · undo' : 'Complete · +10 XP'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <CalendarDays size={29} strokeWidth={1.2} />
                      <h3>Schedule clear.</h3>
                      <button
                        className="text-button"
                        onClick={() => openEvent()}
                      >
                        Add an event <Plus size={13} />
                      </button>
                    </div>
                  )}
                  <button
                    className="schedule-footer"
                    onClick={() => openEvent()}
                  >
                    <Plus size={13} /> Add event
                  </button>
                </section>
                {page === 'today' && (
                  <section className="card quests-card">
                    <div className="section-heading">
                      <h2>
                        Side quests<span className="heading-period">.</span>
                      </h2>
                      <span className="tiny-count">
                        {completed}/{saved.quests.length}
                      </span>
                    </div>
                    {questList(3)}
                    <button
                      className="quest-footer"
                      onClick={() => navigate('quests')}
                    >
                      Open quest log <ArrowRight size={14} />
                    </button>
                  </section>
                )}
              </div>
            </div>
          )}

          {page === 'quests' && (
            <div className="quest-page">
              <section className="card quest-page-main">
                <div className="section-heading">
                  <div>
                    <h2>Quest log</h2>
                  </div>
                  <button
                    className="button button-primary"
                    onClick={() => setModal('quest')}
                  >
                    <Plus size={15} /> New quest
                  </button>
                </div>
                <div
                  className="filter-tabs"
                  role="group"
                  aria-label="Filter quests"
                >
                  {(['all', 'active', 'done'] as const).map((value) => (
                    <button
                      className={filter === value ? 'selected' : ''}
                      key={value}
                      onClick={() => setFilter(value)}
                      aria-pressed={filter === value}
                    >
                      {value === 'all'
                        ? 'All quests'
                        : value === 'active'
                          ? 'In progress'
                          : 'Completed'}
                    </button>
                  ))}
                </div>
                <div className="quest-page-list">
                  {questList()}
                  {!saved.quests.some(
                    (quest) =>
                      filter === 'all' ||
                      (filter === 'done' ? quest.done : !quest.done),
                  ) && (
                    <div className="empty-state">
                      <Sprout size={32} />
                      <h3>No quests here.</h3>
                      <p>
                        {filter === 'done'
                          ? 'Finish a quest to earn XP.'
                          : 'Create your next quest.'}
                      </p>
                    </div>
                  )}
                </div>
              </section>
              <section className="growth-card">
                <div className="growth-illustration">
                  <Navigation size={82} strokeWidth={1.2} />
                  <span>✧</span>
                </div>
                <span className="eyebrow">PLAYER STATS</span>
                <h2>
                  Level {level}
                  <br />
                  <em>Campus explorer</em>
                </h2>
                <p>{xp} XP earned</p>
                <div className="growth-track">
                  <span style={{ width: `${xp % 100}%` }} />
                </div>
                <small>
                  {100 - (xp % 100)} XP to level {level + 1}
                </small>
                <div className="achievement">
                  <div className="soft-icon">
                    <Flag size={20} />
                  </div>
                  <div>
                    <strong>
                      {completed > 0 ? 'First quest cleared' : 'First quest'}
                    </strong>
                    <p>
                      {completed > 0
                        ? 'Achievement unlocked'
                        : 'Complete a quest to unlock'}
                    </p>
                  </div>
                  {completed > 0 && <Check size={17} />}
                </div>
              </section>
            </div>
          )}

          {page === 'guide' && (
            <>
              <div className="guide-toolbar">
                <label>
                  <Compass size={17} />
                  <input
                    type="search"
                    placeholder="Search buildings or landmarks"
                    aria-label="Search campus buildings"
                    value={guideSearch}
                    onChange={(event) => setGuideSearch(event.target.value)}
                  />
                </label>
                <span>{buildings.length} locations</span>
              </div>
              <div className="guide-grid">
                {buildings
                  .filter((building) =>
                    `${building.name} ${building.short} ${building.id}`
                      .toLowerCase()
                      .includes(guideSearch.toLowerCase()),
                  )
                  .map((building, index) => (
                    <article key={building.id} className="card guide-card">
                      <div
                        className={`guide-illustration guide-color-${index % 3}`}
                      >
                        <span className="building-number">{building.id}</span>
                        {index % 3 === 0 ? (
                          <GraduationCap size={65} strokeWidth={0.8} />
                        ) : index % 3 === 1 ? (
                          <BookOpen size={59} strokeWidth={0.8} />
                        ) : (
                          <Sprout size={61} strokeWidth={0.8} />
                        )}
                        <span className="guide-star">✧</span>
                      </div>
                      <div className="guide-body">
                        <span className="eyebrow">{building.category}</span>
                        <h2>{building.name}</h2>
                        <p>{building.description}</p>
                        <button
                          className="text-button"
                          onClick={() => {
                            setDestination(building.id)
                            navigate('map')
                          }}
                        >
                          Find on campus <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
              {!buildings.some((building) =>
                `${building.name} ${building.short} ${building.id}`
                  .toLowerCase()
                  .includes(guideSearch.toLowerCase()),
              ) && (
                <div className="empty-state">
                  <MapPin size={28} />
                  <h3>No results.</h3>
                  <p>Try a building number or a different name.</p>
                </div>
              )}
            </>
          )}
          <footer className="page-footer">
            <span>
              <Navigation size={13} /> MITRPG / CAMPUS, LEVELED UP.
            </span>
            <button onClick={() => setModal('help')}>
              Map info & privacy <span>↗</span>
            </button>
          </footer>
        </main>
      </div>
      <div
        className={`toast ${notice ? 'toast-visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {notice && (
          <>
            <span>{notice}</span>
            <button
              className="icon-button"
              aria-label="Dismiss notification"
              onClick={() => setNotice('')}
            >
              <X size={15} />
            </button>
          </>
        )}
      </div>

      {modal === 'import' && (
        <Modal title="Import schedule" onClose={() => setModal(null)}>
          <p className="modal-description">
            Upload an iCalendar (.ics) export. Edit classes and locations after
            import.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept=".ics,text/calendar"
            className="sr-only"
            id="calendar-file"
            onChange={(event) => void importFile(event.target.files?.[0])}
          />
          <button
            className="upload-zone"
            disabled={importing}
            onClick={() => fileInput.current?.click()}
          >
            <div className="upload-icon">
              <Upload size={28} strokeWidth={1.3} />
            </div>
            <strong>{importing ? 'Importing…' : 'Choose .ics file'}</strong>
            <span>.ics files up to 2 MB</span>
          </button>
          <div className="info-callout">
            <ShieldCheck size={21} />
            <p>
              Stored on this device only. Replaces demo events; keeps your real
              events.
            </p>
          </div>
          <p className="fine-print">
            Imports the past 30 days and next 120 days, including recurring
            events. Times display in your device’s timezone. Unmatched rooms can
            be edited after importing. Hydrant integration is not included.
          </p>
          <button className="text-button" onClick={() => openEvent()}>
            Add an event manually <ArrowRight size={14} />
          </button>
        </Modal>
      )}
      {modal === 'event' && (
        <Modal
          title={editing ? 'Edit event' : 'New event'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={saveEvent} className="editor-form">
            <label>
              Event name
              <input
                autoFocus
                name="title"
                required
                maxLength={120}
                placeholder="Physics II"
                defaultValue={editing?.title}
              />
            </label>
            <label>
              Course code <span>(optional)</span>
              <input
                name="course"
                maxLength={30}
                placeholder="e.g. 8.02"
                defaultValue={editing?.course}
              />
            </label>
            <div className="form-row">
              <label>
                Starts
                <input
                  type="datetime-local"
                  name="start"
                  required
                  defaultValue={
                    editing
                      ? inputDateTime(editing.start)
                      : `${localDate(date)}T13:00`
                  }
                />
              </label>
              <label>
                Ends
                <input
                  type="datetime-local"
                  name="end"
                  required
                  defaultValue={
                    editing
                      ? inputDateTime(editing.end)
                      : `${localDate(date)}T14:00`
                  }
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Campus building
                <select name="building" defaultValue={editing?.building || ''}>
                  <option value="">Other / choose later</option>
                  {buildings.map((building) => (
                    <option value={building.id} key={building.id}>
                      {building.id} · {building.short}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Room <span>(optional)</span>
                <input
                  name="room"
                  maxLength={40}
                  placeholder="100"
                  defaultValue={editing?.room}
                />
              </label>
            </div>
            <label>
              Original / other location <span>(optional)</span>
              <input
                name="location"
                maxLength={200}
                placeholder="For locations outside this campus guide"
                defaultValue={editing?.location}
              />
            </label>
            <p className="fine-print">
              Times use your device’s timezone. Room numbers are saved for
              reference, not indoor turn-by-turn routing.
              {saved.demo && ' Saving an event replaces the sample schedule.'}
            </p>
            <div className="form-actions">
              {editing && (
                <button
                  type="button"
                  className="button danger-button"
                  onClick={() => {
                    setSaved((previous) => ({
                      ...previous,
                      events: previous.events.filter(
                        (event) => event.id !== editing.id,
                      ),
                      completedClasses: previous.completedClasses.filter(
                        (id) => id !== editing.id,
                      ),
                    }))
                    setModal(null)
                    setNotice('Event deleted.')
                  }}
                >
                  <Trash2 size={14} />
                  Delete event
                </button>
              )}
              <button type="submit" className="button button-primary">
                Save event <Check size={14} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'quest' && (
        <Modal title="New quest" onClose={() => setModal(null)}>
          <form
            className="editor-form"
            onSubmit={(event) => {
              event.preventDefault()
              const form = new FormData(event.currentTarget)
              const title = String(form.get('title')).trim()
              if (!title) return
              setSaved((previous) => ({
                ...previous,
                quests: [
                  ...previous.quests,
                  {
                    id: crypto.randomUUID(),
                    title,
                    detail: String(form.get('detail')).trim(),
                    xp: 20,
                    done: false,
                  },
                ],
              }))
              setModal(null)
              setNotice('Quest added.')
            }}
          >
            <label>
              Quest name
              <input
                name="title"
                autoFocus
                required
                maxLength={100}
                placeholder="Take a walk by the Charles"
              />
            </label>
            <label>
              Description <span>(optional)</span>
              <input name="detail" maxLength={200} placeholder="Add a note" />
            </label>
            <div className="info-callout">
              <Sparkles size={20} />
              <p>+20 XP on completion. No streaks or penalties.</p>
            </div>
            <div className="form-actions">
              <button type="submit" className="button button-primary">
                Add quest <Plus size={14} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'settings' && (
        <Modal title="Settings" onClose={() => setModal(null)}>
          <div className="settings-row">
            <div>
              <strong>Dark mode</strong>
            </div>
            <button
              className={`switch ${dark ? 'switch-on' : ''}`}
              role="switch"
              aria-checked={dark}
              aria-label="Dark mode"
              onClick={() => setDark(!dark)}
            >
              <span />
            </button>
          </div>
          <div className="settings-row">
            <div>
              <strong>Export data</strong>
              <p>Schedule, quests, and XP as JSON.</p>
            </div>
            <button className="button button-outline" onClick={exportJournal}>
              <ArrowDownToLine size={15} />
              Export
            </button>
          </div>
          <div className="info-callout">
            <ShieldCheck size={22} />
            <p>
              Data stays in this browser. Clearing site data deletes it.
              External maps receive building coordinates, not your calendar.
            </p>
          </div>
          <p className="fine-print">
            Coming later: photo quests, themes, and course planning.
          </p>
          <div className="settings-row reset-row">
            <div>
              <strong>Reset data</strong>
              <p>
                {resetConfirm
                  ? 'This deletes your saved schedule and quests. Export first if you want to keep them.'
                  : 'Clear progress and restore demo data.'}
              </p>
            </div>
            <button
              className="button danger-button"
              onClick={() => {
                if (!resetConfirm) {
                  setResetConfirm(true)
                  return
                }
                setSaved({
                  events: createDemoEvents(),
                  quests: initialQuests,
                  demo: true,
                  completedClasses: [],
                })
                setDate(new Date())
                setModal(null)
                setNotice('Demo restored. Progress cleared.')
              }}
            >
              {resetConfirm ? 'Confirm reset' : 'Reset'}
            </button>
          </div>
        </Modal>
      )}
      {modal === 'help' && (
        <Modal title="About MITRPG" onClose={() => setModal(null)}>
          <p className="modal-description">
            An independent campus companion. Not affiliated with or endorsed by
            MIT.
          </p>
          <div className="help-item">
            <CalendarDays size={22} />
            <div>
              <h3>Schedule</h3>
              <p>
                Import a calendar or add classes manually. Select a class
                location to find its building.
              </p>
            </div>
          </div>
          <div className="help-item">
            <Route size={22} />
            <div>
              <h3>Map limitations</h3>
              <p>
                Our illustrated map is schematic, not a navigation tool. Travel
                times are rough straight-line-based estimates. Use the external
                walking directions for routing. Indoor connections are not yet
                supported.
              </p>
            </div>
          </div>
          <div className="help-item">
            <Sprout size={22} />
            <div>
              <h3>Progression</h3>
              <p>
                Complete quests for XP. Every 100 XP grows your level. No
                streaks to maintain, no penalties for resting.
              </p>
            </div>
          </div>
          <a
            className="button button-outline"
            href="https://whereis.mit.edu/"
            target="_blank"
            rel="noreferrer"
          >
            Official MIT campus map <ArrowUpRight size={14} />
          </a>
        </Modal>
      )}
    </div>
  )
}
