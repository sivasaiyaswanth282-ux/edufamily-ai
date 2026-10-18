import { useEffect, useMemo, useState } from 'react';

import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  GraduationCap,
  IndianRupee,
  LayoutDashboard,
  Menu,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Search,
} from 'lucide-react';

import CollegeDirectory from './components/CollegeDirectory';
import CollegeComparison from './components/CollegeComparison';
import { testConnection } from './services/testConnection';

import { colleges } from './data/colleges';
import { calculateRecommendations } from './engine/recommendationEngine';
import type { StudentProfile } from './types';

import './App.css';

type Page =
  | 'Dashboard'
  | 'Student Profile'
  | 'Budget Planner'
  | 'Recommendations'
  | 'Family Decisions'
  | 'College Directory'
  | 'College Comparison';

const navigation: {
  label: Page;
  icon: typeof LayoutDashboard;
}[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Student Profile', icon: GraduationCap },
  { label: 'Budget Planner', icon: IndianRupee },
  { label: 'Recommendations', icon: BrainCircuit },
  { label: 'Family Decisions', icon: Users },
  { label: 'College Directory', icon: Search },
  { label: 'College Comparison', icon: Scale },
];

const initialProfile: StudentProfile = {
  name: '',
  academicScore: 85,
  preferredBranch: 'Computer Science and Engineering',
  careerInterest: 'Software Development',
  location: 'Andhra Pradesh',
  budget: 600000,
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function App() {
  const [page, setPage] = useState<Page>('Dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('edufamily-profile');

      return saved
        ? { ...initialProfile, ...JSON.parse(saved) }
        : initialProfile;
    } catch {
      return initialProfile;
    }
  });

  const [profileSaved, setProfileSaved] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const recommendations = useMemo(
    () => calculateRecommendations(colleges, profile.budget),
    [profile.budget],
  );

  useEffect(() => {
    void testConnection();
  }, []);

  const updateProfile = <K extends keyof StudentProfile>(
    key: K,
    value: StudentProfile[K],
  ) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setProfileSaved(false);
  };

  const saveProfile = () => {
    localStorage.setItem('edufamily-profile', JSON.stringify(profile));
    setProfileSaved(true);
  };

  const goTo = (nextPage: Page) => {
    setPage(nextPage);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedColleges = recommendations.filter((college) =>
    selectedIds.includes(college.id),
  );

  const totalAnnualBudget = profile.budget / 4;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            <GraduationCap size={25} />
          </div>

          <div>
            <h2>
              EduFamily<span> AI</span>
            </h2>
            <p>DECISIONS THAT MATTER</p>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${page === label ? 'active' : ''}`}
              onClick={() => goTo(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {page === label && <span className="active-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="privacy-card">
            <ShieldCheck size={23} />
            <h4>Your future, your choice.</h4>
            <p>
              Get transparent recommendations and make informed education
              decisions together.
            </p>
          </div>

          <p className="sidebar-footer">EDUFAMILY AI · HACKATHON DEMO</p>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={23} />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{page}</strong>
          </div>

          <div className="topbar-right">
            <span className="status-pill">
              <span className="status-dot" /> Demo environment
            </span>

            <div className="avatar">
              {(profile.name.trim()[0] || 'S').toUpperCase()}
            </div>
          </div>
        </header>

        <div className="page-content">
          {/* DASHBOARD */}
          {page === 'Dashboard' && (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">
                    <Sparkles size={15} /> YOUR EDUCATION COMPANION
                  </div>

                  <h1>
                    Build your future,
                    <br />
                    <span>together.</span>
                  </h1>

                  <p className="welcome-description">
                    A smarter way for students and families to explore
                    engineering education, understand costs, and make confident
                    decisions.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() => goTo('Student Profile')}
                  >
                    Start your journey <ArrowRight size={18} />
                  </button>
                </div>

                <div className="hero-illustration">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />

                  <div className="hero-glow">
                    <GraduationCap size={84} strokeWidth={1.4} />
                  </div>

                  <div className="floating-chip chip-top">
                    <Sparkles size={16} /> Smarter choices
                  </div>

                  <div className="floating-chip chip-bottom">
                    <Users size={17} /> Family first
                  </div>
                </div>
              </section>

              <section className="stats-grid">
                <StatCard
                  icon={<GraduationCap size={21} />}
                  label="Demo options"
                  value={String(colleges.length)}
                  caption="Illustrative institutions"
                  color="purple"
                />

                <StatCard
                  icon={<IndianRupee size={21} />}
                  label="Your total budget"
                  value={formatMoney(profile.budget)}
                  caption="For four academic years"
                  color="green"
                />

                <StatCard
                  icon={<Scale size={21} />}
                  label="Options within budget"
                  value={String(
                    recommendations.filter(
                      (college) => college.totalCost <= profile.budget,
                    ).length,
                  )}
                  caption="Based on demo cost estimates"
                  color="orange"
                />
              </section>

              <section className="dashboard-grid">
                <div className="panel recommendations-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">SMART MATCHING</div>
                      <h2>Explore your options</h2>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => goTo('Recommendations')}
                    >
                      View all <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="recommendation-list">
                    {recommendations.slice(0, 3).map((college, index) => (
                      <div className="college-row" key={college.id}>
                        <div className={`college-icon college-icon-${index}`}>
                          <GraduationCap size={23} />
                        </div>

                        <div className="college-details">
                          <h3>{college.name}</h3>
                          <p>{college.branch}</p>
                          <span className="college-location">
                            {college.location}
                          </span>
                        </div>

                        <div className="match-score">
                          <strong>{college.suitabilityScore}</strong>
                          <span>Suitability</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="demo-notice">
                    <Activity size={16} />
                    Demo data only. These scores do not represent admission
                    chances.
                  </div>
                </div>

                <div className="panel quick-panel">
                  <div className="section-kicker">GETTING STARTED</div>
                  <h2>Your decision journey</h2>
                  <p className="panel-description">
                    Complete these steps to personalize your experience.
                  </p>

                  <JourneyStep
                    number="01"
                    title="Student profile"
                    description="Set your interests and academic score."
                    onClick={() => goTo('Student Profile')}
                  />

                  <JourneyStep
                    number="02"
                    title="Family budget"
                    description="Define your four-year education budget."
                    onClick={() => goTo('Budget Planner')}
                  />

                  <JourneyStep
                    number="03"
                    title="Compare options"
                    description="Explore suitability and estimated costs."
                    onClick={() => goTo('Recommendations')}
                  />

                  <JourneyStep
                    number="04"
                    title="Find colleges"
                    description="Search the college directory."
                    onClick={() => goTo('College Directory')}
                  />
                </div>
              </section>

              <section className="family-banner">
                <div className="family-banner-icon">
                  <Users size={27} />
                </div>

                <div>
                  <h3>Big decisions are better together.</h3>
                  <p>
                    Balance student ambitions with family priorities through
                    transparent comparisons.
                  </p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => goTo('Family Decisions')}
                >
                  Explore family mode <ArrowRight size={17} />
                </button>
              </section>
            </>
          )}

          {/* STUDENT PROFILE */}
          {page === 'Student Profile' && (
            <section className="content-section">
              <PageHeading
                eyebrow="PERSONALIZATION"
                title="Tell us about yourself."
                description="Your preferences help us explain which educational options may suit you."
              />

              <form
                className="panel form-panel"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveProfile();
                }}
              >
                <h2>Student information</h2>

                <p className="panel-description">
                  Fields marked optional can be left blank.
                </p>

                <div className="form-grid">
                  <Field label="Your name (optional)">
                    <input
                      value={profile.name}
                      onChange={(event) =>
                        updateProfile('name', event.target.value)
                      }
                      placeholder="Enter your name"
                      maxLength={80}
                    />
                  </Field>

                  <Field label="Academic score (%)">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={profile.academicScore}
                      onChange={(event) =>
                        updateProfile(
                          'academicScore',
                          Number(event.target.value),
                        )
                      }
                    />
                  </Field>

                  <Field label="Preferred engineering branch">
                    <select
                      value={profile.preferredBranch}
                      onChange={(event) =>
                        updateProfile('preferredBranch', event.target.value)
                      }
                    >
                      <option>Computer Science Engineering</option>
                      <option>Information Technology</option>
                      <option>
                        Electronics and Communication Engineering
                      </option>
                      <option>Mechanical Engineering</option>
                      <option>Electrical Engineering</option>
                      <option>Civil Engineering</option>
                      <option>Not sure yet</option>
                    </select>
                  </Field>

                  <Field label="Career interest">
                    <select
                      value={profile.careerInterest}
                      onChange={(event) =>
                        updateProfile('careerInterest', event.target.value)
                      }
                    >
                      <option>Software Development</option>
                      <option>Artificial Intelligence</option>
                      <option>Electronics and Robotics</option>
                      <option>Core Engineering</option>
                      <option>Research and Higher Studies</option>
                      <option>Government Jobs</option>
                      <option>Not sure yet</option>
                    </select>
                  </Field>

                  <Field label="Preferred state">
                    <select
                      value={profile.location}
                      onChange={(event) =>
                        updateProfile('location', event.target.value)
                      }
                    >
                      <option>Andhra Pradesh</option>
                      <option>Telangana</option>
                      <option>Tamil Nadu</option>
                      <option>Karnataka</option>
                      <option>Any state</option>
                    </select>
                  </Field>

                  <Field label="Four-year family budget (₹)">
                    <input
                      type="number"
                      min="1"
                      max="100000000"
                      required
                      value={profile.budget}
                      onChange={(event) =>
                        updateProfile('budget', Number(event.target.value))
                      }
                    />
                  </Field>
                </div>

                <div className="form-actions">
                  <button className="primary-button" type="submit">
                    Save profile <CheckCircle2 size={17} />
                  </button>

                  {profileSaved && (
                    <span className="success-message">
                      Profile saved successfully.
                    </span>
                  )}
                </div>
              </form>
            </section>
          )}

          {/* BUDGET PLANNER */}
          {page === 'Budget Planner' && (
            <section className="content-section">
              <PageHeading
                eyebrow="FINANCIAL CLARITY"
                title="Plan your education budget."
                description="Understand estimated four-year costs before making a decision."
              />

              <div className="budget-layout">
                <div className="panel form-panel">
                  <h2>Family budget</h2>

                  <Field label="Total available budget (₹)">
                    <input
                      type="number"
                      min="1"
                      max="100000000"
                      value={profile.budget}
                      onChange={(event) =>
                        updateProfile('budget', Number(event.target.value))
                      }
                    />
                  </Field>

                  <div className="budget-summary">
                    <span>Estimated annual budget</span>
                    <strong>{formatMoney(totalAnnualBudget)}</strong>
                    <p>Your total budget divided across four years.</p>
                  </div>

                  <button className="primary-button" onClick={saveProfile}>
                    Save budget <CheckCircle2 size={17} />
                  </button>

                  {profileSaved && (
                    <p className="success-message">Budget saved.</p>
                  )}
                </div>

                <div className="panel">
                  <div className="section-kicker">COST OVERVIEW</div>
                  <h2>Compare estimated expenses</h2>

                  {recommendations.slice(0, 4).map((college) => (
                    <div className="cost-row" key={college.id}>
                      <div className="cost-row-top">
                        <span>{college.name}</span>
                        <strong>{formatMoney(college.totalCost)}</strong>
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${
                              profile.budget > 0
                                ? Math.min(
                                    100,
                                    (college.totalCost / profile.budget) * 100,
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>

                      <span
                        className={
                          college.totalCost <= profile.budget
                            ? 'cost-status affordable'
                            : 'cost-status over-budget'
                        }
                      >
                        {college.totalCost <= profile.budget
                          ? 'Within estimated budget'
                          : 'Exceeds estimated budget'}
                      </span>
                    </div>
                  ))}

                  <p className="demo-notice">
                    Cost estimates are illustrative and exclude unlisted
                    expenses or future fee changes.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* RECOMMENDATIONS */}
          {page === 'Recommendations' && (
            <section className="content-section">
              <PageHeading
                eyebrow="EXPLAINABLE MATCHING"
                title="Explore your best-fit options."
                description="Compare illustrative options using student interests, academic suitability, budget, and career alignment."
              />

              <div className="recommendation-grid">
                {recommendations.map((college) => (
                  <article
                    className="panel recommendation-card"
                    key={college.id}
                  >
                    <div className="card-topline">
                      <div className="college-icon">
                        <GraduationCap size={25} />
                      </div>

                      <span className="score-badge">
                        {college.suitabilityScore}/100
                      </span>
                    </div>

                    <h2>{college.name}</h2>

                    <p className="panel-description">{college.branch}</p>
                    <p className="college-location">{college.location}</p>

                    <div className="recommendation-cost">
                      <span>Estimated four-year cost</span>
                      <strong>{formatMoney(college.totalCost)}</strong>
                    </div>

                    <div className="score-breakdown">
                      <ScoreRow
                        label="Student interest"
                        score={college.interestMatch}
                      />
                      <ScoreRow
                        label="Academic suitability"
                        score={college.academicSuitability}
                      />
                      <ScoreRow
                        label="Budget compatibility"
                        score={college.budgetMatch}
                      />
                      <ScoreRow
                        label="Career alignment"
                        score={college.careerMatch}
                      />
                    </div>

                    <p className="data-label">{college.dataStatus}</p>

                    <button
                      className={
                        selectedIds.includes(college.id)
                          ? 'secondary-button selected-button'
                          : 'secondary-button full-button'
                      }
                      onClick={() =>
                        setSelectedIds((current) =>
                          current.includes(college.id)
                            ? current.filter((id) => id !== college.id)
                            : current.length < 3
                              ? [...current, college.id]
                              : current,
                        )
                      }
                    >
                      {selectedIds.includes(college.id)
                        ? '✓ Selected for comparison'
                        : selectedIds.length >= 3
                          ? 'Comparison limit reached'
                          : 'Add to comparison'}
                    </button>
                  </article>
                ))}
              </div>

              {selectedColleges.length > 0 && (
                <div className="panel comparison-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">SIDE-BY-SIDE</div>
                      <h2>College comparison</h2>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => setSelectedIds([])}
                    >
                      Clear selection
                    </button>
                  </div>

                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Option</th>
                          <th>Branch</th>
                          <th>Four-year cost</th>
                          <th>Suitability</th>
                          <th>Budget</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedColleges.map((college) => (
                          <tr key={college.id}>
                            <td>{college.name}</td>
                            <td>{college.branch}</td>
                            <td>{formatMoney(college.totalCost)}</td>
                            <td>{college.suitabilityScore}/100</td>
                            <td>
                              {college.totalCost <= profile.budget
                                ? 'Within budget'
                                : 'Over budget'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* FAMILY DECISIONS */}
          {page === 'Family Decisions' && (
            <section className="content-section">
              <PageHeading
                eyebrow="DECIDE TOGETHER"
                title="Make room for both perspectives."
                description="Use a shared decision checklist to balance student ambitions with family priorities."
              />

              <div className="family-decision-grid">
                <div className="panel">
                  <div className="decision-icon student-color">
                    <GraduationCap size={27} />
                  </div>

                  <h2>Student priorities</h2>
                  <p className="panel-description">
                    What matters most for the student's future?
                  </p>

                  <ul className="decision-list">
                    <li>Interest in the preferred branch</li>
                    <li>Learning environment and curriculum</li>
                    <li>Career opportunities and skill development</li>
                    <li>Location and campus preferences</li>
                  </ul>
                </div>

                <div className="panel">
                  <div className="decision-icon family-color">
                    <Users size={27} />
                  </div>

                  <h2>Family priorities</h2>
                  <p className="panel-description">
                    What needs to be financially and practically manageable?
                  </p>

                  <ul className="decision-list">
                    <li>Four-year education budget</li>
                    <li>Accommodation and transportation</li>
                    <li>Potential scholarship eligibility</li>
                    <li>Emergency funds and other expenses</li>
                  </ul>
                </div>
              </div>

              <div className="panel decision-summary">
                <div className="section-kicker">SHARED STARTING POINT</div>
                <h2>Your decision summary</h2>

                <div className="summary-grid">
                  <div>
                    <span>Preferred branch</span>
                    <strong>{profile.preferredBranch}</strong>
                  </div>

                  <div>
                    <span>Academic score</span>
                    <strong>{profile.academicScore}%</strong>
                  </div>

                  <div>
                    <span>Four-year budget</span>
                    <strong>{formatMoney(profile.budget)}</strong>
                  </div>

                  <div>
                    <span>Options within budget</span>
                    <strong>
                      {
                        recommendations.filter(
                          (college) => college.totalCost <= profile.budget,
                        ).length
                      }{' '}
                      of {recommendations.length}
                    </strong>
                  </div>
                </div>

                <p className="panel-description">
                  Discuss the trade-offs together and verify college fees,
                  eligibility, scholarships, and placement information before
                  making a final decision.
                </p>

                <button
                  className="primary-button"
                  onClick={() => window.print()}
                >
                  Print decision summary <ArrowRight size={17} />
                </button>
              </div>
            </section>
          )}

          {/* COLLEGE DIRECTORY */}
          {page === 'College Directory' && (
            <section className="content-section">
              <PageHeading
                eyebrow="EXPLORE COLLEGES"
                title="Find your engineering college."
                description="Search colleges by name and explore their locations and official websites."
              />

              <CollegeDirectory />
            </section>
          )}

          {/* COLLEGE COMPARISON */}
          {page === 'College Comparison' && (
            <section className="content-section">
              <PageHeading
                eyebrow="COMPARE EDUCATION COSTS"
                title="Compare colleges side by side."
                description="Review available tuition, accommodation, and other fee information before making an education decision."
              />

              <CollegeComparison />
            </section>
          )}

          <footer className="page-footer">
            <span>
              EduFamily AI · Engineering education decision support
            </span>
            <span>Transparent insights. Informed decisions.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  caption,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  caption: string;
  color: string;
}) {
  return (
    <div className="panel stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>

      <div>
        <p className="stat-label">{label}</p>
        <h2>{value}</h2>
        <span>{caption}</span>
      </div>
    </div>
  );
}

function JourneyStep({
  number,
  title,
  description,
  onClick,
}: {
  number: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button className="journey-step" onClick={onClick}>
      <span className="step-number">{number}</span>

      <span className="step-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>

      <ArrowRight size={17} />
    </button>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ScoreRow({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="score-row">
      <div>
        <span>{label}</span>
        <strong>{score}%</strong>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default App;