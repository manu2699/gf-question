import styles from "./styles.module.css";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  isLoading: boolean;
  value: string | number;
  change: string | number;
  trend: "up" | "down";
}

export const StatsCard = ({
  icon,
  label,
  isLoading,
  value,
  change,
  trend,
}: StatsCardProps) => {
  if (isLoading) return <CardSkeleton />;
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <div className={styles.iconWrapper}>{icon}</div>
        <span className={`${styles.change} ${styles[trend]}`}>{change}</span>
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
    </div>
  );
};

const CardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <div className={styles.iconWrapper}>
          <div className={`${styles.iconSkeleton} skeleton`}></div>
        </div>
      </div>
      <div className={styles.content}>
        <div className={`${styles.labelSkeleton} skeleton`}></div>
        <div className={`${styles.valueSkeleton} skeleton`}></div>
      </div>
    </div>
  );
};
