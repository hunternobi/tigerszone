import { dbConnect } from "@/lib/mongodb";
import { BonusResultModel } from "@/models/BonusResult";
import type { BonusRound } from "@/models/BonusPrediction";

export interface AdminBonusResult {
  hauptrundensieger?: string;
  platzierungTigers?: number;
  topscorerTigers?: string;
  meisteToreTigers?: string;
}

export async function getBonusResult(round: BonusRound): Promise<AdminBonusResult> {
  await dbConnect();
  const doc = await BonusResultModel.findOne({ round }).lean<AdminBonusResult | null>();
  if (!doc) return {};
  return {
    hauptrundensieger: doc.hauptrundensieger,
    platzierungTigers: doc.platzierungTigers,
    topscorerTigers: doc.topscorerTigers,
    meisteToreTigers: doc.meisteToreTigers,
  };
}
