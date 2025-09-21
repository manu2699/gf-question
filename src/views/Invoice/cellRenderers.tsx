import { MessageCircle } from "lucide-react";
import styles from "./styles.module.css";
import { InvoiceStatuses } from "./type";

export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case InvoiceStatuses.DRAFT:
        return styles.statusDraft;
      case InvoiceStatuses.PENDING:
        return styles.statusPending;
      case InvoiceStatuses.PAID:
        return styles.statusPaid;
      case InvoiceStatuses.OVERDUE:
        return styles.statusOverdue;
      default:
        return "";
    }
  };

  return (
    <span className={`${styles.statusBadge} ${getStatusClass(status)}`}>
      {status}
    </span>
  );
};

export const CommentCell = ({ comments }: { comments: string[] }) => (
  <div className={styles.commentIcon}>
    <MessageCircle size={14} /> {comments?.length || 0}
  </div>
);
