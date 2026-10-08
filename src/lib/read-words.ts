// ponytail: keyword matching only, enough to demo the idea; the product's real reader replaces this.
const NUMS: Record<string, string> = { one: "1", two: "2", three: "3", four: "4", five: "5" };
const FEEL: [RegExp, string, boolean][] = [
  [/garden/, "Garden", false], [/balcon/, "Balcony", false], [/park|leafy|green/, "Park ≤ 5 min", false],
  [/school|primary/, "Good primary nearby", false], [/station|tube|overground/, "Near a station", false],
  [/office|study|desk/, "Room for a desk", false], [/parking|\bcar\b/, "Parking", false], [/\bpets?\b|dog|cat/, "Pet-friendly", true],
  [/quiet|peaceful|calm/, "Low-traffic street", true], [/light|bright|sunny/, "Good natural light", true],
  [/friendly|community|safe/, "Friendly street feel", true],
];
export function readWords(text: string) {
  const s = text.toLowerCase();
  const chips: { label: string; guess: boolean }[] = [];
  const add = (label: string, guess = false) => { if (!chips.some((c) => c.label === label)) chips.push({ label, guess }); };
  const bed = s.match(/(\d|one|two|three|four|five)[\s-]*bed/);
  if (bed) add(`${NUMS[bed[1]] ?? bed[1]} bed`);
  else if (s.includes("studio")) add("Studio");
  if (/\b(flat|apartment)\b/.test(s)) add("Flat");
  else if (/\b(house|terrace|semi|detached)\b/.test(s)) add("House");
  const price = s.match(/£\s?(\d+(?:[.,]\d+)?)\s*(k|m|million)?/);
  if (price) {
    let v = parseFloat(price[1].replace(",", ""));
    if (price[2] === "k") v *= 1e3; else if (price[2]) v *= 1e6; else if (v < 10) v *= 1e6; else if (v < 5000) v *= 1e3;
    add(v >= 1e6 ? `≤ £${+(v / 1e6).toFixed(2)}m` : `≤ £${Math.round(v / 1e3)}k`);
  }
  const commute = s.match(/(\d+)\s*min(?:ute)?s?(?:'s)?\s*(?:walk\s*)?(?:door to door\s*)?(?:to|from)\s+([a-z' ]+?)(?=[.,;]|$|\s+and\b|\s+under\b)/);
  if (commute) add(`≤ ${commute[1]} min to ${commute[2].trim().replace(/(^|\s)\w/g, (c) => c.toUpperCase())}`);
  FEEL.forEach(([re, label, guess]) => { if (re.test(s)) add(label, guess); });
  return chips;
}
