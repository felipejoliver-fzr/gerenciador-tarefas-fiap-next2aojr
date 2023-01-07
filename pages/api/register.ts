import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDB } from "../../middlewares/database";
import { UserModel } from "../../models/UserModel";
import { DefaultMsgResponse } from "../../types/DefaultMsgResponse";
import { User } from "../../types/User";
import * as CryptoJS from 'crypto-js';

const handler = async (req: NextApiRequest, res: NextApiResponse<DefaultMsgResponse>) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'O Método HTTP informado não existe' });
        }

        const { MY_SECRET_KEY } = process.env;
        if (!MY_SECRET_KEY) {
            return res.status(500).json({ error: 'Env MY_SECRET_KEY não informada.' });
        }

        const { name, email, password } = req.body as User;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Nome inválido' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email inválido' });
        }

        if (!password || password.length < 6 || !password.includes('@')) {
            return res.status(400).json({ error: 'Senha inválida' });
        }

        const sameEmailUser = await UserModel.findOne({email});
        if(sameEmailUser){
            return res.status(400).json({ error: 'Já existe uma conta com esse email' });
        }

        const passwordCrypted = CryptoJS.AES.encrypt(password, MY_SECRET_KEY);
        const user = { name, email, password: passwordCrypted };
        await UserModel.create(user);

        return res.status(200).json({ message: 'Cadastro com sucesso' });
    } catch (e: any) {
        console.log('Ocorreu erro ao cadastrar usuário:', e);
        return res.status(500).json({ error: 'Ocorreu erro ao cadastrar usuário, tente novamente' });
    }
}

export default connectToDB(handler);