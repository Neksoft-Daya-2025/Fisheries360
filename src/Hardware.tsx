import React, { useState } from "react";
import { hardwareParts } from "./content";
export function Device({ id = "device" }: { id?: string }) {
  return (
    <svg
      className="device-svg"
      viewBox="0 0 660 670"
      role="img"
      aria-label="Conceptual CageNode with solar panel, enclosure, antenna, clamp and suspended sensor probe"
    >
      <defs>
        <linearGradient id={`${id}metal`} x2="1" y2=".7">
          <stop stopColor="#eff1ed" />
          <stop offset=".5" stopColor="#bac9cc" />
          <stop offset="1" stopColor="#6d858f" />
        </linearGradient>
        <linearGradient id={`${id}side`}>
          <stop stopColor="#334e5a" />
          <stop offset="1" stopColor="#102e3c" />
        </linearGradient>
        <linearGradient id={`${id}panel`} x2="1" y2="1">
          <stop stopColor="#214b6b" />
          <stop offset="1" stopColor="#061c32" />
        </linearGradient>
        <pattern
          id={`${id}cells`}
          width="41"
          height="28"
          patternUnits="userSpaceOnUse"
        >
          <rect width="41" height="28" fill={`url(#${id}panel)`} />
          <path
            d="M0 0H41V28H0Z M20 0V28"
            fill="none"
            stroke="#8bb5cc"
            strokeWidth=".6"
          />
        </pattern>
        <filter id={`${id}shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="10"
            dy="22"
            stdDeviation="18"
            floodColor="#001019"
            floodOpacity=".5"
          />
        </filter>
      </defs>
      <g filter={`url(#${id}shadow)`}>
        <path d="M65 440L598 381" stroke="#0b2331" strokeWidth="35" />
        <path d="M65 432L598 373" stroke="#58717c" strokeWidth="3" />
        <path
          d="M300 351V439Q300 459 325 458L362 453V367"
          fill="none"
          stroke={`url(#${id}metal)`}
          strokeWidth="17"
        />
        <path
          d="M439 266H486V98"
          fill="none"
          stroke="#081923"
          strokeWidth="12"
          strokeLinejoin="round"
        />
        <path d="M486 95V66" stroke="#a6b4b8" strokeWidth="4" />
        <path d="M481 122H491M481 154H491" stroke="#516b76" strokeWidth="2" />
        <path
          d="M222 203L412 175L452 208V350L262 383L221 347Z"
          fill={`url(#${id}side)`}
        />
        <path
          d="M258 226L452 202V348Q452 359 440 361L270 389Q256 391 256 377V240Q256 228 258 226Z"
          fill={`url(#${id}metal)`}
          stroke="#d7e1df"
          strokeWidth="2"
        />
        <path
          d="M275 243L431 223V342L275 366Z"
          fill="#c6d0cd"
          stroke="#7f959c"
          strokeWidth="1.5"
        />
        {[
          [269, 240],
          [438, 216],
          [269, 375],
          [438, 350],
        ].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx="5" ry="6" fill="#314a53" />
            <path d={`M${x - 2} ${y - 2}l4 4`} stroke="#d1dbd7" />
          </g>
        ))}
        <text
          x="295"
          y="282"
          transform="rotate(-8 295 282)"
          fill="#163b4c"
          fontSize="20"
          fontFamily="Arial"
          fontWeight="700"
        >
          FISHERIES<tspan fill="#007f87">360</tspan>
        </text>
        <text
          x="323"
          y="309"
          transform="rotate(-8 323 309)"
          fill="#304c57"
          fontSize="12"
          letterSpacing="3"
        >
          CAGENODE
        </text>
        <g fill="#25525e">
          <circle cx="303" cy="341" r="3" />
          <circle cx="315" cy="339" r="3" />
          <circle cx="327" cy="337" r="3" />
        </g>
        <circle cx="303" cy="341" r="2" fill="#3bc7b0" />
        <path
          d="M189 178L373 131L461 188L248 234Z"
          fill="#7a929d"
          stroke="#e2e9e7"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="M201 176L372 139L445 186L249 223Z"
          fill={`url(#${id}cells)`}
          stroke="#a5c7d5"
          strokeWidth="2"
        />
        <path d="M251 226L458 189V199L249 240L187 190V179Z" fill="#b6c5c6" />
        <path d="M249 234L458 194" stroke="#edf4ef" strokeWidth="3" />
        <path
          d="M322 381V416M350 376V418M378 372V421"
          stroke="#172c37"
          strokeWidth="12"
        />
        <path
          d="M322 411C302 460 356 444 357 486M350 412C355 458 377 459 357 486M378 415C397 452 365 466 357 486"
          fill="none"
          stroke="#0b1e28"
          strokeWidth="5"
        />
        <rect x="343" y="482" width="28" height="24" rx="6" fill="#172d37" />
        <path
          d="M337 510Q357 497 377 510V594Q357 611 337 594Z"
          fill={`url(#${id}metal)`}
          stroke="#183743"
          strokeWidth="3"
        />
        <ellipse cx="357" cy="511" rx="19" ry="7" fill="#607983" />
        <path d="M342 551H372V588Q357 598 342 588Z" fill="#1b3540" />
        <path
          d="M349 558V582M363 556V581"
          stroke="#68828c"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M338 530H377M337 540H377" stroke="#425f6a" strokeWidth="2" />
      </g>
      <path
        d="M234 626Q358 611 454 623M279 636Q355 627 413 633"
        fill="none"
        stroke="#61a8b5"
        opacity=".35"
      />
    </svg>
  );
}
const positions = [
  { left: "53%", top: "43%" },
  { left: "44%", top: "25%" },
  { left: "74%", top: "20%" },
  { left: "49%", top: "65%" },
  { left: "54%", top: "83%" },
];
export function Hardware({ parts = hardwareParts }: { parts?: string[][] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="hardware-layout">
      <div className="hardware-canvas">
        <div className="drawing-label">
          F360 / FIELD NODE CONCEPT <span>01—05</span>
        </div>
        <Device id="showcase" />
        {parts.map(([name], i) => (
          <button
            key={name}
            className={`hotspot ${active === i ? "selected" : ""}`}
            style={positions[i]}
            aria-label={`Explore ${name}`}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
          >
            {String(i + 1).padStart(2, "0")}
          </button>
        ))}
        <p className="drawing-note">
          Conceptual illustration · Configuration-dependent
        </p>
      </div>
      <div className="hardware-info">
        <p className="eyebrow">SELECT A COMPONENT</p>
        <div className="hardware-select">
          {parts.map(([name], i) => (
            <button
              key={name}
              aria-pressed={active === i}
              onClick={() => setActive(i)}
              className={active === i ? "active" : ""}
            >
              <span>0{i + 1}</span>
              {name}
              <span>↗</span>
            </button>
          ))}
        </div>
        <div aria-live="polite" className="part-description" key={active}>
          <h3>{parts[active][0]}</h3>
          <p>{parts[active][1]}</p>
        </div>
        <noscript>
          <div className="hardware-noscript">
            {parts.map(([name, body]) => (
              <details key={name}>
                <summary>{name}</summary>
                <p>{body}</p>
              </details>
            ))}
          </div>
        </noscript>
        <p className="fine">
          All depicted hardware is proposed. Standard and optional production
          configurations have not been confirmed.
        </p>
      </div>
    </div>
  );
}
