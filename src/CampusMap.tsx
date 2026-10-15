import { useState } from 'react'
import { ArrowUpRight, LocateFixed, Minus, Plus } from 'lucide-react'
import { buildings } from './data'

type Props = {
  start: string
  destination: string
  onSelect: (id: string) => void
  expanded?: boolean
}

export default function CampusMap({
  start,
  destination,
  onSelect,
  expanded,
}: Props) {
  const [zoom, setZoom] = useState(1)
  const [showLabels, setShowLabels] = useState(true)
  const origin = buildings.find((b) => b.id === start)
  const target = buildings.find((b) => b.id === destination)
  return (
    <div className={`campus-map ${expanded ? 'expanded-map' : ''}`}>
      <div className="map-topline">
        <span className="map-chip">
          <span className="live-dot" /> MIT / MAIN CAMPUS
        </span>
        <a
          className="map-official"
          href="https://whereis.mit.edu/"
          target="_blank"
          rel="noreferrer"
        >
          Official MIT map <ArrowUpRight size={12} />
        </a>
      </div>
      <svg
        className="map-art"
        viewBox="0 0 820 470"
        role="group"
        aria-label="Illustrated schematic of MIT campus. Select a building to preview a destination. Dashed lines show a connection, not a walking route."
      >
        <defs>
          <pattern
            id="paper"
            width="26"
            height="26"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M26 0H0V26"
              stroke="var(--map-grain)"
              strokeWidth=".6"
              fill="none"
            />
            <path
              d="M0 3V0H3"
              stroke="var(--map-grid-point)"
              strokeWidth=".8"
              fill="none"
            />
          </pattern>
          <pattern
            id="lawn"
            width="12"
            height="12"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="m3 9 1-2m4-3 1-2"
              stroke="var(--map-grass-line)"
              strokeWidth=".7"
            />
          </pattern>
          <filter id="map-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2"
              floodColor="#b69af8"
              floodOpacity=".4"
            />
          </filter>
          <g id="tree">
            <ellipse cy="9" rx="7" ry="2" fill="#43664a" opacity=".09" />
            <path
              d="M0 0v10"
              stroke="var(--map-tree-stroke)"
              strokeWidth="1.3"
            />
            <path
              d="m0-11 8 5 1 9-9 5-8-5V-6Z"
              fill="var(--map-tree)"
              stroke="var(--map-tree-stroke)"
              strokeWidth=".8"
            />
            <path
              d="m0 6 1-9m-1 6 4-3"
              fill="none"
              stroke="var(--map-tree-stroke)"
              strokeWidth=".7"
            />
          </g>
          <g id="building">
            <rect
              x="-15"
              y="-11"
              width="30"
              height="22"
              rx="2"
              fill="var(--map-building)"
              stroke="var(--map-outline)"
              strokeWidth="1.2"
            />
            <path
              d="M-11-7h22v14h-22Z"
              fill="none"
              stroke="var(--map-roof)"
              strokeWidth=".7"
            />
          </g>
        </defs>
        <rect width="820" height="470" fill="var(--map-land)" />
        <rect width="820" height="470" fill="url(#paper)" />
        <path
          d="M-30 433C169 403 291 408 452 365S699 340 850 305V500H-30Z"
          fill="var(--map-river)"
        />
        <path
          d="M-20 424C169 394 291 399 449 356S697 331 850 296"
          fill="none"
          stroke="var(--map-river-edge)"
          strokeWidth="2"
        />
        <g stroke="var(--map-road-edge)" strokeWidth="19" fill="none">
          <path d="M174-30 420 500" />
          <path d="M12 116 813 79" />
          <path d="M90 183 756 149" />
          <path d="M520-10 643 348" />
          <path d="M-20 415C167 385 291 390 446 347S696 322 845 287" />
        </g>
        <g stroke="var(--map-road)" strokeWidth="15" fill="none">
          <path d="M174-30 420 500" />
          <path d="M12 116 813 79" />
          <path d="M90 183 756 149" />
          <path d="M520-10 643 348" />
          <path d="M-20 415C167 385 291 390 446 347S696 322 845 287" />
        </g>
        <g
          fill="var(--map-grass)"
          stroke="var(--map-grass-line)"
          strokeWidth="1"
        >
          <path d="m338 293 53-13 14-25 37 1 8 33 36 17-22 44-84 18Z" />
          <path d="m91 251 71-28 38 71-72 33-31-27Z" />
          <path d="m49 322 70-5 29 47-80 22Z" />
          <path d="m569 225 40-16 31 91-39 11Z" />
        </g>
        <path
          d="m338 293 53-13 14-25 37 1 8 33 36 17-22 44-84 18Z"
          fill="url(#lawn)"
        />
        <g
          fill="var(--map-building)"
          stroke="var(--map-outline)"
          strokeWidth="1.3"
          strokeLinejoin="round"
        >
          <path d="m293 222 27-8 17 37-27 9Z" />
          <path d="m318 257 18-6 13 28-18 8Z" />
          <path d="m341 213 64-15 8 20-65 16Z" />
          <path d="m353 239 52-13 5 18-52 13Z" />
          <path d="m401 202 29-7 11 38-28 7Z" />
          <path d="m442 225 28-7 15 57-26 7Z" />
          <path d="m469 276 46-13 9 19-46 13Z" />
          <path d="m365 269 17-4 13 41-17 4Z" />
          <path d="m446 190 27-7-10-38-21 5-5-20-23 6 7 23 17-3Z" />
          <path d="m473 130 32-9 14 41-33 10Z" />
          <path d="m489 181 33-10 8 25-33 10Z" />
          <path d="m391 167 24-6-12-31-25 7Z" />
          <path d="m611 174 38-12 11 31-39 13Z" />
          <path d="m653 181 40-12 18 42-42 14Z" />
          <path d="m595 114 35-9 8 25-33 10Z" />
          <path d="m187 218 42-12 17 41-44 15Z" />
          <path d="m182 153 24-8 10 23-25 9Z" />
          <path d="m132 130 24-9 10 23-25 9Z" />
          <path d="m344 100 28-3 2 22-28 3Z" />
          <path d="m393 98 52-3 2 19-52 3Z" />
          <path d="m683 96 43-2 2 23-43 3Z" />
        </g>
        <g fill="none" stroke="var(--map-roof)" strokeWidth="1">
          <path d="m346 218 56-13m-45 39 44-11m8-32 13 32m26-2 16 44m13 4 34-10m-32-133 27-8 10 31-25 8Z" />
          <path d="m193 222 30-9 12 30-31 10Zm424-43 28-9 8 20-29 10Zm44 6 29-9 11 29-30 9Z" />
        </g>
        <path
          d="m511 72 17-15 17 12 17-5 16 18-13 17-23-4-17 9-17-13Z"
          fill="var(--map-stata)"
          stroke="var(--map-outline)"
          strokeWidth="1.2"
        />
        <path
          d="m528 57 3 26 14-14m-14 14 13 12m1-26 6 18 27-5m-27 5 11-23"
          fill="none"
          stroke="var(--map-roof)"
        />
        <ellipse
          cx="421"
          cy="221"
          rx="15"
          ry="8"
          fill="var(--map-building)"
          stroke="var(--map-outline)"
          strokeWidth="1.3"
        />
        <path
          d="M407 221c0-24 28-24 28 0"
          fill="var(--map-dome)"
          stroke="var(--map-outline)"
          strokeWidth="1.3"
        />
        <path d="M421 203v-7m-3 0h6" stroke="var(--map-outline)" />
        <path
          d="M127 318c2-39 57-51 66-12l-33 24Z"
          fill="var(--map-dome)"
          stroke="var(--map-outline)"
          strokeWidth="1.4"
        />
        <path
          d="m131 316 59-9m-30 20 3-36"
          fill="none"
          stroke="var(--map-roof)"
        />
        <ellipse
          cx="220"
          cy="306"
          rx="14"
          ry="17"
          fill="var(--map-building)"
          stroke="var(--map-outline)"
          strokeWidth="1.2"
        />
        <g opacity=".95">
          {[
            [73, 200],
            [91, 214],
            [115, 236],
            [128, 262],
            [145, 244],
            [172, 274],
            [259, 169],
            [277, 198],
            [291, 183],
            [267, 261],
            [283, 285],
            [309, 323],
            [342, 352],
            [372, 346],
            [455, 327],
            [471, 310],
            [511, 315],
            [544, 301],
            [558, 276],
            [582, 265],
            [606, 286],
            [635, 248],
            [716, 247],
            [745, 232],
            [758, 267],
            [719, 113],
            [456, 79],
            [475, 74],
            [329, 137],
            [308, 145],
            [200, 354],
            [232, 366],
            [98, 358],
          ].map(([x, y], i) => (
            <use
              key={i}
              href="#tree"
              transform={`translate(${x} ${y}) scale(${i % 3 === 0 ? 1.2 : 1})`}
            />
          ))}
        </g>
        <g
          className="map-street-labels"
          fill="var(--map-label-muted)"
          fontSize="8"
          letterSpacing="2"
        >
          <text transform="translate(235 93) rotate(65)">
            MASSACHUSETTS AVE
          </text>
          <text x="355" y="88" transform="rotate(-3 355 88)">
            VASSAR STREET
          </text>
          <text x="610" y="143" transform="rotate(-3 610 143)">
            MAIN STREET
          </text>
          <text x="534" y="336" transform="rotate(-12 534 336)">
            MEMORIAL DRIVE
          </text>
          <text
            x="527"
            y="414"
            fill="var(--map-river-label)"
            fontSize="15"
            letterSpacing="5"
            transform="rotate(-8 527 414)"
          >
            CHARLES RIVER
          </text>
        </g>
        {showLabels && (
          <g
            className="map-place-labels"
            textAnchor="middle"
            fill="var(--map-label)"
          >
            <text x="407" y="324" fontSize="11" fontStyle="italic">
              Killian Court
            </text>
            <text x="115" y="353" fontSize="10">
              Kresge Oval
            </text>
            <text x="689" y="244" fontSize="10">
              Media Lab
            </text>
            <text x="571" y="64" fontSize="10">
              Stata Center
            </text>
            <text x="208" y="281" fontSize="10">
              Student Center
            </text>
            <text x="438" y="248" fontSize="10">
              Great Dome
            </text>
            <text x="473" y="112" fontSize="10">
              Building 26
            </text>
          </g>
        )}
        {origin && target && origin.id !== target.id && (
          <path
            d={`M${origin.x} ${origin.y} Q${(origin.x + target.x) / 2 + 25} ${(origin.y + target.y) / 2 + 25} ${target.x} ${target.y}`}
            stroke="var(--green)"
            strokeWidth="3"
            strokeDasharray="5 7"
            strokeLinecap="round"
            fill="none"
            opacity=".8"
          />
        )}
        {buildings.map((building) => {
          const selected = building.id === destination
          const isStart = building.id === start
          return (
            <g
              key={building.id}
              className="map-marker"
              role="button"
              tabIndex={0}
              aria-label={`Select ${building.name}, building ${building.id}`}
              aria-pressed={selected}
              onClick={() => onSelect(building.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(building.id)
                }
              }}
              transform={`translate(${building.x} ${building.y})`}
            >
              <circle r="22" fill="transparent" />
              {selected && <circle r="25" fill="var(--green)" opacity=".15" />}
              <circle
                r={selected ? 17 : isStart ? 11 : 11}
                fill={
                  selected
                    ? 'var(--green)'
                    : isStart
                      ? 'var(--map-land)'
                      : 'var(--map-pin)'
                }
                stroke={isStart ? 'var(--green)' : 'var(--map-land)'}
                strokeWidth={isStart ? 3 : 2.5}
                filter="url(#map-shadow)"
              />
              {!isStart || selected ? (
                <text
                  y="3.5"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill={selected ? 'var(--on-green)' : 'var(--map-label)'}
                >
                  {building.id}
                </text>
              ) : isStart ? (
                <circle r="4" fill="var(--green)" />
              ) : null}
              {selected && (
                <g className="destination-callout">
                  <rect
                    x="24"
                    y="-16"
                    width="85"
                    height="29"
                    rx="5"
                    fill="var(--surface)"
                    stroke="var(--line)"
                  />
                  <circle cx="35" cy="-2" r="3" fill="var(--lime)" />
                  <text
                    x="44"
                    y="1.5"
                    fontSize="8"
                    fontWeight="600"
                    fill="var(--text)"
                  >
                    BUILDING {building.id}
                  </text>
                </g>
              )}
            </g>
          )
        })}
        <g
          transform="translate(758 360)"
          stroke="var(--map-label-muted)"
          fill="none"
        >
          <path d="M0 0v37m-11-18h22m-17-13 12 25m-12 0L6 6" strokeWidth=".7" />
          <path
            d="m0 0-4 13 4-3 4 3Z"
            fill="var(--map-label-muted)"
            strokeWidth=".5"
          />
          <text
            y="-8"
            textAnchor="middle"
            fill="var(--map-label-muted)"
            stroke="none"
            fontSize="9"
          >
            N
          </text>
        </g>
      </svg>
      <div className="map-bottomline">
        <button
          className={`map-chip label-toggle ${showLabels ? 'active' : ''}`}
          onClick={() => setShowLabels(!showLabels)}
          aria-pressed={showLabels}
        >
          Aa <span>Map labels</span>
        </button>
        <span className="map-disclaimer">SCHEMATIC · NOT TO SCALE</span>
      </div>
      <div className="map-controls">
        <button
          aria-label="Zoom in"
          disabled={zoom >= 1.6}
          onClick={() => setZoom(Math.min(1.6, zoom + 0.2))}
        >
          <Plus size={17} />
        </button>
        <button
          aria-label="Zoom out"
          disabled={zoom <= 1}
          onClick={() => setZoom(Math.max(1, zoom - 0.2))}
        >
          <Minus size={17} />
        </button>
        <button aria-label="Reset map view" onClick={() => setZoom(1)}>
          <LocateFixed size={17} />
        </button>
      </div>
      <style>{`.map-art { transform: scale(${zoom}); }`}</style>
    </div>
  )
}
