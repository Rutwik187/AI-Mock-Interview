import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const interview = pgTable(
  "interview",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    resumeText: text("resume_text").notNull(),
    jobRole: text("job_role").notNull().default("Software Developer"),
    status: text("status", {
      enum: ["generating", "in_progress", "completed", "evaluated"],
    })
      .notNull()
      .default("generating"),
    overallScore: integer("overall_score"),
    feedbackSummary: text("feedback_summary"),
    feedbackJson: jsonb("feedback_json"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("interview_userId_idx").on(table.userId)],
);

export const interviewQuestion = pgTable(
  "interview_question",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    interviewId: text("interview_id")
      .notNull()
      .references(() => interview.id, { onDelete: "cascade" }),
    questionNumber: integer("question_number").notNull(),
    questionText: text("question_text").notNull(),
    category: text("category").notNull().default("general"),
    difficulty: text("difficulty", {
      enum: ["easy", "medium", "hard"],
    })
      .notNull()
      .default("medium"),
    userAnswer: text("user_answer"),
    answeredAt: timestamp("answered_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("question_interviewId_idx").on(table.interviewId)],
);

// Relations
export const interviewRelations = relations(interview, ({ one, many }) => ({
  user: one(user, {
    fields: [interview.userId],
    references: [user.id],
  }),
  questions: many(interviewQuestion),
}));

export const interviewQuestionRelations = relations(
  interviewQuestion,
  ({ one }) => ({
    interview: one(interview, {
      fields: [interviewQuestion.interviewId],
      references: [interview.id],
    }),
  }),
);
