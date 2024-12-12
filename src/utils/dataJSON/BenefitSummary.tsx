//Heading

export const tableHeader = [
  { id: 1, label: "Name" },
  { id: 2, label: "Applicants" },
  { id: 3, label: "Approved" },
  { id: 4, label: "Rejected" },
  { id: 5, label: "Disbursal Pending" },
  { id: 6, label: "Deadline" },
  { id: 7, label: "Action" },
];

export const visualRepresentation = {
  applicantsDisbursals: Array.from(
    { length: 7 },
    (_, i) => ({
      label: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleString(
        "en-us",
        { weekday: "long" }
      ),
      count: Math.floor(Math.random() * 100),
    }) // Extract the first 2 letters
  ),
  gender: [
    { label: "Male", count: 13 },
    { label: "Female", count: 27 },
    { label: "Others", count: 60 },
  ],
  caste: [
    { label: "SC", count: 13 },
    { label: "ST", count: 27 },
    { label: "OBC", count: 60 },
  ],
  standard: [
    { label: "15-25", count: 13 },
    { label: "25-35", count: 27 },
    { label: "45-55", count: 60 },
  ],
  ratio: [
    { label: "Day Scholars", count: 13 },
    { label: "Hostlers", count: 27 },
    { label: "Others", count: 60 },
  ],
};

// sample data for card on dashboard
export const cardData = [
  {
    id: 1,
    title: "Pre-Matric Scholarship-General",
    totalApplications: 4325,
    totalDisbursed: "1,00,000",
  },
  {
    id: 2,
    title: "Pre-Matric Scholarship-ST",
    totalApplications: 4325,
    totalDisbursed: "1,00,000",
  },
  {
    id: 3,
    title: "Pre-Matric Scholarship-SC",
    totalApplications: 4325,
    totalDisbursed: "1,00,000",
  },
];
