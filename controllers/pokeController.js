const createError = require("http-errors");
const axios = require("axios");
const Pokemon = require("../models/pokemon");
// const pokemon = [];

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
    //throw new Error("Pokemon Not Found in pokeAPI");
    return;
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
    const numberOfPokemon = await Pokemon.find().length;
    if (numberOfPokemon >= 6)
      return next(
        createError(400, "Pokemon Limit Reached - please swap or delete")
      );
    if (!req.headers.secretstring || req.headers.secretstring !== "password123")
      return next(createError(401, "Unauthorized"));
    const isMissingInformation = !req.body.nickname || !req.params.species;
    if (isMissingInformation)
      return next(createError(400, "Missing Pokemon Information"));
    req.body.id = pokemon.length + 1 + Date.now();
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
    let currentSpecies = req.body.species;
    let nextSpecies = currentSpecies;

    if (allData.evolutionResponse.chain.evolves_to.length > 0) {
      if (currentSpecies === allData.evolutionResponse.chain.species.name) {
        nextSpecies =
          allData.evolutionResponse.chain.evolves_to[0].species.name;
      } else {
        if (
          allData.evolutionResponse.chain.evolves_to[0].evolves_to.length > 0
        ) {
          if (
            currentSpecies ===
            allData.evolutionResponse.chain.evolves_to[0].species.name
          ) {
            nextSpecies =
              allData.evolutionResponse.chain.evolves_to[0].evolves_to[0]
                .species.name;
          } else {
            if (
              allData.evolutionResponse.chain.evolves_to[0].evolves_to[0]
                .evolves_to.length > 0
            ) {
              if (
                currentSpecies ===
                allData.evolutionResponse.chain.evolves_to[0].evolves_to[0]
                  .species.name
              ) {
                nextSpecies =
                  allData.evolutionResponse.chain.evolves_to[0].evolves_to[0]
                    .evolves_to[0].species.name;
              }
            }
          }
        }
      }
    }
    req.body.evolvesTo = nextSpecies;
    console.log(req.body);
    const pokemon = new Pokemon({
      type: req.body.type,
      height: req.body.height,
      weight: req.body.weight,
      image: req.body.image,
      pokeId: req.body.pokeId,
      nickname: req.body.nickname,
      species: req.body.species,
      evolvesTo: req.body.evolvesTo,
    });
    await pokemon.save();
    res.send(pokemon);
  } catch (err) {
    return next(createError(500, err.message));
  }
  // pokemon.push(req.body)
  // res.send(pokemon)
};

exports.deletePokemon = (req, res, next) => {
  //params can be dynamic value
  const pokemonId = Number(req.params.id);
  const pokemonIndex = pokemon.findIndex((pokemon) => pokemon.id === pokemonId);
  if (pokemonIndex === -1) return next(createError(404, "Pokemon Not Found"));
  pokemon.splice(pokemonIndex, 1);
  res.send(pokemon);
};

exports.changePokemon = async (req, res, next) => {
  //get new pokemon information
  if (!req.headers.secretstring || req.headers.secretstring !== "password123")
    return next(createError(401, "Unauthorized"));
  const isMissingInformation = !req.body.name || !req.params.species;
  if (isMissingInformation)
    return next(createError(400, "Missing Pokemon Information"));
  req.body.id = pokemon.length + 1 + Date.now();
  //find old pokemon information
  const oldPokemonId = Number(req.params.id);
  const oldPokemonIndex = pokemon.findIndex(
    (pokemon) => pokemon.id === oldPokemonId
  );
  if (oldPokemonIndex === -1)
    return next(createError(404, "Pokemon Not Found"));
  //insert new info in place of old info
  const allData = await getData(req, res, next);
  const pokemonData = allData.mainData;
  const pokemonTypes = () => {
    let types = [];
    for (let i = 0; i < pokemonData.types.length; i++) {
      types.push(pokemonData.types[i].type.name);
    }
    return types;
  };
  pokemon[oldPokemonIndex].type = pokemonTypes();
  pokemon[oldPokemonIndex].height = pokemonData.height;
  pokemon[oldPokemonIndex].weight = pokemonData.weight;
  pokemon[oldPokemonIndex].image = pokemonData.sprites.front_default;
  pokemon[oldPokemonIndex].pokeId = pokemonData.id;
  pokemon[oldPokemonIndex].species = req.params.species;
  let currentSpecies = pokemon[oldPokemonIndex].species;
  let nextSpecies = currentSpecies;

  if (allData.evolutionResponse.chain.evolves_to.length > 0) {
    if (currentSpecies === allData.evolutionResponse.chain.species.name) {
      nextSpecies = allData.evolutionResponse.chain.evolves_to[0].species.name;
    } else {
      if (allData.evolutionResponse.chain.evolves_to[0].evolves_to.length > 0) {
        if (
          currentSpecies ===
          allData.evolutionResponse.chain.evolves_to[0].species.name
        ) {
          nextSpecies =
            allData.evolutionResponse.chain.evolves_to[0].evolves_to[0].species
              .name;
        } else {
          if (
            allData.evolutionResponse.chain.evolves_to[0].evolves_to[0]
              .evolves_to.length > 0
          ) {
            if (
              currentSpecies ===
              allData.evolutionResponse.chain.evolves_to[0].evolves_to[0]
                .species.name
            ) {
              nextSpecies =
                allData.evolutionResponse.chain.evolves_to[0].evolves_to[0]
                  .evolves_to[0].species.name;
            }
          }
        }
      }
    }
  }
  pokemon[oldPokemonIndex].evolvesTo = nextSpecies;
  res.send(pokemon);
};

