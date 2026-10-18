import type {
College,
CollegeRecommendation,
} from '../types';

export function calculateRecommendations(
colleges: College[],
budget: number,
): CollegeRecommendation[] {
return colleges
.map((college) => {
const totalCost =
(college.annualTuition + college.annualLivingCost) * 4;


  // Budget compatibility: 100 when the estimated cost
  // fits the budget; otherwise, reduce the score.
  const budgetMatch =
    budget <= 0
      ? 0
      : Math.max(
          0,
          Math.min(100, (budget / totalCost) * 100),
        );

  // Budget fit is capped at 100 so a cheaper college
  // cannot dominate every other preference.
  const suitabilityScore = Math.round(
    college.interestMatch * 0.3 +
      college.academicSuitability * 0.25 +
      budgetMatch * 0.25 +
      college.careerMatch * 0.2,
  );

  return {
    ...college,
    totalCost,
    budgetMatch: Math.round(budgetMatch),
    suitabilityScore,
  };
})
.sort(
  (a, b) => b.suitabilityScore - a.suitabilityScore,
);


}
