import { ApiError } from "@point-hub/express-error-handler";
import { NextFunction, Request, Response } from "express";
import { validate } from "../request/invite.request.js";
import { InviteUserService } from "../services/invite.service.js";
import { apiUrl } from "@src/config/app.js";
import { db } from "@src/database/database.js";
import { ReadUserByEmailService } from "@src/modules/auth/services/read-user-by-email.service.js";
import Mailer from "@src/services/mailer/index.js";

export const invite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = db.startSession();

    db.startTransaction();

    validate(req.body);

    const readUser = new ReadUserByEmailService(db);
    const existingUsers = await readUser.handle(req.body.email);
    if (existingUsers) {
      throw new ApiError(422);
    }

    const inviteUserService = new InviteUserService(db);
    const result = await inviteUserService.handle(req.body, { session });
    const message = {
      to: result.email,
      subject: "Verification Account",
      template: "users/email/email-verification",
      context: {
        name: req.body.name,
        password: result.password,
        verificationLink: `${apiUrl}/v1/auth/accept-invitation?code=${result.emailVerificationCode}`,
      },
    };

    Mailer.send(message);

    await db.commitTransaction();

    res.status(201).json({
      _id: result._id,
    });
  } catch (error) {
    console.log("error,", error);
    await db.abortTransaction();
    next(error);
  } finally {
    await db.endSession();
  }
};
