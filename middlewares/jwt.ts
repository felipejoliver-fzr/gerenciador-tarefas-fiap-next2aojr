
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { DefaultMsgResponse } from "../types/DefaultMsgResponse";
import * as jwt from 'jsonwebtoken';

export const jwtValidator = (handler: NextApiHandler) =>
    async (req: NextApiRequest, res: NextApiResponse<DefaultMsgResponse>) => {

    const {MY_SECRET_KEY} = process.env;
    if(!MY_SECRET_KEY){
        return res.status(500).json({error: 'Env MY_SECRET_KEY não informada.'});
    }

    const message = 'Não foi possível validar o token de acesso.';
    if(!req || !req.headers){
        return res.status(401).json({error: message});
    }

    if(req.method !== 'OPTION'){
        const authorization = req.headers['authorization'];

        if(!authorization){
            return res.status(401).json({error: message});
        }

        const token = authorization.substring(7);
        if(!token){
            return res.status(401).json({error: message});
        }

        try{
            const decoded = jwt.verify(token, MY_SECRET_KEY) as jwt.JwtPayload;

            if(!decoded){
                return res.status(401).json({error: message});
            }

            if(req.body){
                req.body.userId = decoded._id;
            }else if(req.query){
                req.query.userId = decoded._id;
            }
        }catch(e){
            console.log('Não foi possível validar o token de acesso', e);
            return res.status(401).json({error: message});
        }
    }

    return handler(req, res);
}