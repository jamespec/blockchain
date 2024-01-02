// Import required modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// Open or create the sqlite3 database.
// Create the funds table if it doesn't exist.
const db = new sqlite3.Database('transfer_agent.db');
db.run(`CREATE TABLE IF NOT EXISTS instructions
          ( instructionId INTEGER PRIMARY KEY, 
            action CHAR(1), 
            amount NUMBER,
            securityId TEXT,
            fsrAccount TEXT, 
            tradeDate DATE
          );`,
    [], (err) => {
        if (err) {
            console.log("Unable to to open sqlite3 database: 'transfer_agent.db'")
        }
    });

// Create an Express router
const router = express.Router();

// Create a new record
router.post('/', (req, res) => {
    const { action, amount, securityId, fsrAccount, tradeDate } = req.body

    if (action && amount && securityId && fsrAccount && tradeDate) {
        db.get('SELECT * FROM funds WHERE securityId = ?', [securityId], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ message: 'Fund not found' });
            }

            db.get('SELECT * FROM accounts WHERE fsrAccount = ?', [fsrAccount], (err, row) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                if (!row) {
                    return res.status(404).json({ message: 'Account not found' });
                }

                let query = 'INSERT INTO instructions (action, amount, securityId, fsrAccount, tradeDate) VALUES (?, ?, ?, ?, ?)'
                db.run(query, [action, amount, securityId, fsrAccount, tradeDate], (err) => {
                    if (err) {
                        return res.status(500).json({ error: err.message })
                    }

                    // Get the assigned instructionId, just log for the moment.
                    db.get('SELECT last_insert_rowid() instructionId', (err, row) => {
                        if (err) {
                            return res.status(500).json({ error: err.message })
                        }

                        const instructionId = row['instructionId']
                        console.log(instructionId)

                        res.json({ instructionId: instructionId, message: 'Record created successfully' })
                    })
                })
            })
        })
    }
    else
        return res.status(400).json({ error: "Invalid or missing parameter" })
})

// Read all records
router.get('/', (req, res) => {
    // Retrieve all data from the table
    db.all('SELECT * FROM instructions', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message })
        }

        res.json( rows )
    })
})

// Read a specific record by ID
router.get('/:id', (req, res) => {
    const instructionId = req.params.id;

    if (instructionId) {
        db.get('SELECT * FROM instructions WHERE instructionId = ?', [instructionId], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!row) {
                return res.status(404).json({ message: 'Record not found' });
            }

            res.json( row );
        })
    }
    else
        return res.status(400).json({ error: "Invalid or missing parameter" })
})

// Update a record by ID
router.put('/:id', (req, res) => {
    const instructionId = req.params.id
    const { action, amount, securityId, fsrAccount, tradeDate } = req.body

    if (instructionId && action && amount && securityId && fsrAccount && tradeDate) {
        // NOTE: the async function is required to retrieve the updated row count!
        let query = 'UPDATE instructions SET action = ?, amount = ?, securityId = ?, fsrAccount = ?, tradeDate = ? WHERE instructionId = ?'
        db.run(query, [action, amount, securityId, fsrAccount, tradeDate, instructionId], async function (err) {
            if (err) {
                return res.status(500).json({ error: err.message })
            }

            if (!this.changes) {
                return res.status(404).json({ message: 'Record not found' });
            }

            res.json({ message: `Records updated: ${this.changes}` })
        })
    }
    else
        return res.status(400).json({ error: "Invalid or missing parameter" })
})

// Delete a record by ID
router.delete('/:id', (req, res) => {
    const instructionId = req.params.id

    if (instructionId) {
        // NOTE: the async function is required to retrieve the deleted row count!
        db.run('DELETE FROM instructions WHERE instructionId = ?', [instructionId], async function (err) {
            if (err) {
                return res.status(500).json({ error: err.message })
            }

            if (!this.changes) {
                return res.status(404).json({ message: 'Record not found' });
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
