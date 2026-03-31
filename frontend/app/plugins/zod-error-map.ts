import { z } from "zod"

const requiredFieldErrorMap = (issue: { code?: string; input?: unknown }) => {
  if (issue.code === "invalid_type" && issue.input === undefined) {
    return { message: "This field is required" }
  }

  return undefined
}

export default defineNuxtPlugin(() => {
  // Zod v4 prefers config(customError), but setErrorMap keeps compatibility.
  z.config({
    customError: requiredFieldErrorMap,
  })
  z.setErrorMap(requiredFieldErrorMap)
})
