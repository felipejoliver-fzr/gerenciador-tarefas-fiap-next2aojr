import { NextPage } from "next";
import { useEffect, useState } from "react";
import { Filter } from "../components/Filter";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { List } from "../components/List";
import { executeRequest } from "../services/api";

type HomeProps = {
    setToken(s:string):void
}

export const Home: NextPage<HomeProps> = ({setToken}) => {

    const [list, setList] = useState([]);
    const [previsionDateStart, setPrevisionDateStart] = useState('');
    const [previsionDateEnd, setPrevisionDateEnd] = useState('');
    const [status, setStatus] = useState(0);

    useEffect(() =>{
        getFilteredData();
    }, [previsionDateStart, previsionDateEnd, status]);

    const sair = () => {
        localStorage.clear();
        setToken('');
    }

    const getFilteredData = async() => {
        try{
            let query = '?status='+status;

            if(previsionDateStart){
                query += '&finishPrevisionStart='+previsionDateStart;
            }

            if(previsionDateEnd){
                query += '&finishPrevisionEnd='+previsionDateEnd;
            }

            const result = await executeRequest('task'+query, 'GET');
            if(result && result.data){
                setList(result.data);
            }
        }catch(e){
            console.log('Ocorreu erro ao buscar dados das tarefas:', e);
        }
    }

    return (
        <>
            <Header sair={sair}/>
            <Filter
                previsionDateStart={previsionDateStart}
                previsionDateEnd={previsionDateEnd}
                status={status}
                setPrevisionDateStart={setPrevisionDateStart}
                setPrevisionDateEnd={setPrevisionDateEnd}
                setStatus={setStatus}
            />
            <List tasks={list}/>
            <Footer />
        </>
    );
}