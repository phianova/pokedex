const createError = require("http-errors");
const axios = require("axios");
const Pokemon = require("../models/pokemon");

exports.getAllPokemon = async (req, res, next) => {
  try {
    const pokemon = await Pokemon.find();
    res.send(pokemon);
  } catch (err) {
    return next(createError(500, err.message));
  }
};

const getData = async (req, res, next) => {
  const species = req.params.species;
  let response = {};
  if (species === "random") {
    const randomId = Math.floor(Math.random() * 151) + 1;
    req.params.species = randomId;
    response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
  } else {
    response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${species}`);
  }
  const mainData = response.data;
  const evolutionResponse = await evolutionData(req, res, next);
  const apiData = { mainData, evolutionResponse };
  if (!apiData) {
    throw new Error("Pokemon Not Found in pokeAPI");
  } else {
    return apiData;
  }
};

const evolutionData = async (req, res, next) => {
  const species = req.params.species;
  const speciesData = await axios.get(
    `https://pokeapi.co/api/v2/pokemon-species/${species}`
  );
  const evolutionChainURL = speciesData.data.evolution_chain.url;
  const response = await axios.get(evolutionChainURL);
  const apiData = response.data;
  if (!apiData) {
    throw new Error("Pokemon Not Found in pokeAPI");
  } else {
    return apiData;
  }
};

exports.addPokemon = async (req, res, next) => {
  try {
    const numberOfPokemon = await Pokemon.countDocuments();
    if (numberOfPokemon >= 6)
      return next(
        createError(400, "Pokemon Limit Reached - please swap or delete")
      );
    // if (!req.headers.secretstring || req.headers.secretstring !== "password123")
    //   return next(createError(401, "Unauthorized"));
    const isMissingInformation = !req.body.nickname || !req.params.species;
    if (isMissingInformation)
      return next(createError(400, "Missing Pokemon Information"));

    const allData = await getData(req, res, next);
    const pokemonData = allData.mainData;
    const pokemonTypes = () => {
      let types = [];
      for (let i = 0; i < pokemonData.types.length; i++) {
        types.push(pokemonData.types[i].type.name);
      }
      return types;
    };

    req.body.type = pokemonTypes();
    req.body.height = pokemonData.height;
    req.body.weight = pokemonData.weight;
    req.body.image = pokemonData.sprites.front_default;
    req.body.pokeId = pokemonData.id;
    req.body.species = pokemonData.species.name;

    const nextSpecies = determineNextSpecies(
      allData.evolutionResponse.chain,
      req.body.species
    );

    req.body.evolvesTo = nextSpecies;

    const newPokemon = new Pokemon({
      type: req.body.type,
      height: req.body.height,
      weight: req.body.weight,
      image: req.body.image,
      pokeId: req.body.pokeId,
      nickname: req.body.nickname,
      species: req.body.species,
      evolvesTo: req.body.evolvesTo,
    });

    await newPokemon.save();
    res.send(newPokemon);
  } catch (err) {
    return next(createError(500, err.message));
  }
};

function determineNextSpecies(evolutionChain, currentSpecies) {
  if (evolutionChain.species.name === currentSpecies) {
    if (evolutionChain.evolves_to.length > 0) {
      return evolutionChain.evolves_to[0].species.name;
    }
  } else {
    // for (const evolution of evolutionChain.evolves_to) {
    //   const nextSpecies = determineNextSpecies(evolution, currentSpecies);
    //   if (nextSpecies) {
    //     return nextSpecies;
    //   }
    // }
    if (currentSpecies === evolutionChain.evolves_to[0].species.name) {
      if (evolutionChain.evolves_to[0].evolves_to.length > 0) {
        return evolutionChain.evolves_to[0].evolves_to[0].species.name;
      } else {
        if (
          currentSpecies ===
          evolutionChain.evolves_to[0].evolves_to[0].species.name
        ) {
          if (
            evolutionChain.evolves_to[0].evolves_to[0].evolves_to.length > 0
          ) {
            return evolutionChain.evolves_to[0].evolves_to[0].evolves_to[0]
              .species.name;
          }
        }
      }
    }
  }
  return currentSpecies;
}

