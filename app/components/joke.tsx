import { Joke } from "@prisma/client";
import { Form, Link } from "remix";

export function JokeDisplay({
  joke,
  isOwner,
  canDelete = true,
}: {
  joke: Pick<Joke, "content" | "name">;
  isOwner: boolean;
  canDelete?: boolean;
}) {
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke.content}</p>
      <Link to=".">{joke.name}</Link>
      {isOwner && (
        <Form method="post">
          <input type="hidden" name="_method" value="delete" />
          <button type="submit" className="button" disabled={!canDelete}>
            Delete
          </button>
        </Form>
      )}
    </div>
  );
}