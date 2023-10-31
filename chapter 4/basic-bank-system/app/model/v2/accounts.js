import {PrismaClient} from '@prisma/client'
const prisma = new PrismaClient()


export async function showAllAccounts(page_number = 1, display_limit=10, search = ''){
    const result = await prisma.accounts.findMany({
        take : +display_limit,
        skip : +display_limit*(page_number-1),
        orderBy: {
            account_id : 'asc'
        },
        select : {
            account_id :true,
            email : true,
            balance : true
        }
    })
    return result
}
export async function searchAccountByEmail( page_number = 1 , display_limit = 10, search = ''){
    const result = await prisma.accounts.findMany({
        take : +display_limit,
        skip : +display_limit*(+page_number-1),
        where : {
            email :{
                contains: `${search}`,
                mode : 'insensitive'
            }
        },
        select : {
            account_id :true,
            email : true,
            balance : true
        }
    })

    return result
}
export async function search_accountId(id){
    let showUser = await prisma.accounts.findUnique({
        where : {
           account_id : id
        }
    })
    return showUser
}
async function search_userId(id){
    let showUser = await prisma.users.findUnique({
        where : {
           user_id : id
        }
    })
    return showUser
}
export async function createNewAccount(body, hashed_password){
    try {
        const createAccount = await prisma.accounts.create({
            data : {
                balance : body.balance,
                email : body.email,
                password : hashed_password,
                user_id : body.user_id
            }
        })
        return {
                status : 'success',
                code : 201,
                message : 'Account has been created',
                data : {
                    account_id : createAccount.account_id,
                    balance : createAccount.balance,
                    email : createAccount.email
                }}
    } catch (error) {
        return {
            status : 'fail',
            code : 409,
            message : `${error.meta.target} already exist`
        }
    }
}
export async function hapusan(id){
    try {
        const result = await prisma.accounts.delete({
            where : {
                account_id : +id
            }
        })
        return result
    } catch (error) {
        return error
    }
}
