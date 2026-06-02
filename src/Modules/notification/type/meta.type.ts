import { NotificationType } from "src/Shared/Enums/notification.enum";

type InterviewMeta = {
  interviewId: string;
  companyName: string;
  interviewDate?: string;
  jobTitle: string;
};

type ApplyMeta = {
  applicationId: string;
  applicantName: string;
  jobTitle: string;
  jobId: string;
};

type OfferMeta = {
  jobId: string;
  companyName: string;
};

type OfferResponseMeta = {
  applicationId: string;
  applicantName: string;
  offerId: string;
};

type HiredMeta = {
  jobId: string;
  companyName: string;
};

type RejectedMeta = {
  jobId: string;
  companyName: string;
  jobTitle: string;
};

export type NotificationMetaMap = {
  [NotificationType.INTERVIEW_SCHEDULED]: InterviewMeta;
  [NotificationType.OFFER_RESPONSE]: OfferResponseMeta;
  [NotificationType.INTERVIEW_RESCHEDULED]: InterviewMeta;
  [NotificationType.INTERVIEW_CANCELLED]: InterviewMeta;

  [NotificationType.OFFER_SENT]: OfferMeta;
  [NotificationType.HIRED]: HiredMeta;
  [NotificationType.APPLY_JOB]: ApplyMeta;

  [NotificationType.REJECTED]: RejectedMeta;
  [NotificationType.INVIT]: RejectedMeta;

  [NotificationType.FEEDBACK_SUBMITTED]: {
    companyName: string;
    nextStep: string;
  };
};
