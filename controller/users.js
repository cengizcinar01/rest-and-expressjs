const postgres = require("@vercel/postgres");

const createUser = async (request, response) => {
  const { username } = request.body;

  try {
    const res =
      await postgres.sql`INSERT INTO users (username) VALUES (${username})`;

    if (res.rowCount > 0) {
      response.send("User was created successfully.");
    } else {
      response.send("User could NOT be created.");
    }
  } catch (error) {
    response.send(`Something went wrong. ${error}`);
  }
};

module.exports = { createUser };
