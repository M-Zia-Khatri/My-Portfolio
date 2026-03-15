// export const customeSize = {
//     8.5: '54px',
//     10: "68px"
// } as const

export const HEADING = {
    h1: {
        size: { initial: '5', xs: '6', sm: '7', md: '8', lg: '9', xl: '9' }
    },
    h2: {
        size: { initial: '4', xs: '5', sm: '6', md: '7', lg: '8', xl: '9' }
    },
    h3: {
        size: { initial: '3', xs: '4', sm: '5', md: '6', lg: '7', xl: '8' }
    },
    h4: {
        size: { initial: '2', xs: '3', sm: '4', md: '5', lg: '6', xl: '7' }
    },
    h5: {
        size: { initial: '1', xs: '2', sm: '3', md: '4', lg: '5', xl: '6' }
    },
    h6: {
        size: { initial: '1', xs: '1', sm: '2', md: '3', lg: '4', xl: '5' }
    }

} as const;

export const TEXT = {
    sm: {
        size: { initial: '1', xs: '1', sm: '1', md: '1', lg: '1', xl: '2' }
    },
    base: {
        size: { initial: '1', xs: '1', sm: '1', md: '1', lg: '2', xl: '3' }
    },
    lg: {
        size: { initial: '1', xs: '1', sm: '1', md: '2', lg: '3', xl: '4' }
    }
} as const;