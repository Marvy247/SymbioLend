pragma circom 2.0.0;

// Proves: creditScore >= minScore, without revealing creditScore
// Public inputs: minScore, commitment = hash(creditScore, salt)
// Private inputs: creditScore, salt

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/poseidon.circom";

template CreditProof() {
    signal input creditScore;   // private
    signal input salt;          // private
    signal input minScore;      // public
    signal output commitment;   // public: Poseidon(creditScore, salt)

    // 1. Prove creditScore >= minScore
    component gte = GreaterEqThan(10); // 10-bit comparison (0-1023)
    gte.in[0] <== creditScore;
    gte.in[1] <== minScore;
    gte.out === 1;

    // 2. Commit to creditScore so verifier can check consistency
    component hasher = Poseidon(2);
    hasher.inputs[0] <== creditScore;
    hasher.inputs[1] <== salt;
    commitment <== hasher.out;
}

component main { public [minScore] } = CreditProof();
