export default function CampusHero() {
  return (
    <div className="campus-hero-art" aria-hidden="true">
      <svg viewBox="0 0 380 235" fill="none">
        <defs>
          <linearGradient
            id="hero-top"
            x1="90"
            y1="70"
            x2="240"
            y2="210"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#d5c5ff" />
            <stop offset="1" stopColor="#8e6adb" />
          </linearGradient>
          <linearGradient
            id="hero-dome"
            x1="175"
            y1="40"
            x2="245"
            y2="117"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#e5d8ff" />
            <stop offset="1" stopColor="#a081e9" />
          </linearGradient>
          <radialGradient id="hero-glow">
            <stop stopColor="#9c7de9" stopOpacity=".28" />
            <stop offset="1" stopColor="#9c7de9" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="202" cy="129" rx="165" ry="103" fill="url(#hero-glow)" />
        <ellipse
          cx="202"
          cy="160"
          rx="153"
          ry="43"
          stroke="#a78bdc"
          strokeOpacity=".2"
          transform="rotate(-13 202 160)"
        />
        <ellipse
          cx="202"
          cy="160"
          rx="134"
          ry="38"
          stroke="#a78bdc"
          strokeOpacity=".13"
          transform="rotate(-13 202 160)"
        />
        <path
          d="m91 165 115-53 108 56-115 56Z"
          fill="#7761a7"
          fillOpacity=".12"
        />
        <g className="hero-building">
          <path d="m104 145 99-47 100 49-101 49Z" fill="#b49ae6" />
          <path d="m104 145 98 49v16l-98-49Z" fill="#72549f" />
          <path d="m202 194 101-47v16l-101 47Z" fill="#493265" />
          <path d="m130 131 72-33 74 36-74 36Z" fill="url(#hero-top)" />
          <path d="m130 131 72 39v25l-72-36Z" fill="#b293de" />
          <path d="m202 170 74-36v25l-74 36Z" fill="#7754af" />
          <path d="m140 129 62-29 62 31-62 30Z" fill="#d6c3f4" />
          <path d="m140 129 62 32v7l-62-32Z" fill="#b194d8" />
          <path d="m202 161 62-30v7l-62 30Z" fill="#8463b5" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <path
                d={`m${143 + i * 10} ${142 + i * 5.2} 5 2.6v25l-5-2.6Z`}
                fill="#dac5f7"
              />
              <path
                d={`m${143 + i * 10 + 5} ${142 + i * 5.2 + 2.6} 2-1v25l-2 1Z`}
                fill="#8b6abd"
              />
            </g>
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`m${212 + i * 9} ${166 - i * 4.5} 4-2v25l-4 2Z`}
              fill="#b091df"
            />
          ))}
          <path d="m163 120 38-18 39 19-39 19Z" fill="#d6c3f4" />
          <path d="m163 120 38 20v11l-38-19Z" fill="#af91d8" />
          <path d="m201 140 39-19v12l-39 18Z" fill="#8562b3" />
          <ellipse cx="202" cy="114" rx="35" ry="17" fill="#bda0ed" />
          <path
            d="M167 114c0-60 70-60 70 0 0 20-70 20-70 0Z"
            fill="url(#hero-dome)"
          />
          <path
            d="M202 69c-22 0-25 34-25 49M202 69c22 0 25 34 25 49M202 69v60"
            stroke="#c1a8ee"
            strokeWidth="1.3"
          />
          <ellipse
            cx="202"
            cy="114"
            rx="35"
            ry="17"
            stroke="#eadfff"
            strokeOpacity=".55"
          />
          <path
            d="M202 68v-9m-3 0h6"
            stroke="#e4d6ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        <g className="hero-spark" transform="translate(304 56)" fill="#d8f88b">
          <path d="m0-18 4 12 12-5-7 11 12 5-13 3 4 13-11-9-8 11 1-14-14-1 12-7-9-10 13 4Z" />
        </g>
        <path d="m94 63 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#ad96e3" />
        <circle cx="73" cy="154" r="4" fill="#d8f88b" />
        <circle cx="291" cy="196" r="3" fill="#aa8bdf" />
        <path
          d="M62 110v-9h9m245 81v9h-9"
          stroke="#a68acb"
          strokeOpacity=".5"
        />
        <text
          x="280"
          y="218"
          fill="#b3a5ce"
          fontFamily="monospace"
          fontSize="7"
          letterSpacing="1.5"
        >
          CAMPUS / 01
        </text>
      </svg>
      <span className="hero-art-badge">
        <span /> WORLD: MIT
      </span>
    </div>
  )
}
