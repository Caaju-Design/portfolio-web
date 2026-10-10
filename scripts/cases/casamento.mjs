/**
 * Case "Gabriela & Emanuel" — o site-convite do casamento.
 *
 * Texto aprovado pelo Manu em 10/10/2026 (rascunho original em
 * docs da thread do projeto, `case-gabriela-emanuel.md`).
 *
 * Decisoes que moram aqui e nao sao descuido:
 *   - `categories: []` e `services: []`: a taxonomia (content-model.md §3) nao
 *     tem categoria honesta para isto, e o case nao prova nenhuma oferta de
 *     /services. Vazio = aparece em "All" e em nenhum filtro.
 *   - `deepAccess: "open"`: unico trabalho sem NDA. Trancar o proprio casamento
 *     atras do gate seria teatro.
 *   - Sem numero de resultado: a festa e em abril/2027. Volta depois (§8).
 *   - Imagens: prints reais do site, montados em mock 3D, em public/cases/casamento/.
 *     O antes/depois da Nossa Historia saiu: a versao antiga nao existe mais.
 *   - Contagem de commits medida no repo Caaju-Design/casamento em 10/10/2026.
 */
export const casamento = {
  slug: "casamento",
  order: 0,
  status: "published",

  title: "Gabriela & Emanuel",
  headline:
    "A wedding invitation that replaced the WhatsApp threads and the PDF attachments — in three languages, one of them right-to-left.",
  client: "Gabriela & Emanuel",
  industry: "other",
  year: 2026,
  duration: "About a month",
  role: "Art direction, UX, engineering",
  categories: [],
  services: [],
  tools: ["Next.js 16", "React 19", "TypeScript", "Tailwind", "three.js / WebGL", "Leaflet", "Vitest"],
  liveUrl: "https://casamento.caaju.com.br",

  deepAccess: "open",
  ndaLevel: "none",
  requiresApproval: false,

  seoDescription:
    "Case study: a three-language wedding invitation site, painted in watercolour with a custom WebGL shader and engineered to survive a mid-range phone.",

  signals: [
    {
      kind: "artifact",
      value: "A watercolour engine",
      label: "Custom WebGL pigment shader, written for this project",
      verified: true,
    },
    {
      kind: "scope",
      value: "Three languages, one right-to-left",
      label: "Mirrored layout and per-script typography, not machine translation",
      verified: true,
    },
    {
      kind: "team",
      value: "One person, end to end",
      label: "Art direction, UX, engineering and content",
      verified: true,
    },
  ],

  publicBlocks: [
    {
      type: "lead",
      text: "A wedding is a logistics problem wearing a nice outfit. Two hundred decisions — where, when, how to get there, what to wear, where to sleep, what to give — arriving at people through group chats and PDF attachments, each version slightly out of date with the last. Gabriela and I were about to inflict that on our own guests, several of whom don't read Portuguese and were flying in from abroad.",
    },
    { type: "lead", text: "So I built the thing I'd have wanted as a guest: one link that always tells the truth." },

    { type: "heading", text: "The challenge" },
    { type: "paragraph", text: "The site had to do four jobs that pull against each other." },
    {
      type: "list",
      items: [
        "**Hold the logistics in one place.** Date, venue, time, dress code, lodging, how to get there — updated once, correct everywhere. The alternative is the attachment nobody can find and the message nobody scrolls back to.",
        "**Work for people who aren't from here.** Guests arriving at Congonhas, Guarulhos and the Tietê bus terminal, most of whom have never taken the São Paulo metro.",
        "**Work for people who don't read Portuguese.** Including Arabic, which reads right to left and is not a translation problem — it's a layout problem.",
        "**Not feel like a form.** It's an invitation. If it reads like a booking system, the logistics win and the occasion loses.",
      ],
    },
    {
      type: "paragraph",
      text: "And one constraint behind all of them: almost everyone would open it on a phone, from a WhatsApp link, on whatever connection they had at the time.",
    },
    {
      type: "image",
      src: "/cases/casamento/hero-3d.webp",
      alt: "The invitation's hero, a watercolour painting with the G&E monogram, on a tablet and a phone",
      caption: "What a guest sees when the link opens.",
    },

    { type: "heading", text: "The concept" },
    { type: "paragraph", text: "The decision that set everything else: the site is painted, not laid out." },
    {
      type: "paragraph",
      text: "Cold-press watercolour paper is the background of every screen. Photographs, video, ornaments and illustrations all sit on it in multiply blend mode, so nothing floats above the surface — everything looks absorbed into the same sheet. The palette is sage and olive, peach, terracotta, caramel, linen and slate. Italianno carries the headings in calligraphy, Cardo carries the reading, and the closing signature is handwritten in Grape Nuts.",
    },
    {
      type: "paragraph",
      text: "The reference was Regency elegance, but kept light. Period styling turns costume very quickly; the brief to myself was *the paper is historical, the pacing is not*.",
    },
    {
      type: "callout",
      title: "Why this isn't decoration",
      text: "Cards and buttons have no outlines — only colour and a soft shadow — because an outlined rectangle announces that it's an interface element. On paper, it reads as a sticker. Removing the border is what lets a *Confirm attendance* button sit on a watercolour page without breaking the illusion that it was painted there.",
    },
    {
      type: "image",
      src: "/cases/casamento/paper.webp",
      alt: "Close-up of a watercolour wash fading into the grain of the paper",
      caption: "Where the wash stops, the paper grain shows through.",
    },

    { type: "heading", text: "The experience" },
    {
      type: "paragraph",
      text: "**The hero paints itself as you scroll.** The couple appears pigment by pigment as the page moves. The G&E monogram and a *scroll down* cue float above it, because an animation triggered by scrolling is invisible to someone who doesn't know to scroll.",
    },
    {
      type: "paragraph",
      text: "**Our Story is told in chapters,** each with its own photographs and video, each painting itself in as it comes into view.",
    },
    {
      type: "paragraph",
      text: "**Every photo has a focal point.** Rather than centre-cropping, each image declares where the faces are, so a 720-pixel-tall laptop never cuts someone's head off. It's a small field in a content file and it's the difference between a portrait and an accident.",
    },
    {
      type: "paragraph",
      text: "**The map is deliberately small.** Twenty places around the venue — hotels, cafés, restaurants, shopping centres, salons — on OpenStreetMap tinted to the palette, with zoom and panning fenced to the neighbourhood. Scrolling the page doesn't zoom the map by accident. Clicking a pin highlights its card and clicking a card highlights its pin. It opens filtered to hotels, because that's the first question someone flying in actually has.",
    },
    {
      type: "paragraph",
      text: "**Getting there is a drawing, not a screenshot.** The first instinct was to paste the official metro map. It's unreadable on a phone and it's the wrong information — a guest doesn't need the network, they need *their* route. So the site has its own diagram: lines painted in brush strokes, every station drawn, interchanges emphasised, and a selector for where you're arriving from. Alongside it, *Important* and *Good to know* cards carry the things that ruin an evening if you don't know them — the reduced hours on Line 17-Gold, for instance.",
    },
    {
      type: "paragraph",
      text: "**RSVP and the gift list are other people's websites.** The wedding planner's platform handles both. Rather than throwing guests out to a page with someone else's branding, both open inside the site in a frame with the planner's header cropped away and ours in its place — logo, a way back, and an explicit *open in a new tab* for anyone who'd rather. The guest never feels handed off.",
    },
    {
      type: "paragraph",
      text: "**Arabic is mirrored, not translated.** The layout flips. Arabic script gets its own typefaces — Aref Ruqaa and Amiri — scoped to Arabic characters only, so proper names and numbers stay in Cardo and don't suddenly change personality mid-sentence. Every string lives in a typed dictionary across the three languages, which means a missing translation is a compile error rather than an English word surfacing in an Arabic paragraph.",
    },
    {
      type: "image",
      src: "/cases/casamento/ptar-3d.webp",
      alt: "The same section on two phones, in Portuguese and in Arabic, showing the mirrored layout and the typeface swap",
      caption: "Portuguese and Arabic, same section.",
    },
    {
      type: "image",
      src: "/cases/casamento/metro-3d.webp",
      alt: "The painted metro diagram on a tablet, showing the route from Congonhas airport",
      caption: "The route, drawn — not the official network map.",
    },
    {
      type: "image",
      src: "/cases/casamento/metro-rotas.gif",
      alt: "The arrival selector switching between Congonhas, Guarulhos and the Tietê bus terminal, each with its own route",
      caption: "Pick where you land, get your route.",
    },

    { type: "heading", text: "Engineering" },
    {
      type: "paragraph",
      text: "The watercolour is a shader. Three.js and WebGL, written for this project: transparent pigment, a chewed edge where the wash stops, and paper grain pulled through photographs and video. The paint advances either by scroll position or on a timer, depending on the section.",
    },
    { type: "paragraph", text: "Everything interesting about it is what happens when it meets a real phone." },
    {
      type: "list",
      items: [
        "**Contexts are a budget.** Phones cap how many WebGL contexts a page may hold. Once a photograph finishes painting, it becomes an ordinary image and hands its context back. Before that, the page stuttered.",
        "**GPUs get taken away.** If the browser drops the graphics context, the painting restores itself. If it can't, a pre-rendered fallback keeps the watercolour edge, so the page degrades to something that still looks intentional.",
        "**Viewport height is frozen at load.** On iPhone, the browser chrome hides and returns as you scroll, and `100vh` changes with it — sections resize mid-scroll and the page jumps under your thumb. Measuring once, in pixels, and holding that number is the fix.",
        "**No Google Fonts.** Typefaces are served from our own domain and loaded only when a language needs them. The paper texture is a 13 kB tile generated in code rather than a photographed sheet.",
      ],
    },
    {
      type: "paragraph",
      text: "**How it was built.** I wrote it by directing an AI coding agent — through screenshots, screen recordings and conversation — with unit and integration tests keeping each change honest. The hero film was generated with Higgsfield. The tools wrote a lot of the code; the decisions on this page are mine.",
    },
    {
      type: "callout",
      title: "The decision I'd defend hardest",
      text: "The first version of Our Story pinned the screen while each photograph painted. On desktop it was the best thing in the build. On a phone it felt broken — the page simply stopped responding to the thumb, and nothing on screen explained why. We replaced it with paint-on-a-timer and free scrolling. The effect is less impressive and the section is better. Scroll is the one gesture a user owns; taking it away has to buy more than it costs, and here it didn't.",
    },

    { type: "heading", text: "What I'd do differently" },
    {
      type: "list",
      items: [
        "**I'd have tested on a phone on day one.** The scroll-lock survived weeks because it was wonderful on the machine it was built on. The first screen recording on a real device killed it in under a minute. Everything expensive I learned on this project, I learned from a screen recording.",
        "**I'd have treated Arabic as a layout decision, not a language one.** Adding Arabic after the layout existed meant revisiting spacing, alignment and icon direction across the site. Had it been a constraint from the first screen, it would have cost a fraction.",
        "**I'd budget the beauty.** A pigment shader is a fixed cost paid by every device, and the cheapest phone in the guest list sets the ceiling. Knowing that number first would have shaped the art direction rather than being discovered by it.",
      ],
    },

    { type: "heading", text: "Results" },
    {
      type: "paragraph",
      text: "One link resolves logistics, attendance and gifts, in three languages, with an identity that belongs to the couple rather than to a template. The wedding is in April 2027 — the numbers on how guests actually used it will be added here after the day, not before.",
    },
    {
      type: "timeline",
      title: "Process",
      items: [
        { when: "19 Aug 2026", what: "First commit" },
        { when: "23 Sep – 1 Oct 2026", what: "The intense stretch: most of the build, the shader and the phone fixes" },
        { when: "In total", what: "123 commits across 10 active days" },
      ],
    },
  ],

  deepBlocks: [],
  stats: { publicViews: 0, deepRequests: 0, deepViews: 0 },
};
