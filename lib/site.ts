export const site = {
  name: "The Shepherd's Crew",
  tagline: "Restoring the lost sheep.",
  scripture: "John 21:15–17",
  established: 2016,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://theshepherdscrew.org",
  contacts: [
    { name: "Abigail", phone: "09073301378" },
    { name: "Mercy", phone: "08135064095" },
  ],
  pillars: [
    "Teach the word",
    "Pray together",
    "Disciple intentionally",
    "Raise kingdom leaders",
  ],
} as const;
