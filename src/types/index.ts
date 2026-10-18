export interface StudentProfile {
name: string;
academicScore: number;
preferredBranch: string;
careerInterest: string;
location: string;
budget: number;
}

export interface College {
id: number;
name: string;
location: string;
branch: string;
annualTuition: number;
annualLivingCost: number;
interestMatch: number;
academicSuitability: number;
careerMatch: number;
dataStatus: string;
}

export interface CollegeRecommendation extends College {
totalCost: number;
budgetMatch: number;
suitabilityScore: number;
}
