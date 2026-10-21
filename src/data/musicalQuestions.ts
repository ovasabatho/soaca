export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  category: 'Tempo & Markings' | 'Dynamics & Expression' | 'Music Theory & Notation' | 'Vocal & Choral' | 'Sacred & Choral Forms' | 'Composers & History' | 'Conducting & Performance';
  explanation: string;
}

export const MUSICAL_QUESTIONS: QuizQuestion[] = [
  // --- TEMPO & MARKINGS (1-35) ---
  {
    id: 1,
    question: 'What does the tempo marking "Allegro" mean?',
    options: ['Slow and solemn', 'Fast, quick, and lively', 'At a walking pace', 'Very fast and rapid'],
    correctIndex: 1,
    category: 'Tempo & Markings',
    explanation: '"Allegro" is an Italian musical term meaning fast, lively, and bright, typically between 120-156 BPM.'
  },
  {
    id: 2,
    question: 'What does the tempo marking "Andante" mean?',
    options: ['At a walking pace, moderately slow', 'Extremely fast', 'Very slow and broad', 'Gradually speeding up'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Andante" comes from the Italian verb "andare" (to walk) and indicates a flowing, moderate walking tempo (approx. 76-108 BPM).'
  },
  {
    id: 3,
    question: 'What does "Adagio" indicate in sheet music?',
    options: ['Very fast with energy', 'Slow and stately, with ease', 'Gradually slowing down', 'In a singing style'],
    correctIndex: 1,
    category: 'Tempo & Markings',
    explanation: '"Adagio" means slowly and with ease (approx. 66-76 BPM), slower than andante but faster than largo.'
  },
  {
    id: 4,
    question: 'What does the marking "Presto" mean?',
    options: ['Very fast and rapid', 'Moderately fast', 'Slow and majestic', 'Suddenly loud'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Presto" indicates a very fast, rapid tempo (approx. 168-200 BPM).'
  },
  {
    id: 5,
    question: 'What does "Largo" mean?',
    options: ['Lively and quick', 'Broad, slow, and dignified', 'Medium tempo', 'Soft and quiet'],
    correctIndex: 1,
    category: 'Tempo & Markings',
    explanation: '"Largo" means broadly, slowly, and solemnly (approx. 40-60 BPM).'
  },
  {
    id: 6,
    question: 'What does "Vivace" mean?',
    options: ['Brisk, lively, and spirited', 'Extremely slow', 'Dying away', 'Smooth and connected'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Vivace" indicates a lively, brisk, and animated tempo, often faster than allegro.'
  },
  {
    id: 7,
    question: 'What does "Moderato" indicate?',
    options: ['Extremely rapid', 'At a moderate tempo', 'Extremely solemn and heavy', 'Gradually getting louder'],
    correctIndex: 1,
    category: 'Tempo & Markings',
    explanation: '"Moderato" means at a moderate, reasonable tempo (approx. 108-120 BPM).'
  },
  {
    id: 8,
    question: 'What does "Ritardando" (or "rit.") mean?',
    options: ['Gradually speeding up', 'Gradually slowing down', 'Holding a note indefinitely', 'Singing loudly'],
    correctIndex: 1,
    category: 'Tempo & Markings',
    explanation: '"Ritardando" instructs the performer to gradually decrease the tempo.'
  },
  {
    id: 9,
    question: 'What does "Accelerando" (or "accel.") instruct the performer to do?',
    options: ['Gradually slow down', 'Gradually speed up the tempo', 'Become softer', 'Pause the music'],
    correctIndex: 1,
    category: 'Tempo & Markings',
    explanation: '"Accelerando" means gradually accelerating or increasing the tempo.'
  },
  {
    id: 10,
    question: 'What does the term "A tempo" mean when encountered after a ritardando?',
    options: ['Return to the original/previous tempo', 'Play twice as fast', 'Stop playing immediately', 'Change key'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"A tempo" directs the musicians to return to the original tempo following a temporary change like ritardando or accelerando.'
  },
  {
    id: 11,
    question: 'What is "Tempo Rubato"?',
    options: ['Strict mechanical rhythm', 'Expressive and flexible alteration of tempo', 'Playing backwards', 'Silent rest'],
    correctIndex: 1,
    category: 'Tempo & Markings',
    explanation: '"Rubato" (literally "stolen time") refers to subtle speedings up and slowings down of tempo for expressive phrasing.'
  },
  {
    id: 12,
    question: 'What does "Grave" indicate as a tempo marking?',
    options: ['The slowest, most solemn and serious tempo', 'Lively and playful', 'Quick march', 'Quiet whispering'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Grave" is one of the slowest and most serious, solemn tempo markings in classical music.'
  },
  {
    id: 13,
    question: 'What does "Lento" mean?',
    options: ['Slowly', 'Fast', 'Medium', 'Detached'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Lento" is Italian for slow (typically 45-60 BPM).'
  },
  {
    id: 14,
    question: 'What does "Prestissimo" mean?',
    options: ['As fast as possible', 'Rather slow', 'Moderately fast', 'Smooth and sweet'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Prestissimo" indicates an extremely fast tempo, performed as rapidly as possible (over 200 BPM).'
  },
  {
    id: 15,
    question: 'What does "Allegretto" mean in relation to Allegro?',
    options: ['Much faster than Allegro', 'Slightly slower and lighter than Allegro', 'The exact same as Largo', 'Extremely heavy'],
    correctIndex: 1,
    category: 'Tempo & Markings',
    explanation: '"Allegretto" is the diminutive of allegro, meaning moderately fast, lighter, and slightly slower than allegro.'
  },
  {
    id: 16,
    question: 'What does "Larghetto" mean?',
    options: ['Somewhat broad and slow, but less so than Largo', 'Very brisk', 'Sudden burst of sound', 'A short pause'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Larghetto" is slightly less slow and broad than a full Largo.'
  },
  {
    id: 17,
    question: 'What does "Rallentando" (or "rall.") mean?',
    options: ['A progressive slackening of tempo / slowing down', 'A sudden acceleration', 'A key change', 'A repeat from the sign'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Rallentando" means gradually slowing down and broadening the tempo.'
  },
  {
    id: 18,
    question: 'What does "Allargando" mean?',
    options: ['Broadening and slowing down, often with growing fuller tone', 'Becoming softer and faster', 'Jumping immediately to coda', 'Skipping a measure'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Allargando" means broadening out in tempo, usually accompanied by an increase in volume and fullness.'
  },
  {
    id: 19,
    question: 'What does "Meno mosso" mean?',
    options: ['More movement / faster', 'Less movement / slower', 'Without measure', 'With maximum volume'],
    correctIndex: 1,
    category: 'Tempo & Markings',
    explanation: '"Meno mosso" literally means "less moved," indicating a slower tempo.'
  },
  {
    id: 20,
    question: 'What does "Più mosso" mean?',
    options: ['More movement / quicker tempo', 'Less movement / slower tempo', 'Silence', 'In a quiet whisper'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Più mosso" means "more movement," instructing the performers to take a quicker tempo.'
  },
  {
    id: 21,
    question: 'What does "Maestoso" mean?',
    options: ['Majestically and stately', 'Softly and mournfully', 'Very quickly and light', 'Aggressively'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Maestoso" instructs performers to sing or play with majesty, dignity, and grandeur.'
  },
  {
    id: 22,
    question: 'What does "Cantabile" mean?',
    options: ['In a singing, flowing, melodious style', 'In a dry, detached style', 'With heavy brass sound', 'As fast as possible'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Cantabile" is Italian for "singable" or "in a singing style," demanding a smooth, lyrical phrasing.'
  },
  {
    id: 23,
    question: 'What does "Dolce" mean?',
    options: ['Sweetly and tenderly', 'Harshly and loud', 'Fast and frantic', 'With great sadness'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Dolce" directs the performer to deliver the phrase sweetly and softly.'
  },
  {
    id: 24,
    question: 'What does "Espressivo" (or "espr.") mean?',
    options: ['With expression and feeling', 'Without emotion', 'At top speed', 'In strict military time'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Espressivo" means playing or singing with rich emotional expression.'
  },
  {
    id: 25,
    question: 'What does "Con brio" mean?',
    options: ['With spirit, vigor, and brilliance', 'With extreme sadness', 'Without vibrato', 'In a walking style'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Con brio" means with vigor, fire, energy, and spirit.'
  },
  {
    id: 26,
    question: 'What does "Con moto" mean?',
    options: ['With motion / moving forward', 'Without sound', 'With mute', 'Very slowly'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Con moto" means "with motion," keeping a forward-moving pulse.'
  },
  {
    id: 27,
    question: 'What does "Giocoso" mean?',
    options: ['Playfully, merrily, and joyfully', 'Solemnly and sadly', 'With harsh anger', 'Gradually fading out'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Giocoso" means cheerful, playful, and merry.'
  },
  {
    id: 28,
    question: 'What does "Sempre" mean in musical instructions (e.g., "sempre staccato")?',
    options: ['Always / continually', 'Never', 'Sometimes', 'Suddenly'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Sempre" means "always" or "continuously throughout."'
  },
  {
    id: 29,
    question: 'What does "Subito" mean (e.g., "subito piano")?',
    options: ['Suddenly / immediately', 'Gradually over time', 'Softly', 'Optionally'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Subito" means suddenly, without any gradual transition.'
  },
  {
    id: 30,
    question: 'What does "Non troppo" mean when added to a tempo (e.g., "Allegro non troppo")?',
    options: ['Not too much / not overly', 'Extremely fast', 'With lots of rubato', 'Always louder'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Non troppo" means "not too much" (e.g. Allegro non troppo = fast, but not too fast).'
  },
  {
    id: 31,
    question: 'What does "Assai" mean in musical terms (e.g., "Allegro assai")?',
    options: ['Very / much', 'A little bit', 'Without rhythm', 'Slowly'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Assai" means "very" or "much" in Italian.'
  },
  {
    id: 32,
    question: 'What does "Poco a poco" mean?',
    options: ['Little by little / gradually', 'All at once', 'With power', 'Quietly'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Poco a poco" means step-by-step or little by little.'
  },
  {
    id: 33,
    question: 'What does "Tempo primo" indicate in a score?',
    options: ['Return to the first/original tempo of the piece', 'Double the tempo', 'First player only', 'Play the highest note'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Tempo primo" directs everyone to resume the initial tempo established at the beginning.'
  },
  {
    id: 34,
    question: 'What does "Misterioso" indicate?',
    options: ['Mysteriously and secretively', 'Loud and brassy', 'Fast and dance-like', 'Tender and sweet'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Misterioso" instructs the performers to create a mysterious, evocative atmosphere.'
  },
  {
    id: 35,
    question: 'What does "Senza" mean (e.g., "senza misura")?',
    options: ['Without', 'With', 'Always', 'Slowly'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Senza" is Italian for "without" (e.g., senza misura = without strict measure/meter).'
  },

  // --- DYNAMICS & EXPRESSION (36-65) ---
  {
    id: 36,
    question: 'What does the dynamic marking "Piano" (p) mean?',
    options: ['Soft / quiet', 'Loud', 'Moderately loud', 'Very loud'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Piano" is the Italian term for soft or quiet, indicated by the letter "p".'
  },
  {
    id: 37,
    question: 'What does "Forte" (f) mean?',
    options: ['Loud / strong', 'Soft', 'Medium soft', 'Gradually diminishing'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Forte" is the Italian term for loud and strong, represented by "f".'
  },
  {
    id: 38,
    question: 'What does "Pianissimo" (pp) mean?',
    options: ['Very soft', 'Very loud', 'Medium soft', 'Extremely fast'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Pianissimo" means very soft, indicated by "pp".'
  },
  {
    id: 39,
    question: 'What does "Fortissimo" (ff) mean?',
    options: ['Very loud', 'Very soft', 'Moderately loud', 'Getting softer'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Fortissimo" translates to very loud, marked as "ff".'
  },
  {
    id: 40,
    question: 'What does "Mezzo piano" (mp) mean?',
    options: ['Moderately soft', 'Moderately loud', 'Extremely soft', 'Loudest possible'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Mezzo piano" means half soft / moderately soft (louder than p, softer than mf).'
  },
  {
    id: 41,
    question: 'What does "Mezzo forte" (mf) mean?',
    options: ['Moderately loud', 'Moderately soft', 'Very loud', 'Silent'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Mezzo forte" means half loud / moderately loud (softer than f, louder than mp).'
  },
  {
    id: 42,
    question: 'What does a "Crescendo" (<) indicate?',
    options: ['Gradually getting louder', 'Gradually getting softer', 'Sudden stop', 'Speeding up'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: 'A crescendo indicates a gradual increase in volume/dynamics.'
  },
  {
    id: 43,
    question: 'What does "Decrescendo" or "Diminuendo" (>) indicate?',
    options: ['Gradually getting softer', 'Gradually getting louder', 'Slowing down', 'Holding the note'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: 'Decrescendo and diminuendo indicate a gradual decrease in volume.'
  },
  {
    id: 44,
    question: 'What does "Sforzando" (sfz) signify?',
    options: ['A sudden, strong accent on a single note or chord', 'A very soft whisper', 'A gradual fade out', 'A tempo change'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Sforzando" directs a sudden, forceful emphasis or accent on a specific note.'
  },
  {
    id: 45,
    question: 'What does "Fortepiano" (fp) mean?',
    options: ['Loud, then immediately soft', 'Soft, then immediately loud', 'Gradual crescendo', 'An early piano instrument only'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Fortepiano" indicates attacking the note loudly and then instantly dropping to piano.'
  },
  {
    id: 46,
    question: 'What does "Pianississimo" (ppp) indicate?',
    options: ['Extremely soft / as soft as possible', 'Moderately loud', 'Three pianos playing together', 'Triple speed'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"ppp" means extremely soft, barely audible.'
  },
  {
    id: 47,
    question: 'What does "Fortississimo" (fff) indicate?',
    options: ['Extremely loud / with maximum power', 'Very soft', 'Fast triple meter', 'Triple chorus'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"fff" indicates extreme loudness and intensity.'
  },
  {
    id: 48,
    question: 'What does "Morendo" mean in musical dynamics and tempo?',
    options: ['Dying away in tone and often slowing down', 'Bursting with energy', 'Repeated many times', 'Starting afresh'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Morendo" means dying away, fading out both in dynamic volume and tempo.'
  },
  {
    id: 49,
    question: 'What does "Calando" mean?',
    options: ['Decreasing in both volume and tempo', 'Increasing in pitch only', 'Singing strictly on pitch', 'Sudden silence'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Calando" means growing quieter and calmer, usually with a slight slackening of tempo.'
  },
  {
    id: 50,
    question: 'What does "Smorzando" mean?',
    options: ['Extinguishing / fading away to silence', 'Sharp accent', 'Doubling the note length', 'Singing staccato'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Smorzando" means fading out or extinguishing the sound completely.'
  },
  {
    id: 51,
    question: 'What does "Sotto voce" mean for a choir or singer?',
    options: ['Under the voice / in an undertone or subdued whisper', 'At full lung capacity', 'In the highest soprano register', 'Without accompaniment'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Sotto voce" means "under the voice," singing in a hushed, intimate, restrained tone.'
  },
  {
    id: 52,
    question: 'What does "Mezza voce" mean?',
    options: ['With half voice / moderate restrained volume', 'With two voices only', 'At double speed', 'Without text'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Mezza voce" means singing with half-power/restrained vocal weight for color and delicacy.'
  },
  {
    id: 53,
    question: 'What does "Marcato" (^) mean above a note?',
    options: ['Marked and accented with emphasis', 'Extremely short and light', 'Tied to the next note', 'Held twice as long'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Marcato" indicates that a note should be played or sung distinctly and prominently with an accent.'
  },
  {
    id: 54,
    question: 'What does "Tenuto" (a horizontal line over/under a note) mean?',
    options: ['Hold the note for its full value or with slight weight', 'Cut the note in half', 'Play as loud as possible', 'Skip the note'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Tenuto" means "held," instructing the performer to sustain the note for its complete duration with gentle emphasis.'
  },
  {
    id: 55,
    question: 'What does "Staccato" (a dot over/under a note) mean?',
    options: ['Short, detached, and separated', 'Smooth and connected', 'Held indefinitely', 'Loud and heavy'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Staccato" means detached and short, creating separation between consecutive notes.'
  },
  {
    id: 56,
    question: 'What does "Legato" mean?',
    options: ['Smooth and connected without breaks', 'Sharp and detached', 'With heavy emphasis', 'At a fast tempo'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Legato" means smoothly connected, where notes flow seamlessly into one another.'
  },
  {
    id: 57,
    question: 'What does "Legatissimo" mean?',
    options: ['Extremely smooth and seamlessly connected', 'Extremely detached', 'Extremely fast', 'With multiple instruments'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Legatissimo" means as smoothly and connected as possible.'
  },
  {
    id: 58,
    question: 'What does "Rinforzando" (rf or rfz) indicate?',
    options: ['A sudden, localized reinforcement of tone/crescendo', 'A slow drop to silence', 'A key change', 'A pause in time'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Rinforzando" indicates reinforcing or strengthening the tone on a brief phrase.'
  },
  {
    id: 59,
    question: 'What is the dynamic marking for "as soft as possible"?',
    options: ['ppp / pppp', 'fff', 'mf', 'sfz'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: 'Multiple "p" markings (ppp, pppp) denote extremely delicate, soft dynamics.'
  },
  {
    id: 60,
    question: 'Which of the following dynamic levels is the loudest?',
    options: ['Fortissimo (ff)', 'Forte (f)', 'Mezzo forte (mf)', 'Mezzo piano (mp)'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: 'Among the listed options, "ff" (fortissimo) represents the highest dynamic level.'
  },
  {
    id: 61,
    question: 'Which of the following dynamic markings is softer than "p"?',
    options: ['Pianissimo (pp)', 'Mezzo piano (mp)', 'Mezzo forte (mf)', 'Forte (f)'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"pp" (pianissimo) is softer than "p" (piano).'
  },
  {
    id: 62,
    question: 'What does "Tutti" mean in choral and orchestral scores?',
    options: ['All together / full ensemble', 'Solo singer only', 'Strings only', 'Rest for all parts'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Tutti" is Italian for "all," directing the entire choir or orchestra to perform together.'
  },
  {
    id: 63,
    question: 'What does "Solo" mean in choral music?',
    options: ['A single performer singing alone', 'The whole section', 'The accompaniment', 'No singing'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Solo" designates a passage performed by an individual singer alone.'
  },
  {
    id: 64,
    question: 'What does "Soli" indicate?',
    options: ['A small group of soloists or a single whole section featured alone', 'The entire mass choir', 'The organist only', 'The conductor'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Soli" indicates a small group of solo performers or an entire section singing a featured passage.'
  },
  {
    id: 65,
    question: 'What does "Brillante" indicate?',
    options: ['Play or sing in a sparkling, brilliant, and showy style', 'Extremely quietly', 'Mournfully and slow', 'Strictly on the beat'],
    correctIndex: 0,
    category: 'Dynamics & Expression',
    explanation: '"Brillante" means brilliant, sparkling, and spirited in execution.'
  },

  // --- MUSIC THEORY & NOTATION (66-105) ---
  {
    id: 66,
    question: 'How many lines and spaces are in a standard musical staff?',
    options: ['5 lines and 4 spaces', '4 lines and 5 spaces', '6 lines and 5 spaces', '5 lines and 5 spaces'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A standard Western musical staff consists of 5 horizontal lines and 4 spaces between them.'
  },
  {
    id: 67,
    question: 'What is another common name for the Treble Clef?',
    options: ['G Clef', 'F Clef', 'C Clef', 'Neutral Clef'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'The Treble Clef is also known as the G Clef because its inner spiral circles the G line (second line from bottom).'
  },
  {
    id: 68,
    question: 'What is another name for the Bass Clef?',
    options: ['F Clef', 'G Clef', 'C Clef', 'Alto Clef'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'The Bass Clef is called the F Clef because its two dots surround the fourth line, which is F.'
  },
  {
    id: 69,
    question: 'What does a sharp sign (♯) do to a pitch?',
    options: ['Raises the pitch by one half step (semitone)', 'Lowers the pitch by one half step', 'Cancels previous accidentals', 'Doubles the duration'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A sharp symbol (♯) raises the note pitch by one semitone (half step).'
  },
  {
    id: 70,
    question: 'What does a flat sign (♭) do to a pitch?',
    options: ['Lowers the pitch by one half step (semitone)', 'Raises the pitch by one half step', 'Lengthens the note', 'Makes the note louder'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A flat symbol (♭) lowers the pitch by one semitone (half step).'
  },
  {
    id: 71,
    question: 'What does a natural sign (♮) do?',
    options: ['Cancels a previous sharp or flat, restoring the pitch to its natural state', 'Makes the note higher', 'Makes the note softer', 'Repeats the measure'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A natural sign cancels any sharp or flat that was in effect for that pitch.'
  },
  {
    id: 72,
    question: 'What does a Fermata (𝄐) placed above a note mean?',
    options: ['Hold the note longer than its written value at the director’s discretion', 'Cut the note short immediately', 'Play as loud as possible', 'Sing with closed mouth'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A fermata (colloquially "bird’s eye") indicates sustaining the note or rest beyond its normal duration.'
  },
  {
    id: 73,
    question: 'How many beats does a whole note (semibreve) receive in 4/4 time?',
    options: ['4 beats', '2 beats', '1 beat', '3 beats'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'In 4/4 common time, a whole note (semibreve) receives 4 full beats.'
  },
  {
    id: 74,
    question: 'How many beats does a half note (minim) receive in 4/4 time?',
    options: ['2 beats', '1 beat', '4 beats', '1/2 beat'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A half note (minim) lasts for 2 beats in 4/4 time.'
  },
  {
    id: 75,
    question: 'How many beats does a quarter note (crotchet) receive in 4/4 time?',
    options: ['1 beat', '2 beats', '4 beats', '1/2 beat'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'In 4/4 time, the bottom number 4 indicates that a quarter note receives 1 beat.'
  },
  {
    id: 76,
    question: 'What effect does adding a dot to a note have on its duration?',
    options: ['Increases its duration by half of its original value', 'Doubles its value', 'Reduces its value by half', 'Makes it staccato'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A dot increases the length of a note by 50% of its standard value (e.g., a dotted half note = 2 + 1 = 3 beats).'
  },
  {
    id: 77,
    question: 'What does a 3/4 time signature mean?',
    options: ['3 beats per measure, and a quarter note gets 1 beat', '4 beats per measure, and a half note gets 1 beat', '3 whole notes per measure', '6 eighth notes per measure'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'The top number (3) means 3 beats per bar; the bottom number (4) means the quarter note gets the beat.'
  },
  {
    id: 78,
    question: 'What does the time signature "Alla Breve" or "Cut Time" (𝄵) represent?',
    options: ['2/2 time (2 half-note beats per measure)', '4/4 time', '3/4 time', '6/8 time'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'Cut time (Alla Breve) is 2/2 time, counted in 2 with half notes receiving 1 beat each.'
  },
  {
    id: 79,
    question: 'What does "Common Time" (represented by the symbol C) mean?',
    options: ['4/4 time', '3/4 time', '2/4 time', '6/8 time'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'The symbol "C" stands for Common Time, which is identical to 4/4 meter.'
  },
  {
    id: 80,
    question: 'What does a "Tie" connecting two notes of the same pitch do?',
    options: ['Combines their rhythmic values into one continuous sound', 'Instructs to play them staccato', 'Indicates a breath mark', 'Changes the pitch by an octave'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A tie joins two adjacent notes of identical pitch into one single unbroken duration.'
  },
  {
    id: 81,
    question: 'What does a "Slur" over notes of different pitches indicate?',
    options: ['Sing or play the notes smoothly connected (legato) on one breath or bow', 'Sing staccato', 'Hold indefinitely', 'Repeat the measure'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A slur connects notes of different pitches, instructing legato phrasing or singing multiple pitches on a single syllable (melisma).'
  },
  {
    id: 82,
    question: 'What does "D.C. al Fine" (Da Capo al Fine) instruct the performer to do?',
    options: ['Go back to the beginning and play until the word "Fine"', 'Jump to the Coda', 'Repeat the last measure only', 'Stop playing immediately'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: '"Da Capo al Fine" means repeat from the head/beginning ("Da Capo") until reaching the end marking ("Fine").'
  },
  {
    id: 83,
    question: 'What does "D.S. al Coda" (Dal Segno al Coda) mean?',
    options: ['Go back to the sign (𝄋), play until the Coda sign, then jump to the Coda', 'Start from the very beginning', 'Play the entire song twice', 'End the song softly'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: '"Dal Segno" directs returning to the sign (𝄋), then taking the Coda jump to the concluding section.'
  },
  {
    id: 84,
    question: 'What does "Coda" mean in musical structure?',
    options: ['A concluding section or tailpiece of a musical composition', 'The opening verse', 'The bridge section', 'The vocal warm-up'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: '"Coda" (Italian for "tail") is a designated concluding passage that brings a piece to a formal close.'
  },
  {
    id: 85,
    question: 'What is the interval between Middle C and the G directly above it?',
    options: ['A Perfect Fifth', 'A Major Third', 'A Perfect Fourth', 'An Octave'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'From C up to G spans five letter names (C-D-E-F-G) and is an interval of a Perfect 5th (7 semitones).'
  },
  {
    id: 86,
    question: 'What is the interval between Middle C and the E directly above it?',
    options: ['A Major Third', 'A Minor Third', 'A Perfect Fourth', 'A Major Second'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'C to E is 4 semitones, forming a Major 3rd.'
  },
  {
    id: 87,
    question: 'What interval spans 12 half steps (semitones)?',
    options: ['An Octave', 'A Major Seventh', 'A Perfect Fifth', 'A Tritone'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'An octave contains 12 semitones, connecting two pitches with the same letter name in a 2:1 frequency ratio.'
  },
  {
    id: 88,
    question: 'How many sharps are in the key signature of G Major?',
    options: ['1 sharp (F♯)', '2 sharps (F♯, C♯)', '3 sharps (F♯, C♯, G♯)', 'No sharps'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'G Major has 1 sharp in its key signature, which is F♯.'
  },
  {
    id: 89,
    question: 'How many sharps are in the key signature of D Major?',
    options: ['2 sharps (F♯, C♯)', '1 sharp', '3 sharps', '4 sharps'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'D Major contains 2 sharps: F♯ and C♯.'
  },
  {
    id: 90,
    question: 'How many flats are in the key signature of F Major?',
    options: ['1 flat (B♭)', '2 flats (B♭, E♭)', '3 flats (B♭, E♭, A♭)', 'No flats'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'F Major has 1 flat in its key signature, which is B♭.'
  },
  {
    id: 91,
    question: 'How many flats are in the key signature of B-flat Major?',
    options: ['2 flats (B♭, E♭)', '1 flat', '3 flats', '4 flats'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'B♭ Major has 2 flats: B♭ and E♭.'
  },
  {
    id: 92,
    question: 'What is the relative minor key of C Major?',
    options: ['A minor', 'D minor', 'E minor', 'G minor'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A minor is the relative minor of C Major because they share the exact same key signature (no sharps, no flats).'
  },
  {
    id: 93,
    question: 'What is the relative minor of G Major?',
    options: ['E minor', 'B minor', 'A minor', 'C minor'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'E minor shares the 1-sharp key signature of G Major and is its relative minor.'
  },
  {
    id: 94,
    question: 'What is the relative minor of F Major?',
    options: ['D minor', 'G minor', 'A minor', 'B minor'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'D minor shares the 1-flat key signature of F Major and is its relative minor.'
  },
  {
    id: 95,
    question: 'What scale degree is called the "Tonic"?',
    options: ['The 1st degree (first note of the scale)', 'The 5th degree', 'The 4th degree', 'The 7th degree'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'The Tonic is the 1st scale degree, acting as the tonal home base and tonal center.'
  },
  {
    id: 96,
    question: 'What scale degree is called the "Dominant"?',
    options: ['The 5th degree', 'The 1st degree', 'The 4th degree', 'The 3rd degree'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'The Dominant is the 5th scale degree, creating strong harmonic tension pulling toward the tonic.'
  },
  {
    id: 97,
    question: 'What scale degree is called the "Subdominant"?',
    options: ['The 4th degree', 'The 2nd degree', 'The 6th degree', 'The 7th degree'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'The Subdominant is the 4th degree of a diatonic scale, one step below the dominant.'
  },
  {
    id: 98,
    question: 'What scale degree is called the "Leading Tone"?',
    options: ['The 7th degree', 'The 2nd degree', 'The 3rd degree', 'The 6th degree'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'The Leading Tone is the 7th scale degree, located a half step below the tonic, which strongly resolves upward to the tonic.'
  },
  {
    id: 99,
    question: 'What notes make up a C Major triad in root position?',
    options: ['C - E - G', 'C - E♭ - G', 'C - F - G', 'C - D - E'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A C Major triad is composed of the Root (C), Major 3rd (E), and Perfect 5th (G).'
  },
  {
    id: 100,
    question: 'What notes make up an A minor triad?',
    options: ['A - C - E', 'A - C♯ - E', 'A - D - E', 'A - B - C'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'An A minor triad consists of Root (A), Minor 3rd (C), and Perfect 5th (E).'
  },
  {
    id: 101,
    question: 'What is a "Triplet"?',
    options: ['Three notes played in the time value of two notes of the same type', 'A group of three singers', 'A piece with 3 movements', 'A chord with 3 notes'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A triplet divides a beat into three equal parts in the space normally occupied by two.'
  },
  {
    id: 102,
    question: 'What is "Syncopation"?',
    options: ['Deliberately placing accents on weak beats or off-beats', 'Singing completely in unison', 'Playing very slowly', 'Changing to a minor key'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'Syncopation involves emphasizing unexpected beats or off-beats rather than the regular strong beats.'
  },
  {
    id: 103,
    question: 'What is an "Anacrusis" in music?',
    options: ['An upbeat or pickup note(s) occurring before the first downbeat of a measure', 'The final chord of a hymn', 'A key change', 'A long dramatic silence'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'An anacrusis (or pickup) is a note or sequence of notes that precedes the first strong downbeat of a phrase.'
  },
  {
    id: 104,
    question: 'What is a "Caesura" (often symbolized by // or "railroad tracks")?',
    options: ['A complete, sudden stop/break in the music before continuing', 'A repeat sign', 'A dynamic change', 'A key change'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A caesura indicates a brief, total pause or silence in performance before the next passage starts.'
  },
  {
    id: 105,
    question: 'What is the "Circle of Fifths"?',
    options: ['A geometric diagram showing the relationship between all 12 chromatic pitches and their key signatures', 'A circular choral seating plan', 'A brass instrument', 'A 5-voice canon'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'The Circle of Fifths visualizes how the 12 chromatic keys are related by intervals of fifths and their corresponding key signatures.'
  },

  // --- VOCAL & CHORAL (106-145) ---
  {
    id: 106,
    question: 'What does the acronym "SATB" stand for in choral music?',
    options: ['Soprano, Alto, Tenor, Bass', 'Solo, Accompaniment, Tempo, Beat', 'Soprano, Accent, Treble, Baritone', 'Sound, Audio, Tune, Band'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'SATB is the standard four-part choral voicing: Soprano, Alto, Tenor, and Bass.'
  },
  {
    id: 107,
    question: 'Which voice part traditionally sings the highest pitch range in a mixed choir?',
    options: ['Soprano', 'Alto', 'Tenor', 'Bass'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Soprano is the highest female/treble vocal part in standard choral literature.'
  },
  {
    id: 108,
    question: 'Which voice part is the lowest male voice range in a choir?',
    options: ['Bass', 'Tenor', 'Baritone', 'Alto'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Bass is the lowest vocal category, providing harmonic foundation and depth.'
  },
  {
    id: 109,
    question: 'What is a "Baritone"?',
    options: ['A male singing voice between Bass and Tenor', 'The highest female voice', 'A high countertenor', 'An instrument only'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'A baritone is the middle male voice type, lying between bass and tenor in range and timbre.'
  },
  {
    id: 110,
    question: 'What is a "Mezzo-Soprano"?',
    options: ['A female voice type between Soprano and Contralto/Alto', 'The highest male voice', 'A deep bass', 'A choir conductor'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'A mezzo-soprano is a female voice with a range situated between soprano and contralto.'
  },
  {
    id: 111,
    question: 'What is a "Countertenor"?',
    options: ['A male singer who trains to sing in the female alto/soprano range using head voice/falsetto', 'A singer who sings against the beat', 'The choir manager', 'A low bass singer'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'A countertenor is an adult male singer who uses falsetto/head voice to sing alto or soprano vocal lines.'
  },
  {
    id: 112,
    question: 'What does "A cappella" mean in choral singing?',
    options: ['Singing without instrumental accompaniment', 'Singing with full orchestra', 'Singing in a high register', 'Singing with church bells'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: '"A cappella" (Italian for "in the chapel style") means pure unaccompanied vocal music.'
  },
  {
    id: 113,
    question: 'What does "Divisi" (or "div.") mean in a choral score?',
    options: ['The singers in that section divide into two or more separate parts', 'All sing in unison', 'The singers stop singing', 'Sing without breathing'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: '"Divisi" instructs a choral section (e.g. Tenors) to split and sing multiple harmony parts simultaneously.'
  },
  {
    id: 114,
    question: 'What does "Unison" mean?',
    options: ['All parts/voices singing the exact same notes or melody together', 'Singing in 4-part harmony', 'Singing as fast as possible', 'Singing off-key'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: '"Unison" means all singers perform identical pitches (or octaves) in synchrony.'
  },
  {
    id: 115,
    question: 'What is "Sight-singing" (or sight-reading)?',
    options: ['The ability to read and sing a piece of sheet music upon seeing it for the first time without prior practice', 'Singing with eyes closed', 'Singing while watching the audience', 'Memorizing a song by ear'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Sight-singing is the skill of accurately singing unpracticed written music at first glance.'
  },
  {
    id: 116,
    question: 'What are the standard 7 Solfège syllables in ascending order?',
    options: ['Do, Re, Mi, Fa, Sol, La, Ti', 'Do, Mi, Sol, Do, Re, Fa, La', 'La, Ti, Do, Re, Mi, Fa, Sol', 'Fa, Sol, La, Ti, Do, Re, Mi'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'The standard diatonic solfège scale is Do, Re, Mi, Fa, Sol, La, Ti (and back to Do).'
  },
  {
    id: 117,
    question: 'What is "Choral Blend"?',
    options: ['The unifying of individual voices into a cohesive, balanced, and uniform ensemble sound', 'Singing at the loudest volume', 'Everyone singing a solo', 'Mixing different songs together'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Choral blend occurs when individual vocal timbres and volumes merge so no single voice sticks out.'
  },
  {
    id: 118,
    question: 'What is "Intonation" in singing?',
    options: ['The accuracy of pitch and staying in tune', 'The speed of singing', 'The words of the song', 'The volume of the choir'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Intonation refers to pitch precision—whether notes are sung strictly in tune (not flat or sharp).'
  },
  {
    id: 119,
    question: 'What does singing "Flat" mean?',
    options: ['Singing slightly below the true pitch', 'Singing slightly above the true pitch', 'Singing without emotion', 'Singing while sitting down'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Singing flat means the pitch is lower than the intended frequency.'
  },
  {
    id: 120,
    question: 'What does singing "Sharp" mean?',
    options: ['Singing slightly higher than the true pitch', 'Singing slightly lower than the true pitch', 'Singing with crisp consonants', 'Singing loudly'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Singing sharp means producing a pitch slightly above the intended target note.'
  },
  {
    id: 121,
    question: 'What is a "Pitch Pipe"?',
    options: ['A small device used by choir directors to sound a reference pitch for starting a song', 'A musical flute', 'An organ pipe only', 'A vocal warmup exercise'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'A pitch pipe is a portable chromatic reed instrument used to give the initial starting pitch to singers.'
  },
  {
    id: 122,
    question: 'What is "Diction" in choral performance?',
    options: ['Clear, crisp, and understandable pronunciation of text and consonants', 'The rhythm of the piano', 'The posture of singers', 'The choice of sheet music'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Diction is the clarity and accuracy of vocal articulation and pronunciation so lyrics are understood.'
  },
  {
    id: 123,
    question: 'What is "Vibrato"?',
    options: ['A slight, natural periodic fluctuation in pitch adding warmth to a sustained vocal tone', 'A completely flat pitch', 'Singing staccato', 'A sudden loud scream'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Vibrato is the natural, gentle pulsing variation in pitch produced by relaxed, supported vocal cords.'
  },
  {
    id: 124,
    question: 'What is "Straight Tone"?',
    options: ['Vocal sound produced without vibrato, often favored in early Renaissance and modern choral music', 'Singing only in monotone', 'Singing while standing straight', 'A brass instrument mute'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Straight tone is singing with minimal or zero vibrato, creating a pure, laser-focused harmonic texture.'
  },
  {
    id: 125,
    question: 'What is "Falsetto"?',
    options: ['A method of vocal production used especially by male singers in the higher register above normal modal voice', 'Singing false/wrong notes deliberately', 'Lip-syncing', 'A fast vocal run'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Falsetto is a high vocal register produced by vibrating only the ligamentous edges of the vocal folds.'
  },
  {
    id: 126,
    question: 'What is the "Passaggio" in vocal pedagogy?',
    options: ['The transition area between different vocal registers (e.g., chest voice to head voice)', 'A hallway behind the choir loft', 'The final page of a musical score', 'A quiet rest in music'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'The passaggio refers to the vocal break or bridge zone between vocal registers.'
  },
  {
    id: 127,
    question: 'What is a "Melisma"?',
    options: ['Singing multiple different pitches on a single syllable of text', 'Singing one note per syllable', 'A loud choral ending', 'A female solo part'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'A melisma is a vocal run where several notes are sung across a single vowel/syllable (e.g., the "Glo-o-o-ria" in angels we have heard on high).'
  },
  {
    id: 128,
    question: 'What is "Syllabic" text setting?',
    options: ['Each syllable of text is assigned to a single note of music', 'Many notes per syllable', 'Singing without any words', 'Singing in foreign languages only'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Syllabic text setting assigns exactly one pitch/note to each individual syllable.'
  },
  {
    id: 129,
    question: 'What is "Staggered Breathing" in a choir?',
    options: ['Choir members breathe at different individual times so a long musical phrase sounds continuous and unbroken', 'Everyone taking a huge breath at the same bar line', 'Singing until you run out of air completely', 'Panting during warmups'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Staggered breathing allows a choral section to sustain long chords indefinitely by taking quick covert breaths at staggered times.'
  },
  {
    id: 130,
    question: 'What is the primary muscle responsible for healthy, supported breath control in singing?',
    options: ['The Diaphragm', 'The Biceps', 'The Tongue', 'The Jaw'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'The diaphragm (and supporting intercostal abdominal muscles) provides the foundation for deep breath control in singing.'
  },
  {
    id: 131,
    question: 'What are Curwen hand signs used for?',
    options: ['Visual hand gestures corresponding to each solfège pitch (Do, Re, Mi, etc.) for teaching pitch relationships', 'Directing orchestral instruments', 'Signaling the choir to sit down', 'Counting beats'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Curwen hand signs provide a kinesthetic visual representation for each solfège syllable to aid ear training and sight-singing.'
  },
  {
    id: 132,
    question: 'What does "Tessitura" mean?',
    options: ['The most comfortable and predominant pitch range where a piece or part lies for a voice', 'The speed of a song', 'The language of a hymn', 'The number of pages in the score'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Tessitura describes the specific acceptable range where most notes of a vocal part lie, beyond just the absolute extreme highs and lows.'
  },
  {
    id: 133,
    question: 'What is "Head Voice"?',
    options: ['The higher vocal register resonating primarily in the head and sinus cavities with a light, ringing quality', 'Speaking normally', 'Deep bass chest resonance', 'Whispering softly'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Head voice is the higher register characterized by upper cranial resonance and lighter vocal fold engagement.'
  },
  {
    id: 134,
    question: 'What is "Chest Voice"?',
    options: ['The lower, heavier vocal register associated with speaking pitch and chest resonance', 'The highest falsetto range', 'Singing without breath', 'A quiet murmur'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Chest voice produces rich, full-bodied lower tones with prominent thoracic resonance.'
  },
  {
    id: 135,
    question: 'What is a "Chorister"?',
    options: ['A member of a choir or choral ensemble', 'The person who plays the organ', 'The author of the hymn text', 'The priest celebrating mass'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'A chorister is a singer who performs in a choir.'
  },
  {
    id: 136,
    question: 'What is the role of a "Choirmaster" (or Cantor / Kapellmeister)?',
    options: ['The conductor, director, and vocal trainer of a choir', 'The person tuning the piano', 'The person printing copies', 'The youngest soprano'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'The choirmaster oversees rehearsals, vocal technique, artistic interpretation, and conducts performances.'
  },
  {
    id: 137,
    question: 'What is "Coloratura"?',
    options: ['Elaborate ornamentation of a vocal melody with rapid runs, trills, and high virtuosity', 'Singing with colored robes', 'Singing in dark minor keys', 'A slow chorale'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Coloratura refers to agile, highly embellished florid vocal passages requiring high dexterity.'
  },
  {
    id: 138,
    question: 'What is "Vocal Warmup"?',
    options: ['A series of vocal and breathing exercises done before singing to prepare the vocal cords and prevent strain', 'Drinking hot coffee', 'Singing the hardest song first', 'Talking loudly before rehearsal'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Vocal warmups gently engage the vocal folds, improve circulation, relax tension, and tune the ears before singing.'
  },
  {
    id: 139,
    question: 'Why is good posture essential for choral singing?',
    options: ['It expands the ribcage, aligns the airway, and enables optimal diaphragm and lung expansion', 'It looks military in uniform', 'It makes the singers taller than the director', 'It is an ancient rule only'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Proper posture removes vocal tract constriction and maximizes breath capacity and vocal stamina.'
  },
  {
    id: 140,
    question: 'What is an "Anthem" in sacred choral music?',
    options: ['A choral composition with English text, often used in church liturgy', 'A national song only', 'An instrumental brass fanfare', 'A quick pop tune'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'In church music, an anthem is a choral setting of a sacred text, often in English, performed during worship services.'
  },
  {
    id: 141,
    question: 'What is a "Motet"?',
    options: ['A polyphonic sacred choral composition, typically on Latin text and unaccompanied', 'A solo piano dance', 'A secular comic opera song', 'A military march'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'A motet is one of the most significant sacred polyphonic choral forms of the Medieval, Renaissance, and Baroque eras.'
  },
  {
    id: 142,
    question: 'What is a "Round" or "Canon" in singing?',
    options: ['A musical piece where multiple voices sing the exact same melody starting at staggered times', 'Singing in a physical circle', 'A song without an ending', 'A song with only one note'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'A canon or round is a contrapuntal form where voices enter at staggered intervals singing the identical melody (e.g., "Row, Row, Row Your Boat").'
  },
  {
    id: 143,
    question: 'What does "Polyphony" mean?',
    options: ['Music with two or more independent melodic lines occurring simultaneously', 'A single melodic line with no harmony', 'A chord played on a keyboard', 'Music for drums only'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Polyphony features multiple independent, intertwining melodic voices of equal importance.'
  },
  {
    id: 144,
    question: 'What does "Homophony" mean in choral music?',
    options: ['All voice parts moving together in the same rhythm with one clear dominant melody supported by harmony chords', 'Voices singing completely different tempos', 'Instrumental music only', 'Singing in silence'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Homophony is chordal texture where all voices move synchronously with identical rhythm (like standard four-part hymn singing).'
  },
  {
    id: 145,
    question: 'What is "Monophony"?',
    options: ['A single, unaccompanied melodic line with no harmony or counterpoint', 'Singing in four parts', 'Singing with a huge symphony', 'Two songs playing at once'],
    correctIndex: 0,
    category: 'Vocal & Choral',
    explanation: 'Monophony consists of one single melodic line without harmonic accompaniment (such as early Gregorian chant).'
  },

  // --- SACRED & CHORAL FORMS (146-175) ---
  {
    id: 146,
    question: 'What are the five standard movements of the Ordinary of the Catholic Mass?',
    options: ['Kyrie, Gloria, Credo, Sanctus, Agnus Dei', 'Introit, Gradual, Alleluia, Offertory, Communion', 'Prelude, Verse, Chorus, Bridge, Outro', 'Adagio, Andante, Allegro, Presto, Coda'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'The five movements of the Mass Ordinary with invariable texts are Kyrie, Gloria, Credo, Sanctus (including Benedictus), and Agnus Dei.'
  },
  {
    id: 147,
    question: 'What does the Greek phrase "Kyrie eleison" mean in liturgy?',
    options: ['Lord, have mercy', 'Glory to God in the highest', 'I believe in one God', 'Holy, Holy, Holy'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: '"Kyrie eleison" is Greek for "Lord, have mercy," the first movement of the Mass.'
  },
  {
    id: 148,
    question: 'What does the Latin phrase "Gloria in excelsis Deo" mean?',
    options: ['Glory to God in the highest', 'Lamb of God', 'Lord have mercy', 'Grant us peace'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: '"Gloria in excelsis Deo" translates to "Glory to God in the highest," known as the Greater Doxology.'
  },
  {
    id: 149,
    question: 'What does "Sanctus" mean in the Mass?',
    options: ['Holy, Holy, Holy', 'Lord have mercy', 'I believe', 'Peace be with you'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: '"Sanctus" translates to "Holy," based on Isaiah 6:3.'
  },
  {
    id: 150,
    question: 'What does "Agnus Dei" mean in the Mass?',
    options: ['Lamb of God', 'Word of God', 'House of God', 'Day of the Lord'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: '"Agnus Dei" is Latin for "Lamb of God who takes away the sins of the world."'
  },
  {
    id: 151,
    question: 'What does "Dona nobis pacem" mean in the conclusion of the Agnus Dei?',
    options: ['Grant us peace', 'Praise the Lord', 'Remember me', 'Go in peace'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: '"Dona nobis pacem" means "Grant us peace."'
  },
  {
    id: 152,
    question: 'What is a "Requiem"?',
    options: ['A Mass for the repose of the souls of the deceased', 'A celebration of Christmas', 'An Easter sunrise hymn', 'A wedding processional'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'A Requiem (or Missa pro defunctis) is a liturgical Mass offered for the dead.'
  },
  {
    id: 153,
    question: 'What is an "Oratorio"?',
    options: ['A large-scale dramatic musical work for orchestra and voices, usually on a sacred biblical theme, performed without theatrical staging or costumes', 'A short solo flute song', 'A comedic stage play with dance', 'A church bulletin'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'An Oratorio is an extended concert piece for choir, soloists, and orchestra telling a narrative story (like Handel’s Messiah).'
  },
  {
    id: 154,
    question: 'What is a "Cantata"?',
    options: ['A multi-movement vocal work with solos, choruses, and instrumental accompaniment, central to Lutheran services', 'A solo dance piece', 'A brass instrument', 'A rhythmic chant'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'Cantatas were composed in large numbers by J.S. Bach for weekly liturgical calendar worship.'
  },
  {
    id: 155,
    question: 'What is "Gregorian Chant" (Plainsong)?',
    options: ['Monophonic, unmetered sacred song of the Western Roman Catholic Church in Latin', 'Multi-part jazz vocal arrangement', 'Heavy brass fanfare', 'German folk dancing music'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'Gregorian chant is the traditional monophonic vocal chant developed in early medieval monasteries.'
  },
  {
    id: 156,
    question: 'What is a "Hymn"?',
    options: ['A sacred song of praise, adoration, or thanksgiving addressed to God, typically structured in verses/stanzas', 'An opera scene', 'A silent prayer', 'An instrumental march'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'A hymn is a structured song of worship with metric rhymed stanzas sung by congregations.'
  },
  {
    id: 157,
    question: 'What is "Strophic Form" in hymnody?',
    options: ['All verses or stanzas of text are sung to the exact same music and melody', 'Every verse has totally new music', 'A song with only one word', 'Music played without words'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'In strophic form (A-A-A...), the musical melody repeats identically for each stanza of lyrics.'
  },
  {
    id: 158,
    question: 'What does "Through-composed" mean in musical structure?',
    options: ['Music that is relatively continuous with new music written for each stanza/section rather than repeating', 'Music that repeats the first line 10 times', 'Music written by children', 'A single chord sustained'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'Through-composed music continuously evolves with fresh material for each text section without regular strophic repetition.'
  },
  {
    id: 159,
    question: 'What is the "Magnificat"?',
    options: ['The canticle of Mary ("My soul magnifies the Lord") from Luke 1', 'The song of Simeon', 'The Ten Commandments in song', 'The Lord’s Prayer in Latin'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'The Magnificat (Canticle of Mary) is a central liturgical text sung at Evening Prayer (Vespers).'
  },
  {
    id: 160,
    question: 'What is the "Nunc Dimittis"?',
    options: ['The Canticle of Simeon ("Lord, now lettest thou thy servant depart in peace") from Luke 2', 'The song of Moses', 'The Beatitudes', 'The wedding march'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'The Nunc Dimittis is the Canticle of Simeon, sung at Night Prayer (Compline / Evensong).'
  },
  {
    id: 161,
    question: 'What is a "Madrigal"?',
    options: ['A secular polyphonic vocal composition popular during the Renaissance and early Baroque eras', 'A solemn church funeral march', 'An instrumental violin solo', 'A modern church organ tune'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'Madrigals were Renaissance secular part-songs characterized by expressive word-painting and love poetry.'
  },
  {
    id: 162,
    question: 'What is "Word Painting" in choral music?',
    options: ['Composing musical gestures that directly illustrate the literal meaning of the lyrics (e.g., ascending pitches on the word "ascend")', 'Drawing pictures on the sheet music', 'Painting stage backdrops', 'Using colored markers for choir folders'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'Word painting (madrigalism) mirrors text meaning through musical contours (high notes for heaven, low notes for hell, fast runs for running).'
  },
  {
    id: 163,
    question: 'What is a "Fugue"?',
    options: ['A contrapuntal composition based on a main subject/theme that is introduced and imitated successively by different voices', 'A single chord sustained for 5 minutes', 'A vocal warm-up exercise with vowels', 'A short two-bar drum beat'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'A fugue is a masterwork of counterpoint where a principal subject is stated and layered across all entering voices.'
  },
  {
    id: 164,
    question: 'What is a "Chorale"?',
    options: ['A stately German Protestant hymn tune designed for congregational singing', 'A high female opera aria', 'A quick jazz dance', 'A trumpet call'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'Chorales are traditional hymn melodies originating in the Protestant Reformation, famously harmonized by J.S. Bach.'
  },
  {
    id: 165,
    question: 'What is a "Te Deum"?',
    options: ['An ancient Latin hymn of praise and thanksgiving ("We praise thee, O God")', 'A prayer for the dead', 'A song for baptisms only', 'An instrumental fanfare'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'The "Te Deum Laudamus" is a grand traditional Christian hymn of solemn thanksgiving.'
  },
  {
    id: 166,
    question: 'What is an "Ave Maria"?',
    options: ['A prayer and musical setting based on the greeting of the Angel Gabriel to Mary', 'A prayer before meals', 'A morning hymn', 'A psalm of David'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: '"Ave Maria" ("Hail Mary") is among the most frequently set sacred Latin texts in choral history.'
  },
  {
    id: 167,
    question: 'What does "Stabat Mater" depict?',
    options: ['The suffering of Mary standing at the foot of the Cross during the Crucifixion', 'The resurrection morning', 'The birth of Jesus in Bethlehem', 'The creation of the world'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: '"Stabat Mater dolorosa" is a 13th-century hymn reflecting on Mary’s sorrow at the cross.'
  },
  {
    id: 168,
    question: 'What is an "Introit" in sacred liturgy?',
    options: ['The opening psalm or antiphon sung as the ministers enter at the start of Mass', 'The final blessing', 'The sermon', 'The silent meditation'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'The Introit is the entrance chant sung during the opening procession of the liturgy.'
  },
  {
    id: 169,
    question: 'What is an "Ostinato"?',
    options: ['A continually repeated musical phrase, rhythm, or bass line throughout a section', 'A sudden stop', 'A singer who refuses to sing', 'A loud drum hit'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'An ostinato is a persistent, repeating melodic or rhythmic pattern (like a ground bass).'
  },
  {
    id: 170,
    question: 'What is a "Cadence" in music?',
    options: ['A harmonic progression of two or more chords that brings a musical phrase or section to a conclusion', 'A fast vocal run', 'A drum roll', 'The volume of the singer'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'A cadence creates a sense of resolution or pause at the end of a musical phrase (e.g. Perfect Authentic, Plagal).'
  },
  {
    id: 171,
    question: 'What is a "Plagal Cadence" (often called the "Amen Cadence")?',
    options: ['The chord progression IV (Subdominant) moving to I (Tonic)', 'V moving to I', 'V moving to vi', 'I moving to V'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'A Plagal Cadence moves from chord IV to I, traditionally sung for the "Amen" at the end of hymns.'
  },
  {
    id: 172,
    question: 'What is an "Authentic Cadence"?',
    options: ['The chord progression V (Dominant) resolving to I (Tonic)', 'IV resolving to I', 'I moving to vi', 'ii moving to IV'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'A Perfect Authentic Cadence (V - I) gives the strongest sensation of finality and resolution.'
  },
  {
    id: 173,
    question: 'What is a "Deceptive Cadence" (or Interrupted Cadence)?',
    options: ['The dominant chord (V) resolves unexpectedly to a chord other than the tonic (usually vi)', 'V resolves to I as expected', 'IV resolves to I', 'Music stops entirely'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'A deceptive cadence surprises the listener by moving from V to vi instead of resolving to I.'
  },
  {
    id: 174,
    question: 'What is a "Half Cadence"?',
    options: ['A cadence that pauses on the Dominant chord (V), sounding incomplete and open-ended', 'A cadence ending on I', 'A cadence that lasts half a second', 'A silent bar'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'A Half Cadence ends on the Dominant (V), creating anticipation for a continuation.'
  },
  {
    id: 175,
    question: 'What is a "Passacaglia"?',
    options: ['A musical form based on a continuous repeating ground bass ostinato in triple meter', 'A short single-verse chant', 'A type of organ pedal', 'A choral seating arrangement'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'A Passacaglia is a variation form built upon a repeating baseline theme.'
  },

  // --- COMPOSERS & HISTORY (176-200) ---
  {
    id: 176,
    question: 'Who composed the famous sacred oratorio "Messiah", which includes the "Hallelujah Chorus"?',
    options: ['George Frideric Handel', 'Johann Sebastian Bach', 'Wolfgang Amadeus Mozart', 'Ludwig van Beethoven'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'G.F. Handel composed Messiah in 1741 in just 24 days.'
  },
  {
    id: 177,
    question: 'Which master of the Baroque period composed the "Mass in B Minor" and "St. Matthew Passion"?',
    options: ['Johann Sebastian Bach', 'Antonio Vivaldi', 'Franz Joseph Haydn', 'Johannes Brahms'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'J.S. Bach (1685–1750) is widely considered the supreme master of Baroque polyphony and sacred choral works.'
  },
  {
    id: 178,
    question: 'Who composed the renowned "Ave Verum Corpus" (K. 618) and the unfinished "Requiem in D Minor"?',
    options: ['Wolfgang Amadeus Mozart', 'Felix Mendelssohn', 'Franz Schubert', 'Claudio Monteverdi'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'W.A. Mozart composed Ave Verum Corpus and his celebrated Requiem in 1791, the final year of his life.'
  },
  {
    id: 179,
    question: 'Who composed the choral masterpiece "Elijah" and the famous carol setting "Hark! The Herald Angels Sing"?',
    options: ['Felix Mendelssohn', 'Robert Schumann', 'Gabriel Fauré', 'Anton Bruckner'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'Felix Mendelssohn composed the oratorio Elijah and the melody adapted for "Hark! The Herald Angels Sing".'
  },
  {
    id: 180,
    question: 'Which Italian Renaissance composer is famous for the "Missa Papae Marcelli" (Pope Marcellus Mass)?',
    options: ['Giovanni Pierluigi da Palestrina', 'Claudio Monteverdi', 'Tomas Luis de Victoria', 'William Byrd'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'Palestrina is the epitome of pure Renaissance polyphony, famous for Missa Papae Marcelli.'
  },
  {
    id: 181,
    question: 'Which English Renaissance composer wrote "Ave Verum Corpus" and "Sing Joyfully"?',
    options: ['William Byrd', 'Thomas Tallis', 'Henry Purcell', 'John Rutter'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'William Byrd (c. 1540–1623) was England’s greatest Renaissance composer of both Latin and English church music.'
  },
  {
    id: 182,
    question: 'Who composed the famous 40-part motet "Spem in alium"?',
    options: ['Thomas Tallis', 'William Byrd', 'Orlando Gibbons', 'John Dowland'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'Thomas Tallis wrote the monumental 40-voice Renaissance motet "Spem in alium" around 1570.'
  },
  {
    id: 183,
    question: 'Who composed the gentle, beloved "Requiem in D minor, Op. 48" featuring the movement "Pie Jesu"?',
    options: ['Gabriel Fauré', 'Giuseppe Verdi', 'Hector Berlioz', 'Maurice Duruflé'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'Gabriel Fauré’s Requiem is celebrated for its serene, comforting, and lyrical quality.'
  },
  {
    id: 184,
    question: 'Which German Romantic composer wrote "A German Requiem" (Ein deutsches Requiem)?',
    options: ['Johannes Brahms', 'Richard Wagner', 'Gustav Mahler', 'Robert Schumann'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'Johannes Brahms set German biblical texts rather than the traditional Latin liturgy for his German Requiem.'
  },
  {
    id: 185,
    question: 'Which Italian opera master composed a thrilling, dramatic "Messa da Requiem" featuring the thunderous "Dies Irae"?',
    options: ['Giuseppe Verdi', 'Giacomo Puccini', 'Gioachino Rossini', 'Gaetano Donizetti'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'Verdi’s Requiem (1874) is famous for its operatic drama and ferocious Dies Irae.'
  },
  {
    id: 186,
    question: 'Which famous contemporary English composer wrote "Gloria", "Requiem", and "The Lord Bless You and Keep You"?',
    options: ['John Rutter', 'Eric Whitacre', 'Benjamin Britten', 'Ralph Vaughan Williams'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'John Rutter is one of the most prolific and beloved modern choral composers.'
  },
  {
    id: 187,
    question: 'Which contemporary American composer is known for choral works like "Lux Aurumque", "Sleep", and the Virtual Choir?',
    options: ['Eric Whitacre', 'Morten Lauridsen', 'Ola Gjeilo', 'Dan Forrest'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'Eric Whitacre is world-renowned for his lush cluster harmonies and pioneering Virtual Choir projects.'
  },
  {
    id: 188,
    question: 'Which contemporary composer wrote the beloved choral setting "O Magnum Mysterium" (1994)?',
    options: ['Morten Lauridsen', 'John Tavener', 'Arvo Pärt', 'Philip Glass'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'Morten Lauridsen’s "O Magnum Mysterium" is one of the most performed modern choral masterworks.'
  },
  {
    id: 189,
    question: 'Which Estonian composer is famous for creating the "tintinnabuli" style of sacred minimalism in works like "Magnificat"?',
    options: ['Arvo Pärt', 'Krzysztof Penderecki', 'Henryk Górecki', 'György Ligeti'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'Arvo Pärt developed tintinnabuli, inspired by bell-like sonorities and early Gregorian chant.'
  },
  {
    id: 190,
    question: 'Which Baroque composer wrote the "Gloria in D Major" (RV 589) and "The Four Seasons"?',
    options: ['Antonio Vivaldi', 'Arcangelo Corelli', 'Domenico Scarlatti', 'Georg Philipp Telemann'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'Antonio Vivaldi ("The Red Priest") composed the uplifting Gloria in D Major.'
  },
  {
    id: 191,
    question: 'Which 20th-century English composer wrote "A Ceremony of Carols" and the "War Requiem"?',
    options: ['Benjamin Britten', 'Edward Elgar', 'Gustav Holst', 'William Walton'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'Benjamin Britten wrote A Ceremony of Carols for treble choir and harp in 1942.'
  },
  {
    id: 192,
    question: 'Who composed the choral anthem "Zadok the Priest", sung at every British royal coronation since 1727?',
    options: ['George Frideric Handel', 'Henry Purcell', 'Thomas Arne', 'William Croft'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'Handel composed "Zadok the Priest" for the coronation of King George II in 1727.'
  },
  {
    id: 193,
    question: 'Which composer integrated Schiller’s "Ode to Joy" into the finale of his Ninth Symphony?',
    options: ['Ludwig van Beethoven', 'Franz Schubert', 'Robert Schumann', 'Antonín Dvořák'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'Beethoven’s 9th Symphony was the first major symphony to incorporate a large choir and vocal soloists.'
  },
  {
    id: 194,
    question: 'What musical period spanned approximately 1600 to 1750, ending with the death of J.S. Bach?',
    options: ['The Baroque Period', 'The Classical Period', 'The Renaissance Period', 'The Romantic Period'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'The Baroque era in music is conventionally dated from roughly 1600 to 1750.'
  },
  {
    id: 195,
    question: 'What musical era (approx. 1750 to 1820) was defined by balance, clarity, and masters like Haydn, Mozart, and early Beethoven?',
    options: ['The Classical Period', 'The Baroque Period', 'The Romantic Period', 'The Medieval Period'],
    correctIndex: 0,
    category: 'Composers & History',
    explanation: 'The Classical era emphasized structural clarity, balanced proportions, and tonal elegance.'
  },

  // --- CONDUCTING & PERFORMANCE (196-215) ---
  {
    id: 196,
    question: 'In standard choral conducting, in which direction does the "Downbeat" (Beat 1) always move?',
    options: ['Straight downward', 'Straight upward', 'To the right', 'To the left'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: 'The first beat (Downbeat) of any conducting pattern always moves decisively straight down.'
  },
  {
    id: 197,
    question: 'In a standard 4/4 conducting pattern, what are the four beat directions?',
    options: ['1: Down, 2: Inward/Left, 3: Outward/Right, 4: Up', '1: Up, 2: Down, 3: Left, 4: Right', '1: Down, 2: Right, 3: Left, 4: Up', '1: Out, 2: In, 3: Down, 4: Up'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: 'Standard 4/4 conducting pattern moves Down (1), In (2), Out (3), and Up (4).'
  },
  {
    id: 198,
    question: 'In a standard 3/4 conducting pattern (like a waltz), what are the beat directions?',
    options: ['1: Down, 2: Out/Right, 3: Up', '1: Up, 2: Down, 3: Out', '1: Down, 2: In, 3: Out', '1: Down, 2: Down, 3: Up'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: 'In 3/4 time, the conductor beats Down (1), Out to the right (2), and rebound Up (3).'
  },
  {
    id: 199,
    question: 'In a 2/4 conducting pattern, what are the two motions?',
    options: ['1: Down and rebound inward, 2: Up', '1: Right, 2: Left', '1: Up, 2: Down', '1: Circle, 2: Line'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: 'A two-beat pattern drops down (1) and rebounds upward (2).'
  },
  {
    id: 200,
    question: 'What is the "Ictus" in conducting technique?',
    options: ['The precise visual point/instant in the conducting gesture where the beat occurs', 'The conductor’s stick', 'The stand holding sheet music', 'The tempo clock'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: 'The ictus is the exact instant of rebound in the conductor’s gesture that defines the beat.'
  },
  {
    id: 201,
    question: 'What is a "Preparatory Beat" (Prep beat) in choral conducting?',
    options: ['The beat given immediately prior to the first entrance, indicating tempo, dynamic, mood, and breath', 'The final cut-off', 'The warmup song', 'The bell before service'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: 'The preparatory beat gives the choir all necessary information (tempo, volume, character) to breathe and begin together.'
  },
  {
    id: 202,
    question: 'What is a "Cut-Off" gesture in conducting?',
    options: ['A clear gesture used by the conductor to stop sound cleanly and simultaneously', 'Skipping a verse', 'Dismissing a singer', 'Turning off the microphone'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: 'A release or cut-off gesture indicates the precise moment for all voices to end the sound together.'
  },
  {
    id: 203,
    question: 'What is the standard concert pitch frequency used for tuning (Concert A above Middle C)?',
    options: ['A = 440 Hz', 'A = 500 Hz', 'A = 320 Hz', 'A = 250 Hz'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: 'Standard modern international concert pitch sets A4 at 440 Hz.'
  },
  {
    id: 204,
    question: 'What does "Transposition" mean in music?',
    options: ['Shifting an entire piece or section of music up or down to a different key', 'Translating lyrics to another language', 'Rearranging choir seating', 'Switching from piano to organ'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: 'Transposition is rewriting or performing a piece of music in a different key from the original.'
  },
  {
    id: 205,
    question: 'What does "A due" (or "a 2") mean in a choral or orchestral score?',
    options: ['Two parts/players to perform the same line together in unison', 'Split in half', 'Play twice as loud', 'Take two breaths'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: '"A due" indicates that two performers or sections should play/sing the indicated part in unison.'
  },
  {
    id: 206,
    question: 'What is an "Appoggiatura"?',
    options: ['A musical ornament consisting of an accented non-harmonic pitch that resolves to a main harmonic note', 'A quick breath', 'A foot pedal', 'A long choral chord'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: 'An appoggiatura is an accented grace note/dissonance that resolves stepwise into the chord.'
  },
  {
    id: 207,
    question: 'What is a "Glissando"?',
    options: ['A continuous smooth slide from one pitch to another', 'A sharp staccato accent', 'A silent pause', 'A chord played in reverse'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: 'A glissando is an unbroken slide through intermediate frequencies from one note to another.'
  },
  {
    id: 208,
    question: 'What is "Baton" in music?',
    options: ['The lightweight stick used by a conductor to show meter, beat, and expression', 'A brass horn', 'A percussion mallet', 'A choir banner'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: 'A baton is a tapered wand used by orchestral and choral conductors to enhance gesture visibility.'
  },
  {
    id: 209,
    question: 'What is "Messa di Voce"?',
    options: ['A classical vocal technique involving a gradual crescendo followed by a decrescendo on a single sustained note', 'Singing only the mass text', 'A deep speaking voice', 'A choir warmup in fifths'],
    correctIndex: 0,
    category: 'Conducting & Performance',
    explanation: '"Messa di voce" is the advanced art of swelling from pianissimo to fortissimo and back to pianissimo on one steady pitch.'
  },
  {
    id: 210,
    question: 'What is an "Interval" in music theory?',
    options: ['The difference in pitch between two notes', 'The intermission between concert halves', 'The distance between two singers', 'The thickness of a sheet of music'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'An interval measures the distance in pitch between two musical tones.'
  },
  {
    id: 211,
    question: 'What is a "Tritone"?',
    options: ['An interval of three whole tones (augmented fourth or diminished fifth), dividing the octave exactly in half', 'A chord with three notes', 'A choir of three voices', 'A three-part song'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A tritone spans 6 semitones (3 whole steps), historically nicknamed "diabolus in musica".'
  },
  {
    id: 212,
    question: 'What is a "Hemiola"?',
    options: ['A rhythmic device where three beats of equal value are played in the time normally occupied by two (e.g. feeling 3:2 across bar lines)', 'A brass instrument', 'A 6-line music staff', 'A half-sung prayer'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: 'A hemiola temporarily creates the sensation of three beats across two bars of triple meter.'
  },
  {
    id: 213,
    question: 'What does "Da Capo" (D.C.) literally translate to from Italian?',
    options: ['From the head / from the beginning', 'From the sign', 'To the end', 'With the choir'],
    correctIndex: 0,
    category: 'Music Theory & Notation',
    explanation: '"Capo" means head; "Da Capo" means starting over from the very top/head of the piece.'
  },
  {
    id: 214,
    question: 'What is a "Doxology"?',
    options: ['A short liturgical formula or hymn of praise to God, such as the "Gloria Patri"', 'A list of choir members', 'A musical scale', 'A book of organ preludes'],
    correctIndex: 0,
    category: 'Sacred & Choral Forms',
    explanation: 'A doxology is an expression of glory and praise to the Holy Trinity (Father, Son, and Holy Spirit).'
  },
  {
    id: 215,
    question: 'What does "Alla marcia" mean?',
    options: ['In the style of a march', 'In the style of a dance', 'Very softly', 'Without rhythm'],
    correctIndex: 0,
    category: 'Tempo & Markings',
    explanation: '"Alla marcia" indicates performing with the crisp, stately rhythm of a march.'
  }
];
