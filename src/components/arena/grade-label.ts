export function gradeLabel(grade?: string): string {
  if (grade === "perfect") return "สมบูรณ์";
  if (grade === "risky") return "เสี่ยง";
  if (grade === "fail") return "ไม่ผ่าน";
  return "ยังไม่ประเมิน";
}

export function gradeStatusClassName(grade?: string): string {
  if (grade === "perfect") return "text-emerald-300";
  if (grade === "risky") return "text-amber-300";
  if (grade === "fail") return "text-orange-300";
  return "text-text/60";
}
