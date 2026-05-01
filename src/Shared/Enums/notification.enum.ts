export enum NotificationType {
  INTERVIEW_SCHEDULED = "interview_scheduled",
  FEEDBACK_SUBMITTED = "feedback_submitted",
  HIRED = "Hired",
  OFFER_SENT = "offer_sent",
  INTERVIEW_RESCHEDULED = "interview_rescheduled",
  INTERVIEW_CANCELLED = "interview_cancelled",
  REJECTED = "rejected",
  INVIT = "Invit",
}

export const NotificationTitleMap: Record<NotificationType, string> = {
  [NotificationType.INTERVIEW_SCHEDULED]: "Interview Scheduled",
  [NotificationType.FEEDBACK_SUBMITTED]: "Feedback Available",
  [NotificationType.HIRED]: "You're Hired!",
  [NotificationType.OFFER_SENT]: "Offer Received",
  [NotificationType.INTERVIEW_RESCHEDULED]: "Interview Rescheduled",
  [NotificationType.INTERVIEW_CANCELLED]: "Interview Cancelled",
  [NotificationType.REJECTED]: "Application Update",
  [NotificationType.INVIT]: "Invit Applicant",
};
