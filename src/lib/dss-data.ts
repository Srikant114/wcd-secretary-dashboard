export type ModuleKey = "poshan" | "saksham" | "subhadra" | "mamta";

export const MODULES: { key: ModuleKey; label: string; subtitle: string }[] = [
  { key: "poshan", label: "POSHAN 2.0", subtitle: "Nutrition determinant" },
  // { key: "saksham", label: "Saksham Anganwadi", subtitle: "AWC infrastructure" },
  // { key: "subhadra", label: "Subhadra", subtitle: "Women empowerment" },
  // { key: "mamta", label: "Mamta", subtitle: "Maternity benefits" },
];

export type OutcomeKey = "wasting" | "stunting" | "underweight";
/** PT-specific outcomes including SAM (no NFHS-6 counterpart) */
export type PTOutcomeKey = OutcomeKey | "sam";

export const OUTCOMES: {
  key: OutcomeKey;
  label: string;
  current: number;
  baseline: number; // NFHS-5
  delta: number; // pp change vs NFHS-5 (positive = worsened)
  source: string;
}[] = [
  { key: "wasting",     label: "Wasting",     current: 22.1, baseline: 18.1, delta: +4.0, source: "NFHS-6 (2023-24)" },
  { key: "stunting",    label: "Stunting",    current: 26.8, baseline: 34.1, delta: -7.3, source: "NFHS-6 (2023-24)" },
  { key: "underweight", label: "Underweight", current: 31.6, baseline: 29.7, delta: +1.9, source: "NFHS-6 (2023-24)" },
];

/** Poshan Tracker admin outcomes — state level, July 2026 (computed from OD POSHAN CSVs) */
export const PT_OUTCOMES = {
  wasting:  { val: 3.4,  delta: +0.2, dir: "up"     as const },
  stunting: { val: 17.8, delta: -0.4, dir: "down"   as const },
  sam:      { val: 0.5,  delta: -0.1, dir: "down"   as const },
  suw:      { val: 1.5,  delta:  0,   dir: "stable" as const },
};

/** NFHS-6 survey benchmark — Odisha state (2023-24) */
export const NFHS6_OUTCOMES = {
  wasting:     { val: 21.4, baseline: 18.1, trend: "worse"    as const },
  stunting:    { val: 27.0, baseline: 34.1, trend: "improved" as const },
  underweight: { val: 31.5, baseline: 29.7, trend: "worse"    as const },
  // SAM: NFHS-6 Odisha state estimate (WHZ < -3, population survey)
  // Population-weighted average of 30 districts from NFHS-6 vs PT analysis file
  // Note: NFHS SAM uses WHZ only; PT SAM adds MUAC < 11.5cm & oedema criteria
  sam:         { val: 5.7,  baseline: 6.3,  trend: "improved" as const },
};

/** PT state-level for comparisons (July 2026, from OD POSHAN CSVs) */
export const statePtOutcomes = { wasting: 3.4, stunting: 17.8, sam: 0.53, uw: 10.54, suw: 1.5 };

export type Indicator = {
  key: string; name: string; value: number;
  highlight?: boolean; tooltip?: string;
  tier?: "output" | "input" | "process" | "enabler";
  unit?: "pct" | "count"; target?: number;
};

export const MEASUREMENT_EFFICIENCY_TOOLTIP =
  "% of eligible children (0–59 months) for whom anthropometric measurements (weight + height) were recorded in the reporting month. Source: Poshan Tracker.";

export const MODULE_INDICATORS: Record<ModuleKey, Indicator[]> = {
  poshan: [
    // pinned — always shown first
    { key: "poshan_weighed", name: "Measurement Efficiency", value: 96, highlight: true, tooltip: MEASUREMENT_EFFICIENCY_TOOLTIP },
    // output
    { key: "poshan_sam_ref", name: "% SAM children referred to NRC", value: 38, tier: "output",
      tooltip: "% of SAM (Severe Acute Malnutrition) children identified by the AWW who were referred to a Nutrition Rehabilitation Centre (NRC) for therapeutic feeding. Low referral = children not receiving care they are entitled to. Source: Poshan Tracker." },
    { key: "poshan_cmam", name: "% children recovering under CMAM", value: 62, tier: "output",
      tooltip: "% of SAM children enrolled in Community-based Management of Acute Malnutrition (CMAM) who achieved nutritional recovery (WHZ ≥ −2 SD) within the treatment period. Reflects quality of community-level SAM management. Source: Poshan Tracker." },
    { key: "poshan_mam", name: "% MAM children reaching normal weight (3 mo)", value: 71, tier: "output",
      tooltip: "% of Moderate Acute Malnutrition (MAM) children enrolled in supplementary feeding who graduated to normal weight category within 3 months. Key output of the supplementary nutrition programme. Source: Poshan Tracker." },
    // input
    { key: "poshan_home", name: "% SAM/MAM/SUW with prescribed home visits", value: 34, tier: "input",
      tooltip: "% of SAM, MAM, and Severely Underweight (SUW) children for whom the AWW conducted the prescribed frequency of home visits in the reporting month. Home visits are the primary delivery mechanism for intensive nutrition support. Source: Poshan Tracker." },
    { key: "poshan_couns", name: "% PW/LM receiving nutrition counselling at AWC", value: 67, tier: "input",
      tooltip: "% of registered pregnant women (PW) and lactating mothers (LM) who received a structured nutrition counselling session at the AWC in the reporting month. Counselling covers diet diversity, breastfeeding, and complementary feeding. Source: Poshan Tracker." },
    { key: "poshan_comm", name: "Community sessions per AWC/month", value: 3.2, tier: "input", unit: "count", target: 4,
      tooltip: "Average number of community-based nutrition sessions (VHSND / Poshan Diwas) conducted per AWC per month. Target is 4 per month. Sessions are the key platform for group counselling and demand generation. Source: Poshan Tracker." },
    // process
    { key: "poshan_sup", name: "% AWCs with supervisory visit (quarterly)", value: 48, tier: "process",
      tooltip: "% of AWCs that received at least one structured supervisory visit from the sector supervisor or CDPO in the quarter, with a visit record on Poshan Tracker. Supervision is the primary quality assurance mechanism. Source: Poshan Tracker / State MIS." },
    { key: "poshan_mentor", name: "Mentoring visits per AWC/month (PA)", value: 2.1, tier: "process", unit: "count", target: 3,
      tooltip: "Average number of mentoring visits per AWC per month conducted by the Poshan Abhiyan (PA) field team. Mentoring visits focus on AWW skill-building and data quality. Target: 3 visits/month. Source: Poshan Abhiyan MIS." },
    // enabler
    { key: "poshan_vacancy", name: "% sanctioned posts filled (AWW+Helper+Sup+CDPO)", value: 84, tier: "enabler",
      tooltip: "% of sanctioned positions across AWW, AWH (Helper), Supervisor, and CDPO levels that are currently filled. Vacancies directly reduce service delivery capacity at AWC level. Source: State HR records / NIC portal." },
    { key: "poshan_comp", name: "% AWWs with correct measurement technique", value: 52, tier: "enabler",
      tooltip: "% of AWWs assessed as correctly performing anthropometric measurement (weight using Salter scale / digital balance, and height/length using infantometer) per standard protocol. Poor technique is a primary driver of data quality issues. Source: WCD Phone Survey / Field spot checks." },
  ],
  saksham: [
    // output
    { key: "saksham_iphs", name: "% AWCs meeting IPHS standards", value: 51, tier: "output",
      tooltip: "% of AWCs meeting Indian Public Health Standards (IPHS) minimum infrastructure requirements — functional space ≥35 sq ft, toilet, drinking water, electricity, and basic ECCE materials. Source: AWESOME App / State AWC survey." },
    { key: "saksham_toilet", name: "% AWCs with functional toilet", value: 74, tier: "output",
      tooltip: "% of AWCs with a functional, clean toilet accessible to AWW and beneficiaries, verified during supervisory visit. Non-functional or absent toilets are a deterrent to AWC attendance, especially for girls. Source: Poshan Tracker / AWESOME App." },
    { key: "saksham_water", name: "% AWCs with clean drinking water", value: 68, tier: "output",
      tooltip: "% of AWCs with access to a reliable clean drinking water source (piped / hand pump) within the premises. Essential for SNP preparation and basic hygiene. Source: AWESOME App / State survey." },
    // input
    { key: "saksham_presch", name: "% children (3–6 yrs) attending pre-school ≥20 days", value: 58, tier: "input",
      tooltip: "% of children aged 3–6 years enrolled at AWC who attended ECCE / pre-school sessions for at least 20 days in the reporting month. Attendance is a proxy for ECCE quality and AWC functionality. Source: Poshan Tracker." },
    { key: "saksham_open", name: "% AWCs open on unannounced supervisory visit", value: 71, tier: "input", highlight: true,
      tooltip: "% of AWCs found open with AWW present during unannounced supervisory visits. Serves as the primary proxy indicator for AWC functioning and AWW attendance regularity. Source: AWESOME App." },
    { key: "saksham_ece", name: "ECE sessions conducted per AWC/month", value: 67, tier: "input",
      tooltip: "Average number of structured Early Childhood Education (ECE/ECCE) sessions conducted per AWC per month. Covers play-based learning, school readiness activities, and parent engagement. Source: Poshan Tracker." },
    // process
    { key: "saksham_sup", name: "% AWCs with supervisory visit (quarterly)", value: 64, tier: "process",
      tooltip: "% of AWCs under Saksham scope that received at least one structured supervisory visit in the quarter with feedback recorded on AWESOME App. Distinct from POSHAN supervision — focuses on infrastructure and ECCE quality. Source: AWESOME App." },
    { key: "saksham_app", name: "% supervisors actively using AWESOME App", value: 61, tier: "process",
      tooltip: "% of CDPO-level supervisors who are actively logging supervisory visits and AWC assessments on the AWESOME App (AWC Strengthening, Evaluation and Monitoring System of Excellence). Source: AWESOME App backend." },
    // enabler
    { key: "saksham_aww", name: "% AWW vacancies filled", value: 88, tier: "enabler",
      tooltip: "% of sanctioned AWW (Anganwadi Worker) positions currently filled at the district level. AWW vacancies are the single largest determinant of AWC non-functionality. Source: State HR / NIC portal." },
    { key: "saksham_train", name: "% AWWs completing prescribed training", value: 76, tier: "enabler",
      tooltip: "% of AWWs who have completed all prescribed training modules in the current training cycle — covering nutrition, ECCE methodology, anthropometry, and Poshan Tracker data entry. Source: Training MIS / SIRD." },
  ],
  subhadra: [
    { key: "subhadra_enrolled", name: "% eligible women enrolled under Subhadra", value: 77,
      tooltip: "% of women estimated as eligible under Subhadra scheme criteria (age, income, residency) who have been enrolled and have an active beneficiary ID. Enrollment gaps often reflect awareness or documentation barriers. Source: Subhadra Portal." },
    { key: "subhadra_inst1", name: "% receiving 1st installment (₹5,000)", value: 68, highlight: true,
      tooltip: "% of enrolled Subhadra beneficiaries who have received the 1st installment of ₹5,000 via Direct Benefit Transfer (DBT) into their Aadhaar-linked bank account. Delays often indicate bank linkage or KYC issues. Source: Subhadra Portal / PFMS." },
    { key: "subhadra_inst2", name: "% receiving 2nd installment (₹5,000)", value: 58,
      tooltip: "% of beneficiaries eligible for the 2nd installment (₹5,000) — typically released after a prescribed interval — who have received it. A large gap with 1st installment indicates processing bottlenecks. Source: Subhadra Portal / PFMS." },
    { key: "subhadra_dbt", name: "DBT transfer success rate", value: 87,
      tooltip: "% of initiated Subhadra DBT transfers that were successfully credited to beneficiary accounts without rejection or failure. Failures typically indicate Aadhaar-bank seeding errors or inactive accounts. Source: PFMS." },
  ],
  mamta: [
    { key: "mamta_registered", name: "% pregnant women registered under Mamta", value: 74,
      tooltip: "% of estimated pregnant women in the district registered under the Mamta scheme (Odisha's maternity benefit programme, distinct from PM Matru Vandana Yojana). Early registration (1st trimester) is required for full benefit eligibility. Source: Mamta Portal." },
    { key: "mamta_inst1", name: "% receiving 1st installment", value: 64, highlight: true,
      tooltip: "% of registered Mamta beneficiaries who have received the 1st installment upon early registration and completion of initial ANC checkup. Delays indicate administrative processing gaps at DSWO or CDPO level. Source: Mamta Portal." },
    { key: "mamta_inst2", name: "% receiving 2nd installment", value: 56,
      tooltip: "% of eligible beneficiaries who have received the 2nd installment, linked to completion of prescribed ANC visits and delivery registration. A gap between 1st and 2nd installment rates reveals dropouts in the ANC follow-up chain. Source: Mamta Portal." },
    { key: "mamta_delivery", name: "% Mamta beneficiaries with institutional delivery", value: 71,
      tooltip: "% of Mamta beneficiaries for whom institutional delivery (at a government or empanelled private facility) was recorded and linked in the portal. Cross-referenced with HMIS. A key convergence indicator between WCD and Health. Source: Mamta Portal / HMIS." },
  ],
};

export const DISTRICTS = [
  "Angul","Balangir","Balasore","Bargarh","Bhadrak","Boudh","Cuttack","Deogarh",
  "Dhenkanal","Gajapati","Ganjam","Jagatsinghpur","Jajpur","Jharsuguda","Kalahandi",
  "Kandhamal","Kendrapara","Kendujhar","Khordha","Koraput","Malkangiri","Mayurbhanj",
  "Nabarangpur","Nayagarh","Nuapada","Puri","Rayagada","Sambalpur","Subarnapur","Sundargarh",
];

export type DistrictOutcome = Record<OutcomeKey, number>;
export const districtOutcomeData: Record<string, DistrictOutcome> = {
  // GREEN — wasting <13%
  Khordha:          { wasting: 9.8,  stunting: 21.3, underweight: 17.4 },
  Cuttack:          { wasting: 10.2, stunting: 22.7, underweight: 18.9 },
  Jharsuguda:       { wasting: 10.9, stunting: 23.1, underweight: 19.6 },
  Puri:             { wasting: 11.4, stunting: 24.2, underweight: 20.3 },
  Jagatsinghpur:    { wasting: 11.7, stunting: 24.8, underweight: 21.1 },
  Kendrapara:       { wasting: 12.1, stunting: 25.4, underweight: 21.8 },
  Balasore:         { wasting: 12.4, stunting: 26.1, underweight: 22.4 },
  Bhadrak:          { wasting: 12.8, stunting: 26.7, underweight: 22.9 },
  // AMBER — wasting 13–19%
  Jajpur:           { wasting: 13.2, stunting: 27.4, underweight: 23.6 },
  Dhenkanal:        { wasting: 13.7, stunting: 28.1, underweight: 24.3 },
  Sambalpur:        { wasting: 14.1, stunting: 28.8, underweight: 25.0 },
  Bargarh:          { wasting: 14.6, stunting: 29.5, underweight: 25.7 },
  Angul:            { wasting: 15.1, stunting: 30.2, underweight: 26.4 },
  Nayagarh:         { wasting: 15.4, stunting: 30.8, underweight: 26.9 },
  Sundargarh:       { wasting: 15.8, stunting: 31.4, underweight: 27.5 },
  Kendujhar:        { wasting: 16.2, stunting: 32.1, underweight: 28.2 },
  Deogarh:          { wasting: 16.7, stunting: 32.8, underweight: 28.9 },
  Mayurbhanj:       { wasting: 17.1, stunting: 33.5, underweight: 29.6 },
  Subarnapur:       { wasting: 17.6, stunting: 34.2, underweight: 30.3 },
  Balangir:         { wasting: 18.2, stunting: 35.1, underweight: 31.1 },
  Ganjam:           { wasting: 18.7, stunting: 35.9, underweight: 31.8 },
  Boudh:            { wasting: 19.1, stunting: 36.6, underweight: 32.5 },
  // RED — wasting >19%
  Gajapati:         { wasting: 19.8, stunting: 37.4, underweight: 33.3 },
  Nuapada:          { wasting: 20.4, stunting: 38.3, underweight: 34.2 },
  Kandhamal:        { wasting: 21.1, stunting: 39.2, underweight: 35.1 },
  Kalahandi:        { wasting: 21.8, stunting: 40.1, underweight: 36.0 },
  Rayagada:         { wasting: 22.6, stunting: 41.2, underweight: 37.1 },
  Nabarangpur:      { wasting: 23.3, stunting: 42.4, underweight: 38.3 },
  Koraput:          { wasting: 24.1, stunting: 43.7, underweight: 39.6 },
  Malkangiri:       { wasting: 25.2, stunting: 45.1, underweight: 41.2 },
};

const RAW_PROGRAM: Record<string, {
  meas_efficiency: number; snp_coverage: number; sam_identified: number; thr_pw: number;
  awc_toilet: number; awc_ecce: number;
  subhadra_enrolled: number; subhadra_inst1: number;
  mamta_registered: number; mamta_inst1: number;
}> = {
  Khordha:       { meas_efficiency: 99, snp_coverage: 91, sam_identified: 62, thr_pw: 87, awc_toilet: 94, awc_ecce: 84, subhadra_enrolled: 96, subhadra_inst1: 91, mamta_registered: 94, mamta_inst1: 88 },
  Cuttack:       { meas_efficiency: 98, snp_coverage: 89, sam_identified: 59, thr_pw: 84, awc_toilet: 91, awc_ecce: 81, subhadra_enrolled: 93, subhadra_inst1: 87, mamta_registered: 91, mamta_inst1: 85 },
  Jharsuguda:    { meas_efficiency: 98, snp_coverage: 87, sam_identified: 57, thr_pw: 82, awc_toilet: 89, awc_ecce: 79, subhadra_enrolled: 92, subhadra_inst1: 86, mamta_registered: 90, mamta_inst1: 83 },
  Puri:          { meas_efficiency: 97, snp_coverage: 86, sam_identified: 55, thr_pw: 81, awc_toilet: 88, awc_ecce: 77, subhadra_enrolled: 91, subhadra_inst1: 85, mamta_registered: 88, mamta_inst1: 82 },
  Jagatsinghpur: { meas_efficiency: 97, snp_coverage: 85, sam_identified: 54, thr_pw: 80, awc_toilet: 87, awc_ecce: 76, subhadra_enrolled: 90, subhadra_inst1: 84, mamta_registered: 87, mamta_inst1: 81 },
  Kendrapara:    { meas_efficiency: 97, snp_coverage: 84, sam_identified: 52, thr_pw: 79, awc_toilet: 86, awc_ecce: 74, subhadra_enrolled: 89, subhadra_inst1: 82, mamta_registered: 86, mamta_inst1: 79 },
  Balasore:      { meas_efficiency: 97, snp_coverage: 83, sam_identified: 51, thr_pw: 78, awc_toilet: 85, awc_ecce: 73, subhadra_enrolled: 88, subhadra_inst1: 81, mamta_registered: 85, mamta_inst1: 78 },
  Bhadrak:       { meas_efficiency: 96, snp_coverage: 82, sam_identified: 49, thr_pw: 77, awc_toilet: 84, awc_ecce: 72, subhadra_enrolled: 87, subhadra_inst1: 80, mamta_registered: 84, mamta_inst1: 77 },
  Jajpur:        { meas_efficiency: 96, snp_coverage: 80, sam_identified: 47, thr_pw: 75, awc_toilet: 82, awc_ecce: 69, subhadra_enrolled: 85, subhadra_inst1: 78, mamta_registered: 82, mamta_inst1: 74 },
  Dhenkanal:     { meas_efficiency: 96, snp_coverage: 78, sam_identified: 45, thr_pw: 73, awc_toilet: 80, awc_ecce: 67, subhadra_enrolled: 84, subhadra_inst1: 76, mamta_registered: 80, mamta_inst1: 72 },
  Sambalpur:     { meas_efficiency: 96, snp_coverage: 77, sam_identified: 44, thr_pw: 72, awc_toilet: 79, awc_ecce: 66, subhadra_enrolled: 83, subhadra_inst1: 75, mamta_registered: 79, mamta_inst1: 71 },
  Bargarh:       { meas_efficiency: 96, snp_coverage: 76, sam_identified: 43, thr_pw: 71, awc_toilet: 78, awc_ecce: 65, subhadra_enrolled: 82, subhadra_inst1: 74, mamta_registered: 78, mamta_inst1: 70 },
  Angul:         { meas_efficiency: 96, snp_coverage: 75, sam_identified: 42, thr_pw: 70, awc_toilet: 77, awc_ecce: 63, subhadra_enrolled: 81, subhadra_inst1: 72, mamta_registered: 77, mamta_inst1: 68 },
  Nayagarh:      { meas_efficiency: 95, snp_coverage: 74, sam_identified: 40, thr_pw: 69, awc_toilet: 76, awc_ecce: 62, subhadra_enrolled: 80, subhadra_inst1: 71, mamta_registered: 76, mamta_inst1: 67 },
  Sundargarh:    { meas_efficiency: 95, snp_coverage: 73, sam_identified: 39, thr_pw: 68, awc_toilet: 75, awc_ecce: 61, subhadra_enrolled: 79, subhadra_inst1: 70, mamta_registered: 75, mamta_inst1: 66 },
  Kendujhar:     { meas_efficiency: 95, snp_coverage: 72, sam_identified: 38, thr_pw: 67, awc_toilet: 74, awc_ecce: 60, subhadra_enrolled: 78, subhadra_inst1: 69, mamta_registered: 74, mamta_inst1: 65 },
  Deogarh:       { meas_efficiency: 95, snp_coverage: 71, sam_identified: 37, thr_pw: 66, awc_toilet: 73, awc_ecce: 58, subhadra_enrolled: 77, subhadra_inst1: 67, mamta_registered: 73, mamta_inst1: 63 },
  Mayurbhanj:    { meas_efficiency: 95, snp_coverage: 69, sam_identified: 35, thr_pw: 64, awc_toilet: 71, awc_ecce: 56, subhadra_enrolled: 75, subhadra_inst1: 65, mamta_registered: 71, mamta_inst1: 61 },
  Subarnapur:    { meas_efficiency: 95, snp_coverage: 68, sam_identified: 34, thr_pw: 63, awc_toilet: 70, awc_ecce: 55, subhadra_enrolled: 74, subhadra_inst1: 64, mamta_registered: 70, mamta_inst1: 60 },
  Balangir:      { meas_efficiency: 95, snp_coverage: 66, sam_identified: 32, thr_pw: 61, awc_toilet: 68, awc_ecce: 53, subhadra_enrolled: 72, subhadra_inst1: 62, mamta_registered: 68, mamta_inst1: 58 },
  Ganjam:        { meas_efficiency: 95, snp_coverage: 65, sam_identified: 31, thr_pw: 60, awc_toilet: 67, awc_ecce: 52, subhadra_enrolled: 71, subhadra_inst1: 61, mamta_registered: 67, mamta_inst1: 57 },
  Boudh:         { meas_efficiency: 95, snp_coverage: 63, sam_identified: 29, thr_pw: 58, awc_toilet: 65, awc_ecce: 50, subhadra_enrolled: 69, subhadra_inst1: 58, mamta_registered: 65, mamta_inst1: 54 },
  Gajapati:      { meas_efficiency: 95, snp_coverage: 60, sam_identified: 26, thr_pw: 55, awc_toilet: 62, awc_ecce: 46, subhadra_enrolled: 66, subhadra_inst1: 54, mamta_registered: 62, mamta_inst1: 51 },
  Nuapada:       { meas_efficiency: 95, snp_coverage: 57, sam_identified: 23, thr_pw: 52, awc_toilet: 59, awc_ecce: 43, subhadra_enrolled: 63, subhadra_inst1: 51, mamta_registered: 59, mamta_inst1: 47 },
  Kandhamal:     { meas_efficiency: 95, snp_coverage: 54, sam_identified: 21, thr_pw: 49, awc_toilet: 56, awc_ecce: 40, subhadra_enrolled: 60, subhadra_inst1: 48, mamta_registered: 56, mamta_inst1: 44 },
  Kalahandi:     { meas_efficiency: 95, snp_coverage: 51, sam_identified: 18, thr_pw: 46, awc_toilet: 53, awc_ecce: 37, subhadra_enrolled: 57, subhadra_inst1: 44, mamta_registered: 53, mamta_inst1: 41 },
  Rayagada:      { meas_efficiency: 95, snp_coverage: 48, sam_identified: 16, thr_pw: 43, awc_toilet: 50, awc_ecce: 34, subhadra_enrolled: 54, subhadra_inst1: 41, mamta_registered: 50, mamta_inst1: 38 },
  Nabarangpur:   { meas_efficiency: 95, snp_coverage: 45, sam_identified: 14, thr_pw: 40, awc_toilet: 47, awc_ecce: 31, subhadra_enrolled: 51, subhadra_inst1: 38, mamta_registered: 47, mamta_inst1: 35 },
  Koraput:       { meas_efficiency: 95, snp_coverage: 42, sam_identified: 12, thr_pw: 37, awc_toilet: 44, awc_ecce: 28, subhadra_enrolled: 48, subhadra_inst1: 35, mamta_registered: 44, mamta_inst1: 32 },
  Malkangiri:    { meas_efficiency: 95, snp_coverage: 37, sam_identified: 9,  thr_pw: 32, awc_toilet: 39, awc_ecce: 24, subhadra_enrolled: 43, subhadra_inst1: 30, mamta_registered: 39, mamta_inst1: 27 },
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export const districtProgramData: Record<string, Record<string, number>> = Object.fromEntries(
  Object.entries(RAW_PROGRAM).map(([d, v]) => {
    const me = v.meas_efficiency; // 95–99 — used only for poshan_weighed
    const snp = v.snp_coverage;   // 37–91, drives PRAYASS poshan variation
    const tl = v.awc_toilet;      // 39–94, drives PRAYASS saksham infra
    const ec = v.awc_ecce;        // 24–84, drives PRAYASS saksham ECCE
    const dp = snp - 64;          // deviation from snp state avg (~64) — POSHAN delivery proxy
    const dt = tl - 78;           // deviation from toilet state avg (~78)
    const de = ec - 56;           // deviation from ECCE state avg (~56)
    return [d, {
      // existing keys
      poshan_snp:       snp,
      poshan_weighed:   me,        // ME stays correct — it IS the weighing rate
      poshan_sam:       v.sam_identified,
      poshan_thr:       v.thr_pw,
      saksham_toilet:   tl,
      saksham_electricity: clamp(tl - 3),
      saksham_aww:      clamp(tl + 5),
      saksham_ecce:     ec,
      subhadra_enrolled: v.subhadra_enrolled,
      subhadra_inst1:   v.subhadra_inst1,
      subhadra_inst2:   clamp(v.subhadra_inst1 - 10),
      subhadra_dbt:     clamp(v.subhadra_inst1 + 4),
      mamta_registered: v.mamta_registered,
      mamta_inst1:      v.mamta_inst1,
      mamta_inst2:      clamp(v.mamta_inst1 - 8),
      mamta_delivery:   clamp(v.mamta_registered - 3),
      // PRAYASS POSHAN output — driven by snp (programme delivery), not ME
      poshan_sam_ref:   clamp(38 + Math.round(dp * 0.45)),
      poshan_cmam:      clamp(62 + Math.round(dp * 0.35)),
      poshan_mam:       clamp(71 + Math.round(dp * 0.3)),
      // PRAYASS POSHAN input
      poshan_home:      clamp(34 + Math.round(dp * 0.5)),
      poshan_couns:     clamp(67 + Math.round(dp * 0.3)),
      poshan_comm:      clamp(80 + Math.round(dp * 0.4)),  // stored as % of target (3.2/4 ≈ 80%)
      // PRAYASS POSHAN process
      poshan_sup:       clamp(48 + Math.round(dp * 0.4)),
      poshan_mentor:    clamp(70 + Math.round(dp * 0.35)), // stored as % of target (2.1/3 ≈ 70%)
      // PRAYASS POSHAN enabler
      poshan_vacancy:   clamp(84 + Math.round(dp * 0.15)),
      poshan_comp:      clamp(52 + Math.round(dp * 0.45)),
      // PRAYASS Saksham output
      saksham_iphs:     clamp(51 + Math.round(dt * 0.8)),
      saksham_water:    clamp(68 + Math.round(dt * 0.6)),
      // PRAYASS Saksham input
      saksham_presch:   clamp(58 + Math.round(de * 0.7)),
      saksham_open:     clamp(71 + Math.round(dt * 0.5)),
      saksham_ece:      clamp(67 + Math.round(de * 0.5)),
      // PRAYASS Saksham process
      saksham_sup:      clamp(64 + Math.round(dt * 0.45)),
      saksham_app:      clamp(61 + Math.round(de * 0.55)),
      // PRAYASS Saksham enabler
      saksham_train:    clamp(76 + Math.round(de * 0.3)),
    }];
  }),
);

/** NFHS-6 state outcomes — for map/district comparison (survey benchmark) */
export const stateOutcomes = { wasting: 22.1, stunting: 26.8, underweight: 31.6 };

export type DistrictColor = "green" | "amber" | "red";

export function colorForCoverage(value: number | null | undefined): DistrictColor | "na" {
  if (value === null || value === undefined) return "na";
  if (value > 85) return "green";
  if (value >= 70) return "amber";
  return "red";
}

export function colorForOutcome(value: number | null | undefined): DistrictColor | "na" {
  if (value === null || value === undefined) return "na";
  if (value > 25) return "red";
  if (value > 18) return "amber";
  return "green";
}

export const COLOR_HEX: Record<DistrictColor | "na", string> = {
  green: "#2E7D32",
  amber: "#F59E0B",
  red: "#C62828",
  na: "#CCCCCC",
};

export const SERVICE_DELIVERY_TILES: Record<ModuleKey, { name: string; value: number }[]> = {
  poshan: [
    { name: "AWC opens daily", value: 84 },
    { name: "VHSND conducted", value: 72 },
    { name: "Measurement Efficiency", value: 96 },
    { name: "SAM identified", value: 41 },
    { name: "SAM referred", value: 38 },
    { name: "SNP distributed", value: 78 },
    { name: "THR given (PW)", value: 71 },
    { name: "THR given (LM)", value: 68 },
    { name: "Growth faltering F/U", value: 55 },
  ],
  saksham: [
    { name: "AWCs with toilet", value: 78 },
    { name: "AWCs with electricity", value: 74 },
    { name: "AWCs with water", value: 70 },
    { name: "AWW filled", value: 84 },
    { name: "ECE enrolled", value: 63 },
    { name: "AWCs with LPG", value: 58 },
  ],
  subhadra: [
    { name: "Enrolled", value: 77 },
    { name: "1st installment", value: 68 },
    { name: "2nd installment", value: 58 },
    { name: "DBT success", value: 87 },
    { name: "Aadhaar seeded", value: 80 },
  ],
  mamta: [
    { name: "Registered", value: 74 },
    { name: "1st installment", value: 64 },
    { name: "2nd installment", value: 56 },
    { name: "Institutional delivery", value: 71 },
  ],
};

// PT vs Phone Survey for Service Delivery
export const PT_INDICATORS = [
  { key: "meas", name: "Measurement Efficiency", value: 96 },
  { key: "snp",  name: "SNP distributed at AWC", value: 78 },
  { key: "vhsnd", name: "VHSND sessions conducted", value: 72 },
  { key: "sam",  name: "SAM children referred to NRC", value: 38 },
];

export const PHONE_SURVEY_ROWS: { name: string; value: number; ptKey?: string; source?: string }[] = [
  { name: "% mothers who say their child was measured last month", value: 54, ptKey: "meas" },
  { name: "% mothers who received SNP / supplementary food for child", value: 61, ptKey: "snp" },
  { name: "% mothers who say VHSND was held in their habitation", value: 58, ptKey: "vhsnd" },
  { name: "% mothers who say AWW visited their household this month", value: 47, source: "Phone Survey" },
  { name: "% Mamta beneficiaries who received last installment", value: 69, source: "Phone Survey" },
];

// 11-check DQ framework
export type DQGroup =
  | "Borderline"
  | "Copied"
  | "Same Increment"
  | "Abnormal Transitions"
  | "Blanket Increment";

export type DQCheck = {
  num: number;
  name: string;
  detail: string;
  stateRate: number;           // % of AWCs at state level (Jul 2026)
  group: DQGroup;
  key: keyof DistrictDQChecks; // maps to districtDQChecks field
};

// 14 real DQ checks — source: validata analysis of Poshan Tracker Jul 2026
// Thresholds: 0% = good, 0–30% = watch, >30% = alert
export const DQ_CHECKS: DQCheck[] = [
  { num: 1,  group: "Borderline",           key: "bl_wasting",  stateRate: 40.5,
    name: "Borderline – Wasting",
    detail: ">30% of measured children have WHZ in [−2, −1) — children hovering just above the wasting cutoff, suggesting measurement bias or borderline coding." },
  { num: 2,  group: "Borderline",           key: "bl_stunting", stateRate: 71.9,
    name: "Borderline – Stunting",
    detail: ">30% of measured children have HAZ in [−2, −1) — children clustering just above the stunting cutoff, indicating possible score inflation." },
  { num: 3,  group: "Borderline",           key: "bl_uw",       stateRate: 69.6,
    name: "Borderline – Underweight",
    detail: ">30% of measured children have WAZ in [−2, −1) — children just above the underweight cutoff; high rates suggest patterned measurement or recording." },
  { num: 4,  group: "Copied",               key: "copy_wt",     stateRate: 18.4,
    name: "Copied – Weight",
    detail: ">30% of children in an AWC have the exact same weight as the prior month across multiple consecutive months, suggesting weight values were copied rather than re-measured." },
  { num: 5,  group: "Copied",               key: "copy_ht",     stateRate: 43.5,
    name: "Copied – Height",
    detail: ">30% of children in an AWC have the exact same height as the prior month — height is typically stable month-to-month, making this a particularly concerning pattern." },
  { num: 6,  group: "Copied",               key: "copy_both",   stateRate: 10.9,
    name: "Copied – Both",
    detail: ">30% of children have both weight and height copied from the prior month simultaneously — the strongest signal for bulk data entry without actual measurement." },
  { num: 7,  group: "Same Increment",       key: "inc_ht",      stateRate: 6.4,
    name: "Same Increment – Height",
    detail: ">50% of children in an AWC show the identical height change month-over-month — a uniform delta across children is biologically implausible and signals templated data entry." },
  { num: 8,  group: "Same Increment",       key: "inc_wt",      stateRate: 11.9,
    name: "Same Increment – Weight",
    detail: ">50% of children in an AWC show the identical weight change month-over-month — pattern consistent with AWW adding a fixed increment rather than recording actual measurements." },
  { num: 9,  group: "Same Increment",       key: "inc_both",    stateRate: 1.4,
    name: "Same Increment – Both",
    detail: ">50% of children show identical increments in both weight and height — the strongest form of mechanical increment, nearly impossible to occur naturally." },
  { num: 10, group: "Abnormal Transitions", key: "trans_haz",   stateRate: 11.9,
    name: "Abnormal Transitions – HAZ (Stunting)",
    detail: ">30% of children in an AWC show |ΔHAZ| ≥ 0.5 SD in a single month — rapid swings in height-for-age z-score (HAZ; Stunting) that are biologically implausible indicate measurement or data entry errors." },
  { num: 11, group: "Abnormal Transitions", key: "trans_waz",   stateRate: 7.9,
    name: "Abnormal Transitions – WAZ (Underweight)",
    detail: ">30% of children show |ΔWAZ| ≥ 1.0 SD in one month — weight-for-age z-score (WAZ; Underweight) transitions of this magnitude are physiologically rare and suggest recording errors or swapped entries." },
  { num: 12, group: "Abnormal Transitions", key: "trans_whz",   stateRate: 27.8,
    name: "Abnormal Transitions – WHZ (Wasting)",
    detail: ">30% of children show |ΔWHZ| ≥ 1.0 SD in one month — weight-for-height z-score (WHZ; Wasting) is the most volatile index, but transitions this large at AWC scale indicate systematic data quality issues." },
  { num: 13, group: "Blanket Increment",    key: "blanket_wt",  stateRate: 41.0,
    name: "Blanket Increment – Weight",
    detail: "A single fixed weight increment applied to the majority of children in an AWC — e.g., every child gains exactly 200 g — indicating bulk data fabrication rather than individual measurement." },
  { num: 14, group: "Blanket Increment",    key: "blanket_ht",  stateRate: 26.4,
    name: "Blanket Increment – Height",
    detail: "A single fixed height increment applied to most children in an AWC — height should vary naturally by age and nutrition status; uniform increments signal batch data entry." },
];

// Helper: get district value for any selected layer key
export type LayerKind = "outcome" | "coverage";
export function getDistrictValue(district: string, kind: LayerKind, key: string): number | null {
  if (kind === "outcome") {
    const o = districtOutcomeData[district];
    return o ? (o as any)[key] ?? null : null;
  }
  const p = districtProgramData[district];
  return p ? p[key] ?? null : null;
}

/** Real ICDS project (CDPO) names for each district */
export const DISTRICT_PROJECTS: Record<string, string[]> = {
  Khordha:       ["Bhubaneswar Urban", "Jatni", "Balianta", "Balipatna", "Bolagarh", "Chilika", "Tangi", "Banapur"],
  Cuttack:       ["Cuttack Urban", "Athagarh", "Badamba", "Banki", "Baramba", "Mahanga", "Niali", "Salepur", "Tigiria"],
  Jharsuguda:    ["Jharsuguda", "Brajarajnagar", "Kolabira", "Lakhanpur", "Laikera"],
  Puri:          ["Puri", "Brahmagiri", "Delang", "Gop", "Kakatpur", "Kanas", "Nimapada", "Pipili", "Satyabadi"],
  Jagatsinghpur: ["Jagatsinghpur", "Balikuda", "Biridi", "Erasama", "Kujang", "Raghunathpur", "Tirtol"],
  Kendrapara:    ["Kendrapara", "Aul", "Derabish", "Garadapur", "Mahakalpada", "Marshaghai", "Patkura"],
  Balasore:      ["Balasore", "Baliapal", "Basta", "Bhograi", "Jaleswar", "Nilagiri", "Remuna", "Simulia", "Soro"],
  Bhadrak:       ["Bhadrak", "Basudevpur", "Bonth", "Chandbali", "Dhamnagar", "Tihidi"],
  Jajpur:        ["Jajpur", "Barchana", "Binjharpur", "Dasarathpur", "Dharmasala", "Korei", "Sukinda"],
  Dhenkanal:     ["Dhenkanal", "Bhuban", "Gondia", "Hindol", "Kamakhyanagar", "Odapada", "Parjang"],
  Sambalpur:     ["Sambalpur", "Bamra", "Jamankira", "Jujomura", "Kuchinda", "Maneswar", "Rairakhol"],
  Bargarh:       ["Bargarh", "Attabira", "Bhatli", "Bijepur", "Barpali", "Gaisilet", "Jharbandh", "Padampur", "Paikmal", "Sohela"],
  Angul:         ["Angul", "Athmallik", "Banarpal", "Chhendipada", "Kaniha", "Kishorenagar", "Pallahara", "Talcher"],
  Nayagarh:      ["Nayagarh", "Daspalla", "Gania", "Khandapada", "Nuagaon", "Odagaon", "Ranpur"],
  Sundargarh:    ["Sundargarh", "Bargaon", "Bisra", "Biramitrapur", "Hemgir", "Koira", "Kuanrmunda", "Lahunipada", "Rajgangpur", "Tangarpali"],
  Kendujhar:     ["Keonjhar", "Anandapur", "Banspal", "Champua", "Ghasipura", "Hatadihi", "Harichandanpur", "Joda", "Patna", "Telkoi"],
  Deogarh:       ["Deogarh", "Barkote", "Reamal", "Tileibani"],
  Mayurbhanj:    ["Baripada", "Badasahi", "Bangriposi", "Bisoi", "Betnoti", "Jashipur", "Karanjia", "Khunta", "Moroda", "Rairangpur", "Saraskana", "Suliapada", "Udala"],
  Subarnapur:    ["Subarnapur", "Birmaharajpur", "Dunguripali", "Tarbha", "Ullunda"],
  Balangir:      ["Balangir", "Agalpur", "Belpara", "Deogaon", "Kantabanji", "Khaprakhol", "Loisingha", "Muribahal", "Patnagarh", "Puintala", "Saintala", "Titilagarh"],
  Ganjam:        ["Berhampur", "Aska", "Bhanjanagar", "Buguda", "Chhatrapur", "Chikiti", "Digapahandi", "Ganjam", "Hinjilicut", "Jagannathprasad", "Kabisuryanagar", "Khalikote", "Kodala", "Polasara", "Purusottampur", "Sorada"],
  Boudh:         ["Boudh", "Baunsuni", "Harbhanga", "Kantamal", "Manamunda"],
  Gajapati:      ["Paralakhemundi", "Gosani", "Kashinagar", "Mohana", "Nuagada", "R. Udayagiri"],
  Nuapada:       ["Nuapada", "Boden", "Comta", "Khariar", "Sinapali"],
  Kandhamal:     ["Phulbani", "Baliguda", "G. Udayagiri", "Kotgarh", "Krishnaprasad", "Phiringia", "Raikia", "Tikabali", "Tumudibandha"],
  Kalahandi:     ["Bhawanipatna", "Dharmagarh", "Golamunda", "Jaipatna", "Junagarh", "Kalampur", "Kesinga", "Lanjigarh", "M. Rampur", "Narla", "Thuamul Rampur"],
  Rayagada:      ["Rayagada", "Bisam Cuttack", "Gudari", "Gunupur", "Kashipur", "Kolnara", "Muniguda", "Ramanaguda"],
  Nabarangpur:   ["Nabarangpur", "Dabugam", "Jharigam", "Kosagumuda", "Nandahandi", "Papadahandi", "Raighar", "Tentulikhunti", "Umarkote"],
  Koraput:       ["Koraput", "Baipariguda", "Bandhugaon", "Dasmantpur", "Jeypore", "Kotpad", "Kundra", "Lamtaput", "Laxmipur", "Narayanpatna", "Nandapur", "Pottangi", "Semiliguda"],
  Malkangiri:    ["Malkangiri", "Chitrakonda", "Kalimela", "Khairput", "Korkunda", "Mathili", "Motu", "Podia"],
};

// ── Real PT outcomes per district per month (Feb–Jul 2026) ───────────────────
// Source: OD POSHAN CSVs · 2,028 files · ~2.5M children/month
// All rates % of measured children. wasting=SAM+MAM; stunting=mod+sev stunted.
export type PTMonthPoint = {
  n: number;
  wasting: number; sam: number; mam: number;
  stunting: number; sev_stunted: number;
  uw: number; sev_uw: number;
};
export const PT_MONTHS = ["Feb","Mar","Apr","May","Jun","Jul"] as const;
export type PTMonth = typeof PT_MONTHS[number];

/** State-level PT outcomes month by month (Feb–Jul 2026) */
export const ptStateTrend: Record<PTMonth, PTMonthPoint> = {
  Feb: { n:2597042, wasting:3.01, sam:0.57, mam:2.45, stunting:25.89, sev_stunted:8.23, uw:11.52, sev_uw:1.77 },
  Mar: { n:2581764, wasting:2.96, sam:0.54, mam:2.42, stunting:22.00, sev_stunted:6.10, uw:10.16, sev_uw:1.50 },
  Apr: { n:2554018, wasting:3.12, sam:0.57, mam:2.55, stunting:21.42, sev_stunted:5.58, uw:10.35, sev_uw:1.55 },
  May: { n:2538023, wasting:2.94, sam:0.51, mam:2.43, stunting:19.49, sev_stunted:5.00, uw:9.50, sev_uw:1.39 },
  Jun: { n:2524854, wasting:2.93, sam:0.50, mam:2.43, stunting:18.70, sev_stunted:4.49, uw:9.37, sev_uw:1.36 },
  Jul: { n:2519189, wasting:3.40, sam:0.53, mam:2.87, stunting:17.76, sev_stunted:3.65, uw:10.54, sev_uw:1.48 },
};

/** Per-district PT outcomes month by month (Feb–Jul 2026) */
export const ptDistrictTrend: Record<string, Record<PTMonth, PTMonthPoint>> = {
  Angul: {
    Feb: { n:78909, wasting:2.2, sam:0.47, mam:1.73, stunting:21.12, sev_stunted:5.66, uw:7.28, sev_uw:0.91 },
    Mar: { n:78691, wasting:2.0, sam:0.41, mam:1.59, stunting:14.44, sev_stunted:3.1, uw:5.47, sev_uw:0.63 },
    Apr: { n:77696, wasting:1.99, sam:0.44, mam:1.55, stunting:14.66, sev_stunted:3.02, uw:5.93, sev_uw:0.76 },
    May: { n:77044, wasting:1.78, sam:0.39, mam:1.39, stunting:13.19, sev_stunted:2.4, uw:5.15, sev_uw:0.62 },
    Jun: { n:74368, wasting:1.73, sam:0.42, mam:1.31, stunting:12.5, sev_stunted:1.59, uw:5.17, sev_uw:0.6 },
    Jul: { n:71011, wasting:1.61, sam:0.3, mam:1.31, stunting:10.55, sev_stunted:1.01, uw:6.32, sev_uw:0.65 },
  },
  Balangir: {
    Feb: { n:105971, wasting:2.41, sam:0.27, mam:2.14, stunting:32.55, sev_stunted:9.43, uw:15.33, sev_uw:1.97 },
    Mar: { n:104925, wasting:1.84, sam:0.22, mam:1.61, stunting:18.08, sev_stunted:2.81, uw:9.75, sev_uw:0.98 },
    Apr: { n:103743, wasting:1.82, sam:0.21, mam:1.61, stunting:15.88, sev_stunted:2.34, uw:8.56, sev_uw:0.94 },
    May: { n:103079, wasting:1.56, sam:0.2, mam:1.36, stunting:10.89, sev_stunted:1.74, uw:6.3, sev_uw:0.72 },
    Jun: { n:103026, wasting:1.6, sam:0.22, mam:1.38, stunting:14.2, sev_stunted:2.07, uw:7.08, sev_uw:0.85 },
    Jul: { n:105003, wasting:1.91, sam:0.24, mam:1.67, stunting:15.65, sev_stunted:2.33, uw:8.28, sev_uw:0.99 },
  },
  Balasore: {
    Feb: { n:138080, wasting:3.96, sam:0.88, mam:3.08, stunting:29.35, sev_stunted:12.31, uw:12.1, sev_uw:2.06 },
    Mar: { n:136952, wasting:3.91, sam:0.82, mam:3.09, stunting:22.94, sev_stunted:7.85, uw:10.08, sev_uw:1.56 },
    Apr: { n:134694, wasting:3.77, sam:0.81, mam:2.96, stunting:20.73, sev_stunted:5.97, uw:9.54, sev_uw:1.36 },
    May: { n:133071, wasting:3.31, sam:0.67, mam:2.64, stunting:19.99, sev_stunted:5.61, uw:8.89, sev_uw:1.27 },
    Jun: { n:132485, wasting:3.46, sam:0.74, mam:2.72, stunting:17.63, sev_stunted:4.68, uw:8.59, sev_uw:1.19 },
    Jul: { n:131775, wasting:4.19, sam:0.82, mam:3.37, stunting:16.59, sev_stunted:3.7, uw:10.31, sev_uw:1.47 },
  },
  Bargarh: {
    Feb: { n:83208, wasting:1.79, sam:0.45, mam:1.34, stunting:14.84, sev_stunted:2.64, uw:6.71, sev_uw:0.89 },
    Mar: { n:83012, wasting:1.66, sam:0.45, mam:1.21, stunting:14.47, sev_stunted:2.45, uw:6.52, sev_uw:0.86 },
    Apr: { n:81383, wasting:1.65, sam:0.44, mam:1.2, stunting:14.35, sev_stunted:2.17, uw:6.5, sev_uw:0.82 },
    May: { n:81276, wasting:1.33, sam:0.36, mam:0.97, stunting:12.23, sev_stunted:1.95, uw:5.33, sev_uw:0.66 },
    Jun: { n:81076, wasting:1.46, sam:0.37, mam:1.09, stunting:12.25, sev_stunted:1.97, uw:5.5, sev_uw:0.72 },
    Jul: { n:81010, wasting:2.23, sam:0.53, mam:1.7, stunting:14.24, sev_stunted:1.95, uw:8.45, sev_uw:1.01 },
  },
  Bhadrak: {
    Feb: { n:92964, wasting:2.63, sam:0.68, mam:1.96, stunting:16.48, sev_stunted:5.0, uw:6.24, sev_uw:0.99 },
    Mar: { n:92602, wasting:2.27, sam:0.52, mam:1.75, stunting:13.24, sev_stunted:3.63, uw:5.13, sev_uw:0.73 },
    Apr: { n:91168, wasting:2.68, sam:0.65, mam:2.03, stunting:13.42, sev_stunted:3.29, uw:5.55, sev_uw:0.83 },
    May: { n:90455, wasting:2.35, sam:0.49, mam:1.86, stunting:13.12, sev_stunted:3.34, uw:5.17, sev_uw:0.73 },
    Jun: { n:90046, wasting:2.18, sam:0.39, mam:1.78, stunting:14.94, sev_stunted:3.9, uw:5.7, sev_uw:0.85 },
    Jul: { n:90028, wasting:2.6, sam:0.48, mam:2.12, stunting:14.92, sev_stunted:3.61, uw:6.59, sev_uw:0.83 },
  },
  Boudh: {
    Feb: { n:29700, wasting:2.8, sam:0.33, mam:2.48, stunting:25.71, sev_stunted:6.0, uw:9.87, sev_uw:1.39 },
    Mar: { n:29637, wasting:2.84, sam:0.35, mam:2.48, stunting:21.91, sev_stunted:4.43, uw:8.69, sev_uw:1.15 },
    Apr: { n:29628, wasting:2.86, sam:0.35, mam:2.51, stunting:21.91, sev_stunted:4.64, uw:8.89, sev_uw:1.29 },
    May: { n:29699, wasting:2.76, sam:0.29, mam:2.47, stunting:20.87, sev_stunted:3.62, uw:8.53, sev_uw:1.08 },
    Jun: { n:29794, wasting:2.97, sam:0.29, mam:2.68, stunting:19.42, sev_stunted:2.8, uw:8.57, sev_uw:0.96 },
    Jul: { n:29761, wasting:2.58, sam:0.26, mam:2.32, stunting:19.32, sev_stunted:2.43, uw:9.98, sev_uw:1.0 },
  },
  Cuttack: {
    Feb: { n:122103, wasting:1.2, sam:0.22, mam:0.97, stunting:14.63, sev_stunted:2.41, uw:4.77, sev_uw:0.49 },
    Mar: { n:120969, wasting:1.19, sam:0.27, mam:0.92, stunting:14.51, sev_stunted:2.45, uw:4.49, sev_uw:0.53 },
    Apr: { n:119295, wasting:1.11, sam:0.25, mam:0.86, stunting:13.53, sev_stunted:1.66, uw:4.29, sev_uw:0.46 },
    May: { n:118269, wasting:0.98, sam:0.24, mam:0.74, stunting:12.06, sev_stunted:1.5, uw:3.81, sev_uw:0.39 },
    Jun: { n:118775, wasting:0.94, sam:0.19, mam:0.75, stunting:12.7, sev_stunted:1.57, uw:3.87, sev_uw:0.4 },
    Jul: { n:118947, wasting:0.85, sam:0.12, mam:0.72, stunting:11.69, sev_stunted:0.91, uw:4.24, sev_uw:0.34 },
  },
  Deogarh: {
    Feb: { n:19358, wasting:3.84, sam:0.61, mam:3.23, stunting:27.24, sev_stunted:8.11, uw:13.85, sev_uw:1.69 },
    Mar: { n:19320, wasting:3.96, sam:0.73, mam:3.23, stunting:28.42, sev_stunted:8.35, uw:14.1, sev_uw:1.69 },
    Apr: { n:19110, wasting:4.64, sam:0.83, mam:3.8, stunting:27.54, sev_stunted:7.61, uw:14.63, sev_uw:1.74 },
    May: { n:18865, wasting:3.8, sam:0.57, mam:3.22, stunting:25.23, sev_stunted:6.98, uw:13.63, sev_uw:1.68 },
    Jun: { n:18773, wasting:4.07, sam:0.66, mam:3.41, stunting:22.42, sev_stunted:5.6, uw:13.03, sev_uw:1.65 },
    Jul: { n:18582, wasting:4.07, sam:0.51, mam:3.57, stunting:21.98, sev_stunted:4.43, uw:14.63, sev_uw:1.71 },
  },
  Dhenkanal: {
    Feb: { n:69437, wasting:1.7, sam:0.42, mam:1.28, stunting:25.76, sev_stunted:9.65, uw:6.77, sev_uw:0.96 },
    Mar: { n:67536, wasting:1.74, sam:0.39, mam:1.34, stunting:21.36, sev_stunted:6.82, uw:5.51, sev_uw:0.85 },
    Apr: { n:67317, wasting:1.97, sam:0.48, mam:1.48, stunting:18.57, sev_stunted:5.14, uw:5.21, sev_uw:0.72 },
    May: { n:67402, wasting:1.74, sam:0.46, mam:1.28, stunting:17.59, sev_stunted:4.42, uw:4.99, sev_uw:0.66 },
    Jun: { n:67063, wasting:1.24, sam:0.28, mam:0.96, stunting:16.87, sev_stunted:3.51, uw:4.34, sev_uw:0.46 },
    Jul: { n:66750, wasting:1.26, sam:0.22, mam:1.03, stunting:14.88, sev_stunted:2.65, uw:4.73, sev_uw:0.4 },
  },
  Gajapati: {
    Feb: { n:41546, wasting:5.3, sam:1.2, mam:4.1, stunting:27.77, sev_stunted:9.5, uw:15.58, sev_uw:2.83 },
    Mar: { n:41409, wasting:4.99, sam:0.93, mam:4.05, stunting:21.41, sev_stunted:5.75, uw:13.06, sev_uw:2.22 },
    Apr: { n:41246, wasting:4.79, sam:0.96, mam:3.82, stunting:24.07, sev_stunted:6.16, uw:13.84, sev_uw:2.49 },
    May: { n:41107, wasting:4.79, sam:1.0, mam:3.79, stunting:24.37, sev_stunted:6.46, uw:13.53, sev_uw:2.55 },
    Jun: { n:40876, wasting:4.98, sam:0.94, mam:4.04, stunting:24.79, sev_stunted:6.74, uw:14.0, sev_uw:2.59 },
    Jul: { n:40367, wasting:9.05, sam:1.49, mam:7.56, stunting:26.3, sev_stunted:6.38, uw:21.43, sev_uw:4.04 },
  },
  Ganjam: {
    Feb: { n:223226, wasting:2.01, sam:0.57, mam:1.45, stunting:23.94, sev_stunted:10.74, uw:6.53, sev_uw:1.35 },
    Mar: { n:222611, wasting:1.92, sam:0.53, mam:1.39, stunting:22.02, sev_stunted:9.17, uw:5.7, sev_uw:1.12 },
    Apr: { n:220441, wasting:1.77, sam:0.45, mam:1.32, stunting:19.75, sev_stunted:8.05, uw:5.21, sev_uw:0.98 },
    May: { n:217262, wasting:1.53, sam:0.39, mam:1.14, stunting:18.98, sev_stunted:7.43, uw:4.71, sev_uw:0.83 },
    Jun: { n:212700, wasting:1.22, sam:0.28, mam:0.93, stunting:15.52, sev_stunted:5.64, uw:3.68, sev_uw:0.58 },
    Jul: { n:213357, wasting:1.29, sam:0.25, mam:1.04, stunting:10.71, sev_stunted:2.84, uw:3.12, sev_uw:0.39 },
  },
  Jagatsinghpur: {
    Feb: { n:51759, wasting:1.7, sam:0.35, mam:1.35, stunting:15.45, sev_stunted:4.83, uw:5.21, sev_uw:0.89 },
    Mar: { n:51386, wasting:1.61, sam:0.38, mam:1.24, stunting:13.78, sev_stunted:3.97, uw:4.73, sev_uw:0.83 },
    Apr: { n:50809, wasting:1.79, sam:0.42, mam:1.37, stunting:13.78, sev_stunted:4.1, uw:4.91, sev_uw:0.9 },
    May: { n:50246, wasting:1.71, sam:0.35, mam:1.35, stunting:13.89, sev_stunted:4.25, uw:4.68, sev_uw:0.89 },
    Jun: { n:49842, wasting:1.71, sam:0.36, mam:1.35, stunting:14.57, sev_stunted:4.48, uw:4.94, sev_uw:0.9 },
    Jul: { n:49654, wasting:2.29, sam:0.45, mam:1.83, stunting:13.08, sev_stunted:3.84, uw:5.52, sev_uw:0.87 },
  },
  Jajpur: {
    Feb: { n:118127, wasting:2.13, sam:0.39, mam:1.74, stunting:20.48, sev_stunted:6.05, uw:7.02, sev_uw:1.27 },
    Mar: { n:117891, wasting:1.92, sam:0.34, mam:1.59, stunting:18.56, sev_stunted:5.24, uw:6.31, sev_uw:1.13 },
    Apr: { n:116901, wasting:1.88, sam:0.36, mam:1.52, stunting:16.99, sev_stunted:4.41, uw:5.94, sev_uw:1.06 },
    May: { n:115701, wasting:1.75, sam:0.33, mam:1.42, stunting:16.23, sev_stunted:4.19, uw:5.64, sev_uw:0.97 },
    Jun: { n:114674, wasting:1.88, sam:0.36, mam:1.52, stunting:15.27, sev_stunted:3.9, uw:5.42, sev_uw:0.97 },
    Jul: { n:113903, wasting:1.66, sam:0.24, mam:1.42, stunting:12.68, sev_stunted:2.72, uw:5.47, sev_uw:0.87 },
  },
  Jharsuguda: {
    Feb: { n:28452, wasting:4.61, sam:1.36, mam:3.25, stunting:29.34, sev_stunted:10.02, uw:12.78, sev_uw:1.81 },
    Mar: { n:28366, wasting:4.61, sam:1.12, mam:3.49, stunting:19.54, sev_stunted:3.83, uw:9.5, sev_uw:1.23 },
    Apr: { n:28055, wasting:4.13, sam:1.02, mam:3.1, stunting:21.95, sev_stunted:4.4, uw:10.24, sev_uw:1.46 },
    May: { n:28084, wasting:4.05, sam:0.95, mam:3.1, stunting:20.81, sev_stunted:4.73, uw:9.61, sev_uw:1.35 },
    Jun: { n:27862, wasting:3.17, sam:0.89, mam:2.28, stunting:20.59, sev_stunted:4.63, uw:8.92, sev_uw:1.27 },
    Jul: { n:27967, wasting:4.24, sam:1.02, mam:3.23, stunting:20.21, sev_stunted:4.26, uw:10.79, sev_uw:1.56 },
  },
  Kalahandi: {
    Feb: { n:114829, wasting:3.92, sam:0.7, mam:3.22, stunting:32.01, sev_stunted:11.28, uw:12.93, sev_uw:2.24 },
    Mar: { n:114388, wasting:3.91, sam:0.67, mam:3.24, stunting:27.84, sev_stunted:8.92, uw:11.27, sev_uw:1.96 },
    Apr: { n:113388, wasting:3.96, sam:0.76, mam:3.2, stunting:26.46, sev_stunted:8.04, uw:11.38, sev_uw:1.95 },
    May: { n:112772, wasting:3.78, sam:0.71, mam:3.07, stunting:24.15, sev_stunted:7.26, uw:10.06, sev_uw:1.65 },
    Jun: { n:112937, wasting:3.54, sam:0.61, mam:2.93, stunting:22.6, sev_stunted:6.19, uw:9.56, sev_uw:1.48 },
    Jul: { n:112947, wasting:3.79, sam:0.53, mam:3.26, stunting:18.38, sev_stunted:3.98, uw:9.24, sev_uw:1.28 },
  },
  Kandhamal: {
    Feb: { n:60642, wasting:4.23, sam:0.72, mam:3.51, stunting:33.82, sev_stunted:9.06, uw:15.75, sev_uw:2.17 },
    Mar: { n:60392, wasting:4.25, sam:0.66, mam:3.59, stunting:31.17, sev_stunted:7.37, uw:14.97, sev_uw:2.08 },
    Apr: { n:59702, wasting:4.32, sam:0.71, mam:3.61, stunting:31.99, sev_stunted:7.73, uw:15.51, sev_uw:2.17 },
    May: { n:59007, wasting:4.43, sam:0.76, mam:3.67, stunting:30.56, sev_stunted:7.18, uw:15.25, sev_uw:2.19 },
    Jun: { n:58596, wasting:4.59, sam:0.67, mam:3.92, stunting:27.86, sev_stunted:5.47, uw:15.19, sev_uw:2.12 },
    Jul: { n:58623, wasting:4.85, sam:0.73, mam:4.12, stunting:27.1, sev_stunted:5.05, uw:16.32, sev_uw:2.37 },
  },
  Kendrapara: {
    Feb: { n:80103, wasting:1.99, sam:0.57, mam:1.42, stunting:10.93, sev_stunted:2.8, uw:4.54, sev_uw:0.7 },
    Mar: { n:79669, wasting:1.88, sam:0.54, mam:1.34, stunting:8.21, sev_stunted:1.95, uw:3.59, sev_uw:0.6 },
    Apr: { n:78760, wasting:1.89, sam:0.51, mam:1.38, stunting:9.48, sev_stunted:2.12, uw:4.06, sev_uw:0.7 },
    May: { n:78337, wasting:1.72, sam:0.5, mam:1.22, stunting:8.94, sev_stunted:2.01, uw:3.66, sev_uw:0.62 },
    Jun: { n:78180, wasting:1.8, sam:0.49, mam:1.31, stunting:8.83, sev_stunted:1.97, uw:3.78, sev_uw:0.63 },
    Jul: { n:77244, wasting:1.43, sam:0.24, mam:1.19, stunting:7.61, sev_stunted:1.32, uw:3.98, sev_uw:0.47 },
  },
  Kendujhar: {
    Feb: { n:127224, wasting:4.55, sam:0.82, mam:3.73, stunting:35.18, sev_stunted:12.71, uw:18.75, sev_uw:3.16 },
    Mar: { n:125594, wasting:4.97, sam:0.85, mam:4.12, stunting:23.75, sev_stunted:6.94, uw:15.47, sev_uw:2.52 },
    Apr: { n:123593, wasting:5.79, sam:1.01, mam:4.79, stunting:21.93, sev_stunted:5.89, uw:15.85, sev_uw:2.85 },
    May: { n:122974, wasting:5.5, sam:0.9, mam:4.59, stunting:21.8, sev_stunted:5.94, uw:15.26, sev_uw:2.75 },
    Jun: { n:122404, wasting:5.56, sam:0.94, mam:4.61, stunting:23.57, sev_stunted:6.41, uw:16.12, sev_uw:2.87 },
    Jul: { n:121982, wasting:5.89, sam:0.89, mam:5.0, stunting:24.73, sev_stunted:6.34, uw:17.57, sev_uw:2.97 },
  },
  Khordha: {
    Feb: { n:107824, wasting:1.81, sam:0.37, mam:1.45, stunting:14.72, sev_stunted:3.39, uw:5.77, sev_uw:0.77 },
    Mar: { n:107676, wasting:1.74, sam:0.35, mam:1.38, stunting:14.32, sev_stunted:3.26, uw:5.52, sev_uw:0.73 },
    Apr: { n:106595, wasting:1.79, sam:0.35, mam:1.44, stunting:15.37, sev_stunted:3.52, uw:6.07, sev_uw:0.86 },
    May: { n:106186, wasting:1.73, sam:0.36, mam:1.36, stunting:13.66, sev_stunted:3.12, uw:5.21, sev_uw:0.7 },
    Jun: { n:105827, wasting:1.69, sam:0.36, mam:1.33, stunting:14.12, sev_stunted:3.26, uw:5.43, sev_uw:0.76 },
    Jul: { n:105304, wasting:2.06, sam:0.35, mam:1.72, stunting:12.03, sev_stunted:2.15, uw:6.16, sev_uw:0.74 },
  },
  Koraput: {
    Feb: { n:114172, wasting:3.05, sam:0.44, mam:2.61, stunting:30.67, sev_stunted:8.79, uw:15.69, sev_uw:2.26 },
    Mar: { n:113518, wasting:2.91, sam:0.41, mam:2.5, stunting:30.0, sev_stunted:8.66, uw:15.1, sev_uw:2.21 },
    Apr: { n:112754, wasting:3.0, sam:0.5, mam:2.5, stunting:31.43, sev_stunted:9.39, uw:16.35, sev_uw:2.55 },
    May: { n:112462, wasting:3.03, sam:0.4, mam:2.62, stunting:28.3, sev_stunted:7.99, uw:15.15, sev_uw:2.28 },
    Jun: { n:112661, wasting:3.24, sam:0.42, mam:2.82, stunting:27.11, sev_stunted:7.37, uw:14.91, sev_uw:2.16 },
    Jul: { n:112554, wasting:3.84, sam:0.41, mam:3.43, stunting:25.58, sev_stunted:5.91, uw:15.76, sev_uw:2.2 },
  },
  Malkangiri: {
    Feb: { n:54363, wasting:6.83, sam:1.2, mam:5.64, stunting:41.25, sev_stunted:13.61, uw:25.15, sev_uw:4.37 },
    Mar: { n:54064, wasting:7.11, sam:1.26, mam:5.84, stunting:39.53, sev_stunted:12.56, uw:24.36, sev_uw:4.15 },
    Apr: { n:53544, wasting:8.62, sam:1.39, mam:7.23, stunting:36.59, sev_stunted:10.21, uw:25.46, sev_uw:4.57 },
    May: { n:53710, wasting:8.26, sam:1.29, mam:6.97, stunting:30.95, sev_stunted:7.36, uw:23.03, sev_uw:3.77 },
    Jun: { n:53585, wasting:7.61, sam:1.2, mam:6.4, stunting:28.89, sev_stunted:6.47, uw:21.36, sev_uw:3.23 },
    Jul: { n:53893, wasting:9.23, sam:1.67, mam:7.56, stunting:28.52, sev_stunted:6.3, uw:23.17, sev_uw:3.99 },
  },
  Mayurbhanj: {
    Feb: { n:157205, wasting:5.35, sam:0.68, mam:4.67, stunting:34.49, sev_stunted:10.41, uw:21.11, sev_uw:3.22 },
    Mar: { n:155412, wasting:5.82, sam:0.77, mam:5.05, stunting:30.34, sev_stunted:6.29, uw:20.1, sev_uw:2.9 },
    Apr: { n:154936, wasting:5.76, sam:0.73, mam:5.03, stunting:28.7, sev_stunted:5.87, uw:19.62, sev_uw:2.72 },
    May: { n:153973, wasting:5.6, sam:0.54, mam:5.07, stunting:28.15, sev_stunted:5.94, uw:19.56, sev_uw:2.77 },
    Jun: { n:153935, wasting:5.8, sam:0.62, mam:5.19, stunting:25.55, sev_stunted:5.37, uw:19.37, sev_uw:2.79 },
    Jul: { n:153361, wasting:6.7, sam:0.74, mam:5.95, stunting:28.04, sev_stunted:5.73, uw:22.11, sev_uw:3.25 },
  },
  Nabarangpur: {
    Feb: { n:113632, wasting:3.97, sam:0.39, mam:3.58, stunting:33.97, sev_stunted:10.09, uw:20.37, sev_uw:3.13 },
    Mar: { n:113205, wasting:3.92, sam:0.37, mam:3.55, stunting:26.89, sev_stunted:7.35, uw:17.47, sev_uw:2.62 },
    Apr: { n:112109, wasting:4.6, sam:0.46, mam:4.14, stunting:26.2, sev_stunted:6.27, uw:17.82, sev_uw:2.74 },
    May: { n:112221, wasting:4.41, sam:0.41, mam:4.0, stunting:21.56, sev_stunted:4.62, uw:15.26, sev_uw:2.19 },
    Jun: { n:112120, wasting:4.01, sam:0.35, mam:3.66, stunting:20.1, sev_stunted:4.07, uw:14.27, sev_uw:1.99 },
    Jul: { n:112469, wasting:3.79, sam:0.32, mam:3.47, stunting:21.17, sev_stunted:3.62, uw:15.33, sev_uw:1.88 },
  },
  Nayagarh: {
    Feb: { n:50898, wasting:2.1, sam:0.35, mam:1.76, stunting:27.41, sev_stunted:10.05, uw:9.23, sev_uw:1.23 },
    Mar: { n:50719, wasting:2.18, sam:0.36, mam:1.82, stunting:25.53, sev_stunted:8.66, uw:8.76, sev_uw:1.17 },
    Apr: { n:49869, wasting:2.48, sam:0.41, mam:2.07, stunting:24.55, sev_stunted:7.79, uw:8.64, sev_uw:1.18 },
    May: { n:49761, wasting:2.28, sam:0.38, mam:1.9, stunting:23.53, sev_stunted:7.53, uw:8.15, sev_uw:1.05 },
    Jun: { n:49524, wasting:2.47, sam:0.45, mam:2.02, stunting:23.18, sev_stunted:6.56, uw:8.33, sev_uw:1.17 },
    Jul: { n:49130, wasting:2.88, sam:0.5, mam:2.38, stunting:18.18, sev_stunted:4.21, uw:8.12, sev_uw:0.99 },
  },
  Nuapada: {
    Feb: { n:46372, wasting:2.48, sam:0.31, mam:2.17, stunting:28.33, sev_stunted:7.31, uw:11.39, sev_uw:1.31 },
    Mar: { n:46136, wasting:1.97, sam:0.17, mam:1.8, stunting:26.29, sev_stunted:7.1, uw:10.4, sev_uw:1.15 },
    Apr: { n:45947, wasting:2.2, sam:0.23, mam:1.98, stunting:29.75, sev_stunted:8.74, uw:11.89, sev_uw:1.47 },
    May: { n:46250, wasting:2.29, sam:0.25, mam:2.04, stunting:27.24, sev_stunted:8.04, uw:11.02, sev_uw:1.24 },
    Jun: { n:47428, wasting:2.18, sam:0.22, mam:1.96, stunting:19.76, sev_stunted:5.38, uw:9.1, sev_uw:0.95 },
    Jul: { n:48325, wasting:2.28, sam:0.23, mam:2.04, stunting:13.9, sev_stunted:2.97, uw:8.35, sev_uw:0.89 },
  },
  Puri: {
    Feb: { n:83874, wasting:0.47, sam:0.05, mam:0.41, stunting:12.13, sev_stunted:2.03, uw:3.56, sev_uw:0.33 },
    Mar: { n:83670, wasting:0.45, sam:0.07, mam:0.38, stunting:10.42, sev_stunted:0.76, uw:3.04, sev_uw:0.24 },
    Apr: { n:82486, wasting:0.46, sam:0.07, mam:0.39, stunting:10.71, sev_stunted:0.83, uw:2.99, sev_uw:0.26 },
    May: { n:81653, wasting:0.49, sam:0.09, mam:0.4, stunting:4.86, sev_stunted:0.53, uw:2.31, sev_uw:0.27 },
    Jun: { n:80826, wasting:0.52, sam:0.09, mam:0.43, stunting:4.48, sev_stunted:0.51, uw:2.27, sev_uw:0.28 },
    Jul: { n:80477, wasting:0.84, sam:0.12, mam:0.71, stunting:6.3, sev_stunted:0.67, uw:3.19, sev_uw:0.36 },
  },
  Rayagada: {
    Feb: { n:80526, wasting:2.85, sam:0.66, mam:2.2, stunting:29.07, sev_stunted:7.76, uw:11.54, sev_uw:1.6 },
    Mar: { n:80088, wasting:2.51, sam:0.56, mam:1.96, stunting:26.39, sev_stunted:6.91, uw:10.38, sev_uw:1.37 },
    Apr: { n:79064, wasting:2.79, sam:0.65, mam:2.14, stunting:28.27, sev_stunted:7.63, uw:11.76, sev_uw:1.72 },
    May: { n:78075, wasting:2.52, sam:0.6, mam:1.92, stunting:23.42, sev_stunted:5.7, uw:9.51, sev_uw:1.36 },
    Jun: { n:77814, wasting:3.16, sam:0.77, mam:2.39, stunting:22.8, sev_stunted:5.47, uw:9.86, sev_uw:1.61 },
    Jul: { n:77188, wasting:6.96, sam:1.41, mam:5.55, stunting:28.77, sev_stunted:6.24, uw:18.52, sev_uw:3.19 },
  },
  Sambalpur: {
    Feb: { n:55758, wasting:4.45, sam:0.97, mam:3.48, stunting:33.46, sev_stunted:10.9, uw:16.9, sev_uw:2.45 },
    Mar: { n:55666, wasting:4.78, sam:1.05, mam:3.73, stunting:29.41, sev_stunted:8.35, uw:15.85, sev_uw:2.3 },
    Apr: { n:54815, wasting:5.19, sam:1.09, mam:4.1, stunting:26.97, sev_stunted:6.33, uw:15.65, sev_uw:2.1 },
    May: { n:54640, wasting:5.2, sam:1.07, mam:4.13, stunting:24.39, sev_stunted:5.2, uw:14.84, sev_uw:1.96 },
    Jun: { n:54375, wasting:5.1, sam:0.99, mam:4.1, stunting:23.58, sev_stunted:4.69, uw:14.87, sev_uw:2.0 },
    Jul: { n:54090, wasting:3.76, sam:0.57, mam:3.19, stunting:16.96, sev_stunted:2.83, uw:11.75, sev_uw:1.47 },
  },
  Subarnapur: {
    Feb: { n:37995, wasting:3.56, sam:0.88, mam:2.68, stunting:33.24, sev_stunted:12.69, uw:14.31, sev_uw:2.33 },
    Mar: { n:37969, wasting:3.76, sam:0.93, mam:2.83, stunting:24.24, sev_stunted:7.19, uw:11.72, sev_uw:1.7 },
    Apr: { n:37327, wasting:4.99, sam:1.08, mam:3.91, stunting:23.2, sev_stunted:5.4, uw:13.1, sev_uw:1.96 },
    May: { n:37242, wasting:4.41, sam:0.96, mam:3.45, stunting:21.83, sev_stunted:5.19, uw:12.0, sev_uw:1.75 },
    Jun: { n:37201, wasting:4.62, sam:0.97, mam:3.65, stunting:22.43, sev_stunted:4.94, uw:12.44, sev_uw:1.79 },
    Jul: { n:37207, wasting:5.47, sam:1.06, mam:4.42, stunting:22.49, sev_stunted:4.56, uw:14.48, sev_uw:2.16 },
  },
  Sundargarh: {
    Feb: { n:108785, wasting:3.32, sam:0.6, mam:2.72, stunting:27.62, sev_stunted:8.28, uw:13.03, sev_uw:1.82 },
    Mar: { n:108291, wasting:3.11, sam:0.58, mam:2.53, stunting:27.27, sev_stunted:8.19, uw:12.88, sev_uw:1.73 },
    Apr: { n:107643, wasting:3.27, sam:0.57, mam:2.7, stunting:28.77, sev_stunted:8.51, uw:14.18, sev_uw:1.85 },
    May: { n:107200, wasting:3.41, sam:0.61, mam:2.8, stunting:25.45, sev_stunted:7.44, uw:13.25, sev_uw:1.64 },
    Jun: { n:106081, wasting:3.53, sam:0.63, mam:2.9, stunting:26.09, sev_stunted:6.93, uw:13.47, sev_uw:1.65 },
    Jul: { n:106280, wasting:4.45, sam:0.64, mam:3.8, stunting:24.61, sev_stunted:6.02, uw:14.83, sev_uw:1.89 },
  },
};

// ── Real DQ scores per district ───────────────────────────────────────────────
// Source: validata analysis · zero_sam_mam_uw_awcs_jul2026.xlsx Master Sheet
// avg_score: mean DQ score (max 14 flags); red/green_pct: % AWCs in Red/Green category
// check rates: % AWCs flagged for Copying, Mechanical Increment, Z-Score Transitions, Borderline Zone
export type DistrictDQData = {
  awcs: number; avg_score: number;
  red_pct: number; green_pct: number;
  copy_pct: number; mech_inc_pct: number; z_trans_pct: number; borderline_pct: number;
};
export const districtDQData: Record<string, DistrictDQData> = {
  Angul:         { awcs: 1690, avg_score: 3.89, red_pct: 1.8,  green_pct: 1.2, copy_pct: 44.8, mech_inc_pct: 55.3, z_trans_pct: 30.2, borderline_pct: 85.6 },
  Balangir:      { awcs: 2771, avg_score: 4.14, red_pct: 2.9,  green_pct: 0.7, copy_pct: 45.0, mech_inc_pct: 44.3, z_trans_pct: 26.0, borderline_pct: 94.2 },
  Balasore:      { awcs: 4215, avg_score: 3.96, red_pct: 2.9,  green_pct: 1.5, copy_pct: 46.3, mech_inc_pct: 49.6, z_trans_pct: 41.7, borderline_pct: 83.1 },
  Bargarh:       { awcs: 2914, avg_score: 4.03, red_pct: 1.2,  green_pct: 1.5, copy_pct: 56.5, mech_inc_pct: 53.5, z_trans_pct: 21.0, borderline_pct: 84.7 },
  Bhadrak:       { awcs: 2430, avg_score: 3.77, red_pct: 1.9,  green_pct: 1.8, copy_pct: 49.5, mech_inc_pct: 56.6, z_trans_pct: 22.1, borderline_pct: 82.1 },
  Boudh:         { awcs: 728,  avg_score: 3.94, red_pct: 1.9,  green_pct: 1.5, copy_pct: 52.9, mech_inc_pct: 44.4, z_trans_pct: 32.1, borderline_pct: 87.4 },
  Cuttack:       { awcs: 3334, avg_score: 3.06, red_pct: 0.7,  green_pct: 4.6, copy_pct: 33.9, mech_inc_pct: 52.6, z_trans_pct: 15.6, borderline_pct: 80.5 },
  Deogarh:       { awcs: 801,  avg_score: 4.07, red_pct: 1.2,  green_pct: 0.5, copy_pct: 37.7, mech_inc_pct: 46.1, z_trans_pct: 31.3, borderline_pct: 95.9 },
  Dhenkanal:     { awcs: 2222, avg_score: 3.60, red_pct: 1.6,  green_pct: 2.4, copy_pct: 47.7, mech_inc_pct: 53.7, z_trans_pct: 31.7, borderline_pct: 78.5 },
  Gajapati:      { awcs: 2432, avg_score: 4.44, red_pct: 4.7,  green_pct: 0.6, copy_pct: 54.5, mech_inc_pct: 52.0, z_trans_pct: 51.9, borderline_pct: 86.7 },
  Ganjam:        { awcs: 5161, avg_score: 3.54, red_pct: 2.3,  green_pct: 4.3, copy_pct: 47.2, mech_inc_pct: 61.4, z_trans_pct: 33.6, borderline_pct: 63.0 },
  Jagatsinghpur: { awcs: 1816, avg_score: 3.06, red_pct: 0.7,  green_pct: 5.8, copy_pct: 43.1, mech_inc_pct: 57.2, z_trans_pct: 21.0, borderline_pct: 68.9 },
  Jajpur:        { awcs: 2827, avg_score: 3.46, red_pct: 1.4,  green_pct: 3.6, copy_pct: 41.6, mech_inc_pct: 54.0, z_trans_pct: 25.3, borderline_pct: 78.1 },
  Jharsuguda:    { awcs: 967,  avg_score: 4.18, red_pct: 2.4,  green_pct: 0.3, copy_pct: 51.4, mech_inc_pct: 48.8, z_trans_pct: 35.3, borderline_pct: 92.2 },
  Kalahandi:     { awcs: 2378, avg_score: 4.29, red_pct: 3.7,  green_pct: 0.9, copy_pct: 48.9, mech_inc_pct: 58.2, z_trans_pct: 39.3, borderline_pct: 88.4 },
  Kandhamal:     { awcs: 2197, avg_score: 3.74, red_pct: 1.7,  green_pct: 0.5, copy_pct: 41.1, mech_inc_pct: 39.7, z_trans_pct: 33.8, borderline_pct: 93.0 },
  Kendrapara:    { awcs: 2145, avg_score: 3.58, red_pct: 2.0,  green_pct: 2.8, copy_pct: 52.5, mech_inc_pct: 51.0, z_trans_pct: 29.7, borderline_pct: 77.0 },
  Kendujhar:     { awcs: 3355, avg_score: 4.25, red_pct: 2.9,  green_pct: 0.9, copy_pct: 50.4, mech_inc_pct: 44.8, z_trans_pct: 34.7, borderline_pct: 92.0 },
  Khordha:       { awcs: 2554, avg_score: 3.50, red_pct: 1.1,  green_pct: 2.9, copy_pct: 47.1, mech_inc_pct: 54.2, z_trans_pct: 22.3, borderline_pct: 79.5 },
  Koraput:       { awcs: 3397, avg_score: 4.48, red_pct: 2.8,  green_pct: 0.3, copy_pct: 57.8, mech_inc_pct: 54.0, z_trans_pct: 28.2, borderline_pct: 94.2 },
  Malkangiri:    { awcs: 1325, avg_score: 4.27, red_pct: 3.1,  green_pct: 0.4, copy_pct: 40.4, mech_inc_pct: 45.2, z_trans_pct: 46.6, borderline_pct: 97.0 },
  Mayurbhanj:    { awcs: 5150, avg_score: 4.05, red_pct: 1.6,  green_pct: 0.3, copy_pct: 36.0, mech_inc_pct: 44.0, z_trans_pct: 25.9, borderline_pct: 97.9 },
  Nabarangpur:   { awcs: 2331, avg_score: 4.24, red_pct: 2.5,  green_pct: 0.0, copy_pct: 39.6, mech_inc_pct: 44.8, z_trans_pct: 25.2, borderline_pct: 97.6 },
  Nayagarh:      { awcs: 1584, avg_score: 3.51, red_pct: 1.6,  green_pct: 2.0, copy_pct: 47.0, mech_inc_pct: 52.0, z_trans_pct: 31.8, borderline_pct: 82.6 },
  Nuapada:       { awcs: 1407, avg_score: 4.32, red_pct: 2.3,  green_pct: 0.4, copy_pct: 56.4, mech_inc_pct: 52.0, z_trans_pct: 26.2, borderline_pct: 96.2 },
  Puri:          { awcs: 2599, avg_score: 3.27, red_pct: 0.7,  green_pct: 3.0, copy_pct: 43.6, mech_inc_pct: 51.7, z_trans_pct: 18.3, borderline_pct: 80.8 },
  Rayagada:      { awcs: 2087, avg_score: 4.40, red_pct: 3.3,  green_pct: 1.0, copy_pct: 54.4, mech_inc_pct: 54.8, z_trans_pct: 42.9, borderline_pct: 89.1 },
  Sambalpur:     { awcs: 1886, avg_score: 4.00, red_pct: 2.0,  green_pct: 0.7, copy_pct: 38.9, mech_inc_pct: 47.6, z_trans_pct: 30.8, borderline_pct: 93.9 },
  Subarnapur:    { awcs: 1556, avg_score: 4.26, red_pct: 2.6,  green_pct: 0.3, copy_pct: 51.4, mech_inc_pct: 51.6, z_trans_pct: 39.1, borderline_pct: 92.0 },
  Sundargarh:    { awcs: 3920, avg_score: 4.06, red_pct: 1.5,  green_pct: 0.4, copy_pct: 46.3, mech_inc_pct: 47.7, z_trans_pct: 26.6, borderline_pct: 95.3 },
};

// ── AWC DQ score distribution per district ───────────────────────────────────
// Index 0..10 = AWCs with exactly that many flags; index 11 = AWCs with ≥11 flags
// Source: validata analysis · zero_sam_mam_uw_awcs_jul2026.xlsx Master Sheet
export const districtDQScoreDist: Record<string, number[]> = {
  Angul:         [21, 84, 239, 372, 394, 301, 179, 69, 23, 5, 2, 0],
  Balangir:      [20, 63, 293, 664, 687, 486, 362, 116, 58, 16, 5, 0],
  Balasore:      [64, 218, 586, 928, 906, 703, 460, 225, 92, 28, 3, 1],
  Bargarh:       [44, 129, 303, 608, 712, 567, 404, 111, 30, 3, 2, 0],
  Bhadrak:       [43, 171, 361, 516, 555, 392, 260, 86, 37, 5, 3, 0],
  Boudh:         [11, 37, 92, 158, 159, 153, 71, 32, 10, 3, 1, 0],
  Cuttack:       [154, 459, 728, 746, 596, 369, 193, 65, 18, 3, 2, 0],
  Deogarh:       [4, 15, 87, 195, 204, 161, 86, 38, 9, 0, 1, 0],
  Dhenkanal:     [53, 212, 353, 486, 450, 345, 199, 88, 29, 4, 2, 0],
  Gajapati:      [14, 74, 218, 454, 541, 485, 334, 196, 77, 36, 1, 1],
  Ganjam:        [221, 548, 844, 1028, 937, 778, 468, 219, 99, 18, 0, 0],
  Jagatsinghpur: [106, 239, 368, 416, 324, 213, 97, 39, 11, 1, 1, 0],
  Jajpur:        [102, 227, 523, 642, 581, 410, 227, 75, 34, 5, 0, 0],
  Jharsuguda:    [3, 36, 109, 187, 240, 190, 125, 53, 18, 2, 3, 0],
  Kalahandi:     [22, 76, 247, 463, 538, 465, 316, 162, 64, 22, 2, 0],
  Kandhamal:     [11, 87, 338, 626, 533, 321, 167, 76, 26, 9, 2, 0],
  Kendrapara:    [61, 186, 388, 449, 404, 340, 204, 70, 31, 11, 0, 0],
  Kendujhar:     [30, 92, 274, 714, 863, 655, 447, 182, 76, 16, 5, 0],
  Khordha:       [74, 237, 448, 582, 495, 373, 226, 91, 20, 6, 1, 0],
  Koraput:       [10, 57, 261, 613, 802, 786, 529, 242, 79, 15, 2, 0],
  Malkangiri:    [5, 23, 110, 305, 328, 292, 153, 67, 29, 11, 0, 1],
  Mayurbhanj:    [15, 79, 465, 1520, 1284, 956, 545, 205, 65, 9, 5, 1],
  Nabarangpur:   [1, 20, 142, 654, 624, 446, 287, 98, 49, 6, 3, 0],
  Nayagarh:      [31, 146, 301, 354, 305, 246, 125, 50, 21, 4, 0, 0],
  Nuapada:       [6, 34, 142, 258, 339, 293, 216, 85, 25, 7, 1, 0],
  Puri:          [79, 257, 538, 627, 532, 324, 177, 46, 18, 0, 0, 0],
  Rayagada:      [21, 53, 163, 368, 514, 458, 290, 151, 55, 11, 2, 0],
  Sambalpur:     [14, 55, 221, 489, 442, 351, 184, 91, 29, 8, 1, 0],
  Subarnapur:    [5, 32, 149, 339, 391, 308, 200, 90, 33, 7, 1, 0],
  Sundargarh:    [14, 92, 397, 1007, 992, 763, 429, 168, 47, 8, 2, 0],
};

export function rankDistricts(kind: LayerKind, key: string, ascendingBetter = false) {
  const rows = DISTRICTS.map((d) => ({ name: d, value: getDistrictValue(d, kind, key) ?? 0 }));
  const lowerBetter = kind === "outcome" ? !ascendingBetter : ascendingBetter;
  rows.sort((a, b) => (lowerBetter ? a.value - b.value : b.value - a.value));
  return rows;
}

// ── NFHS-6 district outcomes ─────────────────────────────────────────────────
// Source: NFHS-6 (2023-24) State Fact Sheet – Odisha Compendium (district level)
// Source: NFHS-6 (2023-24) district fact sheets + dq_bin_analysis_odisha_2026-09-18.xlsx
// wasting = NFHS-6 SAM% + NFHS-6 MAM% (WHZ < -2); sam = WHZ < -3 only (no MUAC/oedema)
export const districtNFHS6Data: Record<string, { stunting: number; wasting: number; underweight: number; sam: number }> = {
  Angul:         { stunting: 27.0, wasting: 19.7, underweight: 28.9, sam: 6.0  },
  Balangir:      { stunting: 36.4, wasting: 25.3, underweight: 36.0, sam: 5.2  },
  Balasore:      { stunting: 26.0, wasting: 23.8, underweight: 33.7, sam: 5.0  },
  Bargarh:       { stunting: 34.6, wasting: 20.6, underweight: 37.4, sam: 5.0  },
  Bhadrak:       { stunting: 19.1, wasting: 23.8, underweight: 29.1, sam: 2.6  },
  Boudh:         { stunting: 32.4, wasting: 17.3, underweight: 30.9, sam: 3.7  },
  Cuttack:       { stunting: 17.6, wasting: 21.5, underweight: 20.6, sam: 6.1  },
  Deogarh:       { stunting: 31.8, wasting: 17.9, underweight: 32.6, sam: 3.9  },
  Dhenkanal:     { stunting: 22.8, wasting: 21.0, underweight: 30.3, sam: 3.7  },
  Gajapati:      { stunting: 35.3, wasting: 25.3, underweight: 42.5, sam: 9.1  },
  Ganjam:        { stunting: 20.2, wasting: 13.0, underweight: 16.3, sam: 3.5  },
  Jagatsinghpur: { stunting: 14.7, wasting: 19.5, underweight: 17.3, sam: 2.5  },
  Jajpur:        { stunting: 20.4, wasting: 20.3, underweight: 23.4, sam: 6.3  },
  Jharsuguda:    { stunting: 24.0, wasting: 19.7, underweight: 35.0, sam: 6.1  },
  Kalahandi:     { stunting: 26.9, wasting: 25.2, underweight: 35.9, sam: 6.2  },
  Kandhamal:     { stunting: 34.8, wasting: 15.8, underweight: 33.8, sam: 3.1  },
  Kendrapara:    { stunting: 22.8, wasting: 16.0, underweight: 20.0, sam: 2.8  },
  Kendujhar:     { stunting: 35.2, wasting: 31.6, underweight: 45.2, sam: 10.0 },
  Khordha:       { stunting: 13.9, wasting: 18.8, underweight: 16.5, sam: 4.9  },
  Koraput:       { stunting: 38.7, wasting: 24.6, underweight: 42.7, sam: 7.0  },
  Malkangiri:    { stunting: 37.3, wasting: 30.7, underweight: 46.1, sam: 9.6  },
  Mayurbhanj:    { stunting: 26.5, wasting: 33.0, underweight: 44.3, sam: 10.8 },
  Nabarangpur:   { stunting: 32.1, wasting: 24.2, underweight: 38.9, sam: 5.6  },
  Nayagarh:      { stunting: 16.6, wasting: 12.8, underweight: 17.4, sam: 2.9  },
  Nuapada:       { stunting: 27.5, wasting: 19.2, underweight: 32.5, sam: 5.3  },
  Puri:          { stunting: 9.3,  wasting: 12.7, underweight: 15.2, sam: 3.1  },
  Rayagada:      { stunting: 47.2, wasting: 20.3, underweight: 46.8, sam: 7.5  },
  Sambalpur:     { stunting: 24.3, wasting: 23.5, underweight: 32.7, sam: 7.6  },
  Subarnapur:    { stunting: 28.5, wasting: 20.4, underweight: 30.5, sam: 4.3  },
  Sundargarh:    { stunting: 27.6, wasting: 25.0, underweight: 32.3, sam: 6.3  },
};

/** % of AWCs per district reporting zero SAM/MAM/UW children in Jul 2026.
 * Source: zero_sam_mam_uw_awcs_jul2026.xlsx (computed from Master Sheet tab).
 * Interpretation: high % in coastal/developed districts → likely reporting suppression.
 * Low % in KBK belt → genuine malnutrition burden being reported honestly. */
export const districtZeroSAMPct: Record<string, number> = {
  Angul: 29.8, Balangir: 26.6, Balasore: 23.7, Bargarh: 30.4, Bhadrak: 28.4,
  Boudh: 18.0, Cuttack: 44.9, Deogarh: 17.1, Dhenkanal: 42.8, Gajapati: 20.0,
  Ganjam: 48.0, Jagatsinghpur: 36.0, Jajpur: 33.5, Jharsuguda: 19.3,
  Kalahandi: 14.5, Kandhamal: 11.3, Kendrapara: 44.6, Kendujhar: 14.5,
  Khordha: 27.3, Koraput: 14.2, Malkangiri: 4.4, Mayurbhanj: 8.7,
  Nabarangpur: 6.7, Nayagarh: 23.5, Nuapada: 30.4, Puri: 54.0,
  Rayagada: 9.2, Sambalpur: 17.1, Subarnapur: 18.0, Sundargarh: 15.1,
};

// ── 14-check DQ rates per district ──────────────────────────────────────────
// Source: validata analysis · zero_sam_mam_uw_awcs_jul2026.xlsx
// Groups: Borderline (wasting/stunting/uw), Copied (wt/ht/both), Same Increment (ht/wt/both),
//         Abnormal Transitions (haz/waz/whz), Blanket Increment (wt/ht)
export type DistrictDQChecks = {
  bl_wasting: number; bl_stunting: number; bl_uw: number;
  copy_wt: number; copy_ht: number; copy_both: number;
  inc_ht: number; inc_wt: number; inc_both: number;
  trans_haz: number; trans_waz: number; trans_whz: number;
  blanket_wt: number; blanket_ht: number;
};
export const districtDQChecks: Record<string, DistrictDQChecks> = {
  Angul: { bl_wasting:37.1, bl_stunting:76.4, bl_uw:67.0, copy_wt:16.2, copy_ht:41.7, copy_both:9.4, inc_ht:6.2, inc_wt:13.6, inc_both:1.3, trans_haz:11.3, trans_waz:7.0, trans_whz:28.0, blanket_wt:44.9, blanket_ht:28.4 },
  Balangir: { bl_wasting:54.8, bl_stunting:85.8, bl_uw:85.9, copy_wt:23.4, copy_ht:40.1, copy_both:12.5, inc_ht:3.8, inc_wt:8.4, inc_both:0.9, trans_haz:11.8, trans_waz:6.5, trans_whz:23.0, blanket_wt:36.0, blanket_ht:20.9 },
  Balasore: { bl_wasting:34.1, bl_stunting:64.3, bl_uw:66.1, copy_wt:18.0, copy_ht:44.1, copy_both:11.3, inc_ht:6.8, inc_wt:10.4, inc_both:1.8, trans_haz:19.7, trans_waz:13.4, trans_whz:38.1, blanket_wt:38.5, blanket_ht:29.1 },
  Bargarh: { bl_wasting:45.2, bl_stunting:77.1, bl_uw:72.1, copy_wt:22.8, copy_ht:53.2, copy_both:13.9, inc_ht:5.3, inc_wt:12.9, inc_both:1.1, trans_haz:5.5, trans_waz:5.5, trans_whz:19.5, blanket_wt:45.0, blanket_ht:23.7 },
  Bhadrak: { bl_wasting:33.1, bl_stunting:69.7, bl_uw:60.4, copy_wt:22.2, copy_ht:46.4, copy_both:13.7, inc_ht:8.4, inc_wt:11.1, inc_both:2.1, trans_haz:6.3, trans_waz:5.7, trans_whz:20.6, blanket_wt:42.2, blanket_ht:35.0 },
  Boudh: { bl_wasting:32.5, bl_stunting:78.8, bl_uw:74.0, copy_wt:21.5, copy_ht:49.5, copy_both:13.6, inc_ht:5.1, inc_wt:13.1, inc_both:1.0, trans_haz:10.6, trans_waz:7.4, trans_whz:29.6, blanket_wt:37.6, blanket_ht:19.7 },
  Cuttack: { bl_wasting:21.5, bl_stunting:71.1, bl_uw:49.2, copy_wt:12.2, copy_ht:31.4, copy_both:6.8, inc_ht:8.4, inc_wt:13.1, inc_both:1.4, trans_haz:4.7, trans_waz:3.1, trans_whz:14.3, blanket_wt:39.9, blanket_ht:28.6 },
  Deogarh: { bl_wasting:58.1, bl_stunting:82.1, bl_uw:89.0, copy_wt:17.4, copy_ht:34.1, copy_both:8.6, inc_ht:4.1, inc_wt:9.8, inc_both:0.6, trans_haz:7.9, trans_waz:5.0, trans_whz:30.5, blanket_wt:38.6, blanket_ht:21.5 },
  Dhenkanal: { bl_wasting:17.4, bl_stunting:64.9, bl_uw:49.8, copy_wt:21.3, copy_ht:43.8, copy_both:13.5, inc_ht:7.4, inc_wt:12.9, inc_both:1.2, trans_haz:17.2, trans_waz:10.7, trans_whz:27.9, blanket_wt:40.4, blanket_ht:31.6 },
  Gajapati: { bl_wasting:41.1, bl_stunting:71.4, bl_uw:69.5, copy_wt:20.0, copy_ht:52.1, copy_both:13.4, inc_ht:3.8, inc_wt:11.1, inc_both:1.4, trans_haz:22.4, trans_waz:22.5, trans_whz:48.3, blanket_wt:47.1, blanket_ht:20.2 },
  Ganjam: { bl_wasting:11.4, bl_stunting:50.7, bl_uw:37.4, copy_wt:16.5, copy_ht:45.5, copy_both:11.5, inc_ht:9.5, inc_wt:21.0, inc_both:3.4, trans_haz:21.4, trans_waz:11.7, trans_whz:29.0, blanket_wt:54.2, blanket_ht:30.6 },
  Jagatsinghpur: { bl_wasting:19.1, bl_stunting:56.6, bl_uw:38.7, copy_wt:15.5, copy_ht:40.3, copy_both:9.0, inc_ht:8.7, inc_wt:11.5, inc_both:0.8, trans_haz:5.8, trans_waz:4.8, trans_whz:19.7, blanket_wt:40.9, blanket_ht:34.2 },
  Jajpur: { bl_wasting:25.1, bl_stunting:65.6, bl_uw:51.7, copy_wt:16.9, copy_ht:39.1, copy_both:10.5, inc_ht:8.0, inc_wt:15.7, inc_both:2.0, trans_haz:9.8, trans_waz:6.7, trans_whz:22.6, blanket_wt:44.0, blanket_ht:28.3 },
  Jharsuguda: { bl_wasting:46.1, bl_stunting:73.2, bl_uw:81.4, copy_wt:20.7, copy_ht:48.1, copy_both:11.5, inc_ht:5.8, inc_wt:11.1, inc_both:0.9, trans_haz:14.5, trans_waz:9.2, trans_whz:32.7, blanket_wt:41.0, blanket_ht:21.8 },
  Kalahandi: { bl_wasting:34.0, bl_stunting:70.4, bl_uw:74.3, copy_wt:17.9, copy_ht:47.0, copy_both:11.6, inc_ht:8.7, inc_wt:17.8, inc_both:2.4, trans_haz:20.2, trans_waz:11.9, trans_whz:36.4, blanket_wt:49.0, blanket_ht:27.4 },
  Kandhamal: { bl_wasting:46.1, bl_stunting:76.7, bl_uw:83.2, copy_wt:14.2, copy_ht:38.6, copy_both:7.2, inc_ht:3.4, inc_wt:6.5, inc_both:1.0, trans_haz:10.0, trans_waz:5.0, trans_whz:32.4, blanket_wt:32.8, blanket_ht:17.2 },
  Kendrapara: { bl_wasting:27.9, bl_stunting:67.6, bl_uw:47.9, copy_wt:21.2, copy_ht:49.6, copy_both:12.7, inc_ht:7.4, inc_wt:12.1, inc_both:1.5, trans_haz:7.9, trans_waz:7.9, trans_whz:27.4, blanket_wt:38.0, blanket_ht:29.2 },
  Kendujhar: { bl_wasting:59.3, bl_stunting:76.1, bl_uw:80.4, copy_wt:22.5, copy_ht:47.2, copy_both:12.9, inc_ht:5.0, inc_wt:8.5, inc_both:0.9, trans_haz:14.2, trans_waz:8.1, trans_whz:32.3, blanket_wt:34.8, blanket_ht:23.1 },
  Khordha: { bl_wasting:25.9, bl_stunting:66.0, bl_uw:54.4, copy_wt:16.4, copy_ht:45.2, copy_both:10.5, inc_ht:10.3, inc_wt:15.3, inc_both:1.7, trans_haz:6.4, trans_waz:4.9, trans_whz:21.0, blanket_wt:38.3, blanket_ht:34.0 },
  Koraput: { bl_wasting:55.0, bl_stunting:70.4, bl_uw:86.1, copy_wt:27.0, copy_ht:54.5, copy_both:17.6, inc_ht:5.7, inc_wt:14.4, inc_both:1.3, trans_haz:11.2, trans_waz:7.0, trans_whz:25.3, blanket_wt:46.0, blanket_ht:26.3 },
  Malkangiri: { bl_wasting:62.8, bl_stunting:77.4, bl_uw:90.7, copy_wt:11.6, copy_ht:39.0, copy_both:5.7, inc_ht:2.9, inc_wt:9.2, inc_both:0.8, trans_haz:13.4, trans_waz:10.6, trans_whz:45.2, blanket_wt:38.2, blanket_ht:19.8 },
  Mayurbhanj: { bl_wasting:69.9, bl_stunting:82.4, bl_uw:92.4, copy_wt:13.8, copy_ht:33.7, copy_both:6.6, inc_ht:4.8, inc_wt:7.0, inc_both:0.8, trans_haz:6.7, trans_waz:4.1, trans_whz:24.8, blanket_wt:34.7, blanket_ht:23.3 },
  Nabarangpur: { bl_wasting:71.7, bl_stunting:86.0, bl_uw:92.7, copy_wt:17.4, copy_ht:36.3, copy_both:8.7, inc_ht:4.9, inc_wt:8.3, inc_both:0.9, trans_haz:9.6, trans_waz:5.2, trans_whz:23.2, blanket_wt:36.8, blanket_ht:22.2 },
  Nayagarh: { bl_wasting:18.9, bl_stunting:65.4, bl_uw:61.3, copy_wt:14.9, copy_ht:44.8, copy_both:9.0, inc_ht:8.0, inc_wt:11.1, inc_both:1.1, trans_haz:11.9, trans_waz:6.2, trans_whz:30.6, blanket_wt:37.7, blanket_ht:30.8 },
  Nuapada: { bl_wasting:47.9, bl_stunting:81.7, bl_uw:88.3, copy_wt:20.8, copy_ht:54.2, copy_both:14.1, inc_ht:4.6, inc_wt:12.4, inc_both:0.9, trans_haz:12.1, trans_waz:4.3, trans_whz:24.2, blanket_wt:42.6, blanket_ht:24.2 },
  Puri: { bl_wasting:22.6, bl_stunting:74.6, bl_uw:48.6, copy_wt:18.0, copy_ht:39.8, copy_both:9.8, inc_ht:7.9, inc_wt:11.3, inc_both:1.3, trans_haz:4.8, trans_waz:3.7, trans_whz:16.9, blanket_wt:39.7, blanket_ht:27.8 },
  Rayagada: { bl_wasting:44.5, bl_stunting:71.2, bl_uw:77.6, copy_wt:21.1, copy_ht:51.3, copy_both:13.2, inc_ht:4.7, inc_wt:10.2, inc_both:1.1, trans_haz:15.4, trans_waz:17.4, trans_whz:39.5, blanket_wt:48.6, blanket_ht:24.4 },
  Sambalpur: { bl_wasting:51.9, bl_stunting:79.6, bl_uw:85.4, copy_wt:15.3, copy_ht:35.5, copy_both:7.7, inc_ht:4.6, inc_wt:9.8, inc_both:0.7, trans_haz:14.2, trans_waz:5.5, trans_whz:29.3, blanket_wt:37.7, blanket_ht:22.8 },
  Subarnapur: { bl_wasting:44.9, bl_stunting:77.2, bl_uw:83.8, copy_wt:16.1, copy_ht:49.4, copy_both:9.0, inc_ht:3.9, inc_wt:8.4, inc_both:0.6, trans_haz:17.7, trans_waz:10.5, trans_whz:36.8, blanket_wt:40.6, blanket_ht:26.6 },
  Sundargarh: { bl_wasting:55.2, bl_stunting:76.4, bl_uw:86.6, copy_wt:19.2, copy_ht:41.4, copy_both:9.5, inc_ht:5.8, inc_wt:11.0, inc_both:1.1, trans_haz:7.4, trans_waz:4.1, trans_whz:25.6, blanket_wt:36.9, blanket_ht:25.6 },
};

// ── Project-level PT outcomes (Feb–Jul 2026) ────────────────────────────────
// Source: OD POSHAN CSVs · 2,028 files · computed per project per month
export const ptProjectData: Record<string, Record<string, Partial<Record<PTMonth, { n: number; wasting: number; stunting: number; uw: number; sam: number }>>>> = {
  'Angul': {
    'Angul': { Feb: { n:13030, wasting:2.4, stunting:18.08, uw:8.34, sam:0.5 }, Mar: { n:12937, wasting:2.2, stunting:12.89, uw:6.66, sam:0.4 }, Apr: { n:12759, wasting:2.7, stunting:14.84, uw:8.17, sam:0.6 }, May: { n:12616, wasting:2.6, stunting:13.86, uw:7.49, sam:0.6 }, Jun: { n:12008, wasting:2.4, stunting:13.2, uw:7.57, sam:0.6 }, Jul: { n:11039, wasting:2.7, stunting:10.21, uw:8.76, sam:0.4 } },
    'Athamallik': { Feb: { n:8574, wasting:2.8, stunting:38.59, uw:11.38, sam:0.7 }, Mar: { n:8606, wasting:2.9, stunting:30.51, uw:9.64, sam:0.7 }, Apr: { n:8457, wasting:2.5, stunting:31.48, uw:10.12, sam:0.7 }, May: { n:8426, wasting:3.0, stunting:24.0, uw:7.33, sam:0.8 }, Jun: { n:8373, wasting:3.0, stunting:18.5, uw:6.2, sam:0.8 }, Jul: { n:8177, wasting:1.5, stunting:12.44, uw:5.09, sam:0.3 } },
    'Banarapal': { Feb: { n:12971, wasting:1.8, stunting:17.15, uw:5.22, sam:0.4 }, Mar: { n:12903, wasting:1.7, stunting:13.11, uw:4.08, sam:0.3 }, Apr: { n:12775, wasting:1.7, stunting:9.04, uw:3.58, sam:0.4 }, May: { n:12619, wasting:1.5, stunting:8.19, uw:3.22, sam:0.4 }, Jun: { n:12192, wasting:1.2, stunting:8.37, uw:3.46, sam:0.3 }, Jul: { n:11823, wasting:0.7, stunting:7.5, uw:4.69, sam:0.2 } },
    'Chhendipada': { Feb: { n:10471, wasting:3.0, stunting:20.1, uw:7.12, sam:0.8 }, Mar: { n:10425, wasting:2.4, stunting:9.83, uw:4.02, sam:0.5 }, Apr: { n:10289, wasting:2.2, stunting:10.41, uw:4.41, sam:0.5 }, May: { n:10228, wasting:1.5, stunting:8.79, uw:3.51, sam:0.4 }, Jun: { n:9906, wasting:1.1, stunting:10.03, uw:3.42, sam:0.3 }, Jul: { n:9572, wasting:1.1, stunting:8.13, uw:3.53, sam:0.2 } },
    'Kaniha': { Feb: { n:8154, wasting:2.7, stunting:17.48, uw:6.23, sam:0.8 }, Mar: { n:8074, wasting:2.2, stunting:11.98, uw:4.5, sam:0.5 }, Apr: { n:7987, wasting:2.1, stunting:13.06, uw:5.11, sam:0.4 }, May: { n:7906, wasting:1.9, stunting:12.29, uw:4.45, sam:0.4 }, Jun: { n:7582, wasting:3.2, stunting:12.98, uw:5.83, sam:0.7 }, Jul: { n:7211, wasting:3.8, stunting:11.7, uw:8.72, sam:0.6 } },
    'Kishorenagar': { Feb: { n:7500, wasting:1.5, stunting:17.64, uw:6.63, sam:0.3 }, Mar: { n:7475, wasting:1.0, stunting:8.07, uw:3.83, sam:0.3 }, Apr: { n:7415, wasting:0.9, stunting:9.94, uw:4.44, sam:0.2 }, May: { n:7374, wasting:0.6, stunting:9.67, uw:4.19, sam:0.2 }, Jun: { n:6991, wasting:1.0, stunting:10.03, uw:4.45, sam:0.3 }, Jul: { n:6760, wasting:1.3, stunting:16.98, uw:10.52, sam:0.3 } },
    'Pallahara': { Feb: { n:8693, wasting:2.1, stunting:27.11, uw:8.33, sam:0.2 }, Mar: { n:8803, wasting:2.1, stunting:17.77, uw:6.16, sam:0.4 }, Apr: { n:8631, wasting:2.2, stunting:21.05, uw:7.65, sam:0.6 }, May: { n:8552, wasting:1.9, stunting:20.07, uw:6.76, sam:0.1 }, Jun: { n:8536, wasting:0.9, stunting:16.6, uw:5.76, sam:0.1 }, Jul: { n:8377, wasting:0.5, stunting:11.71, uw:4.67, sam:0.1 } },
    'Talcher': { Feb: { n:9516, wasting:1.2, stunting:16.5, uw:5.55, sam:0.2 }, Mar: { n:9468, wasting:1.3, stunting:12.89, uw:5.07, sam:0.2 }, Apr: { n:9383, wasting:1.2, stunting:10.75, uw:4.26, sam:0.2 }, May: { n:9323, wasting:1.0, stunting:11.35, uw:4.28, sam:0.3 }, Jun: { n:8780, wasting:1.3, stunting:11.88, uw:4.72, sam:0.3 }, Jul: { n:8052, wasting:1.6, stunting:8.79, uw:5.97, sam:0.3 } },
  },
  'Balangir': {
    'Agalpur': { Feb: { n:5126, wasting:2.2, stunting:37.92, uw:19.92, sam:0.2 }, Mar: { n:5121, wasting:2.2, stunting:17.03, uw:12.46, sam:0.2 }, Apr: { n:5051, wasting:1.9, stunting:10.75, uw:7.48, sam:0.1 }, May: { n:5081, wasting:1.1, stunting:8.88, uw:5.59, sam:0.1 }, Jun: { n:5122, wasting:1.4, stunting:11.62, uw:6.72, sam:0.1 }, Jul: { n:5182, wasting:0.6, stunting:8.66, uw:4.71, sam:0.1 } },
    'Bangomunda': { Feb: { n:8953, wasting:1.5, stunting:19.28, uw:7.64, sam:0.1 }, Mar: { n:8873, wasting:1.0, stunting:16.42, uw:7.02, sam:0.1 }, Apr: { n:8893, wasting:1.0, stunting:14.8, uw:6.25, sam:0.1 }, May: { n:8794, wasting:1.0, stunting:10.27, uw:4.82, sam:0.1 }, Jun: { n:8776, wasting:1.0, stunting:11.34, uw:5.34, sam:0.1 }, Jul: { n:8853, wasting:1.4, stunting:12.08, uw:7.35, sam:0.1 } },
    'Belpara': { Feb: { n:9139, wasting:2.3, stunting:28.66, uw:14.86, sam:0.2 }, Mar: { n:9057, wasting:0.7, stunting:7.62, uw:5.92, sam:0.1 }, Apr: { n:9030, wasting:1.2, stunting:6.95, uw:4.42, sam:0.1 }, May: { n:8938, wasting:0.9, stunting:6.46, uw:3.12, sam:0.1 }, Jun: { n:9061, wasting:1.1, stunting:9.79, uw:4.57, sam:0.1 }, Jul: { n:9303, wasting:0.8, stunting:7.94, uw:3.97, sam:0.1 } },
    'Bolangir': { Feb: { n:11545, wasting:2.4, stunting:24.7, uw:9.22, sam:0.4 }, Mar: { n:11436, wasting:1.3, stunting:12.35, uw:6.47, sam:0.3 }, Apr: { n:11328, wasting:1.2, stunting:8.99, uw:5.19, sam:0.2 }, May: { n:11212, wasting:1.3, stunting:7.84, uw:4.08, sam:0.3 }, Jun: { n:11194, wasting:1.4, stunting:11.15, uw:4.82, sam:0.3 }, Jul: { n:11236, wasting:1.9, stunting:13.8, uw:6.25, sam:0.4 } },
    'Deogaon': { Feb: { n:5659, wasting:2.7, stunting:37.62, uw:16.13, sam:0.2 }, Mar: { n:5594, wasting:2.7, stunting:20.24, uw:10.6, sam:0.2 }, Apr: { n:5392, wasting:2.8, stunting:16.38, uw:9.85, sam:0.3 }, May: { n:5282, wasting:2.2, stunting:13.71, uw:8.44, sam:0.3 }, Jun: { n:5296, wasting:2.6, stunting:15.96, uw:9.03, sam:0.4 }, Jul: { n:5377, wasting:2.9, stunting:16.68, uw:9.65, sam:0.5 } },
    'Gudvela': { Feb: { n:3633, wasting:3.6, stunting:37.32, uw:14.42, sam:0.5 }, Mar: { n:3621, wasting:2.2, stunting:25.77, uw:11.24, sam:0.6 }, Apr: { n:3591, wasting:2.4, stunting:27.85, uw:11.36, sam:0.4 }, May: { n:3588, wasting:2.5, stunting:18.67, uw:8.89, sam:0.5 }, Jun: { n:3564, wasting:1.9, stunting:18.6, uw:7.91, sam:0.4 }, Jul: { n:3576, wasting:1.7, stunting:19.18, uw:8.0, sam:0.3 } },
    'Khaprakhol': { Feb: { n:6982, wasting:2.0, stunting:47.15, uw:25.15, sam:0.2 }, Mar: { n:6911, wasting:2.0, stunting:27.58, uw:17.32, sam:0.3 }, Apr: { n:6831, wasting:1.9, stunting:24.15, uw:15.44, sam:0.2 }, May: { n:6786, wasting:2.0, stunting:18.7, uw:13.04, sam:0.2 }, Jun: { n:7072, wasting:1.9, stunting:21.95, uw:14.07, sam:0.3 }, Jul: { n:7340, wasting:2.0, stunting:22.07, uw:14.75, sam:0.3 } },
    'Loisingha': { Feb: { n:5081, wasting:2.7, stunting:26.47, uw:12.1, sam:0.4 }, Mar: { n:5015, wasting:2.2, stunting:21.26, uw:10.57, sam:0.3 }, Apr: { n:4897, wasting:2.3, stunting:19.07, uw:10.56, sam:0.5 }, May: { n:4911, wasting:1.9, stunting:16.55, uw:8.17, sam:0.4 }, Jun: { n:4916, wasting:1.9, stunting:19.26, uw:9.17, sam:0.4 }, Jul: { n:4908, wasting:2.4, stunting:20.93, uw:10.62, sam:0.3 } },
    'Muribahal': { Feb: { n:8175, wasting:2.4, stunting:34.79, uw:15.65, sam:0.3 }, Mar: { n:8087, wasting:1.9, stunting:13.34, uw:6.15, sam:0.3 }, Apr: { n:8003, wasting:1.6, stunting:12.8, uw:4.91, sam:0.2 }, May: { n:8064, wasting:1.5, stunting:10.97, uw:4.34, sam:0.3 }, Jun: { n:8122, wasting:1.6, stunting:14.09, uw:5.68, sam:0.3 }, Jul: { n:8271, wasting:1.8, stunting:15.89, uw:6.64, sam:0.4 } },
    'Patnagarh': { Feb: { n:10298, wasting:3.6, stunting:41.33, uw:21.69, sam:0.5 }, Mar: { n:10153, wasting:2.7, stunting:25.48, uw:12.94, sam:0.3 }, Apr: { n:9876, wasting:2.9, stunting:22.65, uw:11.37, sam:0.4 }, May: { n:9810, wasting:2.2, stunting:9.31, uw:6.51, sam:0.3 }, Jun: { n:9761, wasting:2.0, stunting:16.06, uw:7.57, sam:0.1 }, Jul: { n:9936, wasting:2.0, stunting:17.79, uw:8.62, sam:0.1 } },
    'Puintala': { Feb: { n:6414, wasting:2.9, stunting:41.6, uw:23.59, sam:0.2 }, Mar: { n:6321, wasting:3.2, stunting:32.68, uw:19.76, sam:0.3 }, Apr: { n:6232, wasting:2.7, stunting:29.94, uw:18.41, sam:0.2 }, May: { n:6192, wasting:2.4, stunting:22.67, uw:14.49, sam:0.2 }, Jun: { n:6191, wasting:2.2, stunting:23.66, uw:13.26, sam:0.4 }, Jul: { n:6240, wasting:2.8, stunting:23.73, uw:15.3, sam:0.3 } },
    'Saintala': { Feb: { n:6661, wasting:4.1, stunting:46.93, uw:22.76, sam:0.4 }, Mar: { n:6620, wasting:3.4, stunting:21.75, uw:11.63, sam:0.3 }, Apr: { n:6636, wasting:3.3, stunting:23.13, uw:12.1, sam:0.3 }, May: { n:6605, wasting:2.3, stunting:6.81, uw:6.89, sam:0.1 }, Jun: { n:6500, wasting:2.5, stunting:14.48, uw:8.11, sam:0.1 }, Jul: { n:6716, wasting:3.3, stunting:22.92, uw:11.79, sam:0.0 } },
    'Titilagarh': { Feb: { n:9069, wasting:1.1, stunting:24.3, uw:9.2, sam:0.1 }, Mar: { n:8968, wasting:0.7, stunting:6.31, uw:3.82, sam:0.2 }, Apr: { n:8939, wasting:0.5, stunting:4.92, uw:2.3, sam:0.0 }, May: { n:8814, wasting:0.5, stunting:7.26, uw:2.6, sam:0.0 }, Jun: { n:8317, wasting:0.6, stunting:10.47, uw:3.97, sam:0.1 }, Jul: { n:8703, wasting:2.2, stunting:14.0, uw:6.97, sam:0.4 } },
    'Turekela': { Feb: { n:9236, wasting:1.4, stunting:23.04, uw:10.15, sam:0.1 }, Mar: { n:9148, wasting:1.2, stunting:19.24, uw:8.62, sam:0.1 }, Apr: { n:9044, wasting:1.4, stunting:15.47, uw:8.61, sam:0.1 }, May: { n:9002, wasting:1.4, stunting:7.18, uw:4.77, sam:0.1 }, Jun: { n:9134, wasting:1.4, stunting:9.91, uw:4.82, sam:0.1 }, Jul: { n:9362, wasting:1.5, stunting:11.49, uw:5.93, sam:0.1 } },
  },
  'Balasore': {
    'Bahanaga': { Feb: { n:7588, wasting:3.6, stunting:30.15, uw:11.86, sam:0.6 }, Mar: { n:7559, wasting:3.7, stunting:25.15, uw:10.27, sam:0.7 }, Apr: { n:7388, wasting:3.3, stunting:22.77, uw:9.37, sam:0.6 }, May: { n:7368, wasting:3.2, stunting:23.36, uw:9.76, sam:0.6 }, Jun: { n:7340, wasting:3.9, stunting:18.5, uw:9.05, sam:0.8 }, Jul: { n:7327, wasting:3.8, stunting:16.83, uw:9.51, sam:0.9 } },
    'Balasore_Municipality': { Feb: { n:6421, wasting:2.5, stunting:20.57, uw:6.95, sam:0.5 }, Mar: { n:6369, wasting:2.6, stunting:15.78, uw:5.32, sam:0.5 }, Apr: { n:6353, wasting:2.6, stunting:14.25, uw:5.51, sam:0.5 }, May: { n:6201, wasting:1.6, stunting:13.51, uw:4.71, sam:0.3 }, Jun: { n:5771, wasting:3.1, stunting:10.95, uw:5.87, sam:0.6 }, Jul: { n:5564, wasting:1.1, stunting:10.69, uw:6.04, sam:0.2 } },
    'Balasore_Sadar_I': { Feb: { n:8317, wasting:4.3, stunting:39.92, uw:15.22, sam:1.0 }, Mar: { n:8364, wasting:4.9, stunting:33.52, uw:13.86, sam:1.0 }, Apr: { n:8247, wasting:4.9, stunting:24.42, uw:11.62, sam:0.9 }, May: { n:8045, wasting:2.5, stunting:16.07, uw:7.33, sam:0.6 }, Jun: { n:8079, wasting:2.0, stunting:7.8, uw:4.36, sam:0.5 }, Jul: { n:8078, wasting:2.4, stunting:10.37, uw:6.66, sam:0.5 } },
    'Balasore_Sadar_II': { Feb: { n:7973, wasting:5.3, stunting:32.18, uw:14.66, sam:1.1 }, Mar: { n:7935, wasting:6.4, stunting:23.35, uw:13.16, sam:1.5 }, Apr: { n:7914, wasting:6.9, stunting:21.87, uw:13.0, sam:1.5 }, May: { n:7865, wasting:6.1, stunting:23.71, uw:13.05, sam:1.1 }, Jun: { n:7771, wasting:5.1, stunting:19.71, uw:12.03, sam:1.0 }, Jul: { n:7696, wasting:6.2, stunting:20.32, uw:16.11, sam:1.1 } },
    'Baliapal': { Feb: { n:12202, wasting:3.9, stunting:32.61, uw:14.61, sam:0.8 }, Mar: { n:12272, wasting:4.0, stunting:30.12, uw:13.35, sam:0.7 }, Apr: { n:12129, wasting:3.5, stunting:27.37, uw:12.78, sam:0.6 }, May: { n:11941, wasting:2.9, stunting:26.61, uw:11.58, sam:0.6 }, Jun: { n:11785, wasting:3.5, stunting:26.61, uw:13.13, sam:0.6 }, Jul: { n:11611, wasting:3.4, stunting:24.17, uw:13.24, sam:0.5 } },
    'Basta': { Feb: { n:12379, wasting:2.6, stunting:21.85, uw:9.94, sam:0.5 }, Mar: { n:12178, wasting:2.3, stunting:11.78, uw:6.05, sam:0.5 }, Apr: { n:12138, wasting:2.4, stunting:11.82, uw:6.21, sam:0.5 }, May: { n:11875, wasting:2.3, stunting:12.03, uw:6.14, sam:0.4 }, Jun: { n:12004, wasting:2.9, stunting:12.88, uw:6.58, sam:0.6 }, Jul: { n:11964, wasting:8.7, stunting:19.07, uw:16.48, sam:1.7 } },
    'Bhograi': { Feb: { n:10119, wasting:4.5, stunting:30.5, uw:13.2, sam:0.9 }, Mar: { n:10063, wasting:5.0, stunting:22.04, uw:11.72, sam:0.9 }, Apr: { n:9751, wasting:5.1, stunting:23.04, uw:11.99, sam:0.9 }, May: { n:9741, wasting:5.0, stunting:22.66, uw:11.47, sam:0.9 }, Jun: { n:9683, wasting:4.7, stunting:21.38, uw:10.95, sam:0.9 }, Jul: { n:9638, wasting:4.1, stunting:18.96, uw:10.55, sam:0.6 } },
    'Bhograi_Ii': { Feb: { n:5122, wasting:2.6, stunting:18.06, uw:5.68, sam:0.6 }, Mar: { n:5116, wasting:1.4, stunting:13.92, uw:4.32, sam:0.4 }, Apr: { n:4961, wasting:1.4, stunting:14.39, uw:4.7, sam:0.3 }, May: { n:4904, wasting:1.5, stunting:12.83, uw:4.16, sam:0.3 }, Jun: { n:4918, wasting:2.0, stunting:13.34, uw:4.62, sam:0.6 }, Jul: { n:4883, wasting:1.9, stunting:10.22, uw:5.08, sam:0.3 } },
    'Jaleswar': { Feb: { n:13203, wasting:3.9, stunting:39.2, uw:15.1, sam:1.1 }, Mar: { n:13110, wasting:3.6, stunting:35.05, uw:13.14, sam:1.0 }, Apr: { n:12967, wasting:3.3, stunting:31.57, uw:12.52, sam:0.8 }, May: { n:12691, wasting:3.4, stunting:30.09, uw:12.07, sam:0.8 }, Jun: { n:12505, wasting:3.6, stunting:28.24, uw:11.61, sam:0.8 }, Jul: { n:12589, wasting:5.6, stunting:27.19, uw:14.37, sam:1.2 } },
    'Khaira': { Feb: { n:10206, wasting:4.5, stunting:31.46, uw:11.75, sam:0.9 }, Mar: { n:10048, wasting:5.0, stunting:22.79, uw:9.88, sam:0.9 }, Apr: { n:9760, wasting:4.8, stunting:22.7, uw:9.56, sam:1.0 }, May: { n:9729, wasting:4.2, stunting:22.21, uw:8.99, sam:0.8 }, Jun: { n:9754, wasting:3.4, stunting:21.28, uw:9.22, sam:0.6 }, Jul: { n:9671, wasting:5.8, stunting:21.55, uw:12.21, sam:1.1 } },
    'Nilagiri': { Feb: { n:8981, wasting:6.5, stunting:29.79, uw:14.27, sam:1.6 }, Mar: { n:8819, wasting:5.8, stunting:22.09, uw:10.93, sam:1.3 }, Apr: { n:8776, wasting:6.0, stunting:19.18, uw:10.64, sam:1.5 }, May: { n:8779, wasting:5.5, stunting:18.99, uw:10.0, sam:1.3 }, Jun: { n:8743, wasting:5.5, stunting:19.07, uw:10.32, sam:1.2 }, Jul: { n:8727, wasting:6.0, stunting:14.51, uw:11.0, sam:1.1 } },
    'Oupada': { Feb: { n:5057, wasting:4.6, stunting:32.55, uw:15.25, sam:1.1 }, Mar: { n:5031, wasting:4.4, stunting:27.09, uw:14.57, sam:0.9 }, Apr: { n:4892, wasting:5.5, stunting:27.9, uw:15.66, sam:1.2 }, May: { n:4837, wasting:4.6, stunting:26.83, uw:14.76, sam:1.0 }, Jun: { n:4734, wasting:4.9, stunting:19.73, uw:11.83, sam:1.0 }, Jul: { n:4668, wasting:2.2, stunting:17.52, uw:10.26, sam:0.3 } },
    'Remuna': { Feb: { n:13507, wasting:5.2, stunting:29.53, uw:13.35, sam:1.0 }, Mar: { n:13469, wasting:4.4, stunting:23.27, uw:10.44, sam:0.8 }, Apr: { n:13309, wasting:4.4, stunting:16.93, uw:8.51, sam:0.8 }, May: { n:13114, wasting:3.6, stunting:16.43, uw:7.87, sam:0.6 }, Jun: { n:13215, wasting:3.5, stunting:9.78, uw:6.19, sam:0.7 }, Jul: { n:13131, wasting:3.4, stunting:8.8, uw:5.89, sam:0.8 } },
    'Simulia': { Feb: { n:7251, wasting:2.4, stunting:17.93, uw:6.81, sam:0.6 }, Mar: { n:7171, wasting:2.3, stunting:8.73, uw:4.53, sam:0.7 }, Apr: { n:6906, wasting:2.0, stunting:9.67, uw:4.16, sam:0.6 }, May: { n:6880, wasting:1.7, stunting:10.13, uw:4.2, sam:0.5 }, Jun: { n:6883, wasting:2.3, stunting:10.61, uw:5.23, sam:0.7 }, Jul: { n:6817, wasting:2.2, stunting:11.57, uw:7.1, sam:0.5 } },
    'Soro': { Feb: { n:9754, wasting:2.2, stunting:23.99, uw:7.6, sam:0.6 }, Mar: { n:9448, wasting:1.9, stunting:19.45, uw:6.04, sam:0.4 }, Apr: { n:9203, wasting:0.5, stunting:17.29, uw:4.77, sam:0.3 }, May: { n:9101, wasting:0.9, stunting:18.04, uw:5.01, sam:0.3 }, Jun: { n:9300, wasting:1.4, stunting:16.85, uw:5.04, sam:0.5 }, Jul: { n:9411, wasting:1.0, stunting:7.23, uw:3.37, sam:0.4 } },
  },
  'Bargarh': {
    'AMBABHONA': { Feb: { n:3232, wasting:3.0, stunting:13.74, uw:7.43, sam:0.8 }, Mar: { n:3218, wasting:2.9, stunting:16.53, uw:8.39, sam:0.8 }, Apr: { n:3206, wasting:2.9, stunting:18.93, uw:8.61, sam:0.7 }, May: { n:3175, wasting:2.6, stunting:20.22, uw:9.32, sam:0.6 }, Jun: { n:3151, wasting:2.2, stunting:19.01, uw:8.09, sam:0.4 }, Jul: { n:3166, wasting:7.5, stunting:22.2, uw:16.84, sam:1.6 } },
    'ATTABIRA': { Feb: { n:7718, wasting:2.2, stunting:15.21, uw:8.19, sam:0.5 }, Mar: { n:7691, wasting:1.7, stunting:12.48, uw:7.02, sam:0.5 }, Apr: { n:7550, wasting:2.0, stunting:13.75, uw:7.77, sam:0.5 }, May: { n:7661, wasting:1.2, stunting:11.3, uw:6.33, sam:0.3 }, Jun: { n:7614, wasting:1.7, stunting:13.87, uw:7.53, sam:0.5 }, Jul: { n:7637, wasting:1.4, stunting:17.49, uw:11.86, sam:0.5 } },
    'BARGARH_RURAL': { Feb: { n:8082, wasting:2.9, stunting:18.93, uw:8.55, sam:0.6 }, Mar: { n:8073, wasting:2.4, stunting:20.74, uw:9.45, sam:0.5 }, Apr: { n:8022, wasting:2.4, stunting:22.39, uw:9.81, sam:0.6 }, May: { n:8098, wasting:2.1, stunting:21.02, uw:8.34, sam:0.6 }, Jun: { n:8027, wasting:1.8, stunting:20.12, uw:8.31, sam:0.4 }, Jul: { n:8019, wasting:2.0, stunting:19.2, uw:8.22, sam:0.4 } },
    'BARGARH_URBAN': { Feb: { n:5135, wasting:1.4, stunting:7.95, uw:2.63, sam:0.3 }, Mar: { n:5103, wasting:0.9, stunting:8.01, uw:2.53, sam:0.3 }, Apr: { n:5116, wasting:1.1, stunting:7.17, uw:2.56, sam:0.2 }, May: { n:5143, wasting:1.1, stunting:7.0, uw:2.24, sam:0.3 }, Jun: { n:5114, wasting:0.9, stunting:6.41, uw:2.07, sam:0.4 }, Jul: { n:5120, wasting:1.1, stunting:5.31, uw:2.13, sam:0.3 } },
    'BARPALI': { Feb: { n:6883, wasting:2.4, stunting:21.62, uw:10.58, sam:0.6 }, Mar: { n:6848, wasting:2.2, stunting:21.57, uw:10.19, sam:0.6 }, Apr: { n:6317, wasting:1.1, stunting:17.87, uw:8.18, sam:0.3 }, May: { n:6422, wasting:1.6, stunting:15.52, uw:7.18, sam:0.3 }, Jun: { n:6525, wasting:2.3, stunting:17.21, uw:8.77, sam:0.6 }, Jul: { n:6608, wasting:2.1, stunting:20.78, uw:13.48, sam:0.4 } },
    'BHATLI': { Feb: { n:5055, wasting:1.3, stunting:19.82, uw:7.4, sam:0.4 }, Mar: { n:5016, wasting:1.8, stunting:21.45, uw:7.87, sam:0.7 }, Apr: { n:4965, wasting:2.8, stunting:18.89, uw:8.06, sam:1.1 }, May: { n:4927, wasting:1.2, stunting:16.05, uw:6.07, sam:0.3 }, Jun: { n:4943, wasting:1.6, stunting:17.24, uw:6.23, sam:0.4 }, Jul: { n:4938, wasting:2.3, stunting:21.1, uw:8.75, sam:0.6 } },
    'BHEDEN': { Feb: { n:6703, wasting:2.4, stunting:21.95, uw:11.07, sam:0.4 }, Mar: { n:6702, wasting:2.0, stunting:18.74, uw:9.67, sam:0.4 }, Apr: { n:6636, wasting:2.0, stunting:19.32, uw:9.7, sam:0.4 }, May: { n:6583, wasting:1.5, stunting:17.01, uw:8.22, sam:0.2 }, Jun: { n:6628, wasting:1.4, stunting:16.26, uw:7.77, sam:0.3 }, Jul: { n:6629, wasting:1.6, stunting:17.02, uw:9.07, sam:0.3 } },
    'BIJEPUR': { Feb: { n:6212, wasting:1.6, stunting:10.54, uw:3.07, sam:0.5 }, Mar: { n:6211, wasting:1.1, stunting:9.1, uw:2.67, sam:0.3 }, Apr: { n:6149, wasting:1.2, stunting:8.34, uw:2.6, sam:0.2 }, May: { n:6140, wasting:1.0, stunting:7.65, uw:2.25, sam:0.2 }, Jun: { n:6025, wasting:1.0, stunting:7.0, uw:2.34, sam:0.3 }, Jul: { n:6017, wasting:4.6, stunting:10.82, uw:7.84, sam:1.0 } },
    'GAISILET': { Feb: { n:5221, wasting:0.9, stunting:16.7, uw:8.75, sam:0.3 }, Mar: { n:5229, wasting:0.9, stunting:13.25, uw:6.92, sam:0.3 }, Apr: { n:5169, wasting:0.7, stunting:9.07, uw:4.78, sam:0.2 }, May: { n:5176, wasting:0.6, stunting:7.42, uw:3.11, sam:0.3 }, Jun: { n:5139, wasting:1.7, stunting:11.07, uw:6.01, sam:0.4 }, Jul: { n:4901, wasting:0.8, stunting:16.08, uw:12.02, sam:0.3 } },
    'JHARBANDH': { Feb: { n:5521, wasting:2.3, stunting:10.78, uw:5.2, sam:0.6 }, Mar: { n:5498, wasting:2.4, stunting:12.19, uw:5.2, sam:0.8 }, Apr: { n:5217, wasting:2.7, stunting:13.13, uw:5.64, sam:0.9 }, May: { n:5395, wasting:1.9, stunting:12.25, uw:4.32, sam:0.7 }, Jun: { n:5448, wasting:2.1, stunting:12.78, uw:4.5, sam:0.4 }, Jul: { n:5580, wasting:2.2, stunting:14.12, uw:6.06, sam:0.8 } },
    'PADAMPUR': { Feb: { n:8068, wasting:1.2, stunting:12.77, uw:4.39, sam:0.5 }, Mar: { n:8058, wasting:1.4, stunting:14.35, uw:4.84, sam:0.4 }, Apr: { n:7937, wasting:1.1, stunting:14.34, uw:5.44, sam:0.4 }, May: { n:7761, wasting:0.9, stunting:5.45, uw:2.77, sam:0.4 }, Jun: { n:7677, wasting:0.5, stunting:2.64, uw:1.51, sam:0.2 }, Jul: { n:7532, wasting:0.7, stunting:1.47, uw:1.08, sam:0.2 } },
    'PAIKMAL': { Feb: { n:7937, wasting:0.8, stunting:9.6, uw:3.24, sam:0.2 }, Mar: { n:7919, wasting:1.0, stunting:8.21, uw:3.09, sam:0.2 }, Apr: { n:7804, wasting:0.8, stunting:10.24, uw:3.95, sam:0.2 }, May: { n:7593, wasting:0.7, stunting:7.84, uw:3.02, sam:0.1 }, Jun: { n:7633, wasting:0.9, stunting:7.95, uw:2.9, sam:0.3 }, Jul: { n:7679, wasting:1.1, stunting:10.2, uw:5.35, sam:0.3 } },
    'SOHELA': { Feb: { n:7441, wasting:1.3, stunting:12.34, uw:6.63, sam:0.3 }, Mar: { n:7446, wasting:1.4, stunting:12.03, uw:6.98, sam:0.2 }, Apr: { n:7295, wasting:1.4, stunting:12.6, uw:6.91, sam:0.3 }, May: { n:7202, wasting:1.4, stunting:12.93, uw:6.72, sam:0.3 }, Jun: { n:7152, wasting:1.4, stunting:10.96, uw:6.04, sam:0.3 }, Jul: { n:7184, wasting:4.5, stunting:14.16, uw:11.41, sam:0.8 } },
  },
  'Bhadrak': {
    'Basudevpur': { Feb: { n:16112, wasting:2.3, stunting:13.04, uw:5.16, sam:0.6 }, Mar: { n:16093, wasting:2.0, stunting:11.85, uw:4.69, sam:0.4 }, Apr: { n:15994, wasting:2.2, stunting:12.89, uw:5.17, sam:0.5 }, May: { n:15925, wasting:2.0, stunting:12.38, uw:4.95, sam:0.4 }, Jun: { n:15871, wasting:2.1, stunting:13.69, uw:5.14, sam:0.4 }, Jul: { n:15776, wasting:1.8, stunting:12.41, uw:5.08, sam:0.3 } },
    'Bhadrak': { Feb: { n:20630, wasting:1.9, stunting:18.98, uw:6.17, sam:0.5 }, Mar: { n:20584, wasting:1.4, stunting:18.05, uw:5.83, sam:0.4 }, Apr: { n:20318, wasting:2.5, stunting:16.24, uw:6.11, sam:0.9 }, May: { n:19947, wasting:1.7, stunting:15.85, uw:5.44, sam:0.4 }, Jun: { n:19780, wasting:1.3, stunting:17.25, uw:5.8, sam:0.3 }, Jul: { n:19755, wasting:1.8, stunting:18.75, uw:6.92, sam:0.4 } },
    'Bhandaripokhari': { Feb: { n:7675, wasting:3.6, stunting:24.08, uw:9.25, sam:0.9 }, Mar: { n:7598, wasting:2.9, stunting:12.56, uw:5.96, sam:0.6 }, Apr: { n:7528, wasting:2.8, stunting:12.09, uw:5.46, sam:0.6 }, May: { n:7481, wasting:2.6, stunting:11.4, uw:5.03, sam:0.5 }, Jun: { n:7464, wasting:2.8, stunting:13.84, uw:5.67, sam:0.5 }, Jul: { n:7498, wasting:3.1, stunting:13.74, uw:6.52, sam:0.5 } },
    'Bonth': { Feb: { n:8426, wasting:2.8, stunting:12.63, uw:5.16, sam:0.6 }, Mar: { n:8391, wasting:2.2, stunting:11.39, uw:4.43, sam:0.4 }, Apr: { n:8122, wasting:2.6, stunting:12.32, uw:4.76, sam:0.5 }, May: { n:8098, wasting:2.7, stunting:11.84, uw:4.8, sam:0.4 }, Jun: { n:8081, wasting:2.2, stunting:14.69, uw:6.04, sam:0.3 }, Jul: { n:8102, wasting:3.4, stunting:15.07, uw:8.01, sam:0.6 } },
    'Chandbali-I': { Feb: { n:8311, wasting:2.7, stunting:20.01, uw:7.94, sam:0.7 }, Mar: { n:8301, wasting:2.7, stunting:13.83, uw:6.31, sam:0.7 }, Apr: { n:8216, wasting:3.5, stunting:14.29, uw:6.93, sam:0.8 }, May: { n:8204, wasting:2.7, stunting:14.05, uw:6.44, sam:0.5 }, Jun: { n:8140, wasting:2.7, stunting:15.97, uw:6.78, sam:0.5 }, Jul: { n:8142, wasting:3.3, stunting:14.76, uw:6.93, sam:0.7 } },
    'Chandbali-Ii(R)': { Feb: { n:7619, wasting:2.0, stunting:11.66, uw:4.34, sam:0.7 }, Mar: { n:7585, wasting:1.8, stunting:10.96, uw:3.76, sam:0.5 }, Apr: { n:7371, wasting:2.0, stunting:11.27, uw:4.57, sam:0.5 }, May: { n:7376, wasting:2.3, stunting:11.85, uw:4.6, sam:0.6 }, Jun: { n:7323, wasting:2.9, stunting:12.52, uw:5.6, sam:0.5 }, Jul: { n:7376, wasting:3.6, stunting:11.4, uw:7.42, sam:0.7 } },
    'Dhamnagar': { Feb: { n:12150, wasting:2.5, stunting:16.26, uw:6.07, sam:0.5 }, Mar: { n:12141, wasting:2.1, stunting:8.28, uw:3.48, sam:0.3 }, Apr: { n:11938, wasting:2.1, stunting:10.44, uw:4.45, sam:0.3 }, May: { n:11876, wasting:1.8, stunting:10.61, uw:4.02, sam:0.2 }, Jun: { n:11847, wasting:1.5, stunting:13.72, uw:4.67, sam:0.3 }, Jul: { n:11805, wasting:2.9, stunting:14.56, uw:6.54, sam:0.5 } },
    'Tihidi': { Feb: { n:12041, wasting:4.2, stunting:15.5, uw:6.83, sam:1.1 }, Mar: { n:11909, wasting:4.0, stunting:14.64, uw:6.2, sam:1.0 }, Apr: { n:11681, wasting:4.0, stunting:14.67, uw:6.45, sam:1.0 }, May: { n:11548, wasting:3.9, stunting:14.18, uw:6.0, sam:1.1 }, Jun: { n:11540, wasting:3.3, stunting:15.62, uw:6.42, sam:0.5 }, Jul: { n:11574, wasting:2.7, stunting:15.16, uw:6.45, sam:0.6 } },
  },
  'Boudh': {
    'Boudh': { Feb: { n:10888, wasting:2.4, stunting:27.22, uw:8.87, sam:0.2 }, Mar: { n:10893, wasting:2.4, stunting:23.25, uw:7.64, sam:0.4 }, Apr: { n:10972, wasting:2.5, stunting:22.19, uw:7.56, sam:0.4 }, May: { n:11024, wasting:2.2, stunting:21.65, uw:7.23, sam:0.3 }, Jun: { n:11096, wasting:2.5, stunting:19.0, uw:6.98, sam:0.3 }, Jul: { n:11104, wasting:2.4, stunting:19.16, uw:8.41, sam:0.2 } },
    'Harbhanga': { Feb: { n:8579, wasting:2.6, stunting:21.04, uw:9.9, sam:0.4 }, Mar: { n:8570, wasting:2.4, stunting:19.57, uw:8.72, sam:0.2 }, Apr: { n:8521, wasting:2.5, stunting:19.52, uw:9.02, sam:0.3 }, May: { n:8552, wasting:2.4, stunting:18.1, uw:8.91, sam:0.3 }, Jun: { n:8547, wasting:3.1, stunting:18.29, uw:10.21, sam:0.4 }, Jul: { n:8543, wasting:3.4, stunting:18.32, uw:12.81, sam:0.4 } },
    'Kantamal': { Feb: { n:10233, wasting:3.4, stunting:28.02, uw:10.91, sam:0.4 }, Mar: { n:10174, wasting:3.7, stunting:22.43, uw:9.8, sam:0.4 }, Apr: { n:10135, wasting:3.6, stunting:23.62, uw:10.22, sam:0.3 }, May: { n:10123, wasting:3.6, stunting:22.36, uw:9.63, sam:0.3 }, Jun: { n:10151, wasting:3.4, stunting:20.84, uw:8.92, sam:0.2 }, Jul: { n:10114, wasting:2.1, stunting:20.36, uw:9.31, sam:0.2 } },
  },
  'Cuttack': {
    'Athagada': { Jun: { n:8576, wasting:0.9, stunting:14.35, uw:5.05, sam:0.2 }, Jul: { n:8475, wasting:1.1, stunting:15.73, uw:7.5, sam:0.2 } },
    'Athagarh': { Feb: { n:8777, wasting:1.0, stunting:17.31, uw:6.94, sam:0.2 }, Mar: { n:8446, wasting:0.8, stunting:15.26, uw:5.78, sam:0.1 }, Apr: { n:8358, wasting:0.5, stunting:15.95, uw:5.42, sam:0.2 }, May: { n:8346, wasting:0.6, stunting:15.07, uw:5.2, sam:0.2 } },
    'Badamba': { Feb: { n:7787, wasting:1.3, stunting:12.25, uw:3.75, sam:0.3 }, Mar: { n:7646, wasting:1.3, stunting:12.65, uw:3.68, sam:0.4 }, Apr: { n:7667, wasting:1.3, stunting:13.88, uw:3.99, sam:0.4 }, May: { n:7621, wasting:0.9, stunting:12.29, uw:3.37, sam:0.3 }, Jun: { n:7510, wasting:0.9, stunting:12.45, uw:3.42, sam:0.3 }, Jul: { n:7589, wasting:0.7, stunting:10.69, uw:3.56, sam:0.1 } },
    'Banki': { Feb: { n:5754, wasting:1.7, stunting:16.11, uw:7.7, sam:0.1 }, Mar: { n:5715, wasting:1.6, stunting:16.59, uw:7.19, sam:0.2 }, Apr: { n:5592, wasting:1.9, stunting:15.77, uw:8.05, sam:0.3 }, May: { n:5636, wasting:1.5, stunting:14.6, uw:7.98, sam:0.3 }, Jun: { n:5596, wasting:1.4, stunting:15.9, uw:8.36, sam:0.2 }, Jul: { n:5555, wasting:1.1, stunting:14.94, uw:7.94, sam:0.1 } },
    'Baranga': { Feb: { n:4793, wasting:1.5, stunting:20.68, uw:5.7, sam:0.2 }, Mar: { n:4768, wasting:1.0, stunting:19.88, uw:4.45, sam:0.1 }, Apr: { n:4757, wasting:1.2, stunting:21.42, uw:5.32, sam:0.2 }, May: { n:4757, wasting:0.7, stunting:17.85, uw:3.64, sam:0.0 }, Jun: { n:4762, wasting:1.0, stunting:17.98, uw:3.34, sam:0.1 }, Jul: { n:4746, wasting:0.7, stunting:16.6, uw:4.34, sam:0.1 } },
    'Cuttack_City_-_I': { Feb: { n:9891, wasting:0.4, stunting:8.48, uw:2.11, sam:0.1 }, Mar: { n:9779, wasting:0.5, stunting:8.7, uw:1.9, sam:0.2 }, Apr: { n:9795, wasting:0.5, stunting:9.2, uw:2.16, sam:0.2 }, May: { n:9807, wasting:0.5, stunting:8.36, uw:1.66, sam:0.1 } },
    'Cuttack_City_-_II': { Feb: { n:8998, wasting:0.2, stunting:16.28, uw:3.15, sam:0.0 }, Mar: { n:8822, wasting:0.4, stunting:16.64, uw:3.09, sam:0.1 }, Apr: { n:8649, wasting:0.2, stunting:16.01, uw:3.04, sam:0.1 }, May: { n:8587, wasting:0.5, stunting:16.54, uw:2.77, sam:0.2 } },
    'Cuttack_Sadar': { Feb: { n:7087, wasting:0.8, stunting:17.44, uw:5.28, sam:0.1 }, Mar: { n:7019, wasting:0.8, stunting:17.05, uw:5.03, sam:0.1 }, Apr: { n:6991, wasting:0.6, stunting:15.86, uw:4.86, sam:0.0 }, May: { n:6898, wasting:0.6, stunting:13.86, uw:4.12, sam:0.1 } },
    'Dampada': { Feb: { n:5952, wasting:2.2, stunting:24.28, uw:7.66, sam:0.4 }, Mar: { n:5915, wasting:2.2, stunting:24.53, uw:7.66, sam:0.4 }, Apr: { n:5742, wasting:1.1, stunting:11.56, uw:3.94, sam:0.2 }, May: { n:5734, wasting:0.8, stunting:4.33, uw:2.44, sam:0.2 }, Jun: { n:5733, wasting:0.9, stunting:7.15, uw:2.81, sam:0.1 }, Jul: { n:5671, wasting:0.8, stunting:9.52, uw:3.42, sam:0.1 } },
    'Kantapada': { Feb: { n:3814, wasting:1.5, stunting:18.59, uw:7.79, sam:0.2 }, Mar: { n:3788, wasting:1.5, stunting:17.71, uw:7.47, sam:0.1 }, Apr: { n:3753, wasting:0.7, stunting:14.97, uw:6.21, sam:0.0 }, May: { n:3729, wasting:0.4, stunting:14.27, uw:5.63, sam:0.0 }, Jun: { n:3731, wasting:0.9, stunting:15.22, uw:5.36, sam:0.0 }, Jul: { n:3732, wasting:1.3, stunting:13.16, uw:6.08, sam:0.1 } },
    'Kataka_City_-_I': { Jun: { n:9766, wasting:0.4, stunting:9.35, uw:1.81, sam:0.1 }, Jul: { n:9808, wasting:0.7, stunting:8.69, uw:1.95, sam:0.1 } },
    'Kataka_City_-_II': { Jun: { n:8744, wasting:0.5, stunting:17.84, uw:3.09, sam:0.2 }, Jul: { n:8816, wasting:0.7, stunting:15.54, uw:3.85, sam:0.1 } },
    'Kataka_Sadar': { Jun: { n:6881, wasting:0.5, stunting:14.18, uw:4.72, sam:0.1 }, Jul: { n:6948, wasting:0.6, stunting:13.26, uw:5.37, sam:0.1 } },
    'Mahanga': { Feb: { n:9189, wasting:1.3, stunting:11.48, uw:2.47, sam:0.3 }, Mar: { n:9166, wasting:1.5, stunting:11.55, uw:2.67, sam:0.4 }, Apr: { n:9036, wasting:1.5, stunting:12.12, uw:3.08, sam:0.3 }, May: { n:8939, wasting:1.3, stunting:11.48, uw:2.99, sam:0.3 }, Jun: { n:8934, wasting:1.6, stunting:11.86, uw:2.88, sam:0.4 }, Jul: { n:8897, wasting:0.9, stunting:9.13, uw:1.96, sam:0.2 } },
    'Narasinghpur': { Feb: { n:8254, wasting:1.0, stunting:11.29, uw:3.73, sam:0.1 }, Mar: { n:8270, wasting:1.0, stunting:11.39, uw:3.41, sam:0.2 }, Apr: { n:8070, wasting:1.3, stunting:12.74, uw:3.9, sam:0.2 }, May: { n:7966, wasting:0.9, stunting:11.65, uw:3.54, sam:0.1 }, Jun: { n:8193, wasting:0.7, stunting:11.58, uw:3.59, sam:0.1 }, Jul: { n:8272, wasting:0.9, stunting:11.81, uw:4.29, sam:0.0 } },
    'Niali': { Feb: { n:6552, wasting:2.0, stunting:14.88, uw:4.26, sam:0.4 }, Mar: { n:6542, wasting:2.0, stunting:15.03, uw:4.23, sam:0.5 }, Apr: { n:6462, wasting:2.4, stunting:11.76, uw:3.48, sam:0.5 }, May: { n:6446, wasting:2.2, stunting:11.29, uw:3.35, sam:0.5 }, Jun: { n:6440, wasting:1.8, stunting:11.79, uw:3.31, sam:0.4 }, Jul: { n:6405, wasting:1.7, stunting:10.57, uw:3.59, sam:0.3 } },
    'Nischintakoili': { Feb: { n:9626, wasting:1.5, stunting:12.85, uw:4.72, sam:0.4 }, Mar: { n:9518, wasting:1.6, stunting:12.39, uw:4.18, sam:0.5 }, Apr: { n:9407, wasting:1.9, stunting:8.19, uw:3.67, sam:0.6 }, May: { n:9265, wasting:1.8, stunting:6.38, uw:3.26, sam:0.4 }, Jun: { n:9208, wasting:1.6, stunting:7.12, uw:3.52, sam:0.4 }, Jul: { n:9237, wasting:1.0, stunting:6.95, uw:3.7, sam:0.2 } },
    'Salepur': { Feb: { n:10667, wasting:1.4, stunting:13.09, uw:4.84, sam:0.3 }, Mar: { n:10667, wasting:1.3, stunting:12.54, uw:4.81, sam:0.3 }, Apr: { n:10440, wasting:1.6, stunting:12.11, uw:4.92, sam:0.3 }, May: { n:10327, wasting:1.4, stunting:11.13, uw:4.33, sam:0.4 }, Jun: { n:10304, wasting:1.2, stunting:11.82, uw:4.12, sam:0.2 }, Jul: { n:10352, wasting:0.9, stunting:9.01, uw:4.0, sam:0.1 } },
    'Tangi-Choudwar': { Feb: { n:10811, wasting:1.2, stunting:15.25, uw:5.88, sam:0.2 }, Mar: { n:10730, wasting:1.3, stunting:16.23, uw:5.66, sam:0.3 }, Apr: { n:10490, wasting:0.6, stunting:16.25, uw:5.18, sam:0.2 }, May: { n:10118, wasting:0.8, stunting:14.23, uw:4.84, sam:0.2 }, Jun: { n:10306, wasting:0.5, stunting:15.05, uw:4.64, sam:0.0 }, Jul: { n:10389, wasting:0.5, stunting:15.21, uw:5.31, sam:0.1 } },
    'Tigiria': { Feb: { n:4151, wasting:0.7, stunting:12.79, uw:3.93, sam:0.1 }, Mar: { n:4178, wasting:0.8, stunting:12.54, uw:3.95, sam:0.2 }, Apr: { n:4086, wasting:0.2, stunting:14.73, uw:4.01, sam:0.0 }, May: { n:4093, wasting:0.4, stunting:13.78, uw:3.81, sam:0.0 }, Jun: { n:4091, wasting:0.3, stunting:13.54, uw:3.67, sam:0.0 }, Jul: { n:4055, wasting:0.3, stunting:8.48, uw:2.44, sam:0.0 } },
  },
  'Deogarh': {
    'Barkote': { Feb: { n:6349, wasting:5.8, stunting:28.1, uw:15.78, sam:1.1 }, Mar: { n:6339, wasting:6.3, stunting:29.53, uw:16.61, sam:1.5 }, Apr: { n:6257, wasting:6.6, stunting:27.12, uw:15.58, sam:1.2 }, May: { n:6197, wasting:5.2, stunting:24.8, uw:14.83, sam:0.9 }, Jun: { n:6207, wasting:5.4, stunting:20.83, uw:13.19, sam:1.1 }, Jul: { n:6179, wasting:3.8, stunting:19.29, uw:13.22, sam:0.5 } },
    'Reamal': { Feb: { n:6926, wasting:3.5, stunting:26.26, uw:14.12, sam:0.4 }, Mar: { n:6927, wasting:3.3, stunting:27.0, uw:13.73, sam:0.5 }, Apr: { n:6875, wasting:3.9, stunting:26.53, uw:14.53, sam:0.6 }, May: { n:6827, wasting:3.1, stunting:24.12, uw:12.86, sam:0.4 }, Jun: { n:6750, wasting:2.7, stunting:20.37, uw:11.32, sam:0.3 }, Jul: { n:6679, wasting:2.5, stunting:20.96, uw:12.76, sam:0.2 } },
    'Tileibani': { Feb: { n:6083, wasting:2.2, stunting:27.45, uw:11.52, sam:0.3 }, Mar: { n:6054, wasting:2.2, stunting:28.89, uw:11.91, sam:0.2 }, Apr: { n:5978, wasting:3.4, stunting:29.12, uw:13.73, sam:0.7 }, May: { n:5841, wasting:3.1, stunting:26.98, uw:13.27, sam:0.4 }, Jun: { n:5816, wasting:4.2, stunting:26.5, uw:14.86, sam:0.6 }, Jul: { n:5724, wasting:6.3, stunting:26.08, uw:18.33, sam:0.9 } },
  },
  'Dhenkanal': {
    'Bhubana': { Feb: { n:7546, wasting:1.4, stunting:24.6, uw:7.45, sam:0.4 }, Mar: { n:7550, wasting:1.4, stunting:20.66, uw:6.13, sam:0.4 }, Apr: { n:7384, wasting:1.4, stunting:17.02, uw:5.62, sam:0.4 }, May: { n:7326, wasting:1.1, stunting:17.12, uw:5.19, sam:0.3 }, Jun: { n:7334, wasting:0.7, stunting:13.94, uw:4.4, sam:0.2 }, Jul: { n:7306, wasting:0.1, stunting:10.68, uw:2.94, sam:0.0 } },
    'Dhenkanal': { Feb: { n:10862, wasting:1.3, stunting:24.74, uw:5.97, sam:0.2 }, Mar: { n:10855, wasting:1.2, stunting:24.62, uw:5.7, sam:0.2 }, Apr: { n:10818, wasting:1.4, stunting:21.49, uw:5.17, sam:0.2 }, May: { n:10802, wasting:1.4, stunting:15.95, uw:4.26, sam:0.2 }, Jun: { n:10659, wasting:1.3, stunting:15.77, uw:4.17, sam:0.2 }, Jul: { n:10485, wasting:1.4, stunting:15.22, uw:4.39, sam:0.2 } },
    'Gondia': { Feb: { n:9464, wasting:2.1, stunting:32.45, uw:10.27, sam:0.6 }, Mar: { n:9447, wasting:2.1, stunting:22.49, uw:6.75, sam:0.6 }, Apr: { n:9326, wasting:2.1, stunting:18.7, uw:6.0, sam:0.5 }, May: { n:9299, wasting:2.0, stunting:18.6, uw:6.0, sam:0.4 }, Jun: { n:9176, wasting:0.2, stunting:15.28, uw:3.4, sam:0.0 }, Jul: { n:9275, wasting:0.9, stunting:14.09, uw:4.28, sam:0.2 } },
    'Hindol': { Feb: { n:10771, wasting:3.0, stunting:24.26, uw:6.53, sam:0.8 }, Mar: { n:10806, wasting:3.1, stunting:18.77, uw:5.02, sam:0.6 }, Apr: { n:10638, wasting:3.0, stunting:15.52, uw:4.31, sam:0.7 }, May: { n:10638, wasting:3.1, stunting:16.29, uw:4.55, sam:0.8 }, Jun: { n:10596, wasting:2.9, stunting:17.99, uw:4.49, sam:0.6 }, Jul: { n:10550, wasting:2.5, stunting:15.09, uw:4.18, sam:0.5 } },
    'Kamakshyanagar': { Feb: { n:7389, wasting:2.1, stunting:26.12, uw:4.99, sam:0.6 }, Mar: { n:7408, wasting:1.9, stunting:19.17, uw:4.14, sam:0.6 }, Apr: { n:7175, wasting:2.1, stunting:15.94, uw:3.58, sam:0.7 }, May: { n:7204, wasting:1.7, stunting:16.52, uw:3.51, sam:0.6 }, Jun: { n:7184, wasting:1.2, stunting:12.97, uw:2.51, sam:0.5 }, Jul: { n:7151, wasting:1.3, stunting:12.49, uw:3.02, sam:0.4 } },
    'Kankadahad': { Feb: { n:7389, wasting:0.7, stunting:25.85, uw:6.92, sam:0.1 }, Mar: { n:5507, wasting:1.0, stunting:21.26, uw:5.43, sam:0.3 }, Apr: { n:6528, wasting:2.3, stunting:20.02, uw:6.85, sam:0.7 }, May: { n:6777, wasting:1.2, stunting:21.71, uw:6.58, sam:0.6 }, Jun: { n:6814, wasting:0.2, stunting:21.93, uw:5.43, sam:0.0 }, Jul: { n:6899, wasting:0.5, stunting:23.12, uw:6.99, sam:0.0 } },
    'Odapada': { Feb: { n:7924, wasting:1.7, stunting:27.86, uw:7.61, sam:0.4 }, Mar: { n:7890, wasting:1.6, stunting:27.77, uw:7.22, sam:0.3 }, Apr: { n:7843, wasting:2.3, stunting:24.24, uw:7.19, sam:0.6 }, May: { n:7785, wasting:2.6, stunting:22.71, uw:7.51, sam:0.6 }, Jun: { n:7733, wasting:2.6, stunting:23.83, uw:8.03, sam:0.5 }, Jul: { n:7565, wasting:2.2, stunting:19.56, uw:10.15, sam:0.2 } },
    'Parjang': { Feb: { n:8092, wasting:0.9, stunting:19.92, uw:4.15, sam:0.2 }, Mar: { n:8073, wasting:1.0, stunting:15.57, uw:3.51, sam:0.2 }, Apr: { n:7605, wasting:1.0, stunting:15.4, uw:3.27, sam:0.3 }, May: { n:7571, wasting:0.3, stunting:13.04, uw:2.6, sam:0.1 }, Jun: { n:7567, wasting:0.3, stunting:13.68, uw:2.46, sam:0.1 }, Jul: { n:7519, wasting:0.5, stunting:9.14, uw:2.38, sam:0.1 } },
  },
  'Gajapati': {
    'Gumma': { Feb: { n:5974, wasting:6.5, stunting:36.22, uw:19.75, sam:1.6 }, Mar: { n:5988, wasting:6.2, stunting:26.59, uw:15.5, sam:1.4 }, Apr: { n:5972, wasting:6.6, stunting:27.28, uw:16.28, sam:1.6 }, May: { n:5906, wasting:6.7, stunting:28.45, uw:16.31, sam:1.6 }, Jun: { n:5913, wasting:6.5, stunting:29.02, uw:15.9, sam:1.3 }, Jul: { n:5923, wasting:8.5, stunting:26.0, uw:17.17, sam:1.7 } },
    'Kashinagar': { Feb: { n:3466, wasting:4.2, stunting:25.16, uw:14.34, sam:1.0 }, Mar: { n:3463, wasting:4.2, stunting:17.33, uw:10.94, sam:1.0 }, Apr: { n:3449, wasting:4.0, stunting:19.08, uw:12.15, sam:0.8 }, May: { n:3447, wasting:4.2, stunting:20.19, uw:12.42, sam:1.1 }, Jun: { n:3438, wasting:4.0, stunting:20.42, uw:12.36, sam:0.8 }, Jul: { n:3352, wasting:6.1, stunting:21.36, uw:17.18, sam:0.7 } },
    'Mohana': { Feb: { n:13121, wasting:3.5, stunting:22.34, uw:11.09, sam:0.7 }, Mar: { n:13046, wasting:3.0, stunting:16.46, uw:8.73, sam:0.6 }, Apr: { n:13009, wasting:2.8, stunting:20.22, uw:9.78, sam:0.6 }, May: { n:13017, wasting:2.7, stunting:20.93, uw:9.28, sam:0.6 }, Jun: { n:12942, wasting:2.7, stunting:21.01, uw:9.25, sam:0.5 }, Jul: { n:12695, wasting:8.2, stunting:25.2, uw:20.96, sam:1.6 } },
    'Nuagada': { Feb: { n:4891, wasting:6.3, stunting:35.39, uw:19.61, sam:1.2 }, Mar: { n:4832, wasting:6.3, stunting:24.3, uw:15.25, sam:0.8 }, Apr: { n:4856, wasting:5.8, stunting:28.05, uw:16.66, sam:1.0 }, May: { n:4805, wasting:6.6, stunting:26.66, uw:16.17, sam:1.4 }, Jun: { n:4728, wasting:7.8, stunting:26.44, uw:17.53, sam:1.3 }, Jul: { n:4712, wasting:13.3, stunting:28.2, uw:26.78, sam:1.8 } },
    'PARALAKHEMUNDI': { Feb: { n:3900, wasting:5.9, stunting:15.74, uw:10.97, sam:1.5 }, Mar: { n:3945, wasting:5.1, stunting:13.49, uw:9.58, sam:1.0 }, Apr: { n:3911, wasting:4.7, stunting:15.95, uw:9.95, sam:1.0 }, May: { n:3918, wasting:4.5, stunting:15.39, uw:8.35, sam:0.9 }, Jun: { n:3970, wasting:4.4, stunting:17.2, uw:9.12, sam:1.0 }, Jul: { n:3884, wasting:6.5, stunting:14.91, uw:12.0, sam:1.4 } },
    'R.Udayagiri': { Feb: { n:5370, wasting:3.1, stunting:26.78, uw:10.09, sam:0.9 }, Mar: { n:5347, wasting:3.5, stunting:20.27, uw:8.23, sam:0.9 }, Apr: { n:5300, wasting:3.2, stunting:23.62, uw:9.57, sam:0.8 }, May: { n:5290, wasting:2.9, stunting:23.63, uw:9.05, sam:0.7 }, Jun: { n:5278, wasting:3.3, stunting:24.02, uw:10.02, sam:0.9 }, Jul: { n:5217, wasting:9.8, stunting:28.68, uw:20.59, sam:1.8 } },
    'Rayagada': { Feb: { n:4824, wasting:10.4, stunting:37.04, uw:29.27, sam:2.4 }, Mar: { n:4788, wasting:9.6, stunting:36.28, uw:29.43, sam:1.2 }, Apr: { n:4749, wasting:9.5, stunting:37.33, uw:28.22, sam:1.5 }, May: { n:4724, wasting:9.1, stunting:37.79, uw:29.17, sam:1.3 }, Jun: { n:4607, wasting:9.8, stunting:38.94, uw:31.24, sam:1.5 }, Jul: { n:4584, wasting:11.2, stunting:38.35, uw:34.75, sam:1.1 } },
  },
  'Ganjam': {
    'Aska': { Feb: { n:10620, wasting:2.1, stunting:30.84, uw:7.35, sam:0.6 }, Mar: { n:10650, wasting:3.0, stunting:26.8, uw:6.98, sam:1.4 }, Apr: { n:10519, wasting:2.6, stunting:19.97, uw:5.38, sam:0.9 }, May: { n:10413, wasting:2.0, stunting:20.49, uw:4.65, sam:0.5 }, Jun: { n:10221, wasting:0.9, stunting:20.31, uw:3.84, sam:0.1 }, Jul: { n:10359, wasting:0.1, stunting:12.62, uw:2.36, sam:0.0 } },
    'Bam_City-I': { Feb: { n:6920, wasting:1.2, stunting:21.33, uw:3.68, sam:0.3 }, Mar: { n:6989, wasting:1.2, stunting:21.45, uw:3.62, sam:0.2 }, Apr: { n:7042, wasting:1.2, stunting:20.19, uw:3.61, sam:0.3 }, May: { n:6803, wasting:1.3, stunting:20.51, uw:3.91, sam:0.3 }, Jun: { n:6641, wasting:1.4, stunting:20.3, uw:3.48, sam:0.3 }, Jul: { n:6531, wasting:1.6, stunting:14.68, uw:2.88, sam:0.3 } },
    'Beguniapada': { Feb: { n:10416, wasting:0.7, stunting:20.23, uw:4.92, sam:0.2 }, Mar: { n:10394, wasting:0.7, stunting:20.16, uw:5.13, sam:0.2 }, Apr: { n:10245, wasting:0.7, stunting:21.68, uw:5.4, sam:0.2 }, May: { n:10161, wasting:0.8, stunting:23.46, uw:5.17, sam:0.2 }, Jun: { n:10007, wasting:0.3, stunting:11.48, uw:2.15, sam:0.0 }, Jul: { n:9986, wasting:0.5, stunting:8.76, uw:1.88, sam:0.1 } },
    'Belaguntha': { Feb: { n:6886, wasting:2.9, stunting:33.66, uw:9.21, sam:0.9 }, Mar: { n:6836, wasting:2.4, stunting:27.18, uw:6.5, sam:0.5 }, Apr: { n:6734, wasting:2.2, stunting:12.96, uw:3.3, sam:0.6 }, May: { n:6660, wasting:2.2, stunting:12.0, uw:2.72, sam:0.6 }, Jun: { n:6531, wasting:1.6, stunting:11.88, uw:2.53, sam:0.4 }, Jul: { n:6535, wasting:1.2, stunting:4.47, uw:1.51, sam:0.2 } },
    'Berhampur_(U)_-_II': { Feb: { n:6890, wasting:0.9, stunting:27.5, uw:6.5, sam:0.2 }, Mar: { n:6912, wasting:1.2, stunting:28.94, uw:6.42, sam:0.4 }, Apr: { n:7054, wasting:1.1, stunting:26.72, uw:5.36, sam:0.2 }, May: { n:6887, wasting:1.2, stunting:26.02, uw:4.84, sam:0.3 }, Jun: { n:6020, wasting:1.1, stunting:24.83, uw:4.62, sam:0.3 }, Jul: { n:6351, wasting:0.9, stunting:7.78, uw:1.53, sam:0.2 } },
    'Bhanjanagar': { Feb: { n:11667, wasting:2.1, stunting:29.43, uw:7.65, sam:0.6 }, Mar: { n:11599, wasting:1.8, stunting:28.82, uw:6.79, sam:0.5 }, Apr: { n:11492, wasting:2.0, stunting:25.96, uw:6.27, sam:0.5 }, May: { n:11111, wasting:1.4, stunting:25.06, uw:5.75, sam:0.4 }, Jun: { n:10880, wasting:1.7, stunting:20.42, uw:4.79, sam:0.5 }, Jul: { n:10726, wasting:1.2, stunting:9.71, uw:2.94, sam:0.4 } },
    'Buguda': { Feb: { n:8059, wasting:0.5, stunting:11.16, uw:2.47, sam:0.1 }, Mar: { n:8008, wasting:0.8, stunting:12.16, uw:2.56, sam:0.2 }, Apr: { n:7807, wasting:0.9, stunting:13.48, uw:2.84, sam:0.3 }, May: { n:7674, wasting:0.9, stunting:13.07, uw:2.35, sam:0.3 }, Jun: { n:7355, wasting:0.5, stunting:12.21, uw:1.96, sam:0.1 }, Jul: { n:7410, wasting:0.3, stunting:9.16, uw:1.85, sam:0.1 } },
    'CHATRAPUR': { Feb: { n:9319, wasting:1.3, stunting:19.54, uw:4.78, sam:0.3 }, Mar: { n:9304, wasting:1.3, stunting:15.92, uw:4.0, sam:0.3 }, Apr: { n:9243, wasting:1.2, stunting:12.83, uw:3.27, sam:0.3 }, May: { n:9153, wasting:1.2, stunting:12.9, uw:2.99, sam:0.3 }, Jun: { n:9042, wasting:1.0, stunting:9.96, uw:2.36, sam:0.3 }, Jul: { n:8954, wasting:1.3, stunting:8.44, uw:2.46, sam:0.2 } },
    'Chikiti': { Feb: { n:8590, wasting:2.4, stunting:32.44, uw:8.96, sam:0.9 }, Mar: { n:8584, wasting:1.9, stunting:29.3, uw:7.39, sam:0.7 }, Apr: { n:8562, wasting:1.8, stunting:28.25, uw:7.79, sam:0.5 }, May: { n:8525, wasting:1.9, stunting:29.21, uw:7.61, sam:0.5 }, Jun: { n:8384, wasting:1.2, stunting:26.17, uw:6.23, sam:0.4 }, Jul: { n:8415, wasting:2.2, stunting:11.34, uw:3.4, sam:0.2 } },
    'DHARAKOTE': { Feb: { n:7071, wasting:2.7, stunting:29.43, uw:7.13, sam:1.1 }, Mar: { n:6986, wasting:2.2, stunting:24.19, uw:5.65, sam:0.8 }, Apr: { n:6840, wasting:2.4, stunting:19.47, uw:4.96, sam:0.9 }, May: { n:6833, wasting:1.4, stunting:19.48, uw:4.98, sam:0.2 }, Jun: { n:6758, wasting:1.2, stunting:18.45, uw:4.54, sam:0.2 }, Jul: { n:6722, wasting:1.6, stunting:17.82, uw:4.7, sam:0.1 } },
    'Digapahandi': { Feb: { n:9851, wasting:1.0, stunting:10.76, uw:3.3, sam:0.2 }, Mar: { n:9870, wasting:1.3, stunting:10.63, uw:2.89, sam:0.3 }, Apr: { n:9757, wasting:1.2, stunting:11.48, uw:3.17, sam:0.3 }, May: { n:9733, wasting:1.2, stunting:10.54, uw:2.84, sam:0.3 }, Jun: { n:9527, wasting:0.9, stunting:8.19, uw:2.0, sam:0.1 }, Jul: { n:9613, wasting:0.7, stunting:7.02, uw:1.97, sam:0.1 } },
    'Ganjam': { Feb: { n:6632, wasting:2.7, stunting:30.37, uw:9.29, sam:0.3 }, Mar: { n:6646, wasting:3.1, stunting:29.54, uw:8.4, sam:0.5 }, Apr: { n:6574, wasting:2.8, stunting:29.84, uw:8.66, sam:0.3 }, May: { n:6544, wasting:2.1, stunting:30.55, uw:7.98, sam:0.3 }, Jun: { n:6228, wasting:1.8, stunting:28.42, uw:7.45, sam:0.3 }, Jul: { n:6293, wasting:1.6, stunting:16.1, uw:4.83, sam:0.2 } },
    'Hinjilicut': { Feb: { n:9904, wasting:2.1, stunting:15.15, uw:3.49, sam:0.4 }, Mar: { n:9952, wasting:2.0, stunting:15.7, uw:3.27, sam:0.4 }, Apr: { n:9954, wasting:1.7, stunting:13.99, uw:3.1, sam:0.3 }, May: { n:9864, wasting:1.6, stunting:14.31, uw:3.04, sam:0.3 }, Jun: { n:9822, wasting:1.5, stunting:10.17, uw:2.11, sam:0.3 }, Jul: { n:10034, wasting:0.9, stunting:4.8, uw:1.35, sam:0.2 } },
    'Jaganathprasad': { Feb: { n:8454, wasting:3.1, stunting:32.34, uw:9.17, sam:1.2 }, Mar: { n:8394, wasting:2.6, stunting:30.78, uw:8.14, sam:0.9 }, Apr: { n:8228, wasting:2.2, stunting:26.58, uw:7.3, sam:0.7 }, May: { n:8224, wasting:2.0, stunting:26.65, uw:6.97, sam:0.7 }, Jun: { n:7963, wasting:1.5, stunting:14.14, uw:4.31, sam:0.5 }, Jul: { n:7889, wasting:1.8, stunting:13.5, uw:5.4, sam:0.5 } },
    'Kavisuryanagar': { Feb: { n:8627, wasting:1.0, stunting:11.63, uw:3.14, sam:0.3 }, Mar: { n:8572, wasting:0.7, stunting:11.78, uw:2.94, sam:0.2 }, Apr: { n:8485, wasting:0.9, stunting:10.94, uw:2.86, sam:0.2 }, May: { n:8424, wasting:0.9, stunting:11.21, uw:2.87, sam:0.3 }, Jun: { n:8342, wasting:1.0, stunting:12.62, uw:3.12, sam:0.3 }, Jul: { n:8253, wasting:2.3, stunting:11.1, uw:4.1, sam:0.7 } },
    'Khallikote': { Feb: { n:11452, wasting:2.5, stunting:24.6, uw:7.59, sam:0.6 }, Mar: { n:11385, wasting:2.2, stunting:16.04, uw:4.87, sam:0.4 }, Apr: { n:11145, wasting:2.1, stunting:14.92, uw:4.85, sam:0.3 }, May: { n:11010, wasting:1.3, stunting:14.1, uw:4.47, sam:0.3 }, Jun: { n:10757, wasting:1.1, stunting:11.56, uw:3.51, sam:0.2 }, Jul: { n:10739, wasting:1.6, stunting:11.43, uw:4.69, sam:0.2 } },
    'Kukudakhandi': { Feb: { n:9063, wasting:1.5, stunting:26.11, uw:7.4, sam:0.4 }, Mar: { n:9063, wasting:1.5, stunting:22.52, uw:6.11, sam:0.4 }, Apr: { n:9059, wasting:1.5, stunting:17.7, uw:5.32, sam:0.4 }, May: { n:8967, wasting:1.4, stunting:18.94, uw:5.5, sam:0.4 }, Jun: { n:8836, wasting:1.1, stunting:19.09, uw:5.66, sam:0.3 }, Jul: { n:8815, wasting:2.9, stunting:15.63, uw:7.11, sam:0.5 } },
    'POLASARA': { Feb: { n:9939, wasting:3.1, stunting:20.32, uw:7.26, sam:0.7 }, Mar: { n:9899, wasting:2.9, stunting:21.22, uw:7.49, sam:0.7 }, Apr: { n:9699, wasting:2.6, stunting:21.74, uw:7.52, sam:0.5 }, May: { n:9628, wasting:2.3, stunting:21.93, uw:7.35, sam:0.5 }, Jun: { n:9493, wasting:1.7, stunting:16.66, uw:5.4, sam:0.3 }, Jul: { n:9504, wasting:1.5, stunting:13.15, uw:4.37, sam:0.3 } },
    'PURUSHOTTAMPUR': { Feb: { n:9596, wasting:1.2, stunting:15.12, uw:3.8, sam:0.3 }, Mar: { n:9618, wasting:1.1, stunting:15.7, uw:3.6, sam:0.4 }, Apr: { n:9431, wasting:1.1, stunting:15.68, uw:3.66, sam:0.3 }, May: { n:9288, wasting:1.1, stunting:15.71, uw:3.56, sam:0.4 }, Jun: { n:9072, wasting:0.9, stunting:14.68, uw:3.09, sam:0.3 }, Jul: { n:9095, wasting:0.6, stunting:12.17, uw:2.75, sam:0.2 } },
    'Patrapur': { Feb: { n:8450, wasting:4.1, stunting:37.3, uw:12.93, sam:1.3 }, Mar: { n:8438, wasting:3.6, stunting:37.18, uw:11.93, sam:1.0 }, Apr: { n:8383, wasting:1.8, stunting:36.78, uw:10.46, sam:0.5 }, May: { n:8306, wasting:1.3, stunting:14.66, uw:3.79, sam:0.3 }, Jun: { n:8170, wasting:0.8, stunting:5.42, uw:1.31, sam:0.2 }, Jul: { n:8180, wasting:0.7, stunting:4.94, uw:1.33, sam:0.2 } },
    'RANGEILUNDA': { Feb: { n:11690, wasting:3.2, stunting:27.88, uw:7.84, sam:0.9 }, Mar: { n:11762, wasting:3.2, stunting:28.22, uw:7.29, sam:0.9 }, Apr: { n:11808, wasting:2.9, stunting:28.58, uw:7.63, sam:0.9 }, May: { n:11766, wasting:2.9, stunting:28.02, uw:7.08, sam:0.8 }, Jun: { n:11253, wasting:2.5, stunting:23.63, uw:5.4, sam:0.6 }, Jul: { n:11484, wasting:2.0, stunting:17.36, uw:4.08, sam:0.5 } },
    'SORADA': { Feb: { n:11777, wasting:3.3, stunting:39.93, uw:11.26, sam:1.0 }, Mar: { n:11763, wasting:3.0, stunting:30.22, uw:8.06, sam:1.0 }, Apr: { n:11598, wasting:2.8, stunting:21.09, uw:5.6, sam:0.8 }, May: { n:10864, wasting:2.5, stunting:22.42, uw:6.08, sam:0.8 }, Jun: { n:11146, wasting:1.8, stunting:20.56, uw:5.05, sam:0.5 }, Jul: { n:11330, wasting:1.6, stunting:17.22, uw:4.23, sam:0.3 } },
    'Sanakhemundi': { Feb: { n:12998, wasting:1.0, stunting:17.45, uw:4.34, sam:0.2 }, Mar: { n:12915, wasting:0.8, stunting:15.44, uw:3.59, sam:0.2 }, Apr: { n:12830, wasting:0.9, stunting:13.29, uw:3.41, sam:0.3 }, May: { n:12547, wasting:0.7, stunting:13.36, uw:2.99, sam:0.2 }, Jun: { n:12440, wasting:0.6, stunting:7.81, uw:1.9, sam:0.2 }, Jul: { n:12424, wasting:0.4, stunting:1.42, uw:0.64, sam:0.1 } },
    'Sheragada': { Feb: { n:8355, wasting:1.6, stunting:12.08, uw:3.4, sam:0.6 }, Mar: { n:8072, wasting:1.6, stunting:13.21, uw:3.75, sam:0.4 }, Apr: { n:7952, wasting:1.5, stunting:12.66, uw:3.48, sam:0.3 }, May: { n:7877, wasting:1.1, stunting:11.73, uw:2.97, sam:0.3 }, Jun: { n:7812, wasting:1.0, stunting:9.81, uw:2.34, sam:0.1 }, Jul: { n:7715, wasting:2.0, stunting:8.58, uw:3.27, sam:0.2 } },
  },
  'Jagatsinghpur': {
    'Balikuda': { Feb: { n:7217, wasting:1.4, stunting:15.62, uw:4.0, sam:0.3 }, Mar: { n:7128, wasting:1.2, stunting:14.8, uw:3.48, sam:0.3 }, Apr: { n:7075, wasting:1.4, stunting:15.34, uw:4.16, sam:0.5 }, May: { n:6902, wasting:1.3, stunting:15.18, uw:3.82, sam:0.4 }, Jun: { n:6831, wasting:1.3, stunting:15.87, uw:4.19, sam:0.3 }, Jul: { n:6842, wasting:2.3, stunting:13.88, uw:4.5, sam:0.4 } },
    'Biridi': { Feb: { n:3775, wasting:1.8, stunting:19.95, uw:7.81, sam:0.2 }, Mar: { n:3749, wasting:1.8, stunting:16.51, uw:7.12, sam:0.5 }, Apr: { n:3710, wasting:2.2, stunting:15.44, uw:7.09, sam:0.5 }, May: { n:3711, wasting:2.0, stunting:16.06, uw:6.98, sam:0.4 }, Jun: { n:3696, wasting:2.1, stunting:15.72, uw:7.12, sam:0.5 }, Jul: { n:3704, wasting:2.2, stunting:14.61, uw:8.26, sam:0.4 } },
    'Erasama': { Feb: { n:7047, wasting:2.0, stunting:15.51, uw:6.27, sam:0.6 }, Mar: { n:7047, wasting:2.1, stunting:12.97, uw:5.34, sam:0.6 }, Apr: { n:6985, wasting:2.1, stunting:13.16, uw:5.5, sam:0.6 }, May: { n:6945, wasting:1.7, stunting:13.22, uw:5.47, sam:0.3 }, Jun: { n:6822, wasting:1.7, stunting:13.76, uw:5.45, sam:0.4 }, Jul: { n:6759, wasting:3.5, stunting:10.8, uw:6.64, sam:0.7 } },
    'Jagatsinghpur': { Feb: { n:8241, wasting:2.0, stunting:18.34, uw:6.18, sam:0.4 }, Mar: { n:8190, wasting:1.7, stunting:18.12, uw:5.71, sam:0.3 }, Apr: { n:8142, wasting:1.7, stunting:18.69, uw:5.86, sam:0.4 }, May: { n:8106, wasting:1.6, stunting:18.97, uw:5.44, sam:0.4 }, Jun: { n:8057, wasting:1.8, stunting:19.76, uw:5.92, sam:0.4 }, Jul: { n:8013, wasting:2.5, stunting:17.76, uw:6.58, sam:0.5 } },
    'Kujang': { Feb: { n:10666, wasting:2.0, stunting:15.54, uw:5.25, sam:0.4 }, Mar: { n:10566, wasting:1.9, stunting:13.87, uw:4.93, sam:0.4 }, Apr: { n:10424, wasting:2.1, stunting:13.69, uw:5.02, sam:0.6 }, May: { n:10341, wasting:2.1, stunting:13.73, uw:4.69, sam:0.4 }, Jun: { n:10351, wasting:2.0, stunting:14.76, uw:4.93, sam:0.4 }, Jul: { n:10352, wasting:2.0, stunting:13.98, uw:5.24, sam:0.3 } },
    'Naugaon': { Feb: { n:3322, wasting:1.3, stunting:10.26, uw:3.7, sam:0.3 }, Mar: { n:3328, wasting:1.2, stunting:9.31, uw:3.64, sam:0.3 }, Apr: { n:3277, wasting:1.3, stunting:9.25, uw:3.66, sam:0.2 }, May: { n:3227, wasting:1.1, stunting:9.33, uw:3.28, sam:0.2 }, Jun: { n:3204, wasting:1.0, stunting:8.65, uw:3.93, sam:0.1 }, Jul: { n:3222, wasting:1.7, stunting:8.04, uw:4.07, sam:0.3 } },
    'Raghunathpur': { Feb: { n:3654, wasting:1.6, stunting:15.24, uw:4.73, sam:0.3 }, Mar: { n:3588, wasting:1.5, stunting:14.83, uw:4.79, sam:0.4 }, Apr: { n:3519, wasting:2.0, stunting:13.78, uw:4.72, sam:0.4 }, May: { n:3492, wasting:2.0, stunting:14.06, uw:4.93, sam:0.4 }, Jun: { n:3438, wasting:2.2, stunting:15.85, uw:5.44, sam:0.4 }, Jul: { n:3401, wasting:2.9, stunting:12.94, uw:6.41, sam:0.7 } },
    'Tirtol': { Feb: { n:7837, wasting:1.3, stunting:12.2, uw:3.9, sam:0.2 }, Mar: { n:7790, wasting:1.3, stunting:9.0, uw:3.27, sam:0.2 }, Apr: { n:7677, wasting:1.4, stunting:8.94, uw:3.48, sam:0.2 }, May: { n:7522, wasting:1.7, stunting:8.85, uw:3.28, sam:0.3 }, Jun: { n:7443, wasting:1.4, stunting:9.59, uw:3.25, sam:0.2 }, Jul: { n:7361, wasting:1.3, stunting:9.56, uw:3.56, sam:0.3 } },
  },
  'Jajpur': {
    'Badachana': { Feb: { n:7770, wasting:3.7, stunting:28.02, uw:9.72, sam:0.8 }, Mar: { n:7721, wasting:3.3, stunting:24.0, uw:8.31, sam:0.8 }, Apr: { n:7714, wasting:2.7, stunting:16.87, uw:6.77, sam:0.7 }, May: { n:7671, wasting:2.6, stunting:17.08, uw:6.61, sam:0.5 }, Jun: { n:7607, wasting:2.6, stunting:18.55, uw:6.99, sam:0.4 }, Jul: { n:7557, wasting:2.3, stunting:16.96, uw:7.49, sam:0.4 } },
    'Badachana-II': { Feb: { n:6750, wasting:1.3, stunting:12.71, uw:4.37, sam:0.2 }, Mar: { n:6748, wasting:1.4, stunting:12.94, uw:4.05, sam:0.3 }, Apr: { n:6698, wasting:1.5, stunting:9.73, uw:3.72, sam:0.2 }, May: { n:6534, wasting:1.2, stunting:8.92, uw:3.14, sam:0.3 }, Jun: { n:6500, wasting:1.4, stunting:9.34, uw:3.23, sam:0.3 }, Jul: { n:6402, wasting:1.3, stunting:10.23, uw:4.8, sam:0.2 } },
    'Bari': { Feb: { n:9381, wasting:3.0, stunting:20.26, uw:6.36, sam:0.5 }, Mar: { n:9329, wasting:2.6, stunting:18.89, uw:5.71, sam:0.4 }, Apr: { n:9206, wasting:2.5, stunting:19.26, uw:6.01, sam:0.5 }, May: { n:9101, wasting:2.2, stunting:18.49, uw:5.56, sam:0.3 }, Jun: { n:9042, wasting:2.0, stunting:16.17, uw:4.21, sam:0.3 }, Jul: { n:8989, wasting:2.0, stunting:12.08, uw:4.87, sam:0.4 } },
    'Binjharpur': { Feb: { n:10862, wasting:1.7, stunting:15.57, uw:5.76, sam:0.2 }, Mar: { n:10814, wasting:1.6, stunting:15.36, uw:5.78, sam:0.3 }, Apr: { n:10687, wasting:1.5, stunting:15.68, uw:5.79, sam:0.2 }, May: { n:10613, wasting:1.5, stunting:15.71, uw:5.34, sam:0.3 }, Jun: { n:10491, wasting:1.4, stunting:14.77, uw:5.33, sam:0.2 }, Jul: { n:10424, wasting:1.4, stunting:11.58, uw:4.82, sam:0.2 } },
    'Danagadi': { Feb: { n:9144, wasting:3.4, stunting:24.07, uw:10.65, sam:0.3 }, Mar: { n:9149, wasting:2.8, stunting:22.68, uw:10.1, sam:0.3 }, Apr: { n:9017, wasting:2.9, stunting:23.08, uw:10.29, sam:0.3 }, May: { n:8885, wasting:2.4, stunting:24.01, uw:10.23, sam:0.2 }, Jun: { n:8789, wasting:3.2, stunting:24.69, uw:10.38, sam:0.3 }, Jul: { n:8769, wasting:2.2, stunting:19.83, uw:9.12, sam:0.1 } },
    'Dasarathipur': { Feb: { n:11489, wasting:2.5, stunting:20.32, uw:7.35, sam:0.6 }, Mar: { n:11455, wasting:1.7, stunting:16.41, uw:5.34, sam:0.3 }, Apr: { n:11359, wasting:1.4, stunting:15.48, uw:4.86, sam:0.2 }, May: { n:11234, wasting:1.3, stunting:14.6, uw:4.39, sam:0.2 }, Jun: { n:11192, wasting:1.5, stunting:13.36, uw:4.37, sam:0.2 }, Jul: { n:11042, wasting:1.1, stunting:11.06, uw:3.87, sam:0.1 } },
    'Dharmasala': { Feb: { n:13984, wasting:0.7, stunting:14.36, uw:3.67, sam:0.1 }, Mar: { n:13920, wasting:0.5, stunting:11.79, uw:3.06, sam:0.1 }, Apr: { n:13831, wasting:0.6, stunting:11.99, uw:2.99, sam:0.2 }, May: { n:13759, wasting:0.6, stunting:11.45, uw:2.93, sam:0.2 }, Jun: { n:13658, wasting:0.8, stunting:11.52, uw:2.34, sam:0.3 }, Jul: { n:13487, wasting:0.4, stunting:8.45, uw:2.25, sam:0.1 } },
    'Jajpur': { Feb: { n:13128, wasting:1.0, stunting:18.66, uw:4.85, sam:0.3 }, Mar: { n:13107, wasting:0.9, stunting:16.16, uw:4.1, sam:0.2 }, Apr: { n:12947, wasting:1.0, stunting:12.98, uw:3.57, sam:0.2 }, May: { n:12785, wasting:0.9, stunting:11.43, uw:3.09, sam:0.2 }, Jun: { n:12621, wasting:1.0, stunting:8.34, uw:2.78, sam:0.3 }, Jul: { n:12592, wasting:0.7, stunting:5.54, uw:2.72, sam:0.1 } },
    'Korei': { Feb: { n:14133, wasting:1.5, stunting:19.68, uw:6.22, sam:0.3 }, Mar: { n:14095, wasting:1.6, stunting:17.1, uw:5.65, sam:0.2 }, Apr: { n:14014, wasting:1.8, stunting:17.34, uw:5.81, sam:0.4 }, May: { n:13914, wasting:1.8, stunting:18.27, uw:6.12, sam:0.3 }, Jun: { n:13898, wasting:2.0, stunting:17.08, uw:5.85, sam:0.4 }, Jul: { n:13833, wasting:2.5, stunting:15.18, uw:6.93, sam:0.3 } },
    'Rasulpur': { Feb: { n:11285, wasting:1.9, stunting:19.08, uw:5.66, sam:0.3 }, Mar: { n:11293, wasting:2.0, stunting:16.55, uw:4.73, sam:0.3 }, Apr: { n:11220, wasting:1.9, stunting:13.65, uw:4.06, sam:0.5 }, May: { n:11114, wasting:1.6, stunting:8.28, uw:2.85, sam:0.4 }, Jun: { n:11073, wasting:1.1, stunting:6.49, uw:2.28, sam:0.3 }, Jul: { n:11005, wasting:1.0, stunting:4.48, uw:2.23, sam:0.1 } },
    'Sukinda': { Feb: { n:10201, wasting:4.1, stunting:35.62, uw:15.03, sam:0.8 }, Mar: { n:10260, wasting:4.1, stunting:36.39, uw:14.99, sam:0.8 }, Apr: { n:10208, wasting:4.0, stunting:32.59, uw:13.51, sam:0.7 }, May: { n:10091, wasting:4.0, stunting:32.37, uw:13.63, sam:0.9 }, Jun: { n:9803, wasting:4.7, stunting:31.59, uw:14.24, sam:1.1 }, Jul: { n:9803, wasting:4.0, stunting:28.81, uw:13.69, sam:0.7 } },
  },
  'Jharsuguda': {
    'BRAJRAJNAGAR_URBAN': { Feb: { n:3380, wasting:6.6, stunting:19.05, uw:9.32, sam:1.9 }, Mar: { n:3393, wasting:4.0, stunting:13.41, uw:6.16, sam:1.1 }, Apr: { n:3384, wasting:1.9, stunting:12.5, uw:5.56, sam:0.6 }, May: { n:3340, wasting:1.9, stunting:13.59, uw:6.02, sam:0.7 }, Jun: { n:3320, wasting:1.2, stunting:8.61, uw:4.4, sam:0.6 }, Jul: { n:3351, wasting:3.1, stunting:9.37, uw:5.85, sam:1.1 } },
    'JHARSUGUDA_RURAL': { Feb: { n:3938, wasting:5.1, stunting:35.93, uw:14.58, sam:1.6 }, Mar: { n:3951, wasting:5.2, stunting:28.73, uw:12.12, sam:1.5 }, Apr: { n:3937, wasting:5.3, stunting:28.68, uw:12.88, sam:1.3 }, May: { n:3982, wasting:4.5, stunting:27.72, uw:12.0, sam:0.7 }, Jun: { n:3953, wasting:2.6, stunting:26.23, uw:10.25, sam:0.7 }, Jul: { n:3952, wasting:4.8, stunting:22.04, uw:12.4, sam:1.1 } },
    'JHARSUGUDA_URBAN': { Feb: { n:5414, wasting:2.9, stunting:11.49, uw:4.67, sam:0.8 }, Mar: { n:5283, wasting:1.9, stunting:3.98, uw:2.54, sam:0.5 }, Apr: { n:5190, wasting:1.7, stunting:7.17, uw:2.89, sam:0.5 }, May: { n:5119, wasting:1.9, stunting:7.15, uw:2.81, sam:0.5 }, Jun: { n:5064, wasting:2.1, stunting:8.31, uw:2.92, sam:0.6 }, Jul: { n:5209, wasting:2.1, stunting:9.85, uw:3.44, sam:0.4 } },
    'KIRMIRA': { Feb: { n:1931, wasting:7.0, stunting:29.57, uw:16.78, sam:1.9 }, Mar: { n:1927, wasting:7.9, stunting:25.74, uw:17.54, sam:1.3 }, Apr: { n:1905, wasting:7.7, stunting:29.76, uw:17.9, sam:1.7 }, May: { n:1921, wasting:8.5, stunting:25.61, uw:16.76, sam:1.7 }, Jun: { n:1906, wasting:6.9, stunting:27.12, uw:16.32, sam:1.6 }, Jul: { n:1905, wasting:5.7, stunting:28.08, uw:17.69, sam:1.6 } },
    'KOLABIRA': { Feb: { n:2266, wasting:2.6, stunting:31.33, uw:12.4, sam:1.1 }, Mar: { n:2275, wasting:2.9, stunting:24.97, uw:11.69, sam:0.8 }, Apr: { n:2284, wasting:3.0, stunting:31.39, uw:13.49, sam:0.9 }, May: { n:2287, wasting:3.3, stunting:26.1, uw:11.89, sam:0.8 }, Jun: { n:2278, wasting:2.5, stunting:25.59, uw:10.8, sam:0.6 }, Jul: { n:2250, wasting:3.1, stunting:26.8, uw:13.47, sam:0.8 } },
    'LAIKERA': { Feb: { n:2316, wasting:4.1, stunting:20.34, uw:12.52, sam:0.9 }, Mar: { n:2315, wasting:4.2, stunting:11.32, uw:7.52, sam:1.3 }, Apr: { n:2295, wasting:3.1, stunting:17.86, uw:9.37, sam:1.0 }, May: { n:2287, wasting:2.6, stunting:13.64, uw:7.08, sam:0.8 }, Jun: { n:2291, wasting:2.3, stunting:13.84, uw:6.98, sam:0.5 }, Jul: { n:2290, wasting:4.5, stunting:16.68, uw:12.62, sam:1.0 } },
    'LAKHANPUR': { Feb: { n:9207, wasting:4.8, stunting:42.53, uw:17.37, sam:1.4 }, Mar: { n:9222, wasting:6.0, stunting:26.22, uw:11.86, sam:1.3 }, Apr: { n:9060, wasting:5.6, stunting:28.05, uw:12.85, sam:1.2 }, May: { n:9148, wasting:5.4, stunting:27.55, uw:12.24, sam:1.3 }, Jun: { n:9050, wasting:4.4, stunting:28.48, uw:11.81, sam:1.3 }, Jul: { n:9010, wasting:5.6, stunting:27.01, uw:13.6, sam:1.2 } },
  },
  'Kalahandi': {
    'BHAWANIPATNA(RURAL)': { Feb: { n:12035, wasting:4.2, stunting:31.2, uw:14.67, sam:0.8 }, Mar: { n:11895, wasting:4.1, stunting:29.39, uw:13.56, sam:0.9 }, Apr: { n:11425, wasting:4.4, stunting:26.89, uw:14.29, sam:0.9 }, May: { n:11329, wasting:4.2, stunting:23.01, uw:12.21, sam:1.0 }, Jun: { n:11548, wasting:4.3, stunting:22.54, uw:11.76, sam:1.0 }, Jul: { n:11519, wasting:5.2, stunting:22.12, uw:14.31, sam:0.7 } },
    'Bhawanipatna_(Urban)': { Feb: { n:3736, wasting:3.0, stunting:18.55, uw:6.18, sam:0.7 }, Mar: { n:3730, wasting:2.8, stunting:14.42, uw:5.74, sam:0.8 }, Apr: { n:3749, wasting:3.0, stunting:13.9, uw:6.0, sam:0.7 }, May: { n:3650, wasting:2.6, stunting:11.07, uw:4.63, sam:0.6 }, Jun: { n:3653, wasting:1.6, stunting:10.13, uw:3.61, sam:0.4 }, Jul: { n:3661, wasting:1.8, stunting:7.73, uw:4.45, sam:0.5 } },
    'DHARAMGARH': { Feb: { n:10073, wasting:2.9, stunting:29.94, uw:12.45, sam:0.4 }, Mar: { n:10123, wasting:2.8, stunting:22.0, uw:9.1, sam:0.3 }, Apr: { n:10084, wasting:3.0, stunting:22.46, uw:9.84, sam:0.6 }, May: { n:10091, wasting:2.8, stunting:18.32, uw:8.49, sam:0.3 }, Jun: { n:10122, wasting:2.8, stunting:15.3, uw:6.87, sam:0.4 }, Jul: { n:10156, wasting:2.7, stunting:10.36, uw:5.44, sam:0.3 } },
    'Golamunda': { Feb: { n:9910, wasting:5.0, stunting:34.25, uw:14.27, sam:1.1 }, Mar: { n:9912, wasting:4.2, stunting:31.34, uw:12.63, sam:0.6 }, Apr: { n:9873, wasting:4.4, stunting:32.86, uw:13.63, sam:0.9 }, May: { n:9840, wasting:4.3, stunting:32.94, uw:12.82, sam:0.6 }, Jun: { n:9866, wasting:5.4, stunting:29.58, uw:13.12, sam:0.9 }, Jul: { n:9870, wasting:5.0, stunting:22.29, uw:9.64, sam:0.7 } },
    'Junagarh': { Feb: { n:13546, wasting:3.5, stunting:27.19, uw:7.63, sam:0.5 }, Mar: { n:13510, wasting:3.7, stunting:21.29, uw:6.28, sam:0.5 }, Apr: { n:13528, wasting:3.9, stunting:19.1, uw:6.57, sam:0.6 }, May: { n:13441, wasting:4.1, stunting:17.57, uw:5.59, sam:0.8 }, Jun: { n:13507, wasting:3.4, stunting:18.38, uw:5.56, sam:0.5 }, Jul: { n:13439, wasting:3.3, stunting:14.56, uw:4.87, sam:0.4 } },
    'KALAMPUR': { Feb: { n:3991, wasting:3.4, stunting:18.54, uw:7.02, sam:0.6 }, Mar: { n:3976, wasting:4.3, stunting:15.19, uw:6.64, sam:0.4 }, Apr: { n:3987, wasting:4.4, stunting:17.86, uw:6.67, sam:0.5 }, May: { n:3960, wasting:3.7, stunting:17.22, uw:6.79, sam:0.5 }, Jun: { n:3954, wasting:2.7, stunting:12.22, uw:5.44, sam:0.6 }, Jul: { n:3996, wasting:2.2, stunting:7.31, uw:5.13, sam:0.3 } },
    'KARLAMUNDA': { Feb: { n:3225, wasting:4.6, stunting:38.7, uw:15.35, sam:0.7 }, Mar: { n:3230, wasting:5.2, stunting:38.24, uw:15.2, sam:0.9 }, Apr: { n:3203, wasting:4.3, stunting:30.44, uw:12.68, sam:1.0 }, May: { n:3192, wasting:4.9, stunting:26.1, uw:10.96, sam:0.8 }, Jun: { n:3202, wasting:3.5, stunting:29.23, uw:11.27, sam:0.6 }, Jul: { n:3214, wasting:1.7, stunting:6.16, uw:4.95, sam:0.4 } },
    'KESINGA': { Feb: { n:8075, wasting:3.8, stunting:32.98, uw:12.59, sam:0.5 }, Mar: { n:8064, wasting:3.1, stunting:28.61, uw:11.11, sam:0.4 }, Apr: { n:8071, wasting:2.2, stunting:26.76, uw:10.1, sam:0.5 }, May: { n:7940, wasting:2.1, stunting:24.17, uw:8.53, sam:0.4 }, Jun: { n:7989, wasting:2.5, stunting:24.88, uw:9.02, sam:0.6 }, Jul: { n:8013, wasting:2.8, stunting:18.56, uw:9.91, sam:0.5 } },
    'KOKSARA': { Feb: { n:8920, wasting:3.5, stunting:35.21, uw:15.45, sam:0.7 }, Mar: { n:8946, wasting:3.8, stunting:31.31, uw:13.64, sam:0.7 }, Apr: { n:8896, wasting:3.6, stunting:30.01, uw:13.78, sam:0.8 }, May: { n:8885, wasting:3.4, stunting:28.22, uw:12.38, sam:0.6 }, Jun: { n:8860, wasting:2.9, stunting:24.15, uw:10.84, sam:0.3 }, Jul: { n:8863, wasting:2.7, stunting:22.0, uw:10.4, sam:0.3 } },
    'LANJIGARH': { Feb: { n:9685, wasting:5.0, stunting:34.65, uw:16.06, sam:1.0 }, Mar: { n:9657, wasting:5.2, stunting:31.1, uw:13.79, sam:1.1 }, Apr: { n:9566, wasting:5.0, stunting:30.37, uw:14.93, sam:0.9 }, May: { n:9577, wasting:5.2, stunting:29.26, uw:13.77, sam:1.3 }, Jun: { n:9450, wasting:4.5, stunting:28.24, uw:13.1, sam:0.9 }, Jul: { n:9412, wasting:4.4, stunting:24.78, uw:13.57, sam:0.9 } },
    'M.RAMPUR': { Feb: { n:5864, wasting:2.7, stunting:28.5, uw:13.35, sam:0.7 }, Mar: { n:5857, wasting:2.5, stunting:27.08, uw:12.67, sam:0.7 }, Apr: { n:5774, wasting:3.5, stunting:27.62, uw:13.21, sam:0.9 }, May: { n:5833, wasting:2.4, stunting:25.46, uw:11.97, sam:0.6 }, Jun: { n:5800, wasting:2.4, stunting:23.1, uw:11.0, sam:0.4 }, Jul: { n:5810, wasting:2.9, stunting:21.38, uw:11.86, sam:0.5 } },
    'Narla': { Feb: { n:7485, wasting:3.8, stunting:33.19, uw:12.28, sam:0.6 }, Mar: { n:7443, wasting:3.4, stunting:28.03, uw:9.98, sam:0.7 }, Apr: { n:7383, wasting:4.2, stunting:26.02, uw:9.52, sam:0.7 }, May: { n:7327, wasting:2.6, stunting:19.89, uw:7.29, sam:0.6 }, Jun: { n:7315, wasting:2.4, stunting:15.28, uw:6.34, sam:0.4 }, Jul: { n:7361, wasting:4.8, stunting:14.35, uw:7.83, sam:0.4 } },
    'Th.Rampur': { Feb: { n:8627, wasting:5.7, stunting:44.59, uw:17.49, sam:1.0 }, Mar: { n:8452, wasting:6.1, stunting:39.01, uw:14.94, sam:1.1 }, Apr: { n:8339, wasting:6.0, stunting:36.31, uw:14.58, sam:1.3 }, May: { n:8237, wasting:6.2, stunting:35.34, uw:13.57, sam:0.9 }, Jun: { n:8173, wasting:5.9, stunting:33.4, uw:12.77, sam:0.8 }, Jul: { n:8111, wasting:6.8, stunting:29.79, uw:13.88, sam:0.9 } },
    'jaipatna': { Feb: { n:9657, wasting:3.1, stunting:31.73, uw:12.55, sam:0.4 }, Mar: { n:9593, wasting:3.4, stunting:28.02, uw:11.37, sam:0.4 }, Apr: { n:9510, wasting:3.2, stunting:24.68, uw:10.52, sam:0.6 }, May: { n:9470, wasting:3.3, stunting:23.0, uw:9.01, sam:0.7 }, Jun: { n:9498, wasting:3.1, stunting:23.15, uw:9.73, sam:0.5 }, Jul: { n:9522, wasting:3.1, stunting:18.36, uw:7.59, sam:0.4 } },
  },
  'Kandhamal': {
    'Baliguda': { Feb: { n:7449, wasting:3.8, stunting:27.05, uw:9.38, sam:0.8 }, Mar: { n:7379, wasting:3.4, stunting:28.54, uw:9.66, sam:0.8 }, Apr: { n:7328, wasting:3.8, stunting:28.81, uw:9.91, sam:0.9 }, May: { n:7275, wasting:4.0, stunting:28.99, uw:10.38, sam:0.9 }, Jun: { n:7253, wasting:4.8, stunting:24.67, uw:10.78, sam:1.0 }, Jul: { n:7243, wasting:5.7, stunting:25.5, uw:11.9, sam:1.3 } },
    'CHAKAPAD': { Feb: { n:2961, wasting:3.0, stunting:38.94, uw:19.42, sam:0.3 }, Mar: { n:2989, wasting:4.0, stunting:34.06, uw:19.44, sam:0.4 }, Apr: { n:2916, wasting:3.4, stunting:31.41, uw:17.9, sam:0.3 }, May: { n:2883, wasting:3.8, stunting:31.04, uw:18.56, sam:0.4 }, Jun: { n:2821, wasting:4.4, stunting:30.24, uw:19.39, sam:0.5 }, Jul: { n:2858, wasting:5.4, stunting:28.03, uw:20.01, sam:0.9 } },
    'DARINGBADI': { Feb: { n:10567, wasting:4.7, stunting:31.31, uw:15.96, sam:0.9 }, Mar: { n:10513, wasting:4.7, stunting:25.17, uw:14.77, sam:0.9 }, Apr: { n:10277, wasting:4.3, stunting:26.22, uw:14.26, sam:0.8 }, May: { n:10161, wasting:4.5, stunting:24.58, uw:13.29, sam:1.0 }, Jun: { n:10076, wasting:4.8, stunting:23.09, uw:12.79, sam:0.8 }, Jul: { n:10080, wasting:6.1, stunting:22.09, uw:14.83, sam:1.0 } },
    'G.UDAYGIRI': { Feb: { n:2032, wasting:4.9, stunting:25.3, uw:15.45, sam:0.8 }, Mar: { n:2018, wasting:5.0, stunting:25.37, uw:14.67, sam:0.4 }, Apr: { n:2021, wasting:5.4, stunting:26.27, uw:15.34, sam:0.4 }, May: { n:1979, wasting:5.5, stunting:24.81, uw:16.68, sam:0.7 }, Jun: { n:1952, wasting:5.6, stunting:21.16, uw:17.21, sam:0.4 }, Jul: { n:1932, wasting:6.4, stunting:20.65, uw:18.06, sam:0.6 } },
    'K.NUAGAON': { Feb: { n:4165, wasting:5.5, stunting:46.58, uw:24.9, sam:0.6 }, Mar: { n:4143, wasting:5.9, stunting:44.99, uw:24.11, sam:0.9 }, Apr: { n:4082, wasting:6.7, stunting:45.93, uw:26.04, sam:1.1 }, May: { n:4041, wasting:7.9, stunting:39.57, uw:25.54, sam:0.9 }, Jun: { n:4004, wasting:8.0, stunting:33.49, uw:24.33, sam:0.8 }, Jul: { n:4037, wasting:6.9, stunting:31.34, uw:23.33, sam:0.6 } },
    'KHAJURIPADA': { Feb: { n:3250, wasting:4.3, stunting:31.02, uw:15.75, sam:0.7 }, Mar: { n:3258, wasting:3.6, stunting:30.08, uw:16.02, sam:0.5 }, Apr: { n:3244, wasting:3.9, stunting:29.41, uw:16.21, sam:0.5 }, May: { n:3238, wasting:3.3, stunting:30.95, uw:17.02, sam:0.8 }, Jun: { n:3243, wasting:3.1, stunting:26.52, uw:16.19, sam:0.5 }, Jul: { n:3232, wasting:4.1, stunting:26.67, uw:18.16, sam:0.8 } },
    'KOTAGARH': { Feb: { n:6076, wasting:4.5, stunting:32.27, uw:11.9, sam:1.1 }, Mar: { n:6021, wasting:4.5, stunting:26.71, uw:9.98, sam:0.9 }, Apr: { n:6008, wasting:4.9, stunting:26.15, uw:10.29, sam:1.3 }, May: { n:5788, wasting:4.1, stunting:25.05, uw:9.62, sam:0.8 }, Jun: { n:5604, wasting:2.6, stunting:20.16, uw:8.1, sam:0.6 }, Jul: { n:5613, wasting:3.2, stunting:20.68, uw:8.96, sam:0.6 } },
    'PHIRINGIA': { Feb: { n:8051, wasting:2.4, stunting:34.58, uw:16.4, sam:0.3 }, Mar: { n:8065, wasting:2.6, stunting:32.6, uw:15.47, sam:0.2 }, Apr: { n:8032, wasting:2.5, stunting:34.56, uw:16.75, sam:0.2 }, May: { n:7941, wasting:2.4, stunting:32.78, uw:15.89, sam:0.3 }, Jun: { n:8040, wasting:2.4, stunting:33.21, uw:17.15, sam:0.3 }, Jul: { n:8111, wasting:2.6, stunting:33.03, uw:19.42, sam:0.3 } },
    'PHULBANI': { Feb: { n:4821, wasting:3.7, stunting:35.74, uw:14.89, sam:0.6 }, Mar: { n:4822, wasting:4.4, stunting:32.46, uw:13.73, sam:0.5 }, Apr: { n:4746, wasting:4.4, stunting:33.33, uw:14.94, sam:0.5 }, May: { n:4710, wasting:5.0, stunting:32.97, uw:15.61, sam:0.8 }, Jun: { n:4671, wasting:6.1, stunting:28.84, uw:16.63, sam:0.9 }, Jul: { n:4629, wasting:4.9, stunting:26.74, uw:17.82, sam:0.7 } },
    'RAIKIA': { Feb: { n:3365, wasting:6.2, stunting:32.3, uw:17.06, sam:1.0 }, Mar: { n:3343, wasting:6.4, stunting:31.26, uw:16.81, sam:1.0 }, Apr: { n:3303, wasting:6.8, stunting:34.67, uw:18.86, sam:1.3 }, May: { n:3298, wasting:7.4, stunting:33.11, uw:18.25, sam:1.1 }, Jun: { n:3267, wasting:7.7, stunting:27.21, uw:16.77, sam:0.5 }, Jul: { n:3220, wasting:5.7, stunting:26.09, uw:16.43, sam:0.8 } },
    'TIKABALI': { Feb: { n:2731, wasting:3.6, stunting:34.64, uw:19.19, sam:0.3 }, Mar: { n:2690, wasting:3.5, stunting:34.35, uw:19.0, sam:0.3 }, Apr: { n:2654, wasting:4.0, stunting:36.7, uw:20.76, sam:0.3 }, May: { n:2627, wasting:3.8, stunting:35.97, uw:21.24, sam:0.6 }, Jun: { n:2643, wasting:3.8, stunting:35.19, uw:21.91, sam:0.4 }, Jul: { n:2657, wasting:3.2, stunting:33.38, uw:21.94, sam:0.3 } },
    'TUMUDIBANDHA': { Feb: { n:5174, wasting:5.3, stunting:40.03, uw:16.85, sam:0.8 }, Mar: { n:5151, wasting:4.5, stunting:37.41, uw:15.36, sam:0.7 }, Apr: { n:5091, wasting:4.3, stunting:38.64, uw:15.67, sam:0.6 }, May: { n:5066, wasting:4.3, stunting:35.47, uw:14.45, sam:0.6 }, Jun: { n:5022, wasting:4.6, stunting:35.3, uw:14.12, sam:0.8 }, Jul: { n:5011, wasting:4.8, stunting:33.59, uw:14.93, sam:0.5 } },
  },
  'Kendrapara': {
    'AUL': { Feb: { n:8158, wasting:1.7, stunting:9.55, uw:3.24, sam:0.5 }, Mar: { n:8158, wasting:1.8, stunting:8.09, uw:2.84, sam:0.4 }, Apr: { n:8057, wasting:1.9, stunting:8.43, uw:2.92, sam:0.3 }, May: { n:7947, wasting:1.7, stunting:8.86, uw:2.99, sam:0.3 }, Jun: { n:7932, wasting:1.8, stunting:9.25, uw:3.01, sam:0.3 }, Jul: { n:7826, wasting:1.7, stunting:8.6, uw:3.55, sam:0.2 } },
    'DERABISH': { Feb: { n:7072, wasting:2.3, stunting:9.8, uw:4.64, sam:0.8 }, Mar: { n:7017, wasting:2.1, stunting:8.15, uw:3.96, sam:0.6 }, Apr: { n:6917, wasting:1.8, stunting:8.37, uw:3.93, sam:0.5 }, May: { n:6930, wasting:1.5, stunting:8.14, uw:3.9, sam:0.3 }, Jun: { n:6900, wasting:1.7, stunting:10.1, uw:4.19, sam:0.5 }, Jul: { n:6787, wasting:2.5, stunting:11.4, uw:6.75, sam:0.4 } },
    'GARADAPUR': { Feb: { n:5214, wasting:2.0, stunting:9.63, uw:3.72, sam:0.6 }, Mar: { n:5149, wasting:2.0, stunting:10.02, uw:4.0, sam:0.8 }, Apr: { n:5075, wasting:2.4, stunting:10.94, uw:4.22, sam:0.6 }, May: { n:5055, wasting:2.7, stunting:8.66, uw:3.96, sam:0.6 }, Jun: { n:5047, wasting:2.4, stunting:8.06, uw:4.0, sam:0.6 }, Jul: { n:4959, wasting:1.2, stunting:6.98, uw:3.87, sam:0.1 } },
    'KENDRAPADA': { Feb: { n:11500, wasting:1.9, stunting:10.48, uw:4.32, sam:0.4 }, Mar: { n:11465, wasting:1.9, stunting:9.42, uw:4.1, sam:0.4 }, Apr: { n:11372, wasting:2.0, stunting:7.9, uw:3.91, sam:0.5 }, May: { n:11310, wasting:1.7, stunting:9.35, uw:4.26, sam:0.5 }, Jun: { n:11258, wasting:1.9, stunting:9.19, uw:4.32, sam:0.5 }, Jul: { n:11096, wasting:1.3, stunting:8.95, uw:5.12, sam:0.2 } },
    'MAHAKALPADA': { Feb: { n:11867, wasting:2.1, stunting:12.7, uw:4.88, sam:0.6 }, Mar: { n:11690, wasting:1.7, stunting:7.64, uw:2.99, sam:0.5 }, Apr: { n:11597, wasting:1.6, stunting:9.21, uw:3.51, sam:0.4 }, May: { n:11565, wasting:1.7, stunting:7.98, uw:2.93, sam:0.5 }, Jun: { n:11575, wasting:1.8, stunting:8.03, uw:3.07, sam:0.5 }, Jul: { n:11388, wasting:1.5, stunting:6.73, uw:3.85, sam:0.3 } },
    'MARSHAGHAI': { Feb: { n:5494, wasting:2.6, stunting:12.65, uw:4.73, sam:0.7 }, Mar: { n:5464, wasting:2.5, stunting:10.19, uw:4.06, sam:0.8 }, Apr: { n:5364, wasting:2.6, stunting:10.44, uw:4.29, sam:0.6 }, May: { n:5341, wasting:2.6, stunting:10.11, uw:4.06, sam:0.7 }, Jun: { n:5323, wasting:2.9, stunting:10.05, uw:4.49, sam:0.8 }, Jul: { n:5247, wasting:1.0, stunting:5.47, uw:2.71, sam:0.3 } },
    'PATTAMUNDAI': { Feb: { n:12009, wasting:1.7, stunting:9.93, uw:4.13, sam:0.5 }, Mar: { n:11905, wasting:1.2, stunting:5.72, uw:2.43, sam:0.4 }, Apr: { n:11825, wasting:1.6, stunting:8.68, uw:3.37, sam:0.6 }, May: { n:11720, wasting:1.4, stunting:9.94, uw:3.17, sam:0.5 }, Jun: { n:11676, wasting:1.4, stunting:10.73, uw:3.96, sam:0.4 }, Jul: { n:11545, wasting:0.8, stunting:5.02, uw:2.1, sam:0.2 } },
    'RAJKANIKA': { Feb: { n:7402, wasting:2.1, stunting:12.73, uw:5.0, sam:0.7 }, Mar: { n:7428, wasting:2.2, stunting:7.34, uw:3.84, sam:0.7 }, Apr: { n:7337, wasting:1.9, stunting:9.53, uw:4.4, sam:0.6 }, May: { n:7311, wasting:1.5, stunting:7.26, uw:3.46, sam:0.6 }, Jun: { n:7279, wasting:1.6, stunting:3.7, uw:2.72, sam:0.6 }, Jul: { n:7239, wasting:1.5, stunting:5.65, uw:3.29, sam:0.3 } },
    'RAJNAGAR': { Feb: { n:11387, wasting:1.9, stunting:10.87, uw:5.7, sam:0.6 }, Mar: { n:11393, wasting:2.1, stunting:9.11, uw:4.63, sam:0.5 }, Apr: { n:11216, wasting:1.8, stunting:12.47, uw:6.01, sam:0.5 }, May: { n:11158, wasting:1.4, stunting:9.68, uw:4.48, sam:0.5 }, Jun: { n:11190, wasting:1.6, stunting:9.35, uw:4.32, sam:0.5 }, Jul: { n:11157, wasting:1.6, stunting:9.39, uw:4.68, sam:0.2 } },
  },
  'Kendujhar': {
    'Anandapur': { Feb: { n:9306, wasting:2.2, stunting:19.84, uw:8.99, sam:0.4 }, Mar: { n:9182, wasting:2.6, stunting:12.44, uw:7.57, sam:0.5 }, Apr: { n:9107, wasting:2.1, stunting:10.46, uw:6.7, sam:0.3 }, May: { n:8968, wasting:2.1, stunting:10.07, uw:6.13, sam:0.4 }, Jun: { n:8845, wasting:2.0, stunting:12.33, uw:6.99, sam:0.4 }, Jul: { n:8809, wasting:2.3, stunting:11.83, uw:6.85, sam:0.4 } },
    'Banspal': { Feb: { n:11657, wasting:4.4, stunting:41.92, uw:25.86, sam:0.8 }, Mar: { n:11361, wasting:4.7, stunting:42.29, uw:26.79, sam:0.7 }, Apr: { n:11284, wasting:10.4, stunting:45.66, uw:35.31, sam:1.9 }, May: { n:11257, wasting:8.5, stunting:46.62, uw:34.5, sam:1.0 }, Jun: { n:11260, wasting:8.0, stunting:48.41, uw:35.22, sam:1.1 }, Jul: { n:11225, wasting:9.4, stunting:47.62, uw:36.69, sam:1.4 } },
    'Champua': { Feb: { n:7263, wasting:4.8, stunting:37.92, uw:16.8, sam:1.2 }, Mar: { n:7261, wasting:5.2, stunting:27.67, uw:14.01, sam:1.2 }, Apr: { n:7191, wasting:5.8, stunting:19.65, uw:12.52, sam:1.4 }, May: { n:7200, wasting:5.2, stunting:19.74, uw:11.33, sam:1.0 }, Jun: { n:7140, wasting:5.0, stunting:21.46, uw:12.37, sam:1.0 }, Jul: { n:7088, wasting:5.2, stunting:20.97, uw:13.32, sam:0.6 } },
    'Ghasipura': { Feb: { n:9056, wasting:3.7, stunting:29.16, uw:11.5, sam:1.0 }, Mar: { n:9005, wasting:3.4, stunting:17.03, uw:7.53, sam:0.9 }, Apr: { n:8798, wasting:3.3, stunting:13.71, uw:6.46, sam:0.8 }, May: { n:8819, wasting:3.3, stunting:13.18, uw:5.82, sam:1.1 }, Jun: { n:8820, wasting:3.5, stunting:13.96, uw:6.46, sam:1.2 }, Jul: { n:8820, wasting:3.2, stunting:13.51, uw:5.92, sam:0.9 } },
    'Ghatgaon': { Feb: { n:8302, wasting:7.5, stunting:36.64, uw:24.08, sam:1.3 }, Mar: { n:8203, wasting:7.4, stunting:20.19, uw:18.23, sam:1.3 }, Apr: { n:7976, wasting:8.5, stunting:18.61, uw:17.77, sam:1.5 }, May: { n:7975, wasting:7.9, stunting:18.03, uw:17.58, sam:1.0 }, Jun: { n:7945, wasting:7.1, stunting:18.75, uw:17.47, sam:0.9 }, Jul: { n:7879, wasting:6.8, stunting:23.92, uw:20.29, sam:1.1 } },
    'Harachandanpur': { Feb: { n:10800, wasting:10.4, stunting:50.73, uw:36.39, sam:1.6 }, Mar: { n:10446, wasting:11.9, stunting:42.74, uw:35.11, sam:1.8 }, Apr: { n:10407, wasting:13.5, stunting:41.54, uw:36.77, sam:2.1 }, May: { n:10378, wasting:14.5, stunting:41.26, uw:36.47, sam:2.1 }, Jun: { n:10415, wasting:15.1, stunting:41.94, uw:37.71, sam:2.2 }, Jul: { n:10432, wasting:13.5, stunting:43.71, uw:38.0, sam:1.7 } },
    'Hatadihi': { Feb: { n:10797, wasting:4.3, stunting:26.54, uw:12.2, sam:0.9 }, Mar: { n:10762, wasting:4.5, stunting:19.36, uw:10.31, sam:1.0 }, Apr: { n:10499, wasting:4.2, stunting:18.83, uw:10.09, sam:0.9 }, May: { n:10466, wasting:3.9, stunting:18.93, uw:9.48, sam:1.0 }, Jun: { n:10458, wasting:4.1, stunting:20.81, uw:9.86, sam:1.1 }, Jul: { n:10469, wasting:4.8, stunting:19.76, uw:10.92, sam:1.1 } },
    'Jhumpura': { Feb: { n:8931, wasting:1.9, stunting:32.86, uw:11.1, sam:0.2 }, Mar: { n:8810, wasting:1.9, stunting:16.87, uw:7.6, sam:0.1 }, Apr: { n:8801, wasting:1.8, stunting:15.68, uw:6.78, sam:0.1 }, May: { n:8747, wasting:1.9, stunting:13.71, uw:6.17, sam:0.2 }, Jun: { n:8709, wasting:2.0, stunting:13.29, uw:6.74, sam:0.2 }, Jul: { n:8698, wasting:1.8, stunting:15.04, uw:7.44, sam:0.3 } },
    'Joda(T)': { Feb: { n:14659, wasting:1.9, stunting:27.32, uw:12.83, sam:0.3 }, Mar: { n:14525, wasting:1.7, stunting:8.31, uw:5.84, sam:0.3 }, Apr: { n:14209, wasting:1.6, stunting:5.63, uw:4.95, sam:0.3 }, May: { n:13925, wasting:1.4, stunting:5.61, uw:4.42, sam:0.2 }, Jun: { n:13810, wasting:1.9, stunting:8.31, uw:5.94, sam:0.4 }, Jul: { n:13639, wasting:3.2, stunting:12.09, uw:10.21, sam:0.7 } },
    'Joda(U)': { Feb: { n:2922, wasting:1.9, stunting:28.82, uw:9.65, sam:0.4 }, Mar: { n:2883, wasting:2.2, stunting:24.94, uw:9.5, sam:0.4 }, Apr: { n:2817, wasting:2.3, stunting:19.67, uw:8.84, sam:0.2 }, May: { n:2843, wasting:2.2, stunting:19.28, uw:8.05, sam:0.5 }, Jun: { n:2799, wasting:2.2, stunting:25.76, uw:10.04, sam:0.4 }, Jul: { n:2787, wasting:5.3, stunting:22.43, uw:13.67, sam:0.5 } },
    'Keonjhar': { Feb: { n:12960, wasting:5.1, stunting:42.02, uw:21.94, sam:0.9 }, Mar: { n:12734, wasting:6.3, stunting:25.49, uw:17.71, sam:1.0 }, Apr: { n:12440, wasting:6.7, stunting:23.93, uw:16.64, sam:1.2 }, May: { n:12382, wasting:6.4, stunting:24.67, uw:15.9, sam:1.1 }, Jun: { n:12327, wasting:6.3, stunting:27.57, uw:16.68, sam:1.1 }, Jul: { n:12326, wasting:6.7, stunting:29.98, uw:18.16, sam:1.0 } },
    'Patna': { Feb: { n:6808, wasting:3.9, stunting:39.39, uw:21.72, sam:0.7 }, Mar: { n:6750, wasting:5.4, stunting:28.31, uw:19.27, sam:0.8 }, Apr: { n:6617, wasting:7.3, stunting:21.99, uw:19.65, sam:1.1 }, May: { n:6598, wasting:6.5, stunting:21.22, uw:18.6, sam:1.0 }, Jun: { n:6573, wasting:6.4, stunting:22.71, uw:18.8, sam:1.3 }, Jul: { n:6508, wasting:6.1, stunting:24.08, uw:19.84, sam:0.4 } },
    'Saharpada': { Feb: { n:6286, wasting:6.9, stunting:41.01, uw:25.29, sam:1.3 }, Mar: { n:6274, wasting:7.9, stunting:25.33, uw:19.72, sam:1.7 }, Apr: { n:6205, wasting:8.3, stunting:24.3, uw:19.05, sam:1.7 }, May: { n:6215, wasting:7.8, stunting:24.39, uw:19.03, sam:1.8 }, Jun: { n:6133, wasting:7.9, stunting:25.94, uw:19.71, sam:1.6 }, Jul: { n:6155, wasting:8.1, stunting:27.16, uw:21.33, sam:1.5 } },
    'Telkoi': { Feb: { n:7477, wasting:4.0, stunting:36.78, uw:19.09, sam:0.3 }, Mar: { n:7398, wasting:4.1, stunting:26.71, uw:15.42, sam:0.3 }, Apr: { n:7242, wasting:4.0, stunting:26.51, uw:15.51, sam:0.3 }, May: { n:7201, wasting:3.7, stunting:25.98, uw:14.66, sam:0.2 }, Jun: { n:7170, wasting:4.1, stunting:27.98, uw:16.14, sam:0.2 }, Jul: { n:7147, wasting:5.3, stunting:28.96, uw:17.84, sam:0.3 } },
  },
  'Khordha': {
    'BALIPATNA': { Feb: { n:5921, wasting:2.1, stunting:18.27, uw:7.26, sam:0.4 }, Mar: { n:5905, wasting:2.3, stunting:18.36, uw:7.16, sam:0.4 }, Apr: { n:5902, wasting:2.6, stunting:18.57, uw:7.39, sam:0.4 }, May: { n:5869, wasting:2.7, stunting:19.03, uw:7.29, sam:0.5 }, Jun: { n:5837, wasting:3.1, stunting:20.44, uw:7.73, sam:0.6 }, Jul: { n:5812, wasting:1.7, stunting:14.56, uw:8.05, sam:0.4 } },
    'BANAPUR': { Feb: { n:9066, wasting:1.4, stunting:7.95, uw:3.26, sam:0.2 }, Mar: { n:9078, wasting:0.8, stunting:8.71, uw:3.01, sam:0.2 }, Apr: { n:8969, wasting:1.1, stunting:9.76, uw:3.79, sam:0.2 }, May: { n:8952, wasting:1.1, stunting:8.93, uw:3.25, sam:0.2 }, Jun: { n:8922, wasting:0.6, stunting:7.58, uw:3.13, sam:0.2 }, Jul: { n:8884, wasting:0.7, stunting:7.25, uw:4.01, sam:0.2 } },
    'BBSR(U)-I': { Feb: { n:10537, wasting:1.0, stunting:18.73, uw:6.0, sam:0.3 }, Mar: { n:10553, wasting:1.0, stunting:19.2, uw:5.98, sam:0.3 }, Apr: { n:10447, wasting:1.4, stunting:17.57, uw:6.0, sam:0.3 }, May: { n:10453, wasting:0.8, stunting:13.45, uw:4.27, sam:0.3 }, Jun: { n:10456, wasting:0.5, stunting:11.1, uw:3.19, sam:0.2 }, Jul: { n:10326, wasting:1.0, stunting:10.05, uw:4.08, sam:0.1 } },
    'BBSR_(Rural)': { Feb: { n:8371, wasting:1.2, stunting:16.92, uw:5.81, sam:0.3 }, Mar: { n:8419, wasting:1.1, stunting:15.22, uw:5.57, sam:0.2 }, Apr: { n:8094, wasting:1.0, stunting:17.26, uw:6.21, sam:0.2 }, May: { n:8133, wasting:1.0, stunting:16.27, uw:5.2, sam:0.2 }, Jun: { n:8107, wasting:1.0, stunting:16.82, uw:5.18, sam:0.2 }, Jul: { n:8041, wasting:1.2, stunting:14.87, uw:6.01, sam:0.2 } },
    'BOLAGARH': { Feb: { n:6745, wasting:2.7, stunting:17.67, uw:7.25, sam:0.6 }, Mar: { n:6757, wasting:2.8, stunting:15.98, uw:6.11, sam:0.6 }, Apr: { n:6659, wasting:2.4, stunting:18.08, uw:7.09, sam:0.5 }, May: { n:6615, wasting:2.7, stunting:15.87, uw:6.68, sam:0.4 }, Jun: { n:6603, wasting:2.7, stunting:16.42, uw:6.24, sam:0.6 }, Jul: { n:6565, wasting:3.2, stunting:14.84, uw:7.59, sam:0.7 } },
    'Balianta': { Feb: { n:6582, wasting:0.9, stunting:11.32, uw:4.12, sam:0.1 }, Mar: { n:6572, wasting:0.9, stunting:10.65, uw:3.62, sam:0.1 }, Apr: { n:6565, wasting:1.1, stunting:10.62, uw:3.78, sam:0.2 }, May: { n:6549, wasting:1.1, stunting:10.99, uw:3.85, sam:0.2 }, Jun: { n:6507, wasting:1.1, stunting:11.39, uw:4.16, sam:0.2 }, Jul: { n:6541, wasting:0.8, stunting:7.75, uw:3.99, sam:0.0 } },
    'Begunia': { Feb: { n:6929, wasting:4.1, stunting:23.26, uw:9.41, sam:1.2 }, Mar: { n:6919, wasting:3.9, stunting:22.21, uw:9.47, sam:1.1 }, Apr: { n:6774, wasting:4.0, stunting:24.02, uw:9.95, sam:1.1 }, May: { n:6784, wasting:4.5, stunting:20.45, uw:8.93, sam:1.2 }, Jun: { n:6773, wasting:4.1, stunting:22.87, uw:9.63, sam:1.1 }, Jul: { n:6739, wasting:5.1, stunting:17.35, uw:9.54, sam:0.9 } },
    'CHILIKA': { Feb: { n:7982, wasting:1.9, stunting:10.37, uw:3.82, sam:0.3 }, Mar: { n:7822, wasting:1.8, stunting:9.75, uw:3.31, sam:0.3 }, Apr: { n:7835, wasting:2.0, stunting:10.13, uw:3.65, sam:0.3 }, May: { n:7747, wasting:1.5, stunting:9.58, uw:3.27, sam:0.4 }, Jun: { n:7756, wasting:1.6, stunting:9.66, uw:3.56, sam:0.3 }, Jul: { n:7776, wasting:2.0, stunting:8.49, uw:4.1, sam:0.1 } },
    'ICDS_BMC-II': { Feb: { n:6767, wasting:1.3, stunting:12.35, uw:4.74, sam:0.2 }, Mar: { n:6702, wasting:1.4, stunting:13.0, uw:5.24, sam:0.2 }, Apr: { n:6708, wasting:1.6, stunting:13.46, uw:5.8, sam:0.2 }, May: { n:6686, wasting:1.1, stunting:10.42, uw:4.2, sam:0.1 }, Jun: { n:6721, wasting:1.2, stunting:12.66, uw:5.0, sam:0.1 }, Jul: { n:6635, wasting:0.3, stunting:9.24, uw:4.1, sam:0.1 } },
    'ICDS_BMC-III': { Feb: { n:11153, wasting:1.7, stunting:11.2, uw:4.17, sam:0.3 }, Mar: { n:11248, wasting:1.7, stunting:10.58, uw:4.11, sam:0.3 }, Apr: { n:11251, wasting:1.8, stunting:13.7, uw:5.45, sam:0.3 }, May: { n:11023, wasting:1.9, stunting:12.21, uw:4.06, sam:0.3 }, Jun: { n:10971, wasting:2.0, stunting:13.26, uw:4.61, sam:0.3 }, Jul: { n:10703, wasting:3.8, stunting:13.26, uw:7.34, sam:0.6 } },
    'JATNI': { Feb: { n:8082, wasting:1.1, stunting:18.7, uw:6.21, sam:0.2 }, Mar: { n:8035, wasting:1.1, stunting:15.69, uw:5.05, sam:0.2 }, Apr: { n:7956, wasting:1.0, stunting:17.58, uw:5.91, sam:0.2 }, May: { n:7951, wasting:1.0, stunting:15.78, uw:5.14, sam:0.2 }, Jun: { n:7803, wasting:0.8, stunting:17.42, uw:5.73, sam:0.3 }, Jul: { n:7964, wasting:1.0, stunting:13.93, uw:4.9, sam:0.2 } },
    'Khordha': { Feb: { n:10369, wasting:1.4, stunting:12.88, uw:6.68, sam:0.2 }, Mar: { n:10374, wasting:1.3, stunting:13.85, uw:6.9, sam:0.2 }, Apr: { n:10242, wasting:1.2, stunting:14.86, uw:7.1, sam:0.2 }, May: { n:10276, wasting:1.0, stunting:13.31, uw:6.08, sam:0.1 }, Jun: { n:10251, wasting:1.4, stunting:14.19, uw:6.83, sam:0.2 }, Jul: { n:10223, wasting:2.4, stunting:13.31, uw:8.54, sam:0.3 } },
    'Tangi': { Feb: { n:9320, wasting:3.3, stunting:14.67, uw:7.24, sam:0.6 }, Mar: { n:9292, wasting:3.0, stunting:15.1, uw:6.92, sam:0.6 }, Apr: { n:9193, wasting:2.8, stunting:16.22, uw:7.4, sam:0.5 }, May: { n:9148, wasting:3.0, stunting:14.19, uw:6.89, sam:0.6 }, Jun: { n:9120, wasting:2.9, stunting:14.28, uw:7.3, sam:0.6 }, Jul: { n:9095, wasting:3.3, stunting:12.42, uw:7.87, sam:0.6 } },
  },
  'Koraput': {
    'Bandhugaon': { Feb: { n:6368, wasting:3.3, stunting:46.34, uw:24.42, sam:0.6 }, Mar: { n:6293, wasting:3.3, stunting:43.54, uw:22.31, sam:0.7 }, Apr: { n:6236, wasting:4.0, stunting:43.99, uw:23.41, sam:0.8 }, May: { n:6201, wasting:3.4, stunting:38.03, uw:19.66, sam:0.5 }, Jun: { n:6170, wasting:4.4, stunting:34.98, uw:19.01, sam:0.7 }, Jul: { n:6127, wasting:6.4, stunting:36.12, uw:23.6, sam:0.8 } },
    'Boipariguda': { Feb: { n:10692, wasting:3.3, stunting:42.68, uw:22.18, sam:0.3 }, Mar: { n:10604, wasting:3.0, stunting:42.21, uw:21.16, sam:0.1 }, Apr: { n:10461, wasting:3.0, stunting:42.04, uw:22.14, sam:0.4 }, May: { n:10432, wasting:3.0, stunting:36.43, uw:19.84, sam:0.2 }, Jun: { n:10421, wasting:4.2, stunting:33.19, uw:19.45, sam:0.2 }, Jul: { n:10390, wasting:6.3, stunting:29.65, uw:20.64, sam:0.4 } },
    'Borigumma': { Feb: { n:13260, wasting:2.1, stunting:20.21, uw:9.96, sam:0.4 }, Mar: { n:13310, wasting:2.0, stunting:19.95, uw:9.37, sam:0.4 }, Apr: { n:13220, wasting:2.2, stunting:22.94, uw:11.48, sam:0.5 }, May: { n:13175, wasting:2.4, stunting:20.02, uw:10.33, sam:0.4 }, Jun: { n:13225, wasting:2.6, stunting:18.33, uw:10.03, sam:0.4 }, Jul: { n:13259, wasting:2.7, stunting:14.41, uw:10.63, sam:0.3 } },
    'Dasamantapur': { Feb: { n:7927, wasting:2.8, stunting:38.58, uw:18.43, sam:0.7 }, Mar: { n:7884, wasting:2.7, stunting:36.94, uw:17.62, sam:0.6 }, Apr: { n:7737, wasting:2.4, stunting:39.06, uw:19.62, sam:0.4 }, May: { n:7646, wasting:2.6, stunting:36.86, uw:18.21, sam:0.6 }, Jun: { n:7608, wasting:2.5, stunting:34.96, uw:17.43, sam:0.4 }, Jul: { n:7567, wasting:3.3, stunting:36.79, uw:19.29, sam:0.6 } },
    'Jeypore': { Feb: { n:14771, wasting:2.3, stunting:22.52, uw:11.06, sam:0.4 }, Mar: { n:14554, wasting:2.3, stunting:20.81, uw:10.11, sam:0.3 }, Apr: { n:14597, wasting:2.3, stunting:22.41, uw:11.14, sam:0.4 }, May: { n:14684, wasting:2.5, stunting:21.54, uw:10.98, sam:0.3 }, Jun: { n:14805, wasting:2.4, stunting:20.74, uw:11.09, sam:0.3 }, Jul: { n:14746, wasting:2.1, stunting:18.55, uw:9.28, sam:0.2 } },
    'Koraput': { Feb: { n:7023, wasting:4.2, stunting:34.84, uw:16.79, sam:0.6 }, Mar: { n:7022, wasting:3.8, stunting:34.71, uw:17.06, sam:0.6 }, Apr: { n:7014, wasting:3.9, stunting:37.08, uw:18.71, sam:0.7 }, May: { n:6943, wasting:3.9, stunting:33.36, uw:17.69, sam:0.7 }, Jun: { n:6975, wasting:4.1, stunting:32.17, uw:17.16, sam:0.6 }, Jul: { n:6966, wasting:4.9, stunting:31.5, uw:18.89, sam:0.6 } },
    'Kotpad': { Feb: { n:9879, wasting:3.8, stunting:33.43, uw:19.26, sam:0.1 }, Mar: { n:9857, wasting:3.8, stunting:35.06, uw:19.86, sam:0.1 }, Apr: { n:9866, wasting:3.8, stunting:34.63, uw:19.22, sam:0.3 }, May: { n:9852, wasting:3.7, stunting:29.96, uw:17.67, sam:0.2 }, Jun: { n:9890, wasting:3.7, stunting:30.01, uw:17.74, sam:0.2 }, Jul: { n:9954, wasting:3.8, stunting:27.34, uw:17.15, sam:0.1 } },
    'Kundura': { Feb: { n:6621, wasting:3.9, stunting:40.21, uw:21.98, sam:0.5 }, Mar: { n:6603, wasting:3.7, stunting:39.39, uw:21.91, sam:0.3 }, Apr: { n:6580, wasting:4.0, stunting:39.42, uw:23.59, sam:0.5 }, May: { n:6588, wasting:4.6, stunting:35.56, uw:22.06, sam:0.2 }, Jun: { n:6682, wasting:4.3, stunting:35.75, uw:22.6, sam:0.5 }, Jul: { n:6643, wasting:4.3, stunting:34.4, uw:23.39, sam:0.4 } },
    'Lamtaput': { Feb: { n:4764, wasting:3.9, stunting:39.74, uw:21.39, sam:0.8 }, Mar: { n:4772, wasting:3.8, stunting:39.71, uw:21.46, sam:0.9 }, Apr: { n:4715, wasting:3.6, stunting:43.22, uw:23.03, sam:0.6 }, May: { n:4764, wasting:4.1, stunting:39.82, uw:22.48, sam:0.7 }, Jun: { n:4770, wasting:4.6, stunting:41.36, uw:24.34, sam:0.8 }, Jul: { n:4764, wasting:3.6, stunting:30.58, uw:18.28, sam:0.3 } },
    'Laxmipur': { Feb: { n:5624, wasting:2.5, stunting:26.32, uw:14.31, sam:0.5 }, Mar: { n:5518, wasting:2.4, stunting:24.47, uw:12.92, sam:0.3 }, Apr: { n:5391, wasting:2.4, stunting:24.23, uw:12.91, sam:0.4 }, May: { n:5355, wasting:2.3, stunting:26.05, uw:13.46, sam:0.4 }, Jun: { n:5328, wasting:2.3, stunting:25.02, uw:13.01, sam:0.4 }, Jul: { n:5336, wasting:5.0, stunting:30.13, uw:19.92, sam:0.9 } },
    'Nandapur': { Feb: { n:7783, wasting:2.7, stunting:26.58, uw:13.97, sam:0.3 }, Mar: { n:7746, wasting:2.3, stunting:25.6, uw:12.52, sam:0.3 }, Apr: { n:7709, wasting:2.7, stunting:28.21, uw:14.81, sam:0.4 }, May: { n:7652, wasting:2.7, stunting:26.92, uw:14.19, sam:0.4 }, Jun: { n:7669, wasting:2.9, stunting:28.84, uw:15.2, sam:0.3 }, Jul: { n:7670, wasting:3.6, stunting:28.24, uw:16.71, sam:0.3 } },
    'Narayan_Patana': { Feb: { n:5313, wasting:2.4, stunting:23.56, uw:10.97, sam:0.6 }, Mar: { n:5292, wasting:2.1, stunting:23.28, uw:11.02, sam:0.4 }, Apr: { n:5281, wasting:2.1, stunting:22.02, uw:11.91, sam:0.5 }, May: { n:5227, wasting:2.1, stunting:21.79, uw:11.8, sam:0.5 }, Jun: { n:5181, wasting:2.1, stunting:13.76, uw:8.11, sam:0.4 }, Jul: { n:5224, wasting:4.0, stunting:21.84, uw:13.69, sam:0.6 } },
    'Pottangi': { Feb: { n:5528, wasting:2.3, stunting:21.78, uw:7.2, sam:0.5 }, Mar: { n:5489, wasting:2.4, stunting:23.3, uw:7.87, sam:0.7 }, Apr: { n:5395, wasting:2.1, stunting:27.69, uw:9.38, sam:0.8 }, May: { n:5368, wasting:2.1, stunting:15.39, uw:6.02, sam:0.6 }, Jun: { n:5349, wasting:2.1, stunting:16.32, uw:5.48, sam:0.5 }, Jul: { n:5364, wasting:2.0, stunting:7.46, uw:4.47, sam:0.4 } },
    'Semiliguda': { Feb: { n:4999, wasting:5.6, stunting:29.97, uw:17.32, sam:0.5 }, Mar: { n:4964, wasting:5.5, stunting:28.1, uw:16.16, sam:0.8 }, Apr: { n:4963, wasting:5.5, stunting:30.12, uw:17.97, sam:0.7 }, May: { n:4962, wasting:5.3, stunting:29.77, uw:17.69, sam:0.5 }, Jun: { n:4973, wasting:5.4, stunting:27.99, uw:16.93, sam:0.7 }, Jul: { n:4933, wasting:5.5, stunting:30.14, uw:17.51, sam:0.5 } },
    'Sunabeda': { Feb: { n:3620, wasting:2.0, stunting:17.4, uw:7.49, sam:0.2 }, Mar: { n:3610, wasting:1.7, stunting:17.15, uw:7.06, sam:0.2 }, Apr: { n:3589, wasting:2.3, stunting:19.11, uw:7.91, sam:0.4 }, May: { n:3613, wasting:1.6, stunting:17.74, uw:7.47, sam:0.2 }, Jun: { n:3615, wasting:1.6, stunting:18.64, uw:7.41, sam:0.2 }, Jul: { n:3611, wasting:1.7, stunting:16.7, uw:8.36, sam:0.2 } },
  },
  'Malkangiri': {
    'CHITRAKONDA': { Feb: { n:6897, wasting:8.8, stunting:44.34, uw:31.61, sam:1.2 }, Mar: { n:6820, wasting:9.8, stunting:43.7, uw:32.01, sam:1.6 }, Apr: { n:6799, wasting:11.0, stunting:44.52, uw:34.3, sam:1.6 }, May: { n:6786, wasting:9.7, stunting:37.16, uw:31.59, sam:1.4 }, Jun: { n:6746, wasting:8.9, stunting:29.35, uw:26.98, sam:1.1 }, Jul: { n:6724, wasting:10.3, stunting:31.42, uw:28.54, sam:1.9 } },
    'KALIMELA': { Feb: { n:10965, wasting:5.1, stunting:35.91, uw:20.56, sam:0.9 }, Mar: { n:10813, wasting:4.6, stunting:36.41, uw:20.29, sam:0.8 }, Apr: { n:10730, wasting:5.7, stunting:36.74, uw:21.86, sam:1.1 }, May: { n:10786, wasting:5.5, stunting:34.82, uw:20.82, sam:1.1 }, Jun: { n:10737, wasting:5.5, stunting:32.68, uw:20.4, sam:1.2 }, Jul: { n:10762, wasting:7.3, stunting:29.34, uw:21.99, sam:1.5 } },
    'KHAIRPUT': { Feb: { n:5385, wasting:8.7, stunting:47.78, uw:30.77, sam:1.9 }, Mar: { n:5362, wasting:9.2, stunting:43.86, uw:27.47, sam:1.7 }, Apr: { n:5322, wasting:10.0, stunting:37.6, uw:27.58, sam:2.0 }, May: { n:5358, wasting:10.1, stunting:28.69, uw:23.57, sam:1.8 }, Jun: { n:5321, wasting:9.6, stunting:30.28, uw:24.19, sam:1.7 }, Jul: { n:5404, wasting:14.1, stunting:30.79, uw:28.03, sam:3.3 } },
    'KORUKONDA': { Feb: { n:7444, wasting:6.5, stunting:41.94, uw:21.87, sam:0.9 }, Mar: { n:7387, wasting:6.3, stunting:39.47, uw:20.2, sam:0.9 }, Apr: { n:7235, wasting:7.7, stunting:36.35, uw:20.8, sam:1.1 }, May: { n:7300, wasting:7.9, stunting:30.99, uw:20.04, sam:1.3 }, Jun: { n:7297, wasting:8.7, stunting:31.53, uw:20.35, sam:1.6 }, Jul: { n:7336, wasting:8.1, stunting:34.27, uw:22.21, sam:1.5 } },
    'MALKANGIRI': { Feb: { n:11213, wasting:7.5, stunting:37.74, uw:24.32, sam:1.4 }, Mar: { n:11223, wasting:7.9, stunting:37.26, uw:23.73, sam:1.4 }, Apr: { n:11047, wasting:11.1, stunting:33.19, uw:26.85, sam:1.7 }, May: { n:11058, wasting:10.4, stunting:27.36, uw:23.07, sam:1.3 }, Jun: { n:11109, wasting:6.8, stunting:26.87, uw:19.96, sam:0.8 }, Jul: { n:11196, wasting:8.8, stunting:24.82, uw:20.89, sam:1.2 } },
    'MATHILI': { Feb: { n:9108, wasting:5.5, stunting:43.98, uw:24.46, sam:1.2 }, Mar: { n:9110, wasting:6.6, stunting:37.8, uw:23.42, sam:1.4 }, Apr: { n:9081, wasting:6.2, stunting:33.41, uw:21.07, sam:1.1 }, May: { n:9085, wasting:6.1, stunting:24.61, uw:17.74, sam:0.9 }, Jun: { n:9034, wasting:7.2, stunting:22.55, uw:16.86, sam:1.1 }, Jul: { n:9113, wasting:9.0, stunting:22.75, uw:19.68, sam:1.7 } },
    'PODIA': { Feb: { n:3351, wasting:7.9, stunting:44.7, uw:29.75, sam:1.2 }, Mar: { n:3349, wasting:6.9, stunting:46.52, uw:30.76, sam:1.2 }, Apr: { n:3330, wasting:11.5, stunting:38.77, uw:33.12, sam:1.6 }, May: { n:3337, wasting:10.9, stunting:38.48, uw:32.75, sam:1.9 }, Jun: { n:3341, wasting:10.0, stunting:31.61, uw:27.63, sam:1.3 }, Jul: { n:3358, wasting:9.9, stunting:31.77, uw:27.49, sam:1.0 } },
  },
  'Mayurbhanj': {
    'BETNOTI': { Feb: { n:9302, wasting:6.3, stunting:32.85, uw:19.77, sam:1.0 }, Mar: { n:9201, wasting:6.4, stunting:29.76, uw:19.05, sam:1.0 }, Apr: { n:9119, wasting:6.9, stunting:27.02, uw:18.72, sam:1.1 }, May: { n:9078, wasting:6.4, stunting:26.93, uw:18.48, sam:0.8 }, Jun: { n:9035, wasting:5.4, stunting:25.29, uw:17.34, sam:0.8 }, Jul: { n:8954, wasting:5.7, stunting:28.7, uw:20.08, sam:0.8 } },
    'BIJATALA': { Feb: { n:4668, wasting:6.3, stunting:33.63, uw:19.02, sam:0.6 }, Mar: { n:4573, wasting:7.0, stunting:29.65, uw:19.57, sam:1.2 }, Apr: { n:4618, wasting:6.9, stunting:28.22, uw:19.36, sam:1.0 }, May: { n:4562, wasting:6.7, stunting:26.83, uw:19.14, sam:0.8 }, Jun: { n:4486, wasting:6.8, stunting:27.62, uw:19.93, sam:0.5 }, Jul: { n:4439, wasting:6.9, stunting:31.45, uw:24.04, sam:0.8 } },
    'Badsahi': { Feb: { n:8550, wasting:1.5, stunting:14.02, uw:6.77, sam:0.3 }, Mar: { n:8470, wasting:1.8, stunting:11.52, uw:5.75, sam:0.3 }, Apr: { n:8433, wasting:1.1, stunting:8.56, uw:4.36, sam:0.2 }, May: { n:8404, wasting:1.2, stunting:9.55, uw:5.03, sam:0.2 }, Jun: { n:8403, wasting:1.5, stunting:8.62, uw:4.99, sam:0.3 }, Jul: { n:8375, wasting:7.8, stunting:19.31, uw:16.96, sam:1.6 } },
    'Bahalda': { Feb: { n:5062, wasting:5.5, stunting:39.27, uw:24.14, sam:0.7 }, Mar: { n:5038, wasting:6.0, stunting:31.94, uw:21.38, sam:0.8 }, Apr: { n:5021, wasting:5.5, stunting:32.72, uw:21.63, sam:0.7 }, May: { n:5022, wasting:5.6, stunting:33.09, uw:21.86, sam:0.7 }, Jun: { n:5036, wasting:6.0, stunting:29.92, uw:21.8, sam:0.8 }, Jul: { n:5068, wasting:8.1, stunting:30.8, uw:25.08, sam:1.2 } },
    'Bangriposi': { Feb: { n:6385, wasting:3.0, stunting:21.66, uw:12.84, sam:0.3 }, Mar: { n:6327, wasting:3.1, stunting:15.81, uw:10.84, sam:0.5 }, Apr: { n:6246, wasting:3.1, stunting:14.19, uw:9.75, sam:0.5 }, May: { n:6135, wasting:2.4, stunting:11.62, uw:9.19, sam:0.4 }, Jun: { n:6285, wasting:2.1, stunting:8.75, uw:7.86, sam:0.3 }, Jul: { n:6253, wasting:1.8, stunting:13.35, uw:11.07, sam:0.3 } },
    'Baripada': { Feb: { n:8631, wasting:2.4, stunting:20.3, uw:10.21, sam:0.7 }, Mar: { n:8563, wasting:2.7, stunting:18.37, uw:10.39, sam:0.8 }, Apr: { n:8511, wasting:2.8, stunting:15.53, uw:9.59, sam:0.8 }, May: { n:8397, wasting:2.3, stunting:15.35, uw:9.78, sam:0.5 }, Jun: { n:8355, wasting:2.5, stunting:14.89, uw:10.76, sam:0.6 }, Jul: { n:8224, wasting:4.3, stunting:16.55, uw:13.3, sam:0.8 } },
    'Bisoi': { Feb: { n:5017, wasting:5.0, stunting:38.53, uw:22.98, sam:0.5 }, Mar: { n:4967, wasting:5.9, stunting:36.38, uw:23.09, sam:0.7 }, Apr: { n:4928, wasting:5.7, stunting:33.24, uw:22.02, sam:0.6 }, May: { n:4897, wasting:5.0, stunting:30.65, uw:21.24, sam:0.4 }, Jun: { n:4870, wasting:4.3, stunting:22.73, uw:18.17, sam:0.3 }, Jul: { n:4854, wasting:4.4, stunting:25.07, uw:19.72, sam:0.4 } },
    'G.B.NAGAR': { Feb: { n:4048, wasting:6.8, stunting:34.44, uw:19.94, sam:1.0 }, Mar: { n:4010, wasting:8.6, stunting:30.97, uw:19.8, sam:1.1 }, Apr: { n:3988, wasting:7.6, stunting:27.63, uw:18.98, sam:1.0 }, May: { n:3969, wasting:6.4, stunting:28.97, uw:17.11, sam:0.6 }, Jun: { n:4006, wasting:6.7, stunting:26.83, uw:17.0, sam:0.6 }, Jul: { n:4011, wasting:6.8, stunting:25.41, uw:18.18, sam:0.8 } },
    'JAMDA': { Feb: { n:4163, wasting:8.1, stunting:43.74, uw:26.16, sam:1.0 }, Mar: { n:4136, wasting:9.8, stunting:40.81, uw:26.31, sam:1.1 }, Apr: { n:4135, wasting:10.7, stunting:39.27, uw:26.96, sam:1.0 }, May: { n:4107, wasting:11.4, stunting:37.91, uw:27.73, sam:0.6 }, Jun: { n:4116, wasting:11.0, stunting:33.87, uw:27.07, sam:0.8 }, Jul: { n:4124, wasting:10.4, stunting:37.58, uw:28.06, sam:0.9 } },
    'JASHIPUR': { Feb: { n:7240, wasting:7.5, stunting:44.01, uw:28.73, sam:1.3 }, Mar: { n:7191, wasting:8.1, stunting:43.14, uw:30.18, sam:1.2 }, Apr: { n:6990, wasting:8.6, stunting:40.94, uw:29.38, sam:1.3 }, May: { n:7073, wasting:8.2, stunting:40.34, uw:29.55, sam:0.5 }, Jun: { n:7109, wasting:8.9, stunting:37.9, uw:29.09, sam:1.0 }, Jul: { n:7146, wasting:9.9, stunting:37.39, uw:30.37, sam:0.9 } },
    'KULIANA': { Feb: { n:6274, wasting:4.9, stunting:44.31, uw:28.5, sam:0.7 }, Mar: { n:6164, wasting:5.3, stunting:38.82, uw:26.65, sam:0.6 }, Apr: { n:6132, wasting:4.8, stunting:36.4, uw:25.16, sam:0.3 }, May: { n:6083, wasting:4.5, stunting:36.33, uw:25.37, sam:0.5 }, Jun: { n:6051, wasting:4.2, stunting:29.5, uw:22.71, sam:0.5 }, Jul: { n:6009, wasting:5.9, stunting:32.0, uw:25.64, sam:0.5 } },
    'Kaptipada': { Feb: { n:10615, wasting:5.0, stunting:32.11, uw:18.42, sam:0.4 }, Mar: { n:10722, wasting:4.6, stunting:20.56, uw:12.37, sam:0.5 }, Apr: { n:11151, wasting:4.4, stunting:20.81, uw:13.07, sam:0.4 }, May: { n:11187, wasting:4.7, stunting:19.65, uw:14.17, sam:0.5 }, Jun: { n:11198, wasting:4.4, stunting:17.81, uw:14.05, sam:0.7 }, Jul: { n:11160, wasting:6.1, stunting:21.53, uw:16.85, sam:1.0 } },
    'Karanjia': { Feb: { n:6904, wasting:7.6, stunting:39.82, uw:25.52, sam:0.9 }, Mar: { n:6695, wasting:7.7, stunting:37.45, uw:25.26, sam:1.2 }, Apr: { n:6773, wasting:8.1, stunting:36.63, uw:25.06, sam:1.3 }, May: { n:6702, wasting:7.7, stunting:36.09, uw:25.77, sam:0.7 }, Jun: { n:6787, wasting:8.1, stunting:35.3, uw:26.43, sam:0.9 }, Jul: { n:6599, wasting:8.3, stunting:38.84, uw:27.93, sam:0.8 } },
    'Khunta': { Feb: { n:4415, wasting:6.9, stunting:27.68, uw:17.78, sam:1.1 }, Mar: { n:4386, wasting:7.0, stunting:25.03, uw:17.21, sam:1.1 }, Apr: { n:4409, wasting:6.8, stunting:23.45, uw:16.78, sam:1.1 }, May: { n:4398, wasting:7.0, stunting:18.42, uw:16.37, sam:0.8 }, Jun: { n:4404, wasting:6.7, stunting:14.74, uw:16.33, sam:0.7 }, Jul: { n:4398, wasting:8.4, stunting:20.9, uw:20.46, sam:0.8 } },
    'Kusumi': { Feb: { n:6177, wasting:5.6, stunting:36.91, uw:22.37, sam:0.5 }, Mar: { n:6125, wasting:6.0, stunting:32.96, uw:21.68, sam:0.5 }, Apr: { n:6085, wasting:5.7, stunting:33.33, uw:21.36, sam:0.7 }, May: { n:6052, wasting:5.5, stunting:32.77, uw:21.41, sam:0.2 }, Jun: { n:6065, wasting:6.3, stunting:26.05, uw:19.27, sam:0.3 }, Jul: { n:6081, wasting:6.0, stunting:29.55, uw:21.07, sam:0.4 } },
    'Morada': { Feb: { n:6249, wasting:5.2, stunting:33.62, uw:24.98, sam:0.5 }, Mar: { n:6152, wasting:5.9, stunting:31.39, uw:25.0, sam:0.7 }, Apr: { n:6050, wasting:5.9, stunting:30.2, uw:25.31, sam:0.5 }, May: { n:6039, wasting:6.3, stunting:26.43, uw:25.88, sam:0.5 }, Jun: { n:5965, wasting:6.6, stunting:24.84, uw:25.11, sam:0.6 }, Jul: { n:5973, wasting:8.7, stunting:27.91, uw:28.78, sam:0.7 } },
    'RARUAN': { Feb: { n:4671, wasting:4.7, stunting:37.21, uw:22.2, sam:0.7 }, Mar: { n:4668, wasting:4.3, stunting:34.92, uw:20.65, sam:0.7 }, Apr: { n:4623, wasting:4.1, stunting:31.15, uw:20.18, sam:0.6 }, May: { n:4611, wasting:4.3, stunting:32.81, uw:20.28, sam:0.5 }, Jun: { n:4593, wasting:5.4, stunting:33.27, uw:21.6, sam:0.7 }, Jul: { n:4587, wasting:5.8, stunting:33.73, uw:23.81, sam:0.5 } },
    'Rairangpur': { Feb: { n:4793, wasting:5.2, stunting:40.45, uw:22.93, sam:0.7 }, Mar: { n:4706, wasting:8.2, stunting:32.55, uw:23.29, sam:1.1 }, Apr: { n:4674, wasting:8.1, stunting:32.11, uw:23.34, sam:1.0 }, May: { n:4625, wasting:7.7, stunting:33.77, uw:24.78, sam:0.6 }, Jun: { n:4609, wasting:8.4, stunting:35.19, uw:25.99, sam:0.7 }, Jul: { n:4578, wasting:5.7, stunting:34.14, uw:24.73, sam:0.3 } },
    'Rasgobindpur': { Feb: { n:6261, wasting:3.7, stunting:18.77, uw:11.79, sam:0.1 }, Mar: { n:6233, wasting:4.3, stunting:18.24, uw:12.67, sam:0.2 }, Apr: { n:6201, wasting:4.2, stunting:17.3, uw:12.09, sam:0.1 }, May: { n:6169, wasting:4.2, stunting:16.68, uw:12.63, sam:0.2 }, Jun: { n:6046, wasting:4.8, stunting:15.07, uw:13.23, sam:0.3 }, Jul: { n:5985, wasting:6.4, stunting:17.46, uw:18.43, sam:0.6 } },
    'SHAMAKHUNTA': { Feb: { n:4681, wasting:4.1, stunting:38.62, uw:22.39, sam:0.3 }, Mar: { n:4577, wasting:5.1, stunting:34.91, uw:21.91, sam:0.8 }, Apr: { n:4529, wasting:5.0, stunting:31.4, uw:20.69, sam:0.6 }, May: { n:4524, wasting:4.5, stunting:33.11, uw:21.13, sam:0.5 }, Jun: { n:4472, wasting:4.8, stunting:30.81, uw:20.71, sam:0.5 }, Jul: { n:4420, wasting:5.0, stunting:29.66, uw:21.04, sam:0.7 } },
    'SULIAPADA': { Feb: { n:5904, wasting:4.7, stunting:37.82, uw:21.73, sam:0.9 }, Mar: { n:5803, wasting:4.8, stunting:33.55, uw:20.16, sam:1.0 }, Apr: { n:5742, wasting:4.4, stunting:31.4, uw:19.7, sam:1.0 }, May: { n:5582, wasting:4.2, stunting:31.91, uw:20.3, sam:0.7 }, Jun: { n:5598, wasting:4.2, stunting:31.33, uw:20.22, sam:0.8 }, Jul: { n:5612, wasting:4.6, stunting:31.52, uw:22.36, sam:0.8 } },
    'Saraskana': { Feb: { n:6172, wasting:4.1, stunting:32.31, uw:19.78, sam:0.3 }, Mar: { n:6129, wasting:4.0, stunting:28.47, uw:18.53, sam:0.4 }, Apr: { n:6132, wasting:4.4, stunting:28.88, uw:18.79, sam:0.5 }, May: { n:6037, wasting:3.9, stunting:28.84, uw:18.22, sam:0.4 }, Jun: { n:6022, wasting:4.2, stunting:26.87, uw:19.33, sam:0.4 }, Jul: { n:5996, wasting:5.1, stunting:27.9, uw:22.35, sam:0.7 } },
    'Sukruli': { Feb: { n:4144, wasting:9.5, stunting:44.64, uw:33.61, sam:0.4 }, Mar: { n:4109, wasting:9.9, stunting:43.2, uw:34.14, sam:0.6 }, Apr: { n:4091, wasting:9.7, stunting:40.11, uw:32.9, sam:0.5 }, May: { n:4094, wasting:9.6, stunting:40.55, uw:32.88, sam:0.3 }, Jun: { n:4116, wasting:10.4, stunting:36.71, uw:32.09, sam:0.4 }, Jul: { n:4126, wasting:10.7, stunting:37.62, uw:34.44, sam:0.4 } },
    'TIRING': { Feb: { n:3330, wasting:8.9, stunting:35.44, uw:28.11, sam:1.2 }, Mar: { n:3316, wasting:9.4, stunting:32.15, uw:26.27, sam:1.5 }, Apr: { n:3324, wasting:8.2, stunting:31.2, uw:25.9, sam:1.2 }, May: { n:3327, wasting:8.5, stunting:31.38, uw:25.88, sam:0.9 }, Jun: { n:3332, wasting:8.9, stunting:31.42, uw:26.98, sam:1.1 }, Jul: { n:3329, wasting:8.3, stunting:34.82, uw:28.66, sam:1.0 } },
    'Thakurmunda': { Feb: { n:8675, wasting:7.2, stunting:48.31, uw:29.2, sam:0.9 }, Mar: { n:8332, wasting:8.2, stunting:42.88, uw:28.05, sam:0.9 }, Apr: { n:8292, wasting:8.3, stunting:42.26, uw:27.76, sam:1.0 }, May: { n:8326, wasting:8.3, stunting:42.23, uw:23.79, sam:0.6 }, Jun: { n:8215, wasting:9.3, stunting:40.07, uw:27.23, sam:0.5 }, Jul: { n:8283, wasting:9.1, stunting:40.54, uw:28.37, sam:0.5 } },
    'UDALA': { Feb: { n:4874, wasting:4.9, stunting:46.84, uw:26.88, sam:0.8 }, Mar: { n:4819, wasting:5.2, stunting:39.59, uw:24.92, sam:0.7 }, Apr: { n:4739, wasting:5.9, stunting:37.6, uw:23.91, sam:0.8 }, May: { n:4573, wasting:5.6, stunting:34.57, uw:22.92, sam:0.7 }, Jun: { n:4761, wasting:6.7, stunting:20.39, uw:18.8, sam:1.2 }, Jul: { n:4777, wasting:6.2, stunting:20.03, uw:17.08, sam:0.6 } },
  },
  'Nabarangpur': {
    'CHANDAHANDI': { Feb: { n:6650, wasting:4.4, stunting:25.79, uw:16.36, sam:0.7 }, Mar: { n:6628, wasting:5.4, stunting:25.32, uw:15.68, sam:0.4 }, Apr: { n:6538, wasting:5.2, stunting:27.09, uw:16.86, sam:0.5 }, May: { n:6555, wasting:5.4, stunting:24.67, uw:15.24, sam:0.6 }, Jun: { n:6578, wasting:5.0, stunting:24.93, uw:15.76, sam:0.3 }, Jul: { n:6611, wasting:5.6, stunting:22.8, uw:17.5, sam:0.3 } },
    'DABUGAM': { Feb: { n:6269, wasting:5.5, stunting:33.91, uw:21.95, sam:0.7 }, Mar: { n:6251, wasting:4.7, stunting:25.92, uw:17.97, sam:0.6 }, Apr: { n:6133, wasting:4.7, stunting:19.81, uw:16.5, sam:0.6 }, May: { n:6166, wasting:3.5, stunting:13.02, uw:11.74, sam:0.3 }, Jun: { n:6226, wasting:2.2, stunting:10.13, uw:8.67, sam:0.1 }, Jul: { n:6252, wasting:1.9, stunting:9.42, uw:7.49, sam:0.2 } },
    'JHARIGAM': { Feb: { n:15369, wasting:5.6, stunting:40.93, uw:27.72, sam:0.5 }, Mar: { n:15305, wasting:5.7, stunting:37.35, uw:26.34, sam:0.5 }, Apr: { n:15116, wasting:6.2, stunting:29.91, uw:21.34, sam:0.5 }, May: { n:15117, wasting:5.3, stunting:19.37, uw:14.45, sam:0.4 }, Jun: { n:15146, wasting:4.7, stunting:16.35, uw:11.76, sam:0.4 }, Jul: { n:15233, wasting:4.1, stunting:17.74, uw:12.06, sam:0.3 } },
    'KOSAGUMUNDA': { Feb: { n:15270, wasting:4.3, stunting:36.43, uw:21.45, sam:0.2 }, Mar: { n:15203, wasting:4.6, stunting:25.98, uw:17.34, sam:0.3 }, Apr: { n:15207, wasting:4.8, stunting:27.31, uw:17.96, sam:0.3 }, May: { n:15202, wasting:4.5, stunting:21.0, uw:15.14, sam:0.3 }, Jun: { n:15267, wasting:3.8, stunting:21.0, uw:14.33, sam:0.2 }, Jul: { n:15405, wasting:3.9, stunting:21.25, uw:14.87, sam:0.3 } },
    'NABARANGPUR': { Feb: { n:8535, wasting:5.8, stunting:41.71, uw:24.37, sam:0.7 }, Mar: { n:8504, wasting:5.7, stunting:32.56, uw:21.45, sam:0.7 }, Apr: { n:8192, wasting:7.0, stunting:28.69, uw:21.78, sam:0.9 }, May: { n:8279, wasting:7.2, stunting:25.69, uw:20.7, sam:0.9 }, Jun: { n:8286, wasting:6.8, stunting:24.56, uw:20.17, sam:0.9 }, Jul: { n:8243, wasting:4.0, stunting:23.27, uw:18.57, sam:0.5 } },
    'NANDAHANDI': { Feb: { n:5542, wasting:3.8, stunting:30.22, uw:17.94, sam:0.3 }, Mar: { n:5545, wasting:3.2, stunting:22.16, uw:15.06, sam:0.3 }, Apr: { n:5437, wasting:5.1, stunting:25.34, uw:21.3, sam:0.4 }, May: { n:5484, wasting:5.2, stunting:23.03, uw:18.89, sam:0.4 }, Jun: { n:5500, wasting:4.0, stunting:21.93, uw:18.33, sam:0.4 }, Jul: { n:5530, wasting:3.8, stunting:21.12, uw:18.26, sam:0.2 } },
    'PAPADAHANDI': { Feb: { n:13485, wasting:3.8, stunting:42.54, uw:24.51, sam:0.2 }, Mar: { n:13461, wasting:3.8, stunting:35.41, uw:22.06, sam:0.3 }, Apr: { n:13354, wasting:5.6, stunting:33.2, uw:23.32, sam:0.6 }, May: { n:13383, wasting:5.8, stunting:31.24, uw:22.1, sam:0.6 }, Jun: { n:13233, wasting:5.3, stunting:28.75, uw:21.28, sam:0.6 }, Jul: { n:13315, wasting:4.3, stunting:28.79, uw:21.25, sam:0.4 } },
    'RAIGHAR': { Feb: { n:16821, wasting:3.2, stunting:28.6, uw:16.35, sam:0.5 }, Mar: { n:16725, wasting:2.9, stunting:20.6, uw:13.14, sam:0.3 }, Apr: { n:16618, wasting:3.1, stunting:22.19, uw:14.23, sam:0.3 }, May: { n:16511, wasting:3.4, stunting:19.31, uw:12.72, sam:0.3 }, Jun: { n:16363, wasting:3.4, stunting:18.17, uw:12.22, sam:0.2 }, Jul: { n:16384, wasting:3.6, stunting:20.94, uw:14.67, sam:0.3 } },
    'TENTULIKHUNTI': { Feb: { n:7467, wasting:2.3, stunting:28.79, uw:13.16, sam:0.3 }, Mar: { n:7447, wasting:2.0, stunting:22.32, uw:9.91, sam:0.2 }, Apr: { n:7402, wasting:2.5, stunting:25.86, uw:11.98, sam:0.4 }, May: { n:7351, wasting:2.3, stunting:20.79, uw:10.3, sam:0.2 }, Jun: { n:7418, wasting:2.3, stunting:19.76, uw:9.95, sam:0.2 }, Jul: { n:7404, wasting:2.6, stunting:22.06, uw:12.25, sam:0.3 } },
    'UMERKOTE': { Feb: { n:18224, wasting:2.4, stunting:27.27, uw:16.67, sam:0.2 }, Mar: { n:18136, wasting:2.2, stunting:19.86, uw:13.13, sam:0.2 }, Apr: { n:18112, wasting:3.0, stunting:21.81, uw:14.38, sam:0.4 }, May: { n:18173, wasting:2.9, stunting:18.54, uw:12.96, sam:0.3 }, Jun: { n:18103, wasting:2.9, stunting:17.14, uw:12.29, sam:0.2 }, Jul: { n:18092, wasting:3.8, stunting:20.74, uw:15.55, sam:0.3 } },
  },
  'Nayagarh': {
    'BHAPUR': { Feb: { n:5435, wasting:2.1, stunting:26.09, uw:8.3, sam:0.2 }, Mar: { n:5432, wasting:2.2, stunting:25.77, uw:8.63, sam:0.3 }, Apr: { n:5371, wasting:2.3, stunting:27.43, uw:9.07, sam:0.4 }, May: { n:5333, wasting:2.4, stunting:26.93, uw:8.44, sam:0.4 }, Jun: { n:5322, wasting:2.5, stunting:27.87, uw:8.87, sam:0.4 }, Jul: { n:5282, wasting:3.4, stunting:17.99, uw:8.52, sam:0.7 } },
    'DASPALLA': { Feb: { n:6064, wasting:0.8, stunting:36.21, uw:12.85, sam:0.1 }, Mar: { n:6033, wasting:0.3, stunting:35.06, uw:11.17, sam:0.0 }, Apr: { n:5845, wasting:1.2, stunting:35.95, uw:11.14, sam:0.3 }, May: { n:5858, wasting:0.4, stunting:34.94, uw:10.79, sam:0.1 }, Jun: { n:5848, wasting:1.1, stunting:36.44, uw:11.34, sam:0.2 }, Jul: { n:5867, wasting:0.6, stunting:31.06, uw:9.9, sam:0.1 } },
    'GANIA': { Feb: { n:2054, wasting:2.5, stunting:28.43, uw:10.13, sam:0.6 }, Mar: { n:2026, wasting:2.8, stunting:25.77, uw:9.58, sam:0.6 }, Apr: { n:2009, wasting:2.5, stunting:28.32, uw:10.05, sam:0.4 }, May: { n:2014, wasting:3.2, stunting:25.17, uw:9.83, sam:0.5 }, Jun: { n:1992, wasting:3.5, stunting:22.54, uw:8.99, sam:0.6 }, Jul: { n:1979, wasting:4.6, stunting:18.34, uw:10.61, sam:0.9 } },
    'KHANDAPARA': { Feb: { n:5868, wasting:2.8, stunting:29.06, uw:11.26, sam:0.4 }, Mar: { n:5849, wasting:3.4, stunting:26.86, uw:10.45, sam:0.6 }, Apr: { n:5809, wasting:3.6, stunting:21.31, uw:9.95, sam:0.5 }, May: { n:5767, wasting:3.5, stunting:18.38, uw:9.33, sam:0.5 }, Jun: { n:5745, wasting:3.4, stunting:19.23, uw:9.73, sam:0.5 }, Jul: { n:5706, wasting:3.6, stunting:17.21, uw:10.27, sam:0.6 } },
    'NAYAGARH': { Feb: { n:8542, wasting:2.1, stunting:22.66, uw:7.29, sam:0.4 }, Mar: { n:8526, wasting:2.1, stunting:21.89, uw:7.31, sam:0.3 }, Apr: { n:8403, wasting:2.2, stunting:23.43, uw:7.34, sam:0.5 }, May: { n:8371, wasting:1.9, stunting:23.06, uw:6.75, sam:0.3 }, Jun: { n:8315, wasting:2.2, stunting:21.65, uw:7.06, sam:0.5 }, Jul: { n:8223, wasting:2.5, stunting:18.48, uw:6.87, sam:0.2 } },
    'NUAGAON': { Feb: { n:4908, wasting:3.6, stunting:26.43, uw:10.96, sam:0.6 }, Mar: { n:4911, wasting:3.5, stunting:26.96, uw:10.95, sam:0.5 }, Apr: { n:4823, wasting:4.0, stunting:22.75, uw:9.77, sam:0.6 }, May: { n:4807, wasting:3.9, stunting:21.64, uw:8.92, sam:0.6 }, Jun: { n:4791, wasting:4.2, stunting:18.72, uw:8.95, sam:0.8 }, Jul: { n:4774, wasting:3.1, stunting:16.3, uw:8.32, sam:0.6 } },
    'ODAGAON': { Feb: { n:8815, wasting:2.2, stunting:30.97, uw:9.42, sam:0.4 }, Mar: { n:8759, wasting:2.7, stunting:24.74, uw:8.7, sam:0.4 }, Apr: { n:8613, wasting:3.1, stunting:22.51, uw:8.67, sam:0.5 }, May: { n:8630, wasting:2.7, stunting:22.18, uw:7.83, sam:0.4 }, Jun: { n:8554, wasting:2.9, stunting:21.35, uw:8.09, sam:0.5 }, Jul: { n:8408, wasting:3.8, stunting:15.95, uw:8.19, sam:0.6 } },
    'RANAPUR': { Feb: { n:9212, wasting:1.5, stunting:22.64, uw:6.59, sam:0.3 }, Mar: { n:9183, wasting:1.3, stunting:21.59, uw:6.25, sam:0.3 }, Apr: { n:8996, wasting:1.5, stunting:20.65, uw:6.2, sam:0.2 }, May: { n:8981, wasting:1.5, stunting:19.74, uw:6.35, sam:0.3 }, Jun: { n:8957, wasting:1.4, stunting:19.98, uw:6.06, sam:0.3 }, Jul: { n:8891, wasting:2.5, stunting:13.24, uw:5.72, sam:0.6 } },
  },
  'Nuapada': {
    'Boden': { Feb: { n:6528, wasting:2.0, stunting:27.83, uw:8.72, sam:0.4 }, Mar: { n:6489, wasting:1.9, stunting:26.68, uw:8.46, sam:0.2 }, Apr: { n:6466, wasting:2.4, stunting:26.82, uw:9.0, sam:0.4 }, May: { n:6503, wasting:2.0, stunting:27.34, uw:8.67, sam:0.3 }, Jun: { n:6652, wasting:1.9, stunting:10.36, uw:4.95, sam:0.4 }, Jul: { n:6919, wasting:1.4, stunting:8.77, uw:4.78, sam:0.3 } },
    'KHARIAR': { Feb: { n:9055, wasting:2.6, stunting:29.63, uw:12.42, sam:0.4 }, Mar: { n:9047, wasting:1.8, stunting:26.32, uw:11.57, sam:0.3 }, Apr: { n:8999, wasting:2.0, stunting:30.05, uw:12.62, sam:0.4 }, May: { n:8979, wasting:2.3, stunting:28.13, uw:11.79, sam:0.5 }, Jun: { n:9122, wasting:1.7, stunting:27.55, uw:11.63, sam:0.2 }, Jul: { n:9259, wasting:2.0, stunting:19.78, uw:10.96, sam:0.3 } },
    'KOMNA': { Feb: { n:10519, wasting:1.8, stunting:29.66, uw:11.74, sam:0.1 }, Mar: { n:10465, wasting:1.1, stunting:26.04, uw:9.59, sam:0.1 }, Apr: { n:10374, wasting:1.1, stunting:31.95, uw:12.19, sam:0.1 }, May: { n:10438, wasting:1.1, stunting:28.47, uw:10.9, sam:0.1 }, Jun: { n:10719, wasting:1.0, stunting:10.66, uw:5.87, sam:0.1 }, Jul: { n:10891, wasting:1.1, stunting:5.28, uw:4.86, sam:0.1 } },
    'Nuapada': { Feb: { n:11574, wasting:3.6, stunting:31.62, uw:14.18, sam:0.2 }, Mar: { n:11503, wasting:3.3, stunting:32.6, uw:13.92, sam:0.2 }, Apr: { n:11513, wasting:3.6, stunting:35.62, uw:15.22, sam:0.2 }, May: { n:11679, wasting:4.1, stunting:30.63, uw:14.4, sam:0.2 }, Jun: { n:12223, wasting:4.1, stunting:29.94, uw:14.28, sam:0.1 }, Jul: { n:12490, wasting:4.3, stunting:23.67, uw:13.53, sam:0.2 } },
    'Sinapali': { Feb: { n:8696, wasting:2.0, stunting:21.38, uw:8.18, sam:0.5 }, Mar: { n:8632, wasting:1.5, stunting:17.86, uw:6.93, sam:0.1 }, Apr: { n:8595, wasting:1.7, stunting:21.11, uw:8.47, sam:0.2 }, May: { n:8651, wasting:1.6, stunting:20.19, uw:7.56, sam:0.3 }, Jun: { n:8712, wasting:1.6, stunting:15.7, uw:6.32, sam:0.4 }, Jul: { n:8766, wasting:1.8, stunting:8.52, uw:5.38, sam:0.3 } },
  },
  'Puri': {
    'ASTARANGA': { Feb: { n:3746, wasting:0.5, stunting:9.0, uw:3.18, sam:0.1 }, Mar: { n:3742, wasting:0.7, stunting:4.92, uw:2.16, sam:0.1 }, Apr: { n:3728, wasting:0.6, stunting:5.61, uw:1.88, sam:0.0 }, May: { n:3695, wasting:0.6, stunting:2.06, uw:1.73, sam:0.1 }, Jun: { n:3708, wasting:0.4, stunting:2.0, uw:1.73, sam:0.0 }, Jul: { n:3694, wasting:0.6, stunting:2.84, uw:1.71, sam:0.0 } },
    'BRAHMGIRI': { Feb: { n:7526, wasting:0.5, stunting:7.92, uw:3.03, sam:0.1 }, Mar: { n:7529, wasting:0.4, stunting:4.85, uw:1.99, sam:0.1 }, Apr: { n:7307, wasting:0.5, stunting:6.05, uw:2.26, sam:0.1 }, May: { n:7098, wasting:0.4, stunting:3.3, uw:1.44, sam:0.1 }, Jun: { n:7116, wasting:0.4, stunting:2.63, uw:1.24, sam:0.0 }, Jul: { n:7151, wasting:0.5, stunting:4.39, uw:2.2, sam:0.1 } },
    'DELANGA': { Feb: { n:6313, wasting:1.2, stunting:14.87, uw:6.43, sam:0.1 }, Mar: { n:6308, wasting:0.5, stunting:14.11, uw:5.15, sam:0.1 }, Apr: { n:6246, wasting:0.7, stunting:14.95, uw:5.38, sam:0.1 }, May: { n:6195, wasting:0.9, stunting:6.8, uw:4.36, sam:0.2 }, Jun: { n:6098, wasting:0.9, stunting:6.71, uw:3.85, sam:0.1 }, Jul: { n:6115, wasting:1.2, stunting:9.34, uw:4.89, sam:0.1 } },
    'GOP': { Feb: { n:8576, wasting:0.4, stunting:13.71, uw:3.0, sam:0.0 }, Mar: { n:8497, wasting:0.5, stunting:8.13, uw:1.92, sam:0.1 }, Apr: { n:8428, wasting:0.5, stunting:8.52, uw:1.82, sam:0.1 }, May: { n:8400, wasting:0.5, stunting:3.77, uw:1.42, sam:0.1 }, Jun: { n:8365, wasting:0.6, stunting:3.13, uw:1.42, sam:0.1 }, Jul: { n:8274, wasting:0.6, stunting:4.91, uw:1.81, sam:0.1 } },
    'KAKATPUR': { Feb: { n:5315, wasting:0.4, stunting:11.48, uw:3.57, sam:0.1 }, Mar: { n:5296, wasting:0.3, stunting:9.31, uw:2.36, sam:0.1 }, Apr: { n:5284, wasting:0.6, stunting:9.54, uw:2.38, sam:0.1 }, May: { n:5257, wasting:0.4, stunting:5.21, uw:2.15, sam:0.1 }, Jun: { n:5233, wasting:0.4, stunting:3.59, uw:2.01, sam:0.1 }, Jul: { n:5210, wasting:0.3, stunting:6.01, uw:2.38, sam:0.1 } },
    'KANAS': { Feb: { n:7999, wasting:0.8, stunting:12.91, uw:4.53, sam:0.1 }, Mar: { n:7965, wasting:0.9, stunting:13.04, uw:4.66, sam:0.1 }, Apr: { n:7872, wasting:0.8, stunting:12.87, uw:4.78, sam:0.1 }, May: { n:7813, wasting:0.8, stunting:11.88, uw:4.63, sam:0.1 }, Jun: { n:7703, wasting:0.8, stunting:11.53, uw:5.22, sam:0.1 }, Jul: { n:7710, wasting:1.0, stunting:11.61, uw:6.37, sam:0.1 } },
    'KRUSHNAPRASAD': { Feb: { n:5937, wasting:0.3, stunting:17.8, uw:5.24, sam:0.0 }, Mar: { n:5923, wasting:0.2, stunting:15.36, uw:4.46, sam:0.0 }, Apr: { n:5870, wasting:0.2, stunting:14.96, uw:4.21, sam:0.0 }, May: { n:5838, wasting:0.3, stunting:4.21, uw:2.83, sam:0.1 }, Jun: { n:5782, wasting:0.2, stunting:4.43, uw:2.42, sam:0.0 }, Jul: { n:5737, wasting:0.3, stunting:7.5, uw:3.03, sam:0.1 } },
    'NIMAPADA': { Feb: { n:10228, wasting:0.4, stunting:10.51, uw:2.48, sam:0.0 }, Mar: { n:10204, wasting:0.5, stunting:9.7, uw:2.6, sam:0.1 }, Apr: { n:10020, wasting:0.4, stunting:9.05, uw:2.27, sam:0.1 }, May: { n:9984, wasting:0.4, stunting:3.0, uw:1.5, sam:0.1 }, Jun: { n:9943, wasting:0.3, stunting:2.4, uw:1.23, sam:0.1 }, Jul: { n:9859, wasting:0.6, stunting:3.81, uw:1.72, sam:0.1 } },
    'PIPILI': { Feb: { n:8582, wasting:0.3, stunting:12.03, uw:3.52, sam:0.0 }, Mar: { n:8582, wasting:0.4, stunting:11.22, uw:3.19, sam:0.1 }, Apr: { n:8461, wasting:0.3, stunting:10.98, uw:3.01, sam:0.1 }, May: { n:8352, wasting:0.4, stunting:2.51, uw:2.31, sam:0.1 }, Jun: { n:8240, wasting:0.5, stunting:3.35, uw:2.63, sam:0.1 }, Jul: { n:8136, wasting:1.7, stunting:6.42, uw:4.82, sam:0.2 } },
    'PURI_MUNICIPALITY': { Feb: { n:6352, wasting:0.4, stunting:13.15, uw:2.6, sam:0.0 }, Mar: { n:6349, wasting:0.3, stunting:12.79, uw:2.6, sam:0.0 }, Apr: { n:6305, wasting:0.2, stunting:13.47, uw:2.17, sam:0.0 }, May: { n:6172, wasting:0.4, stunting:1.93, uw:1.31, sam:0.1 }, Jun: { n:5914, wasting:0.3, stunting:2.49, uw:1.01, sam:0.0 }, Jul: { n:5862, wasting:0.3, stunting:4.47, uw:1.69, sam:0.1 } },
    'PURI_SADAR': { Feb: { n:7811, wasting:0.3, stunting:12.84, uw:3.14, sam:0.1 }, Mar: { n:7812, wasting:0.4, stunting:12.66, uw:3.0, sam:0.1 }, Apr: { n:7666, wasting:0.3, stunting:13.71, uw:3.31, sam:0.1 }, May: { n:7591, wasting:0.6, stunting:8.8, uw:2.5, sam:0.2 }, Jun: { n:7515, wasting:0.9, stunting:6.2, uw:2.46, sam:0.3 }, Jul: { n:7482, wasting:0.9, stunting:6.47, uw:2.45, sam:0.2 } },
    'SATYABADI': { Feb: { n:5489, wasting:0.2, stunting:8.74, uw:2.66, sam:0.0 }, Mar: { n:5463, wasting:0.3, stunting:7.16, uw:2.27, sam:0.0 }, Apr: { n:5299, wasting:0.4, stunting:7.49, uw:2.26, sam:0.1 }, May: { n:5258, wasting:0.2, stunting:3.31, uw:1.45, sam:0.1 }, Jun: { n:5209, wasting:0.3, stunting:4.32, uw:1.92, sam:0.0 }, Jul: { n:5247, wasting:1.9, stunting:7.55, uw:5.09, sam:0.2 } },
  },
  'Rayagada': {
    'BISSAMCTTACK': { Feb: { n:8669, wasting:1.5, stunting:17.63, uw:5.35, sam:0.3 }, Mar: { n:8601, wasting:1.1, stunting:17.2, uw:4.95, sam:0.3 }, Apr: { n:8593, wasting:1.3, stunting:18.61, uw:6.23, sam:0.4 }, May: { n:8411, wasting:0.5, stunting:17.91, uw:5.24, sam:0.1 }, Jun: { n:8390, wasting:1.2, stunting:15.32, uw:5.66, sam:0.3 }, Jul: { n:8336, wasting:5.9, stunting:29.21, uw:18.28, sam:1.2 } },
    'CHANDRAPUR': { Feb: { n:4547, wasting:3.8, stunting:34.81, uw:12.87, sam:0.5 }, Mar: { n:4551, wasting:3.2, stunting:32.48, uw:12.46, sam:0.4 }, Apr: { n:4489, wasting:3.5, stunting:28.83, uw:11.9, sam:0.5 }, May: { n:4290, wasting:2.7, stunting:26.5, uw:10.56, sam:0.5 }, Jun: { n:4382, wasting:2.5, stunting:23.71, uw:9.38, sam:0.6 }, Jul: { n:4182, wasting:9.0, stunting:28.5, uw:19.39, sam:2.5 } },
    'GUDARI': { Feb: { n:4166, wasting:4.4, stunting:27.68, uw:12.19, sam:1.3 }, Mar: { n:4146, wasting:3.2, stunting:17.99, uw:7.98, sam:0.9 }, Apr: { n:4078, wasting:3.1, stunting:22.17, uw:9.86, sam:0.8 }, May: { n:4105, wasting:1.9, stunting:8.31, uw:3.12, sam:0.5 }, Jun: { n:4125, wasting:2.0, stunting:13.02, uw:5.21, sam:0.5 }, Jul: { n:4065, wasting:10.0, stunting:28.41, uw:20.96, sam:2.8 } },
    'GUNUPUR': { Feb: { n:6795, wasting:1.5, stunting:14.04, uw:4.68, sam:0.5 }, Mar: { n:6781, wasting:1.4, stunting:12.33, uw:3.92, sam:0.3 }, Apr: { n:6613, wasting:1.5, stunting:11.95, uw:4.31, sam:0.4 }, May: { n:6552, wasting:0.9, stunting:8.29, uw:2.23, sam:0.2 }, Jun: { n:6537, wasting:2.9, stunting:10.92, uw:5.34, sam:0.7 }, Jul: { n:6527, wasting:7.7, stunting:18.74, uw:14.69, sam:1.4 } },
    'K._SINGHPUR': { Feb: { n:5878, wasting:4.9, stunting:37.58, uw:16.32, sam:1.0 }, Mar: { n:5855, wasting:4.9, stunting:31.87, uw:15.0, sam:1.0 }, Apr: { n:5851, wasting:5.1, stunting:32.76, uw:15.79, sam:1.2 }, May: { n:5795, wasting:4.6, stunting:29.99, uw:13.46, sam:0.9 }, Jun: { n:5776, wasting:4.5, stunting:29.88, uw:13.63, sam:1.0 }, Jul: { n:5801, wasting:6.0, stunting:29.62, uw:17.29, sam:1.2 } },
    'KASIPUR': { Feb: { n:15631, wasting:3.0, stunting:34.98, uw:12.02, sam:0.8 }, Mar: { n:15453, wasting:2.8, stunting:33.97, uw:11.48, sam:0.8 }, Apr: { n:15169, wasting:2.9, stunting:37.81, uw:13.31, sam:1.0 }, May: { n:14872, wasting:3.0, stunting:35.1, uw:12.24, sam:1.0 }, Jun: { n:14686, wasting:3.4, stunting:34.45, uw:12.19, sam:1.3 }, Jul: { n:14496, wasting:3.8, stunting:31.84, uw:13.65, sam:0.9 } },
    'KOLNARA': { Feb: { n:5599, wasting:5.2, stunting:47.2, uw:26.68, sam:1.1 }, Mar: { n:5582, wasting:4.7, stunting:48.33, uw:26.73, sam:0.8 }, Apr: { n:5485, wasting:5.5, stunting:49.1, uw:28.48, sam:0.8 }, May: { n:5446, wasting:5.4, stunting:42.69, uw:25.14, sam:1.1 }, Jun: { n:5414, wasting:4.7, stunting:29.94, uw:18.66, sam:0.8 }, Jul: { n:5421, wasting:6.3, stunting:25.75, uw:19.94, sam:0.9 } },
    'Muniguda': { Feb: { n:9259, wasting:4.0, stunting:36.12, uw:15.62, sam:0.8 }, Mar: { n:9201, wasting:3.5, stunting:29.8, uw:13.63, sam:0.6 }, Apr: { n:9145, wasting:4.4, stunting:32.21, uw:15.81, sam:0.8 }, May: { n:9043, wasting:4.5, stunting:21.25, uw:11.81, sam:0.8 }, Jun: { n:9032, wasting:4.9, stunting:20.28, uw:10.68, sam:0.7 }, Jul: { n:9093, wasting:6.5, stunting:31.02, uw:18.51, sam:1.0 } },
    'PADMAPUR': { Feb: { n:4301, wasting:1.8, stunting:15.6, uw:6.28, sam:0.3 }, Mar: { n:4185, wasting:1.1, stunting:13.21, uw:4.83, sam:0.3 }, Apr: { n:4124, wasting:1.5, stunting:20.2, uw:8.37, sam:0.4 }, May: { n:4129, wasting:2.1, stunting:15.02, uw:6.03, sam:0.4 }, Jun: { n:4121, wasting:6.3, stunting:20.19, uw:13.61, sam:1.7 }, Jul: { n:4062, wasting:14.8, stunting:30.08, uw:30.72, sam:2.7 } },
    'RAMNAGUDA': { Feb: { n:3353, wasting:2.2, stunting:22.67, uw:11.33, sam:0.4 }, Mar: { n:3344, wasting:1.8, stunting:19.05, uw:8.61, sam:0.4 }, Apr: { n:3324, wasting:1.8, stunting:17.81, uw:8.45, sam:0.3 }, May: { n:3304, wasting:1.3, stunting:13.47, uw:6.08, sam:0.3 }, Jun: { n:3291, wasting:2.0, stunting:14.62, uw:7.57, sam:0.5 }, Jul: { n:3213, wasting:12.5, stunting:27.98, uw:26.67, sam:2.5 } },
    'Rayagada': { Feb: { n:12328, wasting:1.0, stunting:25.13, uw:8.0, sam:0.3 }, Mar: { n:12389, wasting:1.0, stunting:23.0, uw:6.74, sam:0.3 }, Apr: { n:12193, wasting:1.2, stunting:25.0, uw:7.88, sam:0.3 }, May: { n:12128, wasting:0.9, stunting:20.51, uw:6.33, sam:0.2 }, Jun: { n:12060, wasting:1.6, stunting:21.71, uw:7.15, sam:0.3 }, Jul: { n:11992, wasting:6.3, stunting:29.46, uw:19.2, sam:1.3 } },
  },
  'Sambalpur': {
    'Bamra': { Feb: { n:4995, wasting:4.5, stunting:34.81, uw:14.75, sam:1.2 }, Mar: { n:4973, wasting:5.0, stunting:32.42, uw:14.36, sam:1.1 }, Apr: { n:4915, wasting:5.0, stunting:24.39, uw:12.82, sam:1.3 }, May: { n:4923, wasting:4.9, stunting:22.83, uw:11.7, sam:1.0 }, Jun: { n:4914, wasting:4.9, stunting:23.91, uw:12.82, sam:1.1 }, Jul: { n:4872, wasting:4.7, stunting:19.29, uw:11.62, sam:0.7 } },
    'DHANKAUDA': { Feb: { n:7010, wasting:6.1, stunting:39.96, uw:19.47, sam:1.2 }, Mar: { n:6988, wasting:6.2, stunting:32.23, uw:17.5, sam:1.2 }, Apr: { n:6939, wasting:5.4, stunting:27.38, uw:15.91, sam:1.0 }, May: { n:6897, wasting:6.0, stunting:25.04, uw:15.28, sam:1.2 }, Jun: { n:6883, wasting:4.7, stunting:19.5, uw:13.66, sam:0.9 }, Jul: { n:6883, wasting:3.3, stunting:13.38, uw:9.73, sam:0.5 } },
    'JAMANKIRA': { Feb: { n:4930, wasting:7.0, stunting:40.14, uw:23.65, sam:1.3 }, Mar: { n:4898, wasting:7.3, stunting:37.87, uw:22.36, sam:1.4 }, Apr: { n:4836, wasting:8.3, stunting:33.4, uw:21.77, sam:1.5 }, May: { n:4779, wasting:8.3, stunting:30.8, uw:21.76, sam:1.6 }, Jun: { n:4786, wasting:8.1, stunting:27.68, uw:20.46, sam:1.6 }, Jul: { n:4706, wasting:7.5, stunting:16.96, uw:15.83, sam:1.1 } },
    'Jujomura': { Feb: { n:4525, wasting:2.1, stunting:23.03, uw:11.67, sam:0.5 }, Mar: { n:4565, wasting:2.9, stunting:19.72, uw:10.19, sam:0.8 }, Apr: { n:4348, wasting:4.3, stunting:23.14, uw:12.7, sam:1.1 }, May: { n:4470, wasting:4.1, stunting:21.83, uw:12.6, sam:0.9 }, Jun: { n:4394, wasting:4.0, stunting:24.56, uw:14.02, sam:0.6 }, Jul: { n:4375, wasting:3.6, stunting:22.26, uw:15.61, sam:0.5 } },
    'Kuchinda': { Feb: { n:4066, wasting:5.7, stunting:36.94, uw:23.0, sam:0.9 }, Mar: { n:4050, wasting:5.7, stunting:35.09, uw:22.44, sam:1.1 }, Apr: { n:4021, wasting:6.0, stunting:33.33, uw:21.81, sam:1.3 }, May: { n:3981, wasting:6.7, stunting:27.51, uw:19.97, sam:1.2 }, Jun: { n:3975, wasting:6.6, stunting:27.32, uw:19.85, sam:1.3 }, Jul: { n:3990, wasting:4.8, stunting:19.05, uw:16.44, sam:0.8 } },
    'Maneswar': { Feb: { n:5275, wasting:3.7, stunting:38.18, uw:18.26, sam:0.9 }, Mar: { n:5265, wasting:3.5, stunting:37.26, uw:18.1, sam:0.8 }, Apr: { n:5233, wasting:4.4, stunting:34.68, uw:18.19, sam:0.8 }, May: { n:5201, wasting:4.2, stunting:33.9, uw:18.44, sam:0.8 }, Jun: { n:5152, wasting:5.3, stunting:31.93, uw:20.01, sam:0.7 }, Jul: { n:5112, wasting:3.7, stunting:17.37, uw:13.71, sam:0.5 } },
    'NAKTIDEUL': { Feb: { n:4072, wasting:5.1, stunting:37.94, uw:20.7, sam:1.4 }, Mar: { n:4066, wasting:5.8, stunting:33.03, uw:19.87, sam:1.6 }, Apr: { n:3955, wasting:6.1, stunting:31.38, uw:19.6, sam:1.5 }, May: { n:3972, wasting:5.4, stunting:19.81, uw:15.28, sam:1.3 }, Jun: { n:3988, wasting:5.2, stunting:19.23, uw:13.92, sam:0.8 }, Jul: { n:3964, wasting:2.9, stunting:9.89, uw:7.8, sam:0.5 } },
    'RAIRAKHOL': { Feb: { n:4780, wasting:3.6, stunting:27.2, uw:17.09, sam:0.8 }, Mar: { n:4773, wasting:4.2, stunting:22.96, uw:16.28, sam:0.9 }, Apr: { n:4691, wasting:4.8, stunting:22.15, uw:16.63, sam:0.7 }, May: { n:4657, wasting:4.9, stunting:20.79, uw:16.26, sam:0.4 }, Jun: { n:4640, wasting:4.8, stunting:22.05, uw:16.12, sam:0.6 }, Jul: { n:4626, wasting:2.2, stunting:16.58, uw:12.67, sam:0.2 } },
    'RENGALI': { Feb: { n:5197, wasting:3.8, stunting:37.58, uw:18.3, sam:0.5 }, Mar: { n:5175, wasting:4.4, stunting:35.94, uw:17.72, sam:0.6 }, Apr: { n:5133, wasting:5.1, stunting:32.52, uw:17.96, sam:0.7 }, May: { n:5131, wasting:4.7, stunting:30.42, uw:17.33, sam:0.8 }, Jun: { n:5121, wasting:4.7, stunting:26.99, uw:16.7, sam:0.7 }, Jul: { n:5150, wasting:4.1, stunting:19.38, uw:14.49, sam:0.6 } },
    'SAMBALPUR_URBAN': { Feb: { n:10908, wasting:3.6, stunting:25.48, uw:10.27, sam:1.0 }, Mar: { n:10913, wasting:3.7, stunting:18.98, uw:8.8, sam:1.1 }, Apr: { n:10744, wasting:4.1, stunting:18.26, uw:8.71, sam:1.1 }, May: { n:10629, wasting:4.1, stunting:17.42, uw:8.18, sam:1.3 }, Jun: { n:10522, wasting:4.1, stunting:18.96, uw:8.93, sam:1.3 }, Jul: { n:10412, wasting:2.5, stunting:16.69, uw:6.66, sam:0.5 } },
  },
  'Subarnapur': {
    'BINKA': { Feb: { n:6316, wasting:3.3, stunting:32.63, uw:12.14, sam:0.9 }, Mar: { n:6323, wasting:3.6, stunting:17.0, uw:9.57, sam:1.0 }, Apr: { n:6254, wasting:4.7, stunting:20.13, uw:12.28, sam:1.1 }, May: { n:6256, wasting:4.1, stunting:17.79, uw:11.22, sam:1.1 }, Jun: { n:6245, wasting:5.1, stunting:22.13, uw:13.53, sam:1.0 }, Jul: { n:6278, wasting:6.4, stunting:24.08, uw:17.55, sam:1.1 } },
    'BIRMAHARAJPUR': { Feb: { n:6645, wasting:3.2, stunting:38.53, uw:16.4, sam:0.7 }, Mar: { n:6659, wasting:3.3, stunting:34.4, uw:14.9, sam:0.7 }, Apr: { n:6529, wasting:5.4, stunting:30.57, uw:16.02, sam:1.1 }, May: { n:6544, wasting:4.6, stunting:28.55, uw:14.9, sam:0.9 }, Jun: { n:6536, wasting:5.4, stunting:25.98, uw:14.53, sam:1.0 }, Jul: { n:6533, wasting:6.9, stunting:25.09, uw:17.4, sam:1.1 } },
    'DUNGURIPALI': { Feb: { n:7296, wasting:5.3, stunting:39.88, uw:17.97, sam:1.3 }, Mar: { n:7295, wasting:5.7, stunting:28.07, uw:14.56, sam:1.3 }, Apr: { n:7063, wasting:7.4, stunting:27.67, uw:16.65, sam:1.3 }, May: { n:7017, wasting:6.5, stunting:26.76, uw:15.16, sam:1.1 }, Jun: { n:7044, wasting:6.0, stunting:27.06, uw:15.22, sam:1.1 }, Jul: { n:7034, wasting:7.2, stunting:26.97, uw:17.46, sam:1.2 } },
    'SONEPUR': { Feb: { n:6406, wasting:3.3, stunting:24.8, uw:12.1, sam:0.8 }, Mar: { n:6388, wasting:3.5, stunting:17.56, uw:9.35, sam:0.9 }, Apr: { n:6297, wasting:4.0, stunting:20.03, uw:11.15, sam:1.2 }, May: { n:6258, wasting:3.7, stunting:19.11, uw:10.29, sam:0.9 }, Jun: { n:6267, wasting:3.5, stunting:20.3, uw:10.48, sam:0.9 }, Jul: { n:6258, wasting:3.5, stunting:20.21, uw:11.03, sam:1.0 } },
    'TARBHA': { Feb: { n:5459, wasting:3.0, stunting:36.76, uw:15.88, sam:0.9 }, Mar: { n:5428, wasting:3.0, stunting:29.96, uw:12.66, sam:0.9 }, Apr: { n:5398, wasting:3.0, stunting:21.04, uw:9.73, sam:0.7 }, May: { n:5401, wasting:2.8, stunting:20.83, uw:8.52, sam:0.8 }, Jun: { n:5361, wasting:2.9, stunting:19.38, uw:8.04, sam:0.7 }, Jul: { n:5382, wasting:3.7, stunting:17.48, uw:8.99, sam:1.1 } },
    'ULLUNDA': { Feb: { n:5873, wasting:2.9, stunting:25.61, uw:10.68, sam:0.6 }, Mar: { n:5876, wasting:3.0, stunting:17.72, uw:8.63, sam:0.6 }, Apr: { n:5786, wasting:4.8, stunting:18.23, uw:11.61, sam:1.0 }, May: { n:5766, wasting:4.3, stunting:16.49, uw:10.8, sam:0.9 }, Jun: { n:5748, wasting:4.4, stunting:18.2, uw:11.69, sam:1.0 }, Jul: { n:5722, wasting:4.6, stunting:19.45, uw:13.05, sam:0.9 } },
  },
  'Sundargarh': {
    'BALISANKARA': { Feb: { n:4678, wasting:2.5, stunting:26.46, uw:11.71, sam:0.6 }, Mar: { n:4655, wasting:3.0, stunting:18.86, uw:11.41, sam:0.6 }, Apr: { n:4634, wasting:4.9, stunting:22.31, uw:14.83, sam:0.9 }, May: { n:4607, wasting:5.5, stunting:22.6, uw:15.48, sam:0.8 }, Jun: { n:4489, wasting:7.0, stunting:25.64, uw:18.82, sam:1.2 }, Jul: { n:4444, wasting:8.7, stunting:25.47, uw:23.02, sam:1.6 } },
    'BARGAON': { Feb: { n:3464, wasting:4.1, stunting:32.77, uw:15.99, sam:0.9 }, Mar: { n:3434, wasting:3.6, stunting:32.29, uw:15.32, sam:0.8 }, Apr: { n:3419, wasting:3.2, stunting:33.69, uw:16.44, sam:0.7 }, May: { n:3419, wasting:3.5, stunting:29.8, uw:15.82, sam:0.7 }, Jun: { n:3404, wasting:3.2, stunting:30.35, uw:15.16, sam:0.6 }, Jul: { n:3383, wasting:3.0, stunting:25.3, uw:14.31, sam:0.3 } },
    'BIRMITRAPUR': { Feb: { n:1681, wasting:4.6, stunting:29.33, uw:13.21, sam:0.6 }, Mar: { n:1693, wasting:4.0, stunting:28.65, uw:12.52, sam:0.9 }, Apr: { n:1691, wasting:4.8, stunting:23.83, uw:12.83, sam:0.8 }, May: { n:1691, wasting:4.4, stunting:19.4, uw:11.83, sam:0.7 }, Jun: { n:1666, wasting:4.1, stunting:21.31, uw:12.55, sam:0.7 }, Jul: { n:1663, wasting:4.8, stunting:21.35, uw:14.37, sam:0.4 } },
    'BISRA': { Feb: { n:5223, wasting:2.7, stunting:33.08, uw:15.28, sam:0.5 }, Mar: { n:5179, wasting:2.6, stunting:32.42, uw:14.89, sam:0.5 }, Apr: { n:5192, wasting:2.3, stunting:34.23, uw:15.7, sam:0.4 }, May: { n:5209, wasting:2.8, stunting:30.5, uw:14.95, sam:0.5 }, Jun: { n:5221, wasting:3.0, stunting:31.18, uw:15.61, sam:0.7 }, Jul: { n:5222, wasting:2.8, stunting:30.7, uw:16.12, sam:0.5 } },
    'BONAIGARH': { Feb: { n:4167, wasting:5.7, stunting:26.54, uw:14.54, sam:0.7 }, Mar: { n:4155, wasting:5.7, stunting:26.96, uw:15.07, sam:0.9 }, Apr: { n:4142, wasting:6.0, stunting:26.29, uw:15.89, sam:1.0 }, May: { n:4089, wasting:6.0, stunting:23.89, uw:15.43, sam:0.9 }, Jun: { n:4069, wasting:6.0, stunting:23.84, uw:14.7, sam:0.8 }, Jul: { n:4067, wasting:7.9, stunting:22.97, uw:17.06, sam:1.1 } },
    'GURUNDIA': { Feb: { n:4420, wasting:6.0, stunting:44.66, uw:20.43, sam:1.4 }, Mar: { n:4400, wasting:6.0, stunting:45.05, uw:20.57, sam:1.1 }, Apr: { n:4383, wasting:6.0, stunting:47.73, uw:22.91, sam:1.0 }, May: { n:4380, wasting:6.6, stunting:42.26, uw:21.42, sam:1.3 }, Jun: { n:4359, wasting:7.1, stunting:35.63, uw:18.74, sam:1.3 }, Jul: { n:4336, wasting:8.0, stunting:32.1, uw:19.63, sam:1.3 } },
    'HEMGIRI': { Feb: { n:4081, wasting:5.8, stunting:30.83, uw:20.24, sam:1.0 }, Mar: { n:4074, wasting:4.2, stunting:29.23, uw:19.05, sam:0.4 }, Apr: { n:3897, wasting:4.5, stunting:31.77, uw:19.99, sam:0.6 }, May: { n:3907, wasting:4.0, stunting:29.92, uw:19.63, sam:0.5 }, Jun: { n:3846, wasting:4.1, stunting:32.58, uw:19.89, sam:0.6 }, Jul: { n:3820, wasting:4.8, stunting:28.38, uw:20.58, sam:0.7 } },
    'KOIRA': { Feb: { n:7570, wasting:4.1, stunting:20.99, uw:9.52, sam:1.2 }, Mar: { n:7537, wasting:3.5, stunting:18.85, uw:8.69, sam:1.0 }, Apr: { n:7473, wasting:3.4, stunting:22.7, uw:10.85, sam:0.9 }, May: { n:7444, wasting:3.3, stunting:10.89, uw:6.37, sam:1.0 }, Jun: { n:7371, wasting:3.1, stunting:9.93, uw:5.66, sam:1.0 }, Jul: { n:7348, wasting:5.6, stunting:16.36, uw:10.87, sam:0.9 } },
    'KUARMUNDA': { Feb: { n:6228, wasting:3.9, stunting:32.51, uw:15.46, sam:0.5 }, Mar: { n:6206, wasting:3.9, stunting:31.71, uw:15.78, sam:0.5 }, Apr: { n:6129, wasting:3.5, stunting:33.28, uw:16.45, sam:0.5 }, May: { n:6112, wasting:4.3, stunting:29.84, uw:15.94, sam:0.8 }, Jun: { n:6070, wasting:4.3, stunting:30.36, uw:16.57, sam:0.9 }, Jul: { n:6075, wasting:5.8, stunting:28.23, uw:18.04, sam:0.9 } },
    'KUTRA': { Feb: { n:4226, wasting:5.5, stunting:26.6, uw:12.9, sam:0.9 }, Mar: { n:4236, wasting:6.0, stunting:27.15, uw:12.77, sam:1.0 }, Apr: { n:4202, wasting:7.0, stunting:27.61, uw:15.14, sam:1.3 }, May: { n:4161, wasting:6.5, stunting:26.1, uw:14.28, sam:1.0 }, Jun: { n:4145, wasting:6.5, stunting:28.23, uw:14.43, sam:0.6 }, Jul: { n:4129, wasting:7.4, stunting:21.55, uw:15.81, sam:0.8 } },
    'LAHUNIPARA': { Feb: { n:8060, wasting:5.0, stunting:41.0, uw:24.95, sam:0.6 }, Mar: { n:7972, wasting:4.1, stunting:40.89, uw:24.27, sam:0.7 }, Apr: { n:7935, wasting:3.3, stunting:41.93, uw:25.05, sam:0.5 }, May: { n:7905, wasting:3.1, stunting:40.58, uw:23.93, sam:0.4 }, Jun: { n:7872, wasting:3.5, stunting:34.73, uw:21.61, sam:0.5 }, Jul: { n:7853, wasting:4.1, stunting:32.57, uw:22.67, sam:0.8 } },
    'LATHIKATA': { Feb: { n:8500, wasting:2.7, stunting:26.19, uw:10.05, sam:0.5 }, Mar: { n:8482, wasting:2.7, stunting:27.94, uw:10.61, sam:0.4 }, Apr: { n:8424, wasting:3.1, stunting:28.92, uw:12.54, sam:0.5 }, May: { n:8399, wasting:3.1, stunting:27.07, uw:11.82, sam:0.6 }, Jun: { n:8423, wasting:3.0, stunting:29.06, uw:12.0, sam:0.6 }, Jul: { n:8441, wasting:5.2, stunting:26.0, uw:13.81, sam:0.7 } },
    'LEPHRIPARA': { Feb: { n:3881, wasting:2.9, stunting:22.88, uw:12.19, sam:0.6 }, Mar: { n:3839, wasting:2.2, stunting:22.38, uw:12.53, sam:0.5 }, Apr: { n:3826, wasting:2.3, stunting:22.5, uw:14.04, sam:0.5 }, May: { n:3829, wasting:2.5, stunting:19.67, uw:13.74, sam:0.8 }, Jun: { n:3817, wasting:2.7, stunting:22.19, uw:14.28, sam:0.6 }, Jul: { n:3798, wasting:2.8, stunting:22.09, uw:15.51, sam:0.4 } },
    'NUAGAON': { Feb: { n:5780, wasting:2.2, stunting:20.76, uw:9.78, sam:0.6 }, Mar: { n:5736, wasting:2.3, stunting:21.76, uw:10.13, sam:0.5 }, Apr: { n:5686, wasting:2.7, stunting:24.34, uw:11.26, sam:0.7 }, May: { n:5765, wasting:2.7, stunting:20.85, uw:10.74, sam:0.8 }, Jun: { n:5717, wasting:2.9, stunting:21.15, uw:11.61, sam:0.7 }, Jul: { n:5712, wasting:2.1, stunting:18.68, uw:10.68, sam:0.4 } },
    'RAJGANGPUR': { Feb: { n:9234, wasting:2.1, stunting:27.86, uw:9.43, sam:0.3 }, Mar: { n:9208, wasting:2.1, stunting:27.78, uw:8.99, sam:0.3 }, Apr: { n:9177, wasting:2.4, stunting:28.93, uw:10.5, sam:0.3 }, May: { n:9145, wasting:2.9, stunting:26.13, uw:10.09, sam:0.3 }, Jun: { n:9117, wasting:2.9, stunting:28.52, uw:11.24, sam:0.4 }, Jul: { n:9117, wasting:3.8, stunting:27.27, uw:12.95, sam:0.3 } },
    'ROURKELA_CITY': { Feb: { n:7631, wasting:0.9, stunting:13.33, uw:4.05, sam:0.2 }, Mar: { n:7563, wasting:0.9, stunting:14.43, uw:4.43, sam:0.3 }, Apr: { n:7525, wasting:0.7, stunting:15.65, uw:4.93, sam:0.1 }, May: { n:7517, wasting:0.9, stunting:12.41, uw:3.79, sam:0.2 }, Jun: { n:7483, wasting:1.0, stunting:14.66, uw:4.57, sam:0.2 }, Jul: { n:7705, wasting:1.0, stunting:14.83, uw:5.28, sam:0.2 } },
    'ROURKELA_INDUSTRIAL_ESTATE': { Feb: { n:4829, wasting:1.0, stunting:27.23, uw:8.93, sam:0.2 }, Mar: { n:4820, wasting:1.1, stunting:30.12, uw:9.85, sam:0.3 }, Apr: { n:4785, wasting:1.2, stunting:31.62, uw:10.85, sam:0.3 }, May: { n:4741, wasting:1.1, stunting:30.08, uw:9.68, sam:0.2 }, Jun: { n:4691, wasting:0.9, stunting:31.89, uw:9.87, sam:0.3 }, Jul: { n:4740, wasting:1.4, stunting:28.44, uw:9.56, sam:0.3 } },
    'ROURKELE_CIVIL_TOWNSHIP': { Feb: { n:4650, wasting:1.3, stunting:25.72, uw:7.18, sam:0.3 }, Mar: { n:4596, wasting:1.1, stunting:25.04, uw:6.22, sam:0.3 }, Apr: { n:4643, wasting:1.4, stunting:27.68, uw:6.87, sam:0.3 }, May: { n:4414, wasting:1.9, stunting:24.6, uw:6.89, sam:0.3 }, Jun: { n:4201, wasting:1.7, stunting:25.76, uw:6.95, sam:0.2 }, Jul: { n:4436, wasting:2.9, stunting:26.69, uw:8.7, sam:0.2 } },
    'SUBDEGA': { Feb: { n:3212, wasting:4.5, stunting:26.0, uw:18.15, sam:0.5 }, Mar: { n:3215, wasting:4.2, stunting:24.6, uw:16.73, sam:0.5 }, Apr: { n:3206, wasting:5.1, stunting:23.71, uw:17.44, sam:0.6 }, May: { n:3185, wasting:4.7, stunting:21.07, uw:16.51, sam:0.6 }, Jun: { n:3012, wasting:5.1, stunting:23.64, uw:18.99, sam:0.8 }, Jul: { n:2973, wasting:6.5, stunting:22.0, uw:20.62, sam:0.8 } },
    'SUNDARGARH_SADAR': { Feb: { n:4426, wasting:2.8, stunting:23.07, uw:13.26, sam:0.5 }, Mar: { n:4446, wasting:2.7, stunting:21.95, uw:13.45, sam:0.7 }, Apr: { n:4433, wasting:3.4, stunting:25.24, uw:15.41, sam:0.3 }, May: { n:4453, wasting:3.6, stunting:20.21, uw:13.45, sam:0.3 }, Jun: { n:4406, wasting:3.5, stunting:22.81, uw:14.21, sam:0.3 }, Jul: { n:4318, wasting:3.1, stunting:19.5, uw:12.88, sam:0.4 } },
    'TANGARPALI': { Feb: { n:2844, wasting:3.0, stunting:28.09, uw:16.74, sam:0.5 }, Mar: { n:2845, wasting:2.7, stunting:27.84, uw:16.34, sam:0.4 }, Apr: { n:2841, wasting:2.4, stunting:27.0, uw:15.77, sam:0.3 }, May: { n:2828, wasting:2.3, stunting:26.41, uw:16.55, sam:0.4 }, Jun: { n:2702, wasting:2.6, stunting:28.02, uw:17.06, sam:0.4 }, Jul: { n:2700, wasting:6.0, stunting:25.22, uw:20.48, sam:1.0 } },
  },
};

// ── RYG AWC Status Data ───────────────────────────────────────────────────────
// Source: Excel status.xlsx · July 2026 · validata DQ classification
// R = Red (poor DQ), Y = Yellow (moderate), G = Green (good DQ)
import _rygDistrict from "./ryg-district.json";
import _rygProject from "./ryg-project.json";
import _rygAwc from "./ryg-awc.json";

export type RYGStatus = "R" | "Y" | "G";
export type DistrictRYG = { R: number; Y: number; G: number; total: number };
export type ProjectRYG = { project: string; R: number; Y: number; G: number; total: number };
/** [awcName, awcCode, projectName, sectorName, status] */
export type AWCRYGRow = [string, string, string, string, RYGStatus];

export const districtRYG = _rygDistrict as Record<string, DistrictRYG>;
export const projectRYG = _rygProject as Record<string, ProjectRYG[]>;
export const awcRYG = _rygAwc as unknown as Record<string, AWCRYGRow[]>;

// export const STATE_RYG: DistrictRYG = { R: 15375, Y: 52219, G: 6555, total: 74149 };
export const STATE_RYG: DistrictRYG = { R: 15375, Y: 52291, G: 6555, total: 74142 };
