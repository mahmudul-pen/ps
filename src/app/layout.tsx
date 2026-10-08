import type { Metadata, Viewport } from "next";
import { Outfit, Newsreader } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"] });

export const metadata: Metadata = {
  title: "Property Scanner: describe the home, we scan London for it",
  description:
    "AI property search for London buyers. Describe the home in your own words, refine it by chat, see what's known and what's guessed, and send the enquiry.",
};

export const viewport: Viewport = { themeColor: "#0a0a09" };

const CONTRACT = `<!--
THESIS: Feelings in, scan out. A miniature London is scanned live by a yellow beam as you scroll. Refuses the portal hero (search bar over a house photo, filter chips).
OWN-WORLD: Ink black ground, signal yellow (#ffd400) as light and as whole drenched panels. Outfit = the machine (filters, readouts). Newsreader italic = the buyer's own words. Survey-map grid, dashed lines = estimates, solid = facts.
STORY: Buyers see their words become a scan, see why portals fail them, follow Describe > Refine > Decide > Send, learn facts vs guesses, book a demo.
FIRST VIEWPORT: Full-bleed 3D London diorama with sweeping beam; headline bottom-left; live "your words -> read as" console bottom-right; Book a demo in nav and hero.
FORM: Pinned by the approved PROJECT_BRIEF.md ("The Scan"); no seed roll.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${outfit.variable} ${newsreader.variable}`}>
      <body>
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
