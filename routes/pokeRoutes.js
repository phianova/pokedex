const express = require("express")
const router = express.Router();
const { getAllPokemon, addPokemon, deletePokemon, updatePokemon } = require("../controllers/pokeController")

router.get("/all", getAllPokemon) 
router.post("/add", addPokemon)
router.delete("/delete/:id", deletePokemon)
router.put("/update/:id", updatePokemon)

module.exports = router;

