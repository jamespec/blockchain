// Import required modules
const express = require('express');
const fs = require('node:fs');

let accountData = [{}]
try {
  accountData = JSON.parse(fs.readFileSync("./data/accounts.json"));
} catch (err) {
  console.error(err);
}

// Create an Express router
const router = express.Router();

// Create a new record
router.post('/', (req, res) => {
  const { fsrAccount, name, currency, walletAddress } = req.body

  if (fsrAccount && name && currency && walletAddress) {
    accountData.push({ fsrAccount: fsrAccount, name: name, currency: currency, walletAddress: walletAddress })
    res.json({ message: 'Record created successfully' })
  }
  else
    return res.status(400).json({ error: "Invalid or missing parameter" })
})

// Read all records
router.get('/', (req, res) => {
  res.json(accountData)
});

// Read a specific record by ID
router.get('/:id', (req, res) => {
  const fsrAccount = req.params.id

  if (fsrAccount) {
    const account = accountData.find((a) => (a.fsrAccount = fsrAccount))

    if (!account) {
      return res.status(404).json({ message: 'Record not found' })
    }

    res.json(account)
  }
  else
    return res.status(400).json({ error: "Invalid or missing parameter" })
})

// Update a record by ID
router.put('/:id', (req, res) => {
  const fsrAccount = Number(req.params.id)
  const { name, currency, walletAddress } = req.body

  console.log(`Attempting update with id: ${fsrAccount}`)
  if (fsrAccount && name && currency && walletAddress) {
    const origCount = accountData.length
    accountData = accountData.filter((a) => (a.fsrAccount != fsrAccount))
    const deletedCount = origCount - accountData.length

    accountData.push({ fsrAccount: fsrAccount, name: name, currency: currency, walletAddress: walletAddress })

    res.json({ message: `Records replaced: ${deletedCount}` })
  }
  else
    return res.status(400).json({ error: "Invalid or missing parameter" })
})

// Delete a record by ID
router.delete('/:id', (req, res) => {
  const fsrAccount = req.params.id

  if (fsrAccount) {
    const origCount = accountData.length
    accountData = accountData.filter((a) => (a.fsrAccount != fsrAccount))

    if (origCount == accountData.length) {
      return res.status(404).json({ message: 'Record not found' })
    }

    res.json({ message: `Records deleted: ${origCount - accountData.length}` })
  }
  else
    return res.status(400).json({ error: "Invalid or missing parameter" })
})

// Close the database connection on server shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message)
    }
    console.log('Closed the database connection.')
    process.exit()
  })
})

// Export the router
module.exports = router
