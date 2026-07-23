import type { ReactNode } from "react";
import { HiOutlineLockClosed, HiOutlinePencilSquare } from "react-icons/hi2";

export type EpsSetupState = {
  battery_threshold_low: number;
  battery_threshold_high: number;
  temp_min: number;
  temp_max: number;
  heater_power: number;
};

export type PayloadSetupState = {
  payload_module: string;
  default_on: boolean;
};

export type CommSetupState = {
  pass_sim_sec: number;
  downlink_policy: string;
};

export type MissionSetupState = {
  eps: EpsSetupState;
  payload: PayloadSetupState;
  comm: CommSetupState;
};

export const DEFAULT_MISSION_SETUP: MissionSetupState = {
  eps: {
    battery_threshold_low: 20,
    battery_threshold_high: 80,
    temp_min: 15,
    temp_max: 55,
    heater_power: 30,
  },
  payload: {
    payload_module: "generic",
    default_on: false,
  },
  comm: {
    pass_sim_sec: 5400,
    downlink_policy: "auto",
  },
};

type Props = {
  value: MissionSetupState;
  onChange: (next: MissionSetupState) => void;
  locked?: {
    eps?: string[];
    payload?: string[];
    comm?: string[];
  };
};

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 font-mono text-[0.55rem] tracking-wider text-muted">
        <HiOutlinePencilSquare className="text-[0.7rem] text-cyan/70" aria-hidden />
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-md border border-cyan/25 bg-cyan/[0.04] px-2 py-1.5 font-mono text-[0.8rem] text-text outline-none transition focus:border-cyan/50"
      />
    </label>
  );
}

function PresetValue({
  label,
  display,
  hint,
}: {
  label: string;
  display: string;
  hint?: string;
}) {
  return (
    <div
      className="flex flex-col gap-1 rounded-md border border-dashed border-white/12 bg-white/[0.02] px-2.5 py-2"
      title={hint ?? "ค่าที่ภารกิจกำหนดไว้ — แก้ไม่ได้ใน M01"}
    >
      <span className="flex items-center gap-1.5 font-mono text-[0.55rem] tracking-wider text-muted">
        <HiOutlineLockClosed className="text-[0.7rem] text-amber-300/80" aria-hidden />
        {label}
        <span className="rounded border border-amber-400/30 bg-amber-400/10 px-1 py-px font-section-thai text-[0.55rem] tracking-normal text-amber-200/85">
          ล็อก
        </span>
      </span>
      <p className="font-mono text-[0.85rem] text-text/75">{display}</p>
      {hint ? (
        <p className="font-section-thai text-[0.7rem] leading-snug text-text/40">{hint}</p>
      ) : null}
    </div>
  );
}

function SetupSection({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: "editable" | "locked";
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#060e1c]/80">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
        <div>
          <h3 className="font-display text-[0.72rem] font-semibold tracking-[0.14em] text-cyan/90">
            {title}
          </h3>
          <p className="font-section-thai mt-1 text-[0.8rem] text-text/55">{subtitle}</p>
        </div>
        {badge === "editable" ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-cyan/30 bg-cyan/10 px-2 py-1 font-section-thai text-[0.68rem] text-cyan">
            <HiOutlinePencilSquare className="text-[0.75rem]" aria-hidden />
            แก้ได้
          </span>
        ) : null}
        {badge === "locked" ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-2 py-1 font-section-thai text-[0.68rem] text-amber-200/90">
            <HiOutlineLockClosed className="text-[0.75rem]" aria-hidden />
            กำหนดโดยภารกิจ
          </span>
        ) : null}
      </header>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function isLocked(
  locked: Props["locked"],
  group: "eps" | "payload" | "comm",
  field: string,
): boolean {
  return Boolean(locked?.[group]?.includes(field));
}

