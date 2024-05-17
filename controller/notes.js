const postgres = require("@vercel/postgres");

const getAllNotes = async (request, response) => {
  const { user } = request.params;

  try {
    const res = await postgres.sql`
        SELECT notes.id, notes.content, users.username
        FROM notes
        JOIN users ON notes."userId" = users.id
        WHERE UPPER(users.username) = UPPER(${user})
      `;

    if (res.rowCount > 0) {
      response.send(res.rows);
    } else {
      response.send("Notes could NOT be found.");
    }
  } catch (error) {
    response.send(`Something went wrong. ${error}`);
  }
};

const createNote = async (request, response) => {
  const { content } = request.body;
  const { user } = request.params;

  try {
    const res =
      await postgres.sql`INSERT INTO notes (content, "userId") VALUES (${content}, (SELECT id FROM users WHERE username = ${user})) RETURNING id`;

    if (res.rowCount > 0) {
      const noteId = res.rows[0].id;
      response.send({ message: "Note was created successfully.", noteId });
    } else {
      response.send({ message: "Note could NOT be created." });
    }
  } catch (error) {
    response.send(`Something went wrong. ${error}`);
  }
};

const getIndividualNote = async (request, response) => {
  const { user, note } = request.params;

  try {
    const res = await postgres.sql`
        SELECT notes.id, notes.content, users.username
        FROM notes
        JOIN users ON notes."userId" = users.id
        WHERE notes.id = ${note} AND UPPER(users.username) = UPPER(${user});
      `;

    if (res.rowCount > 0) {
      response.send(res.rows);
    } else {
      response.send("Note could NOT be found.");
    }
  } catch (error) {
    response.send(`Something went wrong. ${error}`);
  }
};
const updateIndividualNote = async (request, response) => {
  const { user, note } = request.params;
  const { content } = request.body;

  try {
    const res = await postgres.sql`
        UPDATE notes
        SET content = ${content}
        WHERE id = ${note} AND "userId" = (
          SELECT id FROM users WHERE UPPER(users.username) = UPPER(${user})
        )
        RETURNING id
      `;

    if (res.rowCount > 0) {
      const noteId = res.rows[0].id;
      response.send({
        message: `Note with ID ${note} updated successfully for user ${user}.`,
        noteId,
      });
    } else {
      response.send({
        message: `Note with ID ${note} not found or does not belong to user ${user}.`,
      });
    }
  } catch (error) {
    response.send(`Something went wrong. ${error}`);
  }
};

const deleteIndividualNote = async (request, response) => {
  const { user, note } = request.params;

  try {
    const res = await postgres.sql`
        DELETE FROM notes
        WHERE id = ${note} AND "userId" = (
          SELECT id FROM users WHERE UPPER(username) = UPPER(${user})
        )
      `;

    if (res.rowCount > 0) {
      response.send({ message: `Note with ID ${note} deleted successfully.` });
    } else {
      response.send({ message: `Note with ID ${note} not found.` });
    }
  } catch (error) {
    response.send(`Something went wrong. ${error}`);
  }
};

module.exports = {
  getAllNotes,
  createNote,
  getIndividualNote,
  updateIndividualNote,
  deleteIndividualNote,
};
