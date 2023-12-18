import { Router, Request, Response } from "express";
import { UserService } from "../domain/user-service";
import { RequestWithBody } from "../types/common";
import { InputLoginOrEmailType } from "../types/auth/input";
import { authValidation } from "../middlewares/user/user-validation";

export const authRoute = Router({});

authRoute.post(
  "/login",
  authValidation(),
  async (req: RequestWithBody<InputLoginOrEmailType>, res: Response) => {
    const result = await UserService.checkCredentials(
      req.body.loginOrEmail,
      req.body.password
    );
    console.log("19", req.body.loginOrEmail),
      console.log("20", req.body.password);
    if (result === false) {
      res.sendStatus(401);
    }
    return res.sendStatus(204);
  }
);
