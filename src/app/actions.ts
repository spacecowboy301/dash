"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { transitionFinding } from "@/domain/findings/repository";

const actionSchema = z.object({
  findingId: z.coerce.number().int().positive(),
  status: z.enum(["reviewed", "dismissed", "snoozed", "acted"]),
});

export async function updateFindingStatus(formData: FormData): Promise<void> {
  const input = actionSchema.parse({
    findingId: formData.get("findingId"),
    status: formData.get("status"),
  });
  const snoozedUntil =
    input.status === "snoozed"
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000)
      : undefined;
  await transitionFinding(input.findingId, input.status, {
    snoozedUntil,
    note: input.status === "snoozed" ? "Snoozed for seven days." : undefined,
  });
  revalidatePath("/");
}
