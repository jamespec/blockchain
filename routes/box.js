const express = require('express')
const router = express.Router()

const ethers = require('ethers')
const BoxABI = require('../artifacts/contracts/Box.sol/Box.json')
const ContractRegistryABI = require('../artifacts/contracts/ContractRegistry.sol/ContractRegistry.json')

const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const registryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

// Deploy new box
router.post('/', async (req, res) => {
    const { boxName } = req.body

    if( boxName ) {
        const provider = new ethers.JsonRpcProvider()
        const wallet = new ethers.Wallet(privateKey, provider);
        const ContractRegistry = await ethers.ContractFactory.fromSolidity(ContractRegistryABI, wallet)
        const registry = new ethers.Contract(registryAddress, ContractRegistry.interface, wallet)

        // Check if boxName already registered
        const boxAddress = await registry.lookupAddress( boxName )
        if( boxAddress != '0x0000000000000000000000000000000000000000' ) {
            console.log( `Box '${boxName}' already in use at ${boxAddress}`)
            return res.status(400).json({ error: `boxName '${boxName}' already in use` })
        }

        const Box = await ethers.ContractFactory.fromSolidity(BoxABI, wallet)

        console.log('Deploying Box...');
        const box = await Box.deploy();
        await box.waitForDeployment();
        console.log(`Box '${boxName}' deployed to: ${await box.getAddress()}`);

        await registry.register( boxName, await box.getAddress())
        console.log( `Box '${boxName}' registered`)

        res.send(`Box '${boxName}' deployed to: ${await box.getAddress()}` )
    }
    else
        return res.status(400).json({ error: "boxName required" })
})

router.get('/address/:boxName', async (req, res) => {
    const boxName = req.params.boxName

    if( boxName ) {
        const provider = new ethers.JsonRpcProvider()
        const ContractRegistry = await ethers.ContractFactory.fromSolidity(ContractRegistryABI, provider)
        const registry = new ethers.Contract(registryAddress, ContractRegistry.interface, provider)
        const address = await registry.lookupAddress( boxName )
        console.log( `Box ${boxName} at ${address}`)

        res.send(`Box '${boxName}' deployed at ${address}` )
    }
    else
        return res.status(400).json({ error: `boxName '${boxName}' not registered` })
})

router.get('/:boxName', async (req, res) => {
    const boxName = req.params.boxName

    const provider = new ethers.JsonRpcProvider()
    const ContractRegistry = await ethers.ContractFactory.fromSolidity(ContractRegistryABI, provider)
    const registry = new ethers.Contract(registryAddress, ContractRegistry.interface, provider)
    const boxAddress = await registry.lookupAddress( boxName )
    console.log( `Box '${boxName}' at ${boxAddress}`)

    // Using the address of the Box instance, if returned...
    if( boxAddress != '0x0000000000000000000000000000000000000000' ) {
        const Box = await ethers.ContractFactory.fromSolidity(BoxABI, provider)
        const box = new ethers.Contract(boxAddress, Box.interface, provider)
        const value = await box.retrieve()
        console.log(value)

        res.send(`Retreived value ${value} from box '${boxName}' as ${boxAddress}` )
    }
    else
        return res.status(400).json({ error: `boxName '${boxName}' not registered` })
})

router.put('/:boxName', async (req, res) => {
    const boxName = req.params.boxName
    const { value } = req.body

    if( value ) {
        const provider = new ethers.JsonRpcProvider()
        const ContractRegistry = await ethers.ContractFactory.fromSolidity(ContractRegistryABI, provider)
        const registry = new ethers.Contract(registryAddress, ContractRegistry.interface, provider)
        const boxAddress = await registry.lookupAddress( boxName )
        console.log( `Box '${boxName}' at ${boxAddress}`)

        const wallet = new ethers.Wallet(privateKey, provider);
        const Box = await ethers.ContractFactory.fromSolidity(BoxABI)
        const box = new ethers.Contract(boxAddress, Box.interface, wallet)
        await box.store(value);
        console.log( `Box '${boxName}' with value ${value}`)

        res.send(`Stored value ${value} in box '${boxName}' at ${boxAddress}` )
    }
})

module.exports = router
