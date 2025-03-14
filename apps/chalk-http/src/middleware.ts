import { JWT_SECRET } from "@repo/common/config";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"];
  if (typeof token !== "string") {
    res.status(403).json({
      message: "please provide token",
    });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded !== "string" && decoded.userId) {
      // @ts-ignore
      req.userId = decoded.userId;
      next();
    }
  } catch (e) {
    res.status(403).json({
      message: "invalid token",
    });
  }
}
