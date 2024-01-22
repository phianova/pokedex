const createError = require('http-errors')
const pokemon = []

exports.getAllPokemon = (req, res, next) => {
    res.send(pokemon);
}

exports.addPokemon = (req, res, next) => {
    if (!req.headers.secretstring || req.headers.secretstring !== 'password123') return next(createError(401, 'Unauthorized'))
    const isMissingInformation = !req.body.name || !req.body.species || !req.body.type
    if (isMissingInformation) return next(createError(400, 'Missing Pokemon Information')) 
    req.body.id =  pokemon.length + 1 + Date.now();
    pokemon.push(req.body)
    res.send(pokemon)
}

exports.deletePokemon = (req, res, next) => {
    //params can be dynamic value
    const pokemonId = Number(req.params.id)
    const pokemonIndex = pokemon.findIndex(pokemon => pokemon.id === pokemonId)
    if (pokemonIndex === -1) return next(createError(404, "Pokemon Not Found"))
    pokemon.splice(pokemonIndex, 1)
    res.send(pokemon)
}

exports.updatePokemon = (req, res, next) => {
    //get new pokemon information
    if (!req.headers.secretstring || req.headers.secretstring !== 'password123') return next(createError(401, 'Unauthorized'))
    const isMissingInformation = !req.body.name || !req.body.species || !req.body.type
    if (isMissingInformation) return next(createError(400, 'Missing Pokemon Information')) 
    req.body.id =  pokemon.length + 1 + Date.now();
    console.log("new id",req.body.id);
    //find old pokemon information
    const oldPokemonId = Number(req.params.id)
    console.log("old id",oldPokemonId);
    const oldPokemonIndex = pokemon.findIndex(pokemon => pokemon.id === oldPokemonId)
    console.log("old index",oldPokemonIndex);
    if (oldPokemonIndex === -1) return next(createError(404, "Pokemon Not Found"))
    //insert new info in place of old info
    pokemon.splice(oldPokemonIndex, 1, req.body)
    res.send(pokemon)
}


/*
exports.evolvePokemon = (req, res, next) => {
    const pokemonId = Number(req.params.id)
    const pokemonIndex = pokemon.findIndex(pokemon => pokemon.id === pokemonId)
    if (pokemonIndex === -1) return next(createError(404, "Pokemon Not Found"))
    const currentSpecies = pokemon[pokemonIndex].species
    //Codeium suggested: const evolveTo = pokemon.find(pokemon => pokemon.species === currentSpecies + 1)
}

*/

// axios.post("http://localhost:3000/create", {
//     name: "learn Node",
//     expiry: "2021-12-31",
//     difficultyLevel: 1
// })