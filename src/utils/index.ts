/* eslint-disable prefer-const */
import { BigInt, BigDecimal, ethereum } from '@graphprotocol/graph-ts'
import { Transaction } from '../types/schema'
import { ONE_BI, ZERO_BI, ZERO_BD, ONE_BD } from '../utils/constants'

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

// return 0 if denominator is 0 in division
export function safeDiv(amount0: BigDecimal, amount1: BigDecimal): BigDecimal {
  if (amount1.equals(ZERO_BD)) {
    return ZERO_BD
  } else {
    return amount0.div(amount1)
  }
}

/**
 * Implements exponentiation by squaring
 * (see https://en.wikipedia.org/wiki/Exponentiation_by_squaring )
 * to minimize the number of BigDecimal operations and their impact on performance.
 */
export function fastExponentiation(value: BigDecimal, power: i32): BigDecimal {
  if (power < 0) {
    let result = fastExponentiation(value, -power);
    return safeDiv(ONE_BD, result);
  }

  if (power == 0) {
    return ONE_BD;
  }

  if (power == 1) {
    return value;
  }

  let halfPower = power / 2;
  let halfResult = fastExponentiation(value, halfPower);

  // Use the fact that x ^ (2n) = (x ^ n) * (x ^ n) and we can compute (x ^ n) only once.
  let result = halfResult.times(halfResult);

  // For odd powers, x ^ (2n + 1) = (x ^ 2n) * x
  if (power % 2 == 1) {
    result = result.times(value);
  }
  return result;
}

export function tokenAmountToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal()
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function priceToDecimal(amount: BigDecimal, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return amount
  }
  return safeDiv(amount, exponentToBigDecimal(exchangeDecimals))
}

export function equalToZero(value: BigDecimal): boolean {
  const formattedVal = parseFloat(value.toString())
  const zero = parseFloat(ZERO_BD.toString())
  if (zero == formattedVal) {
    return true
  }
  return false
}

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString('1000000000000000000')
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal()
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(exponentToBigDecimal(18))
}

export function loadTransaction(event: ethereum.Event): Transaction {
  let transaction = Transaction.load(event.transaction.hash.toHexString())
  if (transaction === null) {
    transaction = new Transaction(event.transaction.hash.toHexString())
  }
  transaction.blockNumber = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.gasUsed = BigInt.zero() //needs to be moved to transaction receipt
  transaction.gasPrice = event.transaction.gasPrice
  transaction.save()
  return transaction as Transaction
}
