export type QuestionDifficulty = "easy" | "medium" | "hard";

export type LocalQuestion = {
  id: string;
  subjectId: string;
  topic: string;
  difficulty: QuestionDifficulty;
  stem: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type SubjectBank = {
  id: string;
  title: string;
  description: string;
  focus: string;
  questions: LocalQuestion[];
  difficultyCounts: Record<QuestionDifficulty, number>;
};

type Fact = {
  id: string;
  category: string;
  prompt: string;
  answer: string;
  distractors: [string, string, string];
  explanation: string;
};

type SubjectSeed = {
  id: string;
  title: string;
  description: string;
  focus: string;
  facts: Fact[];
};

type Template = {
  id: string;
  difficulty: QuestionDifficulty;
  buildStem: (fact: Fact, subject: SubjectSeed) => string;
};

const templates: Template[] = [
  { id: "e1", difficulty: "easy", buildStem: (fact) => fact.prompt },
  {
    id: "e2",
    difficulty: "easy",
    buildStem: (fact, subject) => `Which answer correctly completes this ${subject.title} flashcard: ${fact.prompt}`,
  },
  { id: "e3", difficulty: "easy", buildStem: (fact) => `Choose the right answer for this quick-check item: ${fact.prompt}` },
  {
    id: "e4",
    difficulty: "easy",
    buildStem: (fact, subject) =>
      `A learner is revising ${subject.focus}. Which option answers this question correctly: ${fact.prompt}`,
  },
  { id: "e5", difficulty: "easy", buildStem: (fact) => `Pick the best answer for the prompt below: ${fact.prompt}` },
  {
    id: "m1",
    difficulty: "medium",
    buildStem: (fact, subject) =>
      `Your ${subject.title} notes mention ${fact.category}. Which option keeps this prompt accurate: ${fact.prompt}`,
  },
  {
    id: "m2",
    difficulty: "medium",
    buildStem: (fact) => `A teacher is building a medium-level quiz. Which answer should be accepted for: ${fact.prompt}`,
  },
  {
    id: "m3",
    difficulty: "medium",
    buildStem: (fact) => `During revision, one option would score full marks for this item. Which one fits: ${fact.prompt}`,
  },
  {
    id: "m4",
    difficulty: "medium",
    buildStem: (fact, subject) => `Which option belongs on a study card for ${subject.focus} when the prompt is: ${fact.prompt}`,
  },
  {
    id: "m5",
    difficulty: "medium",
    buildStem: (fact) => `If you eliminate the distractors carefully, which answer remains for: ${fact.prompt}`,
  },
  {
    id: "h1",
    difficulty: "hard",
    buildStem: (fact) => `A peer gives four answers to this prompt. Which answer survives strict review: ${fact.prompt}`,
  },
  {
    id: "h2",
    difficulty: "hard",
    buildStem: (fact, subject) =>
      `In an advanced ${subject.title} round, which answer preserves the factual meaning of this prompt: ${fact.prompt}`,
  },
  {
    id: "h3",
    difficulty: "hard",
    buildStem: (fact) => `An examiner wants the most precise answer. Which option is correct for: ${fact.prompt}`,
  },
  {
    id: "h4",
    difficulty: "hard",
    buildStem: (fact) => `Choose the answer that would keep an advanced revision card correct: ${fact.prompt}`,
  },
  {
    id: "h5",
    difficulty: "hard",
    buildStem: (fact, subject) =>
      `Which response should an expert learner lock in for this ${subject.focus} prompt: ${fact.prompt}`,
  },
];

function rotateOptions(options: string[], shift: number): string[] {
  const safeShift = ((shift % options.length) + options.length) % options.length;
  return options.map((_, index) => options[(index + safeShift) % options.length]);
}

function buildQuestions(subject: SubjectSeed): LocalQuestion[] {
  return subject.facts.flatMap((fact, factIndex) =>
    templates.map((template, templateIndex) => {
      const baseOptions = [fact.answer, ...fact.distractors];
      const options = rotateOptions(baseOptions, (factIndex + templateIndex) % baseOptions.length);
      return {
        id: `${subject.id}_${fact.id}_${template.id}`,
        subjectId: subject.id,
        topic: fact.category,
        difficulty: template.difficulty,
        stem: template.buildStem(fact, subject),
        options,
        answerIndex: options.indexOf(fact.answer),
        explanation: fact.explanation,
      } satisfies LocalQuestion;
    })
  );
}

function countByDifficulty(questions: LocalQuestion[]): Record<QuestionDifficulty, number> {
  return questions.reduce(
    (accumulator, question) => {
      accumulator[question.difficulty] += 1;
      return accumulator;
    },
    { easy: 0, medium: 0, hard: 0 } as Record<QuestionDifficulty, number>
  );
}

const subjectSeeds: SubjectSeed[] = [
  {
    id: "mathematics",
    title: "Mathematics Mastery",
    description: "Arithmetic, algebra, geometry, statistics, and core problem-solving.",
    focus: "mathematical reasoning",
    facts: [
      { id: "f01", category: "numbers", prompt: "Which value is the common decimal approximation of pi?", answer: "3.14159", distractors: ["2.71828", "1.61803", "4.66920"], explanation: "Pi is commonly approximated as 3.14159 in mathematics." },
      { id: "f02", category: "geometry", prompt: "What is the formula for the area of a circle?", answer: "pi r squared", distractors: ["2 pi r", "length times width", "one half base times height"], explanation: "The area of a circle is pi multiplied by the square of the radius." },
      { id: "f03", category: "geometry", prompt: "Which theorem states that a squared plus b squared equals c squared in a right triangle?", answer: "Pythagorean theorem", distractors: ["Binomial theorem", "Fundamental theorem of calculus", "Remainder theorem"], explanation: "The Pythagorean theorem relates the sides of a right triangle." },
      { id: "f04", category: "graphs", prompt: "What does slope measure on a straight-line graph?", answer: "change in y divided by change in x", distractors: ["x plus y", "area under the curve", "distance from the origin"], explanation: "Slope is calculated as rise over run, or change in y divided by change in x." },
      { id: "f05", category: "percentages", prompt: "What decimal is equal to 25 percent?", answer: "0.25", distractors: ["2.5", "25.0", "0.025"], explanation: "To convert a percent to a decimal, divide by 100. 25 percent becomes 0.25." },
      { id: "f06", category: "statistics", prompt: "How do you calculate the arithmetic mean of a set of numbers?", answer: "sum of the values divided by the number of values", distractors: ["largest value minus smallest value", "middle value only", "product of all values"], explanation: "The mean equals the total sum divided by how many values are present." },
      { id: "f07", category: "algebra", prompt: "What is the standard goal when solving a linear equation?", answer: "isolate the variable", distractors: ["square every term", "remove the constant only", "convert everything to fractions"], explanation: "Solving a linear equation means isolating the unknown variable." },
      { id: "f08", category: "algebra", prompt: "What happens to exponents when you multiply powers with the same base?", answer: "you add the exponents", distractors: ["you subtract the exponents", "you multiply the exponents", "you keep only the larger exponent"], explanation: "For the same base, multiplying powers means adding the exponents." },
      { id: "f09", category: "numbers", prompt: "What makes a prime number prime?", answer: "it has exactly two factors", distractors: ["it is always odd", "it is greater than 100", "it ends in 1 or 9"], explanation: "A prime number has exactly two factors: 1 and itself." },
      { id: "f10", category: "algebra", prompt: "What formula is commonly used to solve a quadratic equation?", answer: "x equals negative b plus or minus square root of b squared minus 4ac over 2a", distractors: ["distance equals rate times time", "area equals pi r squared", "slope equals y one plus y two"], explanation: "The quadratic formula gives the roots of a quadratic equation." },
      { id: "f11", category: "geometry", prompt: "What is the area formula for a rectangle?", answer: "length times width", distractors: ["base plus height", "2 pi r", "one half perimeter"], explanation: "Rectangle area is calculated by multiplying length by width." },
      { id: "f12", category: "probability", prompt: "How is basic probability calculated?", answer: "favorable outcomes divided by total outcomes", distractors: ["total outcomes divided by favorable outcomes", "sum of the outcomes only", "difference between two outcomes"], explanation: "Probability compares favorable outcomes to the total possible outcomes." },
      { id: "f13", category: "ratios", prompt: "What does a ratio compare?", answer: "two quantities of the same kind", distractors: ["two unrelated stories", "only time and distance", "an angle and a line"], explanation: "A ratio compares two quantities, often written with a colon or fraction." },
      { id: "f14", category: "calculus", prompt: "What is the derivative of a constant?", answer: "0", distractors: ["1", "the constant itself", "undefined in every case"], explanation: "The derivative of any constant value is zero." },
      { id: "f15", category: "statistics", prompt: "What is the median of an ordered data set?", answer: "the middle value", distractors: ["the sum of all values", "the most repeated value only", "the difference between extremes"], explanation: "The median is the middle value once the data is arranged in order." },
    ],
  },
  {
    id: "physics",
    title: "Physics Explorer",
    description: "Motion, force, electricity, energy, waves, and core physical laws.",
    focus: "physical science",
    facts: [
      { id: "f01", category: "mechanics", prompt: "What is the SI unit of force?", answer: "newton", distractors: ["joule", "watt", "pascal"], explanation: "Force is measured in newtons in the SI system." },
      { id: "f02", category: "motion", prompt: "How is speed calculated?", answer: "distance divided by time", distractors: ["time divided by distance", "distance plus time", "mass divided by time"], explanation: "Speed equals total distance traveled divided by total time taken." },
      { id: "f03", category: "motion", prompt: "How is acceleration defined?", answer: "change in velocity divided by time", distractors: ["distance divided by force", "mass times time", "time divided by speed"], explanation: "Acceleration measures how quickly velocity changes over time." },
      { id: "f04", category: "laws", prompt: "Which concept is central to Newton's first law?", answer: "inertia", distractors: ["refraction", "radioactivity", "capillarity"], explanation: "Newton's first law is also called the law of inertia." },
      { id: "f05", category: "electricity", prompt: "What is Ohm's law?", answer: "voltage equals current times resistance", distractors: ["power equals mass times acceleration", "speed equals distance over time", "pressure equals force over area"], explanation: "Ohm's law relates voltage, current, and resistance as V equals IR." },
      { id: "f06", category: "energy", prompt: "What is the SI unit of power?", answer: "watt", distractors: ["tesla", "candela", "newton"], explanation: "Power is measured in watts." },
      { id: "f07", category: "forces", prompt: "Which is a non-contact force?", answer: "magnetic force", distractors: ["friction", "normal force", "tension"], explanation: "Magnetic force can act without direct contact." },
      { id: "f08", category: "optics", prompt: "Which lens is used in a magnifying glass?", answer: "convex lens", distractors: ["concave lens", "plane mirror", "prism only"], explanation: "Magnifying glasses use convex lenses to enlarge nearby objects." },
      { id: "f09", category: "waves", prompt: "Why can sound not travel in a vacuum?", answer: "it needs a material medium", distractors: ["it is always reflected away", "its color disappears", "gravity blocks it"], explanation: "Sound is a mechanical wave and needs matter to travel through." },
      { id: "f10", category: "mechanics", prompt: "How is momentum calculated?", answer: "mass times velocity", distractors: ["force divided by area", "energy times time", "distance divided by acceleration"], explanation: "Momentum is the product of mass and velocity." },
      { id: "f11", category: "optics", prompt: "What does the law of reflection state?", answer: "angle of incidence equals angle of reflection", distractors: ["all light is absorbed", "reflected light always speeds up", "angle of incidence is always zero"], explanation: "The angle of incidence and the angle of reflection are equal." },
      { id: "f12", category: "gravity", prompt: "What does Earth's gravity do to unsupported objects?", answer: "pulls them toward Earth", distractors: ["pushes them into space", "removes their mass", "changes them into energy"], explanation: "Gravity attracts objects toward the center of the Earth." },
      { id: "f13", category: "energy", prompt: "What does the law of conservation of energy say?", answer: "energy cannot be created or destroyed", distractors: ["energy appears from nothing", "energy has no units", "energy never changes form"], explanation: "Energy can change form, but the total amount is conserved." },
      { id: "f14", category: "waves", prompt: "What is the SI unit of frequency?", answer: "hertz", distractors: ["watt", "ampere", "kelvin"], explanation: "Frequency is measured in hertz, meaning cycles per second." },
      { id: "f15", category: "electricity", prompt: "What is the SI unit of electric current?", answer: "ampere", distractors: ["ohm", "watt", "volt per second"], explanation: "Electric current is measured in amperes." },
    ],
  },
  {
    id: "chemistry",
    title: "Chemistry Lab",
    description: "Atoms, reactions, acids and bases, matter, and core chemical ideas.",
    focus: "chemical science",
    facts: [
      { id: "f01", category: "atomic structure", prompt: "What is the smallest unit of an element that retains its identity?", answer: "atom", distractors: ["molecule", "compound", "solution"], explanation: "An atom is the smallest unit of an element." },
      { id: "f02", category: "acids and bases", prompt: "What is the pH of a neutral solution at room temperature?", answer: "7", distractors: ["0", "4", "14"], explanation: "A neutral solution has a pH of 7." },
      { id: "f03", category: "compounds", prompt: "What is the chemical formula for water?", answer: "H2O", distractors: ["CO2", "NaCl", "O2"], explanation: "Water contains two hydrogen atoms and one oxygen atom, written as H2O." },
      { id: "f04", category: "periodic table", prompt: "How is the modern periodic table arranged?", answer: "by increasing atomic number", distractors: ["by color", "by melting point only", "alphabetically by symbol"], explanation: "Elements are arranged by increasing atomic number in the modern periodic table." },
      { id: "f05", category: "acids and bases", prompt: "What change happens to blue litmus in an acid?", answer: "it turns red", distractors: ["it turns green", "it turns black", "nothing ever changes"], explanation: "Acids turn blue litmus paper red." },
      { id: "f06", category: "acids and bases", prompt: "What change happens to red litmus in a base?", answer: "it turns blue", distractors: ["it turns orange", "it turns silver", "it disappears completely"], explanation: "Bases turn red litmus paper blue." },
      { id: "f07", category: "compounds", prompt: "What is the formula for common salt, sodium chloride?", answer: "NaCl", distractors: ["KClO3", "H2SO4", "CaCO3"], explanation: "Sodium chloride is represented by the formula NaCl." },
      { id: "f08", category: "reactions", prompt: "What does a catalyst do in a chemical reaction?", answer: "speeds up the reaction without being consumed", distractors: ["stops the reaction forever", "changes every reactant into metal", "removes all products instantly"], explanation: "A catalyst increases reaction rate and is not used up in the process." },
      { id: "f09", category: "states of matter", prompt: "From where does evaporation take place in a liquid?", answer: "from the surface", distractors: ["only from the center", "only from the bottom", "from solid particles only"], explanation: "Evaporation occurs at the surface of a liquid." },
      { id: "f10", category: "solutions", prompt: "Which substance is commonly called the universal solvent?", answer: "water", distractors: ["oxygen", "helium", "graphite"], explanation: "Water dissolves many substances and is often called the universal solvent." },
      { id: "f11", category: "energy changes", prompt: "What type of reaction releases heat to the surroundings?", answer: "exothermic reaction", distractors: ["endothermic reaction", "neutral reaction", "silent reaction"], explanation: "Exothermic reactions release heat to the surroundings." },
      { id: "f12", category: "reactions", prompt: "Rusting is a common example of which process?", answer: "oxidation", distractors: ["condensation", "sublimation", "distillation"], explanation: "Rusting involves oxidation of iron." },
      { id: "f13", category: "bonding", prompt: "What does valency describe?", answer: "the combining capacity of an atom", distractors: ["the temperature of an atom", "the color of an atom", "the age of an element"], explanation: "Valency tells how many bonds an atom can form." },
      { id: "f14", category: "atomic structure", prompt: "Which particles are found together in the nucleus?", answer: "protons and neutrons", distractors: ["electrons and photons", "atoms and ions", "molecules and ions"], explanation: "The nucleus contains protons and neutrons." },
      { id: "f15", category: "elements", prompt: "What is the molecular formula for oxygen gas?", answer: "O2", distractors: ["O", "O3 only", "H2O"], explanation: "Oxygen in the air is present mainly as the diatomic molecule O2." },
    ],
  },
  {
    id: "biology",
    title: "Biology Systems",
    description: "Cells, organs, plants, heredity, ecosystems, and human biology.",
    focus: "life science",
    facts: [
      { id: "f01", category: "cells", prompt: "What is the basic unit of life?", answer: "cell", distractors: ["atom", "organ", "ecosystem"], explanation: "The cell is the fundamental structural and functional unit of life." },
      { id: "f02", category: "plants", prompt: "In which cell structure does photosynthesis mainly occur?", answer: "chloroplast", distractors: ["nucleus", "ribosome", "vacuole wall"], explanation: "Photosynthesis mainly occurs in chloroplasts containing chlorophyll." },
      { id: "f03", category: "human body", prompt: "Which organ pumps blood throughout the body?", answer: "heart", distractors: ["liver", "stomach", "pancreas"], explanation: "The heart acts as the pump of the circulatory system." },
      { id: "f04", category: "human body", prompt: "Which organs are primarily responsible for gas exchange in humans?", answer: "lungs", distractors: ["kidneys", "bones", "skin"], explanation: "Gas exchange takes place mainly in the lungs." },
      { id: "f05", category: "plants", prompt: "Which plant tissue carries water from the roots upward?", answer: "xylem", distractors: ["phloem", "epidermis", "cambium only"], explanation: "Xylem transports water and minerals from the roots." },
      { id: "f06", category: "genetics", prompt: "Which molecule carries genetic information in living organisms?", answer: "DNA", distractors: ["ATP", "chlorophyll", "starch"], explanation: "DNA stores hereditary information." },
      { id: "f07", category: "human body", prompt: "How many bones are in the typical adult human body?", answer: "206", distractors: ["180", "250", "312"], explanation: "An adult human skeleton typically contains 206 bones." },
      { id: "f08", category: "blood", prompt: "Which blood component helps in clotting?", answer: "platelets", distractors: ["red blood cells", "neurons", "bile salts"], explanation: "Platelets help blood clot and stop bleeding." },
      { id: "f09", category: "cells", prompt: "Which organelle is often called the powerhouse of the cell?", answer: "mitochondrion", distractors: ["golgi body", "lysosome", "cell wall"], explanation: "Mitochondria produce much of the cell's usable energy." },
      { id: "f10", category: "plants", prompt: "What structures on leaves help exchange gases with the air?", answer: "stomata", distractors: ["veins", "petals", "pollen grains"], explanation: "Stomata are tiny pores on leaves used for gas exchange." },
      { id: "f11", category: "ecology", prompt: "What does a herbivore mainly eat?", answer: "plants", distractors: ["rocks", "only insects", "metal salts"], explanation: "Herbivores feed mainly on plants." },
      { id: "f12", category: "ecology", prompt: "What does an ecosystem include?", answer: "living and non-living components interacting together", distractors: ["only animals", "only soil and air", "only microscopic organisms"], explanation: "An ecosystem includes organisms and their physical environment interacting together." },
      { id: "f13", category: "reproduction", prompt: "What is pollination?", answer: "transfer of pollen from anther to stigma", distractors: ["formation of roots", "breaking down food", "release of oxygen from lungs"], explanation: "Pollination transfers pollen to enable fertilization in flowering plants." },
      { id: "f14", category: "health", prompt: "What is the purpose of a vaccine?", answer: "to help the immune system prepare against disease", distractors: ["to replace oxygen in blood", "to increase bone length immediately", "to stop digestion"], explanation: "Vaccines train the immune system to recognize harmful pathogens." },
      { id: "f15", category: "human body", prompt: "Which organs filter blood and help form urine?", answer: "kidneys", distractors: ["lungs", "eyes", "gallbladder"], explanation: "The kidneys filter blood and remove waste in urine." },
    ],
  },
  {
    id: "english",
    title: "English Expression",
    description: "Grammar, vocabulary, comprehension, punctuation, and language use.",
    focus: "language skills",
    facts: [
      { id: "f01", category: "grammar", prompt: "What does a noun name?", answer: "a person, place, thing, or idea", distractors: ["only an action", "only a question", "only punctuation"], explanation: "A noun names a person, place, thing, or idea." },
      { id: "f02", category: "grammar", prompt: "What does a verb show?", answer: "an action or state", distractors: ["a color only", "a paragraph break", "a page number"], explanation: "A verb shows action or a state of being." },
      { id: "f03", category: "grammar", prompt: "What does an adjective describe?", answer: "a noun or pronoun", distractors: ["only another adjective", "a punctuation mark", "a chapter heading"], explanation: "Adjectives describe nouns or pronouns." },
      { id: "f04", category: "grammar", prompt: "What does an adverb usually modify?", answer: "a verb, adjective, or another adverb", distractors: ["only a noun", "a page margin", "a title page"], explanation: "Adverbs often modify verbs, adjectives, or other adverbs." },
      { id: "f05", category: "vocabulary", prompt: "Which word is a synonym of accurate?", answer: "precise", distractors: ["careless", "ancient", "silent"], explanation: "Precise is a synonym of accurate." },
      { id: "f06", category: "vocabulary", prompt: "Which word is an antonym of expand?", answer: "contract", distractors: ["increase", "stretch", "multiply"], explanation: "Contract is the opposite of expand." },
      { id: "f07", category: "grammar", prompt: "What verb form usually matches he or she in the simple present tense?", answer: "a verb that often ends in s", distractors: ["always the plural form", "the past participle only", "no verb at all"], explanation: "In simple present tense, third-person singular subjects often take a verb ending in s." },
      { id: "f08", category: "grammar", prompt: "What is the past tense of go?", answer: "went", distractors: ["goed", "gone is the simple past", "goes"], explanation: "Went is the correct simple past form of go." },
      { id: "f09", category: "literary devices", prompt: "What is a metaphor?", answer: "a direct comparison without using like or as", distractors: ["a list of synonyms only", "a question asked for homework", "a punctuation rule"], explanation: "A metaphor compares two things directly without using like or as." },
      { id: "f10", category: "literary devices", prompt: "What is a simile?", answer: "a comparison using like or as", distractors: ["a sentence with no verb", "a story ending", "a change of tense"], explanation: "A simile compares two unlike things using like or as." },
      { id: "f11", category: "writing", prompt: "What does a topic sentence usually do in a paragraph?", answer: "states the main idea", distractors: ["lists every example only", "adds page numbers", "removes the conclusion"], explanation: "A topic sentence introduces the central idea of a paragraph." },
      { id: "f12", category: "punctuation", prompt: "What can an apostrophe show?", answer: "possession or omitted letters", distractors: ["sentence volume", "chapter order only", "font color"], explanation: "An apostrophe is used for possession and contractions." },
      { id: "f13", category: "punctuation", prompt: "Which punctuation mark usually ends a direct question?", answer: "question mark", distractors: ["semicolon", "apostrophe", "hyphen"], explanation: "A question mark is used at the end of a direct question." },
      { id: "f14", category: "grammar", prompt: "What does a pronoun do?", answer: "replaces a noun", distractors: ["always adds punctuation", "measures time", "changes a verb to a noun"], explanation: "Pronouns replace nouns to avoid repetition." },
      { id: "f15", category: "grammar", prompt: "What does a conjunction do?", answer: "joins words, phrases, or clauses", distractors: ["changes singular to plural only", "ends every sentence", "describes only colors"], explanation: "Conjunctions connect words, phrases, or clauses." },
    ],
  },
  {
    id: "computer_science",
    title: "Computer Science",
    description: "Core computing concepts, cybersecurity, internet basics, and digital literacy.",
    focus: "digital literacy",
    facts: [
      { id: "f01", category: "hardware", prompt: "What does CPU stand for?", answer: "central processing unit", distractors: ["computer power utility", "central program user", "control panel upgrade"], explanation: "CPU stands for Central Processing Unit." },
      { id: "f02", category: "memory", prompt: "What type of memory is RAM mainly used for?", answer: "temporary working memory", distractors: ["permanent printed storage", "paper-based backup", "power cable storage"], explanation: "RAM stores data temporarily while programs are running." },
      { id: "f03", category: "software", prompt: "What does an operating system do?", answer: "manages hardware and software resources", distractors: ["only draws pictures", "replaces the internet", "acts as a monitor cable"], explanation: "An operating system manages hardware, files, and running applications." },
      { id: "f04", category: "internet", prompt: "What is a web browser used for?", answer: "accessing websites and web apps", distractors: ["cleaning hardware", "printing electricity", "changing keyboard color only"], explanation: "Web browsers are used to access websites and web-based applications." },
      { id: "f05", category: "problem solving", prompt: "What is an algorithm?", answer: "a step-by-step method for solving a problem", distractors: ["a type of monitor", "an internet password", "a physical storage cabinet"], explanation: "An algorithm is a clear sequence of steps for solving a problem." },
      { id: "f06", category: "cybersecurity", prompt: "What is phishing?", answer: "a fake message meant to steal information", distractors: ["a faster way to charge batteries", "a legal software update", "a keyboard shortcut"], explanation: "Phishing tricks users into revealing passwords or sensitive information." },
      { id: "f07", category: "cybersecurity", prompt: "What is the safest password habit?", answer: "use strong unique passwords", distractors: ["reuse one password everywhere", "share passwords publicly", "write them on the login screen"], explanation: "Strong unique passwords reduce the chance of account compromise." },
      { id: "f08", category: "cloud computing", prompt: "What is cloud storage?", answer: "data stored on remote servers accessed over the internet", distractors: ["water stored in a weather station", "storage inside a printer cable", "files saved only on paper"], explanation: "Cloud storage keeps files on remote servers that can be accessed online." },
      { id: "f09", category: "coding", prompt: "Which digits are used in binary?", answer: "0 and 1", distractors: ["1 and 2", "2 and 3", "5 and 10"], explanation: "Binary is a base-2 system using only 0 and 1." },
      { id: "f10", category: "internet", prompt: "What does a URL identify?", answer: "the address of a web resource", distractors: ["the size of a battery", "the speed of a CPU", "the color of a document"], explanation: "A URL is the address used to locate a resource on the web." },
      { id: "f11", category: "data", prompt: "What does a database do?", answer: "organizes and stores structured information", distractors: ["turns off a computer automatically", "draws graphics only", "replaces every spreadsheet"], explanation: "Databases are designed to organize and store data efficiently." },
      { id: "f12", category: "cybersecurity", prompt: "What is a firewall used for?", answer: "filtering network traffic for security", distractors: ["cooling a processor with water", "making passwords shorter", "printing multiple pages"], explanation: "A firewall filters incoming and outgoing network traffic for protection." },
      { id: "f13", category: "hardware", prompt: "Which is an input device?", answer: "keyboard", distractors: ["monitor", "speaker", "projector"], explanation: "A keyboard is used to enter data into a computer." },
      { id: "f14", category: "hardware", prompt: "Which is an output device?", answer: "monitor", distractors: ["microphone", "scanner", "touchpad"], explanation: "A monitor displays output from a computer." },
      { id: "f15", category: "security", prompt: "What does multi-factor authentication add to login?", answer: "a second verification step", distractors: ["a weaker password", "a second username", "permanent guest access"], explanation: "Multi-factor authentication adds another proof of identity beyond the password." },
    ],
  },
  {
    id: "history",
    title: "History and Heritage",
    description: "Indian history, world turning points, sources, and historical thinking.",
    focus: "historical understanding",
    facts: [
      { id: "f01", category: "ancient history", prompt: "Which ancient civilization is famous for well-planned cities like Harappa and Mohenjo-daro?", answer: "Indus Valley Civilization", distractors: ["Roman Civilization", "Mayan Civilization", "Greek City States"], explanation: "The Indus Valley Civilization is known for carefully planned cities such as Harappa and Mohenjo-daro." },
      { id: "f02", category: "modern India", prompt: "What major uprising against British rule began in 1857?", answer: "the Revolt of 1857", distractors: ["the Quit India Movement", "the Non-Cooperation Movement", "the Swadeshi Movement"], explanation: "The Revolt of 1857 was a major uprising against British rule in India." },
      { id: "f03", category: "civics history", prompt: "When did the Constitution of India come into effect?", answer: "26 January 1950", distractors: ["15 August 1947", "2 October 1948", "26 November 1946"], explanation: "The Constitution of India came into effect on 26 January 1950." },
      { id: "f04", category: "ancient India", prompt: "To which dynasty did Emperor Ashoka belong?", answer: "Maurya dynasty", distractors: ["Gupta dynasty", "Chola dynasty", "Lodi dynasty"], explanation: "Ashoka was one of the most famous rulers of the Maurya dynasty." },
      { id: "f05", category: "freedom struggle", prompt: "Which leader is strongly associated with non-violent resistance in India's freedom struggle?", answer: "Mahatma Gandhi", distractors: ["Alexander the Great", "Napoleon Bonaparte", "Julius Caesar"], explanation: "Mahatma Gandhi led major non-violent movements in India's freedom struggle." },
      { id: "f06", category: "world history", prompt: "In which year did the French Revolution begin?", answer: "1789", distractors: ["1492", "1914", "1945"], explanation: "The French Revolution began in 1789." },
      { id: "f07", category: "world history", prompt: "In which year did World War II end?", answer: "1945", distractors: ["1918", "1939", "1962"], explanation: "World War II ended in 1945." },
      { id: "f08", category: "medieval India", prompt: "Which dynasty did Akbar rule?", answer: "Mughal dynasty", distractors: ["Maurya dynasty", "Sultanate of Mysore", "Maratha Confederacy"], explanation: "Akbar was one of the great Mughal emperors." },
      { id: "f09", category: "historical methods", prompt: "What does an archaeologist study?", answer: "material remains of the past", distractors: ["future weather only", "only poems written today", "stock market charts"], explanation: "Archaeologists study artifacts, structures, and other material remains from the past." },
      { id: "f10", category: "historical methods", prompt: "What is a primary source in history?", answer: "a source created during the time being studied", distractors: ["a random guess about the past", "a textbook summary only", "a fictional story written later"], explanation: "Primary sources come directly from the time or event under study." },
      { id: "f11", category: "industrial history", prompt: "In which country did the Industrial Revolution begin?", answer: "Britain", distractors: ["Japan", "Brazil", "South Africa"], explanation: "The Industrial Revolution began in Britain." },
      { id: "f12", category: "freedom struggle", prompt: "What tax did the Dandi March protest?", answer: "salt tax", distractors: ["railway tax", "book tax", "crop tax only"], explanation: "The Dandi March protested the British salt tax." },
      { id: "f13", category: "archives", prompt: "What is the main role of an archive?", answer: "preserve records and documents", distractors: ["repair roads", "grow crops", "run weather satellites"], explanation: "Archives preserve documents and records for historical reference." },
      { id: "f14", category: "freedom struggle", prompt: "In which city did the Jallianwala Bagh massacre take place?", answer: "Amritsar", distractors: ["Mumbai", "Patna", "Lucknow"], explanation: "The Jallianwala Bagh massacre took place in Amritsar in 1919." },
      { id: "f15", category: "ancient India", prompt: "Which two sites are among the best-known cities of the Indus Valley Civilization?", answer: "Harappa and Mohenjo-daro", distractors: ["Pataliputra and Taxila", "Madurai and Ujjain", "Panipat and Surat"], explanation: "Harappa and Mohenjo-daro are among the most famous Indus Valley sites." },
    ],
  },
  {
    id: "geography",
    title: "Geography Atlas",
    description: "Earth systems, maps, climates, landforms, and Indian geography.",
    focus: "geographical thinking",
    facts: [
      { id: "f01", category: "earth", prompt: "How many continents are there on Earth?", answer: "7", distractors: ["5", "6", "9"], explanation: "There are seven continents on Earth." },
      { id: "f02", category: "oceans", prompt: "Which is the largest ocean on Earth?", answer: "Pacific Ocean", distractors: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], explanation: "The Pacific Ocean is the largest ocean on Earth." },
      { id: "f03", category: "maps", prompt: "What is the latitude of the Equator?", answer: "0 degrees", distractors: ["23.5 degrees north", "90 degrees south", "66.5 degrees north"], explanation: "The Equator lies at 0 degrees latitude." },
      { id: "f04", category: "maps", prompt: "What do lines of longitude help measure?", answer: "east-west position", distractors: ["height above sea level", "daily rainfall only", "soil color"], explanation: "Longitude helps measure east-west position relative to the Prime Meridian." },
      { id: "f05", category: "climate", prompt: "Which process in the water cycle changes liquid water into vapor?", answer: "evaporation", distractors: ["condensation", "freezing", "erosion"], explanation: "Evaporation changes liquid water into water vapor." },
      { id: "f06", category: "India", prompt: "What is the capital city of Madhya Pradesh?", answer: "Bhopal", distractors: ["Indore", "Jabalpur", "Gwalior"], explanation: "Bhopal is the capital of Madhya Pradesh." },
      { id: "f07", category: "landforms", prompt: "On which continent are the Himalayas located?", answer: "Asia", distractors: ["Europe", "Africa", "Australia"], explanation: "The Himalayas are located in Asia." },
      { id: "f08", category: "India", prompt: "Which desert lies mainly in Rajasthan?", answer: "Thar Desert", distractors: ["Sahara Desert", "Gobi Desert", "Kalahari Desert"], explanation: "The Thar Desert lies mainly in Rajasthan, India." },
      { id: "f09", category: "maps", prompt: "What does a map scale show?", answer: "the relationship between map distance and real distance", distractors: ["only the map's paper weight", "the age of the map", "the number of rivers only"], explanation: "A map scale tells how map measurements compare with real-world distances." },
      { id: "f10", category: "climate", prompt: "What is a monsoon?", answer: "a seasonal wind system linked to rainfall changes", distractors: ["a type of mountain", "a kind of ocean current only", "a fixed daily breeze"], explanation: "Monsoons are seasonal wind systems that strongly influence rainfall." },
      { id: "f11", category: "landforms", prompt: "Where does a delta usually form?", answer: "at the mouth of a river", distractors: ["at the mountain summit", "in the center of a desert", "under a glacier only"], explanation: "Deltas usually form where a river meets a larger body of water and deposits sediments." },
      { id: "f12", category: "environment", prompt: "What does the greenhouse effect do?", answer: "traps heat in the atmosphere", distractors: ["freezes all oceans", "stops the Sun from shining", "removes all clouds"], explanation: "The greenhouse effect helps trap heat in Earth's atmosphere." },
      { id: "f13", category: "earth", prompt: "What is a globe?", answer: "a model of Earth", distractors: ["a weather app only", "a type of compass", "a mountain range"], explanation: "A globe is a three-dimensional model of Earth." },
      { id: "f14", category: "earthquakes", prompt: "What movement is mainly responsible for many earthquakes?", answer: "tectonic plate movement", distractors: ["daily tides only", "moonlight changes", "forest growth"], explanation: "Many earthquakes are caused by movement of tectonic plates." },
      { id: "f15", category: "energy", prompt: "Which is a renewable energy source?", answer: "solar energy", distractors: ["coal", "diesel", "natural gas"], explanation: "Solar energy is renewable because sunlight is naturally replenished." },
    ],
  },
  {
    id: "reasoning",
    title: "Logical Reasoning",
    description: "Patterns, sets, sequences, analogies, and quick analytical thinking.",
    focus: "analytical reasoning",
    facts: [
      { id: "f01", category: "numbers", prompt: "What makes a number odd?", answer: "it is not divisible by 2", distractors: ["it is always prime", "it must end in 0", "it is greater than 100"], explanation: "Odd numbers are not divisible evenly by 2." },
      { id: "f02", category: "analogies", prompt: "What does an analogy test?", answer: "the relationship between two pairs", distractors: ["only handwriting", "the weight of words", "weather memory"], explanation: "Analogies test whether you can recognize a similar relationship between two pairs." },
      { id: "f03", category: "sets", prompt: "What does a Venn diagram help show?", answer: "relationships between sets", distractors: ["the color of a map", "the speed of a train", "the mass of an atom"], explanation: "Venn diagrams are used to represent sets and their overlaps." },
      { id: "f04", category: "logic", prompt: "What does a syllogism use to reach a conclusion?", answer: "logical statements or premises", distractors: ["random guessing", "only drawing skills", "weather measurements"], explanation: "Syllogisms use logical premises to determine a conclusion." },
      { id: "f05", category: "patterns", prompt: "What is the next number in the sequence 2, 4, 8, 16, ?", answer: "32", distractors: ["20", "24", "30"], explanation: "Each term doubles, so the next number is 32." },
      { id: "f06", category: "clock reasoning", prompt: "What is the angle between the hour and minute hands at 3:00?", answer: "90 degrees", distractors: ["45 degrees", "120 degrees", "180 degrees"], explanation: "At 3:00, the hands form a right angle of 90 degrees." },
      { id: "f07", category: "alphabets", prompt: "How many letters are there in the English alphabet?", answer: "26", distractors: ["24", "28", "30"], explanation: "The English alphabet contains 26 letters." },
      { id: "f08", category: "ratios", prompt: "If boys and girls are in the ratio 3:5 and the total is 40, how many girls are there?", answer: "25", distractors: ["15", "20", "30"], explanation: "The total number of parts is 8, so girls are 5 out of 8 parts of 40, which is 25." },
      { id: "f09", category: "spatial reasoning", prompt: "How many faces does a cube have?", answer: "6", distractors: ["4", "8", "12"], explanation: "A cube has 6 square faces." },
      { id: "f10", category: "logic", prompt: "If all A are B and all B are C, what must be true?", answer: "all A are C", distractors: ["all C are A", "no A are C", "all B are A"], explanation: "If all A belong to B and all B belong to C, then all A belong to C." },
      { id: "f11", category: "spatial reasoning", prompt: "What kind of reversal happens in a mirror image?", answer: "left-right reversal", distractors: ["top-bottom reversal only", "day-night reversal", "weight reversal"], explanation: "Mirror images typically reverse left and right." },
      { id: "f12", category: "sequences", prompt: "What is an arithmetic progression based on?", answer: "a constant difference between terms", distractors: ["a constant product only", "random order", "alphabetical arrangement"], explanation: "An arithmetic progression changes by the same amount each step." },
      { id: "f13", category: "numbers", prompt: "Which of these values is prime?", answer: "29", distractors: ["21", "27", "33"], explanation: "29 is prime because it has no factors other than 1 and 29." },
      { id: "f14", category: "probability", prompt: "What is the probability of a certain event?", answer: "1", distractors: ["0", "2", "negative 1"], explanation: "A certain event has probability 1." },
      { id: "f15", category: "statistics", prompt: "What is the median of 3, 5, and 7?", answer: "5", distractors: ["3", "6", "7"], explanation: "The middle value of 3, 5, and 7 is 5." },
    ],
  },
  {
    id: "mva_special",
    title: "MVA Special",
    description: "School-specific question bank about Macro Vision Academy, Burhanpur, based on public details.",
    focus: "school knowledge and campus awareness",
    facts: [
      { id: "f01", category: "campus", prompt: "In which city is Macro Vision Academy located?", answer: "Burhanpur", distractors: ["Bhopal", "Indore", "Ujjain"], explanation: "The official school site identifies Macro Vision Academy as being in Burhanpur, Madhya Pradesh." },
      { id: "f02", category: "academics", prompt: "Which board is mentioned for Macro Vision Academy on the official site?", answer: "CBSE, New Delhi", distractors: ["ICSE", "State Board of Rajasthan", "IB Diploma Programme"], explanation: "The school describes itself as affiliated with CBSE, New Delhi." },
      { id: "f03", category: "academics", prompt: "Which classes does Macro Vision Academy serve?", answer: "Classes I to XII", distractors: ["Nursery to V only", "Classes VI to X only", "Undergraduate college classes"], explanation: "The official description says the school serves learners from Classes I to XII." },
      { id: "f04", category: "school type", prompt: "How does the school describe its learning model?", answer: "co-educational day and residential school", distractors: ["girls-only evening college", "boys-only military school", "online-only academy"], explanation: "The school is described as a co-educational day and residential school." },
      { id: "f05", category: "campus", prompt: "About how large is the Macro Vision Academy campus?", answer: "50 acres", distractors: ["5 acres", "15 acres", "150 acres"], explanation: "The official site describes the campus as spread across about 50 acres." },
      { id: "f06", category: "history", prompt: "In which academic session was Macro Vision Academy established?", answer: "2002-03", distractors: ["1991-92", "1998-99", "2010-11"], explanation: "The official school history says Macro Vision Academy was established in the 2002-03 session." },
      { id: "f07", category: "history", prompt: "What did the founders start in 1991 before expanding into the academy?", answer: "Sonu Coaching Classes", distractors: ["Macro Vision University", "MVA Robotics Lab", "Apple Learning Studio"], explanation: "The official history traces the founders' journey back to Sonu Coaching Classes in 1991." },
      { id: "f08", category: "history", prompt: "Which society is associated with launching the academy?", answer: "Anand Educational, Technical and Vocational Society", distractors: ["National Coaching Reform Board", "Burhanpur Science Council", "Central Technology Mission"], explanation: "The academy is connected with the Anand Educational, Technical and Vocational Society." },
      { id: "f09", category: "leadership", prompt: "Who is listed as founder secretary or director in the school's public leadership story?", answer: "Anand Prakash Chouksey", distractors: ["Kabir Chouksey", "Renuka Mata", "Harsh Deep Sharma"], explanation: "The school's public pages identify Anand Prakash Chouksey as a leading founder figure and secretary of the society." },
      { id: "f10", category: "leadership", prompt: "Who is listed as treasurer and director on the school's public pages?", answer: "Kabir Chouksey", distractors: ["Anand Prakash Chouksey", "Rajesh Khanna", "Sanjay Verma"], explanation: "Kabir Chouksey is presented on the public site as treasurer and director." },
      { id: "f11", category: "technology", prompt: "From which class are iPads mentioned as part of the learning model?", answer: "Class VI onward", distractors: ["Nursery onward", "Class IX onward", "Only after Class XII"], explanation: "The school states that iPads are introduced from Class VI onward." },
      { id: "f12", category: "technology", prompt: "How many iMac systems are highlighted in the school's computer lab description?", answer: "200", distractors: ["50", "100", "500"], explanation: "The technology description highlights a computer lab with 200 iMac systems." },
      { id: "f13", category: "technology", prompt: "What internet speed is highlighted by the school for its campus connection?", answer: "155 Mbps dedicated line", distractors: ["20 Mbps wireless line", "1 Gbps satellite line", "10 Mbps shared line"], explanation: "The school highlights a 155 Mbps dedicated internet line in its technology section." },
      { id: "f14", category: "programs", prompt: "Which school-specific aptitude or scholarship test is highlighted by name?", answer: "VMAT", distractors: ["SAT", "JEE Advanced", "TOEFL Junior"], explanation: "The school highlights VMAT as a named test in its public programs and admissions content." },
      { id: "f15", category: "recognition", prompt: "What recognition is highlighted on the school homepage?", answer: "Apple Distinguished School", distractors: ["World Heritage Campus", "National Space Academy", "UN Climate School"], explanation: "The school homepage highlights Apple Distinguished School recognition." },
    ],
  },
];

export const QUIZ_SUBJECT_BANKS: SubjectBank[] = subjectSeeds.map((subject) => {
  const questions = buildQuestions(subject);
  return {
    id: subject.id,
    title: subject.title,
    description: subject.description,
    focus: subject.focus,
    questions,
    difficultyCounts: countByDifficulty(questions),
  };
});

export function getSubjectBank(subjectId: string): SubjectBank | undefined {
  return QUIZ_SUBJECT_BANKS.find((subject) => subject.id === subjectId);
}

export const MVA_SPECIAL_BANK = getSubjectBank("mva_special") as SubjectBank;
