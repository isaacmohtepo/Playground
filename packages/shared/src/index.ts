export type ApprovalState = "DRAFT" | "PENDING_REVIEW" | "CHANGES_REQUESTED" | "APPROVED";

export type AssetKind = "IMAGE" | "VIDEO" | "PDF" | "LANDING_PAGE" | "SOCIAL";

export type CommentAuthorType = "AGENCY_USER" | "CLIENT_PUBLIC";

export interface CommentPin {
  x: number;
  y: number;
  timestampSec?: number | null;
}
