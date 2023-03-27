import joi from "joi";

export const ServiceRequestSchema = joi.object({
  subject: joi.object({ id: joi.string().required() }).required(),
  intent: joi.string().required(),
  orderDetail: joi.array().items(
    joi.object({
      parameter: joi.object({
        code: joi.string().valid("callback_url").required(),
        valueString: joi.string().uri().required(),
      }),
    })
  ),
});
