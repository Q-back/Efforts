import { describe, it, expect } from "vitest";
import { extractSessionTitle } from "../sessionUtils";

describe("extractSessionTitle", () => {
  // Basic cases
  it('should return "Untitled Session" for empty string', () => {
    expect(extractSessionTitle("")).toBe("Untitled Session");
  });

  it('should return "Untitled Session" for null/undefined', () => {
    expect(extractSessionTitle(undefined as unknown as string)).toBe(
      "Untitled Session"
    );
    expect(extractSessionTitle(null as unknown as string)).toBe(
      "Untitled Session"
    );
  });

  it("should return first line as title when no header", () => {
    expect(extractSessionTitle("Simple title\nSecond line")).toBe(
      "Simple title"
    );
  });

  // Markdown header variations
  it("should remove header markers from title", () => {
    expect(extractSessionTitle("# Title with h1")).toBe("Title with h1");
    expect(extractSessionTitle("## Title with h2")).toBe("Title with h2");
    expect(extractSessionTitle("### Title with h3")).toBe("Title with h3");
    expect(extractSessionTitle("#### Title with h4")).toBe("Title with h4");
  });

  it("should handle header without space", () => {
    expect(extractSessionTitle("#NoSpace")).toBe("#NoSpace");
    expect(extractSessionTitle("##StillNoSpace")).toBe("##StillNoSpace");
  });

  // Complex first lines
  it("should preserve Markdown syntax in titles", () => {
    expect(extractSessionTitle("Title with #hashtag")).toBe(
      "Title with #hashtag"
    );
    expect(extractSessionTitle("* List item start")).toBe("* List item start");
    expect(extractSessionTitle("> Quoted text")).toBe("> Quoted text");
    expect(extractSessionTitle("code block")).toBe("code block");
  });

  // Special characters
  it("should preserve Markdown formatting characters", () => {
    expect(extractSessionTitle("Title with emphasis")).toBe(
      "Title with emphasis"
    );
    expect(extractSessionTitle("Title with underscores")).toBe(
      "Title with underscores"
    );
    expect(extractSessionTitle("Title with link")).toBe("Title with link");
  });

  // Edge cases
  it("should handle whitespace properly", () => {
    expect(extractSessionTitle("#    Title with many spaces")).toBe(
      "Title with many spaces"
    );
    expect(extractSessionTitle("# Title with trailing spaces  ")).toBe(
      "Title with trailing spaces"
    );
  });

  it("should handle special edge cases", () => {
    expect(extractSessionTitle("# \n")).toBe("Untitled Session");
    expect(extractSessionTitle("\n# Title not on first line")).toBe(
      "Untitled Session"
    );
    expect(extractSessionTitle("   \n# Title after blank")).toBe(
      "Untitled Session"
    );
  });

  it("should handle multiline titles correctly", () => {
    expect(extractSessionTitle("First line\nSecond line\nThird line")).toBe(
      "First line"
    );
    expect(extractSessionTitle("# Header title\nSecond line\nThird line")).toBe(
      "Header title"
    );
  });
});
