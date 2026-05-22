import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Magick Box rewrite prototype", () => {
  it("preserves the observable landing hero and primary action", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Create Anything with AI - Faster Than Ever",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Launch Beta" })).toHaveAttribute(
      "href",
      "/home/explore?category=latest",
    );
  });

  it("queues a local creation without calling production services", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: "Video Creation" }));
    await user.type(screen.getByLabelText("Ask Magick Friend"), "Make a launch reel");
    await user.click(screen.getByRole("button", { name: "Submit prompt" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Video Creation queued locally: Make a launch reel",
    );
  });
});
