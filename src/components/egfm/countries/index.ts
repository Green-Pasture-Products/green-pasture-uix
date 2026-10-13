// ponytail: client-side until the API serves GET /countries (code, name, dial code, national lengths).
// ISO 3166-1 alpha-2 + calling code: the set the API accepts (Java's Locale.getISOCountries()).
const DIAL_CODES =
  "AD376 AE971 AF93 AG1 AI1 AL355 AM374 AO244 AQ672 AR54 AS1 AT43 AU61 AW297 AX358 AZ994 BA387 BB1 BD880 BE32 BF226 BG359 BH973 BI257 BJ229 BL590 BM1 BN673 BO591 BQ599 BR55 BS1 BT975 BV47 BW267 BY375 BZ501 CA1 CC61 CD243 CF236 CG242 CH41 CI225 CK682 CL56 CM237 CN86 CO57 CR506 CU53 CV238 CW599 CX61 CY357 CZ420 DE49 DJ253 DK45 DM1 DO1 DZ213 EC593 EE372 EG20 EH212 ER291 ES34 ET251 FI358 FJ679 FK500 FM691 FO298 FR33 GA241 GB44 GD1 GE995 GF594 GG44 GH233 GI350 GL299 GM220 GN224 GP590 GQ240 GR30 GS500 GT502 GU1 GW245 GY592 HK852 HM672 HN504 HR385 HT509 HU36 ID62 IE353 IL972 IM44 IN91 IO246 IQ964 IR98 IS354 IT39 JE44 JM1 JO962 JP81 KE254 KG996 KH855 KI686 KM269 KN1 KP850 KR82 KW965 KY1 KZ7 LA856 LB961 LC1 LI423 LK94 LR231 LS266 LT370 LU352 LV371 LY218 MA212 MC377 MD373 ME382 MF590 MG261 MH692 MK389 ML223 MM95 MN976 MO853 MP1 MQ596 MR222 MS1 MT356 MU230 MV960 MW265 MX52 MY60 MZ258 NA264 NC687 NE227 NF672 NG234 NI505 NL31 NO47 NP977 NR674 NU683 NZ64 OM968 PA507 PE51 PF689 PG675 PH63 PK92 PL48 PM508 PN64 PR1 PS970 PT351 PW680 PY595 QA974 RE262 RO40 RS381 RU7 RW250 SA966 SB677 SC248 SD249 SE46 SG65 SH290 SI386 SJ47 SK421 SL232 SM378 SN221 SO252 SR597 SS211 ST239 SV503 SX1 SY963 SZ268 TC1 TD235 TF262 TG228 TH66 TJ992 TK690 TL670 TM993 TN216 TO676 TR90 TT1 TV688 TW886 TZ255 UA380 UG256 UM1 US1 UY598 UZ998 VA39 VC1 VE58 VG1 VI1 VN84 VU678 WF681 WS685 YE967 YT262 ZA27 ZM260 ZW263";

// Digits after the dial code, where known; elsewhere any length E.164 allows. All +1 numbers have 10.
const NATIONAL_LENGTHS =
  "NG10 GH9 CI10 SN9 CM9 BJ10 TG8 NE8 BF8 ML8 KE9 UG9 TZ9 RW9 ET9 EG10 MA9 ZA9 GB9-10 IE7-9 NL9 BE8-9 FR9 ES9 PT9 IT6-11 DE6-11 CH9 AE8-9 SA9 IN10 CN11 SG8 AU9 JP9-10";

// Which country a shared dial code means when nothing else says (e.g. +1 → US, +44 → GB).
const PRIMARY = new Set("US RU GB NO AU RE FI GP CW MA IT NF FK NZ".split(" "));

export interface Country {
  code: string;
  name: string;
  /** "+233" */
  dial: string;
  flag: string;
  /** National digit count after the dial code. */
  min: number;
  max: number;
}

const lengths = new Map(
  NATIONAL_LENGTHS.split(" ").map((e) => {
    const [, code, min, max] = e.match(/^([A-Z]{2})(\d+)(?:-(\d+))?$/)!;
    return [code, [Number(min), Number(max ?? min)]] as const;
  }),
);
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const flagOf = (code: string) => String.fromCodePoint(...[...code].map((ch) => 0x1f1a5 + ch.charCodeAt(0)));

/** Every country, by name. */
export const COUNTRIES: Country[] = DIAL_CODES.split(" ")
  .map((e) => {
    const code = e.slice(0, 2);
    const dial = e.slice(2);
    // E.164 allows 15 digits in all; the API wants at least 8.
    const [min, max] = lengths.get(code) ?? (dial === "1" ? [10, 10] : [Math.max(4, 8 - dial.length), 15 - dial.length]);
    return { code, name: regionNames.of(code) ?? code, dial: `+${dial}`, flag: flagOf(code), min, max };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const byCode = new Map(COUNTRIES.map((c) => [c.code, c]));
export const countryByCode = (code?: string | null) => (code ? byCode.get(code) : undefined);

/** Country options for a Combobox (value = ISO code). */
export const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: c.name }));

/** The country an international number's digits start with: the preferred one if it fits, else the primary. */
export function countryForDigits(digits: string, preferred?: string): Country | undefined {
  const fits = COUNTRIES.filter((c) => digits.startsWith(c.dial.slice(1)));
  return fits.find((c) => c.code === preferred) ?? fits.find((c) => PRIMARY.has(c.code)) ?? fits[0];
}
