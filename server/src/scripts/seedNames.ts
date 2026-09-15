// Fictional name components for DEMO DATA only — combined at random to
// produce employee records. None of these identify a real person; see
// ARCH-SPEC RSK·10 ("demo data mistaken for real HR data").

export const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Kabir', 'Rohan', 'Nikhil', 'Aditya', 'Karan', 'Yash',
  'Dhruv', 'Manav', 'Sahil', 'Rishi', 'Arjun', 'Vikram', 'Om', 'Parth',
  'Isha', 'Anaya', 'Diya', 'Priya', 'Sneha', 'Riya', 'Kavya', 'Meera',
  'Nisha', 'Pooja', 'Sanya', 'Tanvi', 'Ananya', 'Shreya', 'Juhi', 'Neha',
];

export const LAST_NAMES = [
  'Patel', 'Shah', 'Mehta', 'Desai', 'Trivedi', 'Joshi', 'Pandya', 'Rana',
  'Chauhan', 'Vora', 'Parekh', 'Bhatt', 'Solanki', 'Thakkar', 'Amin', 'Raval',
];

export function randomFullName(rng: () => number): string {
  const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
  return `${first} ${last}`;
}
