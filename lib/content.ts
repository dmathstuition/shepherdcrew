/**
 * Every word on the site lives here.
 * Edit copy in this file — never inside a component.
 */

export const about = {
  eyebrow: "Est. 2016",
  headline: ["WE EXIST TO", "INVADE TERRITORIES", "WITH GOD'S", "PRESENCE"],
  body: [
    "The Shepherd's Crew began in 2016 as a group of worshippers with one intent — to worship the Father and restore the lost sheep.",
    "We are a Christ-centred ministry committed to raising passionate worshippers and bold witnesses of Christ, creating spiritual atmospheres where lives are transformed through worship, praise, and the undiluted preaching of the Gospel.",
  ],
  pullquote:
    "We reconcile souls to Christ and equip believers to live out the Great Commission.",
};

export const mission =
  "To spread the Gospel of Jesus Christ through worship, praise, and evangelism — raising a generation of believers who carry God's presence, win souls, and disciple others across campuses and communities.";

export const vision =
  "To raise a generation of true worshippers and bold witnesses who carry God's presence, proclaim the Gospel of Jesus Christ, and make His name known across campuses, communities, and nations.";

export const mandate = [
  "Worship God in spirit and in truth",
  "Win souls for Christ",
  "Disciple and equip believers",
  "Spread the fame of Jesus everywhere",
];

export const faith = [
  "One God, eternally existing as Father, Son, and Holy Spirit.",
  "Jesus Christ, the Son of God — His virgin birth, sinless life, sacrificial death, resurrection, and return.",
  "The authority of the Holy Bible as the inspired and infallible Word of God.",
  "Salvation by grace through faith in Jesus Christ alone.",
  "The indwelling and work of the Holy Spirit, empowering believers to live godly lives.",
  "The importance of prayer, discipleship, and holy living.",
  "The Great Commission — to disciple nations and raise believers who live for God's glory.",
];

export const mjfGoals = [
  {
    title: "Build strong biblical foundations",
    body: "Members know God deeply and apply His Word daily through the 365-day Bible Completion Challenge.",
  },
  {
    title: "Ignite intimacy with God",
    body: "A lifestyle of prayer built through daily and weekly online prayer sessions.",
  },
  {
    title: "Discipleship and mentoring",
    body: "Equipping members to lead themselves and others with humility, integrity, and the fear of God.",
  },
  {
    title: "Shape godly relationships",
    body: "Christlike character and healthy patterns in friendship, marriage preparation, and emotional life.",
  },
  {
    title: "Finance and leadership",
    body: "Building a kingdom entrepreneur mindset — and equipping members to pass it on.",
  },
  {
    title: "Redefine culture and media",
    body: "Conversations and teaching on godly entertainment and media discernment.",
  },
];

/**
 * Past programs the ministry has held. Photos are real event images; add more
 * program entries here as future editions happen.
 */
export const pastPrograms = [
  {
    name: "Outpouring",
    edition: "Atmosphere of Worship & Praise · 8th Edition",
    year: "2025",
    blurb:
      "A God-saturated night of worship, revival, and praise. The room filled, burdens lifted, and a generation encountered God's presence together.",
    images: [
      { src: "/programs/outpouring-01.jpg", alt: "The congregation in worship at Outpouring, 8th Edition", width: 2560, height: 1706 },
      { src: "/programs/outpouring-04.jpg", alt: "The congregation dancing in praise at Outpouring, 8th Edition", width: 2560, height: 1706 },
      { src: "/programs/outpouring-03.jpg", alt: "Worship leaders ministering on stage at Outpouring, 8th Edition", width: 1600, height: 1066 },
      { src: "/programs/outpouring-06.jpg", alt: "The Shepherd's Crew team group photo at Outpouring, 8th Edition", width: 1600, height: 1066 },
      { src: "/programs/outpouring-05.jpg", alt: "Young adults gathered for the evening session at Outpouring, 8th Edition", width: 1600, height: 1066 },
      { src: "/programs/outpouring-02.jpg", alt: "The Shepherd's Crew team at Outpouring, 8th Edition", width: 1600, height: 1066 },
    ],
  },
];

/**
 * Testimonies shared after Outpouring 2025 — displayed as the original
 * screenshots for authenticity. `quote` is a short transcription used as the
 * accessible label and search text; `caption` is the visible attribution.
 */
export const testimonies = [
  {
    src: "/testimonies/testimony-01.jpg",
    width: 828,
    height: 864,
    caption: "Outpouring 2025",
    quote:
      "The outpouring wasn't just a program, it was a divine encounter. I felt seen, healed and held by God. I came in expectant and left transformed.",
  },
  {
    src: "/testimonies/testimony-04.jpg",
    width: 828,
    height: 804,
    caption: "Outpouring 2025",
    quote:
      "Yahweh be glorified — Outpouring 2025 was fire. The level of the Holy Ghost we carry will determine the level we pour out.",
  },
  {
    src: "/testimonies/testimony-02.jpg",
    width: 814,
    height: 546,
    caption: "Outpouring 2025",
    quote:
      "My experience was second to none. The programme really unlocked something in me. Prayer is a must!",
  },
  {
    src: "/testimonies/testimony-03.jpg",
    width: 717,
    height: 583,
    caption: "Outpouring 2025",
    quote:
      "Truly, I was deeply blessed. The teaching was so deep and timely — it spoke to my heart. Thank you for organizing such a powerful program.",
  },
];

export const programs = [
  "Atmosphere of Worship & Praise (AOWAP)",
  "Believers Foundational Class",
  "Making Jesus Famous (MJF)",
  "Campus Invasion",
];

/* ------------------------------------------------------------------ */
/* Believers Foundational Class                                        */
/* TODO: replace the week outlines below with your real curriculum.    */
/* ------------------------------------------------------------------ */

export const bfc = {
  cohort: "Cohort 1.0",
  theme: "The Sent Generation",
  length: "Three weeks",
  sessions: ["10:00 PM", "5:30 AM"],
  venue: "Telegram",
  startsOn: null as string | null,
  intro:
    "Three weeks of intensive teaching for new and returning believers — laying the foundations of faith, prayer, and the Word before anything gets built on top of them.",
  weeks: [
    {
      label: "Week one",
      title: "Salvation and assurance",
      topics: [
        "What actually happened at the new birth",
        "Repentance, faith, and grace",
        "Assurance: how you know you are His",
        "Baptism and the believer's first steps",
      ],
    },
    {
      label: "Week two",
      title: "The Word and the life of prayer",
      topics: [
        "Reading the Bible so it changes you",
        "Building a prayer life that survives a busy week",
        "The person and work of the Holy Spirit",
        "Holiness as a lifestyle, not a performance",
      ],
    },
    {
      label: "Week three",
      title: "Sent",
      topics: [
        "Identity: who you are before what you do",
        "Your place in the local church",
        "Witnessing where you already are",
        "Carrying the Great Commission into your campus",
      ],
    },
  ],
  assessment: {
    title: "Weekly review, not an exam to fear",
    body: "Each week closes with a short review in the class portal. The result is not a grade — it tells the teaching team which foundation still needs strengthening before the cohort moves on.",
  },
};
