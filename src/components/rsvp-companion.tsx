'use client';

import { useEffect, useRef } from 'react';
import { getCompanionState } from '../lib/rsvp-companion';

type Props = { attending: boolean | null; guestCount: number; sending: boolean };

export function RsvpCompanion({ attending, guestCount, sending }: Props) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const { mood, caption } = getCompanionState(attending, guestCount, sending);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      scene.style.setProperty('--look-x', '0px');
      scene.style.setProperty('--look-y', '0px');
    };
    const look = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = scene.getBoundingClientRect();
        if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
        scene.style.setProperty('--look-x', `${Math.max(-3, Math.min(3, (event.clientX - bounds.left - bounds.width / 2) / 65))}px`);
        scene.style.setProperty('--look-y', `${Math.max(-2, Math.min(2, (event.clientY - bounds.top - bounds.height / 2) / 85))}px`);
      });
    };
    window.addEventListener('pointermove', look, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', look);
      document.documentElement.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
    };
  }, []);

  return (
    <div className={`rsvp-companion mood-${mood}`} ref={sceneRef}>
      <svg className="rsvp-chibi" viewBox="0 0 160 146" aria-hidden="true" focusable="false">
        <ellipse cx="80" cy="133" rx="60" ry="7" fill="#d7ddca" opacity=".6" />
        <g className="chibi-floats" fill="#c58f87">
          <path d="M78 23 C67 13 73 5 78 11 C83 5 89 13 78 23Z" />
          <path d="M24 62 C15 54 20 48 24 53 C28 48 33 54 24 62Z" />
          <path d="M140 47 C131 39 136 33 140 38 C144 33 149 39 140 47Z" />
        </g>
        <g className="chibi-pair" strokeLinecap="round" strokeLinejoin="round">
          <g className="chibi-groom">
            <path d="M37 93 Q26 104 29 124 Q49 137 72 124 L67 94Z" fill="#315c46" stroke="#254a38" strokeWidth="2" />
            <path d="M44 92 L50 114 L58 93" fill="#fff9e9" />
            <path d="M43 99 L50 102 L57 99 L57 106 L50 103 L43 106Z" fill="#d3b778" />
            <path d="M35 105 L24 115 M63 105 L73 114" stroke="#315c46" strokeWidth="10" />
            <circle cx="24" cy="117" r="5" fill="#f3d4b8" /><circle cx="73" cy="115" r="5" fill="#f3d4b8" />
            <path d="M37 127 L36 133 M62 127 L64 133" stroke="#254a38" strokeWidth="8" />
            <ellipse cx="50" cy="65" rx="28" ry="30" fill="#253c30" />
            <ellipse cx="24" cy="73" rx="5" ry="7" fill="#f3d4b8" /><ellipse cx="76" cy="73" rx="5" ry="7" fill="#f3d4b8" />
            <path d="M25 58 Q24 39 51 40 Q77 42 75 68 L74 78 Q71 97 50 99 Q28 96 26 79Z" fill="#f6ddc5" stroke="#d2ac8c" strokeWidth="1.2" />
            <path d="M23 65 Q19 32 49 33 Q79 31 79 67 L68 57 L67 48 Q51 62 30 53Z" fill="#253c30" />
            <ellipse cx="34" cy="82" rx="7" ry="4" fill="#e9ae9f" opacity=".65" /><ellipse cx="67" cy="82" rx="7" ry="4" fill="#e9ae9f" opacity=".65" />
            <g className="chibi-open-eyes" fill="#293d31"><ellipse cx="39" cy="73" rx="3.5" ry="4.5" /><ellipse cx="62" cy="73" rx="3.5" ry="4.5" /><g className="chibi-eye-glints" fill="#fff"><circle cx="38" cy="71" r="1.2" /><circle cx="61" cy="71" r="1.2" /></g></g>
            <path className="chibi-smile-eyes" d="M35 73 Q39 67 43 73 M58 73 Q62 67 66 73" fill="none" stroke="#293d31" strokeWidth="2.3" />
            <path className="chibi-small-smile" d="M44 85 Q50 91 56 85" fill="none" stroke="#a36958" strokeWidth="1.8" />
            <path className="chibi-big-smile" d="M43 84 Q50 99 58 84Z" fill="#ad6d64" /><path className="chibi-big-smile" d="M45 85 L55 85" stroke="#fff4e6" strokeWidth="2" />
          </g>
          <g className="chibi-bride">
            <path d="M85 61 Q83 30 110 30 Q140 30 139 70 L140 113 L82 112Z" fill="#344536" />
            <path d="M83 59 Q81 38 98 34 L129 36 Q147 47 146 110 Q134 119 125 110 L94 112 L77 105Z" fill="#fffaf0" opacity=".7" stroke="#d9cbae" strokeWidth="1.3" />
            <path d="M96 94 L83 126 Q110 139 139 126 L124 94Z" fill="#fffaf0" stroke="#cbb98e" strokeWidth="1.5" />
            <path d="M98 98 Q110 111 122 98 M92 115 Q110 121 132 114" fill="none" stroke="#e2d3b3" strokeWidth="1.5" />
            <path d="M96 105 L88 114 M125 105 L135 113" stroke="#f3d4b8" strokeWidth="8" />
            <ellipse cx="111" cy="69" rx="25" ry="29" fill="#f6ddc5" stroke="#d2ac8c" strokeWidth="1.2" />
            <path d="M85 67 Q79 32 111 33 Q139 33 137 67 L128 55 Q121 53 115 44 Q104 59 88 58Z" fill="#344536" />
            <path d="M88 49 Q107 33 130 46" fill="none" stroke="#d8bd79" strokeWidth="3" />
            <g fill="#fff8ea" stroke="#d3b778" strokeWidth=".7"><circle cx="95" cy="43" r="4" /><circle cx="103" cy="40" r="4" /><circle cx="112" cy="40" r="4" /><circle cx="121" cy="42" r="4" /></g>
            <ellipse cx="95" cy="82" rx="6" ry="4" fill="#e9ae9f" opacity=".7" /><ellipse cx="128" cy="82" rx="6" ry="4" fill="#e9ae9f" opacity=".7" />
            <g className="chibi-open-eyes" fill="#293d31"><ellipse cx="101" cy="73" rx="3.5" ry="4.5" /><ellipse cx="122" cy="73" rx="3.5" ry="4.5" /><g className="chibi-eye-glints" fill="#fff"><circle cx="100" cy="71" r="1.2" /><circle cx="121" cy="71" r="1.2" /></g></g>
            <path className="chibi-smile-eyes" d="M97 73 Q101 67 105 73 M118 73 Q122 67 126 73" fill="none" stroke="#293d31" strokeWidth="2.3" />
            <path className="chibi-small-smile" d="M106 85 Q111 91 117 85" fill="none" stroke="#a36958" strokeWidth="1.8" />
            <path className="chibi-big-smile" d="M105 84 Q111 98 118 84Z" fill="#ad6d64" /><path className="chibi-big-smile" d="M107 85 L116 85" stroke="#fff4e6" strokeWidth="2" />
            <path d="M101 121 L111 130 L121 121" fill="#8ba27a" />
            <g fill="#d7b5aa" stroke="#b88c80" strokeWidth="1"><circle cx="103" cy="117" r="5" /><circle cx="119" cy="117" r="5" /><circle cx="111" cy="113" r="6" /><circle cx="111" cy="120" r="5" /></g>
          </g>
        </g>
      </svg>
      <p className="rsvp-companion-caption" aria-live="polite">{caption}</p>
    </div>
  );
}
