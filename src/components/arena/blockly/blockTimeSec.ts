/** Mirror of backend BLOCK_TIME_SEC (display / teaching only). */
export const BLOCK_TIME_SEC: Record<string, number> = {
  battery_level: 0.002,
  temperature: 0.002,
  is_in_sunlight: 0.002,
  is_in_eclipse: 0.002,
  sim_sec: 0.002,
  orbit_phase: 0.002,
  compare: 0.002,
  if: 0.003,
  when: 0.004,
  turn_heater: 0.005,
  turn_payload: 0.005,
  enter_safe_mode: 0.008,
  exit_safe_mode: 0.008,
  wait_1_tick: 0.001,
  repeat_until_end: 0.001,
};

export const WINDOW_BUDGET_SEC = 0.05;
