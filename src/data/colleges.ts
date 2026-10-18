import type { College } from '../types';

export const colleges: College[] = [
  {
    id: 1,
    name: 'Geethanjali Institute of Science and Technology',
    location: 'Nellore, Andhra Pradesh',
    branch: 'Computer Science Engineering',

    // Official Category A tuition for 2025–26
    annualTuition: 55200,

    // Estimated annual day-to-day living expenses.
    // This is NOT an official college charge.
    annualLivingCost: 60000,

    // Illustrative recommendation inputs, not official ratings.
    interestMatch: 85,
    academicSuitability: 80,
    careerMatch: 85,

    dataStatus:
      'Tuition verified for 2025–26. Living cost is estimated. Recheck tuition for 2026–27. Source: https://gist.edu.in/gist/fee-structure/',
  },

  {
    id: 2,
    name: "Vignan's Foundation for Science, Technology and Research",
    location: 'Vadlamudi, Guntur, Andhra Pradesh',
    branch: 'Computer Science Engineering',

    // Official Category A CSE tuition for 2026–27
    annualTuition: 280000,

    // Official annual non-AC hostel fee.
    // Mess and personal expenses may be additional.
    annualLivingCost: 120000,

    // Illustrative recommendation inputs, not official ratings.
    interestMatch: 90,
    academicSuitability: 85,
    careerMatch: 90,

    dataStatus:
      'Official 2026–27 Category A CSE tuition and non-AC hostel fee. Hostel registration costs ₹5,000 extra; confirm mess and other charges. Source: https://vignan.ac.in/newvignan/fee_str.php',
  },

  {
    id: 3,
    name: 'National Institute of Technology Andhra Pradesh',
    location: 'Tadepalligudem, Andhra Pradesh',
    branch: 'Computer Science and Engineering',

    // Official tuition: ₹62,500 per semester.
    annualTuition: 125000,

    // Estimated annual hostel, food and personal expenses.
    // Official hostel and mess charges must be checked separately.
    annualLivingCost: 140000,

    // Illustrative recommendation inputs, not official ratings.
    interestMatch: 90,
    academicSuitability: 90,
    careerMatch: 90,

    dataStatus:
      'Official 2026–27 tuition. Estimated living expenses; hostel and mess charges require confirmation. First-year institute fees include charges beyond tuition. Source: https://nitandhra.ac.in/main/btech.php',
  },
];