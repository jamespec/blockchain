// Import required modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// Open or create the sqlite3 database.
// Create the accounts table if it doesn't exist.
const db = new sqlite3.Database('transfer_agent.db');
db.run('CREATE TABLE IF NOT EXISTS accounts ( fsrAccount INTEGER PRIMARY KEY, name TEXT, currency TEXT, walletAddress TEXT );', [], (err) => {
  if (err) {
    console.log("Unable to to open sqlite3 database: 'transfer_agent.db'")
  }
});

// Create an Express router
const router = express.Router();

// Define routes for CRUD operations

// Create a new record
router.post('/', (req, res) => {
  const { fsrAccount, name, currency, walletAddress } = req.body

  if( fsrAccount && name && currency && walletAddress ) {
    // Insert data into the table
    let query = 'INSERT INTO accounts (fsrAccount, name, currency, walletAddress) VALUES (?, ?, ?, ?)'
    db.run(query, [fsrAccount, name, currency, walletAddress], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      res.json({ message: 'Record created successfully' })
    })
  }
  else
    return res.status(400).json({ error: "Invalid or missing parameter" })
})

// Read all records
router.get('/', (req, res) => {
  // Retrieve all data from the table
  db.all('SELECT * FROM accounts', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }

    res.json( rows )
  })
});

// Read a specific record by ID
router.get('/:id', (req, res) => {
  const fsrAccount = req.params.id

  if( fsrAccount ) {
    // Retrieve data for a specific ID from the table
    db.get('SELECT * FROM accounts WHERE fsrAccount = ?', [fsrAccount], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      if (!row) {
        return res.status(404).json({ message: 'Record not found' })
      }

      res.json( row )
    });
  }
  else
    return res.status(400).json({ error: "Invalid or missing parameter" })
})

// Update a record by ID
router.put('/:id', (req, res) => {
  const fsrAccount = req.params.id
  const { name, currency, walletAddress } = req.body

  console.log(`Attempting update with id: ${fsrAccount}` )
  if( fsrAccount && name && currency && walletAddress ) {
    // NOTE: the async function is require to retrieve the updated row count!
    let query = 'UPDATE accounts SET name = ?, currency = ?, walletAddress = ? WHERE fsrAccount = ?'
    db.run(query, [name, currency, walletAddress, fsrAccount], async function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      res.json({ message: `Records updated: ${this.changes}` })
    })
  }
  else
    return res.status(400).json({ error: "Invalid or missing parameter" })
})

// Delete a record by ID
router.delete('/:id', (req, res) => {
  const fsrAccount = req.params.id

  if( fsrAccount ) {
    // Delete data for a specific ID from the table
    db.run('DELETE FROM accounts WHERE fsrAccount = ?', [fsrAccount], async function (err) {
      if (err) {
        return res.status(500).json({ error: err.message })
      }

      res.json({ message: `Records deleted: ${this.changes}` })
    })
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
