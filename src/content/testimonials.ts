/**
 * 26 recomendações públicas do LinkedIn, extraídas em 12/08/2026.
 * Fonte: linkedin.com/in/emanuel-agape/details/recommendations
 *
 * Traduções preservam a voz do autor. Nada foi inflado ou adicionado —
 * depoimento adulterado, se descoberto, destrói toda a autoridade do site.
 * Curadoria e posicionamento em docs/testimonials.md.
 */

export type Relationship = "client" | "manager" | "direct-report" | "peer" | "cross-team";

export type Testimonial = {
  id: string;
  authorName: string;
  authorTitle: string;
  authorCompany: string;
  relationship: Relationship;
  originalLanguage: "pt" | "en";
  date: string;
  quoteEn: string;
  shortQuote: string;
  tier: "S+" | "S" | "A" | "B" | "C";
  mentions?: string[];
  /** Perfil público. Verificabilidade é o que transforma depoimento em prova. */
  authorLinkedIn?: string;
  /** Só preencher COM AUTORIZAÇÃO expressa de uso de imagem. Até lá, iniciais. */
  authorPhoto?: string;
  approvedForPublicUse: boolean;
};

export const relationshipLabel: Record<Relationship, string> = {
  client: "Client",
  manager: "Manager",
  "direct-report": "Direct report",
  peer: "Peer",
  "cross-team": "Cross-team",
};

