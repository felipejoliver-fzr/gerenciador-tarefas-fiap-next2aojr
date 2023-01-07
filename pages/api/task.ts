import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDB } from "../../middlewares/database";
import { jwtValidator } from "../../middlewares/jwt";
import { TaskModel } from "../../models/TaskModel";
import { UserModel } from "../../models/UserModel";
import { DefaultMsgResponse } from "../../types/DefaultMsgResponse";
import { Task } from "../../types/Task";
import moment from 'moment';

const handler = async (req: NextApiRequest, res: NextApiResponse<DefaultMsgResponse | object>) => {
    try {
        const userId = req?.body?.userId ? req.body.userId : req?.query?.userId;
        const failedValidation = await validateUser(userId);
        if (failedValidation) {
            return res.status(400).json({ error: failedValidation });
        }

        switch (req.method) {
            case 'GET':
                return await getTasks(req, res, userId);
            case 'POST':
                return await saveTask(req, res, userId);
            case 'PUT':
                return await updateTask(req, res, userId);
            case 'DELETE':
                return await deleteTask(req, res, userId);
            default:
                return res.status(405).json({ error: 'O Método HTTP informado não existe' });
        }

    } catch (e: any) {
        console.log('Ocorreu erro ao utilizar as tarefa:', e);
        return res.status(500).json({ error: 'Ocorreu erro ao utilizar as tarefa, tente novamente' });
    }
}

const validateUser = async (userId: string) => {
    if (!userId) {
        return 'Usuario nao informado';
    }

    const userFound = await UserModel.findById(userId);
    if (!userFound) {
        return 'Usuario nao encontrado';
    }
}

const getTasks = async (req: NextApiRequest, res: NextApiResponse<DefaultMsgResponse | Task[]>, userId: string) => {

    const params = req.query as any;

    const query = {
        userId
    } as any;

    if (params?.finishPrevisionStart) {
        const inputDate = moment(params?.finishPrevisionStart);
        query.finishPrevisionDate = { $gte: inputDate.format('yyyy-MM-DD') }
    }

    if (params?.finishPrevisionEnd) {
        const lastDate = moment(params?.finishPrevisionEnd);
        if (!query.finishPrevisionDate) {
            query.finishPrevisionDate = {};
        }
        query.finishPrevisionDate.$lte = lastDate.format('yyyy-MM-DD')
    }

    if (params?.status) {
        const status = parseInt(params?.status);
        switch (status) {
            case 1:
                query.finishDate = null;
                break;
            case 2:
                query.finishDate = { $ne: null };
                break;
            default: break;
        }
    }

    const result = await TaskModel.find(query) as Task[];
    return res.status(200).json(result);
}


const saveTask = async (req: NextApiRequest, res: NextApiResponse<DefaultMsgResponse>, userId: string) => {
    if (req.body) {
        const task = req.body as Task;
        if (!task.name || task.name.length < 2) {
            return res.status(400).json({ error: 'Nome da tarefa invalida' });
        }

        if (!task.finishPrevisionDate || moment(task.finishPrevisionDate).isBefore(moment())) {
            return res.status(400).json({ error: 'Data de previsao invalida ou menor que hoje' });
        }

        const final = {
            ...task,
            userId,
            finishDate: undefined
        } as any;

        await TaskModel.create(final);
        return res.status(200).json({ message: 'Tarefa criada com sucesso' });
    }

    return res.status(400).json({ error: 'Parametros de entrada invalido' });
}

const deleteTask = async (req: NextApiRequest, res: NextApiResponse<DefaultMsgResponse | Task[]>, userId: string) => {
    const taskFound = await validateTaskAndReturnValue(req, userId);
    if (!taskFound) {
        return res.status(400).json({ error: 'Tarefa nao encontrada' });
    }

    await TaskModel.findByIdAndDelete({ _id: taskFound._id });
    return res.status(200).json({ message: 'Tarefa deletada com sucesso' });
}

const validateTaskAndReturnValue = async (req: NextApiRequest, userId: string) => {
    const id = req.query?.id as string;

    if (!id || id.trim() === '') {
        return null;
    }

    const taskFound = await TaskModel.findById(id);
    if (!taskFound || taskFound.userId !== userId) {
        return null;
    }

    return taskFound;
}


const updateTask = async (req: NextApiRequest, res: NextApiResponse<DefaultMsgResponse | Task[]>, userId: string) => {
    const taskFound = await validateTaskAndReturnValue(req, userId);
    if (!taskFound) {
        return res.status(400).json({ error: 'Tarefa nao encontrada' });
    }

    if (req.body) {
        const task = req.body as Task;

        if (task.name && task.name.trim() !== '') {
            taskFound.name = task.name;
        }

        if (task.finishPrevisionDate) {
            taskFound.finishPrevisionDate = task.finishPrevisionDate;
        }

        if (task.finishDate) {
            taskFound.finishDate = task.finishDate;
        }

        await TaskModel.findByIdAndUpdate({ _id: taskFound._id }, taskFound);
        return res.status(200).json({ message: 'Tarefa atualizada com sucesso' });
    }

    return res.status(400).json({ error: 'Parametro de entrada invalidos' });
}

export default connectToDB(jwtValidator(handler));