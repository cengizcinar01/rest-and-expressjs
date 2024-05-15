require("dotenv").config();
const express = require("express");
const postgres = require("@vercel/postgres");

const app = express();
app.use(express.json());

app.get("/", async (request, response) => {
  createTables();
  response.send({ message: "Welcome to the note-taking app!" });
});

app.post("/", async (request, response) => {
  createTables();
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
});

app.get("/:user", async (request, response) => {
  createTables();
  const { user } = request.params;

  try {
    const res = await postgres.sql`
    SELECT notes.id, notes.content, notes."createdAt"
    FROM notes
    JOIN users ON notes."userId" = users.id
    WHERE users.username = ${user};
    `;
    if (res.rowCount > 0) {
      response.send(res.rows);
    } else {
      response.send("notes cloud not be found.");
    }
  } catch (error) {
    response.send(`Something went wrong. ${error}`);
  }
});

app.post("/:user", async (request, response) => {
  createTables();
  const { content } = request.body;
  const { user } = request.params;

  try {
    const res = await postgres.sql`
      INSERT INTO notes (content, "userId") VALUES (${content},
      (SELECT id FROM users WHERE username = ${user}))`;

    if (res.rowCount > 0) {
      response.send("Note was created successfully.");
    } else {
      response.send("Note could NOT be created.");
    }
  } catch (error) {
    response.send(`Something went wrong. ${error}`);
  }
});

app.get("/:user/:note", async (request, response) => {
  createTables();
  const { user, note } = request.params;

  try {
    const res = await postgres.sql`
    SELECT notes.id, notes.content, notes."createdAt"
    FROM notes
    JOIN users ON notes."userId" = users.id
    WHERE notes.id = ${note} AND users.username = ${user};
    `;
    if (res.rowCount > 0) {
      response.send(res.rows);
    } else {
      response.send("note cloud not be found.");
    }
  } catch (error) {
    response.send(`Something went wrong. ${error}`);
  }
});

app.put("/:user/:note", async (request, response) => {
  createTables();
  const { user, note } = request.params;
  const { content } = request.body;

  try {
    const res = await postgres.sql`
      UPDATE notes
      SET content = ${content}
      WHERE id = ${note} AND "userId" = (
        SELECT id FROM users WHERE username = ${user}
      )
      RETURNING *;
    `;

    if (res.rowCount > 0) {
      response.send(
        `Note with ID ${note} updated successfully for user ${user}.`
      );
    } else {
      response.send(
        `Note with ID ${note} not found or does not belong to user ${user}.`
      );
    }
  } catch (error) {
    response.send(`Something went wrong. ${error}`);
  }
});

app.delete("/:user/:note", async (request, response) => {
  createTables();
  const { user, note } = request.params;

  try {
    const res = await postgres.sql`
      DELETE FROM notes
      WHERE id = ${note} AND "userId" = (
        SELECT id FROM users WHERE username = ${user}
      )
    `;

    if (res.rowCount > 0) {
      response.send(`Note with ID ${note} deleted successfully.`);
    } else {
      response.send(`Note with ID ${note} not found.`);
    }
  } catch (error) {
    response.send(`Something went wrong. ${error}`);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

async function createTables() {
  await postgres.sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await postgres.sql`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER REFERENCES users (id) NOT NULL,
      content VARCHAR(255) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}
