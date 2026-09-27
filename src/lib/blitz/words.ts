export type Difficulty = "easy" | "normal" | "hard";

const EASY = `the be of and a to in he have it that for they with as not on she at by this we you do but from or which one would all will there say who make when can more if no man out other so what time up go about than into could state only new year some take come these know see use get like then first any work now may such give over think most even find day also after way many must look before great back through long where much should well people down own just because good each those feel seem how high too place little world very still nation hand old life tell write become here show house both between need mean call develop under last right move thing general school never same another begin while number part turn real leave might want point form off child few small since against ask late home interest large person end open public follow during present without again hold govern around possible head consider word program problem however lead system set order eye plan run keep face fact group play stand increase early course change help line`.split(
  /\s+/,
);

const NORMAL = `ability absolute account achieve address advance against airport allow almost already although always amount analysis animal another answer anxious appear approach argument arrive article assume attack attempt attention audience author available average balance because become before behavior believe benefit between beyond billion border bottom bridge brilliant budget build business camera campaign cancel candidate capital capture career careful category caution central century certain challenge chamber champion channel chapter character charge choice circle citizen claim classic clear client climate close coast collect college combine comfort command comment commit common company compare compete complex concept concern conclude concrete condition conduct confirm connect consider constant contact contain content contest context continue contract contrast control convince corner correct council counter country couple courage create credit crisis critical culture current custom damage danger daughter debate decade decide declare decline decrease defeat defend define degree deliver demand density depend deposit describe design desire despite destroy detail detect develop device devote dialog differ digital dinner direct discover discuss disease display distance district diverse divide doctor document domestic double doubt drama dream drive during dynamic eager early economy edition educate effect effort either elect element elite embrace emerge emotion employ enable encounter energy engage engine enhance enjoy enough ensure enter entire episode equal equip error escape essay essence establish estate estimate ethics evaluate evening event evidence evolve exact examine example exceed exchange excite exclude excuse execute exercise exhibit exist expand expect expense expert explain explore export expose express extend external extra extreme`.split(
  /\s+/,
);

const HARD = `abstraction acknowledgment aesthetically ambiguity anachronism antithesis apprehension architecture asymmetrical benevolence bureaucracy calibration camaraderie catastrophic circumference cognizant collaborative commemorate complementary comprehensive conscientious consequential constellation contemporary controversial convalescence cryptography deliberation demonstrable deterministic disproportionate egalitarian elaborate empirical encapsulate entrepreneurial equilibrium exacerbate exhilarating exponential extraordinary facilitation fluctuation formidable fundamental heterogeneous hypothetical idiosyncratic illuminating imperceptible implementation improvisation incandescent incomprehensible indispensable infrastructure inquisitive institutional interdependent interpretation juxtaposition kaleidoscope labyrinthine legitimacy magnificent meticulous multifaceted negotiation nomenclature obfuscation omnipresent oscillation paradoxical parameterize perpendicular perseverance phenomenon philosophical precipitation predominantly preliminary proliferation pronunciation quantifiable questionable reciprocity reconnaissance rehabilitation reminiscent repercussion resilience retrospective revolutionary significant simultaneous sophisticated spontaneity statistically subsequently substantial surveillance susceptible synchronize synthesize technological theoretical transcendent transformation ubiquitous unprecedented vernacular vicissitude virtuosity vulnerability`.split(
  /\s+/,
);

const PUNCT = [",", ".", ";", ":", "!", "?", "'s", "-", '"'];

export function generateWords(
  count: number,
  opts: { difficulty: Difficulty; numbers: boolean; punctuation: boolean },
): string[] {
  const pool = opts.difficulty === "easy" ? EASY : opts.difficulty === "hard" ? HARD : NORMAL;
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    let w = pool[Math.floor(Math.random() * pool.length)]!;
    if (opts.numbers && Math.random() < 0.12) {
      w = String(Math.floor(Math.random() * 9999));
    } else if (opts.punctuation && Math.random() < 0.22) {
      const p = PUNCT[Math.floor(Math.random() * PUNCT.length)]!;
      if (p === '"') w = `"${w}"`;
      else w = w + p;
      if (Math.random() < 0.3) w = w.charAt(0).toUpperCase() + w.slice(1);
    }
    out.push(w);
  }
  return out;
}

export function wordsFromCustomText(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}
