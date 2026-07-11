// Validates req[source] against a zod schema, replacing it with the
// parsed/coerced value on success or short-circuiting with a 400 on failure.
export const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.issues.map((i) => i.message).join(", "),
    });
  }
  req[source] = result.data;
  next();
};
