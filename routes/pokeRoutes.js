const express = require("express")
const router = express.Router();
const { getAllPokemon, addPokemon, deletePokemon } = require("../controllers/pokeController")

router.get("/all", getAllPokemon) 
router.post("/add", addPokemon)
router.delete("/delete/:id", deletePokemon)

module.exports = router;