exports.deletePokemon = async (req, res, next) => {
  try {
    const pokemonToDelete = await Pokemon.findByIdAndDelete(req.params.id);
    if (!pokemonToDelete) {
      return next(createError(404, "no pokemon with that id"));
    }
    res.send({ result: true });
  } catch (err) {
    return next(createError(500, err.message));
  }
};

// exports.changePokemon = async (req, res, next) => {
//   //get new pokemon information
//   //   if (!req.headers.secretstring || req.headers.secretstring !== "password123")
//   //     return next(createError(401, "Unauthorized"));
//   const isMissingInformation = !req.body.name || !req.params.species;
//   if (isMissingInformation)
//     return next(createError(400, "Missing Pokemon Information"));
//   //find old pokemon information
//   const oldPokemonId = await Pokemon.findById(req.params.id);
//   const oldPokemonIndex = pokemon.findIndex(
//     (pokemon) => pokemon.id === oldPokemonId
//   );
//   if (oldPokemonIndex === -1)
//     return next(createError(404, "Pokemon Not Found"));
//   //insert new info in place of old info
//   const allData = await getData(req, res, next);
//   const pokemonData = allData.mainData;
//   const pokemonTypes = () => {
//     let types = [];
//     for (let i = 0; i < pokemonData.types.length; i++) {
//       types.push(pokemonData.types[i].type.name);
//     }
//     return types;
//   };
//   pokemon[oldPokemonIndex].type = pokemonTypes();
//   pokemon[oldPokemonIndex].height = pokemonData.height;
//   pokemon[oldPokemonIndex].weight = pokemonData.weight;
//   pokemon[oldPokemonIndex].image = pokemonData.sprites.front_default;
//   pokemon[oldPokemonIndex].pokeId = pokemonData.id;
//   pokemon[oldPokemonIndex].species = req.params.species;
//   let currentSpecies = pokemon[oldPokemonIndex].species;
//   const nextSpecies = determineNextSpecies(
//     allData.evolutionResponse.chain,
//     req.body.species
//   );

//   pokemon[oldPokemonIndex].evolvesTo = nextSpecies;
//   res.send(pokemon);
// };

exports.renamePokemon = async (req, res, next) => {
  try {
    const updatedName = { nickname: req.body.nickname };
    const pokemonToRename = await Pokemon.findByIdAndUpdate(
      req.params.id,
      updatedName
    );
    if (!pokemonToRename) {
      return next(createError(404, "no pokemon with that id"));
    }
    res.send(pokemonToRename);
  } catch (err) {
    return next(createError(404, "Could not rename"));
  }
};

exports.evolvePokemon = async (req, res, next) => {
  try {
    const pokemonToEvolve = await Pokemon.findById(req.params.id);
    const evolvedSpecies = pokemonToEvolve.evolvesTo;
    req.params.species = evolvedSpecies;
    const allData = await getData(req, res, next);
    const pokemonData = allData.mainData;
    const pokemonTypes = () => {
      let types = [];
      for (let i = 0; i < pokemonData.types.length; i++) {
        types.push(pokemonData.types[i].type.name);
      }
      return types;
    };
    pokemonToEvolve.type = pokemonTypes();
    pokemonToEvolve.height = pokemonData.height;
    pokemonToEvolve.weight = pokemonData.weight;
    pokemonToEvolve.image = pokemonData.sprites.front_default;
    pokemonToEvolve.pokeId = pokemonData.id;
    pokemonToEvolve.species = req.params.species;
    let currentSpecies = pokemonToEvolve.species;
    const nextSpecies = determineNextSpecies(
      allData.evolutionResponse.chain,
      pokemonToEvolve.species
    );

    pokemonToEvolve.evolvesTo = nextSpecies;
    if (currentSpecies === nextSpecies) {
      console.log("No evolution");
    }

    const evolvedPokemon = await Pokemon.findByIdAndUpdate(req.params.id, {
      type: pokemonToEvolve.type,
      height: pokemonToEvolve.height,
      weight: pokemonToEvolve.weight,
      image: pokemonToEvolve.image,
      pokeId: pokemonToEvolve.pokeId,
      species: pokemonToEvolve.species,
      evolvesTo: pokemonToEvolve.evolvesTo,
    });

    res.send(evolvedPokemon);
  } catch (err) {
    console.log(err);
    return next(createError(404, "Could not evolve"));
  }
};
