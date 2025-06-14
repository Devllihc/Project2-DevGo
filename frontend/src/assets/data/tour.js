import tourImg01 from "../t1.jpg";
import tourImg02 from "../t2.jpg";
import tourImg03 from "../t3.jpg";
import tourImg04 from "../t4.jpg";
import tourImg05 from "../t5.jpg";
import tourImg06 from "../t6.jpg";
import tourImg07 from "../t7.jpg";

const tours = [
  {
    id: "01",
    title: "Westminster Bridge",
    city: "London",
    distance: 300,
    price: 10000,
    maxGroupSize: 10,
    desc: "Experience the iconic Westminster Bridge, offering stunning views of the Houses of Parliament and Big Ben in the heart of London.",
    availableDates: ["5-1-2025", "2-1-2025", "7-2-2025"],
    reviews: [
      {
        name: "John Doe",
        rating: 4.6,
      },
    ],
    avgRating: 4.5,
    photo: tourImg01,
    featured: true,
  },
  {
    id: "02",
    title: "Bali, Indonesia",
    city: "Indonesia",
    distance: 400,
    price: 10000,
    maxGroupSize: 8,
    desc: "Relax in the tropical paradise of Bali, Indonesia, known for its beaches, jungles, and vibrant culture.",
    availableDates: ["5-1-2025", "2-1-2025", "7-2-2025"],
    reviews: [
      {
        name: "John Doe",
        rating: 4.6,
      },
    ],
    avgRating: 4.5,
    photo: tourImg02,
    featured: true,
  },
  {
    id: "03",
    title: "Snowy Mountains, Thailand",
    city: "Thailand",
    distance: 500,
    price: 10000,
    maxGroupSize: 8,
    desc: "Discover the serene beauty of the Snowy Mountains in Thailand, perfect for adventurers and nature lovers.",
    availableDates: ["5-1-2025", "2-1-2025", "7-2-2025"],
    reviews: [
      {
        name: "John Doe",
        rating: 4.6,
      },
    ],
    avgRating: 4.5,
    photo: tourImg03,
    featured: true,
  },
  {
    id: "04",
    title: "Beautiful Sunrise, Thailand",
    city: "Thailand",
    distance: 500,
    price: 10000,
    maxGroupSize: 8,
    desc: "Wake up early to witness the breathtaking sunrise over Thailand's stunning landscapes.",
    availableDates: ["5-1-2025", "2-1-2025", "7-2-2025"],
    reviews: [
      {
        name: "John Doe",
        rating: 4.6,
      },
    ],
    avgRating: 4.5,
    photo: tourImg04,
    featured: true,
  },
  {
    id: "05",
    title: "Nusa Pendia Bali, Indonesia",
    city: "Indonesia",
    distance: 500,
    price: 10000,
    maxGroupSize: 8,
    desc: "Explore the exotic beauty of Nusa Pendia, a tranquil island near Bali, offering pristine beaches and crystal-clear waters.",
    availableDates: ["5-1-2025", "2-1-2025", "7-2-2025"],
    reviews: [
      {
        name: "John Doe",
        rating: 4.6,
      },
    ],
    avgRating: 4.5,
    photo: tourImg05,
    featured: false,
  },
  {
    id: "06",
    title: "Cherry Blossoms Spring",
    city: "Japan",
    distance: 500,
    price: 10000,
    maxGroupSize: 8,
    desc: "Experience the magic of Japan in spring, as cherry blossoms bloom, transforming the country into a pink wonderland.",
    availableDates: ["5-1-2025", "2-1-2025", "7-2-2025"],
    reviews: [
      {
        name: "John Doe",
        rating: 4.6,
      },
    ],
    avgRating: 4.5,
    photo: tourImg06,
    featured: false,
  },
  {
    id: "07",
    title: "Holmen Lofoten",
    city: "France",
    distance: 500,
    price: 10000,
    maxGroupSize: 8,
    desc: "Explore the rugged beauty of Holmen Lofoten, with its dramatic landscapes, crystal-clear waters, and vibrant fishing villages.",
    availableDates: ["5-1-2025", "2-1-2025", "7-2-2025"],
    reviews: [
      {
        name: "John Doe",
        rating: 4.6,
      },
    ],
    avgRating: 4.5,
    photo: tourImg07,
    featured: false,
  },
  {
    id: "08",
    title: "Snowy Mountains, Thailand",
    city: "Thailand",
    distance: 500,
    price: 10000,
    maxGroupSize: 8,
    desc: "Revisit the magical Snowy Mountains, Thailand, a place of tranquility and adventure perfect for a memorable getaway.",
    availableDates: ["5-1-2025", "2-1-2025", "7-2-2025"],
    reviews: [
      {
        name: "John Doe",
        rating: 4.6,
      },
    ],
    avgRating: 4.5,
    photo: tourImg03,
    featured: false,
  },
];

export default tours;
