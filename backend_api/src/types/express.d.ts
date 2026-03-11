export type AuthenticatedUser = {
  userId: string;
  email: string;
  role: "admin" | "learner";
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
