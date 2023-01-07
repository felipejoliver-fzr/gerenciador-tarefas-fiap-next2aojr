import { NextPage } from "next";

export const Footer: NextPage = () => {
    return (
        <div className="container-footer">
            <span>© Copyright {new Date().getFullYear()}. Todos os direitos reservados.</span>
            <button><img src="/add.svg" alt="Adicionar tarefa"/>Adicionar uma tarefa</button>
        </div>
    );
}