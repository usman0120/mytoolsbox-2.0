import { describe, it, expect } from "vitest";

// ─────────────────────────────────────────────────────────────
// 1. Contract Generator
// ─────────────────────────────────────────────────────────────
import {
  fillTemplate, generateContractDocument, CONTRACT_TEMPLATES,
  type ContractClause
} from "../features/tools/contract-generator";

describe("Contract Generator", () => {
  it("correctly replaces template variables with spaces like {Party A} and {Effective Date}", () => {
    const template = "This agreement is between {Party A} and {Party B} effective on {Effective Date}.";
    const data = {
      "Party A": "Acme Corp",
      "Party B": "Beta LLC",
      "Effective Date": "2026-10-01",
    };
    const result = fillTemplate(template, data);
    expect(result).toBe("This agreement is between Acme Corp and Beta LLC effective on 2026-10-01.");
  });

  it("leaves unmatched placeholders untouched", () => {
    const template = "Hello {Unknown Var}!";
    const result = fillTemplate(template, {});
    expect(result).toBe("Hello {Unknown Var}!");
  });

  it("generates a full contract document with all clauses and signature blocks", () => {
    const clauses: ContractClause[] = [
      { id: "1", title: "Scope", content: "Work will be done for {Party B}.", optional: false },
    ];
    const doc = generateContractDocument("Service Agreement", "Alice Inc", "Bob Ltd", "2026-05-15", clauses);
    expect(doc).toContain("# SERVICE AGREEMENT");
    expect(doc).toContain("Alice Inc");
    expect(doc).toContain("Bob Ltd");
    expect(doc).toContain("Work will be done for Bob Ltd.");
    expect(doc).toContain("Signatures");
  });

  it("has valid clauses in pre-defined templates", () => {
    for (const [key, tpl] of Object.entries(CONTRACT_TEMPLATES)) {
      expect(tpl.clauses.length).toBeGreaterThan(0);
      for (const clause of tpl.clauses) {
        expect(clause.title).toBeTruthy();
        expect(clause.content).toBeTruthy();
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────
// 2. Invoice Generator
// ─────────────────────────────────────────────────────────────
import {
  calculateLineTotal, calculateSubtotal, calculateDiscountAmount, calculateTax,
  calculateTotal, formatCurrency, exportInvoiceCSV, type InvoiceData
} from "../features/tools/invoice-generator";

describe("Invoice Generator", () => {
  it("calculates line item total accurately", () => {
    expect(calculateLineTotal({ id: "1", description: "Design", quantity: 5, unitPrice: 50.25 })).toBe(251.25);
  });

  it("calculates subtotal across multiple line items", () => {
    const items = [
      { id: "1", description: "A", quantity: 2, unitPrice: 10 },
      { id: "2", description: "B", quantity: 3, unitPrice: 15 },
    ];
    expect(calculateSubtotal(items)).toBe(65);
  });

  it("calculates percentage and fixed discounts", () => {
    expect(calculateDiscountAmount(200, 10, "percentage")).toBe(20);
    expect(calculateDiscountAmount(200, 25, "fixed")).toBe(25);
    expect(calculateDiscountAmount(200, 300, "fixed")).toBe(200); // capped at subtotal
  });

  it("calculates tax on taxable amount", () => {
    expect(calculateTax(100, 8.5)).toBe(8.5);
    expect(calculateTax(0, 10)).toBe(0);
  });

  it("calculates grand total with discount, tax, and shipping", () => {
    const subtotal = 100;
    const discount = 10;
    const tax = 9;
    const shipping = 15;
    expect(calculateTotal(subtotal, tax, discount, shipping)).toBe(114);
  });

  it("formats currency cleanly", () => {
    const formatted = formatCurrency(1234.5, "USD");
    expect(formatted).toContain("1,234.50");
  });

  it("exports valid CSV string", () => {
    const invoice: InvoiceData = {
      invoiceNumber: "INV-001",
      date: "2026-01-01",
      dueDate: "2026-01-15",
      fromName: "Sender",
      fromEmail: "sender@test.com",
      fromAddress: "123 Main St",
      toName: "Client",
      toEmail: "client@test.com",
      toAddress: "456 Oak Rd",
      lineItems: [{ id: "1", description: "Service", quantity: 1, unitPrice: 100 }],
      taxRate: 10,
      discount: 0,
      notes: "Thanks",
      currency: "USD",
    };
    const csv = exportInvoiceCSV(invoice);
    expect(csv).toContain("INV-001");
    expect(csv).toContain("Grand Total");
  });
});

// ─────────────────────────────────────────────────────────────
// 3. Quotation Generator
// ─────────────────────────────────────────────────────────────
import {
  isQuoteExpired, exportQuotationCSV, type QuotationData
} from "../features/tools/quotation-generator";

describe("Quotation Generator", () => {
  it("determines if quotation is expired based on validUntil date", () => {
    expect(isQuoteExpired("2020-01-01")).toBe(true);
    expect(isQuoteExpired("2099-12-31")).toBe(false);
  });

  it("exports quotation CSV", () => {
    const quote: QuotationData = {
      quoteNumber: "QTE-001",
      date: "2026-02-01",
      validUntil: "2026-03-01",
      fromName: "Vendor",
      fromCompany: "Vendor Co",
      fromEmail: "vendor@test.com",
      toName: "Buyer",
      toCompany: "Buyer Inc",
      toEmail: "buyer@test.com",
      lineItems: [{ id: "1", description: "Consulting", quantity: 10, unitPrice: 120 }],
      taxRate: 5,
      discount: 50,
      notes: "Estimate valid 30 days",
      currency: "USD",
    };
    const csv = exportQuotationCSV(quote);
    expect(csv).toContain("QTE-001");
    expect(csv).toContain("Vendor Co");
  });
});

// ─────────────────────────────────────────────────────────────
// 4. Proposal Generator
// ─────────────────────────────────────────────────────────────
import {
  fillProposalVariables, exportProposalDocument, type ProposalData
} from "../features/tools/proposal-generator";

describe("Proposal Generator", () => {
  it("substitutes proposal variables in section text", () => {
    const data: ProposalData = {
      title: "Cloud Migration",
      clientName: "Jane Doe",
      clientCompany: "FinTech Corp",
      date: "2026-04-10",
      preparedBy: "Alex Smith",
      companyName: "CloudWorks",
      budget: "$50,000",
      timeline: "8 weeks",
      sections: [],
    };
    const raw = "We propose an engagement for {clientCompany} lasting {timeline} with total fee of {budget}.";
    const result = fillProposalVariables(raw, data);
    expect(result).toBe("We propose an engagement for FinTech Corp lasting 8 weeks with total fee of $50,000.");
  });

  it("exports proposal markdown document", () => {
    const data: ProposalData = {
      title: "Marketing Campaign",
      clientName: "Acme",
      clientCompany: "Acme Inc",
      date: "2026-05-01",
      preparedBy: "Strategist",
      companyName: "Growth Agency",
      sections: [{ id: "1", title: "Strategy", content: "Growth plan for {clientCompany}." }],
    };
    const doc = exportProposalDocument(data);
    expect(doc).toContain("# MARKETING CAMPAIGN");
    expect(doc).toContain("Growth plan for Acme Inc.");
  });
});

// ─────────────────────────────────────────────────────────────
// 5. Study Timer
// ─────────────────────────────────────────────────────────────
import {
  getStreak, getSubjectTotals, getProgressPercent, type StudySession
} from "../features/tools/study-timer";

describe("Study Timer", () => {
  it("computes active study streak correctly", () => {
    const today = new Date().toISOString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString();

    const sessions: StudySession[] = [
      { id: "1", subject: "Math", duration: 60, date: today, completed: true },
      { id: "2", subject: "History", duration: 45, date: yesterday, completed: true },
    ];
    expect(getStreak(sessions)).toBe(2);
  });

  it("returns 0 streak if last study session was days ago", () => {
    const pastDate = new Date("2020-01-01").toISOString();
    const sessions: StudySession[] = [
      { id: "1", subject: "Physics", duration: 30, date: pastDate, completed: true },
    ];
    expect(getStreak(sessions)).toBe(0);
  });

  it("aggregates study time by subject", () => {
    const sessions: StudySession[] = [
      { id: "1", subject: "Math", duration: 45, date: new Date().toISOString(), completed: true },
      { id: "2", subject: "Science", duration: 30, date: new Date().toISOString(), completed: true },
      { id: "3", subject: "Math", duration: 60, date: new Date().toISOString(), completed: true },
    ];
    const totals = getSubjectTotals(sessions);
    expect(totals["Math"]).toBe(105);
    expect(totals["Science"]).toBe(30);
  });

  it("calculates progress percentage capped at 100", () => {
    expect(getProgressPercent(30, 60)).toBe(50);
    expect(getProgressPercent(80, 60)).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────
// 6. Kanban Board
// ─────────────────────────────────────────────────────────────
import {
  moveCard, isWipLimitExceeded, filterCards, exportBoardToCSV,
  type KanbanBoard, type KanbanCard
} from "../features/tools/kanban-board";

describe("Kanban Board", () => {
  const sampleCard: KanbanCard = {
    id: "c1",
    title: "Setup CI/CD",
    description: "Configure GitHub actions",
    priority: "high",
    labels: ["devops", "urgent"],
    createdAt: Date.now(),
  };

  const initialBoard: KanbanBoard = {
    columns: [
      { id: "todo", title: "To Do", cards: [sampleCard], wipLimit: 2 },
      { id: "in-progress", title: "In Progress", cards: [], wipLimit: 1 },
      { id: "done", title: "Done", cards: [] },
    ],
  };

  it("moves a card from one column to another", () => {
    const updated = moveCard(initialBoard, "c1", "todo", "in-progress");
    expect(updated.columns.find((c) => c.id === "todo")?.cards).toHaveLength(0);
    expect(updated.columns.find((c) => c.id === "in-progress")?.cards).toHaveLength(1);
  });

  it("detects WIP limit exceeded condition", () => {
    const colWithLimit = { id: "wip", title: "WIP", wipLimit: 1, cards: [sampleCard, { ...sampleCard, id: "c2" }] };
    expect(isWipLimitExceeded(colWithLimit)).toBe(true);

    const normalCol = { id: "ok", title: "OK", wipLimit: 5, cards: [sampleCard] };
    expect(isWipLimitExceeded(normalCol)).toBe(false);
  });

  it("filters cards by query and priority", () => {
    const cards = [
      sampleCard,
      { id: "c2", title: "Write tests", description: "Vitest coverage", priority: "low" as const, createdAt: Date.now() },
    ];
    const filtered = filterCards(cards, "tests", "low");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("Write tests");
  });

  it("exports board to CSV", () => {
    const csv = exportBoardToCSV(initialBoard);
    expect(csv).toContain("Setup CI/CD");
    expect(csv).toContain("To Do");
  });
});

// ─────────────────────────────────────────────────────────────
// 7. Pomodoro Timer
// ─────────────────────────────────────────────────────────────
import {
  getNextState, getTodayFocusMinutes, DEFAULT_POMODORO_SETTINGS,
  type PomodoroSessionRecord
} from "../features/tools/pomodoro-timer";

describe("Pomodoro Timer", () => {
  it("transitions from working to short-break normally", () => {
    const { nextState, nextDurationSeconds } = getNextState("working", 0, DEFAULT_POMODORO_SETTINGS);
    expect(nextState).toBe("short-break");
    expect(nextDurationSeconds).toBe(5 * 60);
  });

  it("transitions to long-break after designated session threshold (4th session)", () => {
    const { nextState, nextDurationSeconds } = getNextState("working", 3, DEFAULT_POMODORO_SETTINGS);
    expect(nextState).toBe("long-break");
    expect(nextDurationSeconds).toBe(15 * 60);
  });

  it("transitions from break back to working", () => {
    const { nextState, nextDurationSeconds } = getNextState("short-break", 1, DEFAULT_POMODORO_SETTINGS);
    expect(nextState).toBe("working");
    expect(nextDurationSeconds).toBe(25 * 60);
  });

  it("calculates today focus minutes", () => {
    const today = new Date().toISOString();
    const sessions: PomodoroSessionRecord[] = [
      { id: "1", type: "work", durationMinutes: 25, completedAt: today },
      { id: "2", type: "break", durationMinutes: 5, completedAt: today },
      { id: "3", type: "work", durationMinutes: 50, completedAt: today },
    ];
    expect(getTodayFocusMinutes(sessions)).toBe(75);
  });
});

// ─────────────────────────────────────────────────────────────
// 8. Notes App
// ─────────────────────────────────────────────────────────────
import {
  calculateNoteStats, filterAndSortNotes, extractAllTags, type Note
} from "../features/tools/notes-app";

describe("Notes App", () => {
  it("calculates note metrics accurately", () => {
    const text = "First line with some words.\nSecond line here.";
    const stats = calculateNoteStats(text);
    expect(stats.lineCount).toBe(2);
    expect(stats.wordCount).toBe(8);
    expect(stats.readingTimeMinutes).toBeGreaterThanOrEqual(1);
  });

  it("sorts pinned notes to the top regardless of date", () => {
    const notes: Note[] = [
      { id: "1", title: "Unpinned New", content: "", tags: [], pinned: false, createdAt: 100, updatedAt: 200 },
      { id: "2", title: "Pinned Old", content: "", tags: [], pinned: true, createdAt: 10, updatedAt: 20 },
    ];
    const sorted = filterAndSortNotes(notes, "");
    expect(sorted[0].id).toBe("2");
  });

  it("extracts unique tags across all notes", () => {
    const notes: Note[] = [
      { id: "1", title: "A", content: "", tags: ["work", "ideas"], createdAt: 1, updatedAt: 1 },
      { id: "2", title: "B", content: "", tags: ["work", "personal"], createdAt: 2, updatedAt: 2 },
    ];
    const tags = extractAllTags(notes);
    expect(tags).toEqual(["ideas", "personal", "work"]);
  });
});

// ─────────────────────────────────────────────────────────────
// 9. Stopwatch
// ─────────────────────────────────────────────────────────────
import {
  formatStopwatchTime, analyzeLaps, exportLapsCSV
} from "../features/tools/stopwatch";

describe("Stopwatch", () => {
  it("formats milliseconds into MM:SS.hundredths", () => {
    expect(formatStopwatchTime(65430)).toBe("01:05.43");
  });

  it("formats hours into HH:MM:SS.hundredths when ms > 1 hour", () => {
    expect(formatStopwatchTime(3665000)).toBe("01:01:05.00");
  });

  it("analyzes laps to find fastest, slowest, and lap delta", () => {
    const rawLaps = [10000, 25000, 35000]; // split times: lap 1 = 10s, lap 2 = 15s, lap 3 = 10s
    const laps = analyzeLaps(rawLaps);
    expect(laps).toHaveLength(3);
    expect(laps[1].lapTimeMs).toBe(15000);
    expect(laps[1].isSlowest).toBe(true);
  });

  it("exports laps to CSV", () => {
    const laps = analyzeLaps([10000, 22000]);
    const csv = exportLapsCSV(laps);
    expect(csv).toContain("Lap #");
    expect(csv).toContain("00:10.00");
  });
});

// ─────────────────────────────────────────────────────────────
// 10. Online Notepad
// ─────────────────────────────────────────────────────────────
import {
  computeTextStatistics, transformCase, sortLines, removeDuplicateLines, findAndReplace
} from "../features/tools/online-notepad";

describe("Online Notepad", () => {
  it("computes comprehensive text statistics", () => {
    const sample = "Hello World!\nHow are you today? Great.";
    const stats = computeTextStatistics(sample);
    expect(stats.words).toBe(7);
    expect(stats.sentences).toBe(3);
    expect(stats.paragraphs).toBe(2);
  });

  it("transforms case between titlecase, uppercase, lowercase, sentencecase", () => {
    expect(transformCase("hello world", "titlecase")).toBe("Hello World");
    expect(transformCase("hello world", "uppercase")).toBe("HELLO WORLD");
    expect(transformCase("HELLO WORLD", "lowercase")).toBe("hello world");
    expect(transformCase("hello world. good morning.", "sentencecase")).toBe("Hello world. Good morning.");
  });

  it("sorts lines alphabetically asc and desc", () => {
    const text = "Banana\nApple\nCherry";
    expect(sortLines(text, "asc")).toBe("Apple\nBanana\nCherry");
    expect(sortLines(text, "desc")).toBe("Cherry\nBanana\nApple");
  });

  it("removes duplicate lines", () => {
    const text = "A\nB\nA\nC\nB";
    expect(removeDuplicateLines(text)).toBe("A\nB\nC");
  });

  it("finds and replaces with and without regex", () => {
    const text = "The quick brown fox jumps over the lazy dog";
    expect(findAndReplace(text, "fox", "cat")).toBe("The quick brown cat jumps over the lazy dog");
    expect(findAndReplace(text, "THE", "A", { caseSensitive: false })).toBe("A quick brown fox jumps over A lazy dog");
  });
});

// ─────────────────────────────────────────────────────────────
// 11. Todo List
// ─────────────────────────────────────────────────────────────
import {
  isTodoOverdue, getTodoMetrics, filterAndSortTodos, type TodoItem
} from "../features/tools/todo-list";

describe("Todo List", () => {
  const todos: TodoItem[] = [
    { id: "1", text: "Buy groceries", completed: false, priority: "high", dueDate: "2020-01-01", createdAt: 100 },
    { id: "2", text: "Read book", completed: true, priority: "low", createdAt: 200 },
    { id: "3", text: "Submit report", completed: false, priority: "medium", dueDate: "2099-01-01", createdAt: 300 },
  ];

  it("identifies overdue incomplete tasks", () => {
    expect(isTodoOverdue(todos[0])).toBe(true);
    expect(isTodoOverdue(todos[1])).toBe(false); // completed
    expect(isTodoOverdue(todos[2])).toBe(false); // future
  });

  it("computes completion and overdue metrics", () => {
    const metrics = getTodoMetrics(todos);
    expect(metrics.total).toBe(3);
    expect(metrics.completed).toBe(1);
    expect(metrics.overdue).toBe(1);
    expect(metrics.percent).toBe(33);
  });

  it("filters and sorts tasks by priority", () => {
    const sorted = filterAndSortTodos(todos, "all", "all", "priority");
    expect(sorted[0].priority).toBe("high");
    expect(sorted[2].priority).toBe("low");
  });
});

// ─────────────────────────────────────────────────────────────
// 12. Habit Tracker
// ─────────────────────────────────────────────────────────────
import {
  calculateHabitStreak, getDaysOfWeek, type HabitEntry
} from "../features/tools/habit-tracker";

describe("Habit Tracker", () => {
  it("calculates active streak when completed yesterday and today", () => {
    const today = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split("T")[0];

    const entries: HabitEntry[] = [
      { habitId: "h1", date: today, done: true },
      { habitId: "h1", date: yesterday, done: true },
    ];
    const { currentStreak, longestStreak } = calculateHabitStreak("h1", entries);
    expect(currentStreak).toBe(2);
    expect(longestStreak).toBe(2);
  });

  it("generates 7 days of the week starting from Monday", () => {
    const days = getDaysOfWeek(new Date());
    expect(days).toHaveLength(7);
    expect(days[0].name).toBe("Mon");
    expect(days[6].name).toBe("Sun");
  });
});

// ─────────────────────────────────────────────────────────────
// 13. File Organizer
// ─────────────────────────────────────────────────────────────
import {
  classifyFile, formatFileSize, generateNewFilename
} from "../features/tools/file-organizer";

describe("File Organizer", () => {
  it("classifies file extensions into appropriate media/doc categories", () => {
    expect(classifyFile("photo.png")).toBe("images");
    expect(classifyFile("report.pdf")).toBe("documents");
    expect(classifyFile("song.mp3")).toBe("audio");
    expect(classifyFile("video.mp4")).toBe("video");
    expect(classifyFile("data.zip")).toBe("archives");
    expect(classifyFile("script.py")).toBe("code");
    expect(classifyFile("unknown.xyz123")).toBe("other");
  });

  it("formats file sizes cleanly", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1024 * 1024 * 5.5)).toBe("5.5 MB");
  });

  it("generates batch renamed filename with patterns", () => {
    const result = generateNewFilename("my_vacation_photo.JPG", 0, {
      pattern: "trip_{nnn}",
      caseTransform: "lowercase",
    });
    expect(result).toBe("trip_001.jpg");
  });
});

// ─────────────────────────────────────────────────────────────
// 14. Daily Planner
// ─────────────────────────────────────────────────────────────
import {
  calculateProductivityScore, exportPlanMarkdown, type DayPlan
} from "../features/tools/daily-planner";

describe("Daily Planner", () => {
  it("calculates productivity score based on completed slots and priorities", () => {
    const plan: DayPlan = {
      date: "2026-06-15",
      focusGoal: "Finish MVP",
      gratitude: "Good health",
      priorities: [
        { id: "p1", text: "Launch feature", completed: true },
        { id: "p2", text: "Write docs", completed: false },
      ],
      slots: [
        { id: "s1", startTime: "09:00", endTime: "11:00", activity: "Code", completed: true },
        { id: "s2", startTime: "11:00", endTime: "12:00", activity: "Review", completed: true },
      ],
      notes: "Great day",
    };
    const { score, completedSlots, completedPriorities } = calculateProductivityScore(plan);
    expect(completedSlots).toBe(2);
    expect(completedPriorities).toBe(1);
    expect(score).toBe(75); // 50 (slots) + 25 (priorities)
  });

  it("exports day plan to markdown", () => {
    const plan: DayPlan = {
      date: "2026-06-15",
      focusGoal: "Focus",
      gratitude: "",
      priorities: [{ id: "p1", text: "Task 1", completed: true }],
      slots: [{ id: "s1", startTime: "08:00", endTime: "09:00", activity: "Routine", completed: true }],
      notes: "",
    };
    const md = exportPlanMarkdown(plan);
    expect(md).toContain("# Daily Plan: 2026-06-15");
    expect(md).toContain("- [x] Task 1");
  });
});

// ─────────────────────────────────────────────────────────────
// 15. Countdown Timer
// ─────────────────────────────────────────────────────────────
import {
  calculateTimeLeft, getUpcomingPresetEvents
} from "../features/tools/countdown-timer";

describe("Countdown Timer", () => {
  it("calculates days, hours, minutes, and seconds difference accurately", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const target = new Date("2026-01-03T02:30:15Z");
    const diff = calculateTimeLeft(target, now);
    expect(diff.days).toBe(2);
    expect(diff.hours).toBe(2);
    expect(diff.minutes).toBe(30);
    expect(diff.seconds).toBe(15);
    expect(diff.isExpired).toBe(false);
  });

  it("marks as expired when target is in the past", () => {
    const now = new Date("2026-01-05T00:00:00Z");
    const target = new Date("2026-01-01T00:00:00Z");
    const diff = calculateTimeLeft(target, now);
    expect(diff.isExpired).toBe(true);
    expect(diff.days).toBe(0);
  });

  it("returns upcoming holiday presets in future order", () => {
    const presets = getUpcomingPresetEvents();
    expect(presets.length).toBeGreaterThan(0);
    const firstDate = new Date(presets[0].date);
    expect(firstDate.getTime()).toBeGreaterThanOrEqual(Date.now() - 10000);
  });
});

// ─────────────────────────────────────────────────────────────
// 16. Barcode Scanner
// ─────────────────────────────────────────────────────────────
import {
  validateEAN13, validateUPCA, parseQRData, parseBarcode
} from "../features/tools/barcode-scanner";

describe("Barcode Scanner", () => {
  it("validates authentic EAN-13 barcodes with checksum algorithm", () => {
    // Valid standard test EAN-13: 4006381333931
    expect(validateEAN13("4006381333931")).toBe(true);
    // Invalid checksum digit (changed last digit from 1 to 2)
    expect(validateEAN13("4006381333932")).toBe(false);
  });

  it("validates authentic UPC-A barcodes with checksum algorithm", () => {
    // Valid standard UPC-A: 036000291452
    expect(validateUPCA("036000291452")).toBe(true);
    // Invalid UPC-A
    expect(validateUPCA("036000291459")).toBe(false);
  });

  it("parses WiFi credentials from QR WiFi URI string", () => {
    const wifiString = "WIFI:S:HomeNet;T:WPA;P:SecretPassword123;;";
    const parsed = parseQRData(wifiString);
    expect(parsed.type).toBe("wifi");
    expect(parsed.metadata?.ssid).toBe("HomeNet");
    expect(parsed.metadata?.password).toBe("SecretPassword123");
  });

  it("parses URL, email, and telephone formats", () => {
    expect(parseQRData("https://mytoolsbox.me").type).toBe("url");
    expect(parseQRData("mailto:support@mytoolsbox.me").type).toBe("email");
    expect(parseQRData("tel:+1234567890").type).toBe("phone");
    expect(parseQRData("987654321").type).toBe("number");
  });

  it("parses scanned barcode and computes checksum validity", () => {
    const res = parseBarcode("4006381333931", "EAN_13");
    expect(res.isValidChecksum).toBe(true);
    expect(res.dataType).toBe("number");
  });
});
