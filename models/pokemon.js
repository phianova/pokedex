const mongoose = require("mongoose");
const pokemonSchema = new mongoose.Schema({
  type: {
    type: [String],
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  pokeId: {
    type: Number,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  species: {
    type: String,
    required: true,
  },
  evolvesTo: {
    type: String,
    required: true,
  },
});
// const Pokemon =
module.exports = mongoose.model("Pokemon", pokemonSchema);
