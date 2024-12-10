import { validate, ValidationError } from "class-validator";
import { ApiError } from "./ApiError";
export async function validateData(obj: any) {
  const error: ValidationError[] = await validate(obj);
  if (error.length > 0) {
    let errorStatement = "Validation error occured at: ";
    for (let x of error) {
      errorStatement = errorStatement.concat(`${x.property}, `);
    }
    return new ApiError(403, errorStatement, [...error]);
  } else {
    return null;
  }
}
