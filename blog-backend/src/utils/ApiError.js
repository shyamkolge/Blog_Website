class ApiError extends Error{

    constructor(
         statusCode ,
         message = "Something went wrong",
         error = [],
         stack = ''
    ){

        super()
        this.message = message
        this.data = null
        this.statusCode = statusCode
        this.success = false
        this.error = error

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }

}

export default ApiError