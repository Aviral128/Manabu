import { Difficulty } from "@prisma/client";

type Topic = {
  name: string;
  focus: string;
  practice: string;
  trap: string;
};

type Subject = {
  title: string;
  slug: string;
  description: string;
  category: string;
  estimatedMinutes: number;
  tags: string[];
  topics: Topic[];
};

type SeedQuestion = {
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  order: number;
  difficulty: Difficulty;
};

type SeedQuiz = {
  title: string;
  slug: string;
  description: string;
  category: string;
  estimatedMinutes: number;
  isSpecial: boolean;
  tags: string[];
  difficulty: Difficulty;
  questions: SeedQuestion[];
};

const ROUND_LABELS = ["core", "practice", "exam"] as const;

function alts(subject: Subject, topic: Topic) {
  return subject.topics.filter((item) => item.name !== topic.name);
}

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

function makeOptions(correct: string, wrong: string[]) {
  return [correct, wrong[0] ?? correct, wrong[1] ?? correct, wrong[2] ?? correct];
}

function buildTopicQuestions(subject: Subject, topic: Topic, topicIndex: number): SeedQuestion[] {
  const others = alts(subject, topic);
  const questions: SeedQuestion[] = [];
  let order = topicIndex * 63 + 1;

  for (let round = 0; round < 3; round += 1) {
    const a = pick(others, round);
    const b = pick(others, round + 1);
    const c = pick(others, round + 2);
    const label = ROUND_LABELS[round];

    const easy = [
      {
        prompt: `Which ${subject.category} topic matches this ${label} idea: ${topic.focus}?`,
        options: makeOptions(topic.name, [a.name, b.name, c.name]),
        explanation: `${topic.name} fits because ${topic.focus.toLowerCase()}.`,
      },
      {
        prompt: `A student working on ${topic.practice} is mainly studying which topic?`,
        options: makeOptions(topic.name, [a.name, b.name, c.name]),
        explanation: `${topic.practice} belongs to ${topic.name}.`,
      },
      {
        prompt: `Which statement best describes ${topic.name}?`,
        options: makeOptions(topic.focus, [a.focus, b.focus, c.focus]),
        explanation: topic.focus,
      },
      {
        prompt: `Which revision card belongs under ${topic.name}?`,
        options: makeOptions(topic.practice, [a.practice, b.practice, c.practice]),
        explanation: `${topic.practice} is a direct ${topic.name} activity.`,
      },
      {
        prompt: `Which misconception warns that ${topic.name} needs more work?`,
        options: makeOptions(topic.trap, [a.trap, b.trap, c.trap]),
        explanation: `${topic.trap} is the common trap for ${topic.name}.`,
      },
      {
        prompt: `Choose the correct label for this lesson target: ${topic.focus}`,
        options: makeOptions(topic.name, [a.name, b.name, c.name]),
        explanation: `${topic.name} is the right lesson label.`,
      },
      {
        prompt: `Which classroom example is the best match for ${topic.name}?`,
        options: makeOptions(topic.practice, [a.practice, b.practice, c.practice]),
        explanation: `${topic.practice} is the best match for ${topic.name}.`,
      },
    ];

    const medium = [
      {
        prompt: `A learner says "${topic.trap}". Which topic should the teacher reteach first?`,
        options: makeOptions(topic.name, [a.name, b.name, c.name]),
        explanation: `That mistake appears during ${topic.name}.`,
      },
      {
        prompt: `Which study note gives the strongest ${label} summary of ${topic.name}?`,
        options: makeOptions(topic.focus, [a.focus, b.focus, c.focus]),
        explanation: topic.focus,
      },
      {
        prompt: `Which exercise would strengthen ${topic.name} most directly?`,
        options: makeOptions(topic.practice, [a.practice, b.practice, c.practice]),
        explanation: `${topic.practice} gives direct practice in ${topic.name}.`,
      },
      {
        prompt: `Which reminder best fixes this misunderstanding: ${topic.trap}?`,
        options: makeOptions(`Remember that ${topic.focus.toLowerCase()}.`, [`Remember that ${a.focus.toLowerCase()}.`, `Remember that ${b.focus.toLowerCase()}.`, `Remember that ${c.focus.toLowerCase()}.`]),
        explanation: `The right reminder is that ${topic.focus.toLowerCase()}.`,
      },
      {
        prompt: `If an exam asks about ${topic.practice}, which topic should the learner review?`,
        options: makeOptions(topic.name, [a.name, b.name, c.name]),
        explanation: `${topic.practice} belongs to ${topic.name}.`,
      },
      {
        prompt: `Which note should appear in a ${topic.name} study plan?`,
        options: makeOptions(topic.focus, [a.trap, b.focus, c.focus]),
        explanation: `${topic.focus} should appear in the study plan.`,
      },
      {
        prompt: `Which checkpoint result signals progress in ${topic.name}?`,
        options: makeOptions(topic.practice, [a.practice, b.practice, c.practice]),
        explanation: `${topic.practice} is a strong checkpoint for ${topic.name}.`,
      },
    ];

    const hard = [
      {
        prompt: `Which advanced prompt belongs most naturally to ${topic.name}?`,
        options: makeOptions(topic.practice, [a.practice, b.practice, c.practice]),
        explanation: `${topic.practice} is the strongest advanced prompt for ${topic.name}.`,
      },
      {
        prompt: `Which mastery statement clearly separates ${topic.name} from the other units?`,
        options: makeOptions(topic.focus, [a.focus, b.focus, c.focus]),
        explanation: `${topic.focus} separates ${topic.name} from the others.`,
      },
      {
        prompt: `A teacher wants to expose weak understanding in ${topic.name}. Which error is best to check for?`,
        options: makeOptions(topic.trap, [a.trap, b.trap, c.trap]),
        explanation: `${topic.trap} is the most revealing error for ${topic.name}.`,
      },
      {
        prompt: `Which reflection shows deep command of ${topic.name}?`,
        options: makeOptions(`I can explain why ${topic.focus.toLowerCase()} and apply it through ${topic.practice.toLowerCase()}.`, [`I can explain why ${a.focus.toLowerCase()} and apply it through ${a.practice.toLowerCase()}.`, `I can explain why ${b.focus.toLowerCase()} and apply it through ${b.practice.toLowerCase()}.`, `I can explain why ${c.focus.toLowerCase()} and apply it through ${c.practice.toLowerCase()}.`]),
        explanation: `Strong mastery combines the concept and the practice task for ${topic.name}.`,
      },
      {
        prompt: `Which capstone task belongs to ${topic.name}?`,
        options: makeOptions(topic.practice, [a.practice, b.practice, c.practice]),
        explanation: `${topic.practice} is the capstone task that fits ${topic.name}.`,
      },
      {
        prompt: `Which correction best rebuilds this idea: ${topic.trap}?`,
        options: makeOptions(topic.focus, [a.focus, b.focus, c.focus]),
        explanation: topic.focus,
      },
      {
        prompt: `Which final review note best prepares a learner for ${topic.name}?`,
        options: makeOptions(`Master ${topic.focus.toLowerCase()} before moving to ${topic.practice.toLowerCase()}.`, [`Master ${a.focus.toLowerCase()} before moving to ${a.practice.toLowerCase()}.`, `Master ${b.focus.toLowerCase()} before moving to ${b.practice.toLowerCase()}.`, `Master ${c.focus.toLowerCase()} before moving to ${c.practice.toLowerCase()}.`]),
        explanation: `The strongest review note is to master ${topic.focus.toLowerCase()} before ${topic.practice.toLowerCase()}.`,
      },
    ];

    for (const item of easy) {
      questions.push({ ...item, answerIndex: 0, order, difficulty: Difficulty.EASY });
      order += 1;
    }
    for (const item of medium) {
      questions.push({ ...item, answerIndex: 0, order, difficulty: Difficulty.MEDIUM });
      order += 1;
    }
    for (const item of hard) {
      questions.push({ ...item, answerIndex: 0, order, difficulty: Difficulty.HARD });
      order += 1;
    }
  }

  return questions;
}