export const testimonials: Testimonial[] = [
  {
    id: "maria-cristina-kopacek",
    authorName: "Maria Cristina Kopacek",
    authorTitle: "CEO",
    authorCompany: "Idez",
    relationship: "client",
    originalLanguage: "en",
    date: "2020-05-16",
    tier: "S+",
    quoteEn:
      "Emanuel has an excellent design ability, which always enabled him to develop complex interfaces very well within a very short time. He was always responsible and very committed to the tasks assigned. Moreover he has a proactive personality and an impressive level of dedication and attention to the details.",
    shortQuote: "Develops complex interfaces very well within a very short time.",
    approvedForPublicUse: false,
  },
  {
    id: "andre-vieira",
    authorName: "André Vieira",
    authorTitle: "Product Manager",
    authorCompany: "Riskex",
    relationship: "peer",
    originalLanguage: "pt",
    date: "2026-01-15",
    tier: "S+",
    mentions: ["Carrefour", "Banco BRB", "Riskex"],
    quoteEn:
      "I worked with Emanuel at different moments — first between 2021 and 2023 at Platform Builder, on projects for large companies like Carrefour and Banco BRB, and in 2025 we started working together again at RiskEx. What always stood out was his dedication to UI and UX, combined with strong analytical reasoning and the use of metrics to guide design decisions. A standout example was at Carrefour, where we rolled out a product across every physical store in the chain. We embedded ourselves in the sales staff's daily routine to understand their needs — and that helped us build a product that became a success and is still in use today. A real example of putting the customer at the centre and solving the right problem.",
    shortQuote:
      "We rolled out a product across every physical store in the chain — and it's still in use today.",
    approvedForPublicUse: false,
  },
  {
    id: "karolina-japp",
    authorName: "Karolina Japp",
    authorTitle: "Product Designer",
    authorCompany: "Reported to Emanuel",
    relationship: "direct-report",
    originalLanguage: "pt",
    date: "2025-05-08",
    tier: "S+",
    quoteEn:
      "Working with Emanuel was a sequence of lessons from end to end. He was extremely willing to walk me through every business challenge and how the product was built. In a short time we managed to break down and understand user opportunities and needs, with research conducted in both English and Portuguese, and to design a modular, scalable solution without drifting from the original goal. Beyond being a great colleague, Emanuel was a great leader. His technical expertise goes well past the ordinary — he knows the business, the engineering, the metrics, and every page of the Figma file by heart. Whatever the challenge, he will transform your team and your product through organisation, collaboration and strategy.",
    shortQuote:
      "Whatever the challenge, he will transform your team and your product.",
    approvedForPublicUse: false,
  },
  {
    id: "melanie-tonsic",
    authorName: "Melanie Tonsic",
    authorTitle: "Founder",
    authorCompany: "Acordia",
    relationship: "client",
    originalLanguage: "pt",
    date: "2025-09-11",
    tier: "S",
    quoteEn:
      "Excellent designer. We worked with him and the team he assembled, and we will certainly work together again.",
    shortQuote: "We worked with him and the team he assembled.",
    approvedForPublicUse: false,
  },
  {
    id: "ewerton-vieira",
    authorName: "Ewerton Vieira",
    authorTitle: "Senior Software Engineer",
    authorCompany: "Peer",
    relationship: "peer",
    originalLanguage: "en",
    date: "2026-07-25",
    tier: "S",
    quoteEn:
      "I had the absolute privilege of working alongside Emanuel for two years on a wide variety of challenging projects, and I can confidently say he is an exceptional Product Designer. We collaborated on over eight different digital products across multiple sectors, including fintech, e-commerce and healthcare platforms. As a software engineer, working with a designer of Emanuel's caliber makes all the difference. He has a unique talent for translating complex business requirements into intuitive, user-centric and highly functional interfaces. His attention to detail and deep understanding of the entire product lifecycle meant that the design-to-development handoff was always seamless.",
    shortQuote: "The design-to-development handoff was always seamless.",
    approvedForPublicUse: false,
  },
  {
    id: "gabriela-campos-morelli",
    authorName: "Gabriela Campos Morelli",
    authorTitle: "Key Account / Partner",
    authorCompany: "Managed Emanuel",
    relationship: "manager",
    originalLanguage: "pt",
    date: "2024-04-22",
    tier: "S",
    quoteEn:
      "I worked with Emanuel for over two years, where he owned the design layer for a major retail client. He stood out for his organisation, excellent delivery and holistic view, along with soft skills that showed real commitment to the company and its clients. I'd highlight his ability to work autonomously and with a leader's perspective.",
    shortQuote: "He owned the design layer for a major retail client.",
    approvedForPublicUse: false,
  },
  {
    id: "carla-medeiros",
    authorName: "Carla Medeiros",
    authorTitle: "Specialist Product Designer",
    authorCompany: "Stone",
    relationship: "peer",
    originalLanguage: "pt",
    date: "2022-10-24",
    tier: "S",
    quoteEn:
      "Emanuel was an exceptional colleague. Always seeking the balance between business and design, he was the person who taught me the most about prioritising design work. Beyond speeding up the process, he knows how to motivate a team, inspire and lead beyond frameworks. I had the pleasure of working with someone hungry to win, attentive to metrics and to the impact we can create in users' lives. Anyone who goes through that experience with him will learn a great deal about design and management.",
    shortQuote: "He knows how to motivate a team, inspire and lead beyond frameworks.",
    approvedForPublicUse: false,
  },
  {
    id: "allan-winckler-moreira",
    authorName: "Allan Winckler Moreira",
    authorTitle: "Senior Software Engineer, Tech Lead",
    authorCompany: "Peer",
    relationship: "peer",
    originalLanguage: "pt",
    date: "2020-05-17",
    tier: "S",
    quoteEn:
      "A dedicated professional, capable of investigating and validating new product solutions — identifying audiences, running field research and benchmark studies with extreme care. His commitment to finding the right starting point stands out; he always considers technical feasibility and available resources before committing. Teamwork is a strength: the definition and concept of the project are always taken into account at the pre-product stage.",
    shortQuote: "Field research and benchmark studies with extreme care.",
    approvedForPublicUse: false,
  },
  {
    id: "fabio-varricchio",
    authorName: "Fabio Varricchio",
    authorTitle: "Chief Technology Officer",
    authorCompany: "Client",
    relationship: "client",
    originalLanguage: "pt",
    date: "2020-08-11",
    tier: "S",
    quoteEn:
      "Emanuel is a very talented and dedicated professional. He quickly grasps the client's need and always brings something new that adds value to the solution. His solutions are modern and bring innovation.",
    shortQuote: "He quickly grasps the client's need and adds value to the solution.",
    approvedForPublicUse: false,
  },
  {
    id: "miguel-angelo",
    authorName: "Miguel Angelo F.S.",
    authorTitle: "Product Designer Specialist",
    authorCompany: "Reported to Emanuel",
    relationship: "direct-report",
    originalLanguage: "pt",
    date: "2022-07-26",
    tier: "S",
    mentions: ["Carrefour"],
    quoteEn:
      "I had the pleasure of working with Emanuel on a challenging project — the Carrefour sales app. He won people over immediately with his warmth and dedication. With genuinely positive energy, real engagement and a drive to find the best solution, the day-to-day on that project was excellent. Creative, fast and proactive, he went beyond on quality of delivery.",
    shortQuote: "The Carrefour sales app — he went beyond on quality of delivery.",
    approvedForPublicUse: false,
  },
  {
    id: "angelo-guimaraes-rosa",
    authorName: "Angelo Guimarães Rosa",
    authorTitle: "Product Designer & Innovation Lead",
    authorCompany: "Managed Emanuel",
    relationship: "manager",
    originalLanguage: "pt",
    date: "2022-04-18",
    tier: "S",
    mentions: ["Carrefour"],
    quoteEn:
      "Emanuel's defining trait is his proactivity, and he has a strong command of UI/UX best practices. His arrival on the Carrefour project made a significant impact on the quality of our delivery, and he was praised by the whole team.",
    shortQuote:
      "His arrival on the Carrefour project made a significant impact on delivery.",
    approvedForPublicUse: false,
  },
  {
    id: "everton-cerconvis",
    authorName: "Everton Cerconvis",
    authorTitle: "Product Designer",
    authorCompany: "Carrefour Group",
    relationship: "peer",
    originalLanguage: "pt",
    date: "2025-02-20",
    tier: "A",
    mentions: ["Carrefour"],
    quoteEn:
      "We worked together at Grupo Carrefour Brasil. His technical knowledge — not only visual but also of code and strategy — was the differentiator that allowed us to deliver products aligned with the company's strategic objectives. When I took over a product Emanuel had brought to life from the start, his clarity in communication and technical depth were crucial for me to continue his legacy.",
    shortQuote: "Technical knowledge not only visual but also of code and strategy.",
    approvedForPublicUse: false,
  },
  {
    id: "eduardo-alves",
    authorName: "Eduardo Alves",
    authorTitle: "Staff Software Engineer",
    authorCompany: "PhilSocial",
    relationship: "peer",
    originalLanguage: "pt",
    date: "2023-11-19",
    tier: "A",
    mentions: ["RD"],
    quoteEn:
      "I had the privilege of working with Emanuel on an RD initiative, and I apologise to the other designers I've worked with, but he is the best I've ever worked with. He can analyse a project and extract the maximum from it within its constraints, which makes development methodology far easier. He brings value and speed to a project.",
    shortQuote: "He is the best designer I've ever worked with.",
    approvedForPublicUse: false,
  },
  {
    id: "alexandre-manini",
    authorName: "Alexandre Manini",
    authorTitle: "IT & Project Management",
    authorCompany: "Client",
    relationship: "client",
    originalLanguage: "pt",
    date: "2022-08-10",
    tier: "A",
    quoteEn:
      "Emanuel is a singular professional, with a breadth of practical and technical knowledge matched by few. His grasp of project challenges and his determination to contribute to the solution are clearly among the pillars of how he works.",
    shortQuote: "A breadth of practical and technical knowledge matched by few.",
    approvedForPublicUse: false,
  },
  {
    id: "ale-magalhaes",
    authorName: "Ale R. Magalhaes",
    authorTitle: "Business Information Security Officer",
    authorCompany: "Client",
    relationship: "client",
    originalLanguage: "pt",
    date: "2021-04-15",
    tier: "A",
    quoteEn:
      "An excellent professional, attentive and dedicated to understanding and meeting the client's real needs. He takes on numerous challenges and understands the specific nuances of the business model in order to deliver quality UX/UI work. He shows broad knowledge and brings insights that are genuinely relevant to the projects we've developed together.",
    shortQuote: "Dedicated to understanding the client's real needs.",
    approvedForPublicUse: false,
  },
  {
    id: "rodrigo-maroni",
    authorName: "Rodrigo Maroni",
    authorTitle: "Chief Client Impact",
    authorCompany: "Winnin",
    relationship: "cross-team",
    originalLanguage: "pt",
    date: "2022-03-15",
    tier: "A",
    quoteEn:
      "Emanuel is an immensely talented designer, committed to deeply understanding the pain of the project's end user. Questioning and genuinely interested in understanding every problem and every business decision, going far beyond the aesthetic solution. He anticipates needs and brings a broad, current repertoire to the conversation.",
    shortQuote: "Going far beyond the aesthetic solution.",
    approvedForPublicUse: false,
  },
  {
    id: "juliana-almeida",
    authorName: "Juliana de Oliveira Almeida",
    authorTitle: "Digital Transformation Specialist",
    authorCompany: "Managed Emanuel",
    relationship: "manager",
    originalLanguage: "pt",
    date: "2024-08-30",
    tier: "B",
    quoteEn:
      "Emanuel is a dedicated professional with high-quality delivery and impeccable relationships across the team. He takes a position, and he helps raise the maturity of the group.",
    shortQuote: "He helps raise the maturity of the team.",
    approvedForPublicUse: false,
  },
  {
    id: "danilo-bassouto",
    authorName: "Danilo Bassouto",
    authorTitle: "Senior Product Designer",
    authorCompany: "Motiva",
    relationship: "peer",
    originalLanguage: "pt",
    date: "2025-12-04",
    tier: "B",
    quoteEn:
      "Emanuel is very easy to work alongside — a good listener, personable, and someone who synthesises his thinking clearly. He is also an excellent designer with complete command of Figma and of the core design concepts any Product Designer needs. He helped me a great deal in creating work consistent with the existing design system.",
    shortQuote: "He helped me create work consistent with the design system.",
    approvedForPublicUse: false,
  },
  {
    id: "ueverton-leomir",
    authorName: "Ueverton Leomir",
    authorTitle: "Senior Backend Engineer, Technical Lead",
    authorCompany: "Peer",
    relationship: "peer",
    originalLanguage: "pt",
    date: "2024-04-30",
    tier: "B",
    quoteEn:
      "Emanuel is without doubt one of the best professionals I've had the pleasure of working with. Always willing and dedicated, delivering everything entrusted to him at the highest quality. I witnessed significant work on design and user journeys, with suggestions that were always well grounded and focused on the end user.",
    shortQuote: "One of the best professionals I've had the pleasure of working with.",
    approvedForPublicUse: false,
  },
  {
    id: "luan-curti",
    authorName: "Luan Curti",
    authorTitle: "Software Engineering Manager",
    authorCompany: "Peer",
    relationship: "peer",
    originalLanguage: "en",
    date: "2024-04-22",
    tier: "B",
    quoteEn:
      "I highly recommend Emanuel. He is a good problem solver — when I needed help he was open to talk about the product development, solve doubts, improve the delivery and bring amazing insights about what we could do better.",
    shortQuote: "A good problem solver with amazing insights.",
    approvedForPublicUse: false,
  },
  {
    id: "matheus-ferrari",
    authorName: "Matheus Ferrari",
    authorTitle: "Software Engineer",
    authorCompany: "Peer",
    relationship: "peer",
    originalLanguage: "pt",
    date: "2024-03-04",
    tier: "B",
    mentions: ["Carrefour"],
    quoteEn:
      "I had the great opportunity of working with Emanuel on the Carrefour project. Without a shadow of a doubt, he is a professional who goes beyond expectations — extremely capable and dedicated in everything he does.",
    shortQuote: "A professional who goes beyond expectations.",
    approvedForPublicUse: false,
  },
  {
    id: "danilo-barbosa",
    authorName: "Danilo Barbosa",
    authorTitle: "Quality Software Engineer",
    authorCompany: "Peer",
    relationship: "peer",
    originalLanguage: "en",
    date: "2024-03-01",
    tier: "B",
    quoteEn:
      "I had the opportunity to work with Emanuel on a client for over a year. In all that time he proved to be very capable and committed to his role as UX Designer, always analytical and concerned about the client. He had a real sense of ownership and was one of the main references when it came to new business and features — a very strong focal point working closely with the client and end users. I highly recommend him, and even more so for always being willing to receive opinions rather than letting his own prevail.",
    shortQuote: "A real sense of ownership, working closely with client and end users.",
    approvedForPublicUse: false,
  },
  {
    id: "aline-fukuoka",
    authorName: "Aline Fukuoka",
    authorTitle: "Product Manager",
    authorCompany: "Peer",
    relationship: "peer",
    originalLanguage: "pt",
    date: "2024-02-06",
    tier: "B",
    quoteEn:
      "Emanuel is consistently exceptional and detail-oriented on every front. He always goes beyond what was asked, bringing improvements connected to what actually moves the business.",
    shortQuote: "He always goes beyond, connected to what moves the business.",
    approvedForPublicUse: false,
  },
  {
    id: "michelle-ribeiro",
    authorName: "Michelle Ribeiro",
    authorTitle: "Senior QA Engineer, QA Lead",
    authorCompany: "Peer",
    relationship: "peer",
    originalLanguage: "pt",
    date: "2025-12-04",
    tier: "C",
    quoteEn:
      "I've been working with Emanuel and I see his exemplary professional conduct every day. He is calm, patient, helpful, and always makes teamwork easier. Without doubt, someone who makes a difference in the working environment.",
    shortQuote: "Someone who makes a difference in the working environment.",
    approvedForPublicUse: false,
  },
  {
    id: "daniel-rafael-ramos",
    authorName: "Daniel Rafael Ramos",
    authorTitle: "Solutions Architect",
    authorCompany: "Cross-team",
    relationship: "cross-team",
    originalLanguage: "pt",
    date: "2023-11-27",
    tier: "C",
    quoteEn:
      "It is with great satisfaction that I recommend Emanuel as an extremely studious, competent and dedicated professional. Emanuel is genuinely passionate about his field. His insatiable thirst for learning not only sets him apart, it inspires those around him. He shows a remarkable ability to absorb complex information and apply that knowledge in practical, innovative ways.",
    shortQuote: "A remarkable ability to absorb complex information and apply it.",
    approvedForPublicUse: false,
  },
  {
    id: "andre-luppi",
    authorName: "Andre Luiz Luppi",
    authorTitle: "Founder, Cloud & IoT Consultant",
    authorCompany: "LUPP",
    relationship: "cross-team",
    originalLanguage: "pt",
    date: "2022-02-24",
    tier: "C",
    quoteEn: "Excellent professional. Deep technical knowledge in his field.",
    shortQuote: "Deep technical knowledge in his field.",
    approvedForPublicUse: false,
  },
];

export const featuredIds = [
  "maria-cristina-kopacek",
  "andre-vieira",
  "karolina-japp",
  "melanie-tonsic",
];

export const featured = testimonials.filter((t) => featuredIds.includes(t.id));
