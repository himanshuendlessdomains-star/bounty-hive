import { CompilerConfig } from '@tact-lang/compiler';

export const compilerConfig: CompilerConfig = {
    targets: ['./BountyFactory.tact'],
    options: {
        debug: false,
        external: false,
    },
};
