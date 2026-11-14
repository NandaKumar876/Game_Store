export type Game = {
  id: number;
  title: string;
  genre: string;
  price: number;
  original: number;
  rating: string;
  tag: string;
  color: string;
  description: string;
};
export const games: Game[] = [
  {
    id: 1091500,
    title: "Cyberpunk 2077",
    genre: "RPG",
    price: 29.99,
    original: 59.99,
    rating: "9.2",
    tag: "BESTSELLER",
    color: "#e9ff51",
    description:
      "Become an urban mercenary in Night City, a sprawling metropolis obsessed with power, glamour, and body modification.",
  },
  {
    id: 1245620,
    title: "Elden Ring",
    genre: "RPG",
    price: 41.99,
    original: 59.99,
    rating: "9.8",
    tag: "EDITOR'S PICK",
    color: "#d9bd7a",
    description:
      "Rise, Tarnished. Journey through the Lands Between and discover a vast fantasy world filled with mystery and unforgettable battles.",
  },
  {
    id: 1145360,
    title: "Hades",
    genre: "Roguelike",
    price: 12.49,
    original: 24.99,
    rating: "9.6",
    tag: "INDIE GEM",
    color: "#ff624b",
    description:
      "Defy the god of the dead as you battle your way out of the Underworld in this endlessly replayable rogue-like dungeon crawler.",
  },
  {
    id: 1086940,
    title: "Baldur’s Gate 3",
    genre: "RPG",
    price: 47.99,
    original: 59.99,
    rating: "9.7",
    tag: "TOP RATED",
    color: "#b58dff",
    description:
      "Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival.",
  },
  {
    id: 1174180,
    title: "Red Dead Redemption 2",
    genre: "Adventure",
    price: 19.79,
    original: 59.99,
    rating: "9.5",
    tag: "GREAT DEAL",
    color: "#ff5757",
    description:
      "Experience an epic tale of life in America at the dawn of the modern age. Explore a richly detailed world as outlaw Arthur Morgan.",
  },
  {
    id: 990080,
    title: "Hogwarts Legacy",
    genre: "Adventure",
    price: 23.99,
    original: 59.99,
    rating: "8.9",
    tag: "MAGIC AWAITS",
    color: "#7cb8db",
    description:
      "Your legacy is what you make of it. Explore Hogwarts and the surrounding world in this immersive open-world action RPG.",
  },
  {
    id: 1551360,
    title: "Forza Horizon 5",
    genre: "Racing",
    price: 29.99,
    original: 59.99,
    rating: "9.3",
    tag: "FULL THROTTLE",
    color: "#fa63ba",
    description:
      "Lead breathtaking expeditions across the vibrant open world of Mexico with limitless driving action in hundreds of incredible cars.",
  },
  {
    id: 413150,
    title: "Stardew Valley",
    genre: "Simulation",
    price: 11.99,
    original: 14.99,
    rating: "9.8",
    tag: "COZY FAVORITE",
    color: "#94dd8c",
    description:
      "Build the farm of your dreams. Raise animals, grow crops, and become a part of a welcoming community in the countryside.",
  },
];
export const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value,
  );
export const cover = (id: number) => `/games/${id}.jpg`;
