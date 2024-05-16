require("dotenv").config();
const express = require("express");
const { createTables } = require("./lib/db");
const { createUser } = require("./controller/users");
const {
  getAllNotes,
  createNote,
  getIndividualNote,
  updateIndividualNote,
  deleteIndividualNote,
} = require("./controller/notes");

const app = express();
app.use(express.json());

app.get("/", async (request, response) => {
  createTables();
  response.send({ message: "Welcome to the note-taking app!" });
});

app.post("/", createUser);

app.get("/:user", getAllNotes);

app.post("/:user", createNote);

app.get("/:user/:note", getIndividualNote);

app.put("/:user/:note", updateIndividualNote);

app.delete("/:user/:note", deleteIndividualNote);

const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
