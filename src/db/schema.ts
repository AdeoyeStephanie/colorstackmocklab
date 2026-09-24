import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  numeric,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  school: text("school"),
  major: text("major"),
  company: text("company"),
  roleTitle: text("role_title"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});


export const creditReasonEnum = pgEnum("credit_reason", [
  "WELCOME_BONUS",
  "MOCK_BOOKED",
  "MOCK_COMPLETED_AS_INTERVIEWER",
  "REVIEW_SUBMITTED",
  "LATE_CANCELLATION",
  "NO_SHOW",
]);

export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  amount: numeric("amount", {
    precision: 6,
    scale: 2,
  }).notNull(),
  reason: creditReasonEnum("reason")
    .notNull(),
  mockInterviewId: uuid("mock_interview_id"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

// --------------------
// Availability Enums
// --------------------

export const availabilityStatusEnum = pgEnum("availability_status", [
  "OPEN",
  "BOOKED",
  "CANCELLED",
  "EXPIRED",
]);

export const interviewTypeEnum = pgEnum("interview_type", [
  "TECHNICAL",
  "BEHAVIORAL",
]);

// --------------------
// Availability Slot
// --------------------

export const availabilitySlots = pgTable("availability_slots", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  interviewerId: uuid("interviewer_id")
    .notNull()
    .references(() => users.id),

  interviewType: interviewTypeEnum("interview_type")
    .notNull(),

  startTime: timestamp("start_time", {
    withTimezone: true,
  }).notNull(),

  endTime: timestamp("end_time", {
    withTimezone: true,
  }).notNull(),

  timezone: text("timezone")
    .notNull(),

  communicationMethod: text("communication_method")
    .notNull(),

  platform: text("platform")
    .notNull(),

  status: availabilityStatusEnum("status")
    .default("OPEN")
    .notNull(),
});

export const mockInterviewStatusEnum = pgEnum("mock_interview_status", [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED_BY_INTERVIEWER",
  "CANCELLED_BY_INTERVIEWEE",
  "INTERVIEWER_NO_SHOW",
  "INTERVIEWEE_NO_SHOW",
]);

export const mockInterviews = pgTable("mock_interviews", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  slotId: uuid("slot_id")
    .notNull()
    .references(() => availabilitySlots.id),

  interviewerId: uuid("interviewer_id")
    .notNull()
    .references(() => users.id),

  intervieweeId: uuid("interviewee_id")
    .notNull()
    .references(() => users.id),

  status: mockInterviewStatusEnum("status")
    .default("SCHEDULED")
    .notNull(),

  bookedAt: timestamp("booked_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  concludedAt: timestamp("concluded_at", {
    withTimezone: true,
  }),
});