import { X } from "lucide-react";
import styles from "./styles.module.css";

export const Modal = ({
  isOpen,
  children,
  title,
  width = "400px",
  height = "auto",
  footerRenderer,
  onClose,
}: {
  isOpen: boolean;
  children: React.ReactNode;
  title: string;
  width?: string;
  height?: string;
  onClose: () => void;
  footerRenderer?: () => React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent} style={{ width, height }}>
        <div className={styles.modalHeader}>
          <h4>{title}</h4>
          <div className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </div>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footerRenderer && (
          <div className={styles.modalFooter}>{footerRenderer()}</div>
        )}
      </div>
    </div>
  );
};
