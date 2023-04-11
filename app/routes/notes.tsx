import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
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
