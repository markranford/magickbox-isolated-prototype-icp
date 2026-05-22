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

  it("does not pretend to queue a creation when no ICP runtime is available", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: "Video Creation" }));
    await user.type(screen.getByLabelText("Ask Magick Friend"), "Make a launch reel");
    await user.click(screen.getByRole("button", { name: "Submit prompt" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Open the local ICP asset canister to create a real ICP job",
    );
    expect(screen.queryByText(/queued locally/i)).not.toBeInTheDocument();
  });

  it("offers ICP sign-in choices without credential fields", () => {
    window.history.pushState({}, "", "/auth/sign-in");

    render(<App />);

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in with Internet Identity" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Use local browser identity" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });
});
