const createError = require('http-errors')
const axios = require("axios")
const pokemon = []

exports.getAllPokemon = (req, res, next) => {
    res.send(pokemon);
}

const getData = async (req, res, next) => {
        console.log(req.params)
        const species = req.params.species; // Uncomment this line if you want to use parameters
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${species}`);
        const apiData = response.data;
        console.log(apiData);
        if(!apiData) {
            // return next(createError(404, "Pokemon Not Found in pokeAPI"));
            throw new Error("Pokemon Not Found in pokeAPI");
        }
        else {        
            return (apiData); // Make sure to pass data as an object
        }
        // res.status(404).render("error", { message: "Something went wrong" });
};


exports.addPokemon = async (req, res, next) => {
    if (!req.headers.secretstring || req.headers.secretstring !== 'password123') return next(createError(401, 'Unauthorized'))
    const isMissingInformation = !req.body.nickname || !req.params.species
    if (isMissingInformation) return next(createError(400, 'Missing Pokemon Information')) 
    req.body.id =  pokemon.length + 1 + Date.now();
    //const species = req.body.species
    const pokemonData = await getData(req, res, next)
    console.log(pokemonData);
    const pokemonTypes = () => {
        let types = [];
        for (let i = 0; i < pokemonData.types.length; i++) {
            types.push(pokemonData.types[i].type.name);
        }
        return types;
    }
    req.body.type = pokemonTypes();
    console.log(req.body.type)
    req.body.height = pokemonData.height;
    req.body.weight = pokemonData.weight;
    req.body.image = pokemonData.sprites.front_default;
    //req.body.entryNumber = pokemonData.pokedex_numbers[0].entry_number;
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

exports.changePokemon = (req, res, next) => {
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

exports.renamePokemon = (req, res, next) => {
    const pokemonId = Number(req.params.id)
    const pokemonIndex = pokemon.findIndex(pokemon => pokemon.id === pokemonId)
    if (pokemonIndex === -1) return next(createError(404, "Pokemon Not Found"))
    pokemon[pokemonIndex].nickname = req.body.nickname
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
// module.exports = {
    
// }