import type { ActionFunction } from "remix";
import { redirect, useActionData } from "remix";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "That joke is too short";
  }
}

function validateJokeName(name: string) {
  if (name.length < 2) {
    return "That joke's name is too short";
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name?: string;
    content?: string;
  };
  fields?: {
    name: string;
    content: string;
  };
};

export const action: ActionFunction = async ({ request }): Promise<Response | ActionData> => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const name = form.get("name");
  const content = form.get("content");

  if (typeof name !== "string" || typeof content !== "string") {
    return {
      formError: "Form not submitted correctly",
    };
  }

  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };
  const fields = { name, content };
  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors, fields };
  }

  const joke = await db.joke.create({ data: { ...fields, jokesterId: userId } });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData | undefined>();

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name:
            <input
              type="text"
              defaultValue={actionData?.fields?.name}
              name="name"
              aria-invalid={Boolean(actionData?.fieldErrors?.name)}
              aria-describedby={actionData?.fieldErrors?.name && "name-error"}
            />
          </label>
          {actionData?.fieldErrors?.name && (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={Boolean(actionData?.fieldErrors?.content)}
              aria-describedby={actionData?.fieldErrors?.content && "content-error"}
            />
          </label>
          {actionData?.fieldErrors?.content && (
            <p className="form-validation-error" role="alert" id="content-error">
              {actionData.fieldErrors.content}
            </p>
          )}
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
