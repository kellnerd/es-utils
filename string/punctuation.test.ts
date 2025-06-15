import { assertEquals } from "@std/assert/equals";
import { assertNotEquals } from "@std/assert/not-equals";
import { describe, it } from "@std/testing/bdd";
import { guessUnicodePunctuation } from "./punctuation.js";

type TestCase = [
  input: string,
  expectedOutput: string,
  description?: string,
];

const quoteTests: TestCase[] = [
  ["Are 'Friends' Electric?", "Are ‘Friends’ Electric?"],
  [
    'Axel F (from "Beverly Hills Cop" soundtrack)',
    "Axel F (from “Beverly Hills Cop” soundtrack)",
  ],
  ['"Hasta La Vista, Baby"', "“Hasta La Vista, Baby”", "whole text in quotes"],
  [
    "One of These Days ('French Windows')",
    "One of These Days (‘French Windows’)",
    "surrounded by brackets",
  ],
];

const apostropheTests: TestCase[] = [
  ["I'm Free", "I’m Free", "contraction"],
  ["Lovin' You", "Lovin’ You", "omitted last letter"],
  [
    "Talkin' 'Bout You",
    "Talkin’ ’Bout You",
    "omitted last letter followed by omitted first letter",
  ],
  ["Summer '68", "Summer ’68", "before a number"],
  ["'39", "’39", "before a number, at the beginning"],
  [
    "Atom Heart Mother ('71 Hakone Aphrodite)",
    "Atom Heart Mother (’71 Hakone Aphrodite)",
    "after an opening bracket",
  ],
  ["Rock 'n' Roll", "Rock ’n’ Roll", "special case, no single quotes!"],
  [
    "Rock 'N' Roll",
    "Rock ’N’ Roll",
    "case-insensitive, “Guess punctuation” used before “Guess case”",
  ],
  ["Back to the 70's", "Back to the 70’s"],
  [
    "Όσο Και Να Σ' Αγαπάω (Υπ' Ευθύνη Μου)",
    "Όσο Και Να Σ’ Αγαπάω (Υπ’ Ευθύνη Μου)",
    "non-Latin script",
  ],
];

const complexTests: TestCase[] = [
  [
    "Little Billy (aka 'Little Billy's Doing Fine')",
    "Little Billy (aka ‘Little Billy’s Doing Fine’)",
  ],
  ['"I am 12" 7" edit of 12" remix', "“I am 12” 7″ edit of 12″ remix"],
  [
    "2'59\" hardcore 'Master's Crown Take 'Em to the Limit' 80's 7\" edit",
    "2′59″ hardcore ‘Master’s Crown Take ’Em to the Limit’ 80’s 7″ edit",
  ],
];

const dateAndNumberTests: TestCase[] = [
  ["live, 1987-07-30", "live, 1987‐07‐30"],
  ["live, 2016-04", "live, 2016‐04"],
  ["The Early Years: 1965-1972", "The Early Years: 1965–1972"],
  [
    "advanced date range 1234-05-06-1789-10-11",
    "advanced date range 1234‐05‐06–1789‐10‐11",
  ],
  ["1989-90", "1989–90", "second year abbreviated, not a valid date"],
  ["Volumes 1-5", "Volumes 1–5", "numeric range (en dash)"],
  [
    "ISBN 978-0-12345-678-9",
    "ISBN 978‒0‒12345‒678‒9",
    "figure dash to group digits",
  ],
  ["2345-67-89", "2345‒67‒89", "figure dash to group digits, not a valid date"],
];

const miscTests: TestCase[] = [
  /* hyphens */
  ["Bron-Yr-Aur Stomp", "Bron‐Yr‐Aur Stomp"],

  /* dashes */
  ["Journal de Paris - Les Pink Floyd", "Journal de Paris – Les Pink Floyd"],

  /* ellipses */
  ["Wot's... Uh the Deal", "Wot’s… Uh the Deal"],
  ["...Baby One More Time", "…Baby One More Time", "at the beginning"],
  ["The Gold It's in The...", "The Gold It’s in The…", "at the end"],
  [
    "Is This the World We Created...?",
    "Is This the World We Created…?",
    "before another punctuation symbol",
  ],
];

const ignoredCases: string[] = [
  "Death on Two Legs (Dedicated to......",
  "Royal Days -another version-", // only handled for Japanese, see below
];

const unsupportedTestCases: TestCase[] = [
  [
    "Here 'Tis (version for 'Ready, Steady, Go!')",
    "Here ’Tis (version for ‘Ready, Steady, Go!’)",
  ],
  [
    "555-1212",
    "555‒1212",
    "figure dash, phone number with only two groups of digits (could be a range)",
  ],
  ["'74-'75", "’74–’75", "would work with spaces"],
];

const languageSpecificTestCases: Record<string, TestCase[]> = {
  de: [
    [
      `"Hast du Grass' 'Blechtrommel' gelesen?"`,
      "„Hast du Grass’ ‚Blechtrommel‘ gelesen?“",
    ],
    /* hyphens for abbreviated compound words */
    ["Rock- und Pop-Balladen", "Rock‐ und Pop‐Balladen"],
    ["Sonnenaufgang und -untergang", "Sonnenaufgang und ‐untergang"],
    ["Sonnenauf- und -untergang", "Sonnenauf‐ und ‐untergang"],
  ],
  fr: [
    [
      'La caissière du cinéma m\'a recommandé un "film sensationnel" !',
      "La caissière du cinéma m’a recommandé un « film sensationnel » !",
    ],
  ],
  ja: [
    [
      "Royal Days -another version-",
      "Royal Days –another version–",
      "dashes used as brackets",
    ],
  ],
  he: [
    [
      `דני אמר: "האם קראת את הספר 'המסע של ד"ר כהן' מאת ר' שלמה בר-מוחא"?`,
      `דני אמר: ”האם קראת את הספר ’המסע של ד״ר כהן’ מאת ר׳ שלמה בר־מוחא”?`,
    ],
  ],
};

function itHandles(name: string, testCases: TestCase[]) {
  it(`handles ${name}`, () => {
    for (const [input, expectedOutput, description] of testCases) {
      assertEquals(guessUnicodePunctuation(input), expectedOutput, description);
    }
  });
}

describe("guessPunctuation", () => {
  itHandles("single and double quotes", quoteTests);
  itHandles("apostrophes", apostropheTests);
  itHandles(
    "multiple ASCII quotes and apostrophes with different meaning",
    complexTests,
  );
  itHandles("IS0 8601 dates, numbers and ranges", dateAndNumberTests);
  itHandles("hyphens, dashes and ellipses", miscTests);

  it("preserves ASCII punctuation if there is no clear Unicode equivalent", () => {
    for (const input of ignoredCases) {
      assertEquals(guessUnicodePunctuation(input), input);
    }
  });

  it("fails for known unsupported test cases", () => {
    for (const [input, expectedOutput, description] of unsupportedTestCases) {
      assertNotEquals(
        guessUnicodePunctuation(input),
        expectedOutput,
        description,
      );
    }
  });

  for (
    const [language, testCases] of Object.entries(languageSpecificTestCases)
  ) {
    it(`supports special cases for language "${language}"`, () => {
      for (const [input, expectedOutput] of testCases) {
        assertEquals(guessUnicodePunctuation(input, language), expectedOutput);
      }
    });
  }
});
