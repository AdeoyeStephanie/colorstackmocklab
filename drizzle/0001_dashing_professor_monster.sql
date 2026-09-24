CREATE TYPE "public"."availability_status" AS ENUM('OPEN', 'BOOKED', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."credit_reason" AS ENUM('WELCOME_BONUS', 'MOCK_BOOKED', 'MOCK_COMPLETED_AS_INTERVIEWER', 'REVIEW_SUBMITTED', 'LATE_CANCELLATION', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "public"."interview_type" AS ENUM('TECHNICAL', 'BEHAVIORAL');--> statement-breakpoint
CREATE TYPE "public"."mock_interview_status" AS ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED_BY_INTERVIEWER', 'CANCELLED_BY_INTERVIEWEE', 'INTERVIEWER_NO_SHOW', 'INTERVIEWEE_NO_SHOW');--> statement-breakpoint
CREATE TABLE "availability_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interviewer_id" uuid NOT NULL,
	"interview_type" "interview_type" NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"timezone" text NOT NULL,
	"communication_method" text NOT NULL,
	"platform" text NOT NULL,
	"status" "availability_status" DEFAULT 'OPEN' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(6, 2) NOT NULL,
	"reason" "credit_reason" NOT NULL,
	"mock_interview_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mock_interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slot_id" uuid NOT NULL,
	"interviewer_id" uuid NOT NULL,
	"interviewee_id" uuid NOT NULL,
	"status" "mock_interview_status" DEFAULT 'SCHEDULED' NOT NULL,
	"booked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"concluded_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_interviewer_id_users_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_slot_id_availability_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."availability_slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_interviewer_id_users_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_interviewee_id_users_id_fk" FOREIGN KEY ("interviewee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;