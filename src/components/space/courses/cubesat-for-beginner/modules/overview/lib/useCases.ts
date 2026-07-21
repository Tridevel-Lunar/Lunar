import { OrbitBand } from "./types";
import { MissionType } from "./missions";

export type UseCaseDemoKind =
  | "starlink_mesh"
  | "earth_photo"
  | "gps_fix"
  | "geo_beam"
  | "heo_polar"
  | "tv_dish";

export interface UseCaseDef {
  id: string;
  band: OrbitBand;
  missionType: MissionType;
  label: string;
  tease: string;
  cta: string;
  demo: UseCaseDemoKind;
  resultTitle: string;
  resultBody: string;
}

export const USE_CASES_BY_BAND: Record<OrbitBand, UseCaseDef[]> = {
  LEO: [
    {
      id: "leo-photo",
      band: "LEO",
      missionType: "earth_observation",
      label: "ถ่ายโลกให้คม",
      tease: "ใกล้ = คม · บินผ่านไว ต้องหลายดวง",
      cta: "ถ่าย",
      demo: "earth_photo",
      resultTitle: "ได้ภาพคมจาก LEO",
      resultBody:
        "เหมือนถ่ายใกล้ๆ — ใช้เกษตร ภัยพิบัติ ผังเมืองได้ (เช่น ภารกิจ EO ของไทย)",
    },
    {
      id: "leo-starlink",
      band: "LEO",
      missionType: "broadband",
      label: "Starlink เมช",
      tease: "Latency ต่ำ · เชื่อมดวงต่อดวง",
      cta: "เชื่อม",
      demo: "starlink_mesh",
      resultTitle: "อินเทอร์เน็ตพร้อม!",
      resultBody: "กลุ่มดาวเทียม LEO + ครอสลิงก์ → ครอบคลุมกว้างโดยไม่ต้องค้างฟ้า",
    },
    {
      id: "leo-cubesat",
      band: "LEO",
      missionType: "science_demo",
      label: "CubeSat · Build Size",
      tease: "ปล่อยถูก · rideshare / ISS",
      cta: "สร้าง",
      demo: "earth_photo",
      resultTitle: "บ้านของ CubeSat",
      resultBody: "เกือบทั้งหมดอยู่ LEO — ไปแท็บ CubeSat เพื่อขยายขนาด 1U→12U",
    },
  ],
  MEO: [
    {
      id: "meo-gps",
      band: "MEO",
      missionType: "navigation",
      label: "ล็อกพิกัด GPS",
      tease: "ต้องเห็นหลายดวงพร้อมกัน",
      cta: "ล็อก",
      demo: "gps_fix",
      resultTitle: "ล็อกพิกัดแล้ว",
      resultBody: "มือถือคุณใช้สัญญาณ GNSS จาก MEO อยู่ทุกวัน — ไม่ใช่ดาวเทียมทีวีดวงเดียว",
    },
  ],
  GEO: [
    {
      id: "geo-tv",
      band: "GEO",
      missionType: "communications",
      label: "จานทีวีไม่หมุน",
      tease: "ลอยนิ่ง → ตั้งจานครั้งเดียว",
      cta: "ล็อก",
      demo: "tv_dish",
      resultTitle: "รับสัญญาณต่อเนื่อง",
      resultBody: "ถ้าอยู่ LEO จานต้องหมุนตามตลอด — GEO เลยเหมาะทีวี/สื่อสารบ้าน",
    },
    {
      id: "geo-weather",
      band: "GEO",
      missionType: "meteorology",
      label: "ติดตามพายุ 24 ชม.",
      tease: "มองจุดเดิมตลอด · ภาพเมฆข่าว",
      cta: "ดูสด",
      demo: "geo_beam",
      resultTitle: "ติดตามพายุได้",
      resultBody: "จานพื้นไม่ขยับ · สัญญาณอุตุต่อเนื่องรอบวัน",
    },
  ],
  HEO: [
    {
      id: "heo-polar",
      band: "HEO",
      missionType: "polar_coverage",
      label: "ครอบคลุมขั้วโลก",
      tease: "นอก Module 1 หลัก — สำรวจเพิ่มได้",
      cta: "แสดงการครอบคลุม",
      demo: "heo_polar",
      resultTitle: "ขั้วโลกอยู่ในสายตา",
      resultBody: "GEO มองไม่ถึงขั้ว · HEO เติมช่องว่างนี้ได้",
    },
  ],
};
