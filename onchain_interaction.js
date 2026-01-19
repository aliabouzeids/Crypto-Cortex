import { createPublicClient,getContract, http } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import 'dotenv/config'

const account = privateKeyToAccount(PRIVATE_KEY)

//https://sepolia.infura.io/v3/cf1b77a759114db3a815944536bc117b

const client = createPublicClient(
  sepolia,
  http(`https://sepolia.infura.io/v3/cf1b77a759114db3a815944536bc117b`)
)


const abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',

])
const contract= getContract(
  abi ,
  address,
  client
)

const contract_address=`0xF9AB1c552cEB4665074C854B70ae9eeF72BC5e10`
const balance = await client.readContract({
  contract_address,
  abi,
  function:'balanceOf',
  account
})
console.log(balance)

const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd", {
  headers: { "x-cg-pro-api-key": process.env.CG_API_KEY }
})
const data = await res.json()
console.log("ETH price in USD:", data.ethereum.usd)