import { ApiError } from "../utils/index.js";

export const validate = (schema, location = "body") => {
  return (req, res, next) => {
    const data = req[location];
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(", ");
      return next(new ApiError(400, messages));
    }

    next();
  };
};