function buildQuiz(subject: Subject): SeedQuiz {
  const questions = subject.topics.flatMap((topic, index) => buildTopicQuestions(subject, topic, index));
  return {
    title: subject.title,
    slug: subject.slug,
    description: subject.description,
    category: subject.category,
    estimatedMinutes: subject.estimatedMinutes,
    isSpecial: false,
    tags: subject.tags,
    difficulty: Difficulty.MIXED,
    questions,
  };
}

const SUBJECTS: Subject[] = [
  { title: "Mathematics Mastery", slug: "mathematics-mastery", description: "School mathematics across core problem-solving topics.", category: "Mathematics", estimatedMinutes: 35, tags: ["numbers", "algebra", "geometry"], topics: [
    { name: "Arithmetic", focus: "arithmetic uses number operations to solve direct calculations", practice: "solving multi-step number operations", trap: "thinking arithmetic is only table memorization without reasoning" },
    { name: "Algebra", focus: "algebra uses symbols and equations to represent unknown values", practice: "solving for x in balanced equations", trap: "treating variables like labels instead of changing values" },
    { name: "Geometry", focus: "geometry studies shapes, angles, and spatial relationships", practice: "finding properties of triangles and quadrilaterals", trap: "assuming all four-sided figures follow the same rules" },
    { name: "Statistics", focus: "statistics organizes data using measures such as mean, median, and mode", practice: "reading a frequency table and finding an average", trap: "assuming the mean is always the best summary" },
  ]},
  { title: "Physics Lab", slug: "physics-lab", description: "Physics practice from motion to light and electricity.", category: "Physics", estimatedMinutes: 35, tags: ["motion", "energy", "waves"], topics: [
    { name: "Motion", focus: "motion describes changes in position over time", practice: "reading distance-time and speed-time graphs", trap: "assuming all motion graphs tell the same story" },
    { name: "Force", focus: "force changes motion through pushes and pulls", practice: "explaining acceleration from net force", trap: "thinking force exists only when an object is moving" },
    { name: "Electricity", focus: "electricity studies charge, current, voltage, and circuits", practice: "analyzing a simple series circuit", trap: "believing current gets used up by the first bulb" },
    { name: "Light", focus: "light studies reflection, refraction, and image formation", practice: "tracing images in mirrors and lenses", trap: "assuming every mirror forms the same image" },
  ]},
  { title: "Chemistry Studio", slug: "chemistry-studio", description: "Chemistry revision from atoms to reactions and carbon compounds.", category: "Chemistry", estimatedMinutes: 35, tags: ["atoms", "reactions", "compounds"], topics: [
    { name: "Atomic Structure", focus: "atomic structure explains protons, neutrons, electrons, and arrangement", practice: "finding atomic number and mass number", trap: "placing electrons inside the nucleus" },
    { name: "Periodic Table", focus: "the periodic table organizes elements by atomic number and properties", practice: "predicting valency from a group's position", trap: "treating periods and groups as the same idea" },
    { name: "Chemical Bonding", focus: "chemical bonding explains how atoms join through ionic or covalent attraction", practice: "comparing ionic compounds with covalent molecules", trap: "assuming every bond shares electrons equally" },
    { name: "Chemical Reactions", focus: "chemical reactions convert reactants into products through bond changes", practice: "classifying combination and decomposition reactions", trap: "thinking atoms disappear during reactions" },
  ]},
  { title: "Biology Explorer", slug: "biology-explorer", description: "Life science practice across cells, systems, genetics, and ecology.", category: "Biology", estimatedMinutes: 35, tags: ["cells", "systems", "ecology"], topics: [
    { name: "Cell Structure", focus: "cell structure studies organelles and their functions", practice: "comparing plant and animal cells", trap: "thinking every cell has identical parts" },
    { name: "Digestion", focus: "digestion breaks food into absorbable molecules", practice: "tracking food through the alimentary canal", trap: "believing digestion happens only in the stomach" },
    { name: "Genetics", focus: "genetics explains inheritance through genes and variation", practice: "reading a simple inheritance pattern", trap: "assuming one parent alone determines every trait" },
    { name: "Ecosystems", focus: "ecosystems describe interactions between organisms and environment", practice: "building food chains and food webs", trap: "thinking only animals matter in ecosystem balance" },
  ]},
  { title: "English Communicator", slug: "english-communicator", description: "English language practice across grammar, reading, writing, and literature.", category: "English", estimatedMinutes: 35, tags: ["grammar", "reading", "writing"], topics: [
    { name: "Grammar", focus: "grammar organizes sentence structure, agreement, and tense", practice: "correcting subject-verb agreement and tense errors", trap: "assuming grammar does not matter if the idea feels clear" },
    { name: "Vocabulary", focus: "vocabulary improves meaning by choosing precise words", practice: "selecting context-appropriate synonyms", trap: "thinking harder words are always better words" },
    { name: "Reading Comprehension", focus: "reading comprehension builds meaning from explicit and implied details", practice: "answering inference and evidence questions", trap: "copying a line without checking the real question" },
    { name: "Writing Skills", focus: "writing skills organize ideas for clarity and coherence", practice: "drafting a structured paragraph or letter", trap: "believing long sentences automatically improve writing" },
  ]},
  { title: "Computer Science Builder", slug: "computer-science-builder", description: "Computer science from algorithms to data, networks, and security.", category: "Computer Science", estimatedMinutes: 35, tags: ["algorithms", "coding", "security"], topics: [
    { name: "Algorithms", focus: "algorithms are step-by-step methods for solving problems", practice: "designing clear steps to sort or search data", trap: "thinking an algorithm must be written as code" },
    { name: "Programming Logic", focus: "programming logic uses sequence, selection, and iteration", practice: "predicting output from conditions and loops", trap: "assuming code runs in random order" },
    { name: "Databases", focus: "databases store structured data using tables, records, and queries", practice: "retrieving records with a filtered query", trap: "believing a database is only a long list" },
    { name: "Cybersecurity", focus: "cybersecurity protects systems and data from attack or misuse", practice: "spotting phishing and building strong passwords", trap: "thinking security matters only to large companies" },
  ]},
  { title: "History Chronicle", slug: "history-chronicle", description: "History revision across civilizations, freedom, reform, and modern change.", category: "History", estimatedMinutes: 35, tags: ["civilizations", "freedom", "reform"], topics: [
    { name: "Ancient Civilizations", focus: "ancient civilizations are studied through cities, trade, culture, and governance", practice: "comparing early river valley societies", trap: "assuming ancient societies were simple because they were old" },
    { name: "Freedom Movement", focus: "the freedom movement traces resistance, reform, and public participation", practice: "connecting leaders, events, and civil resistance", trap: "thinking independence came from one event alone" },
    { name: "Industrial Revolution", focus: "the Industrial Revolution transformed production, labor, and urban life", practice: "explaining the shift from hand work to machines", trap: "believing industrial change affected factories only" },
    { name: "Constitution Making", focus: "constitution making defines rights, institutions, and government powers", practice: "studying debates behind the Indian Constitution", trap: "thinking a constitution is only symbolic" },
  ]},
  { title: "Geography Atlas", slug: "geography-atlas", description: "Geography practice on maps, climate, resources, and population.", category: "Geography", estimatedMinutes: 35, tags: ["maps", "climate", "population"], topics: [
    { name: "Maps", focus: "maps use symbols, scale, and direction to represent places", practice: "reading a legend and estimating distance from scale", trap: "thinking north is always at the top without checking" },
    { name: "Climate", focus: "climate studies long-term weather patterns and controls", practice: "comparing monsoon and dry regions", trap: "using weather and climate as the same word" },
    { name: "Resources", focus: "resources are useful materials and conditions for human activity", practice: "classifying renewable and non-renewable resources", trap: "thinking a thing is a resource without human use" },
    { name: "Population", focus: "population studies size, growth, density, and distribution", practice: "interpreting a population pyramid", trap: "treating population size and density as the same measure" },
  ]},
  { title: "Civics Forum", slug: "civics-forum", description: "Civics practice on institutions, law, participation, and public values.", category: "Civics", estimatedMinutes: 35, tags: ["democracy", "rights", "government"], topics: [
    { name: "Democracy", focus: "democracy gives people a role in choosing representatives and shaping public life", practice: "explaining why elections and accountability matter", trap: "thinking democracy means majority power with no limits" },
    { name: "Constitution", focus: "the Constitution defines rights, powers, and guiding principles", practice: "identifying why constitutional limits matter", trap: "assuming public opinion can ignore constitutional safeguards" },
    { name: "Judiciary", focus: "the judiciary interprets law and protects justice through courts", practice: "explaining why judicial review matters", trap: "thinking courts work exactly like elected governments" },
    { name: "Local Government", focus: "local government manages community issues through nearby institutions", practice: "identifying civic services handled close to citizens", trap: "assuming local bodies only take orders from above" },
  ]},
  { title: "Economics Launchpad", slug: "economics-launchpad", description: "Economics revision on demand, markets, money, inflation, and enterprise.", category: "Economics", estimatedMinutes: 35, tags: ["markets", "money", "inflation"], topics: [
    { name: "Demand and Supply", focus: "demand and supply influence price and quantity in markets", practice: "explaining why prices change when supply or demand shifts", trap: "assuming every price change has only one cause" },
    { name: "Markets", focus: "markets connect buyers and sellers to exchange goods and services", practice: "comparing competition and consumer choice", trap: "thinking a market must be a physical place only" },
    { name: "Money and Banking", focus: "money and banking support exchange, saving, and lending", practice: "understanding deposits, loans, and digital payments", trap: "believing banks only store money" },
    { name: "Inflation", focus: "inflation is a sustained rise in the general price level", practice: "explaining why money buys less when prices rise", trap: "thinking one expensive product alone means inflation" },
  ]},
];

