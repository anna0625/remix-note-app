import { json, redirect } from "@remix-run/node";
import { Link, useActionData, useCatch, useLoaderData } from "@remix-run/react";
import NewNote, { links as newNoteLinks } from "~/components/NewNote";
import NoteList, { links as noteListLinks } from "~/components/NoteList";
import { getStoredNotes, storeNotes } from "~/data/notes";

export default function NotePage() {
  const notes = useLoaderData();
  return (
    <main>
      <NewNote />
      <NoteList notes={notes} />
    </main>
  );
}

export async function loader() {
  const notes = await getStoredNotes();
  if (!notes || notes.length === 0) {
    throw json(
      { message: "No notes found" },
      { status: 404, statusText: "Not Found" }
    );
  }
  return notes; // return raw data
  // ===> Behind the scenes, Remix is doing this:
  // return new Response(JSON.stringify(notes), {
  //   headers: { "content-type": "application/json" },
  // });
  // ===> So you can also do this:
  // return json(notes);
}

export async function action({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) {
  // ===== Receive data =====
  const formData = await request.formData();
  // Way 1
  // const noteData = {
  //   title: formData.get("title") as string,
  //   content: formData.get("content") as string,
  // };
  // Way 2
  const noteData = Object.fromEntries(formData);
  // ===== Validation =====
  if (typeof noteData.title === "string") {
    if (noteData.title.trim().length < 5) {
      return { message: "Title is too short - should be 5 chars minimum." };
    }
  }

  // ===== Save data =====
  const existingNotes = await getStoredNotes();
  noteData.id = new Date().toISOString();
  const updatedNotes = existingNotes.concat(noteData);
  storeNotes(updatedNotes);
  // ===== Redirect =====
  return redirect("/notes");
}

export function links() {
  return [...newNoteLinks(), ...noteListLinks()];
}

export function meta() {
  return {
    title: "New Note",
    description: "Add a new note",
  };
}

export function CatchBoundary() {
  const caughtResponse = useCatch();

  const message = caughtResponse.data?.message || "Notes not found.";

  return (
    <>
      <NewNote />
      <main className="error">
        <p>{message}</p>
      </main>
    </>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <main className="error">
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <p>
        Back to <Link to="/">safety</Link>
      </p>
    </main>
  );
}
