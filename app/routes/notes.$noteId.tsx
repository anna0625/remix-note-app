import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getStoredNotes } from "~/data/notes";
import styles from "~/styles/note-details.css";

type NoteType = {
  id: string;
  title: string;
  content: string;
};

export default function NoteDetailsPage() {
  const note: NoteType = useLoaderData();

  return (
    <main id="note-details">
      <header>
        <nav>
          <Link to="/notes">Back to all Notes</Link>
        </nav>
        <h1>{note.title}</h1>
      </header>
      <p id="note-details-content">{note.content}</p>
    </main>
  );
}

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { noteId: string };
}) {
  const notes = await getStoredNotes();
  const noteId = params.noteId;
  const selectedNote = notes.find((note: NoteType) => note.id === noteId);

  if (!selectedNote) {
    throw json(
      { message: "Note not found" + noteId },
      { status: 404, statusText: "Not Found" }
    );
  }

  return selectedNote;
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export function meta({
  data,
  parms,
}: {
  data: NoteType;
  parms: { noteId: string };
}) {
  return {
    title: data.title,
    description: data.content,
  };
}
