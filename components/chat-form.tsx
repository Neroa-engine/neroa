import { sendMessage } from "@/app/workspace/[workspaceId]/actions";

type ChatFormProps = {
  workspaceId: string;
};

export function ChatForm({ workspaceId }: ChatFormProps) {
  const submitMessage = sendMessage.bind(null, workspaceId);

  return (
    <form action={submitMessage} className="border-t border-slate-200 p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <textarea
          className="input min-h-24 flex-1 resize-none"
          name="content"
          placeholder="Write the next message for this workspace..."
          required
        />
        <button className="button-primary sm:self-end" type="submit">
          Send
        </button>
      </div>
    </form>
  );
}
