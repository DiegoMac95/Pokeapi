const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

mongoose.connect(
  'mongodb+srv://diegomac:365365@cluster0.aiynf.mongodb.net/pokeapi?retryWrites=true&w=majority',
  { useNewUrlParser: true }
)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log('connected to MongoDB')
})

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(bodyParser.json())

const PokeSchema = new mongoose.Schema({
  name: String,
  party: Boolean,
  poke_id: Number,
  url: String,
})
const Pokemon = mongoose.model('Pokemon', PokeSchema, 'savedPokemons')

app.get('/all_pokemons', async (req, res) => {
  const pokemons = await Pokemon.find({ party: false }).exec()
  res.json({ message: 'pokemons', data: { pokemons } })
})
app.get('/party_pokemons', async (req, res) => {
  const pokemons = await Pokemon.find({ party: true }).exec()
  res.json({ message: 'pokemons', data: { pokemons } })
})

app.post('/set_pokemon', (req, res) => {
  console.log(req.body)
  const name = req.body.name
  const id = req.body.poke_id
  const url = req.body.url
  const poke = new Pokemon({ name: name, party: false, poke_id: id, url: url })
  poke.save(function (err) {
    if (err) return console.error(err)
    console.log('saved')
    res.send('Pokemon Saved')
  })
})

app.patch('/set_favorite', async (req, res) => {
  console.log(req.body)
  const fav = await Pokemon.findById(req.body.id).exec()
  const pokemons = await Pokemon.find({ party: true }).exec()
  if (pokemons.length > 6) {
    res.json({ message: 'The party is full.' })
  } else {
    fav.party = true
    await fav.save()
    res.json({ message: `${fav.name} added to the party`, data: fav })
  }
})

app.patch('/unset_favorite', async (req, res) => {
  console.log(req.body)
  const fav = await Pokemon.findById(req.body.id).exec()

  fav.party = false
  await fav.save()
  res.json({ message: `${fav.name} added to the party`, data: fav })
})

app.listen(3001, () => {
  console.log('listening on port 3000')
})
