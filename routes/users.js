const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    nameList = users.map( (v, i) => {
        if( i == 0 ) return v.firstName
        else return " " + v.firstName
    } )
   res.send(`List users: ${nameList}` )
})

router.get('/new', (req, res) => {
    if( req.query.name )
        res.render('users/new', {firstName: req.query.name} )
    else
        res.render('users/new', {firstName: "test"} )
    })

router.post('/', (req, res) => {
    if( req.body.firstName != "test" ) {
        users.push( {firstName: req.body.firstName} )
        res.redirect(`/users/${users.length -1}`)
    }
    else {
        console.log("Don't accept 'test' as a name.")
        res.render('users/new', {firstName: "test"})
    }
})

router.route('/:id').get( (req,res) => {
    id = req.params.id
    if( id < users.length) {
        res.send(`List user id ${id } is ${users[req.params.id].firstName}` )
    }
    else {
        res.send(`Sorry, no user id: ${id}`)
    }
}).put( (req,res) => {
    res.send(`Update user id: ${ req.params.id }` )
}).delete( (req,res) => {
    res.send(`Delete user id: ${ req.params.id }` )
})

const users = [{ firstName: "John"}, {firstName: "Sally"}]
router.param('id', (req,res,next,id) => {
    req.user = users[id]
    next()
})

module.exports = router