export default function MissionSetupTabs({ value, onChange, locked }: Props) {
  const payloadLocked =
    isLocked(locked, "payload", "payload_module") &&
    isLocked(locked, "payload", "default_on");
  const commLocked =
    isLocked(locked, "comm", "pass_sim_sec") &&
    isLocked(locked, "comm", "downlink_policy");

  return (
    <div className="flex flex-col gap-4">
      <SetupSection
        title="EPS"
        subtitle="เกณฑ์แบต/อุณหภูมิ และกำลัง heater — ปรับได้ก่อนรัน"
        badge="editable"
      >
        {isLocked(locked, "eps", "battery_threshold_low") ? (
          <PresetValue label="BAT LOW %" display={`${value.eps.battery_threshold_low}%`} />
        ) : (
          <NumberField
            label="BAT LOW %"
            value={value.eps.battery_threshold_low}
            min={0}
            max={100}
            onChange={(n) =>
              onChange({ ...value, eps: { ...value.eps, battery_threshold_low: n } })
            }
          />
        )}
        {isLocked(locked, "eps", "battery_threshold_high") ? (
          <PresetValue label="BAT HIGH %" display={`${value.eps.battery_threshold_high}%`} />
        ) : (
          <NumberField
            label="BAT HIGH %"
            value={value.eps.battery_threshold_high}
            min={0}
            max={100}
            onChange={(n) =>
              onChange({ ...value, eps: { ...value.eps, battery_threshold_high: n } })
            }
          />
        )}
        {isLocked(locked, "eps", "temp_min") ? (
          <PresetValue label="TEMP MIN" display={`${value.eps.temp_min}°C`} />
        ) : (
          <NumberField
            label="TEMP MIN"
            value={value.eps.temp_min}
            onChange={(n) => onChange({ ...value, eps: { ...value.eps, temp_min: n } })}
          />
        )}
        {isLocked(locked, "eps", "temp_max") ? (
          <PresetValue label="TEMP MAX" display={`${value.eps.temp_max}°C`} />
        ) : (
          <NumberField
            label="TEMP MAX"
            value={value.eps.temp_max}
            onChange={(n) => onChange({ ...value, eps: { ...value.eps, temp_max: n } })}
          />
        )}
        {isLocked(locked, "eps", "heater_power") ? (
          <PresetValue label="HEATER %" display={`${value.eps.heater_power}%`} />
        ) : (
          <NumberField
            label="HEATER %"
            value={value.eps.heater_power}
            min={0}
            max={100}
            onChange={(n) =>
              onChange({ ...value, eps: { ...value.eps, heater_power: n } })
            }
          />
        )}
      </SetupSection>

      <SetupSection
        title="PAYLOAD"
        subtitle={
          payloadLocked
            ? "ภารกิจนี้ล็อกโมดูลและสถานะเริ่มต้นไว้แล้ว"
            : "โมดูลภาระบรรทุกและสถานะเริ่มต้น"
        }
        badge={payloadLocked ? "locked" : "editable"}
      >
        {isLocked(locked, "payload", "payload_module") ? (
          <PresetValue
            label="MODULE"
            display={value.payload.payload_module}
            hint="M01 ใช้โมดูล generic เท่านั้น"
          />
        ) : (
          <label className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 font-mono text-[0.55rem] tracking-wider text-muted">
              <HiOutlinePencilSquare className="text-[0.7rem] text-cyan/70" aria-hidden />
              MODULE
            </span>
            <select
              value={value.payload.payload_module}
              onChange={(e) =>
                onChange({
                  ...value,
                  payload: { ...value.payload, payload_module: e.target.value },
                })
              }
              className="rounded-md border border-cyan/25 bg-cyan/[0.04] px-2 py-1.5 font-mono text-[0.8rem] text-text"
            >
              <option value="generic">generic</option>
              <option value="camera">camera</option>
            </select>
          </label>
        )}
        {isLocked(locked, "payload", "default_on") ? (
          <PresetValue
            label="DEFAULT ON"
            display={value.payload.default_on ? "ON" : "OFF"}
            hint="เริ่มต้นปิด payload — สั่งเปิด/ปิดด้วยบล็อกใน OBC"
          />
        ) : (
          <label className="flex items-end gap-2 pb-1 sm:col-span-2">
            <input
              type="checkbox"
              checked={value.payload.default_on}
              onChange={(e) =>
                onChange({
                  ...value,
                  payload: { ...value.payload, default_on: e.target.checked },
                })
              }
            />
            <span className="font-section-thai text-[0.8rem] text-text/70">
              เปิด payload เริ่มต้น
            </span>
          </label>
        )}
      </SetupSection>

      <SetupSection
        title="COMM"
        subtitle={
          commLocked
            ? "ช่วง pass และ downlink ถูกกำหนดโดยภารกิจ — ยังไม่เปิดให้ปรับใน M01"
            : "ช่วง ground pass และนโยบาย downlink"
        }
        badge={commLocked ? "locked" : "editable"}
      >
        {isLocked(locked, "comm", "pass_sim_sec") ? (
          <PresetValue
            label="PASS simSec"
            display={String(value.comm.pass_sim_sec)}
            hint="ประมาณท้ายวงโคจร (~5400 s) สำหรับเช็ค comms"
          />
        ) : (
          <NumberField
            label="PASS simSec"
            value={value.comm.pass_sim_sec}
            onChange={(n) =>
              onChange({ ...value, comm: { ...value.comm, pass_sim_sec: n } })
            }
          />
        )}
        {isLocked(locked, "comm", "downlink_policy") ? (
          <PresetValue
            label="DOWNLINK"
            display={value.comm.downlink_policy}
            hint="คุณภาพ downlink คำนวณจากเกรดปลายวงอัตโนมัติ"
          />
        ) : (
          <label className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 font-mono text-[0.55rem] tracking-wider text-muted">
              <HiOutlinePencilSquare className="text-[0.7rem] text-cyan/70" aria-hidden />
              DOWNLINK
            </span>
            <select
              value={value.comm.downlink_policy}
              onChange={(e) =>
                onChange({
                  ...value,
                  comm: { ...value.comm, downlink_policy: e.target.value },
                })
              }
              className="rounded-md border border-cyan/25 bg-cyan/[0.04] px-2 py-1.5 font-mono text-[0.8rem] text-text"
            >
              <option value="auto">auto</option>
              <option value="full">full</option>
              <option value="partial">partial</option>
            </select>
          </label>
        )}
      </SetupSection>
    </div>
  );
}
