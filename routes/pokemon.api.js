const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const fs = require("fs");

// @route GET  /pokemons
// @description - get all pokemons
// @body (id, name, types, url)

// @route GET  /pokemons?types=grass
// @description - search all pokemons with type = grass
// @body (types)

// @route GET  /pokemons?name=bulbasaur
// @description - search all pokemons details by name
// @body (name)

// ph?n search pokemon v?i search theo type v?n ch�a work, ch? check l?i query c?a frontend v?i backend xem match v?i nhau ch�a

router.get("/", (req, res, next) => {
  //input validation:
  const allowedFilter = ["id", "name", "types", "url"];
  // const param = req.query.types; // get by type
  // console.log(param);

  try {
    let { page, limit, name, types } = req.query; // query

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    // console.log(name);

    //processing logic:
    //Number of items skip for selection
    let offset = limit * (page - 1);
    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);

    // res.json(db);

    const { data } = db; //destructuring db.data
    console.log(db);

    //Filter data by title
    // let result = [];
    let result = data;
    let totalPokemons;

    if (name) {
      result = result.filter(
        (pokemon) => pokemon.name.toLowerCase() === name.toLowerCase()
      );
      console.log(result);
    } else if (types) {
      // search by type
      result = result.filter((pokemon) =>
        pokemon.types.some((type) => type.toLowerCase() === types.toLowerCase())
      );
      // .includes(types));
      console.log(types);
    } else {
      result = data;
    }

    totalPokemons = result.length;
    console.log(result);

    // res.render(result);

    //then select number of result by offset
    result = result.slice(limit * (page - 1), limit * page);

    //send response:
    res.status(200).send({ data: result, totalPokemons }); //obj voi key la data
  } catch (error) {
    next(error);
  }
});

// @route GET  /pokemons/:id
// & return together with the previous and next pokemon
// @description - get details of a pokemon (currentId), previousPokemon: currentId - 1, nextPokemon: currentId + 1
// @body (id, description, ...)
router.get("/:id", (req, res, next) => {
  try {
    let pokemonId = req.params.id;
    console.log(pokemonId);

    //processing logic:
    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    // console.log(db);
    const { data } = db;
    //Filter data by title
    let result = [];
    console.log(data);

    result = data.filter(
      (pokemon, index) => pokemon.id === parseInt(pokemonId)
    );
    console.log(pokemonId);
    let currentPokemon = data.findIndex((pokemon) => {
      return pokemon.id === parseInt(pokemonId);
    }); //vi tri element trong array
    let previousPokemon = currentPokemon - 1;
    let nextPokemon = currentPokemon + 1;
    console.log(currentPokemon);
    console.log(previousPokemon);

    //send response:
    res.status(200).send({
      pokemon: data[currentPokemon],
      previousPokemon: data[previousPokemon],
      nextPokemon: data[nextPokemon],
    });
  } catch (error) {
    next(error);
  }
});

// @route POST  /pokemons
// @description - create a new pokemon
// @body (id, name, types, url, description, ...)

// https://fakerjs.dev/
// - "Missing required data." (`name`, `id`, `types` or `URL`)
// - "Pokémon can only have one or two types." (if the `types`'s length is greater than `2`)
// - "Pokémon's type is invalid." (if the types of Pokémon are not included in the valid given `PokémonTypes` array)
// - "The Pokémon is exist." (if `id` or `name` exists in the database)

const pokemonTypes = [
  "bug",
  "dragon",
  "fairy",
  "fire",
  "ghost",
  "ground",
  "normal",
  "psychic",
  "steel",
  "dark",
  "electric",
  "fighting",
  "flyingText",
  "grass",
  "ice",
  "poison",
  "rock",
  "water",
];

router.post("/", (req, res, next) => {
  //post input validation:
  try {
    const { id, name, types, url } = req.body;
    console.log(req.body);
    if (!id || !name || !url) {
      const exception = new Error(`Missing info`);
      exception.statusCode = 401;
      throw exception;
    }

    //post processing logic:
    const newPokemon = {
      id,
      name,
      types,
      url,
    };

    //Read data from db.json then parse to JSobject
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { data } = db;
    console.log(data);

    for (let i = 0; i < data.length; i++) {
      if (id === data[i].id || name === data[i].name) {
        const exception = new Error(`Pokemon is already exit.`);
        exception.statusCode = 401;
        throw exception;
      }
    }
    // Pokemon can only have one or two types
    // && types.length <= 2

    for (let i = 0; i < types.length; i++) {
      if (!pokemonTypes.includes(types[i])) {
        const exception = new Error(`Pokemon's type is invalid.`);
        exception.statusCode = 401;
        throw exception;
      }
    }

    // Add new pokemon JS object
    data.push(newPokemon);
    // Add new pokemon to db JS object
    db.data = data;
    // db JSobject to JSON string
    db.totalPokemons = data.length;

    db = JSON.stringify(db);

    // write and save to db.json
    fs.writeFileSync("db.json", db);

    // post send response:
    res.status(200).send({ newPokemon });
  } catch (error) {
    next(error);
  }
});

//
// :rocket:
// @route PUT  /pokemons/:id
// @description - update a pokemon
// @body (id, name, types, url)
router.put("/:id", (req, res, next) => {});

// @route DELETE  /pokemons/:id
// @description - delete a pokemon
// @body (id)
router.delete("/:id", (req, res, next) => {});

//
module.exports = router;
