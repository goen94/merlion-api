import { ApiError } from "@point-hub/express-error-handler";
import { NextFunction, Request, Response } from "express";
import { QueryInterface, SpiderChartTypologiesService } from "../services/spider-chart-typologies.service.js";
import { db } from "@src/database/database.js";
import { VerifyTokenUserService } from "@src/modules/auth/services/verify-token.service.js";

export const spiderChartTypologies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * Request should come from authenticated user
     */
    const authorizationHeader = req.headers.authorization ?? "";

    if (authorizationHeader === "") {
      throw new ApiError(401);
    }
    const verifyTokenUserService = new VerifyTokenUserService(db);
    const authUser = (await verifyTokenUserService.handle(authorizationHeader)) as any;

    const spiderChartTypologiesService = new SpiderChartTypologiesService(db);

    const query: QueryInterface = {
      page: Number(req.query.page ?? 1),
      pageSize: Number(req.query.pageSize ?? 10),
      dateFrom: new Date(req.query.dateFrom as string),
      dateTo: new Date(req.query.dateTo as string),
      search: req.query.search as string,
    };

    const result = await spiderChartTypologiesService.handle(query, authUser._id);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
