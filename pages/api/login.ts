import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDB } from "../../middlewares/database";
import { UserModel } from "../../models/UserModel";
import { DefaultMsgResponse } from "../../types/DefaultMsgResponse";
import * as CryptoJS from 'crypto-js';
import * as jwt from 'jsonwebtoken';

const handler = async (req: NextApiRequest, res: NextApiResponse<DefaultMsgResponse | object>) => {
    try{
        if(req.method !== 'POST'){
            return res.status(405).json({error: 'O Método HTTP informado não existe'});
        }

        const { MY_SECRET_KEY } = process.env;
        if (!MY_SECRET_KEY) {
            return res.status(500).json({ error: 'Env MY_SECRET_KEY não informada.' });
        }

        const {login, password} = req.body;

        if(!login || !password){
            return res.status(400).json({error: 'Favor informar os dados para login.'});
        }
        
        const user = await UserModel.findOne({email: login});
        if(!user){
            return res.status(400).json({error: 'Usuário e senha não conferem.'});
        }

        const bytes = CryptoJS.AES.decrypt(user.password, MY_SECRET_KEY);
        const savedPassword = bytes.toString(CryptoJS.enc.Utf8);

        if(password !== savedPassword){
            return res.status(400).json({error: 'Usuário e senha não conferem.'});
        }

        const token = jwt.sign({_id: user._id}, MY_SECRET_KEY);

        const result = {
            token,
            name: user.name,
            email: user.email
        }

        res.status(200).json(result);
    }catch(e : any){
        console.log('Ocorreu erro ao efetuar login:', e);
        return res.status(500).json({error: 'Ocorreu erro ao efetuar login, tente novamente'});
    }
}

export default connectToDB(handler);