const MVA_SPECIAL = [
  ["What does MVA stand for in the school name?", ["Macro Vision Academy", "Modern Vision Association", "Master Value Academy", "Mission Vision Academy"], 0, "MVA stands for Macro Vision Academy.", Difficulty.EASY],
  ["Macro Vision Academy is located in which city?", ["Burhanpur", "Indore", "Khandwa", "Jalgaon"], 0, "The school is in Burhanpur.", Difficulty.EASY],
  ["Which board is associated with the school?", ["CBSE", "ICSE", "IB", "State Board only"], 0, "The school is affiliated with CBSE.", Difficulty.EASY],
  ["Which classes does the school publicly indicate it serves?", ["Class I to XII", "Only IX to XII", "Nursery to V only", "College level"], 0, "Public information shows classes I to XII.", Difficulty.EASY],
  ["Which school model best matches public information?", ["Day-cum-residential", "Online only", "Weekend academy only", "University campus"], 0, "The school is described as day-cum-residential.", Difficulty.EASY],
  ["Which road appears in the published address?", ["Renuka Mata Road", "Airport Road", "Station Road", "MG Road"], 0, "Renuka Mata Road appears in the address.", Difficulty.EASY],
  ["Which nearby landmark is mentioned in the address?", ["All Is Well Hospital", "District Stadium", "Science Park", "Rail Museum"], 0, "The address mentions All Is Well Hospital.", Difficulty.EASY],
  ["What is the school's CBSE affiliation number?", ["1030178", "1030718", "1300178", "1031187"], 0, "The published affiliation number is 1030178.", Difficulty.MEDIUM],
  ["In what year was Macro Vision Academy established?", ["2002", "1998", "2005", "2010"], 0, "Public disclosures list the school as established in 2002.", Difficulty.EASY],
  ["Who is listed as the principal in public disclosures?", ["Jasvir Singh Parmar", "Kabir Chouksey", "Manjusha Chouksey", "Anand Prakash Chouksey"], 0, "Jasvir Singh Parmar is listed as principal.", Difficulty.MEDIUM],
  ["Who is listed as chairman/president/correspondent?", ["Mrs. Manjusha Chouksey", "Mr. Anand Prakash Chouksey", "Mr. Kabir Chouksey", "Mr. Jasvir Singh Parmar"], 0, "Mrs. Manjusha Chouksey is listed in that role.", Difficulty.MEDIUM],
  ["Who is listed as secretary in the school management form?", ["Mr. Anand Prakash Chouksey", "Mrs. Manjusha Chouksey", "Mr. Kabir Chouksey", "Mr. Jasvir Singh Parmar"], 0, "Mr. Anand Prakash Chouksey is listed as secretary.", Difficulty.MEDIUM],
  ["Who is described publicly as founder and director of the school?", ["Mr. Anand Prakash Chouksey", "Mr. Kabir Chouksey", "Mrs. Manjusha Chouksey", "Mr. Jasvir Singh Parmar"], 0, "The official about page describes Mr. Anand Prakash Chouksey as founder and director.", Difficulty.MEDIUM],
  ["Which role is associated with Mr. Kabir Chouksey on the about page?", ["Treasurer and Director", "Principal", "Sports captain", "Admissions clerk"], 0, "Mr. Kabir Chouksey is presented as Treasurer and Director.", Difficulty.MEDIUM],
  ["Which learning environment does the school highlight?", ["Technology-enabled learning", "Marine navigation training", "Only correspondence classes", "Only military drills"], 0, "The school highlights technology-enabled learning.", Difficulty.EASY],
  ["Which Apple-related recognition is associated with the school?", ["Apple Distinguished School", "Apple Museum School", "Apple Retail Partner", "Apple Developer Center"], 0, "Public materials describe the school as an Apple Distinguished School.", Difficulty.MEDIUM],
  ["Which special lab is mentioned in public descriptions?", ["Chronosphere Lab", "Marine Lab", "Aviation Lab", "Broadcast Lab"], 0, "The Chronosphere Lab is mentioned publicly.", Difficulty.HARD],
  ["What is the main medium of instruction listed for the school?", ["English", "Hindi only", "Japanese", "Marathi only"], 0, "The school is listed as English-medium.", Difficulty.EASY],
  ["How many total teachers are listed in public disclosures?", ["79", "49", "109", "29"], 0, "The disclosure form lists 79 teachers.", Difficulty.HARD],
  ["How many PGT teachers are listed?", ["26", "18", "32", "9"], 0, "The disclosure lists 26 PGT teachers.", Difficulty.HARD],
  ["How many TGT teachers are listed?", ["28", "14", "36", "22"], 0, "The disclosure lists 28 TGT teachers.", Difficulty.HARD],
  ["How many PRT teachers are listed?", ["11", "21", "7", "31"], 0, "The disclosure lists 11 PRT teachers.", Difficulty.HARD],
  ["How many PET teachers are listed?", ["10", "2", "15", "25"], 0, "The disclosure lists 10 PET teachers.", Difficulty.HARD],
  ["How many laboratories are listed?", ["4", "1", "8", "12"], 0, "The public disclosure indicates 4 labs.", Difficulty.HARD],
  ["How many rooms are mentioned in the mandatory disclosure?", ["74", "24", "44", "94"], 0, "The disclosure mentions 74 rooms.", Difficulty.HARD],
  ["How many playgrounds are indicated?", ["2", "1", "4", "6"], 0, "The school disclosures indicate 2 playgrounds.", Difficulty.MEDIUM],
  ["Which nearby college is mentioned behind the school in the address line?", ["Mahila Polytechnic College", "Engineering College", "Medical College", "Law College"], 0, "The address references Mahila Polytechnic College.", Difficulty.MEDIUM],
  ["What kind of school category is publicly associated with Macro Vision Academy?", ["Co-educational", "Girls only", "Boys only", "University only"], 0, "The school is described as co-educational.", Difficulty.EASY],
  ["Which police station is cited in school disclosures?", ["Shikarpura Police Station", "City Kotwali", "Railway Police", "Lalbagh Police Station"], 0, "Shikarpura Police Station is named in the public disclosure.", Difficulty.HARD],
  ["Which railway station is listed as nearest?", ["Burhanpur Railway Station", "Indore Junction", "Khandwa Junction", "Jalgaon Station"], 0, "Burhanpur Railway Station is listed as nearest.", Difficulty.MEDIUM],
  ["Which statement best matches the school's public vision?", ["Holistic, modern education supported by technology", "Only test-taking without activities", "No residential learning support", "No innovation focus"], 0, "Public messaging emphasizes holistic, modern education with strong technology support.", Difficulty.EASY],
] as const;

export function getSeedQuizzes(): SeedQuiz[] {
  const quizzes = SUBJECTS.map((subject) => buildQuiz(subject));
  quizzes.unshift({
    title: "MVA Special",
    slug: "mva-special",
    description: "A special school-focused quiz about Macro Vision Academy, Burhanpur.",
    category: "School Special",
    estimatedMinutes: 30,
    isSpecial: true,
    tags: ["mva", "burhanpur", "school"],
    difficulty: Difficulty.MIXED,
    questions: MVA_SPECIAL.map((item, index) => ({
      prompt: item[0],
      options: [...item[1]],
      answerIndex: item[2],
      explanation: item[3],
      difficulty: item[4],
      order: index + 1,
    })),
  });
  return quizzes;
}
