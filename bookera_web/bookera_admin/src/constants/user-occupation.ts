export const OCCUPATION_OPTIONS = [
  { value: "student", labelKey: "occupationStudent" },
  { value: "teacher", labelKey: "occupationTeacher" },
  { value: "staff", labelKey: "occupationStaff" },
  { value: "external", labelKey: "occupationExternal" },
  { value: "other", labelKey: "occupationOther" },
] as const;

export type OccupationValue = (typeof OCCUPATION_OPTIONS)[number]["value"];
export type OccupationLabelKey = (typeof OCCUPATION_OPTIONS)[number]["labelKey"];

const occupationLabelKeyMap: Record<OccupationValue, OccupationLabelKey> =
  OCCUPATION_OPTIONS.reduce(
    (accumulator, option) => {
      accumulator[option.value] = option.labelKey;
      return accumulator;
    },
    {} as Record<OccupationValue, OccupationLabelKey>,
  );

const legacyOccupationMap: Record<string, OccupationValue> = {
  student: "student",
  siswa: "student",
  pelajar: "student",
  teacher: "teacher",
  guru: "teacher",
  staff: "staff",
  staf: "staff",
  admin: "staff",
  administrator: "staff",
  public: "external",
  external: "external",
  umum: "external",
  "luar sekolah": "external",
  "outside school": "external",
  other: "other",
  lainnya: "other",
};

export function normalizeOccupationValue(
  value?: string | null,
): OccupationValue | undefined {
  if (!value) {
    return undefined;
  }

  return legacyOccupationMap[value.trim().toLowerCase()];
}

export function getOccupationLabelKey(
  value?: string | null,
): OccupationLabelKey {
  const normalizedValue = normalizeOccupationValue(value);

  if (!normalizedValue) {
    return "occupationOther";
  }

  return occupationLabelKeyMap[normalizedValue];
}

export function formatOccupationLabel(
  value: string | null | undefined,
  translate: (key: OccupationLabelKey) => string,
): string {
  if (!value) {
    return "N/A";
  }

  return translate(getOccupationLabelKey(value));
}
