function generateStarSvg(note, displayName = "Anonyme") {
  if (!Number.isFinite(note) || note < 0 || note > 10) {
    throw new RangeError("Note must be a number between 0 and 10.");
  }

  const starPath =
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
  let starsSvg = "";
  let clipDefs = "";

  for (let index = 0; index < 10; index += 1) {
    const fillAmount = Math.max(0, Math.min(1, note - index));
    const xPosition = 55 + index * 38;

    clipDefs += `<clipPath id="clip-${index}"><rect x="0" y="0" width="${22 * fillAmount}" height="22" /></clipPath>`;
    starsSvg += `
      <g transform="translate(${xPosition}, 30) scale(1.1)">
        <path d="${starPath}" fill="none" stroke="#4b4b5a" stroke-width="1.5" />
        <path d="${starPath}" fill="#f4c45e" clip-path="url(#clip-${index})" />
      </g>`;
  }

  const displayNote = note.toFixed(1).replace(".", ",");
  const safeDisplayName = escapeXmlText(displayName);
  return `
    <svg width="480" height="150" viewBox="0 0 480 150" xmlns="http://www.w3.org/2000/svg">
      <defs>${clipDefs}</defs>
      <rect width="480" height="150" rx="16" fill="#121216" />
      ${starsSvg}
      <text x="240" y="101" text-anchor="middle" fill="#ffffff" font-family="Georgia, serif" font-weight="bold" font-size="38">${displayNote} <tspan fill="#8a8a93" font-size="20">/ 10</tspan></text>
      <text x="240" y="127" text-anchor="middle" fill="#6b6b7b" font-family="sans-serif" font-size="12" letter-spacing="2">SUSU &amp; THE • ${safeDisplayName} REVIEW</text>
    </svg>`;
}

function escapeXmlText(value) {
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  };
  return String(value).replace(/[&<>"']/g, (character) => entities[character]);
}

module.exports = { generateStarSvg };
