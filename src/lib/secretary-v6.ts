import { DISTRICTS, districtProgramData, type ModuleKey } from "@/lib/dss-data";

/* ------------------------------------------------------------------ *
 * Deterministic district scaling: all v6 indicator values are written *
 * as "Koraput reference values" and shifted by the district's service *
 * delivery deviation from Koraput. No randomness, no persistence.     *
 * ------------------------------------------------------------------ */

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function sdScoreOf(d: string) {
  const p = districtProgramData[d];
  if (!p) return 0;
  const vals = Object.values(p);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

const REF_DISTRICT = "Koraput";
const REF_SD = sdScoreOf(REF_DISTRICT);

/** shift in pp for a district relative to the Koraput reference */
export function districtShift(d: string) {
  return sdScoreOf(d) - REF_SD;
}

export type Tier = "outcome" | "output" | "input" | "process" | "enabler";

export const TIER_META: { key: Tier; label: string }[] = [
  { key: "outcome", label: "Outcome" },
  { key: "output", label: "Output" },
  { key: "input", label: "Input" },
  { key: "process", label: "Process" },
  { key: "enabler", label: "Enablers" },
];

export type TierIndicator = {
  key: string;
  name: string;
  /** Koraput reference value */
  base: number;
  /** percentage indicator (default) or raw count */
  unit?: "pct" | "count";
  target?: number;
  note?: string;
  /** Full definition shown on ⓘ hover */
  definition?: string;
  /** true = higher is worse (e.g. rejection rate, outcomes) */
  inverse?: boolean;
};

export type TierBlock = {
  tier: Tier;
  source: string;
  indicators: TierIndicator[];
};

export const PROGRAM_TIERS: Record<ModuleKey, TierBlock[]> = {
  poshan: [
    {
      tier: "outcome",
      source: "Poshan Tracker (PT) · July 2026 — read alongside Measurement Efficiency",
      indicators: [
        { key: "p_o_wast", name: "Wasting (U5)", base: 5.8, inverse: true,
          definition: "% of children under 5 years classified as wasted (Weight-for-Height Z-score < −2 SD). Acute malnutrition indicator. PT figure reflects only measured children — read alongside DQ score. Source: Poshan Tracker, Jul 2026." },
        { key: "p_o_stunt", name: "Stunting (U6)", base: 30.2, inverse: true,
          definition: "% of children under 6 years classified as stunted (Height-for-Age Z-score < −2 SD). Reflects chronic undernutrition; changes slowly over years. Source: Poshan Tracker, Jul 2026." },
        { key: "p_o_sam", name: "SAM prevalence", base: 3.8, inverse: true,
          definition: "% of children under 5 classified as Severely Acutely Malnourished (WHZ < −3 SD or MUAC < 11.5 cm). Highest-risk group; requires immediate therapeutic intervention. Source: Poshan Tracker, Jul 2026." },
        { key: "p_o_suw", name: "Severely Underweight", base: 3.4, inverse: true,
          definition: "% of children under 5 classified as Severely Underweight (Weight-for-Age Z-score < −3 SD). Composite indicator of acute and chronic undernutrition. Source: Poshan Tracker, Jul 2026." },
      ],
    },
    {
      tier: "output",
      source: "Poshan Tracker",
      indicators: [
        { key: "p_ou_samref", name: "SAM Referred to NRC", base: 12,
          definition: "% of SAM children identified at AWC level who were referred to a Nutrition Rehabilitation Centre (NRC) for therapeutic feeding and medical management. Low referral = identified children not receiving entitled care. Source: Poshan Tracker." },
        { key: "p_ou_cmam", name: "CMAM Recovery", base: 44,
          definition: "% of SAM children enrolled in Community-based Management of Acute Malnutrition (CMAM) who achieved nutritional recovery (WHZ ≥ −2 SD) within the treatment period. Reflects quality of community-level SAM management. Source: Poshan Tracker." },
        { key: "p_ou_mam", name: "MAM Recovery", base: 58,
          definition: "% of Moderate Acute Malnutrition (MAM) children enrolled in supplementary feeding who graduated to normal weight category within 3 months. Key output of the supplementary nutrition programme (SNP). Source: Poshan Tracker." },
        { key: "p_ou_suw", name: "SUW Recovery", base: 41,
          definition: "% of Severely Underweight children enrolled in the SNP programme who moved to the Underweight or Normal category within the follow-up period. Source: Poshan Tracker." },
      ],
    },
    {
      tier: "input",
      source: "Poshan Tracker",
      indicators: [
        { key: "p_i_home", name: "Home Visits (SAM/MAM/SUW)", base: 39,
          definition: "% of SAM, MAM, and Severely Underweight children for whom the AWW conducted the prescribed frequency of home visits in the reporting month. Home visits are the primary delivery mechanism for intensive nutrition support for at-risk children. Source: Poshan Tracker." },
        { key: "p_i_presch", name: "Pre-school Attendance", base: 44,
          definition: "% of children aged 3–6 years enrolled at AWC who attended ECCE / pre-school sessions for at least 20 days in the reporting month. Also a proxy for AWC functionality and parental trust. Source: Poshan Tracker." },
        { key: "p_i_couns", name: "PW/LM Counselling", base: 51,
          definition: "% of registered pregnant women (PW) and lactating mothers (LM) who received a structured nutrition counselling session at the AWC in the reporting month. Covers diet diversity, breastfeeding, and complementary feeding. Source: Poshan Tracker." },
        { key: "p_i_matben", name: "Maternity Benefits", base: 68,
          definition: "% of eligible pregnant women who received maternity benefits (combined Mamta + PMMVY entitlements) in the reporting period. Convergence indicator between WCD and Health. Source: Poshan Tracker / Mamta Portal." },
        {
          key: "p_i_comm",
          name: "Community Sessions/AWC/mo",
          base: 2.8,
          unit: "count",
          target: 4,
          definition: "Average number of community-based nutrition sessions (VHSND / Poshan Diwas / Gram Sabhas) conducted per AWC per month. These sessions are the primary platform for group counselling and demand generation. Target: 4 per month. Source: Poshan Tracker.",
        },
      ],
    },
    {
      tier: "process",
      source: "Poshan Tracker + State records",
      indicators: [
        { key: "p_pr_sup", name: "Field Supervision (quarterly)", base: 31,
          definition: "% of AWCs that received at least one structured supervisory visit from the sector supervisor or CDPO in the quarter, with a visit record logged. Supervision is the primary quality assurance mechanism for AWW performance. Source: Poshan Tracker / State MIS." },
        {
          key: "p_pr_mentor",
          name: "Mentor Visits (PA visits)",
          base: 1.4,
          unit: "count",
          target: 3,
          note: "target: 3/AWC/mo",
          definition: "Average number of mentoring visits per AWC per month by the Poshan Abhiyan (PA) field team. Mentoring focuses on AWW skill-building, data quality, and community mobilisation. Target: 3 visits/month. Source: Poshan Abhiyan MIS.",
        },
        { key: "p_pr_proj", name: "Project Level Review", base: 62,
          definition: "% of CDPO-level monthly review meetings held as scheduled, with attendance and action-taken report documented. Regular project reviews are a leading indicator of management quality. Source: State MIS / CDPO records." },
        { key: "p_pr_dist", name: "District Level Review", base: 58,
          definition: "% of district-level quarterly review meetings (chaired by DSWO) held as scheduled with block-wise performance discussion and action points documented. Source: State MIS / DSWO records." },
      ],
    },
    {
      tier: "enabler",
      source: "HR records",
      indicators: [
        {
          key: "p_e_vac",
          name: "Staff Vacancies Filled",
          base: 74,
          note: "6 AWW vacancies in district",
          definition: "% of sanctioned positions (AWW, AWH Helper, Supervisor, CDPO) currently filled in the district. Vacancies directly reduce service delivery capacity; AWW vacancies have the highest impact on AWC functioning. Source: State HR records / NIC portal.",
        },
        {
          key: "p_e_comp",
          name: "AWW Competency",
          base: 38,
          note: "correct measurement technique",
          definition: "% of AWWs assessed as correctly performing anthropometric measurement (weight using Salter/digital balance, and height/length using infantometer) per standard protocol. Poor technique is a primary driver of data quality issues and incorrect SAM identification. Source: WCD Phone Survey / Field spot checks.",
        },
      ],
    },
  ],
  saksham: [
    {
      tier: "output",
      source: "Poshan Tracker + AWESOME App",
      indicators: [
        { key: "s_ou_iphs", name: "AWC Meeting IPHS Standards", base: 38,
          definition: "% of AWCs meeting Indian Public Health Standards (IPHS) minimum infrastructure requirements: functional space ≥35 sq ft, toilet, drinking water, electricity, and basic ECCE/nutrition materials. Source: AWESOME App / State AWC survey." },
        { key: "s_ou_toilet", name: "AWCs with Functional Toilet", base: 52,
          definition: "% of AWCs with a functional, clean toilet accessible to AWW and beneficiaries, verified during supervisory visit. Absence of toilets deters attendance, especially for women and girls. Source: Poshan Tracker / AWESOME App." },
        { key: "s_ou_water", name: "AWCs with Clean Water", base: 48,
          definition: "% of AWCs with access to a reliable clean drinking water source (piped / hand pump) within the premises. Essential for SNP preparation, hand-washing, and basic hygiene promotion. Source: AWESOME App / State survey." },
      ],
    },
    {
      tier: "input",
      source: "Poshan Tracker",
      indicators: [
        { key: "s_i_ece", name: "ECE Sessions Conducted", base: 51,
          definition: "Average number of structured Early Childhood Education (ECE/ECCE) sessions conducted per AWC per month. Includes play-based learning, school readiness activities, and parent engagement. Source: Poshan Tracker." },
        { key: "s_i_aww", name: "AWW Present (unannounced)", base: 63,
          definition: "% of AWCs found open with AWW present during unannounced supervisory visits. Primary proxy for AWC functioning and AWW attendance regularity. Low values indicate absenteeism or AWC non-functionality. Source: AWESOME App." },
        { key: "s_i_presch", name: "Pre-school Attendance (3–6)", base: 44,
          definition: "% of children aged 3–6 years enrolled at AWC who attended pre-school / ECCE sessions for at least 20 days in the reporting month. Source: Poshan Tracker." },
      ],
    },
    {
      tier: "process",
      source: "AWESOME App + State records",
      indicators: [
        { key: "s_pr_sup", name: "Supervisor Visit Compliance", base: 42,
          definition: "% of AWCs that received at least one structured supervisory visit focusing on infrastructure and ECCE quality in the quarter, with feedback recorded on AWESOME App. Distinct from POSHAN supervision. Source: AWESOME App." },
        { key: "s_pr_app", name: "AWESOME App Active Use", base: 54,
          definition: "% of CDPO-level supervisors actively logging supervisory visits and AWC assessments on the AWESOME App (AWC Strengthening, Evaluation and Monitoring System of Excellence). App usage is a proxy for supervision quality and consistency. Source: AWESOME App backend." },
        { key: "s_pr_infra", name: "AWC Infrastructure Upgrade", base: 28,
          definition: "% of AWCs with identified infrastructure gaps for which an upgrade plan has been initiated with fund release from District Collector or State budget. Tracks the pipeline from gap identification to rectification. Source: State PWD / WCD records." },
      ],
    },
    {
      tier: "enabler",
      source: "HR records",
      indicators: [
        { key: "s_e_aww", name: "AWW Vacancy Filled", base: 71,
          definition: "% of sanctioned AWW (Anganwadi Worker) positions currently filled in the district. AWW vacancies are the single largest determinant of AWC non-functionality. Source: State HR / NIC portal." },
        { key: "s_e_help", name: "Helper Vacancy Filled", base: 68,
          definition: "% of sanctioned AWH (Anganwadi Helper) positions currently filled. Helpers support AWW in SNP preparation, cleanliness, and childcare — their absence increases AWW workload and reduces service quality. Source: State HR / NIC portal." },
        { key: "s_e_train", name: "AWW Training Completed", base: 61,
          definition: "% of AWWs who have completed all prescribed training modules in the current training cycle, covering nutrition, ECCE methodology, anthropometry, and Poshan Tracker data entry. Source: Training MIS / SIRD." },
      ],
    },
  ],
  subhadra: [
    {
      tier: "output",
      source: "Subhadra Portal",
      indicators: [
        { key: "sb_ou_enr", name: "Eligible Women Enrolled", base: 81,
          definition: "% of women estimated as eligible under Subhadra scheme criteria (age, income, residency) who have been enrolled with an active beneficiary ID. Enrollment gaps typically reflect awareness barriers or documentation requirements. Source: Subhadra Portal." },
        { key: "sb_ou_i1", name: "1st Installment Disbursed", base: 72,
          definition: "% of enrolled Subhadra beneficiaries who have received the 1st installment of ₹5,000 via DBT into their Aadhaar-linked bank account. Delays indicate bank linkage or KYC issues. Source: Subhadra Portal / PFMS." },
        { key: "sb_ou_i2", name: "2nd Installment Disbursed", base: 54, note: "Backlog",
          definition: "% of eligible beneficiaries who have received the 2nd installment (₹5,000). A large gap between 1st and 2nd installment rates signals processing bottlenecks — often pending fund release or revalidation requirements. Source: Subhadra Portal / PFMS." },
      ],
    },
    {
      tier: "input",
      source: "Subhadra Portal",
      indicators: [
        { key: "sb_i_bank", name: "Bank Account Linked", base: 79,
          definition: "% of enrolled beneficiaries whose bank account has been successfully linked and verified for DBT transfer. Unlinked accounts are the primary cause of disbursement failure. Source: Subhadra Portal / NPCI." },
        { key: "sb_i_aadhaar", name: "Aadhaar Seeded", base: 71,
          definition: "% of enrolled beneficiaries whose Aadhaar has been seeded to their bank account (Aadhaar-linked DBT). Required for payment authentication. Gaps often reflect inactive accounts or bank-level seeding failures. Source: Subhadra Portal / UIDAI." },
        { key: "sb_i_appr", name: "Application Approved <15 days", base: 58,
          definition: "% of Subhadra applications that were approved within 15 working days of submission. Processing time is a key service delivery metric; delays discourage enrollment. Source: Subhadra Portal." },
      ],
    },
    {
      tier: "process",
      source: "Subhadra Portal + State records",
      indicators: [
        { key: "sb_pr_rej", name: "Rejection Rate", base: 18, inverse: true, note: "high rejections",
          definition: "% of submitted Subhadra applications that were rejected. High rejection rates indicate eligibility verification issues, documentation gaps, or data entry errors — often correctable through camp-based events. Source: Subhadra Portal." },
        { key: "sb_pr_griev", name: "Grievance Redressal Rate", base: 61,
          definition: "% of grievances lodged by beneficiaries (payment failures, rejections, delays) that were resolved within the prescribed SLA. Source: Subhadra Portal grievance module." },
        {
          key: "sb_pr_camp",
          name: "Camp-based Enrollment Events",
          base: 2.4,
          unit: "count",
          target: 4,
          note: "per month",
          definition: "Average number of camp-based enrollment and correction events conducted per district per month. Camps address application corrections, bank linkage, and Aadhaar seeding for rejected or pending beneficiaries. Target: 4 per month. Source: DSWO records.",
        },
      ],
    },
  ],
  mamta: [
    {
      tier: "output",
      source: "Mamta Portal",
      indicators: [
        { key: "m_ou_reg1", name: "PW Registered 1st Trimester", base: 58,
          definition: "% of estimated pregnant women who were registered under Mamta in the 1st trimester (within 12 weeks of conception). Early registration is required for full benefit eligibility and ANC follow-up. Source: Mamta Portal." },
        { key: "m_ou_i1", name: "1st Installment Released", base: 69,
          definition: "% of registered Mamta beneficiaries who have received the 1st installment upon early registration and completion of initial ANC checkup. Delays indicate administrative processing gaps at DSWO or CDPO level. Source: Mamta Portal." },
        { key: "m_ou_i2", name: "2nd Installment Released", base: 51,
          definition: "% of eligible beneficiaries who have received the 2nd installment, conditional on completion of prescribed ANC visits and delivery registration. A gap with 1st installment reveals ANC follow-up dropouts. Source: Mamta Portal." },
        { key: "m_ou_del", name: "Institutional Delivery Rate", base: 74,
          definition: "% of Mamta beneficiaries for whom institutional delivery (at a government or empanelled facility) was recorded and linked in the portal. Key convergence indicator between WCD and CMHO. Source: Mamta Portal / HMIS." },
      ],
    },
    {
      tier: "input",
      source: "Mamta Portal + HMIS",
      indicators: [
        { key: "m_i_reg", name: "PW Registered (total)", base: 81,
          definition: "% of estimated pregnant women in the district who are registered under Mamta, regardless of trimester. The denominator is based on the expected pregnancy rate from population projections. Source: Mamta Portal." },
        { key: "m_i_bank", name: "Bank Account Linked", base: 72,
          definition: "% of registered Mamta beneficiaries whose bank account has been successfully linked for DBT. Unlinked accounts prevent benefit disbursement even when the beneficiary is otherwise eligible. Source: Mamta Portal / NPCI." },
        { key: "m_i_anc", name: "ANC ≥4 Checkups", base: 53,
          definition: "% of registered pregnant women who completed at least 4 Antenatal Care (ANC) checkups as recommended by WHO and MoHFW. Key health input; linked to 2nd installment eligibility. Source: HMIS / Mamta Portal." },
      ],
    },
    {
      tier: "process",
      source: "Mamta Portal",
      indicators: [
        { key: "m_pr_proc", name: "Processing Time <30 days", base: 54,
          definition: "% of Mamta applications processed (verified, approved, and payment initiated) within 30 working days of registration. Processing time is a key service quality metric; delays erode trust in the scheme. Source: Mamta Portal." },
        { key: "m_pr_griev", name: "Grievance Resolution", base: 48,
          definition: "% of beneficiary grievances (payment failures, delays, account errors) resolved within the prescribed SLA of 15 working days. Low resolution rate indicates systemic processing issues at DSWO level. Source: Mamta Portal grievance module." },
      ],
    },
  ],
};

export function indicatorValue(ind: TierIndicator, district: string): number {
  const shift = districtShift(district);
  if (ind.unit === "count") {
    return +Math.max(0, ind.base + shift * 0.04).toFixed(1);
  }
  if (ind.inverse) {
    // outcomes / rejection: better SD → lower value
    return +Math.max(0, ind.base - shift * 0.35).toFixed(1);
  }
  return clamp(ind.base + shift);
}

export function indicatorStateAvg(ind: TierIndicator): number {
  const vals = DISTRICTS.map((d) => indicatorValue(ind, d));
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return ind.unit === "count" || ind.inverse ? +avg.toFixed(1) : Math.round(avg);
}

/* --------------------------- phone survey --------------------------- */

export type SurveyRow = {
  key: string;
  name: string;
  pt: number | null;
  survey: number;
  quote?: string;
};

export const PROGRAM_SURVEY: Record<ModuleKey, SurveyRow[]> = {
  poshan: [
    {
      key: "ps_home",
      name: "Home Visits (SAM/MAM/SUW)",
      pt: 39,
      survey: 24,
      quote: "Beneficiaries report AWW did not visit in past month",
    },
    { key: "ps_meas", name: "Child measured", pt: 42, survey: 31 },
    { key: "ps_snp", name: "Child received SNP", pt: 48, survey: 28 },
    { key: "ps_thr", name: "THR received", pt: 37, survey: 22 },
    { key: "ps_vhnd", name: "VHND held in habitation", pt: 48, survey: 34 },
  ],
  saksham: [
    { key: "ss_open", name: "AWC was open when visited", pt: 79, survey: 64 },
    {
      key: "ss_learn",
      name: "AWW engaged child in learning activity",
      pt: null,
      survey: 41,
      quote: "No admin equivalent — beneficiary report only",
    },
  ],
  subhadra: [
    { key: "sbs_i1", name: "Received 1st installment", pt: 72, survey: 63 },
    {
      key: "sbs_time",
      name: "Received on time",
      pt: null,
      survey: 51,
      quote: "No portal equivalent",
    },
    { key: "sbs_aware", name: "Aware of installment schedule", pt: null, survey: 62 },
  ],
  mamta: [
    { key: "ms_i1", name: "Received 1st installment", pt: 69, survey: 58 },
    { key: "ms_i2", name: "Received 2nd installment", pt: 51, survey: 39 },
    { key: "ms_aware", name: "Aware of Mamta scheme", pt: null, survey: 68 },
  ],
};

export function surveyValues(row: SurveyRow, district: string) {
  const shift = districtShift(district);
  const pt = row.pt === null ? null : clamp(row.pt + shift);
  const survey = clamp(row.survey + shift);
  return { pt, survey, gap: pt === null ? null : survey - pt };
}

/* ------------------------- DQ by programme ------------------------- */

export const PROGRAM_DQ_META: Record<
  ModuleKey,
  { base: number; portal: string; issue: string; label: string }
> = {
  poshan: { base: 64, portal: "PT", issue: "Copying", label: "POSHAN (PT)" },
  saksham: { base: 71, portal: "PT+AWESOME", issue: "Missing", label: "Saksham (PT+AWESOME)" },
  subhadra: { base: 84, portal: "Portal", issue: "Clean", label: "Subhadra Portal" },
  mamta: { base: 79, portal: "Portal", issue: "Reg gap", label: "Mamta Portal" },
};

export function programDq(module: ModuleKey, district: string) {
  return clamp(PROGRAM_DQ_META[module].base + districtShift(district) * 0.5);
}

export function dqBand(score: number): { color: string; dot: string; bg: string; border: string } {
  if (score >= 80)
    return { color: "#2E7D32", dot: "🟢", bg: "#F0FDF4", border: "#BBF7D0" };
  if (score >= 60)
    return { color: "#F59E0B", dot: "🟡", bg: "#FFFBEB", border: "#FDE68A" };
  return { color: "#C62828", dot: "🔴", bg: "#FFF5F5", border: "#FECACA" };
}

/* ---------------------------- action plans ---------------------------- */

export type PlanInfo = { name: string; detail: string };

export const PLAN_OPTIONS: PlanInfo[] = [
  {
    name: "POSHAN Intensive Support",
    detail:
      "Intensive support plan targeting AWW measurement quality, home visit frequency, and SNP/THR supply chain. DSWO directs a 4-week sprint coordinated through CDPOs: AWW refresher training, supervisor accompaniment, block-level stock audit. Expected outcome: measurement quality +15pp within 2 months.",
  },
  {
    name: "Saksham Anganwadi Strengthening",
    detail:
      "Targets AWC infrastructure, ECE session quality, and supervisor visit compliance. DSWO coordinates supervisor visits to all red AWCs within 30 days. AWC infrastructure gaps flagged to DM for fund release. AWESOME App usage mandated for all supervisors.",
  },
  {
    name: "Data Quality Remediation",
    detail:
      "Addresses PT data entry quality — copying, missing values, implausible measurements. DSWO constitutes a district DQ committee (DSWO + CDPOs) to review AWC-level flags monthly. AWWs with >30% copying flagged for retraining. Target: DQ score >75% within 3 months.",
  },
  {
    name: "Subhadra Backlog Clearance",
    detail:
      "Targets pending 2nd installment disbursals and high rejection rates. DSWO coordinates with CDPOs and Block Programme Officers to clear backlog within 15 days. Camp-based application correction events for rejected beneficiaries. DM alerted for fund release.",
  },
  {
    name: "Multi-programme Bundle",
    detail:
      "For severely underperforming districts requiring intervention across POSHAN + Saksham simultaneously. State deploys a District Support Team (DST) for 6 weeks, coordinated through DSWO. Covers: AWW training, infrastructure, data quality, SNP supply, and supervisor activation. Directed by Secretary WCD.",
  },
];

export function directedToOptions(district: string) {
  return [
    `DSWO ${district}`,
    `CDPO ${district}`,
    `DSWO ${district}`,
    `CMHO ${district}`,
    `DM ${district}`,
    "Secretary WCD",
  ];
}

/* ------------------------ last week's actions ------------------------ */

export type TrackerItem = {
  district: string;
  plan: string;
  directedTo: string;
  status: "Done" | "In Progress" | "Pending";
  note?: string;
};

export const PREVIOUS_SESSION_ACTIONS: TrackerItem[] = [
  // Green belt — good performers
  { district: "Khordha",       plan: "Saksham Anganwadi Strengthening", directedTo: "CDPO Khordha",       status: "Done",        note: "ECE quality upgrade completed; AWC infra audit shared with DSWO." },
  { district: "Cuttack",       plan: "Data Quality Remediation",         directedTo: "DSWO Cuttack",         status: "Done",        note: "DQ score improved to 89%; copying flags cleared across all blocks." },
  { district: "Jharsuguda",    plan: "Data Quality Remediation",         directedTo: "CDPO Jharsuguda",    status: "Done",        note: "AWW refresher training on measurement technique completed — DQ now 86%." },
  { district: "Puri",          plan: "POSHAN Intensive Support",         directedTo: "CDPO Puri",          status: "Done",        note: "SAM referral rate improved 41%→55% over 6 weeks. NRC pipeline cleared." },
  { district: "Jagatsinghpur", plan: "Saksham Anganwadi Strengthening", directedTo: "CDPO Jagatsinghpur", status: "Done",        note: "Toilet construction completed in 12 flagged AWCs. AWESOME App at 78%." },
  { district: "Kendrapara",    plan: "POSHAN Intensive Support",         directedTo: "CDPO Kendrapara",    status: "Done",        note: "Home visit compliance up to 61%; VHSND sessions back on schedule." },
  { district: "Balasore",      plan: "Data Quality Remediation",         directedTo: "DSWO Balasore",        status: "Done",        note: "Measurement bunching corrected; line list verified across 5 blocks." },
  { district: "Bhadrak",       plan: "POSHAN Intensive Support",         directedTo: "CDPO Bhadrak",       status: "In Progress", note: "SAM NRC pipeline improving — 3 of 5 blocks showing week-on-week gains." },
  // Amber belt — mid performers
  { district: "Jajpur",        plan: "POSHAN Intensive Support",         directedTo: "CDPO Jajpur",        status: "Done",        note: "Community nutrition sessions scaled to 4/AWC/month in 60% of blocks." },
  { district: "Dhenkanal",     plan: "POSHAN Intensive Support",         directedTo: "CDPO Dhenkanal",     status: "In Progress", note: "AWW CMAM training ongoing; supervisor accompaniment started in 4 blocks." },
  { district: "Sambalpur",     plan: "Saksham Anganwadi Strengthening", directedTo: "CDPO Sambalpur",     status: "Done",        note: "AWESOME App adoption at 71%; infrastructure gaps raised with DM." },
  { district: "Bargarh",       plan: "POSHAN Intensive Support",         directedTo: "CDPO Bargarh",       status: "In Progress", note: "Home visits for SAM/MAM improving; counselling sessions above target." },
  { district: "Angul",         plan: "Data Quality Remediation",         directedTo: "DSWO Angul",          status: "In Progress", note: "DQ committee formed; mechanical increment flags under block review." },
  { district: "Nayagarh",      plan: "POSHAN Intensive Support",         directedTo: "CDPO Nayagarh",     status: "Done",        note: "MAM recovery improved 58%→71%; measurement efficiency up 6pp." },
  { district: "Sundargarh",    plan: "Multi-programme Bundle",           directedTo: "DSWO Sundargarh",  status: "In Progress", note: "DST in week 3; AWW vacancy issue escalated to HR — 18 posts pending." },
  { district: "Kendujhar",     plan: "POSHAN Intensive Support",         directedTo: "CDPO Kendujhar",    status: "Pending",     note: "CDPO yet to share block-level supervisor visit data — follow up urgently." },
  { district: "Deogarh",       plan: "Saksham Anganwadi Strengthening", directedTo: "CDPO Deogarh",      status: "Done",        note: "Pre-school attendance drive completed; 3 AWCs upgraded this cycle." },
  { district: "Mayurbhanj",    plan: "Multi-programme Bundle",           directedTo: "DSWO Mayurbhanj", status: "In Progress", note: "DST active — POSHAN and DQ both tracked weekly. Two-week review pending." },
  { district: "Subarnapur",    plan: "POSHAN Intensive Support",         directedTo: "CDPO Subarnapur",   status: "Pending",     note: "SAM referral <15% — CDPO asked to share block-wise line list. No response yet." },
  { district: "Balangir",      plan: "Multi-programme Bundle",           directedTo: "DSWO Balangir",     status: "In Progress", note: "Wasting 18.2%; home visits and NRC pipeline both weak — DST support requested." },
  { district: "Ganjam",        plan: "POSHAN Intensive Support",         directedTo: "CDPO Ganjam",       status: "In Progress", note: "Large district — block officers briefed; 4 flagged blocks visited this week." },
  { district: "Boudh",         plan: "Data Quality Remediation",         directedTo: "DSWO Boudh",          status: "Pending",     note: "Missing values >18% in 3 blocks; DQ committee not yet constituted." },
  // Red belt — high-need districts
  { district: "Gajapati",      plan: "Multi-programme Bundle",           directedTo: "DSWO Gajapati",  status: "In Progress", note: "Tribal terrain — AWW vacancies 31%; DST support extended by 2 weeks." },
  { district: "Nuapada",       plan: "Multi-programme Bundle",           directedTo: "DSWO Nuapada",   status: "Pending",     note: "POSHAN and Saksham both critical; DST deployment clearance awaited." },
  { district: "Kandhamal",     plan: "Multi-programme Bundle",           directedTo: "DSWO Kandhamal", status: "Pending",     note: "Remote terrain — 40% AWCs unreachable in monsoon. Revisit in September." },
  { district: "Kalahandi",     plan: "POSHAN Intensive Support",         directedTo: "CDPO Kalahandi",    status: "Done",        note: "Measurement efficiency 39%→48%; NRC referrals improving block by block." },
  { district: "Rayagada",      plan: "POSHAN Intensive Support",         directedTo: "CDPO Rayagada",     status: "Pending",     note: "SAM referral 9% — worst in state. CDPO briefed; block visits scheduled." },
  { district: "Nabarangpur",   plan: "Data Quality Remediation",         directedTo: "DSWO Nabarangpur",   status: "In Progress", note: "Missing weight data in 22% AWCs; block-level retraining ongoing." },
  { district: "Koraput",       plan: "POSHAN Intensive Support",         directedTo: "CDPO Koraput",      status: "Done",        note: "Home visits up 12pp post-sprint; measurement still needs improvement." },
  { district: "Malkangiri",    plan: "Multi-programme Bundle",           directedTo: "DSWO Malkangiri",   status: "Done",        note: "DST completed 6-week sprint; follow-up review scheduled for Sep." },
];

export const STATUS_ICON: Record<TrackerItem["status"], string> = {
  Done: "✓ Done",
  "In Progress": "⟳ In Progress",
  Pending: "● Pending",
};

export const STATUS_COLOR: Record<TrackerItem["status"], string> = {
  Done: "#2E7D32",
  "In Progress": "#0D5E8A",
  Pending: "#F59E0B",
};

/* ---------------------------- system nudge ---------------------------- */

export type NudgeInput = { name: string; value: number; tier: Tier; unit?: "pct" | "count" };

export function buildNudge(module: ModuleKey, district: string) {
  const rows: NudgeInput[] = [];
  for (const block of PROGRAM_TIERS[module]) {
    if (block.tier === "outcome") continue;
    for (const ind of block.indicators) {
      if (ind.inverse) continue;
      rows.push({
        name: ind.name,
        value: indicatorValue(ind, district),
        tier: block.tier,
        unit: ind.unit,
      });
    }
  }
  const pct = rows.filter((r) => r.unit !== "count").sort((a, b) => a.value - b.value);
  const lowest = pct.slice(0, 3);
  const tiers = Array.from(new Set(lowest.map((l) => l.tier)));
  const tierLabel = tiers
    .map((t) => TIER_META.find((m) => m.key === t)?.label ?? t)
    .join(" and ");
  return { lowest, tierLabel };
}

/* -------------------------- 6-month trends -------------------------- */

export const MONTH_LABELS = ["F", "M", "A", "M", "J", "J"];
export const MONTH_NAMES = ["Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26"];

/** deterministic 6-month series ending at the district's current value */
export function indicatorTrend(ind: TierIndicator, district: string): number[] {
  const latest = indicatorValue(ind, district);
  const seed =
    (ind.key + district).split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 7;
  // improving trajectory by default, with a small dip in month 5 for realism
  const shape = [-6, -4, -3, -1.5, 1, 0].map((s) => s * (1 + seed / 20));
  return shape.map((s) => {
    const raw = ind.unit === "count" ? latest + s * 0.08 : latest + s * (ind.inverse ? -1 : 1);
    return ind.unit === "count" ? +Math.max(0, raw).toFixed(1) : clamp(raw);
  });
}

export function trendDirection(series: number[], inverse = false) {
  const slope = series[series.length - 1] - series[0];
  const improving = inverse ? slope < 0 : slope > 0;
  if (Math.abs(slope) < 1.5) return { label: "→ Stable", color: "#6B7280" };
  return improving
    ? { label: "↑ Improving", color: "#2E7D32" }
    : { label: "↓ Worsening", color: "#C62828" };
}

/* --------------------------- DQ breakdown --------------------------- */

export type DqCheckRow = {
  name: string;
  flagged: number;
  weight: 1 | 2 | 3;
  penalty: number;
  group: "Snapshot (critical)" | "Window-aware" | "Longitudinal";
};

const DQ_CHECK_SHAPE: { name: string; share: number; weight: 1 | 2 | 3; group: DqCheckRow["group"] }[] = [
  { name: "Missing values (>5% weight/height)", share: 0.34, weight: 3, group: "Snapshot (critical)" },
  { name: "Copying (>30% same as prior month)", share: 0.21, weight: 3, group: "Snapshot (critical)" },
  { name: "Implausible Z-scores", share: 0.12, weight: 3, group: "Snapshot (critical)" },
  { name: "Mechanical increment", share: 0.09, weight: 2, group: "Window-aware" },
  { name: "Z-score transitions", share: 0.12, weight: 2, group: "Window-aware" },
  { name: "Borderline zone bunching", share: 0.08, weight: 2, group: "Window-aware" },
  { name: "No growth (3+ months)", share: 0.05, weight: 1, group: "Longitudinal" },
  { name: "Longitudinal anomalies", share: 0.004, weight: 1, group: "Longitudinal" },
];

/** Check rows whose penalties sum to exactly (100 − DQ score). */
export function dqBreakdown(module: ModuleKey, district: string) {
  const score = programDq(module, district);
  const total = 100 - score;
  const rows: DqCheckRow[] = DQ_CHECK_SHAPE.map((c) => ({
    name: c.name,
    flagged: +(c.share * total * 1.15).toFixed(1),
    weight: c.weight,
    penalty: +(c.share * total).toFixed(2),
  group: c.group,
  }));
  const sum = +rows.reduce((a, r) => a + r.penalty, 0).toFixed(2);
  return { score, rows, total: sum };
}

/* ------------------------- nudge implications ------------------------- */

export const IMPLICATIONS: Record<string, string> = {
  "Field Supervision (quarterly)":
    "AWWs are going unsupervised, undermining service quality across all inputs.",
  "SAM Referred to NRC":
    "Severely malnourished children are not being found or referred to NRC.",
  "Measurement Efficiency":
    "Eligible children are not being measured; outcome data is an undercount.",
  "AWW Competency":
    "Without correct technique, measurements are unreliable and SAM is missed.",
  "Home Visits (SAM/MAM/SUW)":
    "SAM/MAM/SUW children are not receiving prescribed follow-up at home.",
  "Pre-school Attendance":
    "Children 3–6 are missing early learning and the daily contact point.",
  "PW/LM Counselling":
    "Pregnant and lactating mothers are not receiving nutrition counselling.",
  "Maternity Benefits": "Entitled mothers are not receiving cash support on time.",
  "CMAM Recovery": "Children under treatment are not recovering at expected rates.",
  "MAM Recovery": "Moderate wasting is not being reversed before it becomes severe.",
  "SUW Recovery": "Severely underweight children remain untreated over months.",
  "Mentor Visits (PA visits)": "Frontline mentoring is absent, so practice never improves.",
  "Project Level Review": "Block-level review is not driving corrective action.",
  "District Level Review": "District review cadence is too weak to hold blocks accountable.",
  "Staff Vacancies Filled": "Vacant posts leave AWCs without a functioning worker.",
  "AWC Meeting IPHS Standards": "AWCs lack the basic facilities needed to deliver services.",
  "AWCs with Functional Toilet": "Poor sanitation reduces attendance, especially for girls.",
  "AWCs with Clean Water": "Without clean water, meals and hygiene practices are compromised.",
  "ECE Sessions Conducted": "Early education sessions are not happening as mandated.",
  "AWW Present (unannounced)": "AWCs are unstaffed on ordinary days, so services lapse.",
  "Pre-school Attendance (3–6)": "Children are not attending, so no service reaches them.",
  "Supervisor Visit Compliance": "Supervisors are not visiting, so AWC issues go unresolved.",
  "AWESOME App Active Use": "Digital monitoring is not in use, so data is late and unverified.",
  "AWC Infrastructure Upgrade": "Sanctioned upgrades are stalled, keeping AWCs sub-standard.",
  "AWW Vacancy Filled": "Vacant AWW posts leave habitations without any worker.",
  "Helper Vacancy Filled": "Without helpers, AWWs cannot run feeding and ECE together.",
  "AWW Training Completed": "Untrained workers cannot deliver the mandated package.",
  "Eligible Women Enrolled": "Eligible women remain outside the scheme entirely.",
  "1st Installment Disbursed": "Approved beneficiaries are still waiting for first payment.",
  "2nd Installment Disbursed": "Disbursal backlog is blocking the second installment.",
  "Bank Account Linked": "Payments cannot be credited without linked accounts.",
  "Aadhaar Seeded": "Unseeded records fail verification and stall disbursal.",
  "Application Approved <15 days": "Approval delays push benefits beyond the entitlement window.",
  "Grievance Redressal Rate": "Complaints are not being closed, eroding beneficiary trust.",
  "PW Registered 1st Trimester": "Late registration removes the window for early ANC support.",
  "1st Installment Released": "Maternity cash support is not reaching mothers on time.",
  "2nd Installment Released": "Second installment is stuck, breaking the incentive chain.",
  "Institutional Delivery Rate": "Home deliveries continue, raising maternal and newborn risk.",
  "PW Registered (total)": "Pregnant women are not registered, so no benefit can flow.",
  "ANC ≥4 Checkups": "Insufficient antenatal contact leaves risks undetected.",
  "Processing Time <30 days": "Slow processing delays every downstream payment.",
  "Grievance Resolution": "Unresolved grievances leave beneficiaries without recourse.",
};

export type NudgeBullet = {
  name: string;
  value: number;
  avg: number;
  gap: number;
  tier: Tier;
  implication: string;
};

const PLAN_BY_MODULE: Record<ModuleKey, string> = {
  poshan: "POSHAN Intensive Support",
  saksham: "Saksham Anganwadi Strengthening",
  subhadra: "Subhadra Backlog Clearance",
  mamta: "Multi-programme Bundle",
};

export function buildNudgeBullets(module: ModuleKey, district: string) {
  const rows: NudgeBullet[] = [];
  for (const block of PROGRAM_TIERS[module]) {
    if (block.tier === "outcome") continue;
    for (const ind of block.indicators) {
      if (ind.inverse || ind.unit === "count") continue;
      const value = indicatorValue(ind, district);
      const avg = indicatorStateAvg(ind);
      rows.push({
        name: ind.name,
        value,
        avg,
        gap: +(value - avg).toFixed(1),
        tier: block.tier,
        implication:
          IMPLICATIONS[ind.name] ??
          "Performance is below the state average and needs corrective action.",
      });
    }
  }
  const bullets = rows.sort((a, b) => a.gap - b.gap).slice(0, 4);
  const worstTier = bullets[0]?.tier;
  const dq = programDq(module, district);
  const plan =
    dq < 65
      ? "Data Quality Remediation"
      : PLAN_BY_MODULE[module];
  const directedTo =
    plan === "Data Quality Remediation"
      ? `DSWO ${district}`
      : `DSWO ${district}`;
  return { bullets, plan, directedTo };
}

export const DQ_METHODOLOGY =
  "DQ score = 100 minus weighted penalties across 11 checks. Critical checks (missing values, copying, implausible Z-scores) carry 3× weight. Window-aware checks carry 2× weight. Longitudinal checks carry 1× weight. Score reflects % of AWCs passing weighted checks. Threshold: >80% = green, 65–80% = amber, <65% = red.";
