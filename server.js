const express = require("express");
const postgres = require("@vercel/postgres");

const app = express();
app.use(express.json());

app.get("/", async (request, response) => {
  createNotes();
  const { rows } = await postgres.sql`
  SELECT * FROM notes
  `;

  response.send(rows);
});

app.get("/:id", async (request, response) => {
  createNotes();
  const { id } = request.params;

  if (isNaN(parseInt(id))) {
    return response.status(400).send("Invalid ID");
  }

  const { rows } = await postgres.sql`
  SELECT * FROM notes WHERE id = ${id}
  `;

  if (!rows.length) {
    return response.send([]);
  }

  response.send(rows[0]);
});

app.get("/search/:keyword", async (request, response) => {
  createNotes();
  const { keyword } = request.params;
  const { rows } = await postgres.sql`
  SELECT * FROM notes WHERE content ILIKE ${"%" + keyword + "%"}
  `;

  response.send(rows);
});

app.post("/", async (request, response) => {
  createNotes();
  const { content } = request.body;

  if (!content) {
    return response.send("Note NOT created since content is missing.");
  }

  const res = await postgres.sql`
  INSERT INTO notes (content) VALUES (${content})
  `;
  if (res.rowCount > 0) {
    response.send("Successfully created the note.");
  } else {
    response.send("Could not create the note.");
  }
});

app.put("/:id", async (request, response) => {
  createNotes();
  const { content } = request.body;
  const { id } = request.params;
  const { rows } = await postgres.sql`
  UPDATE notes
  SET content = ${content}, "modifiedAt" = CURRENT_TIMESTAMP WHERE id = ${id} 
  `;

  response.send(rows);
});

app.delete("/:id", async (request, response) => {
  createNotes();
  const { id } = request.params;
  const { rows } = await postgres.sql`
  DELETE FROM notes WHERE id = ${id}
  `;

  response.send(rows);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

async function createNotes() {
  await postgres.sql`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      content VARCHAR(255) NOT NULL,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "modifiedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )
  `;
}
