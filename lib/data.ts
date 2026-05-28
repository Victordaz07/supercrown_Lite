import { themeColors } from "./colors";

export type MenuCategory = "Box Lunch" | "Grab-n-Go";
export type ThemeColorKey = keyof typeof themeColors;

const img = (name: string) => `/images/${encodeURIComponent(name + ".avif")}`;

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  imagePlaceholder: ThemeColorKey;
  image?: string;
}

export interface Review {
  id: string;
  author: string;
  role: string;
  text: string;
  rating: number;
}

export interface Service {
  id: string;
  title: string;
  tag: string;
  description: string;
  cta: string;
  imagePlaceholder: ThemeColorKey;
  image?: string;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}

export const heroImage = "/images/" + encodeURIComponent("snack tray.avif");

export const reviews: Review[] = [
  {
    id: "1",
    author: "Sarah Mitchell",
    role: "Event Coordinator",
    text: "Super Crown made our corporate retreat unforgettable. The box lunches were fresh, delicious, and everyone kept asking where we got them!",
    rating: 5,
  },
  {
    id: "2",
    author: "James Chen",
    role: "School Administrator",
    text: "We've ordered from Super Crown for three years now. Consistent quality, on-time delivery, and the kids love the grab-n-go options.",
    rating: 5,
  },
  {
    id: "3",
    author: "Maria Gonzalez",
    role: "Wedding Planner",
    text: "The catering for our client's rehearsal dinner was exceptional. Beautiful presentation and the dishes were a hit.",
    rating: 5,
  },
];

export const services: Service[] = [
  {
    id: "1",
    title: "Box Lunches",
    tag: "Corporate & Events",
    description: "Individually packaged, fresh boxed meals perfect for meetings, trainings, and events.",
    cta: "Learn more",
    imagePlaceholder: "stone",
    image: img("snack tray"),
  },
  {
    id: "2",
    title: "Grab-n-Go",
    tag: "Quick & Fresh",
    description: "Wraps, sandwiches, and snacks ready to grab. Ideal for schools, offices, and busy schedules.",
    cta: "Learn more",
    imagePlaceholder: "olive",
    image: img("turkey chesse"),
  },
];

export const steps: Step[] = [
  { number: "01", title: "Choose your menu",   description: "Browse our selections and pick the items that fit your event—from box lunches to grab-n-go." },
  { number: "02", title: "Send your request",  description: "Fill out our quick quote form with your details. We'll respond within 24 hours." },
  { number: "03", title: "We deliver fresh",   description: "Enjoy freshly prepared meals delivered on time. No hassle, no stress—just great food." },
];

export const trustItems: string[] = [
  "Family-Owned Business",
  "Fresh Daily Ingredients",
  "On-Time Delivery",
  "Fully Customizable",
  "Corporate & Private Events",
];
