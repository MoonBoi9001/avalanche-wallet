import { BaseTx as AVMBaseTx, TransferableOutput } from 'avalanche/dist/apis/avm'
import { BaseTx as PlatformBaseTx } from 'avalanche/dist/apis/platformvm'
import { EVMBaseTx } from 'avalanche/dist/apis/evm'
import { AddDelegatorTx, AddValidatorTx } from 'avalanche/dist/apis/platformvm'
import { bintools, ava as avalanche } from '@/AVA'

import { UnsignedTx as AVMUnsignedTx } from 'avalanche/dist/apis/avm/tx'
import { UnsignedTx as PlatformUnsignedTx } from 'avalanche/dist/apis/platformvm/tx'
import { UnsignedTx as EVMUnsignedTx } from 'avalanche/dist/apis/evm/tx'

/**
 * Returns an array of unique addresses that are found on stake outputs of a tx.
 * @param tx
 */
export function getStakeOutAddresses(tx: AVMBaseTx | PlatformBaseTx | EVMBaseTx) {
    if (tx instanceof AddValidatorTx || tx instanceof AddDelegatorTx) {
        const allAddrs = tx
            .getStakeOuts()
            .map((out) =>
                out
                    .getOutput()
                    .getAddresses()
                    .map((addr) => {
                        return bintools.addressToString(avalanche.getHRP(), 'P', addr)
                    })
            )
            .flat()
        // Remove duplicates
        return [...new Set(allAddrs)]
    }

    return []
}

export function getOutputAddresses(tx: AVMBaseTx | PlatformBaseTx) {
    const chainID = tx instanceof AVMBaseTx ? 'X' : 'P'
    const outAddrs = tx
        .getOuts()
        .map((out: TransferableOutput) =>
            out
                .getOutput()
                .getAddresses()
                .map((addr) => {
                    return bintools.addressToString(avalanche.getHRP(), chainID, addr)
                })
        )
        .flat()
    return [...new Set(outAddrs)]
}

/**
 * Returns every output address for the given transaction.
 * @param unsignedTx
 */
export function getTxOutputAddresses<
    UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx
>(unsignedTx: UnsignedTx) {
    if (unsignedTx instanceof EVMUnsignedTx) {
        return []
    }

    // console.log(unsignedTx.serialize('display'));

    const tx = unsignedTx.getTransaction()
    if (unsignedTx instanceof AVMUnsignedTx) {
        const outAddrs = getOutputAddresses(tx)
        return outAddrs
    } else if (unsignedTx instanceof PlatformUnsignedTx) {
        const stakeAddrs = getStakeOutAddresses(tx)
        const outAddrs = getOutputAddresses(tx)

        return [...new Set([...stakeAddrs, ...outAddrs])]
    }

    return []
}
