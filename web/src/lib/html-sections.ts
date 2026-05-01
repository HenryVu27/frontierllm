/**
 * html-sections.ts — extract a sub-section from pre-rendered HTML.
 *
 * Pure function: finds the h2 matching headingTitle (case-insensitive),
 * then returns everything between that h2 (exclusive) and the next h2.
 * Returns null if the section is not found.
 *
 * Used by TopicPage to power per-tab section views.
 */

/**
 * Extract the HTML content of a section identified by its h2 heading text.
 *
 * @param html       Full pre-rendered HTML string for a page.
 * @param headingTitle  The h2 text to look for (case-insensitive).
 * @returns The HTML *content* of that section (the paragraph/list nodes between
 *          that h2 and the next h2), or null if not found.
 *          The h2 heading itself is NOT included in the return value.
 */
export function extractSection(html: string, headingTitle: string): string | null {
  // rehype-slug generates ids from the heading text.
  // We match either by id attribute (most reliable) or by heading text content.
  // The rendered format is:
  //   <h2 id="reading-list"><a ...>Reading list<span ...>¶</span></a></h2>

  // Normalize the target for id-based matching (rehype-slug algorithm):
  //   lowercase, replace spaces with hyphens, collapse multiple hyphens, strip non-word chars
  const normalizedId = headingTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Try id-based match first (most reliable)
  const h2Pattern = new RegExp(`<h2[^>]*id="${normalizedId}"[^>]*>`, "i");
  let match = h2Pattern.exec(html);

  // Fall back to text-content match if id doesn't work
  if (!match) {
    // Match h2 whose text content contains the heading title (after stripping tags)
    // Pattern: <h2...>...<a...>HeadingTitle<span...>...</span></a></h2>
    const escapedTitle = headingTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const textPattern = new RegExp(
      `<h2[^>]*>[\\s\\S]*?${escapedTitle}[\\s\\S]*?</h2>`,
      "i"
    );
    match = textPattern.exec(html);
    if (!match) return null;
  }

  const h2Start = match.index;

  // Find the closing </h2>
  const h2End = html.indexOf("</h2>", h2Start);
  if (h2End === -1) return null;

  // Content starts right after the closing </h2>
  const contentStart = h2End + "</h2>".length;

  // Find the next h2 (end of section)
  const nextH2Pattern = /<h2/i;
  const remaining = html.slice(contentStart);
  const nextMatch = nextH2Pattern.exec(remaining);

  const contentEnd = nextMatch ? contentStart + nextMatch.index : html.length;
  const content = html.slice(contentStart, contentEnd).trim();

  return content || null;
}

/**
 * Check if a section's content is just the placeholder text.
 * Returns true when the section is empty/placeholder.
 */
export function isSectionPlaceholder(html: string | null): boolean {
  if (!html) return true;
  // Strip all HTML tags and check if only the placeholder text remains
  const text = html.replace(/<[^>]+>/g, "").trim();
  return text === "Fill in as you go." || text === "*Fill in as you go.*" || text === "";
}
