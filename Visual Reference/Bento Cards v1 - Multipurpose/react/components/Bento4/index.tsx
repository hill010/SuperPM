import styles from "./Bento4.module.sass";
import Image from "@/components/Image";

type BentoProps = {};

const Bento = ({}: BentoProps) => (
    <div className={styles.bento}>
        <div className={styles.circles}>
            <Image
                src="/images/bento-4-circles.svg"
                width={336}
                height={336}
                alt=""
            />
        </div>
        <div className={styles.toggles}>
            <Image
                src="/images/bento-4-toggles.svg"
                width={336}
                height={336}
                alt=""
            />
        </div>
    </div>
);

export default Bento;
