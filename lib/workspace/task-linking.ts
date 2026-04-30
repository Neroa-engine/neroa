import { z } from "zod";

const nullableLinkIdSchema = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();

export const taskExecutionLinkSchema = z
  .object({
    customerTaskId: nullableLinkIdSchema.default(null),
    buildRoomTaskId: nullableLinkIdSchema.default(null),
    executionPacketId: nullableLinkIdSchema.default(null)
  })
  .strict();

export type TaskExecutionLink = z.infer<typeof taskExecutionLinkSchema>;

export function normalizeTaskExecutionLink(
  value: unknown
): TaskExecutionLink | null {
  const result = taskExecutionLinkSchema.safeParse(value);

  if (!result.success) {
    return null;
  }

  const link = result.data;

  return link.customerTaskId || link.buildRoomTaskId || link.executionPacketId
    ? link
    : null;
}

export function buildTaskExecutionLink(args: {
  customerTaskId?: string | null;
  buildRoomTaskId?: string | null;
  executionPacketId?: string | null;
}) {
  return normalizeTaskExecutionLink(args);
}

export function taskExecutionLinksMatch(
  left: TaskExecutionLink | null | undefined,
  right: TaskExecutionLink | null | undefined
) {
  const normalizedLeft = normalizeTaskExecutionLink(left);
  const normalizedRight = normalizeTaskExecutionLink(right);

  if (!normalizedLeft && !normalizedRight) {
    return true;
  }

  if (!normalizedLeft || !normalizedRight) {
    return false;
  }

  return (
    normalizedLeft.customerTaskId === normalizedRight.customerTaskId &&
    normalizedLeft.buildRoomTaskId === normalizedRight.buildRoomTaskId &&
    normalizedLeft.executionPacketId === normalizedRight.executionPacketId
  );
}

export function buildTaskExecutionLinkSearchParams(
  link: TaskExecutionLink | null | undefined
) {
  const normalized = normalizeTaskExecutionLink(link);
  const params = new URLSearchParams();

  if (normalized?.customerTaskId) {
    params.set("customerTaskId", normalized.customerTaskId);
  }

  if (normalized?.buildRoomTaskId) {
    params.set("buildRoomTaskId", normalized.buildRoomTaskId);
  }

  if (normalized?.executionPacketId) {
    params.set("executionPacketId", normalized.executionPacketId);
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}
