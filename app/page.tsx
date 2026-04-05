import { HomeClient } from "@/app/home-client";
import { getPrograms } from "@/src/lib/programs.server";

export default function HomePage() {
  const programs = getPrograms();

  return <HomeClient programs={programs} />;
}
