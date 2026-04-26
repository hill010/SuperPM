import Image from "@/components/Image";
import styles from "./Bento15.module.sass";

type BentoProps = {};

const Bento = ({}: BentoProps) => (
    <div className={styles.bento}>
        <div className={styles.image}>
            <Image src="/images/bento-15.svg" width={336} height={336} alt="" />
        </div>
    </div>
);

export default Bento;
