import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { BountyEscrow } from '../build/BountyEscrow/BountyEscrow_BountyEscrow';
import { BountyFactory } from '../build/BountyFactory/BountyFactory_BountyFactory';
import { expect } from 'chai';

describe('BountyEscrow', () => {
    let blockchain: Blockchain;
    let owner: SandboxContract<TreasuryContract>;
    let hunter: SandboxContract<TreasuryContract>;
    let platform: SandboxContract<TreasuryContract>;
    let factory: SandboxContract<BountyFactory>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        owner = await blockchain.treasury('owner');
        hunter = await blockchain.treasury('hunter');
        platform = await blockchain.treasury('platform');
    });

    it('should create a bounty with correct parameters', async () => {
        const poolAmount = toNano('1'); // 1 TON
        const winnerCount = 10;

        // Deploy factory
        const factory = blockchain.openContract(
            BountyFactory.fromInit(100, platform.address) // 1% fee
        );

        // Deploy escrow via factory
        const escrow = blockchain.openContract(
            BountyEscrow.fromInit(
                owner.address,
                'Follow me on Twitter',
                'Follow and share screenshot',
                'task',
                poolAmount,
                winnerCount,
                'draw',
                'manual',
                '',
                100,
                platform.address,
                Math.floor(Date.now() / 1000)
            )
        );

        // Verify getters
        expect((await escrow.getTitle()).toString()).to.equal('Follow me on Twitter');
        expect((await escrow.getStatus()).toString()).to.equal('active');
        expect((await escrow.getWinnerCount()).toNumber()).to.equal(10);
        expect((await escrow.getPerWinnerAmount()).toNumber()).to.equal(poolAmount / winnerCount);
    });

    it('should allow submitting proof during active period', async () => {
        // Setup bounty...
        // Submit proof
        // Verify submission count increased
    });

    it('should reject submissions after bounty ends', async () => {
        // Setup bounty, advance time past endsAt
        // Try to submit, expect failure
    });

    it('should distribute payouts via draw after review window', async () => {
        // Setup bounty with draw selection
        // Add submissions
        // Advance time past review window
        // Trigger auto_complete
        // Verify payouts
    });

    it('should allow manual winner selection', async () => {
        // Setup bounty with manual selection
        // Add and approve submissions
        // Select winners manually
        // Verify payouts
    });

    it('should refund if no submissions', async () => {
        // Setup bounty, advance past review window
        // Trigger auto_complete
        // Verify refund to owner
    });

    it('should cancel active bounty and refund', async () => {
        // Create bounty, cancel it
        // Verify refund
    });
});