exports.renamePokemon = (req, res, next) => {
  const pokemonId = Number(req.params.id);
  const pokemonIndex = pokemon.findIndex((pokemon) => pokemon.id === pokemonId);
  if (pokemonIndex === -1) return next(createError(404, "Pokemon Not Found"));
  pokemon[pokemonIndex].nickname = req.body.nickname;
  res.send(pokemon);
};

exports.evolvePokemon = async (req, res, next) => {
  //get unique id from req.params, fetch our req.body data
  const pokemonId = Number(req.params.id);
  const pokemonIndex = pokemon.findIndex((pokemon) => pokemon.id === pokemonId);
  if (pokemonIndex === -1) return next(createError(404, "Pokemon Not Found"));
  //get new data for evolved species
  const evolvedSpecies = pokemon[pokemonIndex].evolvesTo;
  req.params.species = evolvedSpecies;
  const allData = await getData(req, res, next);
  const pokemonData = allData.mainData;
  //change req.body data based on new data
  const pokemonTypes = () => {
    let types = [];
    for (let i = 0; i < pokemonData.types.length; i++) {
      types.push(pokemonData.types[i].type.name);
    }
    return types;
  };
  pokemon[pokemonIndex].type = pokemonTypes();
  pokemon[pokemonIndex].height = pokemonData.height;
  pokemon[pokemonIndex].weight = pokemonData.weight;
  pokemon[pokemonIndex].image = pokemonData.sprites.front_default;
  pokemon[pokemonIndex].pokeId = pokemonData.id;
  pokemon[pokemonIndex].species = req.params.species;
  let currentSpecies = pokemon[pokemonIndex].species;
  let nextSpecies = currentSpecies;

  if (allData.evolutionResponse.chain.evolves_to.length > 0) {
    if (currentSpecies === allData.evolutionResponse.chain.species.name) {
      nextSpecies = allData.evolutionResponse.chain.evolves_to[0].species.name;
    } else {
      if (allData.evolutionResponse.chain.evolves_to[0].evolves_to.length > 0) {
        if (
          currentSpecies ===
          allData.evolutionResponse.chain.evolves_to[0].species.name
        ) {
          nextSpecies =
            allData.evolutionResponse.chain.evolves_to[0].evolves_to[0].species
              .name;
        } else {
          if (
            allData.evolutionResponse.chain.evolves_to[0].evolves_to[0]
              .evolves_to.length > 0
          ) {
            if (
              currentSpecies ===
              allData.evolutionResponse.chain.evolves_to[0].evolves_to[0]
                .species.name
            ) {
              nextSpecies =
                allData.evolutionResponse.chain.evolves_to[0].evolves_to[0]
                  .evolves_to[0].species.name;
            }
          }
        }
      }
    }
  }
  pokemon[pokemonIndex].evolvesTo = nextSpecies;
  if (currentSpecies === nextSpecies) {
    console.log("No evolution");
  }

  res.send(pokemon);
};

// axios.post("http://localhost:3000/create", {
//     name: "learn Node",
//     expiry: "2021-12-31",
//     difficultyLevel: 1
// })
// module.exports = {

// }
