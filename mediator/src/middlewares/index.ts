import { Request, Response, NextFunction } from 'express';

export function validateBodyAgainst(...validators: any) {
  return async function (req: Request, res: Response, next: NextFunction) {
    for (const validator of validators) {
      const data = await handleValidation(validator, req.body);

      if (!data.valid) {
        res.status(400).send(data);
        return;
      }
    }
    next();
  };
}

async function handleValidation(validator: any, body: any) {
  // Checking if it's Joi or FHIR validation, so it can handle them differently.
  if (!validator.validateAsync) {
    const result = validator(body);

    if (result.valid) {
      return { valid: true, message: undefined };
    }

    const message = result.messages[0];

    return {
      valid: false,
      message: `"${message.location}" ${message.message}`,
    };
  }

  try {
    await validator.validateAsync(body, {
      allowUnknown: true,
      abortEarly: true,
    });
    return { valid: true, message: undefined };
  } catch (error: any) {
    return { valid: false, message: error.details[0].message };
  }
}
