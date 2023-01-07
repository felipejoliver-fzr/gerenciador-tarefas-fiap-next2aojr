import { NextPage } from "next";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Filter } from "../components/Filter";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { List } from "../components/List";
import { executeRequest } from "../services/api";

type HomeProps = {
    setToken(s: string): void
}

export const Home: NextPage<HomeProps> = ({ setToken }) => {

    // STATES FILTER
    const [list, setList] = useState([]);
    const [previsionDateStart, setPrevisionDateStart] = useState('');
    const [previsionDateEnd, setPrevisionDateEnd] = useState('');
    const [status, setStatus] = useState(0);

    // STATES MODAL
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [name, setName] = useState('');
    const [finishPrevisionDate, setFinishPrevisionDate] = useState('');

    useEffect(() => {
        getFilteredData();
    }, [previsionDateStart, previsionDateEnd, status]);

    const sair = () => {
        localStorage.clear();
        setToken('');
    }

    const getFilteredData = async () => {
        try {
            let query = '?status=' + status;

            if (previsionDateStart) {
                query += '&finishPrevisionStart=' + previsionDateStart;
            }

            if (previsionDateEnd) {
                query += '&finishPrevisionEnd=' + previsionDateEnd;
            }

            const result = await executeRequest('task' + query, 'GET');
            if (result && result.data) {
                setList(result.data);
            }
        } catch (e) {
            console.log('Ocorreu erro ao buscar dados das tarefas:', e);
        }
    }

    const closeModal = () => {
        setShowModal(false);
        setLoading(false);
        setErrorMsg('');
        setName('');
        setFinishPrevisionDate('');
    }

    const createTask = async () => {
        try {
            setErrorMsg('');
            if (!name || !finishPrevisionDate) {
                return setErrorMsg('Favor preencher os campos');
            }

            setLoading(true);

            const body = {
                name,
                finishPrevisionDate
            }

            await executeRequest('task', 'POST', body);
            await getFilteredData();
            closeModal();
        } catch (e: any) {
            console.log('Ocorreu erro ao cadastrar tarefa:', e);
            if(e?.response?.data?.error){
                setErrorMsg(e?.response?.data?.error);
            }else {
                setErrorMsg('Ocorreu erro ao cadastrar tarefa');
            }
        }

        setLoading(false);
    }

    return (
        <>
            <Header sair={sair} togglModal={() => setShowModal(!showModal)} />
            <Filter
                previsionDateStart={previsionDateStart}
                previsionDateEnd={previsionDateEnd}
                status={status}
                setPrevisionDateStart={setPrevisionDateStart}
                setPrevisionDateEnd={setPrevisionDateEnd}
                setStatus={setStatus}
            />
            <List tasks={list} getFilteredData={getFilteredData}/>
            <Footer togglModal={() => setShowModal(!showModal)}/>
            <Modal
                show={showModal}
                onHide={closeModal}
                className="container-modal">
                <Modal.Body>
                        <p>Adicionar uma tarefa</p>
                        {errorMsg && <p className="error">{errorMsg}</p>}
                        <input type="text" placeholder="Nome da tarefa"
                            value={name} onChange={e => setName(e.target.value)}/>
                        <input type="date" placeholder="Previsão de conclusão"
                            value={finishPrevisionDate} onChange={e => setFinishPrevisionDate(e.target.value)}/>
                </Modal.Body>
                <Modal.Footer>
                    <div className="button col-12">
                        <button disabled={loading} onClick={createTask}>
                            {loading ? '...Carregando' : 'Salvar'}
                        </button>
                        <span onClick={closeModal}>Cancelar</span>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}