// Citation Generator Core Engine
// Supports APA 7th, MLA 9th, Chicago 17th, Harvard, IEEE, and BibTeX

export type CitationStyle = "apa" | "mla" | "chicago" | "harvard" | "ieee" | "bibtex";
export type SourceType = "book" | "journal" | "website" | "conference" | "chapter" | "newspaper";

export interface CitationItem {
  id: string;
  sourceType: SourceType;
  authors: Array<{ firstName?: string; lastName: string }>;
  title: string;
  containerTitle?: string; // Journal, Book Title, Website Name, Conference
  year?: string;
  month?: string;
  day?: string;
  publisher?: string;
  publisherPlace?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  accessedDate?: string;
  edition?: string;
}

/**
 * Format authors based on citation style guidelines
 */
export function formatAuthors(
  authors: Array<{ firstName?: string; lastName: string }>,
  style: CitationStyle
): string {
  if (!authors || authors.length === 0) return "";

  const clean = authors.filter((a) => a.lastName.trim().length > 0);
  if (clean.length === 0) return "";

  const getInitials = (first?: string) => {
    if (!first) return "";
    return first
      .trim()
      .split(/\s+/)
      .map((part) => `${part[0].toUpperCase()}.`)
      .join(" ");
  };

  switch (style) {
    case "apa": {
      // APA 7: Last, F. M., & Last, F. M. (up to 20 authors)
      const formatted = clean.map((a) => {
        const initials = getInitials(a.firstName);
        return initials ? `${a.lastName}, ${initials}` : a.lastName;
      });
      if (formatted.length === 1) return formatted[0];
      if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`;
      return `${formatted.slice(0, -1).join(", ")}, & ${formatted[formatted.length - 1]}`;
    }

    case "mla": {
      // MLA 9: First author: Last, First. Second author: First Last. 3+: et al.
      if (clean.length === 1) {
        return clean[0].firstName ? `${clean[0].lastName}, ${clean[0].firstName}` : clean[0].lastName;
      }
      if (clean.length === 2) {
        const a1 = clean[0].firstName ? `${clean[0].lastName}, ${clean[0].firstName}` : clean[0].lastName;
        const a2 = clean[1].firstName ? `${clean[1].firstName} ${clean[1].lastName}` : clean[1].lastName;
        return `${a1}, and ${a2}`;
      }
      const a1 = clean[0].firstName ? `${clean[0].lastName}, ${clean[0].firstName}` : clean[0].lastName;
      return `${a1}, et al.`;
    }

    case "chicago": {
      // Chicago 17: Last, First, and First Last.
      if (clean.length === 1) {
        return clean[0].firstName ? `${clean[0].lastName}, ${clean[0].firstName}` : clean[0].lastName;
      }
      if (clean.length === 2) {
        const a1 = clean[0].firstName ? `${clean[0].lastName}, ${clean[0].firstName}` : clean[0].lastName;
        const a2 = clean[1].firstName ? `${clean[1].firstName} ${clean[1].lastName}` : clean[1].lastName;
        return `${a1}, and ${a2}`;
      }
      const a1 = clean[0].firstName ? `${clean[0].lastName}, ${clean[0].firstName}` : clean[0].lastName;
      return `${a1} et al.`;
    }

    case "harvard": {
      // Harvard: Last, F. and Last, F.
      const formatted = clean.map((a) => {
        const initials = getInitials(a.firstName);
        return initials ? `${a.lastName}, ${initials}` : a.lastName;
      });
      if (formatted.length === 1) return formatted[0];
      if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
      return `${formatted.slice(0, -1).join(", ")} and ${formatted[formatted.length - 1]}`;
    }

    case "ieee": {
      // IEEE: F. M. Last and F. M. Last
      const formatted = clean.map((a) => {
        const initials = getInitials(a.firstName);
        return initials ? `${initials} ${a.lastName}` : a.lastName;
      });
      if (formatted.length === 1) return formatted[0];
      if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
      return `${formatted.slice(0, -1).join(", ")}, and ${formatted[formatted.length - 1]}`;
    }

    case "bibtex": {
      return clean
        .map((a) => (a.firstName ? `${a.lastName}, ${a.firstName}` : a.lastName))
        .join(" and ");
    }
  }
}

/**
 * Format a bibliographic entry
 */
export function formatBibliography(item: CitationItem, style: CitationStyle): string {
  const authorStr = formatAuthors(item.authors, style);
  const title = item.title.trim();
  const year = item.year ? item.year.trim() : "n.d.";
  const container = item.containerTitle?.trim();
  const doiStr = item.doi ? (item.doi.startsWith("http") ? item.doi : `https://doi.org/${item.doi}`) : "";

  switch (style) {
    case "apa": {
      // APA 7th Edition
      let result = authorStr ? `${authorStr} ` : "";
      result += `(${year}). `;

      if (item.sourceType === "journal" || item.sourceType === "newspaper") {
        result += `${title}. `;
        if (container) {
          result += `*${container}*`;
          if (item.volume) result += `, *${item.volume}*`;
          if (item.issue) result += `(${item.issue})`;
          if (item.pages) result += `, ${item.pages}`;
          result += ". ";
        }
      } else if (item.sourceType === "book") {
        result += `*${title}*`;
        if (item.edition) result += ` (${item.edition} ed.)`;
        result += ". ";
        if (item.publisher) result += `${item.publisher}. `;
      } else if (item.sourceType === "website") {
        result += `*${title}*. `;
        if (container) result += `${container}. `;
      } else {
        result += `${title}. `;
        if (container) result += `*${container}*. `;
        if (item.publisher) result += `${item.publisher}. `;
      }

      if (doiStr) {
        result += doiStr;
      } else if (item.url) {
        result += item.url;
      }

      return result.trim();
    }

    case "mla": {
      // MLA 9th Edition
      let result = authorStr ? `${authorStr}. ` : "";
      if (item.sourceType === "book") {
        result += `*${title}*. `;
        if (item.publisher) result += `${item.publisher}, `;
        result += `${year}.`;
      } else {
        result += `"${title}." `;
        if (container) result += `*${container}*, `;
        if (item.volume) result += `vol. ${item.volume}, `;
        if (item.issue) result += `no. ${item.issue}, `;
        if (item.publisher && item.sourceType !== "journal") result += `${item.publisher}, `;
        result += `${year}`;
        if (item.pages) result += `, pp. ${item.pages}`;
        result += ".";
      }

      if (doiStr) {
        result += ` ${doiStr}.`;
      } else if (item.url) {
        result += ` ${item.url}.`;
      }

      if (item.accessedDate && (item.sourceType === "website" || !item.year)) {
        result += ` Accessed ${item.accessedDate}.`;
      }

      return result.trim();
    }

    case "chicago": {
      // Chicago 17th (Notes & Bibliography)
      let result = authorStr ? `${authorStr}. ` : "";
      if (item.sourceType === "book") {
        result += `*${title}*. `;
        if (item.publisherPlace) result += `${item.publisherPlace}: `;
        if (item.publisher) result += `${item.publisher}, `;
        result += `${year}.`;
      } else if (item.sourceType === "journal") {
        result += `"${title}." `;
        if (container) result += `*${container}* `;
        if (item.volume) result += `${item.volume}`;
        if (item.issue) result += `, no. ${item.issue}`;
        result += ` (${year})`;
        if (item.pages) result += `: ${item.pages}`;
        result += ".";
      } else {
        result += `"${title}." `;
        if (container) result += `*${container}*. `;
        if (item.publisher) result += `${item.publisher}, `;
        result += `${year}.`;
      }

      if (doiStr) {
        result += ` ${doiStr}.`;
      } else if (item.url) {
        result += ` ${item.url}.`;
      }

      return result.trim();
    }

    case "harvard": {
      // Harvard Style
      let result = authorStr ? `${authorStr} ` : "";
      result += `(${year}) `;
      if (item.sourceType === "journal" || item.sourceType === "newspaper") {
        result += `'${title}', *${container || "Journal"}*`;
        if (item.volume) result += `, ${item.volume}`;
        if (item.issue) result += `(${item.issue})`;
        if (item.pages) result += `, pp. ${item.pages}`;
        result += ".";
      } else if (item.sourceType === "book") {
        result += `*${title}*. `;
        if (item.publisherPlace) result += `${item.publisherPlace}: `;
        if (item.publisher) result += `${item.publisher}.`;
      } else {
        result += `'${title}'. `;
        if (container) result += `*${container}*. `;
      }

      if (doiStr) result += ` Available at: ${doiStr}.`;
      else if (item.url) result += ` Available at: ${item.url}.`;

      return result.trim();
    }

    case "ieee": {
      // IEEE Style
      let result = authorStr ? `${authorStr}, ` : "";
      if (item.sourceType === "journal") {
        result += `"${title}," *${container || "Journal"}*, `;
        if (item.volume) result += `vol. ${item.volume}, `;
        if (item.issue) result += `no. ${item.issue}, `;
        if (item.pages) result += `pp. ${item.pages}, `;
        result += `${year}.`;
      } else if (item.sourceType === "book") {
        result += `*${title}*. `;
        if (item.publisherPlace) result += `${item.publisherPlace}: `;
        if (item.publisher) result += `${item.publisher}, `;
        result += `${year}.`;
      } else {
        result += `"${title}," `;
        if (container) result += `*${container}*, `;
        result += `${year}.`;
      }

      if (doiStr) result += ` doi: ${doiStr}.`;
      else if (item.url) result += ` [Online]. Available: ${item.url}.`;

      return result.trim();
    }

    case "bibtex": {
      const citeKey = generateBibTeXKey(item);
      const entryType =
        item.sourceType === "book"
          ? "book"
          : item.sourceType === "journal"
          ? "article"
          : item.sourceType === "conference"
          ? "inproceedings"
          : "misc";

      const fields: string[] = [];
      if (authorStr) fields.push(`  author = {${authorStr}}`);
      if (title) fields.push(`  title = {${title}}`);
      if (container) {
        if (entryType === "article") fields.push(`  journal = {${container}}`);
        else if (entryType === "inproceedings") fields.push(`  booktitle = {${container}}`);
        else fields.push(`  howpublished = {${container}}`);
      }
      if (item.year) fields.push(`  year = {${item.year}}`);
      if (item.volume) fields.push(`  volume = {${item.volume}}`);
      if (item.issue) fields.push(`  number = {${item.issue}}`);
      if (item.pages) fields.push(`  pages = {${item.pages}}`);
      if (item.publisher) fields.push(`  publisher = {${item.publisher}}`);
      if (item.doi) fields.push(`  doi = {${item.doi}}`);
      if (item.url) fields.push(`  url = {${item.url}}`);

      return `@${entryType}{${citeKey},\n${fields.join(",\n")}\n}`;
    }
  }
}

/**
 * Generate parenthetical / narrative in-text citation
 */
export function formatInTextCitation(
  item: CitationItem,
  style: CitationStyle,
  type: "parenthetical" | "narrative" = "parenthetical"
): string {
  const clean = item.authors.filter((a) => a.lastName.trim().length > 0);
  const year = item.year || "n.d.";

  let authorLabel = "Unknown";
  if (clean.length === 1) {
    authorLabel = clean[0].lastName;
  } else if (clean.length === 2) {
    authorLabel = style === "apa" || style === "harvard"
      ? `${clean[0].lastName} & ${clean[1].lastName}`
      : `${clean[0].lastName} and ${clean[1].lastName}`;
  } else if (clean.length > 2) {
    authorLabel = `${clean[0].lastName} et al.`;
  }

  if (style === "ieee") {
    return "[1]";
  }

  if (style === "mla") {
    // MLA does not include year in parenthetical: (Author Page)
    const pageStr = item.pages ? ` ${item.pages.split("-")[0]}` : "";
    return type === "parenthetical" ? `(${authorLabel}${pageStr})` : `${authorLabel} (${pageStr.trim() || "n.p."})`;
  }

  if (type === "parenthetical") {
    return `(${authorLabel}, ${year})`;
  }
  return `${authorLabel} (${year})`;
}

function generateBibTeXKey(item: CitationItem): string {
  const authorPart = item.authors[0]?.lastName.replace(/[^a-zA-Z]/g, "").toLowerCase() || "anon";
  const yearPart = item.year || "nodate";
  const titlePart = item.title
    .split(/\s+/)
    .find((w) => w.length > 3)
    ?.replace(/[^a-zA-Z]/g, "")
    .toLowerCase() || "item";
  return `${authorPart}${yearPart}${titlePart}`;
}

/**
 * Parses raw author strings like "John Doe and Jane Smith" or "Doe, J., Smith, J."
 */
export function parseAuthorsString(str: string): Array<{ firstName?: string; lastName: string }> {
  if (!str.trim()) return [];
  const parts = str.split(/\s*(?:and|;|&)\s*/i);

  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (part.includes(",")) {
        const [last, first] = part.split(",");
        return { lastName: last.trim(), firstName: first?.trim() };
      }
      const tokens = part.split(/\s+/);
      if (tokens.length === 1) return { lastName: tokens[0] };
      return {
        lastName: tokens[tokens.length - 1],
        firstName: tokens.slice(0, -1).join(" "),
      };
    });
}
