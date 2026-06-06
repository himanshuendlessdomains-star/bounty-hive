import { CompilerConfig } from '@tact-lang/compiler';

export const compilerConfig: CompilerConfig = {
    targets: ['contracts/bounty-hive/BountyFactory.tact'],
    options: {
        debug: false,
        external: false,
    },
};
