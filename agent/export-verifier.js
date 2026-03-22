/**
 * Exports the Groth16 Solidity verifier from the ZK proving key.
 * Run after `npm run zk:setup`.
 * Writes contracts/src/CreditVerifier.sol
 */
import { exportSolidityVerifier } from './src/zkCredit.js'
import { writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const sol = await exportSolidityVerifier()
if (!sol) {
  console.error('ZK keys not found. Run `npm run zk:setup` first.')
  process.exit(1)
}

const outPath = path.join(__dirname, '..', 'contracts', 'src', 'CreditVerifier.sol')
await writeFile(outPath, sol)
console.log('✅ CreditVerifier.sol written to', outPath)
