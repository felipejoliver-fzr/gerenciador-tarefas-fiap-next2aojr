import { NextPage } from "next";
import { Task } from "../types/Task";
import { Item } from "./Item";
import { Modal } from "react-bootstrap";
import { useState } from "react";
import { executeRequest } from "../services/api";
import moment from "moment";

type ListProps = {
    getFilteredData():void
    tasks: Task[]
}

export const List: NextPage<ListProps> = ({ tasks, getFilteredData }) => {

    // STATES MODAL
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [_id, setId] = useState<string | undefined>('');
    const [name, setName] = useState('');
    const [finishPrevisionDate, setFinishPrevisionDate] = useState('');
    const [finishDate, setFinishDate] = useState('');

    const closeModal = () => {
        setShowModal(false);
        setLoading(false);
        setErrorMsg('');
        setName('');
        setFinishPrevisionDate('');
        setFinishDate('');
        setId('');
    }

    const updateTask = async () => {
        try {
            setErrorMsg('');
            if (!name || !finishPrevisionDate || !_id) {
                return setErrorMsg('Favor preencher os campos');
            }

            setLoading(true);

            const body = {
                name,
                finishPrevisionDate
            } as any;

            if(finishDate){
                body.finishDate = finishDate;
            }

            await executeRequest('task?id='+_id, 'PUT', body);
            await getFilteredData();
            closeModal();
        } catch (e: any) {
            console.log('Ocorreu erro ao atualizar tarefa:', e);
            if(e?.response?.data?.error){
                setErrorMsg(e?.response?.data?.error);
            }else {
                setErrorMsg('Ocorreu erro ao atualizar tarefa');
            }
        }

        setLoading(false);
    }

    const deleteTask = async () => {
        try {
            setErrorMsg('');
            if (!_id) {
                return setErrorMsg('Favor preencher a tarefa');
            }

            await executeRequest('task?id='+_id, 'DELETE');
            await getFilteredData();
            closeModal();
        } catch (e: any) {
            console.log('Ocorreu erro ao deletar tarefa:', e);
            if(e?.response?.data?.error){
                setErrorMsg(e?.response?.data?.error);
            }else {
                setErrorMsg('Ocorreu erro ao deletar tarefa');
            }
        }
    }

    const selecionarTarefa = (task: Task) => {
        setShowModal(true);
        setLoading(false);
        setErrorMsg('');
        setId(task._id);
        setName(task.name);
        setFinishPrevisionDate(moment(task.finishPrevisionDate).format('yyyy-MM-DD'));
    }

    return (
        <>
            <div className={"container-list" + (tasks && tasks.length > 0 ? ' not-empty' : '')}>
                {tasks && tasks.length > 0
                    ? tasks.map(t => <Item key={t._id} task={t} selecionarTarefa={selecionarTarefa} />)
                    : (
                        <>
                            <img src="/empty.svg" alt="Nenhuma atividade encontrada" />
                            <p>Você ainda não possui tarefas cadastradas!</p>
                        </>
                    )}
            </div>
            <Modal
                show={showModal}
                onHide={closeModal}
                className="container-modal">
                <Modal.Body>
                    <p>Alterar uma tarefa</p>
                    {errorMsg && <p className="error">{errorMsg}</p>}
                    <input type="text" placeholder="Nome da tarefa"
                        value={name} onChange={e => setName(e.target.value)} />
                    <input type="date" placeholder="Previsão de conclusão"
                        value={finishPrevisionDate} onChange={e => setFinishPrevisionDate(e.target.value)} />
                    <input type="date" placeholder="Data de conclusão"
                        value={finishDate} onChange={e => setFinishDate(e.target.value)} />
                </Modal.Body>
                <Modal.Footer>
                    <div className="button col-12">
                        <button disabled={loading} onClick={updateTask}>
                            {loading ? '...Carregando' : 'Atualizar'}
                        </button>
                        <span onClick={deleteTask}>Excluir</span>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}