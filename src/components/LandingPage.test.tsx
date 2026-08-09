import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LandingPage } from './LandingPage';

// LandingPage pulls the mascot out of App.tsx, which transitively initializes
// Firebase. Stub it so this stays a presentational test.
vi.mock('../App', () => ({
  RobotBunnyMascot: ({ className }: { className?: string }) => (
    <div data-testid="mascot" className={className} />
  ),
}));

const noop = () => {};

describe('LandingPage', () => {
  it('renders the Pyxias brand copy', () => {
    render(
      <LandingPage onLaunchStudio={noop} onSelectPlan={noop} user={null} onSignIn={noop} />,
    );

    expect(screen.getByText(/Pyxias automatically restructures/i)).toBeInTheDocument();
    expect(screen.getByText(/Pyxias AI Co-Teacher/i)).toBeInTheDocument();
  });

  it('prompts signed-out visitors to sign in rather than entering the studio', async () => {
    const onSignIn = vi.fn();
    const onLaunchStudio = vi.fn();

    render(
      <LandingPage
        onLaunchStudio={onLaunchStudio}
        onSelectPlan={noop}
        user={null}
        onSignIn={onSignIn}
      />,
    );

    const cta = screen.getByRole('button', { name: /sign in \/ create account/i });
    await userEvent.click(cta);

    expect(onSignIn).toHaveBeenCalledOnce();
    expect(onLaunchStudio).not.toHaveBeenCalled();
  });

  it('sends signed-in users straight to the studio', async () => {
    const onSignIn = vi.fn();
    const onLaunchStudio = vi.fn();

    render(
      <LandingPage
        onLaunchStudio={onLaunchStudio}
        onSelectPlan={noop}
        user={{ displayName: 'Alissa' }}
        onSignIn={onSignIn}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /enter instructor studio/i }));

    expect(onLaunchStudio).toHaveBeenCalledOnce();
    expect(onSignIn).not.toHaveBeenCalled();
  });
});
