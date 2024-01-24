const express = require("express");
const router = express.Router();
const {
  getAllPokemon,
  addPokemon,
  deletePokemon,
  renamePokemon,
  evolvePokemon,
} = require("../controllers/pokeController");

router.get("/all", getAllPokemon);
router.post("/add/:species", addPokemon);
router.delete("/delete/:id", deletePokemon);
//router.put("/change/:id/:species", changePokemon)
router.put("/evolve/:id", evolvePokemon);
router.put("/rename/:id", renamePokemon);

module.exports = router;
