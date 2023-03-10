import { CaptureRepository } from "../repositories/capture.repository.js";
import DatabaseConnection from "@src/database/connection.js";

export interface QueryInterface {
  page: number;
  pageSize: number;
  dateFrom: Date;
  dateTo: Date;
}

export class SpiderChartService {
  private db: DatabaseConnection;
  constructor(db: DatabaseConnection) {
    this.db = db;
  }
  public async handle(query: QueryInterface, createdBy_id: any) {
    const captureRepository = new CaptureRepository(this.db);

    const aggregates: any = [];

    aggregates.push({ $match: { createdBy_id: createdBy_id } });

    aggregates.push({
      $match: {
        $and: [
          {
            date: {
              $gte: query.dateFrom,
            },
          },
          {
            date: {
              $lte: query.dateTo,
            },
          },
        ],
      },
    });
    aggregates.push({
      $unwind: "$clusters",
    });
    aggregates.push({
      $group: {
        _id: "$clusters.name",
        count: { $count: {} },
      },
    });
    const aggregateResult = await captureRepository.aggregate(aggregates, query);

    return aggregateResult;
  }
}
