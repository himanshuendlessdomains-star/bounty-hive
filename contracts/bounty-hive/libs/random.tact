// Simple on-chain pseudo-random number generator for Tact
// Uses block seed + logical time for randomness
// NOTE: On-chain randomness in TON is deterministic and can be influenced
// by validators. For production, consider using an oracle-based randomness
// source (e.g., Tonstakers VRF when available).

/// Generate a pseudo-random integer from a seed
/// Uses a simple linear congruential generator
fun randomInt(seed: Int): Int {
    // Constants for LCG (Numerical Recipes)
    let a: Int = 1664525;
    let c: Int = 1013904223;
    return (a * seed + c) % 4294967296; // mod 2^32
}

/// Generate a random integer in range [0, max)
fun randomInRange(seed: Int, max: Int): Int {
    if (max <= 0) { return 0; }
    return randomInt(seed) % max;
}
