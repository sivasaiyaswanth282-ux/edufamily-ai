import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface College {
  id: string;
  name: string;
  city: string;
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
  last_checked_at: string | null;
  verified_at: string | null;
}

function money(
  value: number | null,
  currency = 'INR',
): string {
  if (value === null || value === undefined) {
    return 'Not available';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function fourYearEstimate(fee: Fee): {
  amount: number | null;
  complete: boolean;
} {
  const tuition = fee.annual_tuition;
  const oneTime = fee.one_time_fees;

  if (tuition == null || oneTime == null) {
    return {
      amount: null,
      complete: false,
    };
  }

  const recurringFees = [
    fee.annual_hostel_fee,
    fee.annual_mess_fee,
    fee.annual_other_fees,
  ];

  const complete = recurringFees.every(
    (value) => value != null,
  );

  const annualOtherCosts = recurringFees.reduce<number>(
    (sum, value) => sum + (value ?? 0),
    0,
  );

  const annualTotal = tuition + annualOtherCosts;

  return {
    amount: annualTotal * 4 + oneTime,
    complete,
  };
}

function getBudgetStatus(
  estimate: {
    amount: number | null;
    complete: boolean;
  },
  budget: string,
): string {
  if (budget.trim() === '') {
    return 'Enter a valid budget';
  }

  const parsedBudget = Number(budget);

  if (
    !Number.isFinite(parsedBudget) ||
    parsedBudget < 0
  ) {
    return 'Enter a valid budget';
  }

  if (
    estimate.amount === null ||
    !estimate.complete
  ) {
    return 'Insufficient fee data';
  }

  return estimate.amount <= parsedBudget
    ? 'Within budget'
    : 'Over budget';
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'Not checked yet';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function CollegeComparison() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [familyBudget, setFamilyBudget] = useState('1200000');

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [collegeResult, feeResult] = await Promise.all([
          supabase
            .from('colleges')
            .select('id, name, city')
            .order('name'),

          supabase
            .from('college_fees')
            .select(
              'id, college_id, program_id, academic_year, fee_category, annual_tuition, annual_hostel_fee, annual_mess_fee, annual_other_fees, one_time_fees, currency, verification_status, source_url, last_checked_at, verified_at',
            )
            .order('academic_year', {
              ascending: false,
            }),
        ]);

        if (collegeResult.error) {
          throw collegeResult.error;
        }

        if (feeResult.error) {
          throw feeResult.error;
        }

        if (active) {
          setColleges(collegeResult.data ?? []);
          setFees(feeResult.data ?? []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load comparison data.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p>Loading comparison data...</p>;
  }

  if (error) {
    return <p role="alert">Unable to load data: {error}</p>;
  }

  return (
    <section className="college-directory">
      <h2>📊 College Fee Comparison</h2>

      <p>
        Compare recorded fees for engineering colleges.
        Four-year estimates assume annual charges remain
        unchanged for four years.
      </p>

      <div className="college-budget-panel">
        <label htmlFor="family-budget">
          Total family education budget for four years (₹)
        </label>

        <input
          id="family-budget"
          type="number"
          min="0"
          value={familyBudget}
          onChange={(event) =>
            setFamilyBudget(event.target.value)
          }
          placeholder="Enter your total budget"
        />

        <p>
          Complete affordability results require all relevant
          annual expense categories to be available.
        </p>
      </div>

      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>College</th>
              <th>Academic year</th>
              <th>Annual tuition</th>
              <th>Hostel/year</th>
              <th>Mess/year</th>
              <th>Other fees/year</th>
              <th>One-time fees</th>
              <th>Four-year estimate</th>
              <th>Budget status</th>
              <th>Verification</th>
              <th>Last checked</th>
              <th>Source</th>
            </tr>
          </thead>

          <tbody>
            {colleges.map((college) => {
              const collegeFees = fees.filter(
                (fee) => fee.college_id === college.id,
              );

              if (collegeFees.length === 0) {
                return (
                  <tr key={college.id}>
                    <td>
                      <strong>{college.name}</strong>
                      <br />
                      {college.city}
                    </td>

                    <td colSpan={7}>
                      Fee information has not been entered.
                    </td>

                    <td>Insufficient fee data</td>
                    <td>Unverified</td>
                    <td>Not checked yet</td>
                    <td>Unavailable</td>
                  </tr>
                );
              }

              return collegeFees.map((fee) => {
                const estimate = fourYearEstimate(fee);

                return (
                  <tr key={fee.id}>
                    <td>
                      <strong>{college.name}</strong>
                      <br />
                      {college.city}
                    </td>

                    <td>
                      {fee.academic_year}
                      <br />
                      <small>{fee.fee_category}</small>
                    </td>

                    <td>
                      {money(fee.annual_tuition, fee.currency)}
                    </td>

                    <td>
                      {money(
                        fee.annual_hostel_fee,
                        fee.currency,
                      )}
                    </td>

                    <td>
                      {money(
                        fee.annual_mess_fee,
                        fee.currency,
                      )}
                    </td>

                    <td>
                      {money(
                        fee.annual_other_fees,
                        fee.currency,
                      )}
                    </td>

                    <td>
                      {money(fee.one_time_fees, fee.currency)}
                    </td>

                    <td>
                      {estimate.amount === null
                        ? 'Insufficient data'
                        : `${money(
                            estimate.amount,
                            fee.currency,
                          )}${
                            estimate.complete
                              ? ''
                              : ' (partial)'
                          }`}
                    </td>

                    <td>
                      {getBudgetStatus(
                        estimate,
                        familyBudget,
                      )}
                    </td>

                    <td>
                      {fee.verification_status.replaceAll(
                        '_',
                        ' ',
                      )}
                    </td>

                    <td>
                      {formatDate(fee.last_checked_at)}
                    </td>

                    <td>
                      {fee.source_url ? (
                        <a
                          href={fee.source_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Official source ↗
                        </a>
                      ) : (
                        'Unavailable'
                      )}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      <p className="college-data-note">
        Missing expenses are not treated as zero. Partial
        estimates exclude unknown expenses. Verification status
        reflects the stored database record and does not
        independently prove that the source is current.
        Confirm fees with the institution before making
        admission decisions.
      </p>
    </section>
  );
}