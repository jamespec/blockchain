const express = require('express')
const router = express.Router()

const ethers = require('ethers')
const ABI = require('./Box.json')

const boxAddress = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512'

router.get('/', async (req, res) => {
    // Retrieve accounts from the local node
    // const accounts = await ethers.pro
    // console.log(accounts)

    // accountList = accounts.map( (v, i) => {
    //     if( i == 0 ) return v.firstName
    //     else return " " + v.firstName
    // } )
   res.send(`List users: ${accounts}` )
})

router.get('/store', async (req, res) => {
    if( req.query.value ) {
        // Set up an ethers contract, representing our deployed Box instance
        const Box = new ethers.provider.getContractFactory('Box')
        const box = await Box.attach( boxAddress )

        // Retrieve accounts from the local node
        await box.store(value)
        res.send(`Stored value: ${value}` )
    }
})

router.get('/retrieve', async (req, res) => {
    // Set up an ethers contract, representing our deployed Box instance
    const provider = new ethers.JsonRpcProvider()
    const signer = provider.getSigner()
    
    const Box = new ethers.provider.getContractFactory('Box')
    const box = await Box.attach( boxAddress )

    // Retrieve accounts from the local node
    const value = await box.retrieve()
    console.log(value)

   res.send(`Retreived value: ${value}` )
})

module.exports = router
