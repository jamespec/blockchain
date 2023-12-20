const express = require('express')
const router = express.Router()

const ethers = require('ethers')
const boxABI = require('../artifacts/contracts/Box.sol/Box.json')
const boxRegistryABI = require('../artifacts/contracts/BoxRegistry.sol/BoxRegistry.json')

const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const boxRegistryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

// Deploy new box
router.post('/', async (req, res) => {
    const { boxName } = req.body

    if( boxName ) {
        if( boxMap[boxName] ) {
            return res.status(400).json({ error: "boxName already in use" })
        }

        const provider = new ethers.JsonRpcProvider()
        const wallet = new ethers.Wallet(privateKey, provider);
        const Box = await ethers.ContractFactory.fromSolidity(boxABI, wallet)

        console.log('Deploying Box...');
        const box = await Box.deploy();
        await box.waitForDeployment();
        console.log(`Box ${boxName} deployed to: ${await box.getAddress()}`);

        const BoxRegistry = await ethers.ContractFactory.fromSolidity(boxRegistryABI, wallet)
        const boxRegistryContract = new ethers.Contract(boxRegistryAddress, BoxRegistry.interface, wallet)
        await boxRegistryContract.registerBox( boxName, await box.getAddress())
        console.log( `Box ${boxName} registred`)

        res.send(`Box ${boxName} deployed to: ${await box.getAddress()}` )
    }
    else
        return res.status(400).json({ error: "boxName required" })
})

router.get('/address/:boxName', async (req, res) => {
    const boxName = req.params.boxName

    if( boxName ) {
        const provider = new ethers.JsonRpcProvider()
        // const wallet = new ethers.Wallet(privateKey, provider);

        const BoxRegistry = await ethers.ContractFactory.fromSolidity(boxRegistryABI, provider)
        const boxRegistryContract = new ethers.Contract(boxRegistryAddress, BoxRegistry.interface, provider)
        const address = await boxRegistryContract.boxAddress( boxName )
        console.log( `Box ${boxName} at ${address}`)

        res.send(`Box ${boxName} deployed to: ${address}` )
    }
    else
        return res.status(400).json({ error: "boxName not registered" })
})

router.get('/:boxName', async (req, res) => {
    const boxName = req.params.boxName

    const provider = new ethers.JsonRpcProvider()
    const BoxRegistry = await ethers.ContractFactory.fromSolidity(boxRegistryABI, provider)
    const boxRegistryContract = new ethers.Contract(boxRegistryAddress, BoxRegistry.interface, provider)
    const boxAddress = await boxRegistryContract.boxAddress( boxName )
    console.log( `Box ${boxName} at ${boxAddress}`)

//    const wallet = new ethers.Wallet(privateKey, provider);
    const Box = await ethers.ContractFactory.fromSolidity(boxABI, provider)
    const boxContract = new ethers.Contract(boxAddress, Box.interface, provider)
    const value = await boxContract.retrieve()
    console.log(value)

    res.send(`Retreived value ${value} from box ${boxName} as ${boxAddress}` )
})

router.put('/:boxName', async (req, res) => {
    const boxName = req.params.boxName
    const { value } = req.body

    if( value ) {
        const provider = new ethers.JsonRpcProvider()
        const BoxRegistry = await ethers.ContractFactory.fromSolidity(boxRegistryABI, provider)
        const boxRegistryContract = new ethers.Contract(boxRegistryAddress, BoxRegistry.interface, provider)
        const boxAddress = await boxRegistryContract.boxAddress( boxName )
        console.log( `Box ${boxName} at ${boxAddress}`)

        const wallet = new ethers.Wallet(privateKey, provider);
        const Box = await ethers.ContractFactory.fromSolidity(boxABI)
        const boxContract = new ethers.Contract(boxAddress, Box.interface, wallet)
        await boxContract.store(value);
        console.log( `Box ${boxName} with value ${value}`)

        res.send(`Stored value ${value} in box ${req.params.boxName} at ${boxAddress}` )
    }
})

module.exports = router
