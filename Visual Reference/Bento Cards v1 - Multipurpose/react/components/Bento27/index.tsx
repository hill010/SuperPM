import Image from "@/components/Image";
import styles from "./Bento27.module.sass";

type BentoProps = {};

const Bento = ({}: BentoProps) => (
    <div className={styles.bento}>
        <div className={styles.dots}>
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div className={styles.grid}>
            <Image
                src="/images/bento-27-grid.svg"
                width={336}
                height={336}
                alt=""
            />
        </div>
        <div className={styles.cursor}>
            <Image
                src="/images/bento-27-cursor.svg"
                width={20}
                height={20}
                alt=""
            />
        </div>
    </div>
);

export default Bento;
