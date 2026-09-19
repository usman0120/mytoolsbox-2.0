const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
  "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit",
  "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
  "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est",
  "laborum", "perspiciatis", "unde", "omnis", "iste", "natus", "error", "sit",
  "voluptatem", "accusantium", "doloremque", "laudantium", "totam", "rem",
  "aperiam", "eaque", "ipsa", "quae", "ab", "illo", "inventore", "veritatis",
  "quasi", "architecto", "beatae", "vitae", "dicta", "sunt", "explicabo",
];

export function generateLoremIpsum(
  paragraphs: number = 3,
  sentencesPerParagraph: number = 5,
  wordsPerSentence: number = 10
): string {
  const result: string[] = [];

  for (let p = 0; p < paragraphs; p++) {
    const sentences: string[] = [];
    for (let s = 0; s < sentencesPerParagraph; s++) {
      const words: string[] = [];
      const count = wordsPerSentence + Math.floor(Math.random() * 6) - 3;
      for (let w = 0; w < count; w++) {
        words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
      }
      const sentence = words.join(" ") + ".";
      sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1));
    }
    result.push(sentences.join(" "));
  }

  return result.join("\n\n");
}