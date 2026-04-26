import Image from "@/components/Image";
import styles from "./Bento1.module.sass";

type BentoProps = {};

const Bento = ({}: BentoProps) => (
    <div className={styles.bento}>
        <div className={styles.grid}>
            <Image
                src="/images/bento-1-grid.svg"
                width={336}
                height={336}
                alt=""
            />
        </div>
        <div className={styles.cursor}>
            <Image
                src="/images/bento-1-cursor.svg"
                width={20}
                height={20}
                alt=""
            />
        </div>
    </div>
);

export default Bento;
