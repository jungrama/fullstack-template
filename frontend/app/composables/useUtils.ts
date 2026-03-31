export const useErrorMessage = (error: any, fallbackMessage = 'Something went wrong') => {
  let errorResponse = null

  // Check if the fetch using axios
  if (error?.name === 'AxiosError') {
    const message = error?.response?.data?.message
    const code = error?.response?.data?.code
    errorResponse = message || code ? `[${code}] ${message}` : error
  } else {
    errorResponse = error.message
  }

  return {
    message: errorResponse || fallbackMessage,
  }
}
