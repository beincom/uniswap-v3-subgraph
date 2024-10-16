import { BigInt } from '@graphprotocol/graph-ts'

import { Bundle, Pool, Token } from '../../types/schema'
import { Initialize } from '../../types/templates/Pool/Pool'
import { updatePoolDayData, updatePoolHourData } from '../../utils/intervalUpdates'
import { findEthPerToken, getEthPriceInUSD } from '../../utils/pricing'

export function handleInitialize(event: Initialize): void {
  // update pool sqrt price and tick
  const pool = Pool.load(event.address.toHexString())!
  pool.sqrtPrice = event.params.sqrtPriceX96
  pool.tick = BigInt.fromI32(event.params.tick)
  pool.save()

  // update token prices
  const token0 = Token.load(pool.token0)
  const token1 = Token.load(pool.token1)

  // update ETH price now that prices could have changed
  const bundle = Bundle.load('1')!
  bundle.ethPriceUSD = getEthPriceInUSD()
  bundle.save()

  // TODO(Ted): Dont record tx to optimize fee
  // updatePoolDayData(event)
  // updatePoolHourData(event)

  // update token prices
  if (token0 && token1) {
    token0.derivedETH = findEthPerToken(token0 as Token)
    token1.derivedETH = findEthPerToken(token1 as Token)
    token0.save()
    token1.save()
  }
}
