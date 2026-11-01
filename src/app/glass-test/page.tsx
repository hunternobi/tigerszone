import type { Metadata } from "next";
import GlassTest from "./GlassTest";

export const metadata: Metadata = {
  title: "Glass-Test (intern)",
  robots: { index: false, follow: false },
};

export default function GlassTestPage() {
  return <GlassTest />;
}
