// BountyFactory — deploys BountyEscrow contracts and tracks all bounties

import "@stdlib/ownable";

// ─── Messages ────────────────────────────────────────────────────────────────

message CreateBounty {
    title: String;
    description: String;
    bountyType: String;
    winnerCount: Int;
    winnerSelection: String;
    verification: String;
    verificationRule: String;
}

// ─── Contract ────────────────────────────────────────────────────────────────

contract BountyFactory with Ownable {

    platformFeeBps: Int;       // platform fee in basis points (100 = 1%)
    platformAddress: Address;
    bountyCount: Int;
    bounties: map<Int, Address>; // index -> BountyEscrow address

    init(platformFeeBps: Int, platformAddress: Address) {
        self.owner = sender();
        self.platformFeeBps = platformFeeBps;
        self.platformAddress = platformAddress;
        self.bountyCount = 0;
        self.bounties = emptyMap();
    }

    receive(msg: CreateBounty) {
        // Validate minimum payout: pool must cover $0.01 per winner
        // The pool amount is msg.value (TON sent with this message)
        let poolAmount = msg.value;
        let perWinner = poolAmount / msg.winnerCount;

        // Minimum per-winner: 1000000 nanotons (~0.001 TON, well above $0.01)
        require(perWinner >= 1000000, "Per-winner payout too low");
        require(msg.winnerCount >= 1, "Must have at least 1 winner");
        require(msg.winnerSelection == "draw" || msg.winnerSelection == "manual", "Invalid selection");
        require(msg.verification == "manual" || msg.verification == "auto", "Invalid verification");

        // Deploy new BountyEscrow contract
        let escrow = initOf BountyEscrow(
            owner: sender(),
            title: msg.title,
            description: msg.description,
            bountyType: msg.bountyType,
            poolAmount: poolAmount,
            winnerCount: msg.winnerCount,
            winnerSelection: msg.winnerSelection,
            verification: msg.verification,
            verificationRule: msg.verificationRule,
            platformFeeBps: self.platformFeeBps,
            platformAddress: self.platformAddress,
            createdAt: now()
        );

        // Send the pool amount to the escrow contract
        send(SendParameters {
            to: contractAddress(escrow),
            value: poolAmount,
            mode: SendPayGasSeparately,
        });

        // Track the bounty
        self.bounties.set(self.bountyCount, contractAddress(escrow));
        self.bountyCount = self.bountyCount + 1;
    }

    // ─── Getters ─────────────────────────────────────────────────────────────

    get fun bountyCount(): Int { return self.bountyCount; }
    get fun platformFeeBps(): Int { return self.platformFeeBps; }
    get fun platformAddress(): Address { return self.platformAddress; }

    get fun bountyAddress(index: Int): Address {
        return self.bounties.get(index)!!;
    }
}
