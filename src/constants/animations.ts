import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0 }
};

export const slideUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const slideInRight: Variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const staggerContainer: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export const cardHover = {
    hover: {
        y: -5,
        boxShadow: "0px 10px 20px rgba(68, 51, 85, 0.1)",
        transition: { duration: 0.3, ease: 'easeInOut' }
    }
};

export const buttonClick = {
    tap: { scale: 0.95 },
    hover: { scale: 1.02 }
};
