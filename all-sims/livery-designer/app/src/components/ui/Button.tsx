import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ children, ...rest }: PropsWithChildren<ButtonProps>) => {
    return (
        <button className={styles.button} {...rest}>
            {children}
        </button>
    );
};
