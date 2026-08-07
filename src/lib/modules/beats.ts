import type { Beat } from "@/lib/types";

export function createBeat(id: string, name: string, area: string): Beat {
  return {
    id,
    name,
    area,
    location: area,
    salesToday: 0,
  };
}

export function renameBeat(
  beats: Beat[],
  beatId: string,
  name: string,
): Beat[] {
  return beats.map((beat) =>
    beat.id === beatId
      ? {
          ...beat,
          name,
        }
      : beat,
  );
}

export function deleteBeat(
  beats: Beat[],
  beatId: string,
): Beat[] {
  return beats.filter((beat) => beat.id !== beatId);
}

export function addBeatSales(
  beats: Beat[],
  beatName: string,
  amount: number,
): Beat[] {
  return beats.map((beat) =>
    beat.name === beatName
      ? {
          ...beat,
          salesToday: beat.salesToday + amount,
        }
      : beat,
  );
}
