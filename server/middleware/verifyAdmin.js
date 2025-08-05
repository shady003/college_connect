import createError from "../utils/createError.js";

export const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(createError(403, "Access denied. Admins only."));
  }
  next();
};
