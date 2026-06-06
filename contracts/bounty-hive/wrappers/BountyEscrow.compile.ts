import { CompilerConfig } from '@tact-lang/compiler';

export const compilerConfig: CompilerConfig = {
    targets: ['./BountyEscrow.tact'],
    options: {
        debug: false,
        external: false,
    },
};
