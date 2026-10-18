import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';

interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  official_website: string | null;
}

interface Program {
  id: string;
  college_id: string;
  degree: string;
  branch: string;
  eligibility_notes: string | null;
}

interface Fee {
  id: string;
  college_id: string;
  program_id: string | null;
  academic_year: string;
  fee_category: string;
  annual_tuition: number | null;
  annual_hostel_fee: number | null;
  annual_mess_fee: number | null;
  annual_other_fees: number | null;
  one_time_fees: number | null;
  currency: string;
  verification_status: string;
  source_url: string | null;
}

function formatFee(
  value: number | null,
  currency = 'INR',
): string {
  if (value === null || !Number.isFinite(value)) {
    return 'Not available';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function numericValue(value: number | null): number | null {
  if (value === null || value === undefined) return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : null;
}

function getFourYearCost(fee: Fee): {
  total: number | null;
  complete: boolean;
} {
  const tuition = numericValue(fee.annual_tuition);
  const hostel = numericValue(fee.annual_hostel_fee);
  const mess = numericValue(fee.annual_mess_fee);
  const other = numericValue(fee.annual_other_fees);
  const oneTime = numericValue(fee.one_time_fees);

  // Tuition and one-time charges are required for an estimate.
  if (tuition === null || oneTime === null) {
    return { total: null, complete: false };
  }

  // Missing recurring expenses must not be silently treated as zero.
  const complete =
    hostel !== null &&
    mess !== null &&
    other !== null;

  const knownAnnualCost =
    tuition +
    (hostel ?? 0) +
    (mess ?? 0) +
    (other ?? 0);

  return {
    total: knownAnnualCost * 4 + oneTime,
    complete,
  };
}

export default function CollegeDirectory() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);

  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [branch, setBranch] = useState('');

  const [budget, setBudget] = useState('1200000');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError('');

      try {
        const [collegeResult, programResult, feeResult] =
          await Promise.all([
            supabase
              .from('colleges')
              .select(
                'id, name, city, state, official_website',
              )
              .order('name'),

            supabase
              .from('college_programs')
              .select(
                'id, college_id, degree, branch, eligibility_notes',
              ),

            supabase
              .from('college_fees')
              .select(
                'id, college_id, program_id, academic_year, fee_category, annual_tuition, annual_hostel_fee, annual_mess_fee, annual_other_fees, one_time_fees, currency, verification_status, source_url',
              )
              .order('academic_year', {
                ascending: false,
              }),
          ]);

        if (collegeResult.error) throw collegeResult.error;
        if (programResult.error) throw programResult.error;
        if (feeResult.error) throw feeResult.error;

        if (active) {
          setColleges(collegeResult.data ?? []);
          setPrograms(programResult.data ?? []);
          setFees(feeResult.data ?? []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load college information.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  const cities = useMemo(
    () =>
      [...new Set(colleges.map((college) => college.city))]
        .filter(Boolean)
        .sort(),
    [colleges],
  );

  const branches = useMemo(
    () =>
      [...new Set(programs.map((program) => program.branch))]
        .filter(Boolean)
        .sort(),
    [programs],
  );

  const filteredColleges = useMemo(() => {
    return colleges.filter((college) => {
      const matchesName = college.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesCity = !city || college.city === city;

      const collegePrograms = programs.filter(
        (program) => program.college_id === college.id,
      );

      const matchesBranch =
        !branch ||
        collegePrograms.some(
          (program) => program.branch === branch,
        );

      return matchesName && matchesCity && matchesBranch;
    });
  }, [colleges, programs, search, city, branch]);

  const validBudget = budget.trim() !== ''
    ? Number(budget)
    : NaN;

  if (loading) {
    return <p>Loading colleges and fee information...</p>;
  }

  if (error) {
    return (
      <p role="alert">
        Unable to load the directory: {error}
      </p>
    );
  }

  return (
    <section className="college-directory">
      <div className="college-directory-heading">
        <h2>🎓 College Fee Comparison Dashboard</h2>
        <p>
          Compare engineering colleges using the fee records
          available in our database.
        </p>
      </div>

      <div className="college-budget-panel">
        <label htmlFor="college-budget">
          Your total four-year budget (₹)
        </label>

        <input
          id="college-budget"
          type="number"
          min="0"
          placeholder="Enter your budget"
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
        />

        <p>
          Budget status is calculated only when all annual
          expense categories are available.
        </p>
      </div>

      <div className="college-filters">
        <input
          type="search"
          aria-label="Search college name"
          placeholder="Search college name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          aria-label="Filter by city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        >
          <option value="">All cities</option>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by branch"
          value={branch}
          onChange={(event) => setBranch(event.target.value)}
        >
          <option value="">All branches</option>
          {branches.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <p className="college-result-count">
        Showing {filteredColleges.length} of {colleges.length} colleges
      </p>

      {filteredColleges.length === 0 ? (
        <div className="college-empty">
          <h3>No colleges found</h3>
          <p>Try another college name, city, or branch.</p>

          <button
            className="secondary-button"
            onClick={() => {
              setSearch('');
              setCity('');
              setBranch('');
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="college-grid">
          {filteredColleges.map((college) => {
            const collegePrograms = programs.filter(
              (program) => program.college_id === college.id,
            );

            const collegeFees = fees.filter(
              (fee) => fee.college_id === college.id,
            );

            return (
              <article
                className="college-card"
                key={college.id}
              >
                <div className="college-card-top">
                  <span className="college-card-icon">🎓</span>
                  <span className="college-card-label">
                    Engineering institution
                  </span>
                </div>

                <h3>{college.name}</h3>

                <p className="college-card-location">
                  📍 {college.city}, {college.state}
                </p>

                <div className="college-card-section">
                  <h4>Available programs</h4>

                  {collegePrograms.length === 0 ? (
                    <p>Program information not available.</p>
                  ) : (
                    <ul className="college-program-list">
                      {collegePrograms.map((program) => (
                        <li key={program.id}>
                          <strong>{program.degree}</strong>
                          <span>{program.branch}</span>

                          {program.eligibility_notes && (
                            <small>
                              {program.eligibility_notes}
                            </small>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="college-card-section">
                  <h4>Fee comparison</h4>

                  {collegeFees.length === 0 ? (
                    <p className="fee-unavailable">
                      Fee information has not been added yet.
                    </p>
                  ) : (
                    collegeFees.map((fee) => {
                      const estimate = getFourYearCost(fee);

                      const tuition = numericValue(
                        fee.annual_tuition,
                      );

                      const hostel = numericValue(
                        fee.annual_hostel_fee,
                      );

                      const mess = numericValue(
                        fee.annual_mess_fee,
                      );

                      const other = numericValue(
                        fee.annual_other_fees,
                      );

                      const oneTime = numericValue(
                        fee.one_time_fees,
                      );

                      const budgetIsValid =
                        Number.isFinite(validBudget) &&
                        validBudget >= 0 &&
                        budget.trim() !== '';

                      const budgetStatus =
                        !estimate.complete ||
                        estimate.total === null ||
                        !budgetIsValid
                          ? 'Cannot determine yet'
                          : estimate.total <= validBudget
                            ? 'Within budget'
                            : 'Over budget';

                      return (
                        <div
                          className="fee-record"
                          key={fee.id}
                        >
                          <div className="fee-record-heading">
                            <strong>{fee.fee_category}</strong>

                            <span
                              className={`verification-badge ${fee.verification_status}`}
                            >
                              {fee.verification_status.replaceAll(
                                '_',
                                ' ',
                              )}
                            </span>
                          </div>

                          <p>
                            Academic year: {fee.academic_year}
                          </p>

                          <div className="fee-line">
                            <span>Annual tuition</span>
                            <strong>
                              {formatFee(
                                tuition,
                                fee.currency,
                              )}
                            </strong>
                          </div>

                          <div className="fee-line">
                            <span>Annual hostel</span>
                            <strong>
                              {formatFee(
                                hostel,
                                fee.currency,
                              )}
                            </strong>
                          </div>

                          <div className="fee-line">
                            <span>Annual mess</span>
                            <strong>
                              {formatFee(
                                mess,
                                fee.currency,
                              )}
                            </strong>
                          </div>

                          <div className="fee-line">
                            <span>Other annual fees</span>
                            <strong>
                              {formatFee(
                                other,
                                fee.currency,
                              )}
                            </strong>
                          </div>

                          <div className="fee-line">
                            <span>One-time fees</span>
                            <strong>
                              {formatFee(
                                oneTime,
                                fee.currency,
                              )}
                            </strong>
                          </div>

                          <hr />

                          <div className="fee-line">
                            <span>Four-year cost estimate</span>
                            <strong>
                              {estimate.total === null
                                ? 'Insufficient fee data'
                                : formatFee(
                                    estimate.total,
                                    fee.currency,
                                  )}
                            </strong>
                          </div>

                          {estimate.total !== null && (
                            <p className="fee-estimate-note">
                              {estimate.complete
                                ? 'Includes all recorded annual expense categories and one-time fees. Assumes annual fees remain unchanged.'
                                : 'Partial estimate only. Missing annual expenses are excluded, so the actual total may be higher.'}
                            </p>
                          )}

                          <div className="fee-line">
                            <span>Budget status</span>
                            <strong
                              className={
                                budgetStatus === 'Within budget'
                                  ? 'budget-ok'
                                  : budgetStatus === 'Over budget'
                                    ? 'budget-over'
                                    : ''
                              }
                            >
                              {budgetStatus}
                            </strong>
                          </div>

                          {fee.source_url && (
                            <a
                              className="fee-source-link"
                              href={fee.source_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Check fee source ↗
                            </a>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {college.official_website && (
                  <a
                    className="college-website-link"
                    href={college.official_website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Visit official website ↗
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}

      <p className="college-data-note">
        Fees come from the database and are not automatically
        synchronized with college websites. Confirm fees with
        the institution before making admission decisions.
        Missing amounts are never presented as zero.
      </p>
    </section>
  );
}