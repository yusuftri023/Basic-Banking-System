const model = require('./../../../model/v2/transactions')

module.exports = {
    async postTransfer(req,res){
        try {
            const {account_number}= req.user

            if((account_number === req.body.norek_penerima)||
        !req.body.norek_penerima || !account_number ||
        !+req.body.amount || (+req.body.amount <= 0)){
            return res.status(400).json({
                status : 'fail',
                code : 400,
                message : 'Bad request : tidak bisa mentransfer ke akun sendiri'
            })
        }
        const isSenderValid = await model.getAccountByAccNum(account_number)
        const isRecipientValid = await model.getAccountByAccNum(req.body.norek_penerima)
        if(isRecipientValid && isSenderValid){
            const result = await model.transactionTransfer(account_number,req.body.norek_penerima,req.body.amount)
            if(result){
                return res.status(201).json({
                    status : 'success',
                    code : 201,
                    message : 'Transaction complete',
                    data : result
                })
            }
        }
        else{
            res.status(404).json({
                status : 'fail',
                code : 404,
                message : 'Account does not exist'
            })
        }
    } catch (error) {
        res.status(500).json({
            status : 'fail',
            code : 500,
            message : 'Internal Server Error'
        })
    }
},
async postWithdraw(req,res){
    try {
        const account_number = req.params.account_number
        const {amount} = req.body
        if(!(+account_number) ||(!+amount) || (+amount <= 0) ){
        return res.status(400).json({
            status : 'fail',
            code : 400,
            message : 'Bad request '
        })
    }
    const id_pengguna = await model.getAccountByAccNum(+account_number)
    if(!id_pengguna){
        return res.status(404).json({
            status : 'fail',
            code : 404,
            message : 'Account does not exist'
        })
    }
    const result = await model.transactionWithdraw(account_number,amount)
        return res.status(201).json({
            status : 'success',
            code : 201,
            message : 'Transaction complete',
            data : result
        })

} catch (error) {
    res.status(500).json({
        status : 'fail',
        code : 500,
        message : 'Internal Server Error'
    })
}
},
async postDeposit(req,res){
    try {
        const {account_number} = req.params
        const {amount} = req.body
        if(!(+account_number) ||(!+amount) || (+amount <= 0) ){
        return res.status(400).json({
            status : 'fail',
            code : 400,
            message : 'Bad request '
        })
    }
    const id_pengguna = await model.getAccountByAccNum(+req.params.account_number)
    if(!id_pengguna){
        return res.status(404).json({
            status : 'fail',
            code : 404,
            message : 'Account does not exist'
        })
    }
    const result = await model.transactionDeposit(req.params.account_number,req.body.amount)
        return res.status(201).json({
            status : 'success',
            code : 201,
            message : 'Transaction complete',
            data : result
        })

} catch (error) {
    res.status(500).json({
        status : 'fail',
        code : 500,
        message : 'Internal Server Error'
    })
}
}
    ,
    async getTransactions(req,res){
        if(req.query){
            const result = await model.showAllTransactions(+req.query.page_number, +req.query.display_limit, +req.query.search_amount)
            if(!result.length){
                res.status(200).json({
                    status : 'success',
                    code : 200,
                    message : 'Data empty'
                })
            }
            else{
                res.status(200).json({
                status : 'success',
                code : 200,
                message: 'Request has succeeded',
                data : result
            })
            }
        }
    },
    async getTransactionByAccountId(req, res){
        if(!+req.params.account_number ){
            return res.status(400).json({
                status: 'fail',
                code: 400,
                message: 'Bad Request! id required and need to be a number'
            })
        }
        else{
            const query_result = await model.getTransactionsByAccountId(+req.params.account_number, req.query.page, req.query.limit)
            if(!query_result.length){
                res.status(200).json({
                    status: 'success',
                    code: 200,
                    message: 'Transaction list is empty'
                })}
            else{
                res.status(200).json({
                    status: 'success',
                    code: 200,
                    message: 'Query successfully displayed',
                    data: query_result
                })
            }}
    },
    async deleteTransactionById(req, res){
        if(!+req.params.id){
            return res.status(400).json({
                status : 'fail',
                code : 400,
                message : 'Bad request: id field required'
            })
        }

        const search = await model.getSpecificTransaction(+req.params.id)
        if(search.length){
            const result = await model.deleteTransaction(+req.params.id)
        res.status(200).json({
            status : 'success',
            code : 200,
            message : 'Transaction has been deleted',
            data : result
        })
        }
        else{
            res.status(404).json({
                status : 'fail',
                code : 404,
                message : 'Data not found'
                    })
        }


    }

}